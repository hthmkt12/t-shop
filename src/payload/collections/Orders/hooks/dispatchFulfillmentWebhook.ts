import crypto from 'crypto'
import type { AfterChangeHook } from 'payload/dist/collections/config/types'
import type { Order } from '../../../payload-types'

// Dispatches a webhook to the external print production workshop / fulfillment partner
// when an order enters 'in_production' status or is paid.
export const dispatchFulfillmentWebhook: AfterChangeHook<Order> = async args => {
  const { doc, previousDoc, operation, req } = args
  const { payload } = req

  const webhookUrl = process.env.FULFILLMENT_WEBHOOK_URL
  const webhookSecret = process.env.FULFILLMENT_WEBHOOK_SECRET

  // Only proceed if a fulfillment webhook is configured
  if (!webhookUrl) {
    return doc
  }

  // Trigger on create if in_production, or on status transition to in_production
  const isNowInProduction = doc.fulfillmentStatus === 'in_production'
  const wasInProduction = previousDoc?.fulfillmentStatus === 'in_production'

  const shouldDispatch =
    (operation === 'create' && isNowInProduction) ||
    (operation === 'update' && isNowInProduction && !wasInProduction)

  if (!shouldDispatch) {
    return doc
  }

  try {
    const shipping = doc.shippingAddress
    const payloadBody = {
      event: 'order.fulfillment.ready',
      timestamp: new Date().toISOString(),
      order: {
        id: doc.id,
        createdAt: doc.createdAt,
        fulfillmentStatus: doc.fulfillmentStatus,
        total: doc.total,
        recipient: {
          name: shipping?.recipientName || 'N/A',
          phone: shipping?.phone || 'N/A',
          addressLine1: shipping?.line1 || '',
          addressLine2: shipping?.line2 || '',
          city: shipping?.city || '',
          state: shipping?.state || '',
          postalCode: shipping?.postalCode || '',
          country: shipping?.country || '',
        },
        items: (doc.items || []).map((item, idx) => ({
          itemIndex: idx + 1,
          product: typeof item.product === 'object' ? item.product.id : item.product,
          productTitle: typeof item.product === 'object' ? item.product.title : undefined,
          sku: item.sku || 'STANDARD',
          variantTitle: item.variantTitle,
          quantity: item.quantity,
          customText: item.customText || null,
          customDesignUrl: item.customDesignUrl || null,
        })),
        productionNotes: doc.productionNotes || null,
      },
    }

    const bodyString = JSON.stringify(payloadBody)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'T-Shop-POD-Fulfillment/1.0',
    }

    if (webhookSecret) {
      headers['X-Fulfillment-Secret'] = webhookSecret
      const hmacSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(bodyString)
        .digest('hex')
      headers['X-Fulfillment-Signature'] = `sha256=${hmacSignature}`
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: bodyString,
    })

    if (!response.ok) {
      payload.logger.error(
        `Fulfillment webhook failed for Order #${doc.id} with status ${response.status} ${response.statusText}`,
      )
    } else {
      payload.logger.info(`Successfully dispatched fulfillment webhook for Order #${doc.id}`)
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    payload.logger.error(`Error sending fulfillment webhook for Order #${doc.id}: ${msg}`)
  }

  return doc
}
