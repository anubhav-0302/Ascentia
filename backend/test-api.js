// Simple API test script
import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('🔍 Testing API...');
    
    // Test login
    console.log('🔍 Testing login...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@ascentia.com',
        password: 'admin123'
      })
    });
    
    console.log('📥 Login status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('📥 Login response:', loginData);
    
    if (loginData.success) {
      const token = loginData.data.token;
      console.log('✅ Got token:', token.substring(0, 50) + '...');
      
      // Test employee creation
      console.log('🔍 Testing employee creation...');
      const createResponse = await fetch('http://localhost:5000/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: 'Test Employee',
          email: 'test@example.com',
          jobTitle: 'Developer',
          department: 'Engineering',
          location: 'Remote',
          status: 'Active'
        })
      });
      
      console.log('📥 Create status:', createResponse.status);
      const createData = await createResponse.json();
      console.log('📥 Create response:', createData);
    }
    
  } catch (error) {
    console.error('❌ API test error:', error);
  }
}

testAPI();
