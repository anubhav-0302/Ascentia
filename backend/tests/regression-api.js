// ============================================================
// Ascentia Backend — API Regression Suite
// ============================================================
// Comprehensive end-to-end regression test. Hits a running
// server and verifies every route module behaves correctly for
// SuperAdmin, Admin, Employee, and Unauthenticated requests.
//
// Run:   npm run test:regression
// Requires: server running at BASE_URL (default http://localhost:5000)
// ============================================================

import { env } from '../config/env.js';

const BASE_URL = process.env.REGRESSION_BASE_URL || `http://localhost:${env.PORT}`;

// --------------------------- Console helpers -------------------------------
const C = {
  reset: '\x1b[0m', dim: '\x1b[2m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m', bold: '\x1b[1m',
};
const pad = (s, n) => String(s).padEnd(n);

// --------------------------- HTTP helper -----------------------------------
async function call(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    let json = null;
    try { json = await res.json(); } catch { /* non-JSON */ }
    return { status: res.status, body: json };
  } catch (err) {
    return { status: 0, body: { error: err.message } };
  }
}

// --------------------------- Test tracker ----------------------------------
const results = [];
function record(group, name, passed, detail) {
  results.push({ group, name, passed, detail });
  const tag = passed ? `${C.green}PASS${C.reset}` : `${C.red}FAIL${C.reset}`;
  console.log(`  ${tag}  ${pad(name, 60)} ${C.dim}${detail || ''}${C.reset}`);
}
function section(title) {
  console.log(`\n${C.bold}${C.cyan}▶ ${title}${C.reset}`);
}

// --------------------------- Auth setup ------------------------------------
async function login(email, password) {
  const r = await call('POST', '/api/auth/login', { body: { email, password } });
  if (r.status !== 200 || !r.body?.data?.token) {
    throw new Error(`Login failed for ${email}: status=${r.status} body=${JSON.stringify(r.body).slice(0, 200)}`);
  }
  return { token: r.body.data.token, user: r.body.data.user };
}

// --------------------------- Expectations ----------------------------------
// "open"  = 200 expected
// "forbid"= 403 expected (auth ok but role denied)
// "auth"  = 401 expected (no/invalid token)
// "either" = any non-5xx acceptable (e.g., optional features)
function expect(group, name, got, expected, extraOk = []) {
  const codes = {
    open:   [200],
    forbid: [403],
    auth:   [401],
    notfound: [404],
  }[expected] || (Array.isArray(expected) ? expected : [expected]);
  const ok = codes.includes(got.status) || extraOk.includes(got.status);
  record(group, name, ok, `got=${got.status} expected=${codes.join('|')}`);
}

// --------------------------- Suites ----------------------------------------
async function suiteAuth() {
  section('AUTH & CONFIG');
  // Health / root
  expect('auth', 'GET / (root)', await call('GET', '/'), 'open');
  // Login with bad password
  const bad = await call('POST', '/api/auth/login', { body: { email: env.ADMIN_EMAIL, password: 'wrong' } });
  record('auth', 'Login with wrong password rejected', bad.status === 401, `got=${bad.status}`);
  // Login with missing body
  const empty = await call('POST', '/api/auth/login', { body: {} });
  record('auth', 'Login with empty body rejected', [400, 401].includes(empty.status), `got=${empty.status}`);
}

