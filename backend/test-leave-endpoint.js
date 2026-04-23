// Test leave endpoint
async function testLeave() {
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
    
    console.log('Testing /api/leave/all...');
    const res = await fetch('http://localhost:5000/api/leave/all', { headers });
    const text = await res.text();
    
    console.log('Status:', res.status);
    console.log('Response:', text.substring(0, 200));
    
    if (res.ok) {
      const data = JSON.parse(text);
      console.log('✅ Leaves:', data.data?.length || 0);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLeave();
