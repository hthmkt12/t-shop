'use client'

import React, { Fragment } from 'react'
import Link from 'next/link'

import { Page, Settings } from '../../../../payload/payload-types'
import { Button } from '../../../_components/Button'
import { HR } from '../../../_components/HR'
import { LoadingShimmer } from '../../../_components/LoadingShimmer'
import { Media } from '../../../_components/Media'
import { Price } from '../../../_components/Price'
import { RemoveFromCartButton } from '../../../_components/RemoveFromCartButton'
import { useAuth } from '../../../_providers/Auth'
import { useCart } from '../../../_providers/Cart'
import CartItem from '../CartItem'

import classes from './index.module.scss'

export const CartPage: React.FC<{
  settings: Settings
  page: Page
}> = props => {
  const { settings } = props
  const { productsPage } = settings || {}

  const { user } = useAuth()

  const { cart, cartIsEmpty, addItemToCart, cartTotal, hasInitializedCart } = useCart()

  return (
    <Fragment>
      <br />
      {!hasInitializedCart ? (
        <div className={classes.loading}>
          <LoadingShimmer />
        </div>
      ) : (
        <Fragment>
          {cartIsEmpty ? (
            <div className={classes.empty}>
              Your cart is empty.
              {typeof productsPage === 'object' && productsPage?.slug && (
                <Fragment>
                  {' '}
                  <Link href={`/${productsPage.slug}`}>Click here</Link>
                  {` to shop.`}
                </Fragment>
              )}
              {!user && (
                <Fragment>
                  {' '}
                  <Link href={`/login?redirect=%2Fcart`}>Log in</Link>
                  {` to view a saved cart.`}
                </Fragment>
              )}
            </div>
          ) : (
            <div className={classes.cartWrapper}>
              <div>
                {/* CART LIST HEADER */}
                <div className={classes.header}>
                  <p>Products</p>
                  <div className={classes.headerItemDetails}>
                    <p></p>
                    <p></p>
                    <p>Quantity</p>
                  </div>
                  <p className={classes.headersubtotal}>Subtotal</p>
                </div>
                {/* CART ITEM LIST */}
                <ul className={classes.itemsList}>
                  {cart?.items?.map((item, index) => {
                    if (typeof item.product === 'object') {
                      const {
                        quantity,
                        product,
                        product: { id, title, meta, stripeProductID },
                      } = item

                      const isLast = index === (cart?.items?.length || 0) - 1

                      const metaImage = meta?.image

                      return (
                        <CartItem
                          key={
                            (item as any)?.sku
                              ? `${id}-${(item as any)?.sku}`
                              : (item as any)?.customText
                              ? `${id}-${(item as any)?.customText}`
                              : id
                          }
                          product={product}
                          title={title}
                          metaImage={metaImage}
                          qty={quantity}
                          sku={(item as any)?.sku}
                          variantTitle={(item as any)?.variantTitle}
                          customDesignUrl={(item as any)?.customDesignUrl}
                          customText={(item as any)?.customText}
                          addItemToCart={addItemToCart}
                        />
                      )
                    }
                    return null
                  })}
                </ul>
              </div>

              <div className={classes.summary}>
                <div className={classes.row}>
                  <h6 className={classes.cartTotal}>Summary</h6>
                </div>

                <div className={classes.row}>
                  <p className={classes.cartTotal}>Delivery Charge</p>
                  <p className={classes.cartTotal}>$0</p>
                </div>

                <div className={classes.row}>
                  <p className={classes.cartTotal}>Grand Total</p>
                  <p className={classes.cartTotal}>{cartTotal.formatted}</p>
                </div>

                {/* POD Order Bump / Cross-sell Accent Box */}
                <div className={classes.orderBumpCard}>
                  <div className={classes.bumpHeader}>
                    <span>🎁</span>
                    <div>
                      <strong>Add Eco Canvas Tote Bag?</strong>
                      <p>Complete your bundle for just +$22.00</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={classes.bumpAddBtn}
                    onClick={() => {
                      addItemToCart({
                        product: {
                          id: 'pod-tote-upsell',
                          title: 'Eco-Friendly Heavy Canvas Tote Bag',
                          priceJSON: JSON.stringify([{ unit_amount: 2200 }]),
                          slug: 'heavy-canvas-tote-bag',
                          enableVariants: false,
                        } as any,
                        quantity: 1,
                        sku: 'TOTE-NATURAL-BUMP',
                        variantTitle: 'Natural Canvas (Special Bundle)',
                      } as any)
                    }}
                  >
                    + Add to Cart (+$22)
                  </button>
                </div>

                <Button
                  className={classes.checkoutButton}
                  href={user ? '/checkout' : '/login?redirect=%2Fcheckout'}
                  label={user ? 'Checkout' : 'Login to checkout'}
                  appearance="primary"
                />
              </div>
            </div>
          )}
        </Fragment>
      )}
    </Fragment>
  )
}
