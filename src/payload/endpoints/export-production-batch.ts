import type { PayloadHandler } from 'payload/config'

// Endpoint for print production workshop to batch export orders ready for printing.
// Returns CSV or JSON containing Order ID, Recipient, Variant SKU, Custom Text, and Artwork URLs.
export const exportProductionBatch: PayloadHandler = async (req, res): Promise<void> => {
  const { user, payload } = req
  const status = (req.query?.status as string) || 'in_production'
  const format = (req.query?.format as string)?.toLowerCase() || 'json'

  // Restrict to admin users only
  if (!user || !user.roles?.includes('admin')) {
    res.status(403).json({ error: 'Forbidden: Admin access required to export production batch.' })
    return
  }

  try {
    const ordersQuery = await payload.find({
      collection: 'orders',
      where: {
        fulfillmentStatus: {
          equals: status,
        },
      },
      limit: 500,
      depth: 2,
    })

    const productionRows: Array<{
      orderId: string
      createdAt: string
      fulfillmentStatus: string
      recipientName: string
      phone: string
      shippingAddress: string
      itemIndex: number
      productTitle: string
      sku: string
      variantTitle: string
      quantity: number
      customText: string
      customDesignUrl: string
      productionNotes: string
    }> = []

    for (const order of ordersQuery.docs) {
      const address = order.shippingAddress
      const fullAddress = address
        ? [
            address.line1,
            address.line2,
            address.city,
            address.state,
            address.postalCode,
            address.country,
          ]
            .filter(Boolean)
            .join(', ')
        : 'N/A'

      const items = order.items || []
      items.forEach((item, index) => {
        const productTitle = typeof item.product === 'object' ? item.product.title : 'POD Product'
        productionRows.push({
          orderId: String(order.id),
          createdAt: String(order.createdAt),
          fulfillmentStatus: String(order.fulfillmentStatus || 'pending'),
          recipientName: address?.recipientName || 'N/A',
          phone: address?.phone || 'N/A',
          shippingAddress: fullAddress,
          itemIndex: index + 1,
          productTitle,
          sku: item.sku || 'STANDARD',
          variantTitle: item.variantTitle || 'Default',
          quantity: item.quantity || 1,
          customText: item.customText || '',
          customDesignUrl: item.customDesignUrl || '',
          productionNotes: order.productionNotes || '',
        })
      })
    }

    if (format === 'csv') {
      const headers = [
        'Order ID',
        'Created At',
        'Fulfillment Status',
        'Recipient Name',
        'Phone',
        'Shipping Address',
        'Item #',
        'Product',
        'SKU',
        'Variant',
        'Quantity',
        'Custom Text',
        'Artwork URL',
        'Production Notes',
      ]

      const csvLines = [
        headers.join(','),
        ...productionRows.map(row =>
          [
            `"${row.orderId}"`,
            `"${row.createdAt}"`,
            `"${row.fulfillmentStatus}"`,
            `"${row.recipientName.replace(/"/g, '""')}"`,
            `"${row.phone.replace(/"/g, '""')}"`,
            `"${row.shippingAddress.replace(/"/g, '""')}"`,
            row.itemIndex,
            `"${row.productTitle.replace(/"/g, '""')}"`,
            `"${row.sku.replace(/"/g, '""')}"`,
            `"${row.variantTitle.replace(/"/g, '""')}"`,
            row.quantity,
            `"${row.customText.replace(/"/g, '""')}"`,
            `"${row.customDesignUrl.replace(/"/g, '""')}"`,
            `"${row.productionNotes.replace(/"/g, '""')}"`,
          ].join(','),
        ),
      ]

      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="pod-production-batch-${status}-${new Date()
          .toISOString()
          .slice(0, 10)}.csv"`,
      )
      res.status(200).send(csvLines.join('\n'))
      return
    }

    res.status(200).json({
      status,
      totalOrders: ordersQuery.totalDocs,
      totalItems: productionRows.length,
      batch: productionRows,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    payload.logger.error(`Error exporting production batch: ${message}`)
    res.status(500).json({ error: 'Failed to generate production export batch.' })
  }
}
