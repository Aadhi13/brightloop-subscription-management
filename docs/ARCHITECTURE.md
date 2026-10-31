# Architecture and Repository Structure

## 1. Architecture decision

Use a **modular monolith**: one React application, one Express API and one MongoDB database. Modules have clear boundaries but are deployed as one backend.

Do not use microservices for this time-boxed MVP. They add deployment, communication and consistency costs without improving the core demonstration.

## 2. Stack

### Frontend
- React + Vite
- JavaScript (ES modules)
- React Router
- Tailwind CSS
- shadcn/ui components where useful
- Lucide React
- TanStack Query for server state/cache
- React Hook Form + Zod for forms
- Recharts for dashboard charts
- date-fns for date formatting/calculation
- Sonner for notifications
- Axios or fetch through a centralized API client

### Backend
- Node.js + Express
- MongoDB Atlas + Mongoose
- Zod request validation
- bcryptjs password hashing
- JWT authentication
- Helmet, CORS and express-rate-limit
- node-cron for a single-instance scheduled billing trigger
- jsPDF on the frontend or server for invoice PDF, whichever is simpler and verified

### Development
- Git
- ESLint + Prettier
- Vitest for frontend/unit tests; Node test runner or Vitest for backend tests
- Postman/Thunder Client for API verification

Avoid adding libraries without a concrete requirement.

## 3. Repository structure

```text
brightloop/
├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   └── shared/
│   │   ├── layouts/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── products/
│   │   │   ├── plans/
│   │   │   ├── customers/
│   │   │   ├── quotations/
│   │   │   ├── subscriptions/
│   │   │   ├── invoices/
│   │   │   ├── payments/
│   │   │   └── settings/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── customers/
│   │   │   ├── products/
│   │   │   ├── plans/
│   │   │   ├── quotations/
│   │   │   ├── subscriptions/
│   │   │   ├── taxes/
│   │   │   ├── discounts/
│   │   │   ├── billing/
│   │   │   ├── invoices/
│   │   │   ├── payments/
│   │   │   └── analytics/
│   │   ├── jobs/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   └── package.json
├── docs/
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── AGENT_RULES.md
```

A typical backend module:
```text
invoices/
├── invoice.model.js
├── invoice.routes.js
├── invoice.controller.js
├── invoice.service.js
└── invoice.validator.js
```

Not every module needs five files if that creates empty boilerplate. Preserve separation of concerns without ceremony.

## 4. Backend responsibilities

- Routes: URL, middleware and controller wiring.
- Controllers: parse request, call service, send HTTP response.
- Services: business operations and transaction boundaries.
- Models: persistence schema, indexes and basic schema constraints.
- Validators: validate params, query and body at the API boundary.
- Jobs: invoke services on a schedule; do not duplicate business logic.
- Middleware: authentication, authorization, error handling and request context.

Keep business logic out of controllers and React components.

## 5. Environment

`server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

`client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Never commit real `.env` files or secrets. Commit `.env.example` with placeholders. Use a long random JWT secret (e.g. `openssl rand -base64 48`).

## 6. API infrastructure

- Prefix all API routes with `/api`.
- Use JSON request/response bodies.
- Configure CORS for the exact frontend origin.
- Use Helmet.
- Apply rate limiting to authentication and password-reset endpoints.
- Set request body size limits.
- Centralize 404 and error handling.
- Never expose stack traces or secrets in production responses.
- Include a `/api/health` endpoint.
- Use a consistent error code for expected business errors.

## 7. Authentication and security

For the MVP, use JWT authentication with secure handling. If using browser cookies, configure HttpOnly, Secure in production, and appropriate SameSite settings plus CSRF protection where required. If using bearer tokens, avoid persistent localStorage for sensitive long-lived tokens; use a short-lived access token strategy and explain the trade-off.

- Hash passwords with bcryptjs.
- Enforce password length greater than 8 characters, uppercase, lowercase and special character.
- Normalize emails (trim + lowercase) and enforce a unique index.
- Never return password hashes or reset-token hashes.
- Password reset tokens must be random, hashed at rest, expire and be single-use.
- Do not reveal whether an email exists in password-reset responses.
- Enforce role authorization on the server.
- Scope customer queries by the authenticated user's customer record.
- Admin-only staff creation must be enforced server-side.

## 8. Performance

- Use indexes listed in `DATABASE.md`.
- Paginate list endpoints; default page size 20, maximum 100.
- Filter and sort on the server.
- Use projections to return only required fields.
- Use aggregation pipelines for dashboard summaries.
- Avoid N+1 query patterns and unbounded populate calls.
- TanStack Query may cache list/detail responses; invalidate after mutations.
- Validate important query plans with MongoDB `explain("executionStats")` if time permits.

The under-two-second requirement is a target, not a guarantee independent of hosting/network. Measure representative requests and report actual results.

## 9. Transaction note

MongoDB transactions require a replica set or sharded cluster. MongoDB Atlas clusters support replica-set deployments; verify the selected cluster configuration. Use transactions for payment + invoice balance updates and other multi-document financial operations. If a local standalone MongoDB instance is used, transactions may not work.
