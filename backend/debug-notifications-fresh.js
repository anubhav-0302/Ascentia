// Debug notification system with fresh tokens
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

async function debugNotifications() {
  console.log('🔍 Debugging notification system with fresh tokens...');
  
  try {
    // Get fresh tokens
    console.log('\n🔑 Getting fresh tokens...');
    
    const adminLoginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@ascentia.com',
      password: 'admin123'
    });
    
    if (adminLoginResponse.status === 200 && adminLoginResponse.data.success) {
      adminToken = adminLoginResponse.data.data.token;
      console.log('✅ Admin token obtained');
    } else {
      throw new Error('Failed to get admin token');
    }

    const employeeLoginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'employee@ascentia.com',
      password: '123456'
    });
    
    if (employeeLoginResponse.status === 200 && employeeLoginResponse.data.success) {
      employeeToken = employeeLoginResponse.data.data.token;
      console.log('✅ Employee token obtained');
    } else {
      throw new Error('Failed to get employee token');
    }

    // Check initial notifications
    console.log('\n📋 Initial notifications:');
    
    const adminNotifResponse = await makeRequest('GET', '/api/notifications', null, adminToken);
    console.log('Admin notifications:', adminNotifResponse.data);

    const empNotifResponse = await makeRequest('GET', '/api/notifications', null, employeeToken);
    console.log('Employee notifications:', empNotifResponse.data);

    const adminCountResponse = await makeRequest('GET', '/api/notifications/unread-count', null, adminToken);
    console.log('Admin unread count:', adminCountResponse.data);

    const empCountResponse = await makeRequest('GET', '/api/notifications/unread-count', null, employeeToken);
    console.log('Employee unread count:', empCountResponse.data);

    // Create a new leave request to test notifications
    console.log('\n➕ Creating new leave request...');
    const leaveData = {
      type: 'Sick Leave',
      startDate: '2024-12-20',
      endDate: '2024-12-21',
      reason: 'Debug test notification routing'
    };

    const createResponse = await makeRequest('POST', '/api/leave', leaveData, employeeToken);
    console.log('Create leave response:', createResponse.data);

    if (createResponse.status !== 201) {
      console.log('❌ Failed to create leave request');
      return;
    }

    // Wait for notifications to be processed
    console.log('\n⏳ Waiting for notifications to be processed...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check notifications after leave request
    console.log('\n📋 Notifications after leave request:');
    
    const adminNotifResponse2 = await makeRequest('GET', '/api/notifications', null, adminToken);
    console.log('Admin notifications after:', adminNotifResponse2.data);

    const empNotifResponse2 = await makeRequest('GET', '/api/notifications', null, employeeToken);
    console.log('Employee notifications after:', empNotifResponse2.data);

    const adminCountResponse2 = await makeRequest('GET', '/api/notifications/unread-count', null, adminToken);
    console.log('Admin unread count after:', adminCountResponse2.data);

    const empCountResponse2 = await makeRequest('GET', '/api/notifications/unread-count', null, employeeToken);
    console.log('Employee unread count after:', empCountResponse2.data);

    // Test marking notifications as read
    console.log('\n📖 Testing mark as read...');
    
    if (adminNotifResponse2.data.data && adminNotifResponse2.data.data.length > 0) {
      const notificationId = adminNotifResponse2.data.data[0].id;
      const markReadResponse = await makeRequest('PUT', `/api/notifications/${notificationId}/read`, null, adminToken);
      console.log('Mark as read response:', markReadResponse.data);
    }

    // Test mark all as read
    console.log('\n📖 Testing mark all as read...');
    const markAllReadResponse = await makeRequest('PUT', '/api/notifications/read-all', null, adminToken);
    console.log('Mark all as read response:', markAllReadResponse.data);

    // Final unread count check
    const finalCountResponse = await makeRequest('GET', '/api/notifications/unread-count', null, adminToken);
    console.log('Final admin unread count:', finalCountResponse.data);

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugNotifications();
