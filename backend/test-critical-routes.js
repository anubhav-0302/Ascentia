// Test critical routes one by one with delays
async function testCriticalRoutes() {
  console.log('🔍 Testing Critical Routes Individually\n');
  
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
  
  // Test critical routes with delays
  const routes = [
    { method: 'GET', path: '/api/employees', desc: 'Employee list' },
    { method: 'GET', path: '/api/admin/roles', desc: 'Admin roles' },
    { method: 'GET', path: '/api/admin/roles/sidebar/permissions', desc: 'Sidebar permissions' },
    { method: 'GET', path: '/api/payroll/employee-salaries', desc: 'Employee salaries' },
    { method: 'GET', path: '/api/performance/goals', desc: 'Performance goals' },
    { method: 'GET', path: '/api/kras', desc: 'KRA list' }
  ];
  
  for (const route of routes) {
    console.log(`\nTesting: ${route.desc} (${route.method} ${route.path})`);
    
    try {
      const response = await fetch(`http://localhost:5000${route.path}`, {
        method: route.method,
        headers
      });
      
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Working - ${data.data?.length || 0} items`);
      } else if (response.status === 404) {
        console.log(`⚠️  Not found (expected for some routes)`);
      } else {
        const error = await response.text();
        console.log(`❌ Error: ${error.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`💥 Connection failed: ${error.message}`);
      console.log('Server may have crashed - stopping test');
      break;
    }
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

testCriticalRoutes();
