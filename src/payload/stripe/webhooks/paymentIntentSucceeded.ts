import type { StripeWebhookHandler } from '@payloadcms/plugin-stripe/dist/types'
import type Stripe from 'stripe'

export const paymentIntentSucceeded: StripeWebhookHandler<{
  data: {
    object: Stripe.PaymentIntent
  }
}> = async args => {
  const { event, payload } = args

  const paymentIntent = event.data.object
  const paymentIntentID = paymentIntent.id
  const customerID = paymentIntent.customer as string | undefined

  payload.logger.info(
    `Processing Stripe webhook: payment_intent.succeeded for ID ${paymentIntentID}`,
  )

  try {
    // Check if an order was already recorded by the client flow
    const existingOrder = await payload.find({
      collection: 'orders',
      where: {
        stripePaymentIntentID: {
          equals: paymentIntentID,
        },
      },
      limit: 1,
      depth: 0,
    })

    if (existingOrder.totalDocs > 0) {
      payload.logger.info(
        `Order already exists for PaymentIntent ${paymentIntentID} (Order #${existingOrder.docs[0].id}). No action needed.`,
      )
      return
    }

    if (!customerID) {
      payload.logger.warn(
        `PaymentIntent ${paymentIntentID} succeeded without associated customer ID. Cannot auto-create order.`,
      )
      return
    }

    // Find the Payload user with this Stripe Customer ID
    const userQuery = await payload.find({
      collection: 'users',
      where: {
        stripeCustomerID: {
          equals: customerID,
        },
      },
      limit: 1,
    })

    if (userQuery.totalDocs === 0) {
      payload.logger.warn(
        `No Payload user matched Stripe Customer ID ${customerID} for PaymentIntent ${paymentIntentID}`,
      )
      return
    }

    const user = userQuery.docs[0]
    const cartItems = Array.isArray(user?.cart?.items) ? user.cart.items : []

    if (cartItems.length === 0) {
      payload.logger.warn(
        `User #${user.id} cart is empty when processing PaymentIntent ${paymentIntentID}. Order may have been handled.`,
      )
      return
    }

    // Reconstruct items from cart
    const items = await Promise.all(
      cartItems.map(async (item: any) => {
        const productId = typeof item?.product === 'object' ? item?.product?.id : item?.product
        const quantity = typeof item?.quantity === 'number' ? item.quantity : 0
        const sku = item?.sku
        const customDesignUrl = item?.customDesignUrl
        const customText = item?.customText
        let unitPrice: number | null = null
        let variantTitle = item?.variantTitle

        if (productId) {
          const product: any = await payload.findByID({ collection: 'products', id: productId })
          if (product) {
            if (product.enableVariants && Array.isArray(product.variants) && sku) {
              const variant = product.variants.find((v: any) => v.sku === sku)
              if (variant) {
                if (typeof variant.price === 'number') unitPrice = variant.price
                if (!variantTitle && variant.title) variantTitle = variant.title
              }
            }
            if (unitPrice === null && typeof product.price === 'number') {
              unitPrice = product.price
            }
          }
        }

        return {
          product: productId,
          sku: sku || undefined,
          variantTitle: variantTitle || undefined,
          customDesignUrl: customDesignUrl || undefined,
          customText: customText || undefined,
          quantity,
          price: unitPrice ?? 0,
        }
      }),
    )

    // Create the order as fallback
    const newOrder = await payload.create({
      collection: 'orders',
      data: {
        orderedBy: user.id,
        stripePaymentIntentID: paymentIntentID,
        fulfillmentStatus: 'in_production',
        total: paymentIntent.amount,
        items,
      },
    })

    payload.logger.info(
      `Successfully created fallback Order #${newOrder.id} from Stripe webhook payment_intent.succeeded!`,
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    payload.logger.error(
      `Error processing payment_intent.succeeded for ${paymentIntentID}: ${message}`,
    )
  }
}
