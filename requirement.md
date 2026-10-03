# ACME PayDesk — Requirements (one page)

**Product:** web salary desk for ACME’s HR manager  
**Persona:** one Global HR Manager who today lives in Excel  
**Scale:** 10,000 employees across five countries / five currencies  
**Success:** replace spreadsheet browsing, salary edits, and “how do we pay people?” questions with a fast, auditable web app

## Goal

Give HR a single place to (1) find anyone on the roster, (2) change pay with a recorded reason, and (3) answer org-level pay questions without opening 10k-row workbooks.

## In scope (v1)

| Capability | Why it exists |
|---|---|
| Paginated employee directory (server-side, ~20 rows) | 10k rows cannot ship to the browser |
| Search by name/email; filter by country, department, employment status | Matches how HR actually slices a roster |
| View employee compensation in **local currency** | Mixing USD+INR into one total is a lie |
| Edit base salary and allowances | Core job of the desk |
| Mandatory change reason + immutable salary history | Excel has no audit trail; this is the product differentiator |
| Analytics: headcount, payroll **by currency**, headcount by department | Answers “how the org pays people” without a BI tool |

## Deliberately out of scope

| Omitted | Reason |
|---|---|
| Login / SSO / RBAC | Brief specifies a single persona. Auth would dominate the build and hide the compensation problem. Treat the app as an internal network tool. |
| Payroll disbursement, banks, payslips | Administration and insight, not money movement |
| Statutory tax / social cost engines | Volatile by jurisdiction; would fake accuracy |
| FX conversion of payroll into one “global USD” | Requires a rate source and policy (spot vs budget). Show native currency instead of a false total. |
| Hiring, termination workflows, org chart | Adjacent HRIS; not salary management |
| CSV import/export, bulk raises | Valuable later; v1 proves the interactive loop |
| Real-time collaboration / Excel sync | Would recreate the problem we are replacing |

## Product principles

1. **Correctness over dashboard theater.** Never add INR to USD.
2. **Auditability over convenience.** No silent pay change.
3. **10k is a query problem, not a UI-virtualization problem.** Filter and paginate in SQL.
4. **Ship a thin slice that is production-shaped:** validations, indexes, tests, one-command run.

## Non-functional

- Directory and analytics stay snappy at 10k rows (indexed filters, aggregates in the database).
- Seed is idempotent and bulk (`insert_all`) so demos reset in seconds.
- Tests cover filtering, pagination, compensation updates, and analytics math.
