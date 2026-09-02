/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type */
import assert from 'assert'
import { podHoodie } from '../seed/pod-hoodie'
import { podMug } from '../seed/pod-mug'
import { podTote } from '../seed/pod-tote'
import { podTshirt } from '../seed/pod-tshirt'

async function verifySeedCatalog(): Promise<void> {
  console.log('🧪 [VERIFICATION] Verifying POD Seed Catalog Fixtures...')

  const fixtures = [
    { name: 'T-Shirt', doc: podTshirt, expectedType: 'tshirt', minVariants: 4 },
    { name: 'Hoodie', doc: podHoodie, expectedType: 'hoodie', minVariants: 3 },
    { name: 'Mug', doc: podMug, expectedType: 'mug', minVariants: 2 },
    { name: 'Tote Bag', doc: podTote, expectedType: 'tote', minVariants: 2 },
  ]

  for (const { name, doc, expectedType, minVariants } of fixtures) {
    console.log(`Checking ${name} fixture...`)

    assert.ok(doc.title, `${name} must have a title`)
    assert.ok(doc.slug, `${name} must have a slug`)
    assert.strictEqual(doc._status, 'published', `${name} status must be published`)
    assert.strictEqual(
      doc.productType,
      expectedType,
      `${name} productType must match ${expectedType}`,
    )
    assert.strictEqual(doc.enableCustomizer, true, `${name} enableCustomizer must be true`)
    assert.strictEqual(doc.enableVariants, true, `${name} enableVariants must be true`)
    assert.ok(
      typeof doc.price === 'number' && doc.price > 0,
      `${name} base price must be positive number`,
    )

    assert.ok(Array.isArray(doc.variants), `${name} must have variants array`)
    assert.ok(
      doc.variants.length >= minVariants,
      `${name} should have at least ${minVariants} variants, found ${doc.variants.length}`,
    )

    // Verify each variant
    for (const v of doc.variants) {
      assert.ok(v.sku, `${name} variant missing sku`)
      assert.ok(v.title, `${name} variant missing title`)
      assert.ok(v.colorHex?.startsWith('#'), `${name} variant missing valid colorHex`)
      assert.ok(typeof v.price === 'number' && v.price > 0, `${name} variant price must be > 0`)
      assert.ok(typeof v.stock === 'number' && v.stock >= 0, `${name} variant stock must be >= 0`)
    }

    console.log(`  ✅ ${name} verified with ${doc.variants.length} complete variants!`)
  }

  console.log('🎉 ALL POD CATALOG FIXTURES VALIDATED SUCCESSFULLY!')
}

verifySeedCatalog().catch(err => {
  console.error('❌ Catalog verification failed:', err)
  process.exit(1)
})
