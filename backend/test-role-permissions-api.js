// Test the role permissions API to see what frontend receives
async function testRolePermissionsAPI() {
  console.log('🔍 Testing Role Permissions API\n');
  
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
  
  // Test GET /api/admin/roles/:id for each role
  const roles = ['admin', 'hr', 'manager', 'employee'];
  
  for (const roleName of roles) {
    console.log(`\n📋 Testing ${roleName} role permissions:`);
    
    try {
      // First get all roles to find the ID
      const rolesResponse = await fetch('http://localhost:5000/api/admin/roles', {
        headers
      });
      
      if (!rolesResponse.ok) {
        console.log('❌ Failed to get roles');
        continue;
      }
      
      const rolesData = await rolesResponse.json();
      const role = rolesData.data.find(r => r.name === roleName);
      
      if (!role) {
        console.log(`❌ Role ${roleName} not found`);
        continue;
      }
      
      // Get role permissions
      const permResponse = await fetch(`http://localhost:5000/api/admin/roles/${role.id}`, {
        headers
      });
      
      if (!permResponse.ok) {
        console.log(`❌ Failed to get permissions for ${roleName}`);
        continue;
      }
      
      const permData = await permResponse.json();
      
      // Log raw response structure
      console.log('  Raw response structure:', Object.keys(permData));
      
      // Analyze permission structure
      console.log(`  Role ID: ${role.id}`);
      console.log(`  Total permissions: ${permData.data?.permissions?.length || permData.permissions?.length || 0}`);
      
      const permissionsByModule = permData.data?.permissionsByModule || permData.permissionsByModule;
      
      if (permissionsByModule) {
        const modules = Object.keys(permissionsByModule);
        console.log(`  Modules: ${modules.join(', ')}`);
        
        // Show sample permissions from key modules
        ['payroll', 'performance', 'timesheet', 'leave', 'sidebar'].forEach(module => {
          if (permissionsByModule[module]) {
            console.log(`  ${module}:`);
            permissionsByModule[module].slice(0, 3).forEach(p => {
              console.log(`    - ${p.action}: ${p.isEnabled}`);
            });
            if (permissionsByModule[module].length > 3) {
              console.log(`    ... and ${permissionsByModule[module].length - 3} more`);
            }
          }
        });
      }
      
    } catch (error) {
      console.log(`💥 Error testing ${roleName}:`, error.message);
    }
  }
}

testRolePermissionsAPI();
