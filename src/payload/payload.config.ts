import { webpackBundler } from '@payloadcms/bundler-webpack' // bundler-import
import { mongooseAdapter } from '@payloadcms/db-mongodb' // database-adapter-import
import { payloadCloud } from '@payloadcms/plugin-cloud'
import { cloudStorage } from '@payloadcms/plugin-cloud-storage'
import { s3Adapter } from '@payloadcms/plugin-cloud-storage/s3'
import nestedDocs from '@payloadcms/plugin-nested-docs'
import redirects from '@payloadcms/plugin-redirects'
import seo from '@payloadcms/plugin-seo'
import type { GenerateTitle } from '@payloadcms/plugin-seo/types'
import stripePlugin from '@payloadcms/plugin-stripe'
import { slateEditor } from '@payloadcms/richtext-slate' // editor-import
import dotenv from 'dotenv'
import path from 'path'
import { buildConfig } from 'payload/config'

import Categories from './collections/Categories'
import { Media } from './collections/Media'
import { Orders } from './collections/Orders'
import { Pages } from './collections/Pages'
import Products from './collections/Products'
import Users from './collections/Users'
import BeforeDashboard from './components/BeforeDashboard'
import BeforeLogin from './components/BeforeLogin'
import { createPaymentIntent } from './endpoints/create-payment-intent'
import { customersProxy } from './endpoints/customers'
import { exportProductionBatch } from './endpoints/export-production-batch'
import { productsProxy } from './endpoints/products'
import { renderPodPrint } from './endpoints/render-pod-print'
import { seed } from './endpoints/seed'
import { trackOrder } from './endpoints/track-order'
import { Footer } from './globals/Footer'
import { Header } from './globals/Header'
import { Settings } from './globals/Settings'
import { paymentIntentSucceeded } from './stripe/webhooks/paymentIntentSucceeded'
import { priceUpdated } from './stripe/webhooks/priceUpdated'
import { productUpdated } from './stripe/webhooks/productUpdated'

const generateTitle: GenerateTitle = () => {
  return 'My Store'
}

const mockModulePath = path.resolve(__dirname, './emptyModuleMock.js')

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
})

export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(), // bundler-config
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: [BeforeLogin],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      beforeDashboard: [BeforeDashboard],
    },
    webpack: config => {
      return {
        ...config,
        resolve: {
          ...config.resolve,
          fallback: {
            ...config.resolve?.fallback,
            fs: false,
            os: false,
            util: false,
          },
          alias: {
            ...config.resolve?.alias,
            dotenv: path.resolve(__dirname, './dotenv.js'),
            [path.resolve(__dirname, 'collections/Products/hooks/beforeChange')]: mockModulePath,
            [path.resolve(__dirname, 'collections/Users/hooks/createStripeCustomer')]:
              mockModulePath,
            [path.resolve(__dirname, 'collections/Users/endpoints/customer')]: mockModulePath,
            [path.resolve(__dirname, 'endpoints/create-payment-intent')]: mockModulePath,
            [path.resolve(__dirname, 'endpoints/customers')]: mockModulePath,
            [path.resolve(__dirname, 'endpoints/products')]: mockModulePath,
            [path.resolve(__dirname, 'endpoints/seed')]: mockModulePath,
            [path.resolve(__dirname, 'endpoints/track-order')]: mockModulePath,
            [path.resolve(__dirname, 'endpoints/export-production-batch')]: mockModulePath,
            [path.resolve(__dirname, 'endpoints/render-pod-print')]: mockModulePath,
            fabric: mockModulePath,
            sharp: mockModulePath,
            canvas: mockModulePath,
            archiver: mockModulePath,
            stripe: mockModulePath,
            express: mockModulePath,
          },
        },
      }
    },
  },
  editor: slateEditor({}), // editor-config
  // database-adapter-config-start
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
  }),
  // database-adapter-config-end
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  ...(process.env.SMTP_HOST
    ? {
        email: {
          fromName: process.env.SMTP_FROM_NAME || 'T-Shop POD',
          fromAddress: process.env.SMTP_FROM_ADDRESS || 'orders@t-shop.com',
          transportOptions: {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            auth: {
              user: process.env.SMTP_USER || '',
              pass: process.env.SMTP_PASS || '',
            },
          },
        },
      }
    : {
        email: {
          fromName: 'T-Shop POD',
          fromAddress: 'orders@t-shop.com',
          logMockCredentials: false,
        },
      }),
  collections: [Pages, Products, Orders, Media, Categories, Users],
  globals: [Settings, Header, Footer],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  cors: ['https://checkout.stripe.com', process.env.PAYLOAD_PUBLIC_SERVER_URL || ''].filter(
    Boolean,
  ),
  csrf: ['https://checkout.stripe.com', process.env.PAYLOAD_PUBLIC_SERVER_URL || ''].filter(
    Boolean,
  ),
  endpoints: [
    {
      path: '/create-payment-intent',
      method: 'post',
      handler: createPaymentIntent,
    },
    {
      path: '/stripe/customers',
      method: 'get',
      handler: customersProxy,
    },
    {
      path: '/stripe/products',
      method: 'get',
      handler: productsProxy,
    },
    // The seed endpoint is used to populate the database with some example data
    // You should delete this endpoint before deploying your site to production
    {
      path: '/seed',
      method: 'get',
      handler: seed,
    },
    {
      path: '/track-order',
      method: 'get',
      handler: trackOrder,
    },
    {
      path: '/export-production-batch',
      method: 'get',
      handler: exportProductionBatch,
    },
    {
      path: '/render-pod-print',
      method: 'post',
      handler: renderPodPrint,
    },
  ],
  plugins: [
    stripePlugin({
      stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
      isTestKey: Boolean(process.env.PAYLOAD_PUBLIC_STRIPE_IS_TEST_KEY),
      stripeWebhooksEndpointSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET,
      rest: false,
      webhooks: {
        'product.created': productUpdated,
        'product.updated': productUpdated,
        'price.updated': priceUpdated,
        'payment_intent.succeeded': paymentIntentSucceeded,
      },
    }),
    redirects({
      collections: ['pages', 'products'],
    }),
    nestedDocs({
      collections: ['categories'],
    }),
    seo({
      collections: ['pages', 'products'],
      generateTitle,
      uploadsCollection: 'media',
    }),
    ...(process.env.S3_BUCKET
      ? [
          cloudStorage({
            collections: {
              media: {
                adapter: s3Adapter({
                  config: {
                    endpoint: process.env.S3_ENDPOINT,
                    region: process.env.S3_REGION || 'auto',
                    credentials: {
                      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
                      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
                    },
                    forcePathStyle: Boolean(process.env.S3_FORCE_PATH_STYLE === 'true'),
                  },
                  bucket: process.env.S3_BUCKET,
                }),
                generateFileURL: ({ filename }) => {
                  if (process.env.S3_PUBLIC_DOMAIN) {
                    return `${process.env.S3_PUBLIC_DOMAIN.replace(/\/$/, '')}/${filename}`
                  }
                  if (process.env.S3_ENDPOINT && process.env.S3_BUCKET) {
                    return `${process.env.S3_ENDPOINT.replace(/\/$/, '')}/${
                      process.env.S3_BUCKET
                    }/${filename}`
                  }
                  return `/media/${filename}`
                },
              },
            },
          }),
        ]
      : []),
    payloadCloud(),
  ],
})
