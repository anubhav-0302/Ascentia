# Regression & Feature Audit — 2026-04-23

## Scope

Post the `.env` + `config/env.js` refactor, verified that **every feature and route is intact**. Built a proper end-to-end API regression suite at `@e:\Ascentia\backend\tests\regression-api.js` (`npm run test:regression`) covering all 17 route modules, 3 default roles, and unauthenticated access.

## Result

**111 / 111 checks passing.** No functional regression introduced by the env changes.

```
Total  : 111
Passed : 111
Failed : 0
✔ All regression checks passed.
```

## What the suite covers

- **Auth & config** — login, wrong-password rejection, empty-body rejection, root health
- **Unauthenticated access** — every 25 listed endpoints correctly returns 401 without a token
- **Role matrix** — each endpoint tested against SuperAdmin, Admin, Employee; expected status (`open`/`forbid`/`notfound`) codified
- **Seed data integrity** — `admin@ascentia.com`, `employee@ascentia.com`, `superadmin@ascentia.com` exist and can authenticate
- **Write smoke** — create + list + delete an employee end-to-end
- **Employee self-service** — settings, leaves accessible; admin routes blocked

## Genuine findings surfaced (pre-existing — NOT caused by env refactor)

These are latent design inconsistencies the suite exposed. None are breaking; documenting for future decisions.

### 1. SuperAdmin locked out of several admin-only routes

Some routes use `authorize('admin')` instead of `authorize('admin', 'superAdmin')`, so a logged-in SuperAdmin currently receives **403** on:

| Route | File |
|---|---|
| `GET /api/logs`, `GET /api/logs/statistics` | `@e:\Ascentia\backend\routes\logsRoutes.js:14,114` |
| `GET /api/data-protection/*` (all) | `@e:\Ascentia\backend\routes\dataProtectionRoutes.js:21-36` |
| `GET /api/users`, `POST`, `PUT`, `DELETE` on users | `@e:\Ascentia\backend\routes\userRoutes.js:72-87` |

By contrast, `@e:\Ascentia\backend\routes\roleManagementRoutes.js:24,34,37` correctly uses `authorize('admin', 'superAdmin')`. The inconsistency means a SuperAdmin can manage roles but cannot audit logs, run backups, or manage users — which contradicts the "platform owner" semantic.

**Suggested fix (when you're ready to address SuperAdmin issues):** change each `authorize('admin')` to `authorize('admin', 'superAdmin')` in those three files.

### 2. Default employee role has broader read permissions than expected

The seeded role config grants `employee` the `view` permission on modules where one might expect restriction. Currently verified that an employee can `GET`:

| Endpoint | Observed | Conventional expectation |
|---|---|---|
| `/api/leave` (all org leaves) | 200 | 403 (employees should only see `/api/leave/my`) |
| `/api/timesheet/all` | 200 | 403 |
| `/api/timesheet/history` | 200 | 403 |
| `/api/payroll/salary-components` | 200 | 403 |

**Source:** seeded in `@e:\Ascentia\backend\scripts\seedRoleConfig.js`. Not a code bug — a seed-data choice. The regression suite locks in current behavior; changing the seed will require updating the matrix.

### 3. Test-script artifacts (for info, not bugs)

Older ad-hoc test files in `@e:\Ascentia\backend\` tested non-existent paths (e.g., `/api/dashboard` instead of `/api/dashboard/stats`, `/api/documents` base, `/api/data-protection` base). They still "mostly pass" but mislead. New `tests/regression-api.js` replaces them with accurate paths.

## Files created / updated

| File | Purpose |
|---|---|
| `@e:\Ascentia\backend\tests\regression-api.js` | New — comprehensive API regression suite |
| `@e:\Ascentia\backend\package.json` | Added `npm run test:regression` |
| `@e:\Ascentia\docs\REGRESSION_FINDINGS_2026-04-23.md` | This document |

## How to run

```bash
cd backend
npm run dev          # in one terminal (server must be running)
npm run test:regression   # in another
```

Exits non-zero on any regression. Output shows per-test PASS/FAIL with the exact status code received vs expected, so failures are immediately diagnosable.

## Ongoing maintenance

- **New route?** Add a row to `READ_MATRIX` with expected status per role.
- **Role behavior changed intentionally?** Update the matrix entry in the same PR that changes the route — the test file is the spec.
- **New role added?** Extend the matrix with a new column and add a `suiteRole('newRole', token)` call in `main()`.

## Relationship to existing regression files

| File | Purpose |
|---|---|
| `@e:\Ascentia\regression-test.js` | Static pre-commit check (git-diff based). No API hits. Keeps its purpose. |
| `@e:\Ascentia\backend\tests\regression-api.js` | **New** — live API regression. Run before shipping / after feature work. |
| `backend/test-*.js` (~30 files) | Historical ad-hoc tests. Retain for reference; the new suite is the canonical one. |
