import prisma from '../lib/prisma.js';

// Define all modules and their actions
const MODULE_ACTIONS = {
  payroll: ['view', 'create', 'edit', 'delete'],
  performance: ['view', 'create', 'edit', 'delete'],
  timesheet: ['view', 'create', 'edit', 'delete', 'approve'],
  leave: ['view', 'create', 'edit', 'delete', 'approve'],
  employees: ['view', 'create', 'edit', 'delete'],
  documents: ['view', 'create', 'delete'],
  reports: ['view', 'export'],
  audit: ['view'],
  settings: ['view', 'edit'],
  users: ['view', 'create', 'edit', 'delete'],
  kra: ['view', 'create', 'edit', 'delete'],
  workflow: ['view', 'create', 'edit', 'delete'],
  command: ['view', 'create', 'edit', 'delete'],
  projects: ['view', 'create', 'edit', 'delete']
};

// Define sidebar menu items
const SIDEBAR_MENU_ITEMS = [
  'dashboard',
  'command-center',
  'workflow-hub',
  'my-team',
  'directory',
  'leave-attendance',
  'timesheet-entry',
  'performance-goals',
  'payroll-benefits',
  'project-management',
  'recruiting',
  'reports',
  'audit-logs',
  'permission-management',
  'role-management',
  'profile',
  'settings'
];

// Define default permissions for each role
const ROLE_PERMISSIONS = {
  admin: {
    // Admin gets all permissions
    ...Object.fromEntries(
      Object.entries(MODULE_ACTIONS).map(([module, actions]) => [
        module,
        Object.fromEntries(actions.map(action => [action, true]))
      ])
    ),
    // Admin gets all sidebar permissions
    sidebar: Object.fromEntries(SIDEBAR_MENU_ITEMS.map(item => [item, true]))
  },
  hr: {
    payroll: { view: true, create: true, edit: true, delete: false },
    performance: { view: true, create: true, edit: true, delete: false },
    timesheet: { view: true, create: false, edit: false, delete: false, approve: true },
    leave: { view: true, create: true, edit: true, delete: true, approve: true },
    employees: { view: true, create: true, edit: true, delete: true },
    documents: { view: true, create: true, delete: true },
    reports: { view: true, export: true },
    audit: { view: false },
    settings: { view: false, edit: false },
    users: { view: true, create: false, edit: false, delete: false },
    kra: { view: true, create: true, edit: true, delete: false },
    workflow: { view: true, create: true, edit: true, delete: false },
    command: { view: false, create: false, edit: false, delete: false },
    projects: { view: true, create: true, edit: true, delete: false },
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
      settings: true
    }
  },
  manager: {
    payroll: { view: false, create: false, edit: false, delete: false },
    performance: { view: true, create: true, edit: true, delete: false },
    timesheet: { view: true, create: false, edit: false, delete: false, approve: true },
    leave: { view: true, create: false, edit: false, delete: false, approve: true },
    employees: { view: true, create: false, edit: false, delete: false },
    documents: { view: true, create: false, delete: false },
    reports: { view: true, export: false },
    audit: { view: false },
    settings: { view: false, edit: false },
    users: { view: false, create: false, edit: false, delete: false },
    kra: { view: true, create: true, edit: true, delete: false },
    workflow: { view: true, create: true, edit: true, delete: false },
    command: { view: false, create: false, edit: false, delete: false },
    projects: { view: true, create: false, edit: true, delete: false },
    sidebar: {
      dashboard: true,
      'my-team': true,
      'leave-attendance': true,
      'timesheet-entry': true,
      'performance-goals': true,
      reports: true,
      profile: true,
      settings: true
    }
  },
  employee: {
    payroll: { view: false, create: false, edit: false, delete: false },
    performance: { view: true, create: false, edit: false, delete: false },
    timesheet: { view: true, create: true, edit: true, delete: false, approve: false },
    leave: { view: true, create: true, edit: false, delete: false, approve: false },
    employees: { view: false, create: false, edit: false, delete: false },
    documents: { view: true, create: false, delete: false },
    reports: { view: false, export: false },
    audit: { view: false },
    settings: { view: true, edit: true },
    users: { view: false, create: false, edit: false, delete: false },
    kra: { view: true, create: false, edit: false, delete: false },
    workflow: { view: false, create: false, edit: false, delete: false },
    command: { view: false, create: false, edit: false, delete: false },
    projects: { view: false, create: false, edit: false, delete: false },
    sidebar: {
      dashboard: true,
      'leave-attendance': true,
      'timesheet-entry': true,
      'performance-goals': true,
      'payroll-benefits': true,
      profile: true,
      settings: true
    }
  },
  teamlead: {
    payroll: { view: false, create: false, edit: false, delete: false },
    performance: { view: true, create: true, edit: true, delete: false },
    timesheet: { view: true, create: false, edit: false, delete: false, approve: true },
    leave: { view: true, create: false, edit: false, delete: false, approve: true },
    employees: { view: true, create: false, edit: false, delete: false },
    documents: { view: true, create: false, delete: false },
    reports: { view: true, export: false },
    audit: { view: false },
    settings: { view: false, edit: false },
    users: { view: false, create: false, edit: false, delete: false },
    kra: { view: true, create: true, edit: true, delete: false },
    workflow: { view: true, create: true, edit: true, delete: false },
    command: { view: false, create: false, edit: false, delete: false },
    projects: { view: true, create: false, edit: true, delete: false },
    sidebar: {
      dashboard: true,
      'my-team': true,
      'leave-attendance': true,
      'timesheet-entry': true,
      'performance-goals': true,
      reports: true,
      profile: true,
      settings: true
    }
  }
};

export async function seedPermissions() {
  console.log('🌱 Seeding permissions...');
  
  try {
    // Get all roles
    const roles = await prisma.roleConfig.findMany();
    
    for (const role of roles) {
      const permissions = ROLE_PERMISSIONS[role.name];
      if (!permissions) {
        console.log(`⚠️ No permissions defined for role: ${role.name}`);
        continue;
      }
      
      console.log(`📝 Seeding permissions for role: ${role.name}`);
      
      // Create/update all permissions for this role
      for (const [module, actions] of Object.entries(permissions)) {
        for (const [action, isEnabled] of Object.entries(actions)) {
          await prisma.permission.upsert({
            where: {
              roleId_module_action: {
                roleId: role.id,
                module,
                action
              }
            },
            update: {
              isEnabled
            },
            create: {
              roleId: role.id,
              module,
              action,
              isEnabled
            }
          });
        }
      }
    }
    
    console.log('✅ Permissions seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedPermissions()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
