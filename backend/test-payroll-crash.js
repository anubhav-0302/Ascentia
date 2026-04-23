// Test payroll routes individually to find crash point

async function testPayrollRoutes() {
  console.log('🔍 Testing Payroll Routes Individually\n');
  
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
  
  // Test routes one by one
  const routes = [
    { method: 'GET', path: '/api/payroll/salary-components' },
    { method: 'PUT', path: '/api/payroll/salary-components/1', body: '{"name":"Test"}' },
    { method: 'GET', path: '/api/payroll/employee-salaries' }
  ];
  
  for (const route of routes) {
    console.log(`\nTesting: ${route.method} ${route.path}`);
    
    try {
      const response = await fetch(`http://localhost:5000${route.path}`, {
        method: route.method,
        headers,
        body: route.body
      });
      
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success - ${data.data?.length || 0} items`);
      } else {
        const error = await response.text();
        console.log(`❌ Failed: ${error.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`💥 Crash: ${error.message}`);
      break;
    }
  }
}

testPayrollRoutes();
