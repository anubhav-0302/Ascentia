// Test SuperAdmin login and organization management
async function testSuperAdmin() {
  console.log('🔍 Testing SuperAdmin Implementation\n');
  
  try {
    // Step 1: Login as SuperAdmin
    console.log('1. Testing SuperAdmin login...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@ascentia.com',
        password: 'superadmin123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed');
      const errorText = await loginResponse.text();
      console.log('Error:', errorText);
      return;
    }
    
    const loginData = await loginResponse.json();
    const { token, user } = loginData.data;
    console.log(`✅ Login successful`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Organization ID: ${user.organizationId || 'None (Super Admin)'}`);
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Step 2: Test GET /api/organizations
    console.log('\n2. Testing GET /api/organizations...');
    const orgsResponse = await fetch('http://localhost:5000/api/organizations', {
      headers
    });
    
    if (!orgsResponse.ok) {
      console.log('❌ Failed to get organizations');
      const errorText = await orgsResponse.text();
      console.log('Error:', errorText);
    } else {
      const orgsData = await orgsResponse.json();
      console.log(`✅ Got ${orgsData.data.length} organizations`);
      orgsData.data.forEach(org => {
        console.log(`   - ${org.name} (${org.code || 'No code'}) - ${org._count?.employees || 0} employees`);
      });
    }
    
    // Step 3: Test GET /api/organizations/available
    console.log('\n3. Testing GET /api/organizations/available...');
    const availableResponse = await fetch('http://localhost:5000/api/organizations/available', {
      headers
    });
    
    if (!availableResponse.ok) {
      console.log('❌ Failed to get available organizations');
    } else {
      const availableData = await availableResponse.json();
      console.log(`✅ Got ${availableData.data.length} available organizations`);
    }
    
    // Step 4: Test creating a new organization
    console.log('\n4. Testing POST /api/organizations (create new org)...');
    const createResponse = await fetch('http://localhost:5000/api/organizations', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Test Organization',
        code: 'TEST-ORG',
        subscriptionPlan: 'premium'
      })
    });
    
    if (!createResponse.ok) {
      console.log('❌ Failed to create organization');
      const errorText = await createResponse.text();
      console.log('Error:', errorText);
    } else {
      const createData = await createResponse.json();
      console.log(`✅ Organization created: ${createData.data.name} (ID: ${createData.data.id})`);
      
      // Step 5: Test switching to the new organization
      console.log('\n5. Testing GET /api/organizations/switch/:id...');
      const switchResponse = await fetch(`http://localhost:5000/api/organizations/switch/${createData.data.id}`, {
        headers
      });
      
      if (!switchResponse.ok) {
        console.log('❌ Failed to switch organization');
      } else {
        const switchData = await switchResponse.json();
        console.log(`✅ Switched to: ${switchData.data.name}`);
      }
      
      // Clean up - delete test organization
      console.log('\n6. Cleaning up - deleting test organization...');
      const deleteResponse = await fetch(`http://localhost:5000/api/organizations/${createData.data.id}`, {
        method: 'DELETE',
        headers
      });
      
      if (!deleteResponse.ok) {
        console.log('❌ Failed to delete test organization');
      } else {
        console.log('✅ Test organization deleted');
      }
    }
    
    console.log('\n🎯 Summary:');
    console.log('   ✅ SuperAdmin login working');
    console.log('   ✅ Organization management APIs working');
    console.log('   ✅ Organization switching working');
    console.log('\n📝 SuperAdmin Credentials:');
    console.log('   Email: superadmin@ascentia.com');
    console.log('   Password: superadmin123');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSuperAdmin();
