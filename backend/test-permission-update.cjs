const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const adapter = new PrismaBetterSqlite3({ url: 'file:dev.db' });
const prisma = new PrismaClient({ adapter });

(async () => {
  try {
    console.log('\n=== Testing Permission Update ===');
    
    // Get HR role's current payroll.view permission
    const hrRole = await prisma.roleConfig.findUnique({
      where: { name: 'hr' },
      include: { permissions: true }
    });
    
    const payrollViewPerm = hrRole.permissions.find(p => 
      p.module === 'payroll' && p.action === 'view'
    );
    
    console.log('Current HR payroll.view permission:', payrollViewPerm.isEnabled);
    
    // Let's manually toggle it to test
    const newValue = !payrollViewPerm.isEnabled;
    console.log('Toggling to:', newValue);
    
    await prisma.permission.update({
      where: { id: payrollViewPerm.id },
      data: { isEnabled: newValue }
    });
    
    // Verify it was saved
    const updated = await prisma.permission.findUnique({
      where: { id: payrollViewPerm.id }
    });
    
    console.log('After update, database shows:', updated.isEnabled);
    
    // Toggle back to original
    await prisma.permission.update({
      where: { id: payrollViewPerm.id },
      data: { isEnabled: payrollViewPerm.isEnabled }
    });
    
    console.log('\n=== Test Result ===');
    if (updated.isEnabled === newValue) {
      console.log('✅ Permission updates ARE saving to database');
      console.log('✅ Role Management changes should work');
    } else {
      console.log('❌ Permission updates are NOT saving');
      console.log('❌ This explains why changes don\'t persist');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
