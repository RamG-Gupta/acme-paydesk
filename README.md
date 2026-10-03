# ACME PayDesk

Web salary desk for ACME HR: browse 10,000 employees, adjust pay with an audit trail, and answer “how do we pay people?” without Excel.

Persona: **HR manager**. Stack: **Rails 8 API + SQLite** and **React (Vite + Tailwind)**.

Read `requirement.md` for scope, `docs/architecture.md` for the design, `docs/tradeoffs.md` for what we skipped and why, and `docs/ai-usage.md` for how the assistant was used.

## Quick start (local)

Needs Ruby 4.0.2 (see `.ruby-version`), Bundler, Node 22, and SQLite.

```bash
bundle install
bin/rails db:prepare
bin/rails db:seed          # 10,000 employees (~1–2s)
bin/rails test
bin/rails server           # API on http://localhost:3000
```

In another terminal:

```bash
cd frontend
npm install
npm run dev                # UI on http://localhost:5173 (proxies /api to Rails)
```

Open http://localhost:5173. Search a name, filter by country, open **Adjust**, change a salary, and save with a reason. Analytics at the top are grouped **by currency** so INR is never added to USD.

## One-command deploy (Docker)

```bash
docker compose up --build
```

App: http://localhost:3000 (SPA + API, auto-seeds if the database is empty).

This is a demo image (`SECRET_KEY_BASE` is in `docker-compose.yml`). A real deployment should inject secrets, restrict `config.hosts`, and put SQLite on a persistent volume (already mounted at `/rails/storage`).

## What HR can do

- Paginated directory (server-side, 20 per page)
- Search name/email; filter country, department, status
- See payroll totals and averages **per currency**
- See headcount by department
- Change base + allowances with a mandatory reason and history

## Tests

```bash
bin/rails test
```

Coverage is the compensation domain: filters, pagination, pay updates, audit logs, analytics grouping.

## Demo video

Record a 2–3 minute pass: load the seeded roster, search, filter India, open an employee, change pay with a reason, show the audit trail, and point at the currency-grouped payroll cards.
