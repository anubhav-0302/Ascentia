// Simple API test to debug connection issues
import http from 'http';

function testConnection() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('✅ Server connection successful');
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        resolve(true);
      });
    });

    req.on('error', (e) => {
      console.error('❌ Connection error:', e.message);
      resolve(false);
    });

    req.end();
  });
}

async function testLogin() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'admin@ascentia.com',
      password: 'admin123'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log('✅ Login successful');
          console.log('Status:', res.statusCode);
          console.log('Data:', parsed);
          resolve(parsed.success ? parsed.data.token : null);
        } catch (e) {
          console.log('❌ Failed to parse login response');
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Login error:', e.message);
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing API connectivity...');
  
  const connected = await testConnection();
  if (!connected) {
    console.log('❌ Cannot connect to server');
    return;
  }

  const token = await testLogin();
  if (!token) {
    console.log('❌ Cannot login to server');
    return;
  }

  console.log('✅ API is working correctly');
}

runTests();
