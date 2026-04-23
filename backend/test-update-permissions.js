// Test updating role permissions to see what error occurs
async function testUpdatePermissions() {
  console.log('🔍 Testing Update Role Permissions\n');
  
  // Get auth token
  const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@ascentia.com',
      password: 'admin123'
    })
  });
  
  if (!loginResponse.ok) {
    console.log('❌ Failed to login');
    return;
  }
  
  const { token } = (await loginResponse.json()).data;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  // Test updating a single permission
  const updateData = {
    permissions: [
      {
        module: 'payroll',
        action: 'view',
        isEnabled: true
      }
    ],
    reason: 'Test update'
  };
  
  console.log('Testing update with:', JSON.stringify(updateData, null, 2));
  
  try {
    const response = await fetch('http://localhost:5000/api/admin/roles/1/permissions', {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData)
    });
    
    console.log(`\nStatus: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    
    const responseText = await response.text();
    console.log('\nResponse:', responseText);
    
    if (response.ok) {
      console.log('\n✅ Update successful!');
    } else {
      console.log('\n❌ Update failed');
    }
    
  } catch (error) {
    console.error('\n💥 Network error:', error);
  }
}

testUpdatePermissions();
