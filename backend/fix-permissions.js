import prisma from './lib/prisma.js';

async function fixPermissions() {
  console.log('🔧 Fixing permissions...');
  
  try {
    // Get admin role
    const adminRole = await prisma.roleConfig.findUnique({ 
      where: { name: 'admin' } 
    });
    
    if (!adminRole) {
      console.error('❌ Admin role not found');
      return;
    }
    
    console.log('✅ Found admin role:', adminRole.id);
    
    // Add settings.view and settings.edit permissions for admin
    const settingsPermissions = [
      { module: 'settings', action: 'view' },
      { module: 'settings', action: 'edit' }
    ];
    
    for (const perm of settingsPermissions) {
      await prisma.permission.upsert({
        where: {
          roleId_module_action: {
            roleId: adminRole.id,
            module: perm.module,
            action: perm.action
          }
        },
        update: { isEnabled: true },
        create: {
          roleId: adminRole.id,
          module: perm.module,
          action: perm.action,
          isEnabled: true
        }
      });
      console.log(`✅ Created/updated ${perm.module}.${perm.action} for admin`);
    }
    
    console.log('✅ Permissions fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing permissions:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixPermissions();
