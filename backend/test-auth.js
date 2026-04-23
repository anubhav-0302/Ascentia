// Test authentication flow
async function testAuth() {
  console.log('🔍 Testing Authentication Flow\n');
  
  try {
    // Step 1: Login
    console.log('1. Testing login...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ascentia.com',
        password: 'admin123'
      })
    });
    
    console.log(`Status: ${loginResponse.status}`);
    
    if (loginResponse.ok) {
      const data = await loginResponse.json();
      console.log('Login response:', JSON.stringify(data, null, 2));
      
      if (data.token) {
        console.log(`\nToken length: ${data.token.length}`);
        console.log(`Token starts with: ${data.token.substring(0, 20)}...`);
        
        // Step 2: Test protected route with token
        console.log('\n2. Testing protected route with token...');
        const protectedResponse = await fetch('http://localhost:5000/api/employees', {
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`Status: ${protectedResponse.status}`);
        
        if (protectedResponse.ok) {
          const employees = await protectedResponse.json();
          console.log(`✅ Success! Found ${employees.data?.length || 0} employees`);
        } else {
          const error = await protectedResponse.text();
          console.log('❌ Failed:', error);
        }
      } else {
        console.log('❌ No token in response');
      }
    } else {
      const error = await loginResponse.text();
      console.log('❌ Login failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testAuth();
