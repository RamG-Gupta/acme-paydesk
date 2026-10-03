# Product Requirements Document (PRD): ACME Salary Management

## 1. Goal & Objective
ACME Org's HR team currently manages compensation data for 10,000 employees globally using static Excel spreadsheets. This system is error-prone, untrackable, and performance-heavy. 
The goal is to deliver a secure, web-based internal task desk enabling the HR Manager to efficiently browse global headcount, filter across multi-country distributions, perform rapid salary adjustments, and extract instant operational insights.

## 2. Scope & Core Features
- **High-Performance Directory:** A paginated grid displaying 10,000 employees without UI lag, powered by server-side offset pagination.
- **Granular Filters & Search:** Multi-attribute filtering (Country, Department, Status) and real-time substring search matching Names or Emails.
- **Compensation Desk:** A secure interface to adjust an employee's Base Salary and Allowances with mandatory audit trails (reason logging).
- **Executive Analytics:** Dynamic widgets revealing Total Payroll Spend grouped by operational currency and headcount distributions by department.

## 3. Deliberate Omissions (Out of Scope) & Rationales
- **Automated Disbursal Gateways:** Direct bank integrations or real-time payout processing are omitted. *Rationale:* Focus is strictly bounded to internal data administration and cost analytics rather than transactional clearance.
- **Role-Based Access Control (RBAC):** Granular permission profiles (e.g., Regional HR vs. Global Admin) are deferred. *Rationale:* Designed explicitly for a unified singular user persona (Global HR Manager) to minimize structural bloat for this pass.
- **Automated Tax Calculation Engine:** Auto-deductions based on localized statutory tables are excluded. *Rationale:* Raw compensation metrics provide the necessary analytical baseline without nesting highly volatile regional tax frameworks into the core database.

## 4. Engineering Trade-offs
- **SQLite Database Choice:** Chosen for low configuration overhead and lightning-fast local testing. To support 10,000 rows efficiently, strict database indexing on structural foreign keys and text filter targets (`country`, `department`, `name`) has been executed.
- **Custom Native Pagination:** Avoided heavy third-party gems or component libraries for pagination logic. Standardized native raw SQL `LIMIT` and `OFFSET` queries to ensure extreme speed and deterministic payload sizes.
