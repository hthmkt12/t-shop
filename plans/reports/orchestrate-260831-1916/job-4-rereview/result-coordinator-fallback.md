# Job 4 (fallback) — Coordinator re-review of the fail-closed remediation
NOT independent (same agent that wrote the fix). Independent runtime was down.

Verdict: fixes appear correct; one real residual false-reject risk.

Closed findings (verified by code + Payload 2.4.0 hook order):
1. items rebuilt from server cart; client items discarded. clearUserCart is an
   afterChange hook, so at beforeChange time the cart is STILL populated => rebuild
   has data. Stock decrement (updateProductStock, afterChange) now uses the rebuilt
   (server) quantities. OK.
2. PaymentIntent.status gated to succeeded|processing|requires_capture. OK.
3. Replay guard via find() on stripePaymentIntentID before insert. OK (residual
   race under concurrent duplicate submit; sparse unique index recommended).
4. Missing key / retrieve error / cart-vs-PI mismatch => throw. OK.

New residual risk (most important):
- Reconciliation compares sum over the rebuilt cart against PaymentIntent.amount.
  For VARIANT items both create-payment-intent and recalculateTotal use
  variant.price => exact match. For NON-VARIANT items, create-payment-intent used
  the LIVE Stripe unit_amount (prices.list), while recalculateTotal uses the cached
  product.price (populated from priceJSON). If priceJSON is stale vs Stripe, a
  legitimately paid order is wrongly REJECTED (fail-closed). Mitigation: source
  both sides from the same value (e.g. base the non-variant charge on product.price
  too), or add a webhook that reconciles rejected-but-paid PaymentIntents.

Minor:
- Cart lines with quantity 0 produce a price-0 order line (cosmetic; total unaffected).
- Product deleted mid-checkout => that line prices to 0 => mismatch => reject (acceptable, fail-closed).
- Integer cents throughout; no rounding risk.
