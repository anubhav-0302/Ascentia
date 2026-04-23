// Test updating role permissions with actual change
async function testUpdatePermissionsChange() {
  console.log('🔍 Testing Update Role Permissions with Change\n');
  
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
  
  // First get current permissions
  console.log('1. Getting current permissions...');
  const getResponse = await fetch('http://localhost:5000/api/admin/roles/1', {
    headers
  });
  
  const getData = await getResponse.json();
  const currentPayrollView = getData.data.permissionsByModule.payroll?.find(p => p.action === 'view');
  console.log(`Current payroll.view: ${currentPayrollView?.isEnabled}`);
  
  // Toggle the permission
  const newValue = !currentPayrollView?.isEnabled;
  console.log(`2. Changing payroll.view to: ${newValue}`);
  
  const updateData = {
    permissions: [
      {
        module: 'payroll',
        action: 'view',
        isEnabled: newValue
      }
    ],
    reason: 'Test toggle permission'
  };
  
  try {
    const response = await fetch('http://localhost:5000/api/admin/roles/1/permissions', {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData)
    });
    
    console.log(`\n3. Update Status: ${response.status}`);
    
    const responseText = await response.text();
    console.log('\nResponse:', responseText);
    
    if (response.ok) {
      console.log('\n4. Verifying change...');
      
      // Get permissions again to verify
      const verifyResponse = await fetch('http://localhost:5000/api/admin/roles/1', {
        headers
      });
      
      const verifyData = await verifyResponse.json();
      const updatedPayrollView = verifyData.data.permissionsByModule.payroll?.find(p => p.action === 'view');
      console.log(`Updated payroll.view: ${updatedPayrollView?.isEnabled}`);
      
      if (updatedPayrollView?.isEnabled === newValue) {
        console.log('\n✅ Permission update successful!');
      } else {
        console.log('\n❌ Permission not updated correctly');
      }
    } else {
      console.log('\n❌ Update failed');
    }
    
  } catch (error) {
    console.error('\n💥 Network error:', error);
  }
}

testUpdatePermissionsChange();
