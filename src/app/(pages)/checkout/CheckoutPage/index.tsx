'use client'

import React, { Fragment, useEffect } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Settings } from '../../../../payload/payload-types'
import { Button } from '../../../_components/Button'
import { LoadingShimmer } from '../../../_components/LoadingShimmer'
import { priceFromJSON } from '../../../_components/Price'
import { useAnalytics } from '../../../_providers/Analytics'
import { useAuth } from '../../../_providers/Auth'
import { useCart } from '../../../_providers/Cart'
import { useTheme } from '../../../_providers/Theme'
import cssVariables from '../../../cssVariables'
import { CheckoutForm } from '../CheckoutForm'
import { CheckoutItem } from '../CheckoutItem'

import classes from './index.module.scss'

const apiKey = `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`
const stripe = loadStripe(apiKey)

export const CheckoutPage: React.FC<{
  settings: Settings | null
}> = props => {
  const { settings } = props
  const { productsPage } = settings || {}

  const { user } = useAuth()
  const router = useRouter()
  const { trackEvent } = useAnalytics()
  const [error, setError] = React.useState<string | null>(null)
  const [clientSecret, setClientSecret] = React.useState<string | null>(null)
  const [guestEmail, setGuestEmail] = React.useState('')
  const [isTestSubmitting, setIsTestSubmitting] = React.useState(false)

  const handleTestCheckout = async () => {
    setIsTestSubmitting(true)
    try {
      const orderReq = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          total: cartTotal.raw,
          stripePaymentIntentID: `test_mock_${Date.now()}`,
          guestEmail: !user && guestEmail ? guestEmail : undefined,
          items: (cart?.items || [])?.map(
            ({ product, quantity, sku, variantTitle, customDesignUrl, customText }: any) => ({
              product: typeof product === 'string' ? product : product.id,
              quantity,
              sku,
              variantTitle,
              customDesignUrl,
              customText,
              price:
                typeof product === 'object'
                  ? Number(priceFromJSON(product.priceJSON, 1, true))
                  : undefined,
            }),
          ),
        }),
      })

      if (!orderReq.ok) throw new Error(orderReq.statusText || 'Something went wrong.')

      const { doc, error: errorFromRes }: { doc: any; error?: string } = await orderReq.json()
      if (errorFromRes) throw new Error(errorFromRes)

      router.push(`/order-confirmation?order_id=${doc.id}`)
    } catch (err: any) {
      setError(err?.message || 'Error placing test order')
      setIsTestSubmitting(false)
    }
  }
  const hasMadePaymentIntent = React.useRef(false)
  const { theme } = useTheme()

  const { cart, cartIsEmpty, cartTotal } = useCart()

  useEffect(() => {
    if (cartIsEmpty) {
      router.push('/cart')
    }
  }, [router, cartIsEmpty])

  useEffect(() => {
    if (cart && !cartIsEmpty && hasMadePaymentIntent.current === false) {
      hasMadePaymentIntent.current = true

      trackEvent({
        name: 'begin_checkout',
        params: {
          item_count: (cart?.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0),
          value: cartTotal.raw,
          currency: 'USD',
        },
      })

      const makeIntent = async () => {
        try {
          const paymentReq = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-payment-intent`,
            {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                items: cart?.items,
                guestEmail: !user && guestEmail ? guestEmail : undefined,
              }),
            },
          )

          const res = await paymentReq.json()

          if (res.error) {
            setError(res.error)
          } else if (res.client_secret) {
            setError(null)
            setClientSecret(res.client_secret)
          }
        } catch (e) {
          setError('Something went wrong.')
        }
      }

      makeIntent()
    }
  }, [cart, user, cartIsEmpty, guestEmail])

  if (!stripe) return null

  return (
    <Fragment>
      {cartIsEmpty && (
        <div>
          {'Your '}
          <Link href="/cart">cart</Link>
          {' is empty.'}
          {typeof productsPage === 'object' && productsPage?.slug && (
            <Fragment>
              {' '}
              <Link href={`/${productsPage.slug}`}>Continue shopping?</Link>
            </Fragment>
          )}
        </div>
      )}
      {!cartIsEmpty && (
        <div className={classes.items}>
          <div className={classes.header}>
            <p>Products</p>
            <div className={classes.headerItemDetails}>
              <p></p>
              <p className={classes.quantity}>Quantity</p>
            </div>
            <p className={classes.subtotal}>Subtotal</p>
          </div>

          <ul>
            {cart?.items?.map((item, index) => {
              if (typeof item.product === 'object') {
                const {
                  quantity,
                  product,
                  product: { title, meta },
                } = item

                if (!quantity) return null

                const metaImage = meta?.image

                return (
                  <Fragment key={index}>
                    <CheckoutItem
                      product={product}
                      title={title}
                      metaImage={metaImage}
                      quantity={quantity}
                      index={index}
                      sku={(item as any)?.sku}
                      variantTitle={(item as any)?.variantTitle}
                    />
                  </Fragment>
                )
              }
              return null
            })}
            <div className={classes.orderTotal}>
              <p>Order Total</p>
              <p>{cartTotal.formatted}</p>
            </div>
          </ul>
        </div>
      )}
      {!clientSecret && !error && (
        <div className={classes.loading}>
          <LoadingShimmer number={2} />
        </div>
      )}
      {!clientSecret && error && (
        <div className={classes.error}>
          <p>{`Stripe not configured or failed (${error}). You can place a test order below:`}</p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            <Button label="Back to cart" href="/cart" appearance="secondary" />
            <Button
              label={isTestSubmitting ? 'Placing Order...' : 'Place Test Order (Mock/COD)'}
              appearance="primary"
              onClick={handleTestCheckout}
              disabled={isTestSubmitting}
            />
          </div>
        </div>
      )}
      {clientSecret && (
        <Fragment>
          <h3 className={classes.payment}>Payment Details</h3>
          {error && <p>{`Error: ${error}`}</p>}
          <Elements
            stripe={stripe}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorText:
                    theme === 'dark' ? cssVariables.colors.base0 : cssVariables.colors.base1000,
                  fontSizeBase: '16px',
                  fontWeightNormal: '500',
                  fontWeightBold: '600',
                  colorBackground:
                    theme === 'dark' ? cssVariables.colors.base850 : cssVariables.colors.base0,
                  fontFamily: 'Inter, sans-serif',
                  colorTextPlaceholder: cssVariables.colors.base500,
                  colorIcon:
                    theme === 'dark' ? cssVariables.colors.base0 : cssVariables.colors.base1000,
                  borderRadius: '0px',
                  colorDanger: cssVariables.colors.error500,
                  colorDangerText: cssVariables.colors.error500,
                },
              },
            }}
          >
            <CheckoutForm />
          </Elements>
        </Fragment>
      )}
    </Fragment>
  )
}
