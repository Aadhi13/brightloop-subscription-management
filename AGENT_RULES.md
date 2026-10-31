# AI Agent Working Agreement

These rules apply to Antigravity and any other coding agent working on this repository.

## Before every task
1. Read `README.md` and the relevant documents in `docs/`.
2. Inspect the existing implementation before editing.
3. Identify the smallest coherent change that satisfies the task.
4. State the files expected to change and the acceptance criteria.
5. Do not overwrite or regenerate working modules unnecessarily.

## Implementation rules
- Follow the modular monolith in `docs/ARCHITECTURE.md`.
- Follow the API contract in `docs/API.md`.
- Follow schemas, indexes and references in `docs/DATABASE.md`.
- Follow business invariants in `docs/BUSINESS_RULES.md`.
- Follow the design tokens and interaction rules in `docs/UI_DESIGN.md`.
- JavaScript + ES modules. Do not introduce TypeScript unless explicitly approved.
- Keep controllers thin. Put business operations in services.
- Validate all external input on the server with Zod.
- Enforce authorization on the server. Frontend route guards are UX only.
- Never trust client-supplied user IDs, prices, totals, roles or payment balances.
- Store money as integer paise. Do not use floating-point arithmetic for money.
- Use UTC for persisted timestamps and Asia/Kolkata for business-facing date display.
- Use database constraints and atomic operations for invariants that can race.
- Never silently mutate confirmed invoice snapshots.
- Use pagination for list endpoints. Never return an unbounded collection.
- Add useful loading, empty, success and error states to UI.
- Avoid unnecessary dependencies and unrelated refactors.
- Do not add microservices, Redis, queues, Docker or payment gateways unless explicitly approved.

## Task execution
For each task:
1. Implement only the requested scope.
2. Run the relevant lint/build/test commands that exist.
3. Exercise the acceptance criteria.
4. Inspect the final diff for unrelated changes, secrets and debug code.
5. Report changed files, commands run, test outcomes, known limitations and any follow-up work.
6. Do not commit unless explicitly asked. If asked, make one meaningful commit for the verified change.

## Do not
- Generate the entire application in one pass.
- invent endpoints, fields, business rules or dependencies that conflict with these specs.
- create duplicate components or services when an existing one can be extended.
- claim tests passed if they were not run.
- hide errors with broad empty catch blocks.
- use mock data in production paths. Demo seed data must be clearly separated.
- implement fake security, such as checking roles only in React.
- change a requirement because it is inconvenient; report conflicts and ask.

## Definition of done
A task is done only when its acceptance criteria are met, relevant tests/build pass, errors are handled, and the agent has summarized what changed and what remains.
