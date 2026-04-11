// Debug notification system
import http from 'http';

const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc1OTIyNjA5LCJleHAiOjE3NzY1Mjc0MDl9.jg2bq9XtGffzLOLpdsXtCbaUBOf8NboiyilJmIgcOac';
const employeeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6ImVtcGxveWVlIiwiaWF0IjoxNzc1OTIyNjEwLCJleHAiOjE3NzY1Mjc0MTB9.1k2x8yHJxT7wYg3mQ9VrLd8fXe4nZqR6sYtW7uK3vI8';

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
  console.log('🔍 Debugging notification system...');
  
  try {
    // Check admin notifications
    console.log('\n📋 Admin notifications:');
    const adminNotifResponse = await makeRequest('GET', '/api/notifications', null, adminToken);
    console.log('Status:', adminNotifResponse.status);
    console.log('Data:', JSON.stringify(adminNotifResponse.data, null, 2));

    // Check employee notifications
    console.log('\n📋 Employee notifications:');
    const empNotifResponse = await makeRequest('GET', '/api/notifications', null, employeeToken);
    console.log('Status:', empNotifResponse.status);
    console.log('Data:', JSON.stringify(empNotifResponse.data, null, 2));

    // Check unread counts
    console.log('\n🔢 Unread counts:');
    const adminCountResponse = await makeRequest('GET', '/api/notifications/unread-count', null, adminToken);
    console.log('Admin unread count:', adminCountResponse.data);

    const empCountResponse = await makeRequest('GET', '/api/notifications/unread-count', null, employeeToken);
    console.log('Employee unread count:', empCountResponse.data);

    // Create a new leave request to test notifications
    console.log('\n➕ Creating new leave request...');
    const leaveData = {
      type: 'Sick Leave',
      startDate: '2024-12-15',
      endDate: '2024-12-16',
      reason: 'Debug test notification'
    };

    const createResponse = await makeRequest('POST', '/api/leave', leaveData, employeeToken);
    console.log('Create leave response:', JSON.stringify(createResponse.data, null, 2));

    // Wait for notifications
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check notifications again
    console.log('\n📋 Admin notifications after leave request:');
    const adminNotifResponse2 = await makeRequest('GET', '/api/notifications', null, adminToken);
    console.log('Status:', adminNotifResponse2.status);
    console.log('Data:', JSON.stringify(adminNotifResponse2.data, null, 2));

    console.log('\n📋 Employee notifications after leave request:');
    const empNotifResponse2 = await makeRequest('GET', '/api/notifications', null, employeeToken);
    console.log('Status:', empNotifResponse2.status);
    console.log('Data:', JSON.stringify(empNotifResponse2.data, null, 2));

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugNotifications();
