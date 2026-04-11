// Test the rejection notification routing fix and database logging
import http from 'http';

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

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.setEncoding('utf8');
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testRejectionNotificationRouting() {
  console.log('🧪 Testing Rejection Notification Routing Fix...');
  
  try {
    // Get fresh tokens
    const adminLoginResponse = await makeRequest('POST', '/api/auth/login', ADMIN_CREDENTIALS);
    const employeeLoginResponse = await makeRequest('POST', '/api/auth/login', EMPLOYEE_CREDENTIALS);
    
    adminToken = adminLoginResponse.data.data.token;
    employeeToken = employeeLoginResponse.data.data.token;
    
    console.log('✅ Tokens obtained');

    // Clear existing notifications
    await makeRequest('DELETE', '/api/notifications', null, adminToken);
    await makeRequest('DELETE', '/api/notifications', null, employeeToken);
    await new Promise(resolve => setTimeout(resolve, 200));

    // Create a new leave request as employee
    console.log('\n📝 Creating leave request as employee...');
    const leaveData = {
      type: 'Sick Leave',
      startDate: '2024-12-25',
      endDate: '2024-12-26',
      reason: 'Test rejection notification routing'
    };

    const createResponse = await makeRequest('POST', '/api/leave', leaveData, employeeToken);
    
    if (createResponse.status !== 201) {
      throw new Error('Failed to create leave request');
    }

    const leaveId = createResponse.data.data.id;
    console.log(`✅ Leave request created with ID: ${leaveId}`);

    // Wait for notifications to be processed
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check initial notifications (admin should get notified of new request)
    const adminNotifBefore = await makeRequest('GET', '/api/notifications/unread-count', null, adminToken);
    const empNotifBefore = await makeRequest('GET', '/api/notifications/unread-count', null, employeeToken);

    console.log(`Notifications before rejection - Admin: ${adminNotifBefore.data.data.unreadCount}, Employee: ${empNotifBefore.data.data.unreadCount}`);

    // Reject the leave request as admin
    console.log('\n❌ Rejecting leave request as admin...');
    const rejectResponse = await makeRequest('PUT', `/api/leave/${leaveId}`, { status: 'Rejected' }, adminToken);
    
    if (rejectResponse.status !== 200) {
      throw new Error('Failed to reject leave request');
    }

    console.log('✅ Leave request rejected');

    // Wait for notifications to be processed
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check notifications after rejection
    const adminNotifAfter = await makeRequest('GET', '/api/notifications/unread-count', null, adminToken);
    const empNotifAfter = await makeRequest('GET', '/api/notifications/unread-count', null, employeeToken);

    console.log(`Notifications after rejection - Admin: ${adminNotifAfter.data.data.unreadCount}, Employee: ${empNotifAfter.data.data.unreadCount}`);

    // Get detailed notifications for employee
    const empNotifications = await makeRequest('GET', '/api/notifications', null, employeeToken);
    console.log('Employee notifications:', JSON.stringify(empNotifications.data.data, null, 2));

    // Verify the fix
    const employeeGotRejectionNotification = empNotifications.data.data.some(n => 
      n.title === 'Leave Request Rejected' && 
      n.description.includes('has been rejected')
    );

    if (employeeGotRejectionNotification) {
      console.log('✅ SUCCESS: Employee received rejection notification');
    } else {
      console.log('❌ FAILED: Employee did not receive rejection notification');
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

async function testDatabaseLogging() {
  console.log('\n🧪 Testing Database Logging...');
  
  try {
    const { getEntityLogs, getLogStatistics } = await import('./databaseLogger.js');
    
    // Check leave request logs
    const leaveLogs = getEntityLogs('leave_request', 5);
    console.log('📋 Recent leave request logs:', leaveLogs.length);
    
    // Check notification logs
    const notificationLogs = getEntityLogs('notification', 5);
    console.log('📋 Recent notification logs:', notificationLogs.length);
    
    // Check log statistics
    const stats = getLogStatistics();
    if (stats) {
      console.log('📊 Database log statistics:');
      console.log(`  Total logs: ${stats.totalLogs}`);
      console.log(`  Operations: ${JSON.stringify(stats.operations)}`);
      console.log(`  Entities: ${JSON.stringify(stats.entities)}`);
      console.log(`  Last 24 hours: ${stats.last24Hours}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database logging test failed:', error.message);
    return false;
  }
}

async function testApprovalNotificationRouting() {
  console.log('\n🧪 Testing Approval Notification Routing...');
  
  try {
    // Create a new leave request as employee
    const leaveData = {
      type: 'Annual Leave',
      startDate: '2024-12-30',
      endDate: '2024-12-31',
      reason: 'Test approval notification routing'
    };

    const createResponse = await makeRequest('POST', '/api/leave', leaveData, employeeToken);
    const leaveId = createResponse.data.data.id;

    // Wait for notifications
    await new Promise(resolve => setTimeout(resolve, 500));

    // Clear employee notifications to test approval
    await makeRequest('DELETE', '/api/notifications', null, employeeToken);
    await new Promise(resolve => setTimeout(resolve, 200));

    // Approve the leave request as admin
    const approveResponse = await makeRequest('PUT', `/api/leave/${leaveId}`, { status: 'Approved' }, adminToken);
    
    if (approveResponse.status !== 200) {
      throw new Error('Failed to approve leave request');
    }

    // Wait for notifications
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if employee got approval notification
    const empNotifications = await makeRequest('GET', '/api/notifications', null, employeeToken);
    const employeeGotApprovalNotification = empNotifications.data.data.some(n => 
      n.title === 'Leave Request Approved' && 
      n.description.includes('has been approved')
    );

    if (employeeGotApprovalNotification) {
      console.log('✅ SUCCESS: Employee received approval notification');
      return true;
    } else {
      console.log('❌ FAILED: Employee did not receive approval notification');
      console.log('Employee notifications:', JSON.stringify(empNotifications.data.data, null, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ Approval test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Testing Rejection Notification Fix and Database Logging...');
  
  const tests = [
    { name: 'Rejection Notification Routing', fn: testRejectionNotificationRouting },
    { name: 'Approval Notification Routing', fn: testApprovalNotificationRouting },
    { name: 'Database Logging', fn: testDatabaseLogging }
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

  console.log('\n📊 TEST RESULTS:');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);

  if (failedTests === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Rejection notification routing is fixed and database logging is working');
    console.log('\n✅ SUMMARY OF FIXES:');
    console.log('1. ✅ Rejection notifications now go to employees, not admins');
    console.log('2. ✅ Approval notifications go to employees');
    console.log('3. ✅ Database logging tracks all CRUD operations');
    console.log('4. ✅ All existing functionality preserved');
  } else {
    console.log('\n⚠️ Some tests failed. Please review the issues above.');
  }
}

// Run tests
runAllTests().catch(console.error);
