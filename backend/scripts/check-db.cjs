const prisma = require('../lib/prisma.js').default;

async function checkDatabase() {
  try {
    console.log('🔍 Checking database contents...');
    
    const employeeCount = await prisma.employee.count();
    const orgCount = await prisma.organization.count();
    
    console.log(`Employees: ${employeeCount}`);
    console.log(`Organizations: ${orgCount}`);
    
    if (employeeCount > 0) {
      const firstEmployee = await prisma.employee.findFirst();
      console.log('First employee:', firstEmployee?.name, firstEmployee?.email);
    }
    
    if (orgCount > 0) {
      const firstOrg = await prisma.organization.findFirst();
      console.log('First organization:', firstOrg?.name);
    }
    
    // Check performance tables
    const cycleCount = await prisma.performanceCycle.count();
    const goalCount = await prisma.performanceGoal.count();
    const reviewCount = await prisma.performanceReview.count();
    
    console.log(`Performance Cycles: ${cycleCount}`);
    console.log(`Performance Goals: ${goalCount}`);
    console.log(`Performance Reviews: ${reviewCount}`);
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
