# Orchestrate Report

Spec: inline request "/ak:orchestrate lam lan luot" (sequential, concurrency 1)
Workspace: F:/t-shop (git: main)

## Runtime inventory (live)
- OS win32; node v24.15.0; yarn 1.22.22; git repo on `main`.
- Agent CLIs on PATH: claude, codex, gemini, opencode (auth NOT verified; not used).
- No worktrees created (nothing to isolate; no parallel writers).

## Jobs (ran sequentially)
1. job-1-review  — status: SUCCESS. Independent-in-intent code review of the
   money-integrity changes. Route: coordinator/internal (same-agent, disclosed as
   NOT independent). Evidence: Payload 2.4.0 create-operation source confirms
   collection beforeChange precedes field validation; units are cents. See
   job-1-review/result.md.
2. job-2-smoke   — status: BLOCKED. Runtime end-to-end smoke test. Blocked at the
   safety gate: destructive (yarn seed drops DB), needs credentials
   (Stripe/webhook), and needs an interactive browser test-card checkout that no
   available headless runtime can perform. Requires explicit user approval + manual
   execution.

## Arbiter checklist
- Every required job produced its artifact? job-1 yes; job-2 blocked (no artifact by design).
- Any job fail/timeout/permission/uncertainty? job-2 blocked (approval boundary).
- Outputs contradict? No.
- Checks run and passed? Static only: `tsc --noEmit` exit 0, `eslint` exit 0 (warnings only). No runtime checks.
- Every route met capability/risk floor? job-1 yes (R0 read-only). job-2 unmet (no runtime satisfies interactive+credentialed).
- Availability revalidated this run? Yes (live probe of PATH + git + node/yarn).
- Destructive actions approved and reversible? Not approved; blocked.
- Unresolved questions listed? Yes (below).

## Checks
- npx tsc --noEmit  => exit 0
- npx eslint <changed files>  => exit 0 (only @typescript-eslint/no-explicit-any warnings, consistent with repo)

## Diffs awaiting integration
None held in worktrees; changes are on `main` working tree (not committed by me).

## Unresolved questions
- Job B runtime verification is unrun and cannot be automated here. Approve the
  destructive seed and run it manually (checklist in money-flow-integrity.md), or
  point me at a non-destructive path (pre-seeded DB) if one exists.
- Independent (different-agent) review not performed; say if you want me to verify
  a CLI's auth and dispatch a second-opinion review.

## Independent review (job-3) — added after "tiep"
Route: claude-code CLI headless (auth verified live: AUTH_OK; model per CLI config: ag/gemini-3.7-flash-high). Genuinely independent from the coordinator. Read-only.
Verdict: FAIL. Findings (validated against actual code):
1. Order items are client-controlled and drive stock decrement (updateProductStock) independently of what was paid: attacker pays for a cheap cart but submits large quantities/expensive items in POST /api/orders. recalculateTotal only WARNS on line-item vs PI mismatch, still saves. => stock drain + fraudulent line items. Total itself is corrected to PI amount.
2. PaymentIntent.status is never checked (only .amount). A non-succeeded / canceled PI id yields a free order.
3. stripePaymentIntentID has no unique constraint => replay one paid PI to spawn many orders.
4. Degraded path (missing Stripe key / retrieve throws) persists client-submitted total.

Overall arbiter verdict for the run: FAIL — real holes remain beyond the total field. Fixes require a money/double-pay trade-off decision (throw vs log; derive items server-side), pending user direction. Safe wins available now: unique constraint on stripePaymentIntentID; PaymentIntent status gating.

## Remediation (applied after independent review, fail-closed policy)
Decision: fail-closed — reject rather than persist unverified orders. Applied to
recalculateTotal.ts (verified: tsc exit 0, eslint exit 0 / warnings only):
1. Items rebuilt from the server-side cart; client items discarded => stock drain
   and fraudulent line items closed.
2. PaymentIntent.status gated to succeeded|processing|requires_capture => free
   order via unpaid PI closed.
3. Replay guard: query existing orders by stripePaymentIntentID, throw if found
   => PI reuse closed (residual: small race; sparse unique index recommended).
4. Missing key / retrieve failure / cart-vs-PI mismatch => throw (no persist).
Doc updated: plans/money-flow-integrity.md (flow, invariants, gaps).

Residual (unchanged): runtime E2E (Job B) still unrun; fail-closed needs a Stripe
webhook to reconcile paid-but-unrecorded orders. Independent re-review not re-run
after remediation.

## Job 4 — independent re-review: FAILED (runtime unreachable)
claude-code CLI returned "Connection refused" (firewall/proxy) on 2 attempts; the
independent runtime is down. Fallback coordinator (same-agent, NOT independent)
re-review performed instead — see job-4-rereview/result-coordinator-fallback.md.
Fixes verified correct by code + Payload hook-order. Most important residual:
non-variant reconciliation uses cached product.price vs the live Stripe unit_amount
used at PI creation; stale priceJSON => false rejection of a paid order. Re-run the
independent review when connectivity returns.

## Follow-up fix — non-variant reconciliation drift closed
recalculateTotal now derives non-variant unit prices from the live Stripe
unit_amount (same as create-payment-intent), with cached product.price only as a
last-resort fallback. This removes the cached-vs-live false-reject risk flagged in
the coordinator fallback re-review. Verified: tsc exit 0, eslint exit 0 (warnings
only). Residual fail-closed rejects now limited to true Stripe outage or a real
price change mid-checkout (needs webhook reconciliation).
