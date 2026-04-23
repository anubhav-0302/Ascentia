// Test the exact permission structure the frontend expects
import prisma from './lib/prisma.js';

async function testPermissionStructure() {
  console.log('🔍 Testing Permission Structure\n');
  
  try {
    // Get admin role with all permissions
    const adminRole = await prisma.roleConfig.findUnique({
      where: { id: 1 },
      include: {
        permissions: {
          orderBy: [{ module: 'asc' }, { action: 'asc' }]
        }
      }
    });
    
    console.log(`Admin role has ${adminRole.permissions.length} permissions`);
    
    // Group by module like the backend does
    const permissionsByModule = {};
    adminRole.permissions.forEach(perm => {
      if (!permissionsByModule[perm.module]) {
        permissionsByModule[perm.module] = [];
      }
      permissionsByModule[perm.module].push({
        id: perm.id,
        action: perm.action,
        isEnabled: perm.isEnabled
      });
    });
    
    // Check specific modules that frontend expects
    console.log('\n📊 Checking frontend expected modules:');
    
    const expectedModules = ['payroll', 'performance', 'timesheet', 'leave', 'sidebar'];
    
    expectedModules.forEach(module => {
      const perms = permissionsByModule[module] || [];
      console.log(`\n${module}: ${perms.length} permissions`);
      
      // Check for specific actions frontend expects
      if (module === 'payroll') {
        const expectedActions = ['view', 'create', 'edit', 'delete'];
        expectedActions.forEach(action => {
          const found = perms.find(p => p.action === action);
          console.log(`  - ${action}: ${found ? found.isEnabled : 'MISSING'}`);
        });
      }
      
      if (module === 'sidebar') {
        // Show first few sidebar permissions
        perms.slice(0, 5).forEach(p => {
          console.log(`  - ${p.action}: ${p.isEnabled}`);
        });
        if (perms.length > 5) {
          console.log(`  ... and ${perms.length - 5} more`);
        }
      }
    });
    
    // Check if there are any modules the frontend doesn't expect
    const frontendModules = new Set(['payroll', 'performance', 'timesheet', 'leave', 'employees', 
                                   'documents', 'reports', 'audit', 'settings', 'users', 
                                   'kra', 'workflow', 'command', 'sidebar']);
    
    const unexpectedModules = Object.keys(permissionsByModule).filter(m => !frontendModules.has(m));
    if (unexpectedModules.length > 0) {
      console.log('\n⚠️  Modules frontend might not handle:');
      unexpectedModules.forEach(m => console.log(`  - ${m}: ${permissionsByModule[m].length} permissions`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPermissionStructure();
