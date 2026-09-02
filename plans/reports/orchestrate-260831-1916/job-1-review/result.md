# Job 1 — Review: money-integrity changes

Verdict: PASS (evidence-backed, static).

## Scope reviewed
- src/payload/collections/Orders/hooks/recalculateTotal.ts (new beforeChange hook)
- src/payload/collections/Orders/index.ts (hook registration)
- src/app/(pages)/checkout/CheckoutForm/index.tsx (client cleanup)
- src/payload/endpoints/create-payment-intent.ts (variant price fix, prior turn)

## Key finding — hook order vs validation (was the open risk)
Verified in the installed Payload 2.4.0 create operation source. Execution order:
1. beforeOperation (collection)
2. access
3. beforeValidate (fields)
4. beforeValidate (collection)
5. beforeChange (collection)   <= recalculateTotal runs here
6. beforeChange (fields)       <= required-field validation runs here
7. db.create

=> The collection beforeChange runs BEFORE field validation. So recalculateTotal
overrides `total` and re-derives `item.price` before Payload validates the
required `total`. The shipped changes are safe:
- Removing client `item.price` cannot trip validation (item.price is optional and
  is filled server-side before validation).
- Keeping client `total` is not strictly required for validation (the hook sets it
  first), but is retained intentionally as a fallback for the degraded path where
  the Stripe key is missing / retrieve fails.

## Unit consistency
product.price ("Base Price in cents") and variant.price ("Price in Cents / VND")
are both smallest-unit (cents), matching Stripe unit_amount and PaymentIntent.amount.
Zero-decimal currencies (VND) keep the comparison valid. Consistent.

## Residual (not blocking)
- `quantity` is trusted as submitted; charged amount is fixed by the PaymentIntent
  so this does not affect money, only fulfillment counts.
- Same-agent review: NOT independent. An independent CLI/second-model review was
  not run (CLI auth unverified; not dispatched).
- No runtime execution performed.
