# Database Design

## General conventions

- MongoDB database: `brightloop`
- Use Mongoose ObjectIds for references.
- Use timestamps on mutable business documents.
- Normalize email addresses before persistence.
- Persist timestamps in UTC.
- Store all INR monetary values as integer paise (`₹1 = 100 paise`).
- Validate amounts as safe integers and non-negative/positive as appropriate.
- Use snapshots for historical financial and contractual values.
- Prefer archival (`isArchived`/`archivedAt`) over deleting referenced business records.

## Collections

### 1. users
```js
{
  email: String,             // normalized, unique
  passwordHash: String,
  role: "admin" | "staff" | "customer",
  isActive: Boolean,
  emailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```
Indexes: unique `{ email: 1 }`; `{ role: 1, isActive: 1 }`.

### 2. customers
```js
{
  userId: ObjectId,          // optional for staff-created customers
  name: String,
  companyName: String,
  email: String,
  phone: String,
  billingAddress: {
    street: String, city: String, state: String,
    postalCode: String, country: String
  },
  taxId: String,
  isArchived: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```
Indexes: `{ userId: 1 }`; `{ email: 1 }`; text/search indexes only if actually used. If a customer account is linked, enforce one-to-one uniqueness on non-null `userId` using a partial unique index.

### 3. products
```js
{
  name: String,
  type: String,
  salesPrice: Number,        // paise
  costPrice: Number,         // paise
  notes: String,
  variants: [{
    name: String,
    value: String,
    priceAdjustment: Number  // paise, can be negative if allowed
  }],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```
Indexes: `{ isActive: 1, name: 1 }`.

### 4. plans
```js
{
  name: String,
  description: String,
  price: Number,             // paise, recurring plan base price
  currency: "INR",
  billingInterval: "daily" | "weekly" | "monthly" | "yearly",
  billingIntervalCount: Number, // default 1
  minimumQuantity: Number,
  availableFrom: Date,
  availableUntil: Date,
  policies: {
    autoClose: Boolean,
    allowEarlyClose: Boolean,
    allowPause: Boolean,
    allowRenewal: Boolean
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```
Indexes: `{ isActive: 1, name: 1 }`.

