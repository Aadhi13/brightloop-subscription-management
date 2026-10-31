# Product Scope and Requirements

## 1. Product objective

Build one unified system for Brightloop Software to manage products, plans, customers, quotations, subscriptions, recurring invoices, payments and revenue reporting.

The original challenge describes:
- Customer registration, unique email, password complexity and password reset.
- Three roles: Admin, Staff and Customer. Only Admin can create staff.
- Products with name, type, sales price, cost price, notes and variants.
- Variants can change the price; example: Odoo brand adds ₹560.
- Plans with price, daily/weekly/monthly/yearly interval, minimum quantity, availability dates and configurable lifecycle policies.
- Quotation templates with product/plan lines and validity.
- Subscription lifecycle: Draft → Quotation → Confirmed → Active → Closed.
- Automatic invoice generation, taxes, invoice confirmation/cancellation/sending/printing and duplicate prevention.
- Admin-managed fixed/percentage discounts with thresholds, validity and usage limits.
- Payment recording by method, amount, date and note.
- Dashboard: active subscriptions, received revenue, outstanding, overdue invoices and filters.
- Pages should respond in under two seconds with thousands of subscriptions.

## 2. Primary workflow

1. Admin creates products, variants, plans, tax rules and discount rules.
2. Customer registers, or staff creates a customer record if that workflow is implemented.
3. Staff creates a quotation from a template or directly.
4. Quotation is sent/represented to customer and accepted.
5. Accepted quotation becomes a confirmed subscription.
6. Subscription becomes active on its start date, or is activated by the allowed transition.
7. Billing service generates an invoice for a due billing period.
8. Invoice is confirmed and made available to the customer.
9. Staff records one or more payments against the invoice.
10. Dashboard aggregates subscription and invoice/payment data.

## 3. Roles and permissions

### Admin
- Full access to administrative modules.
- Create and deactivate staff accounts.
- Manage products, plans, taxes and discount rules.
- View all customers, subscriptions, invoices, payments and analytics.
- Run billing manually.

### Staff
- Manage customers, quotations and subscriptions.
- View and manage invoices and record payments.
- Cannot create staff or modify admin-only configuration unless explicitly granted.

### Customer
- View only their own profile, subscriptions, invoices and payments.
- No access to other customers' data or internal admin screens.
- Customer self-service actions must be explicitly allowed by backend policy.

## 4. MVP priority

### P0: must work
- Authentication and server-side role/ownership checks.
- Product and variant management.
- Plan management.
- Customer records.
- Quotation creation and conversion.
- Subscription lifecycle.
- Centralized pricing, tax and discount calculation.
- Invoice generation and duplicate protection.
- Payment recording and outstanding balance.
- Dashboard summary and filtered lists.

### P1: implement if time permits
- Polished downloadable invoice PDF.
- Billing run history.
- Audit log.
- Automated cron trigger in addition to manual billing.
- Password reset email delivery.
- Quotation templates UI.

### P2: stretch
- Advanced analytics and export.
- Customer self-service pause/cancel/renew.
- Email delivery and notifications.
- More extensive tests and API documentation.

## 5. Explicitly out of scope for the MVP
- Real card/UPI payment gateway integration. The requirement is to record payments, not process them.
- Multi-currency.
- Full GST/legal tax engine or jurisdiction-specific tax compliance.
- Microservices, Kubernetes, Redis and distributed queue infrastructure.
- Complex proration, metered usage and seat-based mid-cycle proration.
- Full double-entry accounting.

## 6. Success criteria

A judge should be able to follow a coherent end-to-end demonstration:
create product and plan → create quotation → activate subscription → generate invoice → record partial/full payment → see accurate dashboard changes.

The demo must use persistent database data, not disconnected frontend-only mock state.
