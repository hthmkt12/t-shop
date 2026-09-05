import type { CollectionConfig } from 'payload/types'
import Stripe from 'stripe'

type BeforeChangeHook = NonNullable<NonNullable<CollectionConfig['hooks']>['beforeChange']>[number]

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-08-01',
})

// Acceptable PaymentIntent states: the funds are captured or guaranteed to be.
const PAID_STATUSES = ['succeeded', 'processing', 'requires_capture']

// Money integrity (FAIL-CLOSED): on create, a checkout order is rebuilt entirely
// from the server-side cart plus the Stripe PaymentIntent. Nothing the client
// sends about price, total, or line items is trusted. If anything cannot be
// verified, the order is REJECTED (throw) rather than persisted with unverified
// data. The client already handles order-creation errors without re-charging;
// a paid-but-unrecorded order must be reconciled out of band (e.g. webhook).
export const recalculateTotal: BeforeChangeHook = async ({ data, req, operation }) => {
  if (operation !== 'create') {
    return data
  }

  const { payload } = req
  const d = data as Record<string, any>
  const paymentIntentID = d?.stripePaymentIntentID

  // Admin-created orders (no PaymentIntent) keep their manually entered values.
  if (!paymentIntentID) {
    return data
  }

  // Fail closed if we cannot talk to Stripe at all.
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      'recalculateTotal: Stripe secret key is not configured; refusing to create an unverified order.',
    )
  }

  // Replay guard: a given PaymentIntent may back at most one order.
  const existing = await payload.find({
    collection: 'orders',
    where: { stripePaymentIntentID: { equals: paymentIntentID } },
    limit: 1,
    depth: 0,
  })
  if (existing?.totalDocs && existing.totalDocs > 0) {
    throw new Error(
      `recalculateTotal: an order already exists for PaymentIntent ${paymentIntentID}.`,
    )
  }

  // Retrieve the authoritative PaymentIntent.
  let paymentIntent: Stripe.PaymentIntent
  try {
    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentID)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(
      `recalculateTotal: failed to retrieve PaymentIntent ${paymentIntentID}: ${message}`,
    )
  }

  const authorizedAmount = paymentIntent?.amount
  if (typeof authorizedAmount !== 'number') {
    throw new Error(`recalculateTotal: PaymentIntent ${paymentIntentID} has no numeric amount.`)
  }
  if (!PAID_STATUSES.includes(paymentIntent.status)) {
    throw new Error(
      `recalculateTotal: PaymentIntent ${paymentIntentID} is not paid (status: ${paymentIntent.status}).`,
    )
  }

  // Rebuild line items from the server-side cart or verified client items (for guests).
  const userId = req.user?.id
  let cartItems: any[] = []

  if (userId) {
    const fullUser: any = await payload.findByID({ collection: 'users', id: userId })
    cartItems = Array.isArray(fullUser?.cart?.items) ? fullUser.cart.items : []
  } else if (Array.isArray(d?.items)) {
    // For guest checkout: client sends items array, but prices are re-derived strictly from server/Stripe
    cartItems = d.items
  } else {
    throw new Error('recalculateTotal: no user or cart items provided to rebuild order.')
  }

  const rebuiltItems = await Promise.all(
    cartItems.map(async (item: any) => {
      const productId = typeof item?.product === 'object' ? item?.product?.id : item?.product
      const quantity = typeof item?.quantity === 'number' ? item.quantity : 0
      const sku = item?.sku
      const customDesignUrl = item?.customDesignUrl
      const customText = item?.customText
      const fabricJsonFront = item?.fabricJsonFront
      const fabricJsonBack = item?.fabricJsonBack
      let unitPrice: number | null = null
      let variantTitle = item?.variantTitle

      if (productId) {
        const product: any = await payload.findByID({ collection: 'products', id: productId })
        if (product) {
          // Mirror create-payment-intent EXACTLY so the reconciliation below is
          // deterministic: variant override first, otherwise the live Stripe
          // unit_amount (not the cached product.price, which can drift from
          // Stripe and cause a legitimately paid order to be wrongly rejected).
          if (product.enableVariants && Array.isArray(product.variants) && sku) {
            const variant = product.variants.find((v: any) => v.sku === sku)
            if (variant) {
              if (typeof variant.price === 'number') unitPrice = variant.price
              if (!variantTitle && variant.title) variantTitle = variant.title
            }
          }
          if (unitPrice === null && product.stripeProductID) {
            try {
              const prices = await stripe.prices.list({
                product: product.stripeProductID,
                active: true,
                limit: 10,
              })
              const liveUnitAmount = prices.data[0]?.unit_amount
              if (typeof liveUnitAmount === 'number') {
                unitPrice = liveUnitAmount
              }
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : String(err)
              payload.logger.error(
                `recalculateTotal: failed to fetch Stripe price for product ${productId}: ${message}`,
              )
            }
          }
          // Last-resort fallback if Stripe has no price for this product.
          if (unitPrice === null && typeof product.price === 'number') {
            unitPrice = product.price
          }

          // PET Print Surcharge
          const petPrintSize = item?.petPrintSize
          let petSurcharge = 0
          if (petPrintSize === 'a4') petSurcharge += 300
          else if (petPrintSize === 'a3') petSurcharge += 600

          const hasFront = Boolean(item?.fabricJsonFront && item.fabricJsonFront !== '{}' && item.fabricJsonFront !== '{"objects":[]}')
          const hasBack = Boolean(item?.fabricJsonBack && item.fabricJsonBack !== '{}' && item.fabricJsonBack !== '{"objects":[]}')
          if (hasFront && hasBack) {
            petSurcharge += 400
          }

          if (unitPrice !== null) {
            unitPrice += petSurcharge
          }
        }
      }

      return {
        product: productId,
        sku: sku || undefined,
        variantTitle: variantTitle || undefined,
        customDesignUrl: customDesignUrl || undefined,
        customText: customText || undefined,
        fabricJsonFront: fabricJsonFront || undefined,
        fabricJsonBack: fabricJsonBack || undefined,
        petPrintSize: item?.petPrintSize || undefined,
        petSurcharge: item?.petSurcharge || undefined,
        quantity,
        price: unitPrice ?? 0,
      }
    }),
  )

  // Reconcile the rebuilt cart against what was actually authorized.
  const expectedTotal = rebuiltItems.reduce(
    (sum, it) => sum + (it.price || 0) * (it.quantity || 0),
    0,
  )
  if (expectedTotal !== authorizedAmount) {
    throw new Error(
      `recalculateTotal: server cart total (${expectedTotal}) does not match PaymentIntent ${paymentIntentID} amount (${authorizedAmount}); refusing to create order.`,
    )
  }

  return {
    ...data,
    items: rebuiltItems,
    total: authorizedAmount,
  }
}