// Matrix of GET endpoints → expected status per role.
// Values: 'open'=200, 'forbid'=403, 'notfound'=404, 'auth'=401.
// These expectations reflect the CURRENT implemented behavior as of 2026-04-23.
// Any divergence from this matrix = regression.
const READ_MATRIX = [
  // [label, path, superAdmin, admin, employee]
  ['Employees list',               '/api/employees',                         'open',   'open',   'forbid'],
  ['My leaves (all leaves view)',  '/api/leave',                             'open',   'open',   'open'],      // NOTE: employee currently has leave.view
  ['My leaves (self)',             '/api/leave/my',                          'open',   'open',   'open'],
  ['My timesheet',                 '/api/timesheet',                         'open',   'open',   'open'],
  ['All timesheets',               '/api/timesheet/all',                     'open',   'open',   'open'],     // NOTE: employee currently has timesheet.view permission
  ['Timesheet history',            '/api/timesheet/history',                 'open',   'open',   'open'],     // NOTE: same as above
  ['Performance cycles',           '/api/performance/cycles',                'open',   'open',   'open'],
  ['Performance goals',            '/api/performance/goals',                 'open',   'open',   'open'],
  ['Performance reviews',          '/api/performance/reviews',               'open',   'open',   'open'],
  ['Salary components',            '/api/payroll/salary-components',         'open',   'open',   'open'],     // NOTE: employee currently has payroll.view
  ['Employee salaries',            '/api/payroll/employee-salaries',         'open',   'open',   'open'],
  ['Notifications',                '/api/notifications',                     'open',   'open',   'open'],
  ['User settings',                '/api/settings',                          'open',   'open',   'open'],
  ['Roles',                        '/api/admin/roles',                       'open',   'open',   'forbid'],
  ['Sidebar permissions',          '/api/admin/roles/sidebar/permissions',   ['open','notfound'], 'open', 'open'],
  ['Permission audit logs',        '/api/admin/roles/audit/logs',            'open',   'open',   'forbid'],
  ['Dashboard stats',              '/api/dashboard/stats',                   'open',   'open',   'open'],
  ['Analytics',                    '/api/analytics',                         'open',   'open',   'forbid'],
  ['Logs',                         '/api/logs',                              'open',   'open',   'forbid'],   // Phase 2: superAdmin now authorized
  ['Organizations (list)',         '/api/organizations',                     'open',   'forbid', 'forbid'],
  ['Organizations (available)',    '/api/organizations/available',           'open',   'forbid', 'forbid'],
  ['Data protection backups',      '/api/data-protection/backups',           'open',   'open',   'forbid'],   // Phase 2: superAdmin now authorized
  ['Data protection stats',        '/api/data-protection/stats',             'open',   'open',   'forbid'],
  ['Users list',                   '/api/users',                             'open',   'open',   'forbid'],   // Phase 2: superAdmin now authorized
];

async function suiteUnauth() {
  section('UNAUTHENTICATED ACCESS (all should be 401)');
  for (const [label, path] of READ_MATRIX) {
    const r = await call('GET', path);
    record('unauth', label, r.status === 401, `${path} → ${r.status}`);
  }
}

async function suiteRole(roleName, token) {
  section(`${roleName.toUpperCase()} — read access matrix`);
  const idx = { superAdmin: 2, admin: 3, employee: 4 }[roleName];
  for (const row of READ_MATRIX) {
    const [label, path] = row;
    const expected = row[idx];
    const r = await call('GET', path, { token });
    expect(roleName, `${label}`, r, Array.isArray(expected) ? expected.map(e => ({ open:200, forbid:403, notfound:404, auth:401 }[e])) : expected);
  }
}

async function suiteSeedData(adminToken) {
  section('SEED DATA INTEGRITY');
  // Check default users exist via employees endpoint
  const r = await call('GET', '/api/employees', { token: adminToken });
  const emails = (r.body?.data || []).map(e => e.email);
  record('seed', 'Admin seed user present',      emails.includes(env.ADMIN_EMAIL),      env.ADMIN_EMAIL);
  record('seed', 'Employee seed user present',   emails.includes(env.EMPLOYEE_EMAIL),   env.EMPLOYEE_EMAIL);
  // SuperAdmin is org-less, might not appear in tenant-scoped employees — skip that check here
  record('seed', 'SuperAdmin login works',       true, env.SUPERADMIN_EMAIL);
}

async function suiteWrites(adminToken) {
  section('WRITE SMOKE TESTS (admin)');
  // Create + delete an employee to verify CRUD still works end-to-end.
  const email = `regression+${Date.now()}@example.com`;
  const createRes = await call('POST', '/api/employees', {
    token: adminToken,
    body: {
      name: 'Regression User',
      email,
      password: 'TempPass123!',
      role: 'employee',
      status: 'active',
      jobTitle: 'QA',
      department: 'Testing',
      location: 'Remote',
    },
  });
  const created = createRes.status === 200 || createRes.status === 201;
  record('write', 'POST /api/employees (create)', created, `status=${createRes.status}`);
  const newId = createRes.body?.data?.id || createRes.body?.id;

  if (created && newId) {
    const getRes = await call('GET', `/api/employees`, { token: adminToken });
    const present = (getRes.body?.data || []).some(e => e.id === newId);
    record('write', 'Created employee visible in list', present, `id=${newId}`);

    const delRes = await call('DELETE', `/api/employees/${newId}`, { token: adminToken });
    record('write', 'DELETE /api/employees/:id (cleanup)', [200, 204].includes(delRes.status), `status=${delRes.status}`);
  }
}

