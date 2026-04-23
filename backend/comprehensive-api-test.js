// Comprehensive API test based on routes listed in index.js

const routes = [
  // Auth routes (PUBLIC)
  { method: 'POST', path: '/api/auth/login', public: true },
  { method: 'POST', path: '/api/auth/register', public: true },
  { method: 'GET', path: '/api/auth/me', public: false },
  
  // Employee routes
  { method: 'GET', path: '/api/employees', public: false },
  { method: 'POST', path: '/api/employees', public: false },
  { method: 'PUT', path: '/api/employees/1', public: false },
  { method: 'DELETE', path: '/api/employees/999', public: false },
  
  // Dashboard routes
  { method: 'GET', path: '/api/dashboard/stats', public: false },
  
  // Leave routes
  { method: 'GET', path: '/api/leave/my', public: false },
  { method: 'GET', path: '/api/leave', public: false },
  { method: 'POST', path: '/api/leave', public: false },
  { method: 'PUT', path: '/api/leave/1', public: false },
  
  // Notification routes
  { method: 'GET', path: '/api/notifications', public: false },
  { method: 'GET', path: '/api/notifications/unread-count', public: false },
  { method: 'PUT', path: '/api/notifications/1/read', public: false },
  { method: 'PUT', path: '/api/notifications/read-all', public: false },
  { method: 'DELETE', path: '/api/notifications/1', public: false },
  
  // User routes
  { method: 'GET', path: '/api/users', public: false },
  { method: 'POST', path: '/api/users', public: false },
  { method: 'GET', path: '/api/users/1', public: false },
  { method: 'PUT', path: '/api/users/1', public: false },
  { method: 'PUT', path: '/api/users/1/password', public: false },
  { method: 'DELETE', path: '/api/users/999', public: false },
  
  // Timesheet routes
  { method: 'GET', path: '/api/timesheet', public: false },
  { method: 'GET', path: '/api/timesheet/all', public: false },
  { method: 'POST', path: '/api/timesheet', public: false },
  { method: 'PUT', path: '/api/timesheet/1', public: false },
  { method: 'PUT', path: '/api/timesheet/1/approve', public: false },
  { method: 'DELETE', path: '/api/timesheet/999', public: false },
  { method: 'GET', path: '/api/timesheet/history', public: false },
  
  // Performance routes
  { method: 'GET', path: '/api/performance/cycles', public: false },
  { method: 'POST', path: '/api/performance/cycles', public: false },
  { method: 'GET', path: '/api/performance/goals', public: false },
  { method: 'POST', path: '/api/performance/goals', public: false },
  { method: 'PUT', path: '/api/performance/goals/1', public: false },
  { method: 'GET', path: '/api/performance/reviews', public: false },
  { method: 'POST', path: '/api/performance/reviews', public: false },
  { method: 'PUT', path: '/api/performance/reviews/1', public: false },
  
  // KRA routes
  { method: 'GET', path: '/api/kras', public: false },
  { method: 'POST', path: '/api/kras', public: false },
  { method: 'PUT', path: '/api/kras/1', public: false },
  { method: 'DELETE', path: '/api/kras/999', public: false },
  
  // Payroll routes
  { method: 'GET', path: '/api/payroll/salary-components', public: false },
  { method: 'POST', path: '/api/payroll/salary-components', public: false },
  { method: 'PUT', path: '/api/payroll/salary-components/1', public: false },
  { method: 'DELETE', path: '/api/payroll/salary-components/999', public: false },
  { method: 'GET', path: '/api/payroll/employee-salaries', public: false },
  { method: 'POST', path: '/api/payroll/employee-salaries', public: false },
  { method: 'PUT', path: '/api/payroll/employee-salaries/1', public: false },
  
  // Additional routes from role management
  { method: 'GET', path: '/api/admin/roles', public: false },
  { method: 'GET', path: '/api/admin/roles/sidebar/permissions', public: false },
  { method: 'GET', path: '/api/admin/roles/1', public: false },
  { method: 'PUT', path: '/api/admin/roles/1/permissions', public: false },
  
  // Settings routes
  { method: 'GET', path: '/api/settings', public: false },
  { method: 'PUT', path: '/api/settings', public: false },
  { method: 'POST', path: '/api/settings/change-password', public: false },
  
  // Analytics routes
  { method: 'GET', path: '/api/analytics', public: false },
  
  // Logs routes
  { method: 'GET', path: '/api/logs', public: false },
  
  // Document routes
  { method: 'GET', path: '/api/documents', public: false },
  { method: 'POST', path: '/api/documents', public: false },
  
  // Data protection routes
  { method: 'GET', path: '/api/data-protection', public: false }
];

