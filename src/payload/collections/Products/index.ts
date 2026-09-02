import type { CollectionConfig } from 'payload/types'

import { admins } from '../../access/admins'
import { Archive } from '../../blocks/ArchiveBlock'
import { CallToAction } from '../../blocks/CallToAction'
import { Content } from '../../blocks/Content'
import { MediaBlock } from '../../blocks/MediaBlock'
import { slugField } from '../../fields/slug'
import { populateArchiveBlock } from '../../hooks/populateArchiveBlock'
import { checkUserPurchases } from './access/checkUserPurchases'
import { beforeProductChange } from './hooks/beforeChange'
import { deleteProductFromCarts } from './hooks/deleteProductFromCarts'
import { populatePrice } from './hooks/populatePrice'
import { revalidateProduct } from './hooks/revalidateProduct'
import { ProductSelect } from './ui/ProductSelect'

const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'stripeProductID', '_status'],
    preview: doc => {
      return `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/next/preview?url=${encodeURIComponent(
        `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/products/${doc.slug}`,
      )}&secret=${process.env.PAYLOAD_PUBLIC_DRAFT_SECRET}`
    },
  },
  hooks: {
    beforeChange: [beforeProductChange],
    afterChange: [revalidateProduct],
    afterRead: [populateArchiveBlock],
    afterDelete: [deleteProductFromCarts],
  },
  versions: {
    drafts: true,
  },
  access: {
    read: () => true,
    create: admins,
    update: admins,
    delete: admins,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'price',
      label: 'Base Price (in cents/VND)',
      type: 'number',
      min: 0,
      hooks: {
        beforeChange: [populatePrice],
      },
      admin: {
        description: 'Product price in cents for filtering and sorting',
      },
    },
    {
      name: 'publishedOn',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock, Archive],
            },
          ],
        },
        {
          label: 'Product Details',
          fields: [
            {
              name: 'stripeProductID',
              label: 'Stripe Product',
              type: 'text',
              admin: {
                components: {
                  Field: ProductSelect,
                },
              },
            },
            {
              name: 'priceJSON',
              label: 'Price JSON',
              type: 'textarea',
              admin: {
                readOnly: true,
                hidden: true,
                rows: 10,
              },
            },
            {
              name: 'productType',
              label: 'Product Type (Print-on-Demand)',
              type: 'select',
              defaultValue: 'tshirt',
              options: [
                { label: 'T-Shirt', value: 'tshirt' },
                { label: 'Hoodie', value: 'hoodie' },
                { label: 'Mug', value: 'mug' },
                { label: 'Tote Bag', value: 'tote' },
                { label: 'Poster', value: 'poster' },
                { label: 'Sticker', value: 'sticker' },
                { label: 'Phone Case', value: 'phonecase' },
              ],
              admin: {
                description: 'Base blank product the design is printed on',
              },
            },
            {
              name: 'enableVariants',
              label: 'Enable Variants',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'stock',
              label: 'Stock Quantity (Default)',
              type: 'number',
              defaultValue: 10,
              min: 0,
              admin: {
                condition: (data, siblingData) => !siblingData?.enableVariants,
              },
            },
            {
              name: 'variants',
              label: 'Product Variants',
              type: 'array',
              admin: {
                condition: (data, siblingData) => Boolean(siblingData?.enableVariants),
              },
              fields: [
                {
                  name: 'sku',
                  label: 'SKU',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'title',
                  label: 'Variant Name (e.g. Size M / Black)',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'size',
                  label: 'Size',
                  type: 'select',
                  options: [
                    { label: 'S', value: 's' },
                    { label: 'M', value: 'm' },
                    { label: 'L', value: 'l' },
                    { label: 'XL', value: 'xl' },
                  ],
                },
                {
                  name: 'color',
                  label: 'Color',
                  type: 'text',
                },
                {
                  name: 'colorHex',
                  label: 'Color Swatch (hex)',
                  type: 'text',
                  admin: {
                    description:
                      'Hex code (e.g. #131118) used to render the color swatch on the storefront',
                  },
                },
                {
                  name: 'price',
                  label: 'Price in Cents / VND (Optional Override)',
                  type: 'number',
                  min: 0,
                },
                {
                  name: 'stock',
                  label: 'Stock Quantity',
                  type: 'number',
                  defaultValue: 10,
                  min: 0,
                },
              ],
            },
            {
              name: 'enablePaywall',
              label: 'Enable Paywall',
              type: 'checkbox',
            },
            {
              name: 'paywall',
              label: 'Paywall',
              type: 'blocks',
              access: {
                read: checkUserPurchases,
              },
              blocks: [CallToAction, Content, MediaBlock, Archive],
            },
          ],
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'relatedProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      filterOptions: ({ id }) => {
        return {
          id: {
            not_in: [id],
          },
        }
      },
    },
    slugField(),
    {
      name: 'skipSync',
      label: 'Skip Sync',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
        readOnly: true,
        hidden: true,
      },
    },
  ],
}

export default Products
