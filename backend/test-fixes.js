// Test script to verify all fixes are working 100%
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';

// Test configuration
const ADMIN_CREDENTIALS = {
  email: 'admin@ascentia.com',
  password: 'admin123'
};

const EMPLOYEE_CREDENTIALS = {
  email: 'employee@ascentia.com', 
  password: '123456'
};

let adminToken = null;
let employeeToken = null;

// Helper function to make authenticated requests
async function authenticatedRequest(token, endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
  return response;
}

// Test 1: Login functionality
async function testLogin() {
  console.log('\n🧪 Testing Login functionality...');
  
  try {
    // Admin login
    const adminResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ADMIN_CREDENTIALS)
    });
    const adminData = await adminResponse.json();
    if (adminData.success) {
      adminToken = adminData.token;
      console.log('✅ Admin login successful');
    } else {
      throw new Error('Admin login failed');
    }

    // Employee login
    const employeeResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(EMPLOYEE_CREDENTIALS)
    });
    const employeeData = await employeeResponse.json();
    if (employeeData.success) {
      employeeToken = employeeData.token;
      console.log('✅ Employee login successful');
    } else {
      throw new Error('Employee login failed');
    }

    return true;
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
    return false;
  }
}

// Test 2: Leave data persistence
async function testLeavePersistence() {
  console.log('\n🧪 Testing Leave data persistence...');
  
  try {
    // Create a new leave request as employee
    const leaveData = {
      type: 'Sick Leave',
      startDate: '2024-12-01',
      endDate: '2024-12-02',
      reason: 'Test persistence'
    };

    const createResponse = await authenticatedRequest(employeeToken, '/api/leave', {
      method: 'POST',
      body: JSON.stringify(leaveData)
    });

    const createResult = await createResponse.json();
    if (!createResult.success) {
      throw new Error('Failed to create leave request');
    }

    const newLeaveId = createResult.data.id;
    console.log('✅ Leave request created successfully');

    // Verify it appears in employee's leave requests
    const myLeavesResponse = await authenticatedRequest(employeeToken, '/api/leave/my');
    const myLeavesResult = await myLeavesResponse.json();
    
    if (!myLeavesResult.success) {
      throw new Error('Failed to fetch employee leaves');
    }

    const myLeave = myLeavesResult.data.find(leave => leave.id === newLeaveId);
    if (!myLeave) {
      throw new Error('New leave request not found in employee list');
    }

    console.log('✅ Leave request appears in employee list');

    // Verify it appears in admin's leave requests
    const allLeavesResponse = await authenticatedRequest(adminToken, '/api/leave');
    const allLeavesResult = await allLeavesResponse.json();
    
    if (!allLeavesResult.success) {
      throw new Error('Failed to fetch all leaves');
    }

    const adminLeave = allLeavesResult.data.find(leave => leave.id === newLeaveId);
    if (!adminLeave) {
      throw new Error('New leave request not found in admin list');
    }

    console.log('✅ Leave request appears in admin list');

    return true;
  } catch (error) {
    console.error('❌ Leave persistence test failed:', error.message);
    return false;
  }
}

// Test 3: Notification routing
async function testNotificationRouting() {
  console.log('\n🧪 Testing Notification routing...');
  
  try {
    // Get initial notification counts
    const employeeNotificationsResponse = await authenticatedRequest(employeeToken, '/api/notifications/unread-count');
    const employeeNotificationsResult = await employeeNotificationsResponse.json();
    
    const adminNotificationsResponse = await authenticatedRequest(adminToken, '/api/notifications/unread-count');
    const adminNotificationsResult = await adminNotificationsResponse.json();

    const initialEmployeeCount = employeeNotificationsResult.data?.unreadCount || 0;
    const initialAdminCount = adminNotificationsResult.data?.unreadCount || 0;

    // Create a new leave request as employee
    const leaveData = {
      type: 'Annual Leave',
      startDate: '2024-12-10',
      endDate: '2024-12-11',
      reason: 'Test notification routing'
    };

    await authenticatedRequest(employeeToken, '/api/leave', {
      method: 'POST',
      body: JSON.stringify(leaveData)
    });

    // Wait a moment for notifications to be processed
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check notification counts after creating leave request
    const newEmployeeNotificationsResponse = await authenticatedRequest(employeeToken, '/api/notifications/unread-count');
    const newEmployeeNotificationsResult = await newEmployeeNotificationsResponse.json();
    
    const newAdminNotificationsResponse = await authenticatedRequest(adminToken, '/api/notifications/unread-count');
    const newAdminNotificationsResult = await newAdminNotificationsResponse.json();

    const newEmployeeCount = newEmployeeNotificationsResult.data?.unreadCount || 0;
    const newAdminCount = newAdminNotificationsResult.data?.unreadCount || 0;

    // Employee should NOT receive notification for their own leave request
    if (newEmployeeCount > initialEmployeeCount) {
      throw new Error('Employee incorrectly received notification for their own leave request');
    }

    // Admin SHOULD receive notification for employee's leave request
    if (newAdminCount <= initialAdminCount) {
      throw new Error('Admin did not receive notification for employee leave request');
    }

    console.log('✅ Notification routing working correctly - employee not notified, admin notified');

    return true;
  } catch (error) {
    console.error('❌ Notification routing test failed:', error.message);
    return false;
  }
}

// Test 4: Notification badge persistence
async function testNotificationBadgePersistence() {
  console.log('\n🧪 Testing Notification badge persistence...');
  
  try {
    // Get all notifications for admin
    const notificationsResponse = await authenticatedRequest(adminToken, '/api/notifications');
    const notificationsResult = await notificationsResponse.json();
    
    if (!notificationsResult.success) {
      throw new Error('Failed to fetch notifications');
    }

    const notifications = notificationsResult.data;
    
    if (notifications.length === 0) {
      console.log('⚠️ No notifications found to test badge persistence');
      return true;
    }

    // Mark all notifications as read
    await authenticatedRequest(adminToken, '/api/notifications/read-all', {
      method: 'PUT'
    });

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check unread count
    const unreadCountResponse = await authenticatedRequest(adminToken, '/api/notifications/unread-count');
    const unreadCountResult = await unreadCountResponse.json();

    const unreadCount = unreadCountResult.data?.unreadCount || 0;

    if (unreadCount !== 0) {
      throw new Error(`Expected unread count to be 0, got ${unreadCount}`);
    }

    console.log('✅ Notification badge persistence working correctly');

    return true;
  } catch (error) {
    console.error('❌ Notification badge persistence test failed:', error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting comprehensive test of all fixes...');
  
  const tests = [
    { name: 'Login', fn: testLogin },
    { name: 'Leave Persistence', fn: testLeavePersistence },
    { name: 'Notification Routing', fn: testNotificationRouting },
    { name: 'Notification Badge Persistence', fn: testNotificationBadgePersistence }
  ];

  let passedTests = 0;
  let failedTests = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passedTests++;
      } else {
        failedTests++;
      }
    } catch (error) {
      console.error(`❌ ${test.name} test failed with exception:`, error.message);
      failedTests++;
    }
  }

  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);

  if (failedTests === 0) {
    console.log('\n🎉 ALL TESTS PASSED! All fixes are working 100%');
  } else {
    console.log('\n⚠️ Some tests failed. Please review the issues above.');
  }
}

// Run tests
runAllTests().catch(console.error);
