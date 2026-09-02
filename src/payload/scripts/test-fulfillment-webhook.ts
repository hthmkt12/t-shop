/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'assert'
import { dispatchFulfillmentWebhook } from '../collections/Orders/hooks/dispatchFulfillmentWebhook'

async function runFulfillmentWebhookTests(): Promise<void> {
  console.log('🧪 [TEST 4] Testing Fulfillment Auto-Dispatch Webhook Hook...\n')

  let dispatchedBody: any = null
  let dispatchedHeaders: Record<string, string> = {}

  // Mock global.fetch
  const originalFetch = global.fetch
  ;(global as any).fetch = async (url: string, opts: any) => {
    dispatchedBody = JSON.parse(opts.body)
    dispatchedHeaders = opts.headers
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
    }
  }

  const mockPayload: any = {
    logger: {
      info: (msg: string) => console.log(`    [Payload Info] ${msg}`),
      error: (msg: string) => console.error(`    [Payload Error] ${msg}`),
    },
  }

  // Case 1: No FULFILLMENT_WEBHOOK_URL set -> No action
  delete process.env.FULFILLMENT_WEBHOOK_URL
  const docNoEnv: any = {
    id: 'ord_no_env',
    fulfillmentStatus: 'in_production',
    items: [],
  }
  await dispatchFulfillmentWebhook({
    doc: docNoEnv,
    previousDoc: undefined,
    operation: 'create',
    req: { payload: mockPayload } as any,
  } as any)
  assert.strictEqual(dispatchedBody, null, 'Should not dispatch if webhook URL is not set')
  console.log('  ✅ Pass: Ignored when FULFILLMENT_WEBHOOK_URL is not configured')

  // Case 2: Configured Webhook & New in_production Order -> Dispatched
  process.env.FULFILLMENT_WEBHOOK_URL = 'https://workshop.example.com/api/fulfillment-webhook'
  process.env.FULFILLMENT_WEBHOOK_SECRET = 'secret_workshop_token_123'

  const mockOrder: any = {
    id: 'ord_prod_456',
    createdAt: new Date().toISOString(),
    fulfillmentStatus: 'in_production',
    total: 3500,
    shippingAddress: {
      recipientName: 'Nguyen Van A',
      phone: '0901234567',
      line1: '123 Le Loi',
      city: 'Da Nang',
      country: 'Vietnam',
    },
    items: [
      {
        product: { id: 'prod_hoodie', title: 'Custom POD Hoodie' },
        sku: 'HOODIE-BLK-L',
        variantTitle: 'Black / L',
        quantity: 1,
        customText: 'Aki Lab 2026',
        customDesignUrl: 'https://r2.tshop.com/designs/hoodie-art.png',
      },
    ],
    productionNotes: 'Double pass print on black fabric',
  }

  await dispatchFulfillmentWebhook({
    doc: mockOrder,
    previousDoc: undefined,
    operation: 'create',
    req: { payload: mockPayload } as any,
  } as any)

  assert.ok(dispatchedBody, 'Webhook payload must be sent')
  assert.strictEqual(dispatchedBody.event, 'order.fulfillment.ready')
  assert.strictEqual(dispatchedBody.order.id, 'ord_prod_456')
  assert.strictEqual(dispatchedBody.order.recipient.name, 'Nguyen Van A')
  assert.strictEqual(dispatchedBody.order.items[0].sku, 'HOODIE-BLK-L')
  assert.strictEqual(
    dispatchedBody.order.items[0].customDesignUrl,
    'https://r2.tshop.com/designs/hoodie-art.png',
  )
  assert.strictEqual(dispatchedHeaders['X-Fulfillment-Secret'], 'secret_workshop_token_123')
  console.log('  ✅ Pass: Webhook dispatched with accurate recipient, SKU, and artwork URL')

  // Case 3: Transition status to in_production on update
  dispatchedBody = null
  const updatedDoc: any = {
    ...mockOrder,
    fulfillmentStatus: 'in_production',
  }
  const previousDoc: any = {
    ...mockOrder,
    fulfillmentStatus: 'pending',
  }

  await dispatchFulfillmentWebhook({
    doc: updatedDoc,
    previousDoc,
    operation: 'update',
    req: { payload: mockPayload } as any,
  } as any)

  assert.ok(dispatchedBody, 'Webhook must dispatch on status change from pending -> in_production')
  console.log('  ✅ Pass: Triggered on status transition (pending -> in_production)')

  // Restore global.fetch
  global.fetch = originalFetch

  console.log('\n🎉 ALL FULFILLMENT WEBHOOK HOOK TESTS PASSED!')
}

runFulfillmentWebhookTests().catch(err => {
  console.error('❌ Test failed:', err)
  process.exit(1)
})
