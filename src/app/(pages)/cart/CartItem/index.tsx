'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { Media } from '../../../_components/Media'
import { Price } from '../../../_components/Price'
import { RemoveFromCartButton } from '../../../_components/RemoveFromCartButton'

import classes from './index.module.scss'

const CartItem = ({
  product,
  title,
  metaImage,
  qty,
  addItemToCart,
  sku,
  variantTitle,
  customDesignUrl,
  customText,
  petPrintSize,
  petSurcharge,
}) => {
  const [quantity, setQuantity] = useState(qty)

  const variantObj = (product as any)?.enableVariants
    ? (product as any)?.variants?.find((v: any) => v.sku === sku)
    : null
  const maxStock = variantObj ? variantObj.stock ?? 0 : (product as any)?.stock ?? 999

  const basePriceCents = variantObj?.price ?? (product as any)?.price ?? 0
  const surchargeCents = typeof petSurcharge === 'number' ? petSurcharge : 0
  const itemUnitPriceCents = basePriceCents > 0 ? basePriceCents + surchargeCents : undefined

  const decrementQty = () => {
    const updatedQty = quantity > 1 ? quantity - 1 : 1

    setQuantity(updatedQty)
    addItemToCart({
      product,
      quantity: Number(updatedQty),
      sku,
      variantTitle,
      customDesignUrl,
      customText,
      petPrintSize,
      petSurcharge,
    })
  }

  const incrementQty = () => {
    if (quantity >= maxStock) return
    const updatedQty = quantity + 1

    setQuantity(updatedQty)
    addItemToCart({
      product,
      quantity: Number(updatedQty),
      sku,
      variantTitle,
      customDesignUrl,
      customText,
      petPrintSize,
      petSurcharge,
    })
  }

  const enterQty = (e: React.ChangeEvent<HTMLInputElement>) => {
    let updatedQty = Number(e.target.value)
    if (isNaN(updatedQty) || updatedQty < 1) updatedQty = 1
    if (updatedQty > maxStock) updatedQty = maxStock

    setQuantity(updatedQty)
    addItemToCart({
      product,
      quantity: Number(updatedQty),
      sku,
      variantTitle,
      customDesignUrl,
      customText,
      petPrintSize,
      petSurcharge,
    })
  }

  return (
    <li className={classes.item} key={sku ? `${title}-${sku}` : title}>
      <Link href={`/products/${product.slug}`} className={classes.mediaWrapper}>
        {!metaImage && <span>No image</span>}
        {metaImage && typeof metaImage !== 'string' && (
          <Media className={classes.media} imgClassName={classes.image} resource={metaImage} fill />
        )}
      </Link>

      <div className={classes.itemDetails}>
        <div className={classes.titleWrapper}>
          <h6>{title}</h6>
          {variantTitle && (
            <p style={{ fontSize: '13px', color: 'var(--theme-text-soft)', marginTop: '2px' }}>
              Option: {variantTitle}
            </p>
          )}
          {customDesignUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--theme-brand)' }}>
                🎨 Custom Print:
              </span>
              <img
                src={customDesignUrl}
                alt="Custom print"
                style={{
                  width: '22px',
                  height: '22px',
                  objectFit: 'contain',
                  borderRadius: '3px',
                  border: '1px solid var(--pod-border)',
                }}
              />
            </div>
          )}
          {customText && (
            <p
              style={{
                fontSize: '12px',
                color: 'var(--pod-accent-500)',
                fontWeight: 600,
                marginTop: '2px',
              }}
            >
              Text: "{customText}"
            </p>
          )}
          {maxStock < 10 && (
            <p
              style={{
                fontSize: '12px',
                color:
                  maxStock > 0 ? 'var(--color-warning-500, #e67e22)' : 'var(--color-error-500)',
                marginTop: '2px',
              }}
            >
              {maxStock > 0 ? `Only ${maxStock} left in stock` : 'Out of stock'}
            </p>
          )}
          {petPrintSize && (
            <p style={{ fontSize: '12px', color: 'var(--theme-brand)', fontWeight: 600, marginTop: '2px' }}>
              Khổ in: {petPrintSize === 'a3' ? 'Khổ A3 (+6.00$)' : petPrintSize === 'a4' ? 'Khổ A4 (+3.00$)' : 'Logo Ngực'}
            </p>
          )}
          <Price product={product} button={false} priceOverride={itemUnitPriceCents} />
        </div>

        <div className={classes.quantity}>
          <div className={classes.quantityBtn} onClick={decrementQty}>
            <Image
              src="/assets/icons/minus.svg"
              alt="minus"
              width={24}
              height={24}
              className={classes.qtnBt}
            />
          </div>

          <input
            type="text"
            className={classes.quantityInput}
            value={quantity}
            onChange={enterQty}
          />

          <div
            className={[classes.quantityBtn, quantity >= maxStock && classes.disabled]
              .filter(Boolean)
              .join(' ')}
            onClick={incrementQty}
            style={{
              opacity: quantity >= maxStock ? 0.3 : 1,
              cursor: quantity >= maxStock ? 'not-allowed' : 'pointer',
            }}
          >
            <Image
              src="/assets/icons/plus.svg"
              alt="plus"
              width={24}
              height={24}
              className={classes.qtnBt}
            />
          </div>
        </div>
      </div>

      <div className={classes.subtotalWrapper}>
        <Price product={product} button={false} quantity={quantity} />
        <RemoveFromCartButton product={product} sku={sku} />
      </div>
    </li>
  )
}

export default CartItem
