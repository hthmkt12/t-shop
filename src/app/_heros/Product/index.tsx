'use client'

import React, { Fragment, useEffect, useState } from 'react'

import { Category, Product } from '../../../payload/payload-types'
import { AddToCartButton } from '../../_components/AddToCartButton'
import { Gutter } from '../../_components/Gutter'
import { Media } from '../../_components/Media'
import { CustomDesignData, PodCustomizer } from '../../_components/PodCustomizer'
import { Price, priceFromJSON } from '../../_components/Price'
import { FAQAccordion } from '../../_components/FAQAccordion'
import { DeliveryEstimator } from '../../_components/DeliveryEstimator'
import { BulkOrderMatrix } from '../../_components/BulkOrderMatrix'
import { useAnalytics } from '../../_providers/Analytics'

import classes from './index.module.scss'

export const ProductHero: React.FC<{
  product: Product
}> = ({ product }) => {
  const { title, categories, meta: { image: metaImage, description } = {} } = product
  const { trackEvent } = useAnalytics()

  const hasVariants = (product as any)?.enableVariants && (product as any)?.variants?.length > 0
  const variants = (product as any)?.variants || []
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0)
  const [customDesign, setCustomDesign] = useState<CustomDesignData | null>(null)
  const [orderMode, setOrderMode] = useState<'single' | 'bulk'>('single')

  const currentVariant = hasVariants ? variants[selectedVariantIndex] : null
  const currentStock = hasVariants ? currentVariant?.stock ?? 0 : (product as any)?.stock ?? 10
  const isAvailable = currentStock > 0
  const enableCustomizer = (product as any)?.enableCustomizer ?? true

  const basePriceCents =
    typeof currentVariant?.price === 'number'
      ? currentVariant.price
      : Number(priceFromJSON(product.priceJSON, 1, true)) || 0

  const petSurchargeCents = customDesign?.petSurcharge || 0
  const totalPriceCents = basePriceCents + petSurchargeCents

  useEffect(() => {
    if (product?.id) {
      trackEvent({
        name: 'view_item',
        params: {
          item_id: product.id,
          item_name: product.title,
          price: totalPriceCents,
          category:
            categories?.[0] && typeof categories[0] === 'object' ? categories[0].title : undefined,
        },
      })
    }
  }, [product?.id, totalPriceCents, trackEvent])

  return (
    <Gutter className={classes.productHero}>
      <div className={classes.mediaWrapper}>
        {!metaImage && <div className={classes.placeholder}>No image</div>}
        {metaImage && typeof metaImage !== 'string' && (
          <Media imgClassName={classes.image} resource={metaImage} fill />
        )}
      </div>

      <div className={classes.details}>
        <h3 className={classes.title}>{title}</h3>

        <div className={classes.categoryWrapper}>
          <div className={classes.categories}>
            {categories?.map((category, index) => {
              const { title: categoryTitle } = category as Category

              const titleToUse = categoryTitle || 'Generic'
              const isLast = index === categories.length - 1

              return (
                <p key={index} className={classes.category}>
                  {titleToUse} {!isLast && <Fragment>, &nbsp;</Fragment>}
                  <span className={classes.separator}>|</span>
                </p>
              )
            })}
          </div>
          <p className={isAvailable ? classes.stock : classes.outOfStock}>
            {isAvailable ? `In stock (${currentStock})` : 'Out of stock'}
          </p>
        </div>

        {hasVariants && (
          <div className={classes.orderModeTabs}>
            <button
              type="button"
              className={orderMode === 'single' ? classes.active : ''}
              onClick={() => setOrderMode('single')}
            >
              🛍️ Mua lẻ (Single)
            </button>
            <button
              type="button"
              className={orderMode === 'bulk' ? classes.active : ''}
              onClick={() => setOrderMode('bulk')}
            >
              👥 Bảng đặt sỉ / Đội nhóm (Matrix)
            </button>
          </div>
        )}

        {hasVariants && orderMode === 'single' && (
          <div className={classes.variantsSection}>
            <label>Select Option:</label>
            <div className={classes.variantList}>
              {variants.map((v: any, idx: number) => {
                const outOfStock = (v.stock ?? 0) <= 0
                return (
                  <button
                    key={v.sku || idx}
                    type="button"
                    className={[
                      classes.variantBtn,
                      selectedVariantIndex === idx && classes.selected,
                      outOfStock && classes.disabled,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => setSelectedVariantIndex(idx)}
                  >
                    {v.colorHex && (
                      <span
                        className={classes.swatch}
                        style={{ backgroundColor: v.colorHex }}
                        aria-hidden="true"
                      />
                    )}
                    {v.title || v.sku}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <Price
          product={product}
          button={false}
          priceOverride={totalPriceCents > 0 ? totalPriceCents : undefined}
        />

        {petSurchargeCents > 0 && (
          <p style={{ fontSize: '13px', color: 'var(--theme-brand, #6c4cf1)', marginTop: '-8px', fontWeight: 600 }}>
            Đã bao gồm phụ phí in PET: +${(petSurchargeCents / 100).toFixed(2)}
          </p>
        )}

        <div className={classes.description}>
          <h6>Description</h6>
          <p>{description}</p>
        </div>

        {enableCustomizer && (
          <PodCustomizer product={product} onDesignChange={design => setCustomDesign(design)} />
        )}

        {hasVariants && orderMode === 'bulk' ? (
          <BulkOrderMatrix
            product={product}
            customDesignUrl={customDesign?.artworkUrl}
            customText={customDesign?.customText}
            fabricJsonFront={customDesign?.fabricJsonFront}
            fabricJsonBack={customDesign?.fabricJsonBack}
            petPrintSize={customDesign?.petPrintSize}
            petSurcharge={customDesign?.petSurcharge}
          />
        ) : (
          <AddToCartButton
            product={product}
            sku={currentVariant?.sku}
            variantTitle={currentVariant?.title}
            customDesignUrl={customDesign?.artworkUrl}
            customText={customDesign?.customText}
            fabricJsonFront={customDesign?.fabricJsonFront}
            fabricJsonBack={customDesign?.fabricJsonBack}
            petPrintSize={customDesign?.petPrintSize}
            petSurcharge={customDesign?.petSurcharge}
            className={classes.addToCartButton}
            appearance={isAvailable ? 'primary' : 'secondary'}
            disabled={!isAvailable}
          />
        )}

        <DeliveryEstimator showGuarantee={true} />

        <div className={classes.guaranteeBadge}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>Cam kết 100% hài lòng — Bảo hành chất lượng hình in &amp; đổi trả miễn phí</span>
        </div>

        <FAQAccordion />
      </div>
    </Gutter>
  )
}
