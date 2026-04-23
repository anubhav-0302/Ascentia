// Test the routes we just fixed
async function testFixedRoutes() {
  console.log('🔍 Testing Fixed Routes\n');
  
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
  
  // Test fixed routes
  const routes = [
    { method: 'GET', path: '/api/payroll/employee-salaries', desc: 'Employee salaries (fixed)' },
    { method: 'GET', path: '/api/performance/goals', desc: 'Performance goals (fixed)' },
    { method: 'GET', path: '/api/performance/reviews', desc: 'Performance reviews (fixed)' },
    { method: 'DELETE', path: '/api/kras/999', desc: 'Delete KRA (fixed)' }
  ];
  
  for (const route of routes) {
    console.log(`\nTesting: ${route.desc}`);
    
    try {
      const response = await fetch(`http://localhost:5000${route.path}`, {
        method: route.method,
        headers
      });
      
      console.log(`Status: ${response.status}`);
      
      if (response.ok || response.status === 404) {
        console.log(`✅ Working correctly`);
      } else {
        const error = await response.text();
        console.log(`❌ Still broken: ${error.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`💥 Connection error: ${error.message}`);
    }
  }
}

testFixedRoutes();
