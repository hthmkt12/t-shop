import React from 'react'
import { Link } from 'react-router-dom'
import { Banner } from 'payload/components'

import { SeedButton } from './SeedButton'

import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>🎨 POD Store Admin & Fulfillment Center</h4>
      </Banner>
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Link
          to="/admin/collections/orders"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '8px 16px',
            backgroundColor: 'var(--theme-elevation-800)',
            color: 'var(--theme-elevation-0)',
            borderRadius: '4px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          📦 Manage POD Orders & Fulfillment →
        </Link>
        <Link
          to="/admin/collections/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '8px 16px',
            backgroundColor: 'var(--theme-elevation-200)',
            color: 'var(--theme-elevation-900)',
            borderRadius: '4px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          👕 Manage POD Catalog & Variants →
        </Link>
      </div>
      Quick Guide & Admin Actions:
      <ul className={`${baseClass}__instructions`}>
        <li>
          <SeedButton />
          {
            ' with realistic POD catalog products (T-Shirt, Hoodie, Mug, Tote Bag) and sample orders, then '
          }
          <a href="/">visit your storefront</a>
          {' to test live customizer.'}
        </li>
        <li>
          <strong>Fulfillment Workflow:</strong> Open any Order to view customer uploaded artwork in
          full resolution, update status (<i>Pending → In Production → Shipped → Delivered</i>), and
          attach carrier tracking numbers.
        </li>
        <li>
          {'Head over to '}
          <a
            href="https://dashboard.stripe.com/test/apikeys"
            target="_blank"
            rel="noopener noreferrer"
          >
            {'Stripe to obtain your API Keys'}
          </a>
          {
            '. Create a new account if needed, then copy them into your environment variables and restart your server.'
          }
        </li>
        <li>
          <Link to="/admin/collections/products">Link each of your products</Link>
          {' to Stripe by selecting the corresponding product using the dropdown under '}
          <i>Product Details</i>.
        </li>
      </ul>
    </div>
  )
}

export default BeforeDashboard
