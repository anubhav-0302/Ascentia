import prisma from './lib/prisma.js';

async function checkEmployees() {
  try {
    const count = await prisma.employee.count();
    console.log(`Total employees in database: ${count}`);
    
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        status: true,
        createdAt: true
      }
    });
    
    console.log('\nEmployee list:');
    employees.forEach(emp => {
      console.log(`- ${emp.name} (${emp.email}) - ${emp.role} - ${emp.department} - Created: ${emp.createdAt}`);
    });
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmployees();
