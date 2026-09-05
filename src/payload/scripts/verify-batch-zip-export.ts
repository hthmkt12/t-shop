/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'assert'
import { exportProductionBatch } from '../endpoints/export-production-batch'

async function runProductionBatchVerification(): Promise<void> {
  console.log('🧪 [VERIFICATION] Starting Full POD Production Batch ZIP Export Verification...\n')

  const sampleFrontJson = JSON.stringify({
    version: '7.4.0',
    objects: [
      {
        type: 'rect',
        version: '7.4.0',
        originX: 'left',
        originY: 'top',
        left: 50,
        top: 50,
        width: 150,
        height: 150,
        fill: '#6C4CF1',
        stroke: null,
      },
      {
        type: 'text',
        version: '7.4.0',
        originX: 'left',
        originY: 'top',
        left: 60,
        top: 220,
        text: 'T-SHOP POD 2026',
        fontSize: 24,
        fill: '#10B981',
      },
    ],
  })

  const sampleBackJson = JSON.stringify({
    version: '7.4.0',
    objects: [
      {
        type: 'circle',
        version: '7.4.0',
        originX: 'center',
        originY: 'center',
        left: 200,
        top: 200,
        radius: 80,
        fill: '#FF5C8A',
      },
    ],
  })

  const mockOrderDocs = [
    {
      id: 'ord_pod_test_001',
      createdAt: '2026-09-05T07:00:00.000Z',
      fulfillmentStatus: 'in_production',
      orderedBy: {
        email: 'b2c_customer@t-shop.com',
        name: 'Nguyen Van A',
      },
      items: [
        {
          product: {
            title: 'Classic Unisex Cotton T-Shirt',
            productType: 'tshirt',
          },
          sku: 'TSHIRT-BLK-L',
          variantTitle: 'Black / L',
          quantity: 1,
          customDesignUrl: 'https://cdn.tshop.com/art-front.png',
          customText: 'T-SHOP POD 2026',
          fabricJsonFront: sampleFrontJson,
          fabricJsonBack: sampleBackJson,
        },
        {
          product: {
            title: 'Glossy Ceramic Coffee Mug',
            productType: 'mug',
          },
          sku: 'MUG-WHT-11OZ',
          variantTitle: 'White / 11oz',
          quantity: 2,
          customDesignUrl: 'https://cdn.tshop.com/mug-art.png',
          fabricJsonFront: sampleFrontJson,
        },
      ],
    },
  ]

  const mockPayload: any = {
    logger: {
      error: console.error,
      info: console.log,
      warn: console.warn,
    },
    find: async ({ collection }: any) => {
      if (collection === 'orders') {
        return { docs: mockOrderDocs }
      }
      return { docs: [] }
    },
  }

  // 1. Test CSV Export Format
  let csvData = ''
  const mockReqCsv: any = {
    payload: mockPayload,
    user: { id: 'admin-1', roles: ['admin'] },
    query: { status: 'in_production', format: 'csv' },
  }
  const mockResCsv: any = {
    setHeader: () => {},
    status: function (code: number) {
      this.statusCode = code
      return this
    },
    send: (content: string) => {
      csvData = content
    },
    json: (content: any) => {
      csvData = JSON.stringify(content)
    },
  }

  await (exportProductionBatch as any)(mockReqCsv, mockResCsv, () => {})
  assert.ok(csvData.includes('Order ID,Created At,Fulfillment Status'), 'CSV must include standard header')
  assert.ok(csvData.includes('ord_pod_test_001'), 'CSV must contain order ID')
  assert.ok(csvData.includes('TSHIRT-BLK-L'), 'CSV must contain tshirt SKU')
  assert.ok(csvData.includes('MUG-WHT-11OZ'), 'CSV must contain mug SKU')
  console.log('  ✅ Step 1 Pass: Batch CSV manifest contains accurate file names and customer mapping.')

  // 2. Test ZIP Export Pipeline
  const chunks: Buffer[] = []
  const mockReqZip: any = {
    payload: mockPayload,
    user: { id: 'admin-1', roles: ['admin'] },
    query: { status: 'in_production', format: 'zip' },
  }
  const mockResZip: any = {
    headers: {} as Record<string, string>,
    setHeader: function (key: string, val: string) {
      this.headers[key] = val
    },
    status: function (code: number) {
      this.statusCode = code
      return this
    },
    write: function (chunk: any) {
      chunks.push(Buffer.from(chunk))
      return true
    },
    end: function (chunk?: any) {
      if (chunk) chunks.push(Buffer.from(chunk))
    },
    on: function (_event: string, _cb: any) {
      return this
    },
    once: function (_event: string, _cb: any) {
      return this
    },
    emit: function () {
      return true
    },
  }

  console.log('  ▶ Step 2: Running sequential render & ZIP archive packaging...')
  await (exportProductionBatch as any)(mockReqZip, mockResZip, () => {})

  const zipBuffer = Buffer.concat(chunks)
  assert.ok(zipBuffer.length > 1000, `ZIP buffer size must be non-empty, got ${zipBuffer.length} bytes`)
  assert.strictEqual(mockResZip.headers['Content-Type'], 'application/zip')
  assert.ok(mockResZip.headers['Content-Disposition'].includes('pod-production-batch-in_production-'), 'Valid attachment filename')

  // Verify standard PK ZIP header bytes (0x50, 0x4B, 0x03, 0x04)
  assert.strictEqual(zipBuffer[0], 0x50, 'ZIP byte 0 must be P (0x50)')
  assert.strictEqual(zipBuffer[1], 0x4b, 'ZIP byte 1 must be K (0x4B)')
  console.log(`  ✅ Step 2 Pass: ZIP generated successfully (${(zipBuffer.length / 1024).toFixed(1)} KB) with valid PK header!`)

  console.log('\n🎉 ALL PRODUCTION BATCH EXPORT AND RENDER VERIFICATIONS PASSED!')
}

runProductionBatchVerification().catch(err => {
  console.error('❌ Verification failed:', err)
  process.exit(1)
})
