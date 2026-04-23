import prisma from './lib/prisma.js';

async function createPermissions() {
  console.log('🔐 Creating missing permissions...\n');
  
  try {
    // Check current permissions
    const currentPerms = await prisma.permission.count();
    console.log(`Current permissions: ${currentPerms}`);
    
    if (currentPerms > 0) {
      console.log('Permissions already exist, checking sidebar permissions...');
      
      // Check if sidebar permissions exist
      const sidebarPerms = await prisma.permission.findMany({
        where: { module: 'sidebar' }
      });
      
      if (sidebarPerms.length === 0) {
        console.log('Creating sidebar permissions...');
        
        // Get the organization (should be id=1)
        const org = await prisma.organization.findFirst();
        if (!org) {
          console.log('No organization found, creating default...');
          await prisma.organization.create({
            data: {
              id: 1,
              name: 'Default Organization',
              subscriptionPlan: 'free',
              isActive: true
            }
          });
        }
        
        // Create sidebar permissions for all menu items
        const sidebarPermissions = [
          { module: 'sidebar', action: 'dashboard', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
          { module: 'sidebar', action: 'directory', roles: ['admin', 'hr'], organizationId: 1 },
          { module: 'sidebar', action: 'leave', roles: ['admin', 'manager', 'employee', 'hr'], organizationId: 1 },
          { module: 'sidebar', action: 'timesheet', roles: ['admin', 'manager', 'employee', 'hr'], organizationId: 1 },
          { module: 'sidebar', action: 'performance', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
          { module: 'sidebar', action: 'payroll', roles: ['admin', 'employee', 'hr'], organizationId: 1 },
          { module: 'sidebar', action: 'recruiting', roles: ['admin'], organizationId: 1 },
          { module: 'sidebar', action: 'reports', roles: ['admin', 'manager', 'hr'], organizationId: 1 },
          { module: 'sidebar', action: 'profile', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
          { module: 'sidebar', action: 'settings', roles: ['admin', 'manager', 'employee'], organizationId: 1 }
        ];
        
        for (const perm of sidebarPermissions) {
          await prisma.permission.create({
            data: perm
          });
        }
        
        console.log(`✅ Created ${sidebarPermissions.length} sidebar permissions`);
      }
      
      return;
    }
    
    // Create all permissions
    console.log('Creating all permissions...');
    
    const defaultPermissions = [
      // Dashboard
      { module: 'dashboard', action: 'view', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
      
      // Directory
      { module: 'directory', action: 'view', roles: ['admin', 'hr'], organizationId: 1 },
      { module: 'directory', action: 'create', roles: ['admin', 'hr'], organizationId: 1 },
      { module: 'directory', action: 'update', roles: ['admin', 'hr'], organizationId: 1 },
      { module: 'directory', action: 'delete', roles: ['admin'], organizationId: 1 },
      
      // Leave & Attendance
      { module: 'leave', action: 'view_own', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
      { module: 'leave', action: 'view_all', roles: ['admin', 'hr', 'manager'], organizationId: 1 },
      { module: 'leave', action: 'create', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
      { module: 'leave', action: 'update', roles: ['admin', 'hr'], organizationId: 1 },
      { module: 'leave', action: 'delete', roles: ['admin', 'hr'], organizationId: 1 },
      
      // Timesheet
      { module: 'timesheet', action: 'view_own', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
      { module: 'timesheet', action: 'view_all', roles: ['admin', 'manager'], organizationId: 1 },
      { module: 'timesheet', action: 'create', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
      { module: 'timesheet', action: 'update', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
      { module: 'timesheet', action: 'delete', roles: ['admin'], organizationId: 1 },
      { module: 'timesheet', action: 'approve', roles: ['admin', 'manager'], organizationId: 1 },
      
      // Performance
      { module: 'performance', action: 'view_own', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
      { module: 'performance', action: 'view_all', roles: ['admin', 'manager'], organizationId: 1 },
      { module: 'performance', action: 'create', roles: ['admin', 'manager'], organizationId: 1 },
      { module: 'performance', action: 'update', roles: ['admin', 'manager'], organizationId: 1 },
      { module: 'performance', action: 'delete', roles: ['admin'], organizationId: 1 },
      
      // Payroll
      { module: 'payroll', action: 'view', roles: ['admin', 'hr', 'employee'], organizationId: 1 },
      { module: 'payroll', action: 'manage', roles: ['admin', 'hr'], organizationId: 1 },
      
      // Reports
      { module: 'reports', action: 'view', roles: ['admin', 'manager', 'hr'], organizationId: 1 },
      
      // Settings
      { module: 'settings', action: 'view', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
      { module: 'settings', action: 'update', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
      
      // Role Management
      { module: 'roles', action: 'view', roles: ['admin'], organizationId: 1 },
      { module: 'roles', action: 'manage', roles: ['admin'], organizationId: 1 },
      
      // Sidebar permissions
      { module: 'sidebar', action: 'dashboard', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
      { module: 'sidebar', action: 'directory', roles: ['admin', 'hr'], organizationId: 1 },
      { module: 'sidebar', action: 'leave', roles: ['admin', 'manager', 'employee', 'hr'], organizationId: 1 },
      { module: 'sidebar', action: 'timesheet', roles: ['admin', 'manager', 'employee', 'hr'], organizationId: 1 },
      { module: 'sidebar', action: 'performance', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
      { module: 'sidebar', action: 'payroll', roles: ['admin', 'employee', 'hr'], organizationId: 1 },
      { module: 'sidebar', action: 'recruiting', roles: ['admin'], organizationId: 1 },
      { module: 'sidebar', action: 'reports', roles: ['admin', 'manager', 'hr'], organizationId: 1 },
      { module: 'sidebar', action: 'profile', roles: ['admin', 'manager', 'employee'], organizationId: 1 },
      { module: 'sidebar', action: 'settings', roles: ['admin', 'manager', 'employee'], organizationId: 1 }
    ];
    
    for (const perm of defaultPermissions) {
      await prisma.permission.create({
        data: {
          ...perm,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
    
    console.log(`✅ Created ${defaultPermissions.length} permissions`);
    
    // Update employees to have organizationId if they don't have it
    console.log('\n👥 Updating employees organizationId...');
    const employeesWithoutOrg = await prisma.employee.findMany({
      where: { organizationId: null }
    });
    
    if (employeesWithoutOrg.length > 0) {
      await prisma.employee.updateMany({
        where: { organizationId: null },
        data: { organizationId: 1 }
      });
      console.log(`✅ Updated ${employeesWithoutOrg.length} employees with organizationId`);
    }
    
  } catch (error) {
    console.error('❌ Error creating permissions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createPermissions().catch(console.error);