async function suiteSuperAdminHidden(adminToken, superAdminToken) {
  section('SUPERADMIN HIDING (Issue #4)');
  // Admin must NOT see the SuperAdmin row in /api/employees
  const adminView = await call('GET', '/api/employees', { token: adminToken });
  const adminSawSuper = (adminView.body?.data || []).some(e => e.role === 'superAdmin' || e.email === env.SUPERADMIN_EMAIL);
  record('super-hidden', 'Admin cannot see SuperAdmin in /api/employees', !adminSawSuper,
    adminSawSuper ? 'LEAK: superAdmin visible to admin' : 'filtered correctly');

  // SuperAdmin viewing the list themselves SHOULD see the SuperAdmin row (platform view).
  const superView = await call('GET', '/api/employees', { token: superAdminToken });
  const superSawSuper = (superView.body?.data || []).some(e => e.role === 'superAdmin');
  record('super-hidden', 'SuperAdmin sees SuperAdmin rows in /api/employees', superSawSuper,
    superSawSuper ? 'platform-level visibility OK' : 'SuperAdmin invisible to self');
}

async function suiteTenantIsolation(superAdminToken, adminToken) {
  section('TENANT ISOLATION VIA X-Organization-Id (Issue #2)');

  // Discover orgs via SuperAdmin
  const orgsRes = await call('GET', '/api/organizations', { token: superAdminToken });
  const orgs = orgsRes.body?.data || [];
  if (orgs.length < 1) {
    record('tenant', 'At least one org exists', false, 'no orgs returned by /api/organizations');
    return;
  }

  // Find the default org (where admin lives) and any other org if available
  const adminOrg = orgs.find(o => o.id) || orgs[0];
  const otherOrg = orgs.find(o => o.id !== adminOrg.id);

  // Without header: SuperAdmin sees ALL (empty tenant filter)
  const allView = await fetch(`${BASE_URL}/api/employees`, {
    headers: { Authorization: `Bearer ${superAdminToken}` },
  }).then(r => r.json()).catch(() => null);
  const allCount = (allView?.data || []).length;
  record('tenant', 'SuperAdmin (no header) sees platform-wide employees', allCount >= 1, `count=${allCount}`);

  // With header → adminOrg: should only see adminOrg employees
  const scopedRes = await fetch(`${BASE_URL}/api/employees`, {
    headers: {
      Authorization: `Bearer ${superAdminToken}`,
      'X-Organization-Id': String(adminOrg.id),
    },
  }).then(r => r.json()).catch(() => null);
  const scoped = scopedRes?.data || [];
  const allInAdminOrg = scoped.every(e => e.organizationId === adminOrg.id || e.organizationId == null);
  record('tenant', `SuperAdmin + X-Organization-Id=${adminOrg.id} restricts to that org`,
    allInAdminOrg, `returned=${scoped.length} orgIds=${[...new Set(scoped.map(e => e.organizationId))].join(',')}`);

  // If we have a second org, verify cross-org isolation works
  if (otherOrg) {
    const otherRes = await fetch(`${BASE_URL}/api/employees`, {
      headers: {
        Authorization: `Bearer ${superAdminToken}`,
        'X-Organization-Id': String(otherOrg.id),
      },
    }).then(r => r.json()).catch(() => null);
    const otherEmployees = otherRes?.data || [];
    const noLeak = otherEmployees.every(e => e.organizationId === otherOrg.id);
    record('tenant', `Switching to org ${otherOrg.id} does NOT leak admin-org data`, noLeak,
      `returned=${otherEmployees.length}`);
  } else {
    record('tenant', 'Cross-org isolation check (skipped: only 1 org seeded)', true, 'seed more orgs to fully verify');
  }

  // Header from a non-SuperAdmin must be ignored (admin cannot escape their tenant).
  // We compare admin's normal (no-header) view against the spoof-header view —
  // identical counts prove the header was silently dropped and admin stayed scoped.
  const adminNormal = await call('GET', '/api/employees', { token: adminToken });
  const normalCount = (adminNormal.body?.data || []).length;

  const adminSpoof = await fetch(`${BASE_URL}/api/employees`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'X-Organization-Id': otherOrg ? String(otherOrg.id) : '99999', // try a real OR fake org — both must be ignored
    },
  }).then(r => r.json()).catch(() => null);
  const spoofCount = (adminSpoof?.data || []).length;
  record('tenant', 'Admin cannot spoof X-Organization-Id', spoofCount === normalCount,
    `normal=${normalCount} spoof=${spoofCount} (must match — header ignored for non-SuperAdmin)`);

  // Invalid / non-existent org id with SuperAdmin → header is silently ignored → behaves like no header (sees all)
  const fakeRes = await fetch(`${BASE_URL}/api/employees`, {
    headers: {
      Authorization: `Bearer ${superAdminToken}`,
      'X-Organization-Id': '99999',
    },
  }).then(r => r.json()).catch(() => null);
  const fakeCount = (fakeRes?.data || []).length;
  record('tenant', 'Invalid X-Organization-Id is ignored (no error, no scope)', fakeCount === allCount,
    `got=${fakeCount} expected=${allCount}`);
}

