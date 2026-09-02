const payload = require('payload')
require('dotenv').config({ path: './.env' })

async function testExport() {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET || 'YOUR_SECRET_HERE',
    mongoURL: process.env.DATABASE_URI || 'mongodb://127.0.0.1:27017/payload-template-ecommerce',
    local: true,
  })

  const { exportProductionBatch } = require('./dist/payload/endpoints/export-production-batch')

  const existingOrders = await payload.find({ collection: 'orders', limit: 5 })
  console.log('Existing orders count in DB:', existingOrders.totalDocs)

  if (existingOrders.totalDocs === 0) {
    const products = await payload.find({ collection: 'products', limit: 1 })
    const users = await payload.find({ collection: 'users', limit: 1 })
    if (products.totalDocs > 0 && users.totalDocs > 0) {
      const prod = products.docs[0]
      const user = users.docs[0]
      await payload.create({
        collection: 'orders',
        data: {
          orderedBy: user.id,
          stripePaymentIntentID: 'pi_test_export_123',
          fulfillmentStatus: 'in_production',
          productionNotes: 'Front DTG Print + High Resolution',
          shippingAddress: {
            recipientName: 'Nguyen Van A',
            phone: '+84988776655',
            line1: '123 Le Loi Street',
            city: 'District 1, HCMC',
            country: 'VN',
          },
          total: 3500,
          items: [
            {
              product: prod.id,
              sku: 'TSHIRT-BLK-L',
              variantTitle: 'Black / L',
              quantity: 2,
              price: 1750,
              customText: 'VINTAGE MOTOR 1980',
              customDesignUrl: 'https://r2.t-shop.com/designs/custom-motor.png',
            },
          ],
        },
      })
      console.log('Created mock test order for workshop export.')
    }
  }

  // 1. Test JSON format
  const mockReqJson = {
    user: { id: 'admin-1', roles: ['admin'] },
    payload,
    query: { status: 'in_production', format: 'json' },
  }

  let jsonResponseData = null
  const mockResJson = {
    statusCode: 200,
    headers: {},
    status: function (code) {
      this.statusCode = code
      return this
    },
    json: function (data) {
      jsonResponseData = data
      return this
    },
    setHeader: function (k, v) {
      this.headers[k] = v
    },
    send: function (data) {
      jsonResponseData = data
      return this
    },
  }

  await exportProductionBatch(mockReqJson, mockResJson)
  console.log('\n[TEST 1] Export JSON Status Code:', mockResJson.statusCode)
  console.log('Export JSON Data:', JSON.stringify(jsonResponseData, null, 2))

  // 2. Test CSV format
  const mockReqCsv = {
    user: { id: 'admin-1', roles: ['admin'] },
    payload,
    query: { status: 'in_production', format: 'csv' },
  }

  let csvResponseData = null
  const mockResCsv = {
    statusCode: 200,
    headers: {},
    status: function (code) {
      this.statusCode = code
      return this
    },
    json: function (data) {
      csvResponseData = data
      return this
    },
    setHeader: function (k, v) {
      this.headers[k] = v
    },
    send: function (data) {
      csvResponseData = data
      return this
    },
  }

  await exportProductionBatch(mockReqCsv, mockResCsv)
  console.log('\n[TEST 2] Export CSV Status Code:', mockResCsv.statusCode)
  console.log('Export CSV Headers:', JSON.stringify(mockResCsv.headers, null, 2))
  console.log('Export CSV Content:\n' + csvResponseData)

  // 3. Test Forbidden non-admin request
  const mockReqUnauthorized = {
    user: { id: 'user-1', roles: ['customer'] },
    payload,
    query: { status: 'in_production', format: 'json' },
  }
  let unauthData = null
  const mockResUnauth = {
    statusCode: 200,
    status: function (code) {
      this.statusCode = code
      return this
    },
    json: function (data) {
      unauthData = data
      return this
    },
  }
  await exportProductionBatch(mockReqUnauthorized, mockResUnauth)
  console.log('\n[TEST 3] Non-admin request Status Code:', mockResUnauth.statusCode)
  console.log('Non-admin response:', JSON.stringify(unauthData))

  process.exit(0)
}

testExport().catch(err => {
  console.error('Test error:', err)
  process.exit(1)
})
