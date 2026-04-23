import prisma from './lib/prisma.js';

async function checkDBState() {
  console.log('🔍 Checking database state...\n');
  
  try {
    // Check employees
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true
      }
    });
    
    console.log(`Found ${employees.length} employees:`);
    employees.forEach(emp => {
      console.log(`- ${emp.name} (${emp.email}) - Role: ${emp.role} - OrgId: ${emp.organizationId}`);
    });
    
    // Check organizations
    const orgs = await prisma.organization.findMany();
    console.log(`\nFound ${orgs.length} organizations:`);
    orgs.forEach(org => {
      console.log(`- ${org.name} (ID: ${org.id})`);
    });
    
    // Check roles
    const roles = await prisma.roleConfig.findMany();
    console.log(`\nFound ${roles.length} roles:`);
    roles.forEach(role => {
      console.log(`- ${role.name} (ID: ${role.id}) - OrgId: ${role.organizationId}`);
    });
    
    // Check permissions count
    const permCount = await prisma.permission.count();
    console.log(`\nTotal permissions: ${permCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDBState();
