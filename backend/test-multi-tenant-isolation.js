import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import app from './index.js';
import { env } from './config/env.js';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:5000';

// Test configuration
const TEST_ORGS = {
  org1: { name: 'Test Organization 1', email: 'org1@test.com' },
  org2: { name: 'Test Organization 2', email: 'org2@test.com' }
};

const TEST_USERS = {
  admin1: { name: 'Admin Org1', email: 'admin1@org1.com', role: 'admin', password: 'test123' },
  admin2: { name: 'Admin Org2', email: 'admin2@org2.com', role: 'admin', password: 'test123' },
  emp1: { name: 'Employee Org1', email: 'emp1@org1.com', role: 'employee', password: 'test123' },
  emp2: { name: 'Employee Org2', email: 'emp2@org2.com', role: 'employee', password: 'test123' }
};

// Helper function to create test data
async function createTestData() {
  console.log('\n🏗️  Creating test organizations and users...');
  
  // Create organizations
  const org1 = await prisma.organization.create({
    data: { name: TEST_ORGS.org1.name, subscriptionPlan: 'free', isActive: true }
  });
  
  const org2 = await prisma.organization.create({
    data: { name: TEST_ORGS.org2.name, subscriptionPlan: 'free', isActive: true }
  });
  
  // Create users for org1
  const admin1 = await prisma.employee.create({
    data: {
      ...TEST_USERS.admin1,
      organizationId: org1.id,
      jobTitle: 'Administrator',
      department: 'IT',
      location: 'Office 1'
    }
  });
  
  const emp1 = await prisma.employee.create({
    data: {
      ...TEST_USERS.emp1,
      organizationId: org1.id,
      jobTitle: 'Developer',
      department: 'IT',
      location: 'Office 1'
    }
  });
  
  // Create users for org2
  const admin2 = await prisma.employee.create({
    data: {
      ...TEST_USERS.admin2,
      organizationId: org2.id,
      jobTitle: 'Administrator',
      department: 'HR',
      location: 'Office 2'
    }
  });
  
  const emp2 = await prisma.employee.create({
    data: {
      ...TEST_USERS.emp2,
      organizationId: org2.id,
      jobTitle: 'Manager',
      department: 'HR',
      location: 'Office 2'
    }
  });
  
  // Create some test data for each organization
  // Timesheet entries
  await prisma.timesheet.create({
    data: {
      employeeId: emp1.id,
      date: new Date(),
      hours: 8,
      description: 'Working on project',
      organizationId: org1.id
    }
  });
  
  await prisma.timesheet.create({
    data: {
      employeeId: emp2.id,
      date: new Date(),
      hours: 7,
      description: 'Meeting with clients',
      organizationId: org2.id
    }
  });
  
  // Leave requests
  await prisma.leave.create({
    data: {
      employeeId: emp1.id,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      type: 'Annual',
      status: 'Pending',
      reason: 'Vacation',
      organizationId: org1.id
    }
  });
  
  await prisma.leave.create({
    data: {
      employeeId: emp2.id,
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      type: 'Sick',
      status: 'Approved',
      reason: 'Medical appointment',
      organizationId: org2.id
    }
  });
  
  // Performance cycles
  const cycle1 = await prisma.performanceCycle.create({
    data: {
      name: 'Q1 2024 Review',
      description: 'Quarterly performance review',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-03-31'),
      organizationId: org1.id
    }
  });
  
  const cycle2 = await prisma.performanceCycle.create({
    data: {
      name: 'Q1 2024 Review',
      description: 'Quarterly performance review',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-03-31'),
      organizationId: org2.id
    }
  });
  
  // Performance goals
  await prisma.performanceGoal.create({
    data: {
      cycleId: cycle1.id,
      employeeId: emp1.id,
      title: 'Complete project milestones',
      description: 'Deliver all Q1 project milestones',
      targetDate: new Date('2024-03-31'),
      organizationId: org1.id
    }
  });
  
  await prisma.performanceGoal.create({
    data: {
      cycleId: cycle2.id,
      employeeId: emp2.id,
      title: 'Improve team productivity',
      description: 'Implement new productivity tools',
      targetDate: new Date('2024-03-31'),
      organizationId: org2.id
    }
  });
  
  console.log('✅ Test data created successfully');
  
  return {
    org1: { id: org1.id, admin: admin1, employee: emp1 },
    org2: { id: org2.id, admin: admin2, employee: emp2 }
  };
}

// Helper function to generate JWT token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

