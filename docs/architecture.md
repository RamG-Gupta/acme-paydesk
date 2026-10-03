# Architecture

```
HR browser  →  React (Vite + Tailwind)
                    │  /api/v1/*
                    ▼
              Rails 8 API
                    │
              SQLite (employees, salary_logs)
```

**Runtime:** in development, Vite proxies `/api` to Puma `:3000`. In Docker, the React build is copied into `public/` and Rails serves both the SPA and the API.

## Domain

- **Employee** — identity, org attributes, current pay (`base_salary`, `allowances`, `currency`, `status`).
- **SalaryLog** — append-only compensation event: previous/new base and allowances, required `change_reason`.

Pay is stored as `decimal(12,2)` in the employee’s local currency. Totals are always `GROUP BY currency`.

## Request paths

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/employees` | `search`, `country`, `department`, `status`, `page`, `per_page` (1–100) |
| GET | `/api/v1/employees/analytics` | SQL `SUM`/`AVG`/`COUNT` grouped by currency + department counts |
| GET | `/api/v1/employees/:id` | Employee + salary logs (newest first) |
| PATCH/PUT | `/api/v1/employees/:id` | Transactional pay update + log row |

`GET /up` is the health check.

## Why this shape

- **Rails API + SQLite** matches the role stack already in the repo and keeps 10k rows trivial to host.
- **No pagination gem.** Offset pagination is enough at this scale; the payload stays small on purpose.
- **No Redis/Postgres** in v1. SQLite + indexes beats operational complexity for an assessment and for 10k rows.
- **Compensation changes live on the Employee model** (`adjust_compensation!`) so the controller stays a thin HTTP adapter and tests can hit the domain without HTTP.

## Performance notes

- Indexes: `email` (unique), `name`, `country`, `department`, `status`, `currency`.
- `LIKE '%term%'` will not use a B-tree well; at 10k rows a table scan is acceptable. Full-text search is a later upgrade.
- Analytics uses one grouped aggregate query plus one `GROUP BY department` count — not 10k Ruby objects.
- Seed uses `insert_all!` (single statement) instead of 10k `create!` calls.
