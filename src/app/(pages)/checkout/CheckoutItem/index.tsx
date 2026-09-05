import Link from 'next/link'

import { Media } from '../../../_components/Media'
import { Price } from '../../../_components/Price'

import classes from './index.module.scss'

export const CheckoutItem = ({
  product,
  title,
  metaImage,
  quantity,
  index,
  sku,
  variantTitle,
  customDesignUrl,
  customText,
  petPrintSize,
  petSurcharge,
}: any) => {
  const variantObj = (product as any)?.enableVariants
    ? (product as any)?.variants?.find((v: any) => v.sku === sku)
    : null
  const basePriceCents = variantObj?.price ?? (product as any)?.price ?? 0
  const surchargeCents = typeof petSurcharge === 'number' ? petSurcharge : 0
  const itemUnitPriceCents = basePriceCents > 0 ? basePriceCents + surchargeCents : undefined

  return (
    <li className={classes.item} key={index}>
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
            <p style={{ fontSize: '13px', color: 'var(--color-dark-500)', marginTop: '2px' }}>
              Option: {variantTitle}
            </p>
          )}
          {customDesignUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--theme-brand, #6c4cf1)' }}>
                🎨 In PET:
              </span>
              <img
                src={customDesignUrl}
                alt="Artwork"
                style={{
                  width: '20px',
                  height: '20px',
                  objectFit: 'contain',
                  borderRadius: '3px',
                  border: '1px solid #e5e7eb',
                }}
              />
            </div>
          )}
          {customText && (
            <p style={{ fontSize: '11px', color: '#6366f1', marginTop: '2px', fontWeight: 500 }}>
              Text: "{customText}"
            </p>
          )}
          {petPrintSize && (
            <p style={{ fontSize: '11px', color: 'var(--theme-brand, #6c4cf1)', fontWeight: 600, marginTop: '2px' }}>
              Khổ in: {petPrintSize === 'a3' ? 'Khổ A3 (+6$)' : petPrintSize === 'a4' ? 'Khổ A4 (+3$)' : 'Logo Ngực'}
            </p>
          )}
          <Price product={product} button={false} priceOverride={itemUnitPriceCents} />
        </div>
        <p className={classes.quantity}>x{quantity}</p>
      </div>

      <div className={classes.subtotal}>
        <Price product={product} button={false} quantity={quantity} priceOverride={itemUnitPriceCents ? itemUnitPriceCents * quantity : undefined} />
      </div>
    </li>
  )
}
