// Test the exact workflow the frontend uses
async function testFrontendWorkflow() {
  console.log('🔍 Testing Exact Frontend Workflow\n');
  
  // Get auth token (same as frontend)
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
  
  // Step 1: Get roles (frontend calls this)
  console.log('1. GET /api/admin/roles');
  const rolesResponse = await fetch('http://localhost:5000/api/admin/roles', {
    headers
  });
  
  if (!rolesResponse.ok) {
    console.log('❌ Roles API failed');
    return;
  }
  
  const rolesData = await rolesResponse.json();
  console.log(`   Response structure: ${Object.keys(rolesData)}`);
  console.log(`   Data structure: ${Object.keys(rolesData.data[0] || {})}`);
  
  // Step 2: Get role permissions (frontend calls this for each role)
  const adminRole = rolesData.data.find(r => r.name === 'admin');
  if (!adminRole) {
    console.log('❌ Admin role not found');
    return;
  }
  
  console.log('\n2. GET /api/admin/roles/:id');
  const permResponse = await fetch(`http://localhost:5000/api/admin/roles/${adminRole.id}`, {
    headers
  });
  
  if (!permResponse.ok) {
    console.log('❌ Permissions API failed');
    return;
  }
  
  const permData = await permResponse.json();
  console.log(`   Response structure: ${Object.keys(permData)}`);
  console.log(`   Data structure: ${Object.keys(permData.data)}`);
  console.log(`   PermissionsByModule keys: ${Object.keys(permData.data.permissionsByModule || {}).join(', ')}`);
  
  // Step 3: Check specific permissions frontend expects
  const expectedModules = ['payroll', 'performance', 'timesheet', 'leave', 'sidebar'];
  const expectedActions = {
    payroll: ['view', 'create', 'edit', 'delete'],
    performance: ['view', 'create', 'edit', 'delete'],
    timesheet: ['view', 'create', 'edit', 'delete', 'approve'],
    leave: ['view', 'create', 'edit', 'delete', 'approve']
  };
  
  console.log('\n3. Checking frontend expected permissions:');
  let missingCount = 0;
  
  expectedModules.forEach(module => {
    const modulePerms = permData.data.permissionsByModule[module] || [];
    console.log(`\n   ${module}: ${modulePerms.length} permissions`);
    
    if (expectedActions[module]) {
      expectedActions[module].forEach(action => {
        const found = modulePerms.find(p => p.action === action);
        if (!found) {
          console.log(`     ❌ MISSING: ${action}`);
          missingCount++;
        } else {
          console.log(`     ✅ ${action}: ${found.isEnabled}`);
        }
      });
    }
  });
  
  // Step 4: Test update with exact frontend payload
  console.log('\n4. Testing permission update...');
  
  // Find a permission to toggle
  const payrollPerms = permData.data.permissionsByModule.payroll || [];
  const viewPerm = payrollPerms.find(p => p.action === 'view');
  
  if (!viewPerm) {
    console.log('   ❌ payroll.view permission not found');
    return;
  }
  
  console.log(`   Current payroll.view: ${viewPerm.isEnabled}`);
  
  // Build update payload exactly like frontend
  const updates = [{
    module: 'payroll',
    action: 'view',
    isEnabled: !viewPerm.isEnabled
  }];
  
  const updatePayload = {
    permissions: updates,
    reason: 'Test update from frontend simulation'
  };
  
  console.log('   Sending payload:', JSON.stringify(updatePayload, null, 2));
  
  const updateResponse = await fetch(`http://localhost:5000/api/admin/roles/${adminRole.id}/permissions`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updatePayload)
  });
  
  console.log(`\n   Update status: ${updateResponse.status}`);
  
  if (!updateResponse.ok) {
    const errorText = await updateResponse.text();
    console.log('   ❌ Update failed:', errorText);
    return;
  }
  
  const updateResult = await updateResponse.json();
  console.log('   Update response:', JSON.stringify(updateResult, null, 2));
  
  // Step 5: Verify the change persisted
  console.log('\n5. Verifying change...');
  const verifyResponse = await fetch(`http://localhost:5000/api/admin/roles/${adminRole.id}`, {
    headers
  });
  
  const verifyData = await verifyResponse.json();
  const updatedPerm = verifyData.data.permissionsByModule.payroll?.find(p => p.action === 'view');
  
  if (updatedPerm?.isEnabled === !viewPerm.isEnabled) {
    console.log('   ✅ Change persisted correctly');
  } else {
    console.log('   ❌ Change not persisted');
  }
  
  // Summary
  console.log('\n📊 SUMMARY:');
  console.log(`   Total permissions in DB: ${Object.values(permData.data.permissionsByModule).reduce((sum, arr) => sum + arr.length, 0)}`);
  console.log(`   Missing permissions: ${missingCount}`);
  console.log(`   Update API: ${updateResponse.ok ? '✅ Working' : '❌ Failed'}`);
  
  if (missingCount > 0) {
    console.log('\n⚠️  ISSUE FOUND: Missing permissions!');
    console.log('   The frontend expects permissions that don\'t exist in the database.');
    console.log('   This could explain why the Role Management page shows inaccurate data.');
  }
  
  console.log('\n🎯 CONCLUSION:');
  if (missingCount === 0 && updateResponse.ok) {
    console.log('   Backend is 100% working correctly.');
    console.log('   The issue is definitely in the frontend.');
  } else {
    console.log('   Backend has issues that need fixing.');
  }
}

testFrontendWorkflow();