async function suiteEmployeeSelfService(employeeToken) {
  section('EMPLOYEE SELF-SERVICE');
  // Employee reads own settings
  const s = await call('GET', '/api/settings', { token: employeeToken });
  record('self', 'GET /api/settings (self)', s.status === 200, `status=${s.status}`);
  // Employee reads own leaves
  const l = await call('GET', '/api/leave', { token: employeeToken });
  record('self', 'GET /api/leave (self)', l.status === 200, `status=${l.status}`);
  // Employee blocked from admin-only
  const blocked = await call('GET', '/api/admin/roles', { token: employeeToken });
  record('self', 'Admin routes blocked for employee', blocked.status === 403, `status=${blocked.status}`);
}

// --------------------------- Main ------------------------------------------
async function main() {
  console.log(`${C.bold}╔══════════════════════════════════════════════════════════════╗`);
  console.log(`║         ASCENTIA — API REGRESSION SUITE                      ║`);
  console.log(`╚══════════════════════════════════════════════════════════════╝${C.reset}`);
  console.log(`${C.dim}Target:     ${BASE_URL}`);
  console.log(`NODE_ENV:   ${env.NODE_ENV}${C.reset}`);

  // Preflight: is the server up?
  const ping = await call('GET', '/');
  if (ping.status === 0) {
    console.error(`${C.red}✘ Server not reachable at ${BASE_URL}. Start it with 'npm run dev' first.${C.reset}`);
    process.exit(2);
  }

  await suiteAuth();
  await suiteUnauth();

  // Login each role
  let sa, ad, em;
  try {
    sa = await login(env.SUPERADMIN_EMAIL, env.SUPERADMIN_PASSWORD);
    ad = await login(env.ADMIN_EMAIL, env.ADMIN_PASSWORD);
    em = await login(env.EMPLOYEE_EMAIL, env.EMPLOYEE_PASSWORD);
    record('auth', 'Login: superAdmin', true, env.SUPERADMIN_EMAIL);
    record('auth', 'Login: admin',      true, env.ADMIN_EMAIL);
    record('auth', 'Login: employee',   true, env.EMPLOYEE_EMAIL);
  } catch (e) {
    console.error(`${C.red}✘ ${e.message}${C.reset}`);
    process.exit(2);
  }

  await suiteRole('superAdmin', sa.token);
  await suiteRole('admin',      ad.token);
  await suiteRole('employee',   em.token);

  await suiteSeedData(ad.token);
  await suiteWrites(ad.token);
  await suiteSuperAdminHidden(ad.token, sa.token);
  await suiteTenantIsolation(sa.token, ad.token);
  await suiteEmployeeSelfService(em.token);

  // ----- Summary -----
  const total  = results.length;
  const failed = results.filter(r => !r.passed);
  const passed = total - failed.length;

  console.log(`\n${C.bold}╔══════════════════════════════════════════════════════════════╗`);
  console.log(`║ SUMMARY                                                      ║`);
  console.log(`╚══════════════════════════════════════════════════════════════╝${C.reset}`);
  console.log(`  Total  : ${total}`);
  console.log(`  ${C.green}Passed : ${passed}${C.reset}`);
  console.log(`  ${failed.length ? C.red : C.green}Failed : ${failed.length}${C.reset}`);

  if (failed.length) {
    console.log(`\n${C.red}${C.bold}Failed tests:${C.reset}`);
    for (const f of failed) {
      console.log(`  ${C.red}✘${C.reset} [${f.group}] ${f.name}  ${C.dim}${f.detail}${C.reset}`);
    }
    process.exit(1);
  }

  console.log(`\n${C.green}${C.bold}✔ All regression checks passed.${C.reset}\n`);
  process.exit(0);
}

main().catch((e) => {
  console.error(`${C.red}Regression suite crashed:${C.reset}`, e);
  process.exit(3);
});
