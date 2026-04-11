// Test notification via actual API with detailed debugging
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

async function testApiNotifications() {
  console.log('🌐 Testing notifications via API...');
  
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
    console.log('\n🗑️ Clearing existing notifications...');
    await makeRequest('DELETE', '/api/notifications', null, adminToken);
    await makeRequest('DELETE', '/api/notifications', null, employeeToken);
    await new Promise(resolve => setTimeout(resolve, 200));

    // Create a new leave request as employee
    console.log('\n📝 Creating leave request as employee...');
    const leaveData = {
      type: 'Sick Leave',
      startDate: '2024-12-25',
      endDate: '2024-12-26',
      reason: 'API notification test'
    };

    const createResponse = await makeRequest('POST', '/api/leave', leaveData, employeeToken);
    
    if (createResponse.status !== 201) {
      console.log('❌ Failed to create leave request:', createResponse);
      return false;
    }

    const leaveId = createResponse.data.data.id;
    console.log(`✅ Leave request created with ID: ${leaveId}`);

    // Wait for notifications
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check notifications after creation
    const adminNotifAfterCreate = await makeRequest('GET', '/api/notifications', null, adminToken);
    const empNotifAfterCreate = await makeRequest('GET', '/api/notifications', null, employeeToken);

    console.log('\n📋 Notifications after leave creation:');
    console.log(`Admin: ${adminNotifAfterCreate.data.data.length} notifications`);
    console.log(`Employee: ${empNotifAfterCreate.data.data.length} notifications`);

    // Reject the leave request as admin
    console.log('\n❌ Rejecting leave request as admin...');
    const rejectResponse = await makeRequest('PUT', `/api/leave/${leaveId}`, { status: 'Rejected' }, adminToken);
    
    if (rejectResponse.status !== 200) {
      console.log('❌ Failed to reject leave request:', rejectResponse);
      return false;
    }

    console.log('✅ Leave request rejected via API');

    // Wait for notifications to be processed
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check notifications after rejection
    const adminNotifAfterReject = await makeRequest('GET', '/api/notifications', null, adminToken);
    const empNotifAfterReject = await makeRequest('GET', '/api/notifications', null, employeeToken);

    console.log('\n📋 Notifications after rejection:');
    console.log(`Admin: ${adminNotifAfterReject.data.data.length} notifications`);
    console.log(`Employee: ${empNotifAfterReject.data.data.length} notifications`);

    // Check employee notifications for rejection
    const employeeRejectionNotif = empNotifAfterReject.data.data.find(n => 
      n.title === 'Leave Request Rejected' && 
      n.description.includes('has been rejected')
    );

    if (employeeRejectionNotif) {
      console.log('✅ SUCCESS: Employee received rejection notification');
      console.log(`   Title: ${employeeRejectionNotif.title}`);
      console.log(`   Description: ${employeeRejectionNotif.description}`);
      console.log(`   Type: ${employeeRejectionNotif.type}`);
    } else {
      console.log('❌ FAILED: Employee did not receive rejection notification');
      console.log('Employee notifications:', empNotifAfterReject.data.data);
    }

    // Test approval as well
    console.log('\n✅ Testing approval...');
    
    // Create another leave request
    const createResponse2 = await makeRequest('POST', '/api/leave', {
      type: 'Annual Leave',
      startDate: '2024-12-30',
      endDate: '2024-12-31',
      reason: 'API approval test'
    }, employeeToken);
    
    const leaveId2 = createResponse2.data.data.id;
    await new Promise(resolve => setTimeout(resolve, 500));

    // Approve it
    const approveResponse = await makeRequest('PUT', `/api/leave/${leaveId2}`, { status: 'Approved' }, adminToken);
    
    if (approveResponse.status !== 200) {
      console.log('❌ Failed to approve leave request');
      return false;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check for approval notification
    const empNotifAfterApprove = await makeRequest('GET', '/api/notifications', null, employeeToken);
    const employeeApprovalNotif = empNotifAfterApprove.data.data.find(n => 
      n.title === 'Leave Request Approved' && 
      n.description.includes('has been approved')
    );

    if (employeeApprovalNotif) {
      console.log('✅ SUCCESS: Employee received approval notification');
    } else {
      console.log('❌ FAILED: Employee did not receive approval notification');
    }

    return employeeRejectionNotif && employeeApprovalNotif;

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    return false;
  }
}

testApiNotifications().then(success => {
  console.log(`\n🏁 Test result: ${success ? 'PASSED' : 'FAILED'}`);
}).catch(console.error);
