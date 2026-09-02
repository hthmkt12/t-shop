'use client'

import React, { Fragment, useEffect, useState } from 'react'

import { Category, Product } from '../../../payload/payload-types'
import { AddToCartButton } from '../../_components/AddToCartButton'
import { Gutter } from '../../_components/Gutter'
import { Media } from '../../_components/Media'
import { CustomDesignData, PodCustomizer } from '../../_components/PodCustomizer'
import { Price, priceFromJSON } from '../../_components/Price'
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

  const currentVariant = hasVariants ? variants[selectedVariantIndex] : null
  const currentStock = hasVariants ? currentVariant?.stock ?? 0 : (product as any)?.stock ?? 10
  const isAvailable = currentStock > 0
  const enableCustomizer = (product as any)?.enableCustomizer ?? true

  useEffect(() => {
    if (product?.id) {
      const priceVal =
        typeof currentVariant?.price === 'number'
          ? currentVariant.price
          : Number(priceFromJSON(product.priceJSON, 1, true)) || 0

      trackEvent({
        name: 'view_item',
        params: {
          item_id: product.id,
          item_name: product.title,
          price: priceVal,
          category: categories?.[0] && typeof categories[0] === 'object' ? categories[0].title : undefined,
        },
      })
    }
  }, [product?.id, trackEvent])

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
          priceOverride={
            typeof currentVariant?.price === 'number' ? currentVariant.price : undefined
          }
        />

        <div className={classes.description}>
          <h6>Description</h6>
          <p>{description}</p>
        </div>

        {enableCustomizer && (
          <PodCustomizer product={product} onDesignChange={design => setCustomDesign(design)} />
        )}

        <AddToCartButton
          product={product}
          sku={currentVariant?.sku}
          variantTitle={currentVariant?.title}
          customDesignUrl={customDesign?.artworkUrl}
          customText={customDesign?.customText}
          className={classes.addToCartButton}
          appearance={isAvailable ? 'primary' : 'secondary'}
          disabled={!isAvailable}
        />
      </div>
    </Gutter>
  )
}
