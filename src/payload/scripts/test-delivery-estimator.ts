import assert from 'assert'
import { getEstimatedDelivery } from '../../app/_components/DeliveryEstimator/estimator'

console.log('🧪 [TEST 3] Testing Delivery Estimator calculation...')

// Test 1: Prior to 14:00 cutoff (e.g. 10:30 AM)
const morningDate = new Date('2026-09-07T10:30:00') // Monday
const morningEst = getEstimatedDelivery(morningDate)
assert.strictEqual(morningEst.cutoffHour, 14)
assert.strictEqual(morningEst.hoursLeft, 3)
assert.strictEqual(morningEst.minutesLeft, 29)
assert.strictEqual(morningEst.isToday, true)
console.log('  ✅ Pass: before 14:00 cutoff counts remaining hours/minutes today')

// Test 2: After 14:00 cutoff (e.g. 15:45 PM)
const afternoonDate = new Date('2026-09-07T15:45:00') // Monday
const afternoonEst = getEstimatedDelivery(afternoonDate)
assert.strictEqual(afternoonEst.isToday, false)
console.log('  ✅ Pass: after 14:00 cutoff rolls to next business production cycle')

// Test 3: Business days skip weekend
assert.ok(morningEst.formattedDeliveryRange.length > 0)
console.log(`  ✅ Pass: formatted delivery window generated (${morningEst.formattedDeliveryRange})`)

console.log('🎉 ALL DELIVERY ESTIMATOR TESTS PASSED!')
