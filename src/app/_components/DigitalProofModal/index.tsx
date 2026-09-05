'use client'

import React, { useState } from 'react'
import classes from './index.module.scss'

export interface ProofItem {
  title: string
  variantTitle?: string
  artworkUrl?: string
  customText?: string
  petPrintSize?: string
  quantity: number
}

interface DigitalProofModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  items: ProofItem[]
}

export const DigitalProofModal: React.FC<DigitalProofModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  items,
}) => {
  const [agreedQuality, setAgreedQuality] = useState(false)
  const [agreedSpelling, setAgreedSpelling] = useState(false)

  if (!isOpen) return null

  const customItems = items.filter(
    item => Boolean(item.artworkUrl) || Boolean(item.customText) || Boolean(item.petPrintSize),
  )

  const canProceed = agreedQuality && agreedSpelling

  return (
    <div className={classes.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={classes.modal} onClick={e => e.stopPropagation()}>
        <div className={classes.header}>
          <h4>Xác Nhận Bản In Kỹ Thuật Số (Digital Proof)</h4>
          <button type="button" className={classes.closeBtn} onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className={classes.body}>
          <p style={{ fontSize: '13px', color: 'var(--theme-text-soft, #6b7280)', margin: 0 }}>
            Vui lòng kiểm tra kỹ hình in, vị trí và nội dung văn bản. Xưởng sẽ in nhiệt màng PET chính xác theo bản thiết kế này:
          </p>

          {customItems.length === 0 ? (
            <div className={classes.previewCard}>
              <p style={{ fontSize: '13px', margin: 0 }}>Đơn hàng gồm các sản phẩm phôi trơn tiêu chuẩn.</p>
            </div>
          ) : (
            customItems.map((item, idx) => {
              const sizeLabel =
                item.petPrintSize === 'a3'
                  ? 'Khổ A3 (30x42cm)'
                  : item.petPrintSize === 'a4'
                  ? 'Khổ A4 (21x30cm)'
                  : 'Logo Ngực (10x10cm)'

              return (
                <div className={classes.previewCard} key={idx}>
                  {item.artworkUrl ? (
                    <img src={item.artworkUrl} alt="Design proof" className={classes.proofImage} />
                  ) : (
                    <div
                      className={classes.proofImage}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9ca3af',
                        fontSize: '12px',
                      }}
                    >
                      Văn bản
                    </div>
                  )}

                  <div className={classes.specDetails}>
                    <span className={classes.specTitle}>{item.title}</span>
                    {item.variantTitle && (
                      <div className={classes.specItem}>
                        <span>Phân loại:</span>
                        <strong>{item.variantTitle}</strong>
                      </div>
                    )}
                    <div className={classes.specItem}>
                      <span>Công nghệ:</span>
                      <strong>In PET Kỹ Thuật Số (DTF Full Color)</strong>
                    </div>
                    <div className={classes.specItem}>
                      <span>Khổ in ấn:</span>
                      <strong>{sizeLabel}</strong>
                    </div>
                    {item.customText && (
                      <div className={classes.specItem}>
                        <span>Chữ in:</span>
                        <strong>"{item.customText}"</strong>
                      </div>
                    )}
                    <div className={classes.specItem}>
                      <span>Số lượng:</span>
                      <strong>{item.quantity} chiếc</strong>
                    </div>
                  </div>
                </div>
              )
            })
          )}

          <div className={classes.checklist}>
            <label className={classes.checkItem}>
              <input
                type="checkbox"
                checked={agreedQuality}
                onChange={e => setAgreedQuality(e.target.checked)}
              />
              <span>Tôi đã kiểm tra kỹ màu sắc, bố cục hình in và chất lượng hiển thị.</span>
            </label>

            <label className={classes.checkItem}>
              <input
                type="checkbox"
                checked={agreedSpelling}
                onChange={e => setAgreedSpelling(e.target.checked)}
              />
              <span>Tôi xác nhận nội dung chữ in không có lỗi chính tả, câu chữ chuẩn xác.</span>
            </label>
          </div>
        </div>

        <div className={classes.footer}>
          <button type="button" className={classes.cancelBtn} onClick={onClose}>
            Chỉnh sửa lại
          </button>
          <button
            type="button"
            className={classes.approveBtn}
            disabled={!canProceed}
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            Duyệt bản in &amp; Tiếp tục thanh toán
          </button>
        </div>
      </div>
    </div>
  )
}
