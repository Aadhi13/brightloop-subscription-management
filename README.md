# Brightloop Subscription Management System

Engineering specification for the hackathon MVP.

**Product:** Brightloop  
**Architecture:** Modular monolith  
**Stack:** React + Vite + JavaScript / Express + MongoDB + Mongoose  
**Database:** MongoDB Atlas  
**Design system:** Verdant Ledger  
**Currency:** INR, stored as integer paise  
**Business timezone:** Asia/Kolkata; persist timestamps in UTC

This repository is the source of truth for implementation decisions. The coding agent must read these documents before implementing a module and must not silently change architectural decisions.

## Documents

| File | Purpose |
|---|---|
| `docs/PRODUCT_SCOPE.md` | Requirements, workflows and MVP scope |
| `docs/ARCHITECTURE.md` | Architecture, repository structure and engineering conventions |
| `docs/DATABASE.md` | Collections, schemas, indexes and data integrity |
| `docs/API.md` | REST API contract and response conventions |
| `docs/BUSINESS_RULES.md` | Pricing, billing, lifecycle, discounts and payments |
| `docs/UI_DESIGN.md` | Design system, navigation and UX requirements |
| `docs/EXECUTION_PLAN.md` | Milestones, priorities, acceptance criteria and demo |
| `AGENT_RULES.md` | Instructions every AI coding agent must follow |

## Run locally

The exact commands depend on the generated package scripts. Expected layout:

```bash
cd server && npm run dev
cd client && npm run dev
```

Required server environment variables are documented in `docs/ARCHITECTURE.md`.

## Scope discipline

Build the complete happy-path business workflow before optional features:
product/plan → quotation → subscription → invoice → payment → dashboard.

Do not claim production readiness. This is a time-boxed hackathon MVP. External payment processing, complex tax jurisdiction support, multi-currency, distributed job orchestration and enterprise accounting integrations are out of scope unless explicitly requested.
