/**
 * PERMISSION REGISTRY — Single Source of Truth
 * ────────────────────────────────────────────────────────────────────────────
 * This file defines every permission that exists in the application.
 *
 * To add a new feature module:
 *   1. Add an entry to MODULE_ACTIONS below.
 *   2. (Optional) Add default values for built-in roles in DEFAULT_ROLE_PERMISSIONS.
 *   3. Use checkPermission('<module>', '<action>') in the route.
 *   ✅ Done. The DB is auto-synced on next server start, the matrix shows it,
 *      and the audit log tracks changes — no seed scripts to run.
 *
 * To add a new sidebar menu item:
 *   1. Add an entry to SIDEBAR_ITEMS below.
 *   2. Add a matching display entry in frontend/src/constants/menuItems.ts
 *      (icon + path + label + role fallback).
 *   ✅ Done.
 *
 * Never edit the DB directly — change this file, restart, done.
 * Never run seed scripts — `syncPermissions()` runs at startup automatically.
 */

// ─── Feature module actions ─────────────────────────────────────────────────
// These match the action names used in `checkPermission(module, action)` calls
// throughout the backend. Frontend matrix renders exactly what's listed here.
export const MODULE_ACTIONS = {
  payroll:     ['view', 'create', 'edit', 'delete'],
  performance: ['view', 'create', 'edit', 'delete'],
  timesheet:   ['view', 'create', 'edit', 'delete', 'approve'],
  leave:       ['view', 'create', 'edit', 'delete', 'approve'],
  employees:   ['view', 'create', 'edit', 'delete'],
  documents:   ['view', 'create', 'delete'],
  reports:     ['view', 'export'],
  audit:       ['view'],
  settings:    ['view', 'edit'],
  users:       ['view', 'create', 'edit', 'delete'],
  kra:         ['view', 'create', 'edit', 'delete'],
  workflow:    ['view', 'create', 'edit', 'delete'],
  command:     ['view', 'create', 'edit', 'delete'],
  projects:    ['view', 'create', 'edit', 'delete'],
};

// ─── Sidebar menu items ─────────────────────────────────────────────────────
// Stored in Permission table as (module='sidebar', action=<key>).
// Keys must match those in frontend/src/constants/menuItems.ts.
export const SIDEBAR_ITEMS = {
  'dashboard':             { label: 'Dashboard' },
  'command-center':        { label: 'Command Center' },
  'workflow-hub':          { label: 'Workflow Hub' },
  'my-team':               { label: 'My Team' },
  'directory':             { label: 'Directory' },
  'leave-attendance':      { label: 'Leave & Attendance' },
  'timesheet-entry':       { label: 'Timesheet Entry' },
  'performance-goals':     { label: 'Performance Goals' },
  'payroll-benefits':      { label: 'Payroll & Benefits' },
  'project-management':    { label: 'Project Management' },
  'recruiting':            { label: 'Recruiting' },
  'reports':               { label: 'Reports' },
  'audit-logs':            { label: 'Audit Logs' },
  'permission-management': { label: 'Permission Management' },
  'role-management':       { label: 'Role Management' },
  'profile':               { label: 'Profile' },
  'settings':              { label: 'Settings' },
};

// ─── Built-in roles ─────────────────────────────────────────────────────────
// These are auto-created on startup if missing. Custom roles created via the
// Role Management UI are preserved.
export const BUILTIN_ROLES = [
  { name: 'admin',     description: 'Full system access' },
  { name: 'hr',        description: 'Human resources management' },
  { name: 'manager',   description: 'Team management' },
  { name: 'teamlead',  description: 'Team lead access' },
  { name: 'employee',  description: 'Basic employee access' },
];

// Helper to make a "everything = true" matrix
const allTrue = () =>
  Object.fromEntries(
    Object.entries(MODULE_ACTIONS).map(([m, actions]) => [
      m,
      Object.fromEntries(actions.map((a) => [a, true])),
    ])
  );

const sidebarAllTrue = () =>
  Object.fromEntries(Object.keys(SIDEBAR_ITEMS).map((k) => [k, true]));

