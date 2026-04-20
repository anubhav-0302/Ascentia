import prisma from '../lib/prisma.js';

async function verifyRoles() {
  try {
    const roles = await prisma.roleConfig.findMany({
      include: { 
        permissions: { 
          select: { 
            module: true, 
            action: true, 
            isEnabled: true 
          } 
        } 
      },
      orderBy: { name: 'asc' }
    });
    
    console.log('=== ROLE PERMISSION VERIFICATION ===\n');
    
    roles.forEach(role => {
      console.log(`${role.name}: ${role.permissions.length} permissions`);
      
      // Check for critical modules
      const criticalModules = ['users', 'employees', 'payroll', 'leave', 'timesheet'];
      criticalModules.forEach(module => {
        const hasModule = role.permissions.some(p => p.module === module);
        if (!hasModule) {
          console.log(`  ⚠️  Missing module: ${module}`);
        }
      });
    });
    
    console.log('\n=== VERIFICATION COMPLETE ===');
    console.log('✅ All roles have been checked');
    
  } catch (error) {
    console.error('❌ Error verifying roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyRoles();
