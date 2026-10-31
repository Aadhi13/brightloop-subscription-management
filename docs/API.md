# REST API Contract

Base path: `/api`

All endpoints return JSON. Protected endpoints require authentication. Admin/staff/customer permissions are enforced server-side.

## Response conventions

Success:
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

Error:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  }
}
```

List response:
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "pages": 0
    }
  }
}
```

Use appropriate HTTP status codes: 200, 201, 204, 400, 401, 403, 404, 409, 422 and 500.

List endpoints accept `page`, `limit`, `search`, `sortBy`, `sortOrder` and module-specific filters. Default `limit=20`; maximum `100`.

## Health and authentication

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/health` | Public | Health check |
| POST | `/auth/register` | Public | Customer registration |
| POST | `/auth/login` | Public | Login |
| POST | `/auth/logout` | Authenticated | Logout/invalidate session if supported |
| GET | `/auth/me` | Authenticated | Current user |
| POST | `/auth/forgot-password` | Public, rate-limited | Request reset |
| POST | `/auth/reset-password` | Public, token | Reset password |

Staff creation:
| Method | Path | Access |
|---|---|---|
| POST | `/users/staff` | Admin |
| GET | `/users` | Admin |
| PATCH | `/users/:id/status` | Admin |

## Customers

| Method | Path | Access |
|---|---|---|
| GET | `/customers` | Admin, Staff |
| POST | `/customers` | Admin, Staff |
| GET | `/customers/:id` | Admin, Staff; Customer only own record |
| PATCH | `/customers/:id` | Admin, Staff; Customer only allowed own fields |
| PATCH | `/customers/:id/archive` | Admin, Staff |

## Products

| Method | Path | Access |
|---|---|---|
| GET | `/products` | Authenticated, according to role |
| POST | `/products` | Admin |
| GET | `/products/:id` | Admin, Staff |
| PATCH | `/products/:id` | Admin |
| PATCH | `/products/:id/archive` | Admin |

Product create/update body includes name, type, salesPrice, costPrice, notes and variants. Monetary values are integer paise.

## Plans

| Method | Path | Access |
|---|---|---|
| GET | `/plans` | Authenticated |
| POST | `/plans` | Admin |
| GET | `/plans/:id` | Authenticated |
| PATCH | `/plans/:id` | Admin |
| PATCH | `/plans/:id/archive` | Admin |

Plan body includes price (paise), currency, billingInterval, billingIntervalCount, minimumQuantity, availability dates and policies.

## Taxes and discounts

| Method | Path | Access |
|---|---|---|
| GET | `/tax-rules` | Admin, Staff |
| POST | `/tax-rules` | Admin |
| PATCH | `/tax-rules/:id` | Admin |
| GET | `/discount-rules` | Admin, Staff |
| POST | `/discount-rules` | Admin |
| PATCH | `/discount-rules/:id` | Admin |
| PATCH | `/discount-rules/:id/archive` | Admin |

## Quotation templates and quotations

| Method | Path | Access |
|---|---|---|
| GET | `/quotation-templates` | Admin, Staff |
| POST | `/quotation-templates` | Admin |
| PATCH | `/quotation-templates/:id` | Admin |
| GET | `/quotations` | Admin, Staff; customer sees own |
| POST | `/quotations` | Admin, Staff |
| GET | `/quotations/:id` | Admin, Staff; customer sees own |
| POST | `/quotations/:id/send` | Admin, Staff |
| POST | `/quotations/:id/accept` | Admin, Staff or authorized customer flow |
| POST | `/quotations/:id/reject` | Admin, Staff or authorized customer flow |
| POST | `/quotations/:id/convert` | Admin, Staff |

## Subscriptions

| Method | Path | Access |
|---|---|---|
| GET | `/subscriptions` | Admin, Staff; customer sees own |
| POST | `/subscriptions` | Admin, Staff |
| GET | `/subscriptions/:id` | Admin, Staff; customer sees own |
| POST | `/subscriptions/:id/confirm` | Admin, Staff |
| POST | `/subscriptions/:id/activate` | Admin, Staff or system |
| POST | `/subscriptions/:id/pause` | Admin, Staff; customer only if policy permits |
| POST | `/subscriptions/:id/resume` | Admin, Staff; customer only if policy permits |
| POST | `/subscriptions/:id/close` | Admin, Staff; customer only if policy permits |
| POST | `/subscriptions/:id/renew` | Admin, Staff |

Avoid a generic endpoint that lets clients set arbitrary `status`.

## Billing and invoices

| Method | Path | Access |
|---|---|---|
| POST | `/billing/run` | Admin |
| GET | `/billing/runs` | Admin, Staff |
| GET | `/invoices` | Admin, Staff; customer sees own |
| GET | `/invoices/:id` | Admin, Staff; customer sees own |
| POST | `/invoices/:id/confirm` | Admin, Staff |
| POST | `/invoices/:id/cancel` | Admin, Staff, subject to rules |
| POST | `/invoices/:id/send` | Admin, Staff; may be stubbed transparently |
| GET | `/invoices/:id/pdf` | Admin, Staff; customer sees own |

The billing endpoint may accept a cutoff date for controlled testing, but never trust client-supplied invoice totals.

## Payments

| Method | Path | Access |
|---|---|---|
| GET | `/payments` | Admin, Staff; customer sees own |
| POST | `/payments` | Admin, Staff |
| GET | `/payments/:id` | Admin, Staff; customer sees own |

Payment create body: `invoiceId`, `method`, `amount` (paise), `paidAt`, `note`, optional `reference`. The server validates the invoice and balance.

## Analytics

| Method | Path | Access |
|---|---|---|
| GET | `/analytics/overview` | Admin, Staff |
| GET | `/analytics/revenue` | Admin, Staff |
| GET | `/analytics/overdue` | Admin, Staff |
| GET | `/analytics/subscriptions` | Admin, Staff |

Support date range filters such as `from` and `to`. Clearly define whether revenue means cash received or invoice value. The dashboard should show these as separate metrics.

## API implementation notes

- Validate params, query and body using Zod.
- Never trust customerId/userId from the browser for customer-scoped endpoints.
- Derive actor identity from authenticated context.
- Enforce object-level authorization after loading or within the query.
- Use service-layer methods for state transitions.
- Use stable error codes for business conflicts, e.g. `INVALID_STATUS_TRANSITION`, `INVOICE_ALREADY_PAID`, `PAYMENT_EXCEEDS_BALANCE`, `DUPLICATE_BILLING_PERIOD`.
- Do not expose stack traces in production.
