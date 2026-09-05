/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PayloadHandler } from 'payload/config'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-08-01',
})

// this endpoint creates a `PaymentIntent` with the items in the cart
// to do this, we loop through the items in the cart and lookup the product in Stripe
// we then add the price of the product to the total
// once completed, we pass the `client_secret` of the `PaymentIntent` back to the client which can process the payment
export const createPaymentIntent: PayloadHandler = async (req, res): Promise<void> => {
  const { user, payload } = req
  const guestCartItems = Array.isArray(req.body?.items) ? req.body.items : null
  const guestEmail = typeof req.body?.guestEmail === 'string' ? req.body.guestEmail.trim() : null

  let cartItemsToProcess: any[] = []
  let stripeCustomerID: string | undefined

  if (user) {
    const fullUser = await payload.findByID({
      collection: 'users',
      id: user?.id,
    })

    if (!fullUser) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    stripeCustomerID = fullUser?.stripeCustomerID

    // lookup user in Stripe and create one if not found
    if (!stripeCustomerID) {
      const customer = await stripe.customers.create({
        email: fullUser?.email,
        name: fullUser?.name,
      })

      stripeCustomerID = customer.id

      await payload.update({
        collection: 'users',
        id: user?.id,
        data: {
          stripeCustomerID,
        },
      })
    }

    cartItemsToProcess = fullUser?.cart?.items || []
  } else if (guestCartItems && guestCartItems.length > 0) {
    // Guest flow: process items directly from payload
    cartItemsToProcess = guestCartItems
    if (guestEmail) {
      try {
        const existingCustomers = await stripe.customers.list({
          email: guestEmail,
          limit: 1,
        })
        if (existingCustomers.data.length > 0) {
          stripeCustomerID = existingCustomers.data[0].id
        } else {
          const newCustomer = await stripe.customers.create({
            email: guestEmail,
          })
          stripeCustomerID = newCustomer.id
        }
      } catch (err: unknown) {
        payload.logger.warn(`Failed to lookup/create guest Stripe customer: ${err}`)
      }
    }
  } else {
    res.status(400).json({ error: 'No authenticated user or guest cart items provided' })
    return
  }

  try {
    let total = 0

    const hasItems = cartItemsToProcess.length > 0

    if (!hasItems) {
      throw new Error('No items in cart')
    }

    // for each item in cart, validate stock, lookup the product in Stripe and add its price to the total
    await Promise.all(
      cartItemsToProcess.map(async (item: any): Promise<null> => {
        const product = item?.product
        const quantity = item?.quantity
        const itemSku = item?.sku
        const productId = typeof product === 'object' ? product?.id : product

        if (!quantity || !productId) {
          return null
        }

        const fullProduct =
          typeof product === 'object' && product?.title
            ? product
            : await payload.findByID({ collection: 'products', id: productId })

        if (!fullProduct) {
          throw new Error('Invalid product in cart')
        }

        // Validate stock on server
        if (fullProduct.enableVariants && Array.isArray(fullProduct.variants) && itemSku) {
          const variant = fullProduct.variants.find((v: any) => v.sku === itemSku)
          if (!variant) {
            throw new Error(`Variant ${itemSku} not found for ${fullProduct.title}`)
          }
          const availableStock = typeof variant.stock === 'number' ? variant.stock : 0
          if (availableStock < quantity) {
            throw new Error(
              `Item "${fullProduct.title} (${
                variant.title || itemSku
              })" is out of stock or requested quantity exceeds available stock (${availableStock}).`,
            )
          }
        } else if (typeof fullProduct.stock === 'number' && fullProduct.stock < quantity) {
          throw new Error(
            `Product "${fullProduct.title}" is out of stock or requested quantity exceeds available stock (${fullProduct.stock}).`,
          )
        }

        let unitAmount: number | null = null

        // Per-variant price override
        if (fullProduct.enableVariants && Array.isArray(fullProduct.variants) && itemSku) {
          const variant = fullProduct.variants.find((v: any) => v.sku === itemSku)
          if (typeof variant?.price === 'number') {
            unitAmount = variant.price
          }
        }

        if (unitAmount === null && fullProduct?.stripeProductID) {
          try {
            const prices = await stripe.prices.list({
              product: fullProduct.stripeProductID,
              active: true,
              limit: 10,
            })
            const liveUnitAmount = prices.data[0]?.unit_amount
            if (typeof liveUnitAmount === 'number') {
              unitAmount = liveUnitAmount
            }
          } catch (err: unknown) {
            payload.logger.error(`Failed to fetch stripe price: ${err}`)
          }
        }

        if (unitAmount === null && typeof fullProduct.price === 'number') {
          unitAmount = fullProduct.price
        }

        // Add verified PET Print Surcharge if present
        const petPrintSize = item?.petPrintSize
        let petSurcharge = 0
        if (petPrintSize === 'a4') petSurcharge += 300
        else if (petPrintSize === 'a3') petSurcharge += 600

        const hasFront = Boolean(item?.fabricJsonFront && item.fabricJsonFront !== '{}' && item.fabricJsonFront !== '{"objects":[]}')
        const hasBack = Boolean(item?.fabricJsonBack && item.fabricJsonBack !== '{}' && item.fabricJsonBack !== '{"objects":[]}')
        if (hasFront && hasBack) {
          petSurcharge += 400 // Second side surcharge
        }

        const finalUnitAmount = (unitAmount || 0) + petSurcharge

        total += finalUnitAmount * quantity

        return null
      }),
    )

    if (total === 0) {
      throw new Error('There is nothing to pay for, add some items to your cart and try again.')
    }

    const paymentIntent = await stripe.paymentIntents.create({
      customer: stripeCustomerID,
      amount: total,
      currency: 'usd',
      payment_method_types: ['card'],
    })

    res.send({ client_secret: paymentIntent.client_secret })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    payload.logger.error(message)
    res.json({ error: message })
  }
}
