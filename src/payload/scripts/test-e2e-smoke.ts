/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'assert'
import { paymentIntentSucceeded } from '../stripe/webhooks/paymentIntentSucceeded'
import { updateProductStock } from '../collections/Orders/hooks/updateProductStock'
import { trackOrder } from '../endpoints/track-order'

async function runE2ESmokeTest(): Promise<void> {
  console.log('🧪 [E2E SMOKE] Starting End-to-End Mock Transaction Suite...\n')

  // Mock DB State
  const mockProducts: Record<string, any> = {
    'prod-tshirt-1': {
      id: 'prod-tshirt-1',
      title: 'Custom POD T-Shirt',
      enableVariants: true,
      variants: [
        { sku: 'TSHIRT-BLK-M', title: 'Black / M', price: 2900, stock: 15 },
        { sku: 'TSHIRT-WHT-L', title: 'White / L', price: 2900, stock: 5 },
      ],
    },
  }

  const mockUsers: Record<string, any> = {
    'user-guest-like': {
      id: 'user-guest-like',
      email: 'customer@example.com',
      stripeCustomerID: 'cus_mock_guest_123',
      cart: {
        items: [
          {
            product: 'prod-tshirt-1',
            sku: 'TSHIRT-BLK-M',
            variantTitle: 'Black / M',
            customDesignUrl: 'https://r2.tshop.com/designs/custom-art-1.png',
            customText: 'Aki POD 2026',
            quantity: 2,
          },
        ],
      },
    },
  }

  const mockOrders: any[] = []

  const mockPayload: any = {
    logger: {
      info: (msg: string) => console.log(`    [Payload Info] ${msg}`),
      warn: (msg: string) => console.log(`    [Payload Warn] ${msg}`),
      error: (msg: string) => console.error(`    [Payload Error] ${msg}`),
    },
    find: async ({ collection, where }: any) => {
      if (collection === 'orders') {
        const targetPi = where?.stripePaymentIntentID?.equals
        const matched = mockOrders.filter(o => o.stripePaymentIntentID === targetPi)
        return { totalDocs: matched.length, docs: matched }
      }
      if (collection === 'users') {
        const targetCus = where?.stripeCustomerID?.equals
        const matched = Object.values(mockUsers).filter(u => u.stripeCustomerID === targetCus)
        return { totalDocs: matched.length, docs: matched }
      }
      return { totalDocs: 0, docs: [] }
    },
    findByID: async ({ collection, id, depth }: any) => {
      if (collection === 'products') return mockProducts[id] || null
      if (collection === 'users') return mockUsers[id] || null
      if (collection === 'orders') {
        const o = mockOrders.find(order => order.id === id)
        if (!o) return null
        if (depth && depth > 0 && typeof o.orderedBy === 'string') {
          return {
            ...o,
            orderedBy: mockUsers[o.orderedBy] || o.orderedBy,
          }
        }
        return o
      }
      return null
    },
    create: async ({ collection, data }: any) => {
      if (collection === 'orders') {
        const newOrder = {
          id: `ord_${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...data,
        }
        mockOrders.push(newOrder)
        return newOrder
      }
      return data
    },
    update: async ({ collection, id, data }: any) => {
      if (collection === 'products') {
        mockProducts[id] = { ...mockProducts[id], ...data }
        return mockProducts[id]
      }
      return data
    },
  }

  // Step 1: Simulate Stripe Webhook - payment_intent.succeeded
  console.log('▶ Step 1: Processing Stripe Webhook for successful payment...')
  const mockWebhookEvent: any = {
    event: {
      data: {
        object: {
          id: 'pi_mock_e2e_999',
          customer: 'cus_mock_guest_123',
          amount: 5800, // 2900 * 2
          receipt_email: 'customer@example.com',
        },
      },
    },
    payload: mockPayload,
  }

  await paymentIntentSucceeded(mockWebhookEvent)

  assert.strictEqual(mockOrders.length, 1, 'Order must be created in DB via webhook')
  const createdOrder = mockOrders[0]
  assert.strictEqual(createdOrder.total, 5800, 'Order total must match PaymentIntent amount')
  assert.strictEqual(createdOrder.items.length, 1, 'Order must contain cart items')
  assert.strictEqual(
    createdOrder.items[0].customDesignUrl,
    'https://r2.tshop.com/designs/custom-art-1.png',
    'Custom artwork URL must be preserved',
  )
  console.log(`  ✅ Order #${createdOrder.id} created with verified total $58.00\n`)

  // Step 2: Trigger Inventory Decrement Hook
  console.log('▶ Step 2: Triggering stock reduction hook...')
  await updateProductStock({
    doc: createdOrder,
    req: { payload: mockPayload } as any,
    operation: 'create',
  } as any)

  const updatedProduct = mockProducts['prod-tshirt-1']
  const updatedVariant = updatedProduct.variants.find((v: any) => v.sku === 'TSHIRT-BLK-M')
  assert.strictEqual(updatedVariant.stock, 13, 'Variant stock should decrease from 15 to 13')
  console.log(
    `  ✅ Variant TSHIRT-BLK-M stock correctly decremented: 15 -> ${updatedVariant.stock}\n`,
  )

  // Step 3: Public Dual-Key Order Tracking API
  console.log('▶ Step 3: Verifying dual-key Order Tracking endpoint...')

  // Subtest 3.1: Reject mismatch email
  let forbiddenCaught = false
  const mockRes31: any = {
    status: (code: number) => {
      if (code === 403) forbiddenCaught = true
      return {
        json: (data: any) => data,
      }
    },
  }
  await (trackOrder as any)(
    {
      query: { orderId: createdOrder.id, email: 'hacker@example.com' },
      payload: mockPayload,
    } as any,
    mockRes31,
  )
  assert.ok(forbiddenCaught, 'Tracking must be forbidden for wrong email')
  console.log('  ✅ Access denied (403) for incorrect email lookup')

  // Subtest 3.2: Allowed matching email with sanitized payload
  let trackingPayload: any = null
  const mockRes32: any = {
    status: (code: number) => {
      assert.strictEqual(code, 200, 'Tracking should succeed for matching email')
      return {
        json: (data: any) => {
          trackingPayload = data
          return data
        },
      }
    },
  }
  await (trackOrder as any)(
    {
      query: { orderId: createdOrder.id, email: 'customer@example.com' },
      payload: mockPayload,
    } as any,
    mockRes32,
  )
  assert.ok(trackingPayload, 'Tracking payload must be returned')
  assert.strictEqual(trackingPayload.id, createdOrder.id, 'Order ID must match')
  assert.strictEqual(
    trackingPayload.fulfillmentStatus,
    'in_production',
    'Fulfillment status must match',
  )
  assert.strictEqual(
    trackingPayload.items[0].customText,
    'Aki POD 2026',
    'Customization text must be visible in customer tracking',
  )
  console.log('  ✅ Tracking details retrieved successfully with sanitized artwork metadata\n')

  console.log('🎉 ALL END-TO-END SMOKE TESTS PASSED CLEANLY!')
}

runE2ESmokeTest().catch(err => {
  console.error('❌ E2E Smoke test failed:', err)
  process.exit(1)
})
