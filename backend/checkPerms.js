import prisma from './lib/prisma.js';

async function checkPermissions() {
  try {
    const adminRole = await prisma.roleConfig.findUnique({ where: { name: 'admin' } });
    console.log('Admin role ID:', adminRole?.id);
    
    if (!adminRole) {
      console.log('Admin role not found!');
      return;
    }
    
    const projectPerms = await prisma.permission.findMany({ 
      where: { 
        roleId: adminRole.id, 
        module: 'projects' 
      } 
    });
    
    console.log('Project permissions for admin:', projectPerms);
    
    // Check all permissions for admin
    const allPerms = await prisma.permission.findMany({ 
      where: { roleId: adminRole.id }
    });
    
    console.log(`Total permissions for admin: ${allPerms.length}`);
    console.log('Modules:', [...new Set(allPerms.map(p => p.module))]);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPermissions();