// Helper function to make API requests
async function apiRequest(endpoint, token, method = 'GET', data = null) {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  const options = {
    method,
    headers
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  return {
    status: response.status,
    data: await response.json()
  };
}

// Test functions
async function testEmployeeIsolation(testData) {
  console.log('\n🧪 Testing Employee Data Isolation...');
  
  const admin1Token = generateToken(testData.org1.admin);
  const admin2Token = generateToken(testData.org2.admin);
  
  // Admin 1 should only see org1 employees
  const org1Employees = await apiRequest('/api/employees', admin1Token);
  console.log(`Org1 Admin sees ${org1Employees.data?.length || 0} employees`);
  
  // Admin 2 should only see org2 employees
  const org2Employees = await apiRequest('/api/employees', admin2Token);
  console.log(`Org2 Admin sees ${org2Employees.data?.length || 0} employees`);
  
  // Verify cross-tenant access is blocked
  const org1EmpIds = org1Employees.data?.map(e => e.id) || [];
  const org2EmpIds = org2Employees.data?.map(e => e.id) || [];
  
  const hasCrossAccess = org1EmpIds.some(id => org2EmpIds.includes(id));
  
  if (hasCrossAccess) {
    console.log('❌ FAILED: Cross-tenant employee access detected!');
    return false;
  } else {
    console.log('✅ PASSED: Employee data isolation working correctly');
    return true;
  }
}

async function testTimesheetIsolation(testData) {
  console.log('\n🧪 Testing Timesheet Data Isolation...');
  
  const admin1Token = generateToken(testData.org1.admin);
  const admin2Token = generateToken(testData.org2.admin);
  
  // Admin 1 should only see org1 timesheets
  const org1Timesheets = await apiRequest('/api/timesheet/all', admin1Token);
  console.log(`Org1 Admin sees ${org1Timesheets.data?.length || 0} timesheet entries`);
  
  // Admin 2 should only see org2 timesheets
  const org2Timesheets = await apiRequest('/api/timesheet/all', admin2Token);
  console.log(`Org2 Admin sees ${org2Timesheets.data?.length || 0} timesheet entries`);
  
  // Verify cross-tenant access is blocked
  const org1TsIds = org1Timesheets.data?.map(t => t.id) || [];
  const org2TsIds = org2Timesheets.data?.map(t => t.id) || [];
  
  const hasCrossAccess = org1TsIds.some(id => org2TsIds.includes(id));
  
  if (hasCrossAccess) {
    console.log('❌ FAILED: Cross-tenant timesheet access detected!');
    return false;
  } else {
    console.log('✅ PASSED: Timesheet data isolation working correctly');
    return true;
  }
}

async function testLeaveIsolation(testData) {
  console.log('\n🧪 Testing Leave Data Isolation...');
  
  const admin1Token = generateToken(testData.org1.admin);
  const admin2Token = generateToken(testData.org2.admin);
  
  // Admin 1 should only see org1 leave requests
  const org1Leaves = await apiRequest('/api/leave/all', admin1Token);
  console.log(`Org1 Admin sees ${org1Leaves.data?.length || 0} leave requests`);
  
  // Admin 2 should only see org2 leave requests
  const org2Leaves = await apiRequest('/api/leave/all', admin2Token);
  console.log(`Org2 Admin sees ${org2Leaves.data?.length || 0} leave requests`);
  
  // Verify cross-tenant access is blocked
  const org1LeaveIds = org1Leaves.data?.map(l => l.id) || [];
  const org2LeaveIds = org2Leaves.data?.map(l => l.id) || [];
  
  const hasCrossAccess = org1LeaveIds.some(id => org2LeaveIds.includes(id));
  
  if (hasCrossAccess) {
    console.log('❌ FAILED: Cross-tenant leave access detected!');
    return false;
  } else {
    console.log('✅ PASSED: Leave data isolation working correctly');
    return true;
  }
}

async function testPerformanceIsolation(testData) {
  console.log('\n🧪 Testing Performance Data Isolation...');
  
  const admin1Token = generateToken(testData.org1.admin);
  const admin2Token = generateToken(testData.org2.admin);
  
  // Test cycles isolation
  const org1Cycles = await apiRequest('/api/performance/cycles', admin1Token);
  const org2Cycles = await apiRequest('/api/performance/cycles', admin2Token);
  
  console.log(`Org1 Admin sees ${org1Cycles.data?.length || 0} performance cycles`);
  console.log(`Org2 Admin sees ${org2Cycles.data?.length || 0} performance cycles`);
  
  // Test goals isolation
  const org1Goals = await apiRequest('/api/performance/goals', admin1Token);
  const org2Goals = await apiRequest('/api/performance/goals', admin2Token);
  
  console.log(`Org1 Admin sees ${org1Goals.data?.length || 0} performance goals`);
  console.log(`Org2 Admin sees ${org2Goals.data?.length || 0} performance goals`);
  
  // Verify cross-tenant access is blocked
  const org1CycleIds = org1Cycles.data?.map(c => c.id) || [];
  const org2CycleIds = org2Cycles.data?.map(c => c.id) || [];
  const cyclesCrossAccess = org1CycleIds.some(id => org2CycleIds.includes(id));
  
  const org1GoalIds = org1Goals.data?.map(g => g.id) || [];
  const org2GoalIds = org2Goals.data?.map(g => g.id) || [];
  const goalsCrossAccess = org1GoalIds.some(id => org2GoalIds.includes(id));
  
  if (cyclesCrossAccess || goalsCrossAccess) {
    console.log('❌ FAILED: Cross-tenant performance access detected!');
    return false;
  } else {
    console.log('✅ PASSED: Performance data isolation working correctly');
    return true;
  }
}

async function testDirectAccessAttempts(testData) {
  console.log('\n🧪 Testing Direct Cross-Tenant Access Attempts...');
  
  const admin1Token = generateToken(testData.org1.admin);
  
  // Try to access org2 employee directly by ID
  const directAccess = await apiRequest(`/api/employees/${testData.org2.employee.id}`, admin1Token);
  
  if (directAccess.status === 404) {
    console.log('✅ PASSED: Direct cross-tenant employee access blocked');
  } else {
    console.log('❌ FAILED: Direct cross-tenant employee access allowed!');
    return false;
  }
  
  // Try to access org2 timesheet directly by ID
  const org2Timesheets = await apiRequest('/api/timesheet/all', generateToken(testData.org2.admin));
  if (org2Timesheets.data?.length > 0) {
    const directTsAccess = await apiRequest(`/api/timesheet/${org2Timesheets.data[0].id}`, admin1Token);
    
    if (directTsAccess.status === 404) {
      console.log('✅ PASSED: Direct cross-tenant timesheet access blocked');
    } else {
      console.log('❌ FAILED: Direct cross-tenant timesheet access allowed!');
      return false;
    }
  }
  
  return true;
}

// Cleanup function
async function cleanupTestData(testData) {
  console.log('\n🧹 Cleaning up test data...');
  
  // Delete in correct order due to foreign key constraints
  await prisma.kRA.deleteMany({ where: { organizationId: { in: [testData.org1.id, testData.org2.id] } } });
  await prisma.performanceGoal.deleteMany({ where: { organizationId: { in: [testData.org1.id, testData.org2.id] } } });
  await prisma.performanceCycle.deleteMany({ where: { organizationId: { in: [testData.org1.id, testData.org2.id] } } });
  await prisma.leave.deleteMany({ where: { organizationId: { in: [testData.org1.id, testData.org2.id] } } });
  await prisma.timesheet.deleteMany({ where: { organizationId: { in: [testData.org1.id, testData.org2.id] } } });
  await prisma.employee.deleteMany({ where: { organizationId: { in: [testData.org1.id, testData.org2.id] } } });
  await prisma.organization.deleteMany({ where: { id: { in: [testData.org1.id, testData.org2.id] } } });
  
  console.log('✅ Test data cleaned up');
}

// Main test runner
async function runMultiTenantTests() {
  console.log('🚀 Starting Multi-Tenant Isolation Tests...\n');
  
  let testData = null;
  const testResults = [];
  
  try {
    // Create test data
    testData = await createTestData();
    
    // Run all tests
    testResults.push(await testEmployeeIsolation(testData));
    testResults.push(await testTimesheetIsolation(testData));
    testResults.push(await testLeaveIsolation(testData));
    testResults.push(await testPerformanceIsolation(testData));
    testResults.push(await testDirectAccessAttempts(testData));
    
    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const passedTests = testResults.filter(r => r).length;
    const totalTests = testResults.length;
    
    if (passedTests === totalTests) {
      console.log(`✅ All ${totalTests} tests PASSED! Multi-tenant isolation is working correctly.`);
    } else {
      console.log(`❌ ${totalTests - passedTests} out of ${totalTests} tests FAILED!`);
      console.log('⚠️  Multi-tenant isolation has security vulnerabilities!');
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  } finally {
    // Cleanup
    if (testData) {
      await cleanupTestData(testData);
    }
    
    await prisma.$disconnect();
    console.log('\n🏁 Tests completed.');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMultiTenantTests();
}

export { runMultiTenantTests };
