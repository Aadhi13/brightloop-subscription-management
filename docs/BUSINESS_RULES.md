# Business Rules and Critical Invariants

This document is authoritative for pricing, subscription lifecycle, billing and payments.

## 1. Money representation

- Currency is INR for the MVP.
- Store monetary values as integer paise.
- `₹1 = 100 paise`.
- Do not use JavaScript floating-point values for monetary calculations.
- Percentage rates use basis points: `10000 = 100%`.
- The backend calculates all totals. Ignore client-submitted totals.
- Define and consistently apply a rounding rule at line/tax calculation boundaries.

## 2. Price composition

A subscription may include:
- Plan recurring base price.
- Product lines with quantities.
- Variant price adjustments.
- Applicable discounts.
- Tax.

The exact relationship between plan price and product line prices is not fully specified by the challenge. For MVP, document the chosen rule clearly: plan price is the recurring base charge; product lines are additional recurring charges unless explicitly configured as included. Avoid charging the same product/feature twice.

Variant unit price = product base sales price + selected variant adjustment, unless the quotation explicitly snapshots a negotiated unit price.

Line subtotal = unit price × quantity.

Discount is applied according to the configured rule and eligibility. Tax treatment (before/after discount) must be consistent and documented. The challenge does not prescribe a tax jurisdiction or tax ordering.

## 3. Discount eligibility

A discount is eligible only when:
- Active.
- Current time is within start/end dates.
- Usage limit has not been exhausted.
- Minimum purchase is met.
- Minimum quantity is met.
- Product/subscription scope matches.

Discount cannot reduce a line or invoice below zero. Fixed discounts are capped at the eligible amount. Percentage discounts are calculated with integer arithmetic and the agreed rounding rule.

Enforce usage limits atomically. A read-then-increment sequence without atomic protection is race-prone.

## 4. Subscription lifecycle

Allowed transitions should be explicit. Suggested MVP transitions:

- Draft → Quotation
- Quotation → Confirmed
- Confirmed → Active
- Active → Paused (only if plan policy allows)
- Paused → Active (resume)
- Active → Closed
- Confirmed → Closed (if business policy allows)
- Active → Confirmed is not allowed.
- Closed is terminal for the existing subscription; renewal creates a new subscription or a clearly linked renewal record.

The source challenge's primary lifecycle is Draft → Quotation → Confirmed → Active → Closed. Paused is an additional operational state required by its pause policy. Validate every transition in the service layer.

Auto-close: if `autoClose` is enabled and expiry is reached, close the subscription. If not enabled, do not silently close it. Define how expired-but-open subscriptions are handled.

Billing eligibility:
- status must be Active.
- nextBillingDate must be due at the billing cutoff.
- subscription must not be past an applicable expiry date.
- subscription must not be paused or closed.
- required customer and line snapshots must exist.

## 5. Billing period and idempotency

For each billing cycle, calculate a deterministic period start/end and a deterministic `billingKey`, e.g. subscription ID + normalized period start + period end.

Create a unique database index on subscription + billingKey. This is the final duplicate-prevention mechanism. A pre-check alone is insufficient because concurrent workers can race.

Billing operation:
1. Select eligible subscriptions using indexed fields.
2. Determine billing period.
3. Calculate charges using server-side pricing service.
4. Create invoice with unique billing identity and snapshots.
5. Advance nextBillingDate only when invoice creation succeeds, in a transaction where feasible.
6. Record generated/skipped/failed outcomes in a billing run.
7. Handle duplicate-key error as already processed, not as a fatal system crash.

Use a manual Run Billing action for the demo. A node-cron job may call the same billing service. Do not maintain two separate implementations.

Date arithmetic: use calendar-aware interval logic. Monthly billing should preserve intended calendar behavior (e.g. end-of-month dates) and must not be implemented as a fixed 30-day duration. Use a date library or carefully tested utility.

## 6. Invoice lifecycle

Suggested transitions:
- Draft → Confirmed
- Draft → Cancelled
- Confirmed → Paid when balance reaches zero
- Confirmed → Cancelled only if no payment has been recorded and policy permits
- Paid and Cancelled are terminal for ordinary edits.

Overdue is a derived state, not a persisted lifecycle state:
`status === "confirmed" && balanceDue > 0 && dueDate < now`.

An invoice can be partially paid while its lifecycle status remains `confirmed`; show `Partially paid` as a derived UI label if amountPaid > 0 and balanceDue > 0.

Once confirmed:
- Do not silently change customer snapshot, line items, totals, tax or discount.
- Corrections should use cancellation/replacement or an explicit adjustment workflow.
- A paid invoice must not be cancelled through the ordinary cancellation endpoint.

## 7. Payments

- A payment amount must be a positive integer number of paise.
- Payment must reference an existing invoice.
- Invoice must be confirmed and have a positive balance.
- Reject overpayment for MVP.
- Multiple partial payments are allowed.
- Payment creation and invoice balance update must be atomic.
- New amountPaid = old amountPaid + payment amount.
- New balanceDue = invoice total - new amountPaid.
- When balanceDue reaches zero, set invoice status to `paid`.
- Do not delete payment records to reverse a payment; a reversal/refund workflow is out of MVP scope.

## 8. Taxes

The challenge says taxes are configured by admin and calculated automatically. MVP supports percentage tax rules with a stored rate in basis points. Tax jurisdiction, compound tax, inclusive tax and GST-specific rules are not specified; do not claim legal compliance.

Snapshot tax name/rate/amount on the invoice line so later rule changes do not rewrite historical invoices.

## 9. Quotation conversion

- Quotation validity is checked at acceptance/conversion.
- Convert only accepted/valid quotations.
- Snapshot agreed prices and terms.
- Prevent converting the same quotation twice.
- Use a transaction or atomic state transition to avoid duplicate subscriptions.
- Subscription should retain quotation reference and snapshots.

## 10. Authorization and data ownership

- Only admin creates staff.
- Staff cannot access admin-only configuration.
- Customers can only access records linked to their own customer account.
- Apply ownership constraints in database queries and service authorization, not only in UI.
- Never accept a role or actor ID from request body as authority.
