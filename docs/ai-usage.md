# How AI was used

This assessment is built in Cursor with an agentic coding assistant. AI accelerated scaffolding and boilerplate; product scope, data-model choices, and “what not to build” were decided explicitly (see `requirement.md` and `tradeoffs.md`).

## What AI was asked to do

- Turn the brief into a one-page PRD with **out of scope** called out.
- Implement Rails models, migrations, JSON API, seed of 10,000 employees, and React UI.
- Write Minitest coverage for filtering, pay updates, audit logs, and analytics.
- Wire CORS, Vite proxy, Docker image that serves the SPA + API.

## What was not delegated blindly

- **Currency mixing** — rejected a single global payroll KPI.
- **Auth / payroll / tax** — rejected as scope theater.
- **LIKE search SQL** — kept parameterized; escaped `%` / `_`.
- **Pay updates** — require a reason and write history in the same transaction, including allowance-only changes (the first API draft only logged base-salary edits).
- **Tests** — replaced scaffold stubs (`get api_v1_employees_index_url`) with real request examples.

## Review habit

After generation, the assistant (and a human pass) checked: truncated UI files, commented-out CORS, missing model associations, `per_page` clamping bugs, Hindi/English comment mix, and accidentally committed `node_modules`.