let authToken = '';
let testResults = {
  total: routes.length,
  passed: 0,
  failed: 0,
  broken: []
};

async function runTests() {
  console.log('🔍 Comprehensive API Endpoint Test\n');
  console.log('='.repeat(80));
  
  // Check if server is running
  try {
    const response = await fetch('http://localhost:5000/');
    if (!response.ok) {
      throw new Error('Server not responding');
    }
  } catch (error) {
    console.log('❌ Server is not running on http://localhost:5000');
    console.log('Please start the server with: npm run dev');
    return;
  }
  
  // Get auth token
  try {
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ascentia.com',
        password: 'admin123'
      })
    });
    
    if (loginResponse.ok) {
      const data = await loginResponse.json();
      authToken = data.data.token;  // Token is nested under data
      console.log('✅ Authentication successful\n');
    } else {
      console.log('❌ Failed to authenticate');
      return;
    }
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
    return;
  }
  
  // Test each route
  for (const route of routes) {
    await testRoute(route);
  }
  
  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 TEST SUMMARY');
  console.log(`Total routes tested: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  
  if (testResults.broken.length > 0) {
    console.log('\n🔍 BROKEN ROUTES:');
    testResults.broken.forEach(route => {
      console.log(`  ❌ ${route.method} ${route.path} - ${route.error}`);
    });
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('1. Check routes returning 404 - may not be implemented');
    console.log('2. Check routes returning 500 - server errors need fixing');
    console.log('3. Verify all middleware is properly configured');
    console.log('4. Ensure database tables exist for all routes');
  }
}

async function testRoute(route) {
  const url = `http://localhost:5000${route.path}`;
  const options = {
    method: route.method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  // Add auth header for protected routes
  if (!route.public && authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  // Add body for POST/PUT requests
  if (['POST', 'PUT'].includes(route.method)) {
    options.body = JSON.stringify({
      test: 'data',
      name: 'Test',
      email: 'test@example.com'
    });
  }
  
  try {
    const response = await fetch(url, options);
    const status = response.status;
    
    // Determine if test passed
    let passed = false;
    let note = '';
    
    if (route.public) {
      // Public routes should work without auth
      passed = status < 500;
    } else {
      // Protected routes should accept auth or return 401/403
      passed = status === 200 || status === 201 || status === 401 || status === 403 || status === 404;
    }
    
    // Special cases
    if (route.path.includes('/delete') || route.path.includes('/999')) {
      // Deleting non-existent items should return 404 or success
      passed = status === 404 || status === 200 || status === 400;
    }
    
    if (passed) {
      testResults.passed++;
      console.log(`✅ ${route.method} ${route.path} - ${status}`);
    } else {
      testResults.failed++;
      let errorDetail = `${status}`;
      
      if (status >= 500) {
        try {
          const errorText = await response.text();
          errorDetail += ` - ${errorText.substring(0, 50)}...`;
        } catch (e) {
          // Ignore
        }
      }
      
      testResults.broken.push({
        ...route,
        error: errorDetail
      });
      
      console.log(`❌ ${route.method} ${route.path} - ${errorDetail}`);
    }
  } catch (error) {
    testResults.failed++;
    testResults.broken.push({
      ...route,
      error: `Connection error: ${error.message}`
    });
    console.log(`❌ ${route.method} ${route.path} - Connection error`);
  }
}

// Run the tests
runTests().catch(console.error);
