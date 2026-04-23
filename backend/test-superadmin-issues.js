// Test SuperAdmin issues
async function testSuperAdminIssues() {
  console.log('🔍 Testing SuperAdmin Issues\n');
  
  try {
    // Login as SuperAdmin
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@ascentia.com',
        password: 'superadmin123'
      })
    });
    
    const { data: { token } } = await loginRes.json();
    const headers = { 'Authorization': `Bearer ${token}` };
    
    console.log('✅ SuperAdmin login successful\n');
    
    // Test 1: Get Employees (should work)
    console.log('1. GET /api/employees');
    const empRes = await fetch('http://localhost:5000/api/employees', { headers });
    console.log(`   Status: ${empRes.status}`);
    if (!empRes.ok) {
      const error = await empRes.json();
      console.log(`   Error: ${error.message}`);
    } else {
      const data = await empRes.json();
      console.log(`   ✅ Got ${data.data?.length || 0} employees`);
    }
    
    // Test 2: Get Roles (should work)
    console.log('\n2. GET /api/admin/roles');
    const rolesRes = await fetch('http://localhost:5000/api/admin/roles', { headers });
    console.log(`   Status: ${rolesRes.status}`);
    if (!rolesRes.ok) {
      const error = await rolesRes.json();
      console.log(`   Error: ${error.message}`);
    } else {
      const data = await rolesRes.json();
      console.log(`   ✅ Got ${data.data?.length || 0} roles`);
    }
    
    // Test 3: Get Organizations (should work)
    console.log('\n3. GET /api/organizations');
    const orgsRes = await fetch('http://localhost:5000/api/organizations', { headers });
    console.log(`   Status: ${orgsRes.status}`);
    if (!orgsRes.ok) {
      const error = await orgsRes.json();
      console.log(`   Error: ${error.message}`);
    } else {
      const data = await orgsRes.json();
      console.log(`   ✅ Got ${data.data?.length || 0} organizations`);
    }
    
    // Test 4: Create Organization
    console.log('\n4. POST /api/organizations (create new)');
    const createRes = await fetch('http://localhost:5000/api/organizations', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Test Org ' + Date.now(),
        code: 'TEST-' + Date.now(),
        subscriptionPlan: 'premium'
      })
    });
    console.log(`   Status: ${createRes.status}`);
    if (!createRes.ok) {
      const error = await createRes.json();
      console.log(`   Error: ${error.message}`);
    } else {
      const data = await createRes.json();
      console.log(`   ✅ Created org: ${data.data?.name}`);
    }
    
    // Test 5: Get Dashboard
    console.log('\n5. GET /api/dashboard');
    const dashRes = await fetch('http://localhost:5000/api/dashboard', { headers });
    console.log(`   Status: ${dashRes.status}`);
    if (!dashRes.ok) {
      const error = await dashRes.json();
      console.log(`   Error: ${error.message}`);
    } else {
      const data = await dashRes.json();
      console.log(`   ✅ Dashboard data loaded`);
    }
    
    // Test 6: Get Settings
    console.log('\n6. GET /api/settings');
    const settingsRes = await fetch('http://localhost:5000/api/settings', { headers });
    console.log(`   Status: ${settingsRes.status}`);
    if (!settingsRes.ok) {
      const error = await settingsRes.json();
      console.log(`   Error: ${error.message}`);
    } else {
      const data = await settingsRes.json();
      console.log(`   ✅ Settings loaded`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSuperAdminIssues();
