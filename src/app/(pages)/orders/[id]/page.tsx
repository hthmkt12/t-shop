import React, { Fragment } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Order } from '../../../../payload/payload-types'
import { Button } from '../../../_components/Button'
import { Gutter } from '../../../_components/Gutter'
import { HR } from '../../../_components/HR'
import { Media } from '../../../_components/Media'
import { Price } from '../../../_components/Price'
import { SERVER_URL } from '../../../_api/shared'
import { formatDateTime } from '../../../_utilities/formatDateTime'
import { getMeUser } from '../../../_utilities/getMeUser'
import { mergeOpenGraph } from '../../../_utilities/mergeOpenGraph'

import classes from './index.module.scss'

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending Production', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  in_production: {
    label: 'In Production (Printing)',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.1)',
  },
  shipped: { label: 'Shipped (In Transit)', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  delivered: { label: 'Delivered', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
}

export default async function Order({ params: { id } }) {
  const { token } = await getMeUser({
    nullUserRedirect: `/login?error=${encodeURIComponent(
      'You must be logged in to view this order.',
    )}&redirect=${encodeURIComponent(`/order/${id}`)}`,
  })

  let order: Order | null = null

  try {
    order = await fetch(`${SERVER_URL}/api/orders/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`,
      },
      cache: 'no-store',
    })?.then(async res => {
      if (!res.ok) notFound()
      const json = await res.json()
      if ('error' in json && json.error) notFound()
      if ('errors' in json && json.errors) notFound()
      return json
    })
  } catch (error) {
    console.error(error) // eslint-disable-line no-console
  }

  if (!order) {
    notFound()
  }

  const fulfillment = statusMap[order.fulfillmentStatus || 'pending'] || statusMap.pending

  return (
    <Gutter className={classes.orders}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <h1>
          {`Order `}
          <span className={classes.id}>{`#${order.id}`}</span>
        </h1>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 600,
            color: fulfillment.color,
            backgroundColor: fulfillment.bg,
            border: `1px solid ${fulfillment.color}`,
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: fulfillment.color,
            }}
          />
          {fulfillment.label}
        </div>
      </div>

      <div className={classes.itemMeta}>
        <p>{`ID: ${order.id}`}</p>
        <p>{`Payment Intent: ${order.stripePaymentIntentID || 'Verified'}`}</p>
        <p>{`Ordered On: ${formatDateTime(order.createdAt)}`}</p>
        {order.trackingNumber && (
          <p style={{ color: 'var(--theme-brand)', fontWeight: 600 }}>
            🚚 Tracking: {order.trackingCarrier ? `${order.trackingCarrier} - ` : ''}
            {order.trackingNumber}
          </p>
        )}
        <p className={classes.total}>
          {'Total: '}
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'usd',
          }).format(order.total / 100)}
        </p>
      </div>

      {order.shippingAddress && (
        <div
          style={{
            marginTop: '16px',
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: 'var(--pod-surface-1)',
            border: '1px solid var(--pod-border)',
          }}
        >
          <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: 'var(--theme-text)' }}>
            📦 Shipping Destination
          </h4>
          <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600 }}>
            {order.shippingAddress.recipientName || 'Customer'}
            {order.shippingAddress.phone ? ` • ${order.shippingAddress.phone}` : ''}
          </p>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--theme-text-soft)' }}>
            {[
              order.shippingAddress.line1,
              order.shippingAddress.line2,
              order.shippingAddress.city,
              order.shippingAddress.state,
              order.shippingAddress.postalCode,
              order.shippingAddress.country,
            ]
              .filter(Boolean)
              .join(', ')}
          </p>
        </div>
      )}

      <HR />

      <div className={classes.order}>
        <h4 className={classes.orderItems}>Items in Production</h4>
        {order.items?.map((item, index) => {
          if (typeof item.product === 'object') {
            const {
              quantity,
              product,
              product: { id: prodId, title, meta, stripeProductID },
            } = item

            const isLast = index === (order?.items?.length || 0) - 1
            const metaImage = meta?.image

            return (
              <Fragment key={index}>
                <div className={classes.row}>
                  <Link href={`/products/${product.slug}`} className={classes.mediaWrapper}>
                    {!metaImage && <span className={classes.placeholder}>No image</span>}
                    {metaImage && typeof metaImage !== 'string' && (
                      <Media
                        className={classes.media}
                        imgClassName={classes.image}
                        resource={metaImage}
                        fill
                      />
                    )}
                  </Link>
                  <div className={classes.rowContent}>
                    {!stripeProductID && (
                      <p className={classes.warning}>
                        {'This product is not yet connected to Stripe. To link this product, '}
                        <Link
                          href={`${process.env.NEXT_PUBLIC_SERVER_URL}/admin/collections/products/${prodId}`}
                        >
                          edit this product in the admin panel
                        </Link>
                        {'.'}
                      </p>
                    )}
                    <h5 className={classes.title}>
                      <Link href={`/products/${product.slug}`} className={classes.titleLink}>
                        {title}
                      </Link>
                    </h5>
                    {(item as any)?.variantTitle && (
                      <p
                        style={{
                          fontSize: '14px',
                          color: 'var(--theme-text-soft)',
                          marginTop: '-4px',
                          marginBottom: '6px',
                        }}
                      >
                        Option: {(item as any)?.variantTitle}{' '}
                        {(item as any)?.sku ? `(${(item as any)?.sku})` : ''}
                      </p>
                    )}
                    {(item as any)?.customDesignUrl && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '6px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'var(--theme-brand)',
                          }}
                        >
                          🎨 Custom Print:
                        </span>
                        <a
                          href={(item as any).customDesignUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <img
                            src={(item as any).customDesignUrl}
                            alt="Custom artwork"
                            style={{
                              width: '32px',
                              height: '32px',
                              objectFit: 'contain',
                              borderRadius: '4px',
                              border: '1px solid var(--pod-border)',
                              backgroundColor: '#121118',
                            }}
                          />
                          <span
                            style={{
                              fontSize: '12px',
                              color: 'var(--theme-brand)',
                              textDecoration: 'underline',
                            }}
                          >
                            View Artwork
                          </span>
                        </a>
                      </div>
                    )}
                    {(item as any)?.customText && (
                      <p
                        style={{
                          fontSize: '13px',
                          color: 'var(--pod-accent-500)',
                          fontWeight: 600,
                          marginBottom: '6px',
                        }}
                      >
                        Custom Text: &ldquo;{(item as any).customText}&rdquo;
                      </p>
                    )}
                    <p>{`Quantity: ${quantity}`}</p>
                    {(item as any)?.price ? (
                      <p>{`Price: ${(((item as any).price * quantity) / 100).toLocaleString(
                        'en-US',
                        {
                          style: 'currency',
                          currency: 'USD',
                        },
                      )}`}</p>
                    ) : (
                      <Price product={product} button={false} quantity={quantity} />
                    )}
                  </div>
                </div>
                {!isLast && <HR />}
              </Fragment>
            )
          }

          return null
        })}
      </div>
      <HR />
      <div className={classes.actions}>
        <Button href="/orders" appearance="primary" label="See all orders" />
        <Button href="/account" appearance="secondary" label="Go to account" />
      </div>
    </Gutter>
  )
}

export async function generateMetadata({ params: { id } }): Promise<Metadata> {
  return {
    title: `Order ${id}`,
    description: `Order details for order ${id}.`,
    openGraph: mergeOpenGraph({
      title: `Order ${id}`,
      url: `/orders/${id}`,
    }),
  }
}
