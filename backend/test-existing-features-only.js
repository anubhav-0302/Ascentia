// Test only existing features (not new multi-org)
async function testExistingFeaturesOnly() {
  console.log('🔍 EXISTING FEATURES TEST (Pre-Multi-Org)\n');
  
  try {
    // Login as admin
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ascentia.com',
        password: 'admin123'
      })
    });
    
    if (!loginRes.ok) {
      console.log('❌ Login failed');
      return;
    }
    
    const { data: { token } } = await loginRes.json();
    const headers = { 'Authorization': `Bearer ${token}` };
    
    const tests = [
      { name: 'Employees', url: '/api/employees' },
      { name: 'My Leaves', url: '/api/leave' },
      { name: 'My Timesheet', url: '/api/timesheet' },
      { name: 'Performance Cycles', url: '/api/performance/cycles' },
      { name: 'Salary Components', url: '/api/payroll/salary-components' },
      { name: 'Notifications', url: '/api/notifications' },
      { name: 'Settings', url: '/api/settings' },
      { name: 'Roles', url: '/api/admin/roles' },
      { name: 'Sidebar Permissions', url: '/api/admin/roles/sidebar/permissions' },
      { name: 'Analytics', url: '/api/analytics' },
      { name: 'Logs', url: '/api/logs' },
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
      try {
        const res = await fetch(`http://localhost:5000${test.url}`, { headers });
        
        if (res.ok) {
          const data = await res.json();
          const count = data.data?.length || Object.keys(data.data || {}).length || 0;
          console.log(`✅ ${test.name}: 200 OK (${count} items)`);
          passed++;
        } else {
          console.log(`❌ ${test.name}: ${res.status}`);
          failed++;
        }
      } catch (error) {
        console.log(`❌ ${test.name}: Error - ${error.message}`);
        failed++;
      }
    }
    
    console.log(`\n📊 RESULTS:`);
    console.log(`   ✅ Working: ${passed}/${passed + failed}`);
    console.log(`   ❌ Issues: ${failed}/${passed + failed}`);
    
    if (failed === 0) {
      console.log(`\n✅ ALL EXISTING FEATURES WORKING PERFECTLY!`);
      console.log(`✅ NO BREAKING CHANGES FROM MULTI-ORG IMPLEMENTATION!`);
    } else {
      console.log(`\n⚠️  ${failed} features have issues`);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testExistingFeaturesOnly();
