// Test org creation error details
async function testOrgCreation() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@ascentia.com',
        password: 'superadmin123'
      })
    });
    
    const { data: { token } } = await loginRes.json();
    
    console.log('Testing organization creation...\n');
    
    const res = await fetch('http://localhost:5000/api/organizations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'New Test Org ' + Date.now(),
        code: 'NEW-TEST-' + Date.now(),
        subscriptionPlan: 'premium'
      })
    });
    
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testOrgCreation();
