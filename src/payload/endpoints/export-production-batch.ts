import type { PayloadHandler } from 'payload/config'
import archiver from 'archiver'
import { renderPodPrintBuffer } from '../lib/render-pod-service'

const VALID_STATUSES = ['pending', 'in_production', 'shipped', 'delivered', 'cancelled']

// Endpoint for print production workshop to batch export orders ready for printing.
// Returns CSV, JSON, or a ZIP archive containing ready-to-print 300 DPI transparent PNGs and manifest.
export const exportProductionBatch: PayloadHandler = async (req, res): Promise<void> => {
  const { user, payload } = req
  const status = ((req.query?.status as string) || 'in_production').trim().toLowerCase()
  const format = (req.query?.format as string)?.toLowerCase() || 'json'

  // Restrict to admin users only
  if (!user?.roles?.includes('admin')) {
    res.status(403).json({ error: 'Forbidden: Admin access required to export production batch.' })
    return
  }

  // Whitelist status filter parameter
  if (!VALID_STATUSES.includes(status)) {
    res
      .status(400)
      .json({ error: `Invalid status parameter. Must be one of: ${VALID_STATUSES.join(', ')}` })
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
      limit: 200,
      depth: 1,
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
      productType: string
      sku: string
      variantTitle: string
      quantity: number
      customText: string
      customDesignUrl: string
      fabricJsonFront?: string
      fabricJsonBack?: string
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
        const productObj = typeof item.product === 'object' ? (item.product as any) : null
        const productTitle = productObj?.title || 'POD Product'
        const productType = productObj?.productType || 'tshirt'

        productionRows.push({
          orderId: String(order.id),
          createdAt: String(order.createdAt),
          fulfillmentStatus: String(order.fulfillmentStatus || 'pending'),
          recipientName: address?.recipientName || 'N/A',
          phone: address?.phone || 'N/A',
          shippingAddress: fullAddress,
          itemIndex: index + 1,
          productTitle,
          productType,
          sku: item.sku || 'STANDARD',
          variantTitle: item.variantTitle || 'Default',
          quantity: item.quantity || 1,
          customText: item.customText || '',
          customDesignUrl: item.customDesignUrl || '',
          fabricJsonFront: (item as any).fabricJsonFront || undefined,
          fabricJsonBack: (item as any).fabricJsonBack || undefined,
          productionNotes: order.productionNotes || '',
        })
      })
    }

    // --- FORMAT: CSV ---
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
        'Product Type',
        'SKU',
        'Variant',
        'Quantity',
        'Custom Text',
        'Artwork URL',
        'Production Notes',
      ]

      const csvLines = [
        headers.join(','),
        ...productionRows.map(row => {
          const cells = [
            `"${row.orderId}"`,
            `"${row.createdAt}"`,
            `"${row.fulfillmentStatus}"`,
            `"${row.recipientName.replace(/"/g, '""')}"`,
            `"${row.phone.replace(/"/g, '""')}"`,
            `"${row.shippingAddress.replace(/"/g, '""')}"`,
            row.itemIndex,
            `"${row.productTitle.replace(/"/g, '""')}"`,
            `"${row.productType.replace(/"/g, '""')}"`,
            `"${row.sku.replace(/"/g, '""')}"`,
            `"${row.variantTitle.replace(/"/g, '""')}"`,
            row.quantity,
            `"${row.customText.replace(/"/g, '""')}"`,
            `"${row.customDesignUrl.replace(/"/g, '""')}"`,
            `"${row.productionNotes.replace(/"/g, '""')}"`,
          ]
          return cells.join(',')
        }),
      ]

      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="pod-production-batch-${status}-${new Date()
          .toISOString()
          .slice(0, 10)}.csv"`,
      )
      res.status(200).send(csvLines.join('\n'))
      return
    }

    // --- FORMAT: ZIP ARCHIVE ---
    if (format === 'zip') {
      const archive = archiver('zip', { zlib: { level: 6 } })
      const zipFileName = `pod-production-batch-${status}-${new Date().toISOString().slice(0, 10)}.zip`

      res.setHeader('Content-Type', 'application/zip')
      res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`)
      archive.pipe(res)

      // 1. Build & append manifest.csv to the archive
      const manifestHeaders = [
        'Order ID',
        'Item Index',
        'Product',
        'Product Type',
        'SKU',
        'Quantity',
        'Recipient Name',
        'Front Print File',
        'Back Print File',
      ]

      const manifestLines = [manifestHeaders.join(',')]

      // 2. Loop through rows sequentially to avoid Node heap exhaustion
      for (const row of productionRows) {
        let frontFileName = 'N/A'
        let backFileName = 'N/A'

        // Render Front side if present
        if (row.fabricJsonFront) {
          try {
            const frontResult = await renderPodPrintBuffer({
              fabricJson: row.fabricJsonFront,
              productType: row.productType,
              side: 'front',
            })
            frontFileName = `Order-${row.orderId}-Item${row.itemIndex}-front.png`
            archive.append(frontResult.buffer, { name: `prints/${frontFileName}` })
          } catch (renderErr: unknown) {
            payload.logger.error(
              `Batch render failed for Order ${row.orderId} Item ${row.itemIndex} Front: ${
                renderErr instanceof Error ? renderErr.message : String(renderErr)
              }`,
            )
          }
        }

        // Render Back side if present
        if (row.fabricJsonBack) {
          try {
            const backResult = await renderPodPrintBuffer({
              fabricJson: row.fabricJsonBack,
              productType: row.productType,
              side: 'back',
            })
            backFileName = `Order-${row.orderId}-Item${row.itemIndex}-back.png`
            archive.append(backResult.buffer, { name: `prints/${backFileName}` })
          } catch (renderErr: unknown) {
            payload.logger.error(
              `Batch render failed for Order ${row.orderId} Item ${row.itemIndex} Back: ${
                renderErr instanceof Error ? renderErr.message : String(renderErr)
              }`,
            )
          }
        }

        manifestLines.push(
          [
            `"${row.orderId}"`,
            row.itemIndex,
            `"${row.productTitle.replace(/"/g, '""')}"`,
            `"${row.productType}"`,
            `"${row.sku.replace(/"/g, '""')}"`,
            row.quantity,
            `"${row.recipientName.replace(/"/g, '""')}"`,
            `"${frontFileName}"`,
            `"${backFileName}"`,
          ].join(','),
        )
      }

      archive.append(manifestLines.join('\n'), { name: 'manifest.csv' })
      await archive.finalize()
      return
    }

    // --- FORMAT: JSON (DEFAULT) ---
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
