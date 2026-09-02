import type { PayloadHandler } from 'payload/config'

export const trackOrder: PayloadHandler = async (req, res): Promise<void> => {
  const { payload } = req
  const orderId = req.query?.orderId as string
  const email = (req.query?.email as string)?.trim().toLowerCase()

  if (!orderId) {
    res.status(400).json({ error: 'orderId parameter is required' })
    return
  }

  try {
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 2,
    })

    if (!order) {
      res.status(404).json({ error: 'Order not found with provided ID' })
      return
    }

    // Optional verification if email was supplied
    if (email) {
      const orderedByUser = typeof order.orderedBy === 'object' ? order.orderedBy : null
      const userEmail = orderedByUser?.email?.toLowerCase()

      if (userEmail && userEmail !== email) {
        res.status(403).json({ error: 'Order ID does not match the provided email' })
        return
      }
    }

    // Return sanitized public tracking info
    res.status(200).json({
      id: order.id,
      createdAt: order.createdAt,
      fulfillmentStatus: order.fulfillmentStatus || 'pending',
      trackingCarrier: order.trackingCarrier || null,
      trackingNumber: order.trackingNumber || null,
      total: order.total,
      shippingAddress: order.shippingAddress
        ? {
            recipientName: order.shippingAddress.recipientName,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            country: order.shippingAddress.country,
          }
        : null,
      items: order.items?.map(item => ({
        productTitle: typeof item.product === 'object' ? item.product.title : 'Custom Product',
        productSlug: typeof item.product === 'object' ? item.product.slug : null,
        productImage:
          typeof item.product === 'object' && typeof item.product?.meta?.image === 'object'
            ? item.product.meta.image
            : null,
        variantTitle: item.variantTitle,
        sku: item.sku,
        customDesignUrl: item.customDesignUrl,
        customText: item.customText,
        quantity: item.quantity,
        price: item.price,
      })),
    })
  } catch (err: unknown) {
    payload.logger.error(`Error tracking order: ${err}`)
    res.status(500).json({ error: 'Failed to look up order status' })
  }
}
