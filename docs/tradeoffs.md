# Trade-offs

**SQLite vs Postgres.** SQLite removes ops work and is explicitly allowed. 10k employees with indexes is well inside SQLite’s comfort zone. Postgres would be the right production default for concurrent HR writers and WAL over NFS; not needed to prove the product.

**Offset vs cursor pagination.** Offset is simple, matches page numbers HR expects, and is cheap at page 1–N for 10k rows. Deep offsets are irrelevant here.

**No FX rollup.** A single “global payroll” number would look impressive and be wrong. Grouping by currency is the honest executive answer.

**No auth.** The brief is a single HR manager. Adding fake login would imply security we did not implement (password reset, session fixation, authorization on updates). Documented as an internal tool.

**Allowances stored as a lump sum** rather than a line-item catalog (HRA, bonus, …). HR can still model total cash; a component catalog is a payroll product, not a salary desk.

**API-only Rails + separate React app.** Clear boundary for tests and UI iteration. Docker collapses them so a reviewer runs one container.

**Tailwind utility CSS vs a component kit (MUI, etc.).** Faster to ship a focused desk without fighting a design system. Icons from `lucide-react` only.
