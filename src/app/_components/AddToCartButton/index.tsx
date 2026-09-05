'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Product } from '../../../payload/payload-types'
import { useAnalytics } from '../../_providers/Analytics'
import { useCart } from '../../_providers/Cart'
import { priceFromJSON } from '../Price'
import { Button, Props } from '../Button'

import classes from './index.module.scss'

export const AddToCartButton: React.FC<{
  product: Product
  quantity?: number
  className?: string
  appearance?: Props['appearance']
  sku?: string
  variantTitle?: string
  customDesignUrl?: string
  customText?: string
  fabricJsonFront?: string
  fabricJsonBack?: string
  disabled?: boolean
}> = props => {
  const {
    product,
    quantity = 1,
    className,
    appearance = 'primary',
    sku,
    variantTitle,
    customDesignUrl,
    customText,
    fabricJsonFront,
    fabricJsonBack,
    disabled = false,
  } = props

  const { cart, addItemToCart, isProductInCart, hasInitializedCart } = useCart()
  const { trackEvent } = useAnalytics()

  const [isInCart, setIsInCart] = useState<boolean>()
  const [showToast, setShowToast] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsInCart(isProductInCart(product, sku))
  }, [isProductInCart, product, cart, sku])

  return (
    <div className={classes.toastWrapper}>
      <Button
        href={isInCart ? '/cart' : undefined}
        type={!isInCart ? 'button' : undefined}
        label={disabled ? 'Out of stock' : isInCart ? `✓ In cart (View)` : `Add to cart`}
        el={isInCart ? 'link' : undefined}
        appearance={appearance}
        disabled={disabled}
        className={[
          className,
          classes.addToCartButton,
          appearance === 'default' && isInCart && classes.green,
          !hasInitializedCart && classes.hidden,
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={
          !isInCart && !disabled
            ? () => {
                const priceVal =
                  typeof product === 'object'
                    ? Number(priceFromJSON(product.priceJSON, 1, true)) || 0
                    : 0

                trackEvent({
                  name: 'add_to_cart',
                  params: {
                    item_id: product.id,
                    item_name: product.title,
                    price: priceVal,
                    quantity,
                    sku,
                    variant_title: variantTitle,
                    is_customized: Boolean(customDesignUrl || customText),
                  },
                })

                addItemToCart({
                  product,
                  quantity,
                  sku,
                  variantTitle,
                  customDesignUrl,
                  customText,
                  fabricJsonFront,
                  fabricJsonBack,
                } as any)

                setShowToast(true)
              }
            : undefined
        }
      />

      {showToast && (
        <div className={classes.toastSuccess}>
          <span>✓ Added to cart!</span>
          <div className={classes.toastActions}>
            <Link href="/cart" className={classes.toastLink}>
              View Cart
            </Link>
            <Link href="/checkout" className={classes.toastLink}>
              Checkout →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
