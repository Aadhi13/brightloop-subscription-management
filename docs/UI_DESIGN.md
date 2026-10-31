# UI and Design System: Verdant Ledger

## 1. Design direction

Use an editorial finance-console aesthetic: warm paper-like surfaces, botanical green, charcoal typography and restrained terracotta accents.

Avoid the generic dark-blue SaaS palette. Avoid applying glassmorphism everywhere.

### Palette

| Token | Hex | Usage |
|---|---|---|
| `paper` | `#F6F3EC` | Main app background |
| `surface` | `#FFFEFA` | Cards, tables, forms |
| `charcoal` | `#252923` | Primary text |
| `forest` | `#47785B` | Primary actions, success |
| `terracotta` | `#C8795B` | Attention, selected accent |
| `amber` | `#D5A64D` | Pending/warning |
| `stone` | `#DAD6CB` | Borders, dividers |
| `muted` | `#77796F` | Secondary text |

Use semantic tokens consistently:
- Paid/success: forest green.
- Pending/warning: amber.
- Overdue/destructive: terracotta or accessible red variant.
- Neutral/draft: stone/charcoal.
- Primary action: forest.

Do not rely on color alone; pair status colors with text and/or icons.

## 2. Typography and layout

- Use a highly readable sans-serif for UI.
- Use tabular numerals for monetary amounts, dates and metrics.
- Use consistent spacing, radius and elevation tokens.
- Prefer clear information hierarchy over decoration.
- Tables must remain readable at realistic data density.
- Ensure responsive behavior for laptop and mobile.
- Maintain accessible contrast and visible keyboard focus.

## 3. Glassmorphism policy

Use restrained glass effects only for:
- Login panel, if it improves the composition.
- Modal backdrops.
- Small overlay elements.

Do not use translucent/blurred surfaces behind:
- Financial tables.
- Invoice line items.
- Dense forms.
- Small text or charts.

The invoice PDF must be clean, high contrast and printer-friendly, with no glassmorphism.

## 4. Main navigation

Admin/staff shell:
- Overview
- Customers
- Products
- Plans
- Quotations
- Subscriptions
- Invoices
- Payments
- Discounts (Admin)
- Settings (Admin)

Customer portal:
- Overview
- My subscriptions
- My invoices
- Payment history
- Profile

Hide unavailable navigation for UX, but always enforce authorization in the API.

## 5. Page requirements

### Dashboard
- KPI cards: active subscriptions, cash received in selected period, outstanding balance, overdue invoice count/value.
- Revenue chart with clear date range.
- Recent invoices/payments/activity.
- Filters for date range.
- Distinguish cash received from invoice value/revenue billed.

### Products
- Searchable table.
- Create/edit form.
- Variant editor with price adjustment.
- Archive action.
- Show prices formatted from paise.

### Plans
- Price, billing interval and interval count.
- Minimum quantity.
- Availability window.
- Lifecycle policy toggles.
- Clear validation.

### Quotations
- Customer selector.
- Template selector.
- Plan and product lines.
- Quantity and negotiated price.
- Validity date.
- Calculated subtotal/tax/discount/total preview from server quote calculation where possible.

### Subscriptions
- Number, customer, plan, status, start/expiry, next billing.
- Status filter and search.
- Detail view with timeline and invoice history.
- Explicit transition actions; do not expose arbitrary status editing.

### Invoices
- Invoice number, customer, issue/due date, total, paid, balance and status.
- Filter by status/date/customer.
- Detail page with line-item breakdown.
- Confirm, cancel, record payment, print/download actions as permitted.

### Invoice PDF
- Professional document with company identity, invoice number, dates, bill-to snapshot, line items, subtotal, discount, tax, total, payment history/balance and payment instructions placeholder.
- Clear INR formatting.
- High contrast, printer-friendly.
- PDF values must come from persisted invoice data, not a separate frontend recalculation.

## 6. UX states

Every data-driven page must have:
- Loading state/skeleton.
- Empty state with a useful next action.
- Error state with retry where appropriate.
- Success/error feedback after mutations.
- Form validation messages near relevant fields.
- Confirmation for destructive or irreversible actions.
- Disabled/loading button states to prevent accidental duplicate submissions.

## 7. Reusable components

Prioritize:
- AppShell, Sidebar, Topbar
- PageHeader, Breadcrumbs
- StatCard
- DataTable
- StatusBadge
- SearchInput, FilterBar
- FormField, CurrencyInput
- ConfirmDialog
- EmptyState, ErrorState, LoadingSkeleton
- InvoicePreview

Avoid building a large design system before the business workflow works.
