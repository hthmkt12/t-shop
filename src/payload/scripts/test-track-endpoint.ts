/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type */
import assert from 'assert'
import { trackOrder } from '../endpoints/track-order'

async function runTrackOrderTests(): Promise<void> {
  console.log('🧪 [TEST 2] Testing /api/track-order endpoint logic...')

  // Case 1: Missing orderId
  let statusResult = 0
  let jsonResult: any = null
  const resMock1: any = {
    status: (s: number) => {
      statusResult = s
      return resMock1
    },
    json: (j: any) => {
      jsonResult = j
    },
  }

  await trackOrder({ query: {}, payload: { logger: { error: () => {} } } } as any, resMock1)
  assert.strictEqual(statusResult, 400)
  assert.strictEqual(jsonResult?.error, 'orderId parameter is required')
  console.log('  ✅ Pass: rejected missing orderId with 400')

  // Case 2: Order not found
  const resMock2: any = {
    status: (s: number) => {
      statusResult = s
      return resMock2
    },
    json: (j: any) => {
      jsonResult = j
    },
  }

  await trackOrder(
    {
      query: { orderId: 'non_existent_id' },
      payload: {
        findByID: async () => null,
        logger: { error: () => {} },
      },
    } as any,
    resMock2,
  )
  assert.strictEqual(statusResult, 404)
  assert.strictEqual(jsonResult?.error, 'Order not found with provided ID')
  console.log('  ✅ Pass: returned 404 for non-existent order')

  // Case 3: Email mismatch check
  const resMock3: any = {
    status: (s: number) => {
      statusResult = s
      return resMock3
    },
    json: (j: any) => {
      jsonResult = j
    },
  }

  await trackOrder(
    {
      query: { orderId: 'valid_order_1', email: 'wrong@example.com' },
      payload: {
        findByID: async () => ({
          id: 'valid_order_1',
          orderedBy: { email: 'correct@example.com' },
          fulfillmentStatus: 'in_production',
          items: [],
        }),
        logger: { error: () => {} },
      },
    } as any,
    resMock3,
  )
  assert.strictEqual(statusResult, 403)
  assert.strictEqual(jsonResult?.error, 'Order ID does not match the provided email')
  console.log('  ✅ Pass: blocked unauthorized email with 403')

  // Case 4: Successful sanitized response
  const resMock4: any = {
    status: (s: number) => {
      statusResult = s
      return resMock4
    },
    json: (j: any) => {
      jsonResult = j
    },
  }

  await trackOrder(
    {
      query: { orderId: 'valid_order_1', email: 'correct@example.com' },
      payload: {
        findByID: async () => ({
          id: 'valid_order_1',
          createdAt: '2026-09-02T10:00:00.000Z',
          orderedBy: { email: 'correct@example.com' },
          fulfillmentStatus: 'shipped',
          trackingCarrier: 'USPS',
          trackingNumber: '940011189922310001',
          total: 5000,
          shippingAddress: {
            recipientName: 'Alex Doe',
            city: 'Austin',
            state: 'TX',
            country: 'USA',
            line1: '123 Secret St', // Should be omitted in public sanitized view
          },
          items: [
            {
              product: { title: 'Classic Unisex Cotton T-Shirt', slug: 'classic-unisex-tshirt' },
              variantTitle: 'Size M / Black',
              sku: 'TSHIRT-BLK-M',
              customDesignUrl: 'http://localhost:3000/media/artwork.png',
              customText: 'Aki POD',
              quantity: 2,
              price: 2500,
            },
          ],
        }),
        logger: { error: () => {} },
      },
    } as any,
    resMock4,
  )

  assert.strictEqual(statusResult, 200)
  assert.strictEqual(jsonResult?.id, 'valid_order_1')
  assert.strictEqual(jsonResult?.fulfillmentStatus, 'shipped')
  assert.strictEqual(jsonResult?.trackingCarrier, 'USPS')
  assert.strictEqual(jsonResult?.trackingNumber, '940011189922310001')
  assert.strictEqual(jsonResult?.shippingAddress?.line1, undefined) // sanitized
  assert.strictEqual(jsonResult?.shippingAddress?.city, 'Austin')
  assert.strictEqual(jsonResult?.items?.length, 1)
  assert.strictEqual(jsonResult?.items?.[0]?.customText, 'Aki POD')
  console.log('  ✅ Pass: returned sanitized tracking payload with artwork and fulfillment details')

  console.log('🎉 ALL TRACK ORDER API TESTS PASSED!')
}

runTrackOrderTests().catch(err => {
  console.error('❌ Test failed:', err)
  process.exit(1)
})
