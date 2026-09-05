'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import classes from './index.module.scss'

const TIERS = [
  { qty: 1, label: '1 - 5 cái', discount: 0, unitPrice: 22.0 },
  { qty: 6, label: '6 - 19 cái', discount: 5, unitPrice: 20.9 },
  { qty: 20, label: '20 - 49 cái', discount: 10, unitPrice: 19.8 },
  { qty: 50, label: '50 - 99 cái', discount: 15, unitPrice: 18.7 },
  { qty: 100, label: '100+ cái', discount: 25, unitPrice: 16.5 },
]

export const BulkDiscountCalculator: React.FC = () => {
  const [selectedQty, setSelectedQty] = useState<number>(20)

  // Find active tier
  const activeTier =
    TIERS.slice()
      .reverse()
      .find(t => selectedQty >= t.qty) || TIERS[0]

  const baseTotal = selectedQty * TIERS[0].unitPrice
  const discountedTotal = selectedQty * activeTier.unitPrice
  const savings = baseTotal - discountedTotal

  return (
    <section id="bulk-calculator" className={classes.calculatorSection}>
      <div className={classes.container}>
        <div className={classes.header}>
          <div className={classes.eyebrow}>BẢNG TÍNH GIÁ SỈ TỰ ĐỘNG &bull; RUSHORDERTEES STYLE</div>
          <h2 className={classes.title}>Đặt Càng Nhiều &bull; Giá Càng Rẻ</h2>
          <p className={classes.sub}>
            Hỗ trợ chiết khấu trực tiếp cho đồng phục công ty, áo lớp, câu lạc bộ, sự kiện và local brands.
          </p>
        </div>

        <div className={classes.calculatorCard}>
          {/* Left: Interactive Quantity Selection */}
          <div className={classes.inputCol}>
            <label className={classes.inputLabel}>
              Chọn số lượng áo dự kiến in: <strong>{selectedQty} chiếc</strong>
            </label>

            {/* Quick buttons */}
            <div className={classes.quickBtnRow}>
              {[1, 10, 20, 50, 100, 250].map(q => (
                <button
                  key={q}
                  type="button"
                  className={[classes.quickBtn, selectedQty === q && classes.activeQuickBtn]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setSelectedQty(q)}
                >
                  {q} chiếc
                </button>
              ))}
            </div>

            {/* Range Slider */}
            <input
              type="range"
              min="1"
              max="200"
              value={selectedQty}
              onChange={e => setSelectedQty(parseInt(e.target.value, 10))}
              className={classes.rangeSlider}
            />

            {/* Tier list visual */}
            <div className={classes.tierList}>
              {TIERS.map((tier, idx) => {
                const isActive = activeTier.qty === tier.qty
                return (
                  <div
                    key={idx}
                    className={[classes.tierItem, isActive && classes.activeTierItem]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => setSelectedQty(tier.qty)}
                  >
                    <span className={classes.tierQty}>{tier.label}</span>
                    <span className={classes.tierDiscount}>
                      {tier.discount === 0 ? 'Giá chuẩn' : `Giảm -${tier.discount}%`}
                    </span>
                    <strong className={classes.tierPrice}>${tier.unitPrice.toFixed(2)}/áo</strong>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right: Live Summary & CTA */}
          <div className={classes.summaryCol}>
            <div className={classes.summaryBox}>
              <div className={classes.summaryHeader}>
                <span>Ước tính chi phí in áo</span>
                {activeTier.discount > 0 && (
                  <span className={classes.discountBadge}>Tiết kiệm -{activeTier.discount}%</span>
                )}
              </div>

              <div className={classes.priceRow}>
                <span className={classes.priceLabel}>Đơn giá / chiếc:</span>
                <span className={classes.unitPriceValue}>${activeTier.unitPrice.toFixed(2)}</span>
              </div>

              <div className={classes.priceRow}>
                <span className={classes.priceLabel}>Số lượng đặt:</span>
                <span className={classes.metaValue}>{selectedQty} chiếc</span>
              </div>

              {savings > 0 && (
                <div className={classes.savingsRow}>
                  <span>Số tiền tiết kiệm:</span>
                  <strong>-${savings.toFixed(2)}</strong>
                </div>
              )}

              <div className={classes.divider} />

              <div className={classes.totalRow}>
                <span>Tổng chi phí tạm tính:</span>
                <strong className={classes.totalAmount}>${discountedTotal.toFixed(2)}</strong>
              </div>

              <div className={classes.perkList}>
                <div className={classes.perkItem}>✓ Đã bao gồm in PET DTF khổ chuẩn</div>
                <div className={classes.perkItem}>✓ Miễn phí thiết kế & chỉnh sửa file</div>
                <div className={classes.perkItem}>✓ Miễn phí giao hàng toàn quốc</div>
              </div>

              <Link href="/products" className={classes.orderBtn}>
                ⚡ Bắt đầu thiết kế đơn {selectedQty} áo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
