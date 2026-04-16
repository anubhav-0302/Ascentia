#!/usr/bin/env node

import prisma from '../lib/prisma.js';

const DEFAULT_ROLES = [
  {
    name: 'admin',
    description: 'Full system access',
    isCustom: false
  },
  {
    name: 'hr',
    description: 'HR and payroll management',
    isCustom: false
  },
  {
    name: 'manager',
    description: 'Team management and approvals',
    isCustom: false
  },
  {
    name: 'employee',
    description: 'Employee self-service access',
    isCustom: false
  }
];

const PERMISSIONS = {
  admin: [
    // Payroll
    { module: 'payroll', action: 'view', isEnabled: true },
    { module: 'payroll', action: 'create', isEnabled: true },
    { module: 'payroll', action: 'edit', isEnabled: true },
    { module: 'payroll', action: 'delete', isEnabled: true },
    
    // Performance
    { module: 'performance', action: 'view', isEnabled: true },
    { module: 'performance', action: 'create', isEnabled: true },
    { module: 'performance', action: 'edit', isEnabled: true },
    { module: 'performance', action: 'delete', isEnabled: true },
    
    // Timesheet
    { module: 'timesheet', action: 'view', isEnabled: true },
    { module: 'timesheet', action: 'create', isEnabled: true },
    { module: 'timesheet', action: 'edit', isEnabled: true },
    { module: 'timesheet', action: 'delete', isEnabled: true },
    { module: 'timesheet', action: 'approve', isEnabled: true },
    
    // Leave
    { module: 'leave', action: 'view', isEnabled: true },
    { module: 'leave', action: 'create', isEnabled: true },
    { module: 'leave', action: 'edit', isEnabled: true },
    { module: 'leave', action: 'delete', isEnabled: true },
    { module: 'leave', action: 'approve', isEnabled: true },
    
    // Employees
    { module: 'employees', action: 'view', isEnabled: true },
    { module: 'employees', action: 'create', isEnabled: true },
    { module: 'employees', action: 'edit', isEnabled: true },
    { module: 'employees', action: 'delete', isEnabled: true },
    
    // Documents
    { module: 'documents', action: 'view', isEnabled: true },
    { module: 'documents', action: 'create', isEnabled: true },
    { module: 'documents', action: 'delete', isEnabled: true },
    
    // Reports
    { module: 'reports', action: 'view', isEnabled: true },
    { module: 'reports', action: 'export', isEnabled: true },
    
    // Audit Logs
    { module: 'audit', action: 'view', isEnabled: true },
    
    // Settings
    { module: 'settings', action: 'view', isEnabled: true },
    { module: 'settings', action: 'edit', isEnabled: true },
    
    // Users
    { module: 'users', action: 'view', isEnabled: true },
    { module: 'users', action: 'create', isEnabled: true },
    { module: 'users', action: 'edit', isEnabled: true },
    { module: 'users', action: 'delete', isEnabled: true },
    
    // KRA
    { module: 'kra', action: 'view', isEnabled: true },
    { module: 'kra', action: 'create', isEnabled: true },
    { module: 'kra', action: 'edit', isEnabled: true },
    { module: 'kra', action: 'delete', isEnabled: true }
  ],
  
  hr: [
    // Payroll
    { module: 'payroll', action: 'view', isEnabled: true },
    { module: 'payroll', action: 'create', isEnabled: true },
    { module: 'payroll', action: 'edit', isEnabled: true },
    { module: 'payroll', action: 'delete', isEnabled: true },
    
    // Performance
    { module: 'performance', action: 'view', isEnabled: true },
    { module: 'performance', action: 'create', isEnabled: false },
    { module: 'performance', action: 'edit', isEnabled: false },
    { module: 'performance', action: 'delete', isEnabled: false },
    
    // Timesheet
    { module: 'timesheet', action: 'view', isEnabled: true },
    { module: 'timesheet', action: 'create', isEnabled: false },
    { module: 'timesheet', action: 'edit', isEnabled: false },
    { module: 'timesheet', action: 'delete', isEnabled: false },
    { module: 'timesheet', action: 'approve', isEnabled: false },
    
    // Leave
    { module: 'leave', action: 'view', isEnabled: true },
    { module: 'leave', action: 'create', isEnabled: false },
    { module: 'leave', action: 'edit', isEnabled: false },
    { module: 'leave', action: 'delete', isEnabled: false },
    { module: 'leave', action: 'approve', isEnabled: true },
    
    // Employees
    { module: 'employees', action: 'view', isEnabled: true },
    { module: 'employees', action: 'create', isEnabled: true },
    { module: 'employees', action: 'edit', isEnabled: true },
    { module: 'employees', action: 'delete', isEnabled: false },
    
    // Documents
    { module: 'documents', action: 'view', isEnabled: true },
    { module: 'documents', action: 'create', isEnabled: false },
    { module: 'documents', action: 'delete', isEnabled: false },
    
    // Reports
    { module: 'reports', action: 'view', isEnabled: true },
    { module: 'reports', action: 'export', isEnabled: true },
    
    // Audit Logs
    { module: 'audit', action: 'view', isEnabled: false },
    
    // Settings
    { module: 'settings', action: 'view', isEnabled: true },
    { module: 'settings', action: 'edit', isEnabled: true },
    
    // Users
    { module: 'users', action: 'view', isEnabled: false },
    { module: 'users', action: 'create', isEnabled: false },
    { module: 'users', action: 'edit', isEnabled: false },
    { module: 'users', action: 'delete', isEnabled: false },
    
    // KRA
    { module: 'kra', action: 'view', isEnabled: true },
    { module: 'kra', action: 'create', isEnabled: false },
    { module: 'kra', action: 'edit', isEnabled: false },
    { module: 'kra', action: 'delete', isEnabled: false }
  ],
  
  manager: [
    // Payroll
    { module: 'payroll', action: 'view', isEnabled: false },
    { module: 'payroll', action: 'create', isEnabled: false },
    { module: 'payroll', action: 'edit', isEnabled: false },
    { module: 'payroll', action: 'delete', isEnabled: false },
    
    // Performance
    { module: 'performance', action: 'view', isEnabled: true },
    { module: 'performance', action: 'create', isEnabled: true },
    { module: 'performance', action: 'edit', isEnabled: true },
    { module: 'performance', action: 'delete', isEnabled: false },
    
    // Timesheet
    { module: 'timesheet', action: 'view', isEnabled: true },
    { module: 'timesheet', action: 'create', isEnabled: false },
    { module: 'timesheet', action: 'edit', isEnabled: false },
    { module: 'timesheet', action: 'delete', isEnabled: false },
    { module: 'timesheet', action: 'approve', isEnabled: true },
    
    // Leave
    { module: 'leave', action: 'view', isEnabled: true },
    { module: 'leave', action: 'create', isEnabled: false },
    { module: 'leave', action: 'edit', isEnabled: false },
    { module: 'leave', action: 'delete', isEnabled: false },
    { module: 'leave', action: 'approve', isEnabled: true },
    
    // Employees
    { module: 'employees', action: 'view', isEnabled: true },
    { module: 'employees', action: 'create', isEnabled: false },
    { module: 'employees', action: 'edit', isEnabled: false },
    { module: 'employees', action: 'delete', isEnabled: false },
    
    // Documents
    { module: 'documents', action: 'view', isEnabled: true },
    { module: 'documents', action: 'create', isEnabled: false },
    { module: 'documents', action: 'delete', isEnabled: false },
    
    // Reports
    { module: 'reports', action: 'view', isEnabled: true },
    { module: 'reports', action: 'export', isEnabled: true },
    
    // Audit Logs
    { module: 'audit', action: 'view', isEnabled: false },
    
    // Settings
    { module: 'settings', action: 'view', isEnabled: true },
    { module: 'settings', action: 'edit', isEnabled: true },
    
    // Users
    { module: 'users', action: 'view', isEnabled: false },
    { module: 'users', action: 'create', isEnabled: false },
    { module: 'users', action: 'edit', isEnabled: false },
    { module: 'users', action: 'delete', isEnabled: false },
    
    // KRA
    { module: 'kra', action: 'view', isEnabled: true },
    { module: 'kra', action: 'create', isEnabled: true },
    { module: 'kra', action: 'edit', isEnabled: true },
    { module: 'kra', action: 'delete', isEnabled: false }
  ],
  
  employee: [
    // Payroll
    { module: 'payroll', action: 'view', isEnabled: true },
    { module: 'payroll', action: 'create', isEnabled: false },
    { module: 'payroll', action: 'edit', isEnabled: false },
    { module: 'payroll', action: 'delete', isEnabled: false },
    
    // Performance
    { module: 'performance', action: 'view', isEnabled: true },
    { module: 'performance', action: 'create', isEnabled: false },
    { module: 'performance', action: 'edit', isEnabled: false },
    { module: 'performance', action: 'delete', isEnabled: false },
    
    // Timesheet
    { module: 'timesheet', action: 'view', isEnabled: true },
    { module: 'timesheet', action: 'create', isEnabled: true },
    { module: 'timesheet', action: 'edit', isEnabled: true },
    { module: 'timesheet', action: 'delete', isEnabled: true },
    { module: 'timesheet', action: 'approve', isEnabled: false },
    
    // Leave
    { module: 'leave', action: 'view', isEnabled: true },
    { module: 'leave', action: 'create', isEnabled: true },
    { module: 'leave', action: 'edit', isEnabled: true },
    { module: 'leave', action: 'delete', isEnabled: true },
    { module: 'leave', action: 'approve', isEnabled: false },
    
    // Employees
    { module: 'employees', action: 'view', isEnabled: true },
    { module: 'employees', action: 'create', isEnabled: false },
    { module: 'employees', action: 'edit', isEnabled: false },
    { module: 'employees', action: 'delete', isEnabled: false },
    
    // Documents
    { module: 'documents', action: 'view', isEnabled: true },
    { module: 'documents', action: 'create', isEnabled: true },
    { module: 'documents', action: 'delete', isEnabled: true },
    
    // Reports
    { module: 'reports', action: 'view', isEnabled: false },
    { module: 'reports', action: 'export', isEnabled: false },
    
    // Audit Logs
    { module: 'audit', action: 'view', isEnabled: false },
    
    // Settings
    { module: 'settings', action: 'view', isEnabled: true },
    { module: 'settings', action: 'edit', isEnabled: true },
    
    // Users
    { module: 'users', action: 'view', isEnabled: false },
    { module: 'users', action: 'create', isEnabled: false },
    { module: 'users', action: 'edit', isEnabled: false },
    { module: 'users', action: 'delete', isEnabled: false },
    
    // KRA
    { module: 'kra', action: 'view', isEnabled: true },
    { module: 'kra', action: 'create', isEnabled: false },
    { module: 'kra', action: 'edit', isEnabled: false },
    { module: 'kra', action: 'delete', isEnabled: false }
  ]
};

async function seedRoleConfig() {
  try {
    console.log('🌱 Seeding role configuration...');

    for (const roleData of DEFAULT_ROLES) {
      // Check if role already exists
      const existingRole = await prisma.roleConfig.findUnique({
        where: { name: roleData.name }
      });

      if (existingRole) {
        console.log(`✅ Role '${roleData.name}' already exists, skipping...`);
        continue;
      }

      // Create role
      const role = await prisma.roleConfig.create({
        data: roleData
      });

      console.log(`✅ Created role: ${role.name}`);

      // Create permissions for this role
      const rolePermissions = PERMISSIONS[roleData.name] || [];
      
      for (const permission of rolePermissions) {
        await prisma.permission.create({
          data: {
            roleId: role.id,
            module: permission.module,
            action: permission.action,
            isEnabled: permission.isEnabled
          }
        });
      }

      console.log(`✅ Created ${rolePermissions.length} permissions for ${role.name}`);
    }

    console.log('✅ Role configuration seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding role configuration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedRoleConfig();
