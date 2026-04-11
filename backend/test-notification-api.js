// Test notification API directly
import http from 'http';

let adminToken = null;

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

async function testNotificationAPI() {
  console.log('🧪 Testing notification API...');
  
  try {
    // Get admin token
    const adminLoginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@ascentia.com',
      password: 'admin123'
    });
    
    if (adminLoginResponse.status === 200 && adminLoginResponse.data.success) {
      adminToken = adminLoginResponse.data.data.token;
      console.log('✅ Admin token obtained');
    }

    // Create a notification directly in the store
    console.log('\n📝 Creating notification directly...');
    const { createNotification, getUserNotifications } = await import('./notificationStoreDB.js');
    
    const notificationResult = await createNotification({
      targetUserIds: [1], // Admin user
      title: 'Test Notification',
      description: 'This is a test notification',
      type: 'info'
    });
    
    console.log('✅ Notification created:', notificationResult);

    // Test API to get notifications
    console.log('\n🔍 Testing API to get notifications...');
    const apiResponse = await makeRequest('GET', '/api/notifications', null, adminToken);
    console.log('API Response:', JSON.stringify(apiResponse.data, null, 2));

    // Test API to get unread count
    console.log('\n🔢 Testing API to get unread count...');
    const countResponse = await makeRequest('GET', '/api/notifications/unread-count', null, adminToken);
    console.log('Count Response:', JSON.stringify(countResponse.data, null, 2));

    // Test direct store access
    console.log('\n📋 Testing direct store access...');
    const directNotifications = await getUserNotifications(1);
    console.log('Direct notifications:', JSON.stringify(directNotifications, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testNotificationAPI();
