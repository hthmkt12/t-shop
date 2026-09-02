/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type */
import assert from 'assert'
import { recalculateTotal } from '../collections/Orders/hooks/recalculateTotal'

process.env.STRIPE_SECRET_KEY = 'sk_test_mock_secret_key'

async function runFinancialTests(): Promise<void> {
  console.log('🧪 [TEST 1] Testing recalculateTotal money integrity...')

  // Case 1: Non-create operation passes untouched
  const updateData = { total: 100, items: [] }
  const updateRes = await recalculateTotal({
    data: updateData,
    req: {} as any,
    operation: 'update',
  } as any)
  assert.strictEqual(updateRes, updateData, 'Update operation should pass through')
  console.log('  ✅ Pass: update operation ignored')

  // Case 2: Admin-created orders (no paymentIntentID) pass untouched
  const adminData = { total: 5000, items: [{ price: 5000, quantity: 1 }] }
  const adminRes = await recalculateTotal({
    data: adminData,
    req: { payload: {} } as any,
    operation: 'create',
  } as any)
  assert.strictEqual(adminRes, adminData, 'Admin order without paymentIntentID should pass through')
  console.log('  ✅ Pass: admin order without paymentIntentID ignored')

  // Case 3: Replay attack prevention
  let replayBlocked = false
  try {
    await recalculateTotal({
      data: { stripePaymentIntentID: 'pi_test_replay' },
      req: {
        payload: {
          find: async () => ({ totalDocs: 1, docs: [{ id: 'existing_order' }] }),
          logger: { error: () => {} },
        },
      } as any,
      operation: 'create',
    } as any)
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('already exists for PaymentIntent')) {
      replayBlocked = true
    }
  }
  assert.ok(replayBlocked, 'Replay attack must be blocked')
  console.log('  ✅ Pass: replay attack prevented')

  // Case 4: Total mismatch between client cart and authorized amount
  let mismatchBlocked = false
  try {
    await recalculateTotal({
      data: { stripePaymentIntentID: 'pi_test_mismatch' },
      req: {
        user: { id: 'user_123' },
        payload: {
          find: async () => ({ totalDocs: 0, docs: [] }),
          findByID: async ({ collection }: any) => {
            if (collection === 'users') {
              return {
                id: 'user_123',
                cart: {
                  items: [
                    {
                      product: 'prod_1',
                      sku: 'TSHIRT-BLK-S',
                      quantity: 2,
                    },
                  ],
                },
              }
            }
            if (collection === 'products') {
              return {
                id: 'prod_1',
                enableVariants: true,
                variants: [{ sku: 'TSHIRT-BLK-S', price: 2500 }],
              }
            }
          },
          logger: { error: () => {} },
        },
      } as any,
      operation: 'create',
    } as any)
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('recalculateTotal:')) {
      mismatchBlocked = true
    }
  }
  assert.ok(mismatchBlocked, 'Tampered or unverified amount must be rejected')
  console.log('  ✅ Pass: fail-closed on unverified or mismatched payment intent')

  console.log('🎉 ALL FINANCIAL HOOK TESTS PASSED!')
}

runFinancialTests().catch(err => {
  console.error('❌ Test failed:', err)
  process.exit(1)
})