// ─── Default permissions for built-in roles ────────────────────────────────
// Used ONLY when seeding a fresh role for the first time. Once a role's
// permission row exists in the DB, syncPermissions() never overrides it —
// admins can freely tweak via the UI without losing their changes on restart.
//
// Admin always gets everything (and is also bypassed in middleware as a safety
// net so the org owner can never lock themselves out).
export const DEFAULT_ROLE_PERMISSIONS = {
  admin: {
    ...allTrue(),
    sidebar: sidebarAllTrue(),
  },

  hr: {
    payroll:     { view: true,  create: true,  edit: true,  delete: false },
    performance: { view: true,  create: true,  edit: true,  delete: false },
    timesheet:   { view: true,  create: false, edit: false, delete: false, approve: true },
    leave:       { view: true,  create: true,  edit: true,  delete: true,  approve: true },
    employees:   { view: true,  create: true,  edit: true,  delete: true },
    documents:   { view: true,  create: true,  delete: true },
    reports:     { view: true,  export: true },
    audit:       { view: false },
    settings:    { view: true,  edit: true },
    users:       { view: true,  create: false, edit: false, delete: false },
    kra:         { view: true,  create: true,  edit: true,  delete: false },
    workflow:    { view: true,  create: true,  edit: true,  delete: false },
    command:     { view: false, create: false, edit: false, delete: false },
    projects:    { view: true,  create: true,  edit: true,  delete: false },
    sidebar: {
      dashboard: true,
      directory: true,
      'leave-attendance': true,
      'timesheet-entry': true,
      'performance-goals': true,
      'payroll-benefits': true,
      'project-management': true,
      reports: true,
      profile: true,
      settings: true,
    },
  },

  manager: {
    payroll:     { view: false, create: false, edit: false, delete: false },
    performance: { view: true,  create: true,  edit: true,  delete: false },
    timesheet:   { view: true,  create: false, edit: false, delete: false, approve: true },
    leave:       { view: true,  create: false, edit: false, delete: false, approve: true },
    employees:   { view: true,  create: false, edit: false, delete: false },
    documents:   { view: true,  create: false, delete: false },
    reports:     { view: true,  export: false },
    audit:       { view: false },
    settings:    { view: true,  edit: true },
    users:       { view: false, create: false, edit: false, delete: false },
    kra:         { view: true,  create: true,  edit: true,  delete: false },
    workflow:    { view: true,  create: true,  edit: true,  delete: false },
    command:     { view: false, create: false, edit: false, delete: false },
    projects:    { view: true,  create: false, edit: true,  delete: false },
    sidebar: {
      dashboard: true,
      'my-team': true,
      'leave-attendance': true,
      'timesheet-entry': true,
      'performance-goals': true,
      reports: true,
      profile: true,
      settings: true,
    },
  },

  teamlead: {
    payroll:     { view: false, create: false, edit: false, delete: false },
    performance: { view: true,  create: true,  edit: true,  delete: false },
    timesheet:   { view: true,  create: false, edit: false, delete: false, approve: true },
    leave:       { view: true,  create: false, edit: false, delete: false, approve: true },
    employees:   { view: true,  create: false, edit: false, delete: false },
    documents:   { view: true,  create: false, delete: false },
    reports:     { view: true,  export: false },
    audit:       { view: false },
    settings:    { view: true,  edit: true },
    users:       { view: false, create: false, edit: false, delete: false },
    kra:         { view: true,  create: true,  edit: true,  delete: false },
    workflow:    { view: true,  create: true,  edit: true,  delete: false },
    command:     { view: false, create: false, edit: false, delete: false },
    projects:    { view: true,  create: false, edit: true,  delete: false },
    sidebar: {
      dashboard: true,
      'my-team': true,
      'leave-attendance': true,
      'timesheet-entry': true,
      'performance-goals': true,
      reports: true,
      profile: true,
      settings: true,
    },
  },

  employee: {
    payroll:     { view: true,  create: false, edit: false, delete: false },
    performance: { view: true,  create: false, edit: false, delete: false },
    timesheet:   { view: true,  create: true,  edit: true,  delete: false, approve: false },
    leave:       { view: true,  create: true,  edit: false, delete: false, approve: false },
    employees:   { view: false, create: false, edit: false, delete: false },
    documents:   { view: true,  create: false, delete: false },
    reports:     { view: false, export: false },
    audit:       { view: false },
    settings:    { view: true,  edit: true },
    users:       { view: false, create: false, edit: false, delete: false },
    kra:         { view: true,  create: false, edit: false, delete: false },
    workflow:    { view: false, create: false, edit: false, delete: false },
    command:     { view: false, create: false, edit: false, delete: false },
    projects:    { view: false, create: false, edit: false, delete: false },
    sidebar: {
      dashboard: true,
      'leave-attendance': true,
      'timesheet-entry': true,
      'performance-goals': true,
      'payroll-benefits': true,
      profile: true,
      settings: true,
    },
  },
};

/**
 * Returns the canonical default value for (roleName, module, action).
 * Returns false for unknown roles/modules/actions (custom roles default to
 * everything-off and admins must enable per the UI).
 */
export const getDefaultPermission = (roleName, module, action) => {
  const role = DEFAULT_ROLE_PERMISSIONS[roleName];
  if (!role) return false;
  if (module === 'sidebar') return role.sidebar?.[action] ?? false;
  return role[module]?.[action] ?? false;
};
