// Test dashboard endpoint
async function testDashboard() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ascentia.com',
        password: 'admin123'
      })
    });
    
    const { data: { token } } = await loginRes.json();
    const headers = { 'Authorization': `Bearer ${token}` };
    
    console.log('Testing /api/dashboard...');
    const res = await fetch('http://localhost:5000/api/dashboard', { headers });
    const text = await res.text();
    
    console.log('Status:', res.status);
    console.log('Response:', text.substring(0, 300));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDashboard();
