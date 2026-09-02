'use client'

import React, { useState } from 'react'
import Link from 'next/link'

import { Button } from '../../../_components/Button'
import { HR } from '../../../_components/HR'
import { Media } from '../../../_components/Media'

import classes from './index.module.scss'

const statusMap: Record<string, { label: string; color: string; bg: string; description: string }> =
  {
    pending: {
      label: 'Order Placed & Awaiting Print Queue',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
      description: 'Your design has been received and is queued for pre-flight print check.',
    },
    in_production: {
      label: 'In Production (DTG Printing & Curing)',
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.1)',
      description:
        'Your custom product is currently on the print bed and undergoing quality inspection.',
    },
    shipped: {
      label: 'Shipped & In Transit',
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.1)',
      description: 'Your package is on its way with the carrier.',
    },
    delivered: {
      label: 'Successfully Delivered',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
      description: 'Package has been delivered to the shipping destination.',
    },
    cancelled: {
      label: 'Order Cancelled',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)',
      description: 'This order has been cancelled.',
    },
  }

export const TrackOrderClient: React.FC = () => {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderData, setOrderData] = useState<any | null>(null)

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId.trim()) {
      setError('Please enter your Order ID.')
      return
    }

    setLoading(true)
    setError(null)
    setOrderData(null)

    try {
      const queryParams = new URLSearchParams({
        orderId: orderId.trim(),
        ...(email.trim() ? { email: email.trim() } : {}),
      })

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/track-order?${queryParams}`,
      )
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Could not find order. Please check ID.')
      }

      setOrderData(data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch order status')
    } finally {
      setLoading(false)
    }
  }

  const fulfillment = orderData && (statusMap[orderData.fulfillmentStatus] || statusMap.pending)

  return (
    <div className={classes.trackContainer}>
      <div className={classes.heroHeader}>
        <span className={classes.badge}>Real-Time POD Tracking</span>
        <h1 className={classes.title}>Track Your Custom Order</h1>
        <p className={classes.subtitle}>
          Enter your Order ID and optional email to check live DTG print status and carrier
          tracking.
        </p>
      </div>

      <form onSubmit={handleLookup} className={classes.searchCard}>
        <div className={classes.inputRow}>
          <div className={classes.inputGroup}>
            <label htmlFor="orderId" className={classes.label}>
              Order ID <span className={classes.required}>*</span>
            </label>
            <input
              id="orderId"
              type="text"
              placeholder="e.g. 64bfe17..."
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              className={classes.input}
              required
            />
          </div>

          <div className={classes.inputGroup}>
            <label htmlFor="email" className={classes.label}>
              Account / Billing Email (Optional)
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={classes.input}
            />
          </div>
        </div>

        {error && <div className={classes.errorMessage}>{error}</div>}

        <button type="submit" disabled={loading} className={classes.trackButton}>
          {loading ? 'Searching Print Database...' : '🔍 Track Order Status'}
        </button>
      </form>

      {orderData && (
        <div className={classes.resultCard}>
          <div className={classes.resultHeader}>
            <div>
              <h2 className={classes.resultTitle}>Order #{orderData.id}</h2>
              <p className={classes.resultDate}>
                Placed on:{' '}
                {new Date(orderData.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div
              className={classes.statusTag}
              style={{
                color: fulfillment.color,
                backgroundColor: fulfillment.bg,
                borderColor: fulfillment.color,
              }}
            >
              <span className={classes.statusDot} style={{ backgroundColor: fulfillment.color }} />
              {fulfillment.label}
            </div>
          </div>

          <div className={classes.statusBanner} style={{ borderColor: fulfillment.color }}>
            <p className={classes.statusDesc}>{fulfillment.description}</p>
            {orderData.trackingNumber && (
              <div className={classes.trackingDetails}>
                <strong>Carrier:</strong> {orderData.trackingCarrier || 'Standard Delivery'} |{' '}
                <strong>Tracking #:</strong>{' '}
                <span className={classes.trackingCode}>{orderData.trackingNumber}</span>
              </div>
            )}
          </div>

          {orderData.shippingAddress && (
            <div className={classes.shippingInfo}>
              <h4>📍 Delivery Destination</h4>
              <p>
                {orderData.shippingAddress.recipientName} •{' '}
                {[
                  orderData.shippingAddress.city,
                  orderData.shippingAddress.state,
                  orderData.shippingAddress.country,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>
          )}

          <HR />

          <div className={classes.itemsSection}>
            <h3>Items in this Order ({orderData.items?.length || 0})</h3>
            <div className={classes.itemsList}>
              {orderData.items?.map((item: any, idx: number) => (
                <div key={idx} className={classes.itemRow}>
                  {item.productImage && (
                    <div className={classes.itemThumbWrapper}>
                      <Media
                        resource={item.productImage}
                        className={classes.itemThumb}
                        imgClassName={classes.itemImg}
                      />
                    </div>
                  )}
                  <div className={classes.itemDetails}>
                    <h4 className={classes.productTitle}>
                      {item.productSlug ? (
                        <Link href={`/products/${item.productSlug}`}>{item.productTitle}</Link>
                      ) : (
                        item.productTitle
                      )}
                    </h4>
                    {item.variantTitle && (
                      <p className={classes.variantInfo}>
                        Variant: {item.variantTitle} {item.sku ? `(${item.sku})` : ''}
                      </p>
                    )}
                    {item.customDesignUrl && (
                      <div className={classes.artworkBadge}>
                        <span>🎨 Custom Artwork:</span>
                        <a
                          href={item.customDesignUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={classes.artworkLink}
                        >
                          <img
                            src={item.customDesignUrl}
                            alt="Custom print"
                            className={classes.artworkThumb}
                          />
                          View Design File ↗
                        </a>
                      </div>
                    )}
                    {item.customText && (
                      <p className={classes.customText}>
                        Custom Text: &ldquo;{item.customText}&rdquo;
                      </p>
                    )}
                    <p className={classes.itemQtyPrice}>
                      Quantity: <strong>{item.quantity}</strong> • Total: $
                      {(((item.price || 0) * (item.quantity || 1)) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={classes.orderFooter}>
            <div className={classes.orderTotal}>
              <span>Order Total Paid:</span>
              <strong>${((orderData.total || 0) / 100).toFixed(2)} USD</strong>
            </div>
            <Button href="/products" appearance="secondary" label="Continue Shopping" />
          </div>
        </div>
      )}
    </div>
  )
}
