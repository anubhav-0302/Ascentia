import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read index.js to extract all routes
const indexContent = fs.readFileSync(path.join(__dirname, 'index.js'), 'utf8');

// Extract routes using regex
const routeMatches = indexContent.match(/app\.(get|post|put|delete)\(['"`]([^'"`]+)['"`]/g);
const routes = routeMatches ? routeMatches.map(match => {
  const parts = match.match(/app\.(get|post|put|delete)\(['"`]([^'"`]+)['"`]/);
  return {
    method: parts[1].toUpperCase(),
    path: parts[2],
    full: match
  };
}) : [];

// Group routes by path
const routeGroups = {};
routes.forEach(route => {
  const basePath = route.path.split('/')[1] || 'root';
  if (!routeGroups[basePath]) {
    routeGroups[basePath] = [];
  }
  routeGroups[basePath].push(route);
});

console.log('🔍 API Endpoint Test Results\n');
console.log('='.repeat(60));

// Test each route group
async function testRouteGroup(groupName, routes) {
  console.log(`\n📁 ${groupName.toUpperCase()} MODULE`);
  console.log('-'.repeat(40));
  
  // Get auth token for protected routes
  const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@ascentia.com',
      password: 'admin123'
    })
  });
  
  let authToken = '';
  if (loginResponse.ok) {
    const loginData = await loginResponse.json();
    authToken = loginData.token;
  }
  
  // Test each route
  for (const route of routes) {
    const url = `http://localhost:5000${route.path}`;
    const options = {
      method: route.method,
      headers: {}
    };
    
    // Add auth header for protected routes (except login/register)
    if (authToken && !route.path.includes('/auth/login') && !route.path.includes('/auth/register')) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    try {
      const response = await fetch(url, options);
      const status = response.ok ? '✅' : '❌';
      const statusText = response.status;
      
      // Special handling for different expected responses
      let note = '';
      if (response.status === 404) {
        note = ' (Not Found)';
      } else if (response.status === 401) {
        note = ' (Unauthorized)';
      } else if (response.status === 403) {
        note = ' (Forbidden)';
      } else if (response.status === 500) {
        note = ' (Server Error)';
      }
      
      console.log(`${status} ${route.method} ${route.path} - ${statusText}${note}`);
      
      // If route failed, try to get error details
      if (!response.ok && response.status >= 500) {
        try {
          const error = await response.text();
          if (error.length < 100) {
            console.log(`    Error: ${error.substring(0, 100)}`);
          }
        } catch (e) {
          // Ignore error parsing errors
        }
      }
    } catch (error) {
      console.log(`❌ ${route.method} ${route.path} - Connection Error`);
      console.log(`    ${error.message}`);
    }
  }
}

// Main test function
async function runTests() {
  console.log('Testing all API endpoints...\n');
  
  // Check if server is running
  try {
    await fetch('http://localhost:5000/api/auth/login');
  } catch (error) {
    console.log('❌ Server is not running on http://localhost:5000');
    console.log('Please start the server with: npm run dev');
    return;
  }
  
  // Test each route group
  for (const [groupName, routes] of Object.entries(routeGroups)) {
    await testRouteGroup(groupName, routes);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 SUMMARY');
  
  // Count total routes
  const totalRoutes = routes.length;
  console.log(`Total routes found: ${totalRoutes}`);
  
  // You can add more sophisticated analysis here
  console.log('\n💡 Recommendations:');
  console.log('1. Check routes marked with ❌ for errors');
  console.log('2. Verify authentication is working correctly');
  console.log('3. Ensure all required middleware is properly configured');
}

// Export routes for reference
console.log('\n📋 ALL ROUTES FOUND:');
routes.forEach((route, index) => {
  console.log(`${index + 1}. ${route.method} ${route.path}`);
});

// Run tests
runTests().catch(console.error);
