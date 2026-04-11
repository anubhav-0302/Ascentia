// Debug login API
import http from 'http';

const loginData = JSON.stringify({
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
    'Content-Length': Buffer.byteLength(loginData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  res.setEncoding('utf8');
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`Response: ${data}`);
    try {
      const parsed = JSON.parse(data);
      console.log(`Success: ${parsed.success}`);
      if (parsed.success) {
        console.log(`Token: ${parsed.token ? 'Present' : 'Missing'}`);
      }
    } catch (e) {
      console.log('Failed to parse JSON response');
    }
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.write(loginData);
req.end();
