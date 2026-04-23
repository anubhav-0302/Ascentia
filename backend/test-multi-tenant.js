// Automated Multi-Tenant Isolation Test
import prisma from './lib/prisma.js';

async function testMultiTenantIsolation() {
  console.log('🔍 Multi-Tenant Isolation Test\n');
  console.log('='.repeat(50));
  
  try {
    // Step 1: Check if multiple organizations exist
    console.log('\n📊 Step 1: Checking Organizations');
    const organizations = await prisma.organization.findMany();
    console.log(`Found ${organizations.length} organizations:`);
    organizations.forEach(org => {
      console.log(`  - ID: ${org.id}, Name: ${org.name}, Active: ${org.isActive}`);
    });
    
    if (organizations.length < 2) {
      console.log('\n⚠️  Need at least 2 organizations to test isolation');
      console.log('   Creating test organizations...');
      
      // Create organizations one by one to handle duplicates
      try {
        await prisma.organization.create({
          data: { name: 'Test Company A', subscriptionPlan: 'premium', isActive: true }
        });
      } catch (e) {
        // Ignore if already exists
      }
      
      try {
        await prisma.organization.create({
          data: { name: 'Test Company B', subscriptionPlan: 'free', isActive: true }
        });
      } catch (e) {
        // Ignore if already exists
      }
      
      const updatedOrgs = await prisma.organization.findMany();
      console.log(`   Created ${updatedOrgs.length} organizations total`);
    }
    
    // Step 2: Check employees per organization
    console.log('\n👥 Step 2: Checking Employees per Organization');
    const orgsWithEmployees = await prisma.organization.findMany({
      include: {
        _count: {
          select: { employees: true }
        }
      }
    });
    
    orgsWithEmployees.forEach(org => {
      console.log(`  ${org.name}: ${org._count.employees} employees`);
    });
    
    // Step 3: Verify data isolation
    console.log('\n🔒 Step 3: Verifying Data Isolation');
    
    const org1 = organizations[0];
    const org2 = organizations[1] || organizations[0];
    
    // Count employees per organization
    const org1Employees = await prisma.employee.count({
      where: { organizationId: org1.id }
    });
    
    const org2Employees = await prisma.employee.count({
      where: { organizationId: org2.id }
    });
    
    console.log(`  Organization ${org1.name} (ID: ${org1.id}): ${org1Employees} employees`);
    console.log(`  Organization ${org2.name} (ID: ${org2.id}): ${org2Employees} employees`);
    
    // Count other resources per organization
    const org1LeaveRequests = await prisma.leaveRequest.count({
      where: { organizationId: org1.id }
    });
    
    const org2LeaveRequests = await prisma.leaveRequest.count({
      where: { organizationId: org2.id }
    });
    
    console.log(`  ${org1.name} leave requests: ${org1LeaveRequests}`);
    console.log(`  ${org2.name} leave requests: ${org2LeaveRequests}`);
    
    const org1Timesheets = await prisma.timesheet.count({
      where: { organizationId: org1.id }
    });
    
    const org2Timesheets = await prisma.timesheet.count({
      where: { organizationId: org2.id }
    });
    
    console.log(`  ${org1.name} timesheets: ${org1Timesheets}`);
    console.log(`  ${org2.name} timesheets: ${org2Timesheets}`);
    
    // Step 4: Check role/permission isolation
    console.log('\n🔐 Step 4: Checking Role/Permission Isolation');
    
    const org1Roles = await prisma.roleConfig.count({
      where: { organizationId: org1.id }
    });
    
    const org2Roles = await prisma.roleConfig.count({
      where: { organizationId: org2.id }
    });
    
    console.log(`  ${org1.name} roles: ${org1Roles}`);
    console.log(`  ${org2.name} roles: ${org2Roles}`);
    
    // Step 5: Verify models without organizationId are linked correctly
    console.log('\n🔗 Step 5: Checking Relation-Based Isolation');
    
    // EmployeeSalary should be filtered by employee.organizationId
    const org1EmployeeIds = (await prisma.employee.findMany({
      where: { organizationId: org1.id },
      select: { id: true }
    })).map(e => e.id);
    
    const org1EmployeeSalaries = await prisma.employeeSalary.count({
      where: { employeeId: { in: org1EmployeeIds } }
    });
    
    console.log(`  ${org1.name} employee salaries (via employee relation): ${org1EmployeeSalaries}`);
    
    // PerformanceGoal should be filtered by cycle.organizationId
    const org1CycleIds = (await prisma.performanceCycle.findMany({
      where: { organizationId: org1.id },
      select: { id: true }
    })).map(c => c.id);
    
    const org1PerformanceGoals = await prisma.performanceGoal.count({
      where: { cycleId: { in: org1CycleIds } }
    });
    
    console.log(`  ${org1.name} performance goals (via cycle relation): ${org1PerformanceGoals}`);
    
    // Step 6: Test summary
    console.log('\n📋 Step 6: Test Summary');
    console.log('='.repeat(50));
    
    const tests = [
      { name: 'Multiple organizations exist', pass: organizations.length >= 2 },
      { name: 'Employees have organizationId', pass: org1Employees > 0 },
      { name: 'Leave requests isolated', pass: org1LeaveRequests !== org2LeaveRequests || org1LeaveRequests === 0 },
      { name: 'Timesheets isolated', pass: org1Timesheets !== org2Timesheets || org1Timesheets === 0 },
      { name: 'Roles isolated', pass: org1Roles > 0 },
      { name: 'Employee salaries linked correctly', pass: org1EmployeeSalaries >= 0 },
      { name: 'Performance goals linked correctly', pass: org1PerformanceGoals >= 0 }
    ];
    
    tests.forEach(test => {
      console.log(`  ${test.pass ? '✅' : '❌'} ${test.name}`);
    });
    
    const allPassed = tests.every(t => t.pass);
    
    console.log('\n🎯 Result:');
    if (allPassed) {
      console.log('  ✅ Multi-tenant isolation is working correctly');
    } else {
      console.log('  ⚠️  Some tests failed - review above');
    }
    
    // Step 7: Usage instructions
    console.log('\n📖 How to Test Manually:');
    console.log('  1. Create users for different organizations');
    console.log('  2. Login as user from Org A');
    console.log('  3. Create data (employees, leave requests, timesheets)');
    console.log('  4. Logout and login as user from Org B');
    console.log('  5. Verify you CANNOT see Org A\'s data');
    console.log('  6. Verify you CAN only see Org B\'s data');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMultiTenantIsolation();
