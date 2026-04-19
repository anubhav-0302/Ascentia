#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

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
    { module: 'kra', action: 'delete', isEnabled: true },
    
    // Workflow Hub
    { module: 'workflow', action: 'view', isEnabled: true },
    { module: 'workflow', action: 'create', isEnabled: true },
    { module: 'workflow', action: 'edit', isEnabled: true },
    { module: 'workflow', action: 'delete', isEnabled: true },
    
    // Command Center
    { module: 'command', action: 'view', isEnabled: true },
    { module: 'command', action: 'create', isEnabled: true },
    { module: 'command', action: 'edit', isEnabled: true },
    { module: 'command', action: 'delete', isEnabled: true }
  ],
  
  hr: [
    // HR has no sidebar access in current implementation
  ],
  
  manager: [
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
    
    // Reports
    { module: 'reports', action: 'view', isEnabled: true },
    { module: 'reports', action: 'export', isEnabled: true },
    
    // Settings
    { module: 'settings', action: 'view', isEnabled: true },
    { module: 'settings', action: 'edit', isEnabled: true }
  ],
  
  employee: [
    // Payroll
    { module: 'payroll', action: 'view', isEnabled: true },
    
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
    
    // Leave
    { module: 'leave', action: 'view', isEnabled: true },
    { module: 'leave', action: 'create', isEnabled: true },
    { module: 'leave', action: 'edit', isEnabled: true },
    { module: 'leave', action: 'delete', isEnabled: true },
    
    // Settings
    { module: 'settings', action: 'view', isEnabled: true },
    { module: 'settings', action: 'edit', isEnabled: true }
  ]
};

async function seedRoleConfig() {
  try {
    console.log('🌱 Seeding role configuration...');

    for (const roleData of DEFAULT_ROLES) {
      // Check if role already exists
      const existingRole = await prisma.roleConfig.findUnique({
        where: { name: roleData.name },
        include: { permissions: true }
      });

      if (existingRole) {
        console.log(`✅ Role '${roleData.name}' already exists, updating permissions...`);
        
        // Get expected permissions for this role
        const rolePermissions = PERMISSIONS[roleData.name] || [];
        
        // Get existing permission keys
        const existingPermissions = new Set(
          existingRole.permissions.map(p => `${p.module}:${p.action}`)
        );
        
        // Add missing permissions
        for (const permission of rolePermissions) {
          const permissionKey = `${permission.module}:${permission.action}`;
          if (!existingPermissions.has(permissionKey)) {
            await prisma.permission.create({
              data: {
                roleId: existingRole.id,
                module: permission.module,
                action: permission.action,
                isEnabled: permission.isEnabled
              }
            });
            console.log(`  ✅ Added permission: ${permission.module}:${permission.action}`);
          } else {
            // Update existing permission to match expected state
            const existingPerm = existingRole.permissions.find(
              p => p.module === permission.module && p.action === permission.action
            );
            if (existingPerm && existingPerm.isEnabled !== permission.isEnabled) {
              await prisma.permission.update({
                where: { id: existingPerm.id },
                data: { isEnabled: permission.isEnabled }
              });
              console.log(`  ✅ Updated permission: ${permission.module}:${permission.action}`);
            }
          }
        }
        
        // Remove workflow and command permissions from non-admin roles
        if (roleData.name !== 'admin') {
          const nonAdminPermissions = existingRole.permissions.filter(
            p => p.module === 'workflow' || p.module === 'command'
          );
          for (const perm of nonAdminPermissions) {
            await prisma.permission.delete({
              where: { id: perm.id }
            });
            console.log(`  🗑️  Removed permission: ${perm.module}:${perm.action} (admin only)`);
          }
        }
        
        console.log(`✅ Updated role '${roleData.name}' permissions`);
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
