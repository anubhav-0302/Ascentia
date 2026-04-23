import prisma from './lib/prisma.js';
import fs from 'fs';
import path from 'path';

async function simpleRestore() {
  console.log('🔄 Starting simple backup restoration...\n');
  
  try {
    // Check current state first
    const currentEmployees = await prisma.employee.count();
    const currentOrgs = await prisma.organization.count();
    const currentPerms = await prisma.permission.count();
    
    console.log('Current database state:');
    console.log(`- Employees: ${currentEmployees}`);
    console.log(`- Organizations: ${currentOrgs}`);
    console.log(`- Permissions: ${currentPerms}`);
    
    // If we already have data, don't overwrite
    if (currentEmployees > 0) {
      console.log('\n✅ Database already has data, skipping restoration');
      return;
    }
    
    // Create default organization if none exists
    console.log('\n📝 Creating default organization...');
    const defaultOrg = await prisma.organization.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Default Organization',
        subscriptionPlan: 'free',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log(`✅ Created default organization: ${defaultOrg.name}`);
    
    // Create default admin user
    console.log('\n👤 Creating default admin user...');
    const defaultAdmin = await prisma.employee.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Default Admin',
        email: 'admin@ascentia.com',
        password: '$2a$10$K8ZpdrjwzUWSTmtyYoNb6uj8.kNc3RQHQ3p3qNIYFvXJhBczQ1kZ6', // admin123
        role: 'admin',
        jobTitle: 'System Administrator',
        department: 'IT',
        location: 'Remote',
        status: 'Active',
        organizationId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log(`✅ Created default admin: ${defaultAdmin.email}`);
    
    // Create default permissions for sidebar
    console.log('\n🔐 Creating default permissions...');
    const defaultPermissions = [
      // Dashboard
      { id: 1, module: 'dashboard', action: 'view', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
      
      // Directory
      { id: 2, module: 'directory', action: 'view', roles: ['admin', 'hr'], organizationId: 1 },
      { id: 3, module: 'directory', action: 'create', roles: ['admin', 'hr'], organizationId: 1 },
      { id: 4, module: 'directory', action: 'update', roles: ['admin', 'hr'], organizationId: 1 },
      { id: 5, module: 'directory', action: 'delete', roles: ['admin'], organizationId: 1 },
      
      // Leave & Attendance
      { id: 6, module: 'leave', action: 'view_own', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
      { id: 7, module: 'leave', action: 'view_all', roles: ['admin', 'hr', 'manager'], organizationId: 1 },
      { id: 8, module: 'leave', action: 'create', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
      { id: 9, module: 'leave', action: 'update', roles: ['admin', 'hr'], organizationId: 1 },
      { id: 10, module: 'leave', action: 'delete', roles: ['admin', 'hr'], organizationId: 1 },
      
      // Timesheet
      { id: 11, module: 'timesheet', action: 'view_own', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
      { id: 12, module: 'timesheet', action: 'view_all', roles: ['admin', 'manager'], organizationId: 1 },
      { id: 13, module: 'timesheet', action: 'create', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
      { id: 14, module: 'timesheet', action: 'update', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
      { id: 15, module: 'timesheet', action: 'delete', roles: ['admin'], organizationId: 1 },
      { id: 16, module: 'timesheet', action: 'approve', roles: ['admin', 'manager'], organizationId: 1 },
      
      // Performance
      { id: 17, module: 'performance', action: 'view_own', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
      { id: 18, module: 'performance', action: 'view_all', roles: ['admin', 'manager'], organizationId: 1 },
      { id: 19, module: 'performance', action: 'create', roles: ['admin', 'manager'], organizationId: 1 },
      { id: 20, module: 'performance', action: 'update', roles: ['admin', 'manager'], organizationId: 1 },
      { id: 21, module: 'performance', action: 'delete', roles: ['admin'], organizationId: 1 },
      
      // Payroll
      { id: 22, module: 'payroll', action: 'view', roles: ['admin', 'hr', 'employee'], organizationId: 1 },
      { id: 23, module: 'payroll', action: 'manage', roles: ['admin', 'hr'], organizationId: 1 },
      
      // Reports
      { id: 24, module: 'reports', action: 'view', roles: ['admin', 'manager', 'hr'], organizationId: 1 },
      
      // Settings
      { id: 25, module: 'settings', action: 'view', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
      { id: 26, module: 'settings', action: 'update', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
      
      // Role Management
      { id: 27, module: 'roles', action: 'view', roles: ['admin'], organizationId: 1 },
      { id: 28, module: 'roles', action: 'manage', roles: ['admin'], organizationId: 1 }
    ];
    
    for (const perm of defaultPermissions) {
      await prisma.permission.upsert({
        where: { id: perm.id },
        update: perm,
        create: {
          ...perm,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
    
    console.log(`✅ Created ${defaultPermissions.length} default permissions`);
    
    // Create default roles
    console.log('\n👥 Creating default roles...');
    const defaultRoles = [
      {
        id: 1,
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full system access',
        organizationId: 1,
        permissions: defaultPermissions.map(p => p.id),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'hr',
        displayName: 'HR Manager',
        description: 'Human resources management',
        organizationId: 1,
        permissions: [2, 3, 4, 6, 7, 8, 9, 10, 11, 22, 23, 24, 25, 26],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'manager',
        displayName: 'Manager',
        description: 'Team management',
        organizationId: 1,
        permissions: [1, 6, 7, 11, 12, 13, 14, 16, 17, 18, 19, 20, 24, 25, 26],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: 'employee',
        displayName: 'Employee',
        description: 'Basic employee access',
        organizationId: 1,
        permissions: [1, 6, 8, 11, 13, 14, 17, 22, 25, 26],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    for (const role of defaultRoles) {
      await prisma.role.upsert({
        where: { id: role.id },
        update: role,
        create: role
      });
    }
    
    console.log(`✅ Created ${defaultRoles.length} default roles`);
    
    // Verify final state
    const finalCounts = await prisma.$transaction([
      prisma.employee.count(),
      prisma.organization.count(),
      prisma.permission.count(),
      prisma.role.count()
    ]);
    
    console.log('\n✅ Restoration completed!');
    console.log('\n📊 Final database state:');
    console.log(`- Employees: ${finalCounts[0]}`);
    console.log(`- Organizations: ${finalCounts[1]}`);
    console.log(`- Permissions: ${finalCounts[2]}`);
    console.log(`- Roles: ${finalCounts[3]}`);
    
    console.log('\n🔑 Default login credentials:');
    console.log('Email: admin@ascentia.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Restoration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run restoration
simpleRestore().catch(console.error);
