/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AfterChangeHook } from 'payload/dist/collections/config/types'

import type { Order } from '../../../payload-types'

export const updateProductStock: AfterChangeHook<Order> = async ({
  doc,
  previousDoc,
  req,
  operation,
}) => {
  const { payload } = req

  // Case 1: Deduct stock on Order creation
  if (operation === 'create' && doc.items && Array.isArray(doc.items)) {
    for (const item of doc.items) {
      const productId = typeof item.product === 'object' ? item.product.id : item.product
      const quantity = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1
      const itemSku = (item as any)?.sku

      if (!productId) continue

      try {
        const product: any = await payload.findByID({
          collection: 'products',
          id: productId,
        })

        if (!product) continue

        if (product.enableVariants && Array.isArray(product.variants) && itemSku) {
          let variantMatched = false
          const updatedVariants = product.variants.map((v: any) => {
            if (v.sku === itemSku) {
              variantMatched = true
              const currentStock = typeof v.stock === 'number' ? v.stock : 0
              const newStock = Math.max(0, currentStock - quantity)
              return {
                ...v,
                stock: newStock,
              }
            }
            return v
          })

          if (variantMatched) {
            await payload.update({
              collection: 'products',
              id: productId,
              data: {
                variants: updatedVariants,
              },
            })
          }
        } else if (typeof product.stock === 'number') {
          const newStock = Math.max(0, product.stock - quantity)
          await payload.update({
            collection: 'products',
            id: productId,
            data: {
              stock: newStock,
            },
          })
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        payload.logger.error(`Failed to update stock for product ${productId}: ${message}`)
      }
    }
  }

  // Case 2: Restock if order status transitions to 'cancelled'
  const wasCancelled = previousDoc?.fulfillmentStatus === 'cancelled'
  const isNowCancelled = doc.fulfillmentStatus === 'cancelled'

  if (
    operation === 'update' &&
    isNowCancelled &&
    !wasCancelled &&
    doc.items &&
    Array.isArray(doc.items)
  ) {
    for (const item of doc.items) {
      const productId = typeof item.product === 'object' ? item.product.id : item.product
      const quantity = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1
      const itemSku = (item as any)?.sku

      if (!productId) continue

      try {
        const product: any = await payload.findByID({
          collection: 'products',
          id: productId,
        })

        if (!product) continue

        if (product.enableVariants && Array.isArray(product.variants) && itemSku) {
          let variantMatched = false
          const updatedVariants = product.variants.map((v: any) => {
            if (v.sku === itemSku) {
              variantMatched = true
              const currentStock = typeof v.stock === 'number' ? v.stock : 0
              return {
                ...v,
                stock: currentStock + quantity,
              }
            }
            return v
          })

          if (variantMatched) {
            await payload.update({
              collection: 'products',
              id: productId,
              data: {
                variants: updatedVariants,
              },
            })
            payload.logger.info(
              `Restocked +${quantity} for variant ${itemSku} on order cancellation`,
            )
          }
        } else if (typeof product.stock === 'number') {
          await payload.update({
            collection: 'products',
            id: productId,
            data: {
              stock: product.stock + quantity,
            },
          })
          payload.logger.info(
            `Restocked +${quantity} for product ${productId} on order cancellation`,
          )
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        payload.logger.error(`Failed to restock for product ${productId}: ${message}`)
      }
    }
  }

  return
}
