# Money-Flow Integrity (Checkout -> Order)

Purpose: document how the charged amount and stored order totals are kept
consistent and tamper-resistant, and where the trust boundaries are.

## Trust boundary

The browser client is UNTRUSTED. Any amount, per-item price, or total it sends
must be treated as a hint, never as the source of truth. The authoritative amount
is what Stripe actually authorized on the PaymentIntent, which is computed
server-side.

## Flow

1. Cart -> `POST /api/create-payment-intent`
   (`src/payload/endpoints/create-payment-intent.ts`)
   - Requires an authenticated user; loads the full user (and cart) server-side.
   - For each cart item: validates stock server-side (per-variant by SKU when
     variants are enabled, otherwise the product-level stock).
   - Computes the unit amount server-side:
     - variant override: `variant.price` (in cents) when the item is a variant and
       that variant has a numeric price;
     - otherwise the Stripe price `unit_amount` for the product.
   - Sums `unitAmount * quantity` and creates a Stripe PaymentIntent for that
     `amount`. Returns only the `client_secret` to the client.
   - => The charged amount is decided entirely on the server here.

2. Client confirms payment with Stripe.js, then `POST /api/orders`
   (`src/app/(pages)/checkout/CheckoutForm/index.tsx`)
   - Sends `stripePaymentIntentID`, `total`, shipping address, and line items.
   - The server IGNORES the client `total` and the client line items entirely
     (they are rebuilt server-side, below). They are effectively advisory.

3. Orders `beforeChange` hook `recalculateTotal`
   (`src/payload/collections/Orders/hooks/recalculateTotal.ts`), on create only,
   FAIL-CLOSED (rejects rather than persists unverified data):
   - Skips admin-created orders (no `stripePaymentIntentID`): they keep their
     manually entered values.
   - Throws if the Stripe secret key is not configured.
   - Replay guard: throws if another order already references the same
     `stripePaymentIntentID` (one PaymentIntent backs at most one order).
   - Retrieves the PaymentIntent; throws on retrieval failure.
   - Throws unless `PaymentIntent.status` is one of
     `succeeded | processing | requires_capture`.
   - Rebuilds `items` from the authenticated user's server-side cart (product,
     sku, variantTitle, quantity). Each unit price is derived the SAME way as
     `create-payment-intent`: variant override first, otherwise the live Stripe
     `unit_amount` (with cached `product.price` only as a last-resort fallback).
     The client-sent items are discarded, so tampered quantities/SKUs cannot
     drive stock decrement or fraudulent line items, and the reconciliation below
     is deterministic (no cached-vs-live price drift).
   - Reconciles `sum(price * quantity)` against `PaymentIntent.amount`; throws on
     mismatch.
   - Sets `Order.total` = `PaymentIntent.amount`.
   - Consequence: a paid PaymentIntent that cannot be verified/reconciled yields
     NO order (the client surfaces the error without re-charging). Such a
     paid-but-unrecorded case must be reconciled out of band (webhook / support).

4. Orders `afterChange` hooks: `updateUserPurchases`, `clearUserCart`,
   `updateProductStock` (decrements per-variant or product stock).

## Units

`product.price` and `variant.price` are stored in the smallest currency unit
(cents), matching Stripe `unit_amount` and `PaymentIntent.amount`. For a
zero-decimal currency (e.g. VND) the smallest unit equals the currency value, so
the comparison in `recalculateTotal` stays valid either way.

## Invariants

- `Order.total` for a checkout order == `PaymentIntent.amount`.
- `Order.items` (product, sku, variantTitle, quantity, price) are rebuilt from
  the server-side cart, independent of client input; stock decrement in
  `updateProductStock` therefore acts on server-derived quantities.
- At most one order per `stripePaymentIntentID`.
- Stock is validated before the PaymentIntent is created, and decremented after
  the order is created.

## Known gaps / follow-ups

- Runtime end-to-end verification (seed, MongoDB, Stripe webhooks, test-card
  checkout) has NOT been run here; the guarantees above are verified statically
  (typecheck + lint) only.
- Fail-closed trade-off: a transient Stripe outage, or a genuine price change
  between PaymentIntent creation and order creation, can still reject a
  legitimately paid order. (Cached-vs-live price drift is no longer a cause: the
  hook now uses the same live Stripe unit_amount as create-payment-intent.) There
  is no automated reconciliation of a paid-but-unrecorded PaymentIntent yet; add a
  Stripe webhook to create/repair such orders.
- The replay guard is a query-then-insert check (small race window under
  concurrent duplicate submits); a unique index on `stripePaymentIntentID`
  (sparse, to allow admin orders without one) would close it fully.
- There is no per-variant Stripe Price; variant pricing lives only in Payload.
  Keep variant prices and Stripe product prices reconciled if that ever changes.
