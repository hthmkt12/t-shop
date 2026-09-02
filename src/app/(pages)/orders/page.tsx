import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Order } from '../../../payload/payload-types'
import { Button } from '../../_components/Button'
import { Gutter } from '../../_components/Gutter'
import { HR } from '../../_components/HR'
import { RenderParams } from '../../_components/RenderParams'
import { formatDateTime } from '../../_utilities/formatDateTime'
import { getMeUser } from '../../_utilities/getMeUser'
import { mergeOpenGraph } from '../../_utilities/mergeOpenGraph'

import classes from './index.module.scss'

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  in_production: { label: 'In Production', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  shipped: { label: 'Shipped', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  delivered: { label: 'Delivered', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
}

export default async function Orders() {
  const { token } = await getMeUser({
    nullUserRedirect: `/login?error=${encodeURIComponent(
      'You must be logged in to view your orders.',
    )}&redirect=${encodeURIComponent('/orders')}`,
  })

  let orders: Order[] | null = null

  try {
    orders = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`,
      },
      cache: 'no-store',
    })
      ?.then(async res => {
        if (!res.ok) notFound()
        const json = await res.json()
        if ('error' in json && json.error) notFound()
        if ('errors' in json && json.errors) notFound()
        return json
      })
      ?.then(json => json.docs)
  } catch (error) {
    // console.error(error)
  }

  return (
    <Gutter className={classes.orders}>
      <h1>My Orders</h1>
      {(!orders || !Array.isArray(orders) || orders?.length === 0) && (
        <p className={classes.noOrders}>You have no orders.</p>
      )}
      <RenderParams />
      {orders && orders.length > 0 && (
        <ul className={classes.ordersList}>
          {orders?.map((order, index) => {
            const fulfillment = statusMap[order.fulfillmentStatus || 'pending'] || statusMap.pending

            return (
              <li key={order.id} className={classes.listItem}>
                <Link className={classes.item} href={`/orders/${order.id}`}>
                  <div className={classes.itemContent}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <h4
                        className={classes.itemTitle}
                        style={{ margin: 0 }}
                      >{`Order #${order.id}`}</h4>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          color: fulfillment.color,
                          backgroundColor: fulfillment.bg,
                          border: `1px solid ${fulfillment.color}`,
                        }}
                      >
                        {fulfillment.label}
                      </span>
                    </div>
                    <div className={classes.itemMeta}>
                      <p>{`Ordered On: ${formatDateTime(order.createdAt)}`}</p>
                      {order.trackingNumber && (
                        <p style={{ color: 'var(--theme-brand)', fontSize: '13px' }}>
                          Tracking: {order.trackingCarrier ? `${order.trackingCarrier} ` : ''}
                          {order.trackingNumber}
                        </p>
                      )}
                      <p>
                        {'Total: '}
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'usd',
                        }).format(order.total / 100)}
                      </p>
                    </div>
                  </div>
                  <Button
                    appearance="secondary"
                    label="View Order"
                    className={classes.button}
                    el="button"
                  />
                </Link>
                {index !== orders.length - 1 && <HR />}
              </li>
            )
          })}
        </ul>
      )}
      <HR />
      <Button href="/account" appearance="primary" label="Go to account" />
    </Gutter>
  )
}

export const metadata: Metadata = {
  title: 'Orders',
  description: 'Your orders.',
  openGraph: mergeOpenGraph({
    title: 'Orders',
    url: '/orders',
  }),
}
