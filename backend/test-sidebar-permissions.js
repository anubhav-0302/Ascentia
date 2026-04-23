// Test sidebar permissions endpoint
async function testSidebarPermissions() {
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
    
    console.log('Testing /api/admin/roles/sidebar/permissions...\n');
    
    const res = await fetch('http://localhost:5000/api/admin/roles/sidebar/permissions', { headers });
    
    console.log('Status:', res.status);
    
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Sidebar permissions loaded');
      console.log('Permissions count:', data.data?.length || Object.keys(data.data || {}).length);
    } else {
      const text = await res.text();
      console.log('❌ Error:', text.substring(0, 200));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSidebarPermissions();
