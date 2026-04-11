// Debug rejection notification routing specifically
import http from 'http';

let adminToken = null;
let employeeToken = null;

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

async function debugRejectionNotifications() {
  console.log('🔍 Debugging Rejection Notifications...');
  
  try {
    // Get fresh tokens
    const adminLoginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@ascentia.com',
      password: 'admin123'
    });
    const employeeLoginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'employee@ascentia.com',
      password: '123456'
    });
    
    adminToken = adminLoginResponse.data.data.token;
    employeeToken = employeeLoginResponse.data.data.token;
    
    console.log('✅ Tokens obtained');

    // Clear all notifications
    await makeRequest('DELETE', '/api/notifications', null, adminToken);
    await makeRequest('DELETE', '/api/notifications', null, employeeToken);
    await new Promise(resolve => setTimeout(resolve, 200));

    // Create a new leave request as employee
    console.log('\n📝 Creating leave request as employee...');
    const leaveData = {
      type: 'Sick Leave',
      startDate: '2024-12-25',
      endDate: '2024-12-26',
      reason: 'Debug rejection notifications'
    };

    const createResponse = await makeRequest('POST', '/api/leave', leaveData, employeeToken);
    const leaveId = createResponse.data.data.id;
    console.log(`✅ Leave request created with ID: ${leaveId}`);

    // Wait for notifications
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check notifications after creation
    const adminNotifAfterCreate = await makeRequest('GET', '/api/notifications', null, adminToken);
    const empNotifAfterCreate = await makeRequest('GET', '/api/notifications', null, employeeToken);

    console.log('\n📋 Notifications after leave creation:');
    console.log('Admin notifications:', adminNotifAfterCreate.data.data.length);
    console.log('Employee notifications:', empNotifAfterCreate.data.data.length);

    // Test the notification function directly
    console.log('\n🧪 Testing notification function directly...');
    const { createLeaveStatusUpdateNotifications } = await import('./notificationStoreDB.js');
    
    const testLeaveRequest = {
      id: leaveId,
      userId: 2, // Employee user
      type: 'Sick Leave',
      startDate: '2024-12-25',
      endDate: '2024-12-26',
      reason: 'Debug rejection notifications'
    };

    const directNotifications = await createLeaveStatusUpdateNotifications(testLeaveRequest, 'Rejected', 1); // Admin ID 1
    console.log('Direct notification result:', directNotifications);

    // Wait for notifications to be processed
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check notifications after direct test
    const adminNotifAfterDirect = await makeRequest('GET', '/api/notifications', null, adminToken);
    const empNotifAfterDirect = await makeRequest('GET', '/api/notifications', null, employeeToken);

    console.log('\n📋 Notifications after direct test:');
    console.log('Admin notifications:', adminNotifAfterDirect.data.data.length);
    console.log('Employee notifications:', empNotifAfterDirect.data.data.length);
    
    console.log('\n📋 Employee notification details:');
    empNotifAfterDirect.data.data.forEach((n, i) => {
      console.log(`  ${i+1}. ${n.title}: ${n.description}`);
    });

    // Now test via API
    console.log('\n🌐 Testing via API rejection...');
    const rejectResponse = await makeRequest('PUT', `/api/leave/${leaveId}`, { status: 'Rejected' }, adminToken);
    console.log('Reject response status:', rejectResponse.status);

    // Wait for notifications
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check final notifications
    const adminNotifFinal = await makeRequest('GET', '/api/notifications', null, adminToken);
    const empNotifFinal = await makeRequest('GET', '/api/notifications', null, employeeToken);

    console.log('\n📋 Final notifications after API rejection:');
    console.log('Admin notifications:', adminNotifFinal.data.data.length);
    console.log('Employee notifications:', empNotifFinal.data.data.length);
    
    console.log('\n📋 Final employee notification details:');
    empNotifFinal.data.data.forEach((n, i) => {
      console.log(`  ${i+1}. ${n.title}: ${n.description} (Type: ${n.type})`);
    });

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugRejectionNotifications();