### 5. quotationTemplates
```js
{
  name: String,
  validityDays: Number,
  planId: ObjectId,
  lines: [{
    productId: ObjectId,
    productSnapshot: { name: String, type: String },
    variant: { name: String, value: String },
    quantity: Number,
    unitPrice: Number       // paise
  }],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 6. quotations
```js
{
  quotationNumber: String,   // unique
  customerId: ObjectId,
  templateId: ObjectId,
  planId: ObjectId,
  status: "draft" | "sent" | "accepted" | "rejected" | "expired",
  validUntil: Date,
  startDate: Date,
  expiryDate: Date,
  paymentTermsDays: Number,
  lines: [lineSnapshot],
  subtotal: Number,           // paise
  discountAmount: Number,     // paise
  taxAmount: Number,          // paise
  total: Number,              // paise
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```
`lineSnapshot` includes productId (optional historical reference), productName, variant, quantity, unitPrice, subtotal, taxRate and taxAmount. Snapshot agreed commercial values; do not recalculate an accepted quotation from current product prices.

### 7. subscriptions
```js
{
  subscriptionNumber: String, // unique
  customerId: ObjectId,
  quotationId: ObjectId,
  planId: ObjectId,
  status: "draft" | "quotation" | "confirmed" | "active" |
          "paused" | "closed",
  startDate: Date,
  expiryDate: Date,
  nextBillingDate: Date,
  paymentTermsDays: Number,
  billingInterval: String,    // snapshot from plan
  billingIntervalCount: Number,
  planPrice: Number,          // paise snapshot
  lines: [lineSnapshot],
  pausedAt: Date,
  closedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```
Indexes:
- unique `{ subscriptionNumber: 1 }`
- `{ status: 1, nextBillingDate: 1 }`
- `{ customerId: 1, createdAt: -1 }`
- `{ planId: 1, status: 1 }`

### 8. taxRules
```js
{
  name: String,
  rateBps: Number,             // basis points; 1800 = 18%
  appliesToProductIds: [ObjectId],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```
Use basis points or a documented integer representation instead of floating-point percentages. This MVP supports simple percentage tax only; it is not a jurisdiction-compliant tax engine.

### 9. discountRules
```js
{
  name: String,
  type: "fixed" | "percentage",
  amount: Number,              // paise for fixed discount
  rateBps: Number,              // percentage discount
  minimumPurchase: Number,     // paise
  minimumQuantity: Number,
  startsAt: Date,
  endsAt: Date,
  maxUses: Number,              // null means unlimited
  usedCount: Number,
  productIds: [ObjectId],
  appliesToSubscription: Boolean,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```
Validate that only the appropriate value field is used for the selected discount type. Enforce usage limits atomically. For reliable per-invoice redemption history, add a `discountRedemptions` collection with unique `{ discountRuleId: 1, invoiceId: 1 }`.

### 10. invoices
```js
{
  invoiceNumber: String,        // unique
  subscriptionId: ObjectId,
  customerId: ObjectId,
  billingKey: String,
  billingPeriodStart: Date,
  billingPeriodEnd: Date,
  issueDate: Date,
  dueDate: Date,
  status: "draft" | "confirmed" | "paid" | "cancelled",
  lines: [invoiceLineSnapshot],
  subtotal: Number,             // paise
  discountAmount: Number,       // paise
  taxAmount: Number,            // paise
  total: Number,                // paise
  amountPaid: Number,           // paise
  balanceDue: Number,           // paise
  customerSnapshot: Object,
  confirmedAt: Date,
  cancelledAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```
`invoiceLineSnapshot` includes description, product reference if useful, quantity, unitPrice, subtotal, tax rate and tax amount. Once confirmed, financial/customer snapshots should not be silently edited.

Indexes:
- unique `{ invoiceNumber: 1 }`
- unique `{ subscriptionId: 1, billingKey: 1 }` for subscription-generated invoices
- `{ status: 1, dueDate: 1 }`
- `{ customerId: 1, createdAt: -1 }`
- `{ subscriptionId: 1, billingPeriodStart: 1 }`

For manually created invoices without a subscription, use a nullable subscriptionId and a partial unique index so unrelated manual invoices do not collide.

### 11. payments
```js
{
  invoiceId: ObjectId,
  method: "cash" | "bank_transfer" | "upi" | "card" | "other",
  amount: Number,               // positive paise
  paidAt: Date,
  note: String,
  reference: String,
  recordedBy: ObjectId,
  createdAt: Date
}
```
Indexes: `{ invoiceId: 1, paidAt: -1 }`; optional unique payment reference where provided and applicable.

### 12. billingRuns
```js
{
  runId: String,
  triggeredBy: "manual" | "scheduled",
  startedAt: Date,
  finishedAt: Date,
  status: "running" | "completed" | "failed" | "partial",
  processedCount: Number,
  generatedCount: Number,
  skippedCount: Number,
  failedCount: Number,
  summary: Object
}
```

### 13. auditLogs
```js
{
  actorId: ObjectId,
  action: String,
  entityType: String,
  entityId: ObjectId,
  metadata: Object,
  createdAt: Date
}
```
Do not store passwords, tokens, full payment credentials or other secrets in audit metadata.

## Money and rounding

Use integer paise. For percentage rates, use basis points (`10000 = 100%`). Document one rounding rule and apply it consistently, preferably integer arithmetic with rounding at the defined line/tax calculation boundary.

## Number generation

Do not use `countDocuments() + 1` for invoice/subscription numbers; concurrent requests can produce duplicates. Use a `counters` collection and atomic `findOneAndUpdate` increment, or generate a collision-resistant identifier with a unique index. A readable prefix such as `INV-2026-000123` is useful but must be generated safely.

## Important consistency rules

- Product/plan changes do not rewrite existing quotation, subscription or invoice snapshots.
- Payment and invoice balance updates are one atomic operation.
- Billing generation is idempotent for a subscription + billing period.
- Customer access is always scoped by authenticated ownership.
- Discount usage limits are enforced atomically.
- Invoice totals are computed on the server, never trusted from the client.
