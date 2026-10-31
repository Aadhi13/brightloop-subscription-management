# Execution Plan and Acceptance Criteria

## Operating principle

Build a connected vertical slice before polishing isolated screens. Work in small tasks, verify each, then commit.

## Milestones

### M0 — Foundation
- Monorepo, Vite client, Express server.
- Atlas connection and environment config.
- `/api/health`.
- CORS, Helmet, centralized error handling.
- Verdant Ledger tokens and application shell.
Acceptance: frontend/backend run; Atlas connects; health endpoint works.

### M1 — Authentication and RBAC
- User model, password hashing, login/register.
- Password policy.
- Unique normalized email.
- Role middleware.
- Admin seed/bootstrap method.
- Protected UI routes.
Acceptance: admin/staff/customer behavior is enforced by API; only admin creates staff. Customer endpoints are ownership-scoped.

### M2 — Products, variants, plans, tax rules
- CRUD and server validation.
- Variant adjustment.
- Plan recurring price, interval and policies.
- Admin configuration UI.
Acceptance: create/edit/archive product and plan; pricing values persist in paise.

### M3 — Customers and quotations
- Customer CRUD.
- Quotation template basic support.
- Quotation creation with product/plan snapshots.
- Validity and status.
Acceptance: quotation has correct snapshot totals and cannot be converted twice.

### M4 — Subscription lifecycle
- Convert accepted quotation.
- Subscription number.
- State transition service.
- Next billing date.
- Pause/resume/close policy checks.
Acceptance: invalid transitions rejected; customer sees only own subscriptions.

### M5 — Billing and invoices
- Central pricing calculator.
- Billing period calculation.
- Billing run record.
- Invoice snapshots.
- Unique billing key and duplicate protection.
- Manual billing trigger.
Acceptance: due active subscription generates exactly one invoice per period; repeat/concurrent attempt does not duplicate it.

### M6 — Discounts, taxes and payments
- Discount eligibility and usage limit.
- Tax snapshot.
- Partial/full payments.
- Atomic payment + invoice update.
Acceptance: discount rules are enforced; payment cannot exceed balance; invoice becomes paid at zero balance.

### M7 — Dashboard and PDF
- Aggregation-based metrics.
- Filters and pagination.
- Invoice PDF.
Acceptance: cash received, outstanding and overdue metrics reconcile with source records; PDF matches persisted invoice.

### M8 — Final verification and demo
- Run end-to-end scenario.
- Fix critical defects.
- Seed demo records.
- README and setup instructions.
- Verify deployment if available.
Acceptance: demo can be performed without manual database editing.

## Time-boxed prioritization

If time is short, prioritize in this order:
1. Persistent CRUD and auth/RBAC.
2. Quotation → subscription.
3. Invoice generation and idempotency.
4. Payment reconciliation.
5. Dashboard.
6. PDF polish.
7. Audit logs, password-reset delivery and advanced analytics.

Do not sacrifice correctness of money, authorization or duplicate billing to add decorative features.

## Suggested commit sequence

```text
chore: initialize Brightloop application architecture
feat(auth): implement authentication and role authorization
feat(products): add product and variant management
feat(plans): implement recurring plan configuration
feat(customers): add customer management
feat(quotations): implement quotation creation and conversion
feat(subscriptions): implement lifecycle transitions
feat(billing): add pricing and billing-period services
feat(invoices): generate idempotent recurring invoices
feat(discounts): implement discount eligibility and limits
feat(payments): add atomic payment reconciliation
feat(analytics): add financial dashboard aggregations
feat(invoices): generate printable invoice PDFs
test: cover critical billing and payment invariants
docs: document setup and demo workflow
```

Only commit verified, coherent changes. Do not create commits merely to increase count.

## Critical test cases

### Authentication
- Duplicate email with different casing.
- Password exactly 8 characters rejected.
- Missing uppercase/lowercase/special character rejected.
- Staff cannot create staff.
- Customer cannot read another customer's invoice.

### Pricing
- Variant adjustment applied exactly once.
- Quantity multiplication.
- Fixed discount capped at eligible amount.
- Percentage discount rounding.
- Tax calculation and snapshot.
- Zero/negative quantity or invalid amount rejected.

### Billing
- Inactive/paused/closed subscription skipped.
- Not-yet-due subscription skipped.
- Due subscription produces invoice.
- Re-running billing does not duplicate invoice.
- Concurrent billing attempt does not duplicate invoice.
- Monthly end-of-month date behavior tested.

### Payments
- Partial payment updates balance.
- Full payment changes status to paid.
- Zero/negative payment rejected.
- Overpayment rejected.
- Two concurrent payments cannot overpay the invoice.
- Payment and invoice update roll back together on failure.

## Demo script

1. Log in as admin.
2. Create a product and a variant with an added price.
3. Create a monthly plan.
4. Create a tax and discount rule.
5. Create a customer and quotation.
6. Convert quotation to subscription and activate it.
7. Run billing.
8. Open generated invoice and download PDF.
9. Record a partial payment, then the remaining payment.
10. Show invoice paid status and dashboard changes.
11. Show subscription and invoice lists with filters.

Use seeded demo data to avoid typing large amounts of information during judging.
