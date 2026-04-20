import prisma from '../lib/prisma.js';

async function fixTeamLeadPermissions() {
  try {
    console.log('🔧 Fixing Team Lead role permissions...\n');

    // Find the Team Lead role
    const teamLeadRole = await prisma.roleConfig.findUnique({
      where: { name: 'teamlead' }
    });

    if (!teamLeadRole) {
      console.log('❌ Team Lead role not found in RoleConfig table');
      return;
    }

    console.log(`✅ Found Team Lead role: ID ${teamLeadRole.id}`);

    // Get Manager role permissions as reference
    const managerRole = await prisma.roleConfig.findUnique({
      where: { name: 'manager' },
      include: { permissions: true }
    });

    if (!managerRole) {
      console.log('❌ Manager role not found for reference');
      return;
    }

    console.log(`✅ Found Manager role with ${managerRole.permissions.length} permissions`);

    // Get existing Team Lead permissions
    const existingTeamLeadPerms = await prisma.permission.findMany({
      where: { roleId: teamLeadRole.id }
    });

    console.log(`📊 Team Lead currently has ${existingTeamLeadPerms.length} permissions`);

    // Create missing permissions based on Manager role
    let createdCount = 0;
    for (const managerPerm of managerRole.permissions) {
      const exists = existingTeamLeadPerms.find(
        p => p.module === managerPerm.module && p.action === managerPerm.action
      );

      if (!exists) {
        await prisma.permission.create({
          data: {
            roleId: teamLeadRole.id,
            module: managerPerm.module,
            action: managerPerm.action,
            isEnabled: managerPerm.isEnabled
          }
        });
        console.log(`✅ Created permission: ${managerPerm.module}.${managerPerm.action}`);
        createdCount++;
      }
    }

    // Also add sidebar permissions
    const sidebarModules = [
      'dashboard', 'my-team', 'directory', 'leave-attendance', 
      'timesheet-entry', 'reports', 'profile'
    ];

    for (const module of sidebarModules) {
      const exists = existingTeamLeadPerms.find(p => p.module === 'sidebar' && p.action === module);
      if (!exists) {
        await prisma.permission.create({
          data: {
            roleId: teamLeadRole.id,
            module: 'sidebar',
            action: module,
            isEnabled: true
          }
        });
        console.log(`✅ Created sidebar permission: ${module}`);
        createdCount++;
      }
    }

    console.log(`\n🎉 Successfully created ${createdCount} missing permissions for Team Lead role`);

    // Verify the fix
    const finalPerms = await prisma.permission.findMany({
      where: { roleId: teamLeadRole.id }
    });

    console.log(`📊 Team Lead now has ${finalPerms.length} total permissions`);

  } catch (error) {
    console.error('❌ Error fixing Team Lead permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTeamLeadPermissions();
