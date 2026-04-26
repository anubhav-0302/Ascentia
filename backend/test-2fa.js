import speakeasy from 'speakeasy';
import fetch from 'node-fetch';

async function test2FA() {
  try {
    console.log('🔐 Testing 2FA Implementation...\n');

    // Step 1: Login without 2FA (should work normally)
    console.log('1. Testing normal login (user without 2FA)...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ascentia.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData.success ? '✅ SUCCESS' : '❌ FAILED');
    
    if (loginData.requires2FA) {
      console.log('❌ ERROR: User should not have 2FA enabled yet');
      return;
    }

    const adminToken = loginData.data.token;
    console.log('✅ Normal login works\n');

    // Step 2: Setup 2FA for the user
    console.log('2. Setting up 2FA...');
    const setupResponse = await fetch('http://localhost:5000/api/settings/2fa/setup', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    const setupData = await setupResponse.json();
    console.log('2FA setup:', setupData.success ? '✅ SUCCESS' : '❌ FAILED');
    
    if (!setupData.success) {
      console.log('Setup error:', setupData.message);
      return;
    }

    const secret = setupData.data.secret;
    console.log('Secret generated:', secret.substring(0, 10) + '...\n');

    // Step 3: Generate a valid TOTP code
    const token = speakeasy.totp({
      secret: secret,
      encoding: 'base32'
    });
    console.log(`3. Generated TOTP code: ${token}\n`);

    // Step 4: Enable 2FA
    console.log('4. Enabling 2FA...');
    const enableResponse = await fetch('http://localhost:5000/api/settings/2fa/verify', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });

    const enableData = await enableResponse.json();
    console.log('2FA enable:', enableData.success ? '✅ SUCCESS' : '❌ FAILED');
    console.log('');

    // Step 5: Test login with 2FA enabled
    console.log('5. Testing login with 2FA enabled...');
    const login2FAResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ascentia.com',
        password: 'admin123'
      })
    });

    const login2FAData = await login2FAResponse.json();
    console.log('Login with 2FA:', login2FAData.success ? '✅ SUCCESS' : '❌ FAILED');
    
    if (!login2FAData.requires2FA) {
      console.log('❌ ERROR: Should require 2FA verification');
      return;
    }

    const tempToken = login2FAData.data.tempToken;
    console.log('✅ Correctly requires 2FA verification\n');

    // Step 6: Verify 2FA code
    console.log('6. Verifying 2FA code...');
    const newToken = speakeasy.totp({
      secret: secret,
      encoding: 'base32'
    });

    const verifyResponse = await fetch('http://localhost:5000/api/auth/verify-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tempToken: tempToken,
        code: newToken
      })
    });

    const verifyData = await verifyResponse.json();
    console.log('2FA verification:', verifyData.success ? '✅ SUCCESS' : '❌ FAILED');
    
    if (verifyData.success) {
      console.log('✅ Final token received');
      console.log('✅ 2FA implementation is working correctly!');
    } else {
      console.log('Verification error:', verifyData.message);
    }

    // Step 7: Test invalid 2FA code
    console.log('\n7. Testing invalid 2FA code...');
    const invalidResponse = await fetch('http://localhost:5000/api/auth/verify-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tempToken: tempToken,
        code: '123456'
      })
    });

    const invalidData = await invalidResponse.json();
    console.log('Invalid code test:', !invalidData.success ? '✅ CORRECTLY REJECTED' : '❌ FAILED');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

test2FA();
