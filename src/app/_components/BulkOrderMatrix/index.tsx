'use client'

import React, { useState } from 'react'
import { Product } from '../../../payload/payload-types'
import { useCart } from '../../_providers/Cart'
import classes from './index.module.scss'

interface BulkOrderMatrixProps {
  product: Product
  customDesignUrl?: string
  customText?: string
  fabricJsonFront?: string
  fabricJsonBack?: string
  petPrintSize?: string
  petSurcharge?: number
}

export const BulkOrderMatrix: React.FC<BulkOrderMatrixProps> = ({
  product,
  customDesignUrl,
  customText,
  fabricJsonFront,
  fabricJsonBack,
  petPrintSize,
  petSurcharge = 0,
}) => {
  const { addItemToCart } = useCart()
  const variants = (product as any)?.variants || []
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [addedToast, setAddedToast] = useState(false)

  if (!variants || variants.length === 0) return null

  const handleQtyChange = (sku: string, val: string, maxStock: number) => {
    let num = parseInt(val, 10)
    if (isNaN(num) || num < 0) num = 0
    if (num > maxStock) num = maxStock
    setQuantities(prev => ({
      ...prev,
      [sku]: num,
    }))
  }

  const totalQuantity = Object.values(quantities).reduce((a, b) => a + b, 0)

  // Tiered discount calculation:
  // 1-5: 0% | 6-19: 5% | 20-49: 10% | 50+: 15%
  let discountPct = 0
  if (totalQuantity >= 50) discountPct = 15
  else if (totalQuantity >= 20) discountPct = 10
  else if (totalQuantity >= 6) discountPct = 5

  const handleBulkAddToCart = () => {
    if (totalQuantity <= 0) return

    variants.forEach((v: any) => {
      const qty = quantities[v.sku] || 0
      if (qty > 0) {
        addItemToCart({
          product,
          quantity: qty,
          sku: v.sku,
          variantTitle: v.title,
          customDesignUrl,
          customText,
          fabricJsonFront,
          fabricJsonBack,
          petPrintSize,
          petSurcharge,
        } as any)
      }
    })

    setAddedToast(true)
    setTimeout(() => setAddedToast(false), 4000)
    setQuantities({})
  }

  return (
    <div className={classes.matrixContainer}>
      <div className={classes.matrixTableWrapper}>
        <table className={classes.matrixTable}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Phân loại</th>
              <th>Giá phôi</th>
              <th>Kho</th>
              <th>Số lượng đặt</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v: any) => {
              const stock = v.stock ?? 0
              const isOos = stock <= 0
              const currentQty = quantities[v.sku] || ''
              const priceCents = (v.price ?? 0) + petSurcharge

              return (
                <tr key={v.sku}>
                  <td className={classes.variantCell}>
                    {v.colorHex && (
                      <span className={classes.swatch} style={{ backgroundColor: v.colorHex }} />
                    )}
                    <span>{v.title || v.sku}</span>
                  </td>
                  <td>${(priceCents / 100).toFixed(2)}</td>
                  <td style={{ color: isOos ? '#ef4444' : '#10b981', fontWeight: 500 }}>
                    {isOos ? 'Hết hàng' : stock}
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max={stock}
                      disabled={isOos}
                      value={currentQty}
                      placeholder="0"
                      className={classes.qtyInput}
                      onChange={e => handleQtyChange(v.sku, e.target.value, stock)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className={classes.summaryRow}>
        <div>
          <span>Tổng: <strong>{totalQuantity}</strong> chiếc </span>
          {discountPct > 0 && (
            <span className={classes.tierDiscountBadge}>
              Chiết khấu sỉ -{discountPct}%
            </span>
          )}
        </div>
        <button
          type="button"
          className={classes.bulkAddBtn}
          style={{ width: 'auto', padding: '8px 16px', marginTop: 0 }}
          disabled={totalQuantity <= 0}
          onClick={handleBulkAddToCart}
        >
          {addedToast ? '✓ Đã thêm vào giỏ!' : `+ Thêm ${totalQuantity} áo vào giỏ hàng`}
        </button>
      </div>
    </div>
  )
}
