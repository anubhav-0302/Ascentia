import prisma from './lib/prisma.js';

async function setupRolesAndPermissions() {
  console.log('🔧 Setting up roles and permissions...\n');
  
  try {
    // First, ensure we have an organization
    let org = await prisma.organization.findFirst();
    if (!org) {
      console.log('Creating default organization...');
      org = await prisma.organization.create({
        data: {
          id: 1,
          name: 'Default Organization',
          subscriptionPlan: 'free',
          isActive: true
        }
      });
    }
    
    // Create default roles
    console.log('👥 Creating default roles...');
    const defaultRoles = [
      {
        id: 1,
        name: 'admin',
        description: 'Full system access',
        organizationId: org.id
      },
      {
        id: 2,
        name: 'hr',
        description: 'Human resources management',
        organizationId: org.id
      },
      {
        id: 3,
        name: 'manager',
        description: 'Team management',
        organizationId: org.id
      },
      {
        id: 4,
        name: 'employee',
        description: 'Basic employee access',
        organizationId: org.id
      }
    ];
    
    for (const role of defaultRoles) {
      await prisma.roleConfig.upsert({
        where: { name: role.name },
        update: role,
        create: role
      });
    }
    
    console.log(`✅ Created ${defaultRoles.length} roles`);
    
    // Get the created roles
    const adminRole = await prisma.roleConfig.findUnique({ where: { name: 'admin' } });
    const hrRole = await prisma.roleConfig.findUnique({ where: { name: 'hr' } });
    const managerRole = await prisma.roleConfig.findUnique({ where: { name: 'manager' } });
    const employeeRole = await prisma.roleConfig.findUnique({ where: { name: 'employee' } });
    
    // Create permissions for each role
    console.log('\n🔐 Creating permissions...');
    
    // Admin permissions (full access)
    const adminPermissions = [
      { module: 'dashboard', action: 'view' },
      { module: 'directory', action: 'view' },
      { module: 'directory', action: 'create' },
      { module: 'directory', action: 'update' },
      { module: 'directory', action: 'delete' },
      { module: 'leave', action: 'view_all' },
      { module: 'leave', action: 'create' },
      { module: 'leave', action: 'update' },
      { module: 'leave', action: 'delete' },
      { module: 'timesheet', action: 'view_all' },
      { module: 'timesheet', action: 'create' },
      { module: 'timesheet', action: 'update' },
      { module: 'timesheet', action: 'delete' },
      { module: 'timesheet', action: 'approve' },
      { module: 'performance', action: 'view_all' },
      { module: 'performance', action: 'create' },
      { module: 'performance', action: 'update' },
      { module: 'performance', action: 'delete' },
      { module: 'payroll', action: 'manage' },
      { module: 'reports', action: 'view' },
      { module: 'roles', action: 'view' },
      { module: 'roles', action: 'manage' },
      // Sidebar permissions
      { module: 'sidebar', action: 'dashboard' },
      { module: 'sidebar', action: 'directory' },
      { module: 'sidebar', action: 'leave' },
      { module: 'sidebar', action: 'timesheet' },
      { module: 'sidebar', action: 'performance' },
      { module: 'sidebar', action: 'payroll' },
      { module: 'sidebar', action: 'recruiting' },
      { module: 'sidebar', action: 'reports' },
      { module: 'sidebar', action: 'profile' },
      { module: 'sidebar', action: 'settings' }
    ];
    
    // HR permissions
    const hrPermissions = [
      { module: 'directory', action: 'view' },
      { module: 'directory', action: 'create' },
      { module: 'directory', action: 'update' },
      { module: 'leave', action: 'view_all' },
      { module: 'leave', action: 'create' },
      { module: 'leave', action: 'update' },
      { module: 'leave', action: 'delete' },
      { module: 'timesheet', action: 'create' },
      { module: 'payroll', action: 'manage' },
      { module: 'reports', action: 'view' },
      // Sidebar permissions
      { module: 'sidebar', action: 'directory' },
      { module: 'sidebar', action: 'leave' },
      { module: 'sidebar', action: 'timesheet' },
      { module: 'sidebar', action: 'payroll' },
      { module: 'sidebar', action: 'reports' }
    ];
    
    // Manager permissions
    const managerPermissions = [
      { module: 'leave', action: 'view_all' },
      { module: 'timesheet', action: 'view_all' },
      { module: 'timesheet', action: 'approve' },
      { module: 'performance', action: 'view_all' },
      { module: 'performance', action: 'create' },
      { module: 'performance', action: 'update' },
      { module: 'reports', action: 'view' },
      // Sidebar permissions
      { module: 'sidebar', action: 'leave' },
      { module: 'sidebar', action: 'timesheet' },
      { module: 'sidebar', action: 'performance' },
      { module: 'sidebar', action: 'reports' }
    ];
    
    // Employee permissions
    const employeePermissions = [
      { module: 'dashboard', action: 'view' },
      { module: 'leave', action: 'view_own' },
      { module: 'leave', action: 'create' },
      { module: 'timesheet', action: 'view_own' },
      { module: 'timesheet', action: 'create' },
      { module: 'timesheet', action: 'update' },
      { module: 'performance', action: 'view_own' },
      { module: 'payroll', action: 'view' },
      // Sidebar permissions
      { module: 'sidebar', action: 'dashboard' },
      { module: 'sidebar', action: 'leave' },
      { module: 'sidebar', action: 'timesheet' },
      { module: 'sidebar', action: 'performance' },
      { module: 'sidebar', action: 'payroll' },
      { module: 'sidebar', action: 'profile' },
      { module: 'sidebar', action: 'settings' }
    ];
    
    // Create permissions for each role
    const allPermissions = [
      ...adminPermissions.map(p => ({ ...p, roleId: adminRole.id })),
      ...hrPermissions.map(p => ({ ...p, roleId: hrRole.id })),
      ...managerPermissions.map(p => ({ ...p, roleId: managerRole.id })),
      ...employeePermissions.map(p => ({ ...p, roleId: employeeRole.id }))
    ];
    
    // Clear existing permissions
    await prisma.permission.deleteMany();
    
    // Create all permissions
    for (const perm of allPermissions) {
      await prisma.permission.create({
        data: perm
      });
    }
    
    console.log(`✅ Created ${allPermissions.length} permissions`);
    
    // Update employees to have organizationId if needed
    console.log('\n👥 Updating employees...');
    const employeesWithoutOrg = await prisma.employee.findMany({
      where: { organizationId: null }
    });
    
    if (employeesWithoutOrg.length > 0) {
      await prisma.employee.updateMany({
        where: { id: { in: employeesWithoutOrg.map(e => e.id) } },
        data: { organizationId: org.id }
      });
      console.log(`✅ Updated ${employeesWithoutOrg.length} employees with organizationId`);
    }
    
    // Verify setup
    const counts = await prisma.$transaction([
      prisma.employee.count(),
      prisma.organization.count(),
      prisma.roleConfig.count(),
      prisma.permission.count()
    ]);
    
    console.log('\n📊 Final state:');
    console.log(`- Employees: ${counts[0]}`);
    console.log(`- Organizations: ${counts[1]}`);
    console.log(`- Roles: ${counts[2]}`);
    console.log(`- Permissions: ${counts[3]}`);
    
    console.log('\n✅ Setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupRolesAndPermissions().catch(console.error);
