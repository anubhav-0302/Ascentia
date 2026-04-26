const http = require('http');

// Helper to make HTTP requests
function request(options) {
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });
    req.on('error', (err) => resolve({ status: 0, error: err.message }));
    req.end();
  });
}

async function quickTest() {
  console.log('🧪 Quick Feature Test\n');
  
  const tests = [
    { name: 'Server root endpoint', path: '/', expected: 200 },
    { name: 'Employees (no auth)', path: '/api/employees', expected: 401 },
    { name: 'Performance cycles (no auth)', path: '/api/performance/cycles', expected: 401 },
    { name: 'Dashboard stats (no auth)', path: '/api/dashboard/stats', expected: 401 },
    { name: 'Non-existent endpoint', path: '/api/nonexistent', expected: 404 }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: test.path,
      method: 'GET'
    };
    
    const result = await request(options);
    const status = result.status === test.expected ? '✅' : '❌';
    console.log(`${status} ${test.name}: got ${result.status}, expected ${test.expected}`);
    
    if (result.status === test.expected) passed++;
    else failed++;
  }
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('✅ All critical endpoints are responding correctly!');
  } else {
    console.log('❌ Some endpoints are not working as expected');
  }
}

quickTest();
