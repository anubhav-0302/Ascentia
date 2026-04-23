// Check current role permissions in database
import prisma from './lib/prisma.js';

async function checkRolePermissions() {
  console.log('🔍 Checking Role Permissions\n');
  
  try {
    // Get all roles
    const roles = await prisma.roleConfig.findMany({
      include: {
        permissions: true
      },
      orderBy: { id: 'asc' }
    });
    
    console.log(`Found ${roles.length} roles:\n`);
    
    for (const role of roles) {
      console.log(`\n📋 Role: ${role.name} (ID: ${role.id})`);
      console.log(`   Description: ${role.description}`);
      console.log(`   Permissions: ${role.permissions.length}`);
      
      // Group permissions by module
      const permissionsByModule = {};
      role.permissions.forEach(p => {
        if (!permissionsByModule[p.module]) {
          permissionsByModule[p.module] = [];
        }
        permissionsByModule[p.module].push(p);
      });
      
      // Show first few modules
      Object.entries(permissionsByModule).slice(0, 3).forEach(([module, perms]) => {
        console.log(`   ${module}:`);
        perms.slice(0, 3).forEach(p => {
          console.log(`     - ${p.action}: ${p.isEnabled}`);
        });
        if (perms.length > 3) {
          console.log(`     ... and ${perms.length - 3} more`);
        }
      });
      
      if (Object.keys(permissionsByModule).length > 3) {
        console.log(`   ... and ${Object.keys(permissionsByModule).length - 3} more modules`);
      }
    }
    
    // Check specific modules that should exist
    console.log('\n🔍 Checking specific modules:');
    const allPermissions = await prisma.permission.findMany({
      select: {
        module: true,
        action: true,
        roleId: true,
        isEnabled: true
      }
    });
    
    const modules = [...new Set(allPermissions.map(p => p.module))];
    console.log(`\nModules found: ${modules.join(', ')}`);
    
    // Check sidebar permissions specifically
    const sidebarPerms = allPermissions.filter(p => p.module === 'sidebar');
    console.log(`\nSidebar permissions: ${sidebarPerms.length}`);
    console.log('Sample sidebar permissions:');
    sidebarPerms.slice(0, 5).forEach(p => {
      const role = roles.find(r => r.id === p.roleId);
      console.log(`  - ${role?.name}: ${p.action} = ${p.isEnabled}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRolePermissions();
