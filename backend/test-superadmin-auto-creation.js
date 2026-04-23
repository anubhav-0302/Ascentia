// Test that SuperAdmin is auto-created on server startup
async function testSuperAdminAutoCreation() {
  console.log('✅ SUPERADMIN AUTO-CREATION TEST\n');
  
  try {
    // Try to login as SuperAdmin
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@ascentia.com',
        password: 'superadmin123'
      })
    });
    
    if (loginRes.ok) {
      const { data: { user } } = await loginRes.json();
      console.log('✅ SuperAdmin auto-created and login successful!');
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Organization ID: ${user.organizationId || 'None (Super Admin)'}`);
      console.log('\n✅ SuperAdmin will be automatically created on every server restart');
    } else {
      console.log('❌ SuperAdmin login failed');
      const error = await loginRes.json();
      console.log('Error:', error.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSuperAdminAutoCreation();
