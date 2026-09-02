import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { cartPage } from './cart-page'
import { home } from './home'
import { image1 } from './image-1'
import { image2 } from './image-2'
import { image3 } from './image-3'
import { podHoodie } from './pod-hoodie'
import { podMug } from './pod-mug'
import { podTote } from './pod-tote'
import { podTshirt } from './pod-tshirt'
import { product2 } from './product-2'
import { productsPage } from './products-page'

const collections = ['categories', 'media', 'pages', 'products']
const globals = ['header', 'settings', 'footer']

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding database...')

  // we need to clear the media directory before seeding
  // as well as the collections and globals
  // this is because while `yarn seed` drops the database
  // the custom `/api/seed` endpoint does not

  payload.logger.info(`— Clearing media...`)

  const mediaDir = path.resolve(__dirname, '../../media')
  if (fs.existsSync(mediaDir)) {
    fs.rmdirSync(mediaDir, { recursive: true })
  }

  payload.logger.info(`— Clearing collections and globals...`)

  // clear the database
  await Promise.all([
    ...collections.map(async collection =>
      payload.delete({
        collection: collection as 'media',
        where: {},
      }),
    ), // eslint-disable-line function-paren-newline
    ...globals.map(async global =>
      payload.updateGlobal({
        slug: global as 'header',
        data: {},
      }),
    ), // eslint-disable-line function-paren-newline
  ])

  payload.logger.info(`— Seeding media...`)

  const [image1Doc, image2Doc, image3Doc] = await Promise.all([
    await payload.create({
      collection: 'media',
      filePath: path.resolve(__dirname, 'image-1.jpg'),
      data: image1,
    }),
    await payload.create({
      collection: 'media',
      filePath: path.resolve(__dirname, 'image-2.jpg'),
      data: image2,
    }),
    await payload.create({
      collection: 'media',
      filePath: path.resolve(__dirname, 'image-3.jpg'),
      data: image3,
    }),
  ])

  let image1ID = image1Doc.id
  let image2ID = image2Doc.id
  let image3ID = image3Doc.id

  if (payload.db.defaultIDType === 'text') {
    image1ID = `"${image1ID}"`
    image2ID = `"${image2ID}"`
    image3ID = `"${image3ID}"`
  }

  payload.logger.info(`— Seeding categories...`)

  const [apparelCategory, drinkwareCategory, accessoriesCategory, ebooksCategory] =
    await Promise.all([
      await payload.create({
        collection: 'categories',
        data: {
          title: 'Apparel & Clothing',
        },
      }),
      await payload.create({
        collection: 'categories',
        data: {
          title: 'Drinkware & Mugs',
        },
      }),
      await payload.create({
        collection: 'categories',
        data: {
          title: 'Bags & Accessories',
        },
      }),
      await payload.create({
        collection: 'categories',
        data: {
          title: 'Digital Goods',
        },
      }),
    ])

  payload.logger.info(`— Seeding products...`)

  // Seed POD Customizer Products
  const tshirtDoc = await payload.create({
    collection: 'products',
    data: JSON.parse(
      JSON.stringify({ ...podTshirt, categories: [apparelCategory.id] }).replace(
        /"\{\{PRODUCT_IMAGE\}\}"/g,
        image1ID,
      ),
    ),
  })

  const hoodieDoc = await payload.create({
    collection: 'products',
    data: JSON.parse(
      JSON.stringify({ ...podHoodie, categories: [apparelCategory.id] }).replace(
        /"\{\{PRODUCT_IMAGE\}\}"/g,
        image1ID,
      ),
    ),
  })

  const mugDoc = await payload.create({
    collection: 'products',
    data: JSON.parse(
      JSON.stringify({ ...podMug, categories: [drinkwareCategory.id] }).replace(
        /"\{\{PRODUCT_IMAGE\}\}"/g,
        image2ID,
      ),
    ),
  })

  const toteDoc = await payload.create({
    collection: 'products',
    data: JSON.parse(
      JSON.stringify({ ...podTote, categories: [accessoriesCategory.id] }).replace(
        /"\{\{PRODUCT_IMAGE\}\}"/g,
        image3ID,
      ),
    ),
  })

  // Legacy digital items
  await payload.create({
    collection: 'products',
    data: JSON.parse(
      JSON.stringify({ ...product2, categories: [ebooksCategory.id] }).replace(
        /"\{\{PRODUCT_IMAGE\}\}"/g,
        image2ID,
      ),
    ),
  })

  // update each product with related products
  await Promise.all([
    await payload.update({
      collection: 'products',
      id: tshirtDoc.id,
      data: {
        relatedProducts: [hoodieDoc.id, mugDoc.id, toteDoc.id],
      },
    }),
    await payload.update({
      collection: 'products',
      id: hoodieDoc.id,
      data: {
        relatedProducts: [tshirtDoc.id, toteDoc.id],
      },
    }),
    await payload.update({
      collection: 'products',
      id: mugDoc.id,
      data: {
        relatedProducts: [toteDoc.id, tshirtDoc.id],
      },
    }),
    await payload.update({
      collection: 'products',
      id: toteDoc.id,
      data: {
        relatedProducts: [tshirtDoc.id, mugDoc.id],
      },
    }),
  ])

  payload.logger.info(`— Seeding products page...`)

  const productsPageDoc = await payload.create({
    collection: 'pages',
    data: productsPage,
  })

  let productsPageID = productsPageDoc.id

  if (payload.db.defaultIDType === 'text') {
    productsPageID = `"${productsPageID}"`
  }

  payload.logger.info(`— Seeding home page...`)

  await payload.create({
    collection: 'pages',
    data: JSON.parse(
      JSON.stringify(home)
        .replace(/"\{\{PRODUCT1_IMAGE\}\}"/g, image1ID)
        .replace(/"\{\{PRODUCT2_IMAGE\}\}"/g, image2ID)
        .replace(/"\{\{PRODUCTS_PAGE_ID\}\}"/g, productsPageID),
    ),
  })

  payload.logger.info(`— Seeding cart page...`)

  await payload.create({
    collection: 'pages',
    data: JSON.parse(
      JSON.stringify(cartPage).replace(/"\{\{PRODUCTS_PAGE_ID\}\}"/g, productsPageID),
    ),
  })

  payload.logger.info(`— Seeding settings...`)

  await payload.updateGlobal({
    slug: 'settings',
    data: {
      productsPage: productsPageDoc.id,
    },
  })

  payload.logger.info(`— Seeding header...`)

  await payload.updateGlobal({
    slug: 'header',
    data: {
      navItems: [
        {
          link: {
            type: 'reference',
            reference: {
              relationTo: 'pages',
              value: productsPageDoc.id,
            },
            label: 'Shop',
          },
        },
      ],
    },
  })

  payload.logger.info(`— Seeding footer...`)

  await payload.updateGlobal({
    slug: 'footer',
    data: {
      copyright: 'Copyright © 2026 T-Shop. All rights reserved.',
      navItems: [
        {
          link: {
            type: 'reference',
            reference: {
              relationTo: 'pages',
              value: productsPageDoc.id,
            },
            label: 'Shop',
          },
        },
      ],
    },
  })

  payload.logger.info(`— Seeding admin user...`)

  await payload.create({
    collection: 'users',
    data: {
      email: 'demo@payloadcms.com',
      password: 'demo',
      roles: ['admin'],
    },
  })

  payload.logger.info('Seeded database successfully!')
}
