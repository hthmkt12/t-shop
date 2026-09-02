import type { CollectionConfig } from 'payload/types'

import { admins } from '../../access/admins'
import { adminsOrLoggedIn } from '../../access/adminsOrLoggedIn'
import { adminsOrOrderedBy } from './access/adminsOrOrderedBy'
import { clearUserCart } from './hooks/clearUserCart'
import { populateOrderedBy } from './hooks/populateOrderedBy'
import { recalculateTotal } from './hooks/recalculateTotal'
import { updateProductStock } from './hooks/updateProductStock'
import { updateUserPurchases } from './hooks/updateUserPurchases'
import { LinkToPaymentIntent } from './ui/LinkToPaymentIntent'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'createdAt',
    defaultColumns: ['createdAt', 'orderedBy', 'total', 'items'],
    preview: doc => `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/orders/${doc.id}`,
  },
  hooks: {
    beforeChange: [recalculateTotal],
    afterChange: [updateUserPurchases, clearUserCart, updateProductStock],
  },
  access: {
    read: adminsOrOrderedBy,
    update: admins,
    create: adminsOrLoggedIn,
    delete: admins,
  },
  fields: [
    {
      name: 'orderedBy',
      type: 'relationship',
      relationTo: 'users',
      hooks: {
        beforeChange: [populateOrderedBy],
      },
    },
    {
      name: 'stripePaymentIntentID',
      label: 'Stripe Payment Intent ID',
      type: 'text',
      admin: {
        position: 'sidebar',
        components: {
          Field: LinkToPaymentIntent,
        },
      },
    },
    {
      name: 'fulfillmentStatus',
      label: 'Fulfillment Status',
      type: 'select',
      defaultValue: 'pending',
      required: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'In Production', value: 'in_production' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Manual print-on-demand production/shipping status',
      },
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'sku',
          label: 'Variant SKU',
          type: 'text',
        },
        {
          name: 'variantTitle',
          label: 'Variant Name',
          type: 'text',
        },
        {
          name: 'price',
          type: 'number',
          min: 0,
        },
        {
          name: 'quantity',
          type: 'number',
          min: 0,
        },
      ],
    },
    {
      name: 'shippingAddress',
      label: 'Shipping Address',
      type: 'group',
      admin: {
        description: 'Where the printed order should be shipped (filled manually or from checkout)',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'recipientName', label: 'Recipient Name', type: 'text' },
            { name: 'phone', label: 'Phone', type: 'text' },
          ],
        },
        { name: 'line1', label: 'Address Line 1', type: 'text' },
        { name: 'line2', label: 'Address Line 2', type: 'text' },
        {
          type: 'row',
          fields: [
            { name: 'city', label: 'City', type: 'text' },
            { name: 'state', label: 'State/Province', type: 'text' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'postalCode', label: 'Postal Code', type: 'text' },
            { name: 'country', label: 'Country', type: 'text' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'trackingCarrier',
          label: 'Tracking Carrier',
          type: 'text',
          admin: {
            condition: data => ['shipped', 'delivered'].includes(data?.fulfillmentStatus),
          },
        },
        {
          name: 'trackingNumber',
          label: 'Tracking Number',
          type: 'text',
          admin: {
            condition: data => ['shipped', 'delivered'].includes(data?.fulfillmentStatus),
          },
        },
      ],
    },
    {
      name: 'productionNotes',
      label: 'Production Notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes for print production (not shown to customer)',
      },
    },
  ],
}
