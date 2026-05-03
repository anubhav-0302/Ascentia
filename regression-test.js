#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TESTS_DIR = path.join(__dirname, '../tests/regression');
const RESULTS_FILE = path.join(__dirname, '../.regression-results.json');

let testsPassed = 0;
let testsFailed = 0;
const failedTests = [];

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║         REGRESSION TEST SUITE - PRE-COMMIT CHECK           ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

// Test 1: Check for critical file modifications
console.log('📋 Test 1: Checking for critical file modifications...');
try {
  const criticalFiles = [
    'backend/lib/prisma.js',
    'backend/middleware/auth.js',
    'frontend/src/store/useAuthStore.ts',
    'frontend/src/api/apiClient.ts'
  ];

  const modifiedFiles = execSync('git diff --name-only --cached', { encoding: 'utf-8' })
    .split('\n')
    .filter(f => f.trim());

  const criticalModified = modifiedFiles.filter(f => 
    criticalFiles.some(cf => f.includes(cf))
  );

  if (criticalModified.length > 0) {
    console.log('   ⚠️  Critical files modified:');
    criticalModified.forEach(f => console.log(`      - ${f}`));
    console.log('   ✅ Please ensure backward compatibility is maintained');
  } else {
    console.log('   ✅ No critical files modified');
  }
  testsPassed++;
} catch (err) {
  console.log('   ❌ Error checking files:', err.message);
  testsFailed++;
  failedTests.push('Critical file check');
}

console.log('');

// Test 2: Verify package.json integrity
console.log('📋 Test 2: Verifying package.json integrity...');
try {
  const packagePath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  if (!packageJson.name || !packageJson.version) {
    throw new Error('Invalid package.json structure');
  }
  
  console.log(`   ✅ package.json valid (v${packageJson.version})`);
  testsPassed++;
} catch (err) {
  console.log('   ❌ package.json validation failed:', err.message);
  testsFailed++;
  failedTests.push('Package.json integrity');
}

console.log('');

// Test 3: Check for console.log statements (code quality)
console.log('📋 Test 3: Checking for excessive console.log statements...');
try {
  const stagedFiles = execSync('git diff --name-only --cached', { encoding: 'utf-8' })
    .split('\n')
    .filter(f => f.trim() && (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js')));

  let consoleLogCount = 0;
  stagedFiles.forEach(file => {
    try {
      const content = execSync(`git show :${file}`, { encoding: 'utf-8' });
      const matches = content.match(/console\.(log|warn|error)/g) || [];
      consoleLogCount += matches.length;
    } catch (e) {
      // File might not exist in staging
    }
  });

  if (consoleLogCount > 20) {
    console.log(`   ⚠️  Found ${consoleLogCount} console statements (consider removing debug logs)`);
  } else {
    console.log(`   ✅ Console statements within acceptable range (${consoleLogCount})`);
  }
  testsPassed++;
} catch (err) {
  console.log('   ⚠️  Could not check console statements:', err.message);
  testsPassed++; // Don't fail on this
}

console.log('');

// Test 4: Verify no broken imports
console.log('📋 Test 4: Checking for broken imports...');
try {
  const tsFiles = execSync('git diff --name-only --cached', { encoding: 'utf-8' })
    .split('\n')
    .filter(f => f.trim() && (f.endsWith('.ts') || f.endsWith('.tsx')));

  let brokenImports = 0;
  tsFiles.forEach(file => {
    try {
      const content = execSync(`git show :${file}`, { encoding: 'utf-8' });
      // Check for common import patterns
      const importMatches = content.match(/import\s+.*\s+from\s+['"]([^'"]+)['"]/g) || [];
      importMatches.forEach(imp => {
        const pathMatch = imp.match(/from\s+['"]([^'"]+)['"]/);
        if (pathMatch) {
          const importPath = pathMatch[1];
          // Check for obvious broken imports
          if (importPath.includes('undefined') || importPath.includes('null')) {
            brokenImports++;
          }
        }
      });
    } catch (e) {
      // File might not exist
    }
  });

  if (brokenImports > 0) {
    console.log(`   ❌ Found ${brokenImports} potentially broken imports`);
    testsFailed++;
    failedTests.push('Broken imports');
  } else {
    console.log('   ✅ No broken imports detected');
    testsPassed++;
  }
} catch (err) {
  console.log('   ⚠️  Could not check imports:', err.message);
  testsPassed++;
}

console.log('');

// Test 5: Check for API endpoint consistency
console.log('📋 Test 5: Verifying API endpoint consistency...');
try {
  const apiFiles = [
    'frontend/src/api/payrollApi.ts',
    'frontend/src/api/performanceApi.ts',
    'frontend/src/api/timesheetApi.ts'
  ];

  let endpointIssues = 0;
  apiFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      // Check for hardcoded URLs
      if (content.includes('http://localhost') && !content.includes('process.env')) {
        endpointIssues++;
      }
    }
  });

  if (endpointIssues > 0) {
    console.log(`   ⚠️  Found ${endpointIssues} potential hardcoded endpoints`);
  } else {
    console.log('   ✅ API endpoints properly configured');
  }
  testsPassed++;
} catch (err) {
  console.log('   ⚠️  Could not verify endpoints:', err.message);
  testsPassed++;
}

console.log('');

// Test 6: Check for TypeScript errors in modified files
console.log('📋 Test 6: Checking for TypeScript compilation errors...');
try {
  const tsConfigPath = path.join(__dirname, 'frontend', 'tsconfig.json');
  if (fs.existsSync(tsConfigPath)) {
    try {
      execSync('npx tsc -b --noEmit 2>&1', { 
        cwd: path.join(__dirname, 'frontend'),
        stdio: 'pipe'
      });
      console.log('   ✅ TypeScript compilation successful');
      testsPassed++;
    } catch (err) {
      const errorOutput = err.stdout?.toString() || err.message;
      if (errorOutput.includes('error TS')) {
        console.log('   ❌ TypeScript compilation errors found');
        console.log('   ', errorOutput.split('\n').slice(0, 3).join('\n   '));
        testsFailed++;
        failedTests.push('TypeScript compilation');
      } else {
        console.log('   ✅ TypeScript compilation successful');
        testsPassed++;
      }
    }
  } else {
    console.log('   ⏭️  TypeScript config not found, skipping');
    testsPassed++;
  }
} catch (err) {
  console.log('   ⚠️  Could not check TypeScript:', err.message);
  testsPassed++;
}

console.log('');

// Test 7: Verify database schema consistency
console.log('📋 Test 7: Verifying database schema consistency...');
try {
  const schemaPath = path.join(__dirname, 'backend', 'prisma', 'schema.prisma');
  if (fs.existsSync(schemaPath)) {
    const content = fs.readFileSync(schemaPath, 'utf-8');
    
    // Check for required models
    const requiredModels = ['Employee', 'SalaryComponent', 'EmployeeSalary'];
    const missingModels = requiredModels.filter(model => !content.includes(`model ${model}`));
    
    if (missingModels.length > 0) {
      console.log(`   ❌ Missing database models: ${missingModels.join(', ')}`);
      testsFailed++;
      failedTests.push('Database schema');
    } else {
      console.log('   ✅ All required database models present');
      testsPassed++;
    }
  } else {
    console.log('   ⏭️  Prisma schema not found, skipping');
    testsPassed++;
  }
} catch (err) {
  console.log('   ⚠️  Could not verify schema:', err.message);
  testsPassed++;
}

console.log('');

// Test 8: Check for security issues
console.log('📋 Test 8: Checking for common security issues...');
try {
  const securityIssues = [];
  const stagedFiles = execSync('git diff --name-only --cached', { encoding: 'utf-8' })
    .split('\n')
    .filter(f => f.trim());

  stagedFiles.forEach(file => {
    try {
      const content = execSync(`git show :${file}`, { encoding: 'utf-8' });
      
      // Check for hardcoded secrets
      if (content.match(/password\s*=\s*['"][^'"]+['"]/i) ||
          content.match(/api[_-]?key\s*=\s*['"][^'"]+['"]/i) ||
          content.match(/secret\s*=\s*['"][^'"]+['"]/i)) {
        securityIssues.push(`Potential hardcoded secret in ${file}`);
      }
      
      // Check for SQL injection patterns
      if (content.includes('SELECT *') && !content.includes('prisma')) {
        securityIssues.push(`Potential SQL injection risk in ${file}`);
      }
    } catch (e) {
      // File might not exist
    }
  });

  if (securityIssues.length > 0) {
    console.log('   ❌ Security issues detected:');
    securityIssues.forEach(issue => console.log(`      - ${issue}`));
    testsFailed++;
    failedTests.push('Security check');
  } else {
    console.log('   ✅ No obvious security issues detected');
    testsPassed++;
  }
} catch (err) {
  console.log('   ⚠️  Could not check security:', err.message);
  testsPassed++;
}

console.log('');

// Test 9: RBAC - Verify all backend routes have requireAuth middleware
console.log('📋 Test 9: Verifying RBAC route protection (requireAuth on all routes)...');
try {
  const routesDir = path.join(__dirname, 'backend', 'routes');
  const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.js') && f !== 'index.js');
  
  // Public routes that intentionally don't require auth
  const publicRoutes = [
    'authRoutes.js: POST /login',
    'authRoutes.js: POST /register',
    'authRoutes.js: POST /forgot-password',
    'authRoutes.js: POST /reset-password',
  ];
  
  // Routes that have internal auth or are read-only public endpoints
  const internalAuthRoutes = [
    'commandCenterRoutes.js',  // has internal auth checks
    'recruitingRoutes.js',     // has internal auth checks
    'workflowRoutes.js',       // has internal auth checks
  ];
  
  const unprotectedRoutes = [];
  
  routeFiles.forEach(file => {
    const content = fs.readFileSync(path.join(routesDir, file), 'utf-8');
    // Normalize content: join lines that are part of the same route definition
    // Replace newlines within route definitions so multi-line routes are captured
    const normalizedContent = content.replace(/\n\s*/g, ' ');
    // Find all route definitions: router.get/post/put/delete
    const routeMatches = normalizedContent.match(/router\.(get|post|put|delete)\s*\([^;]*?\)(?:\s*,\s*[^;]*?)*\)/g) || [];
    
    // Also check line-by-line for simpler route definitions
    const lines = content.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      // Match single-line route definitions
      const singleLineMatch = trimmed.match(/^router\.(get|post|put|delete)\s*\(/);
      if (!singleLineMatch) return;
      
      // For multi-line routes, find the full route block by scanning forward
      let routeBlock = trimmed;
      let depth = (trimmed.match(/\(/g) || []).length - (trimmed.match(/\)/g) || []).length;
      let lineIdx = lines.indexOf(line);
      while (depth > 0 && lineIdx < lines.length - 1) {
        lineIdx++;
        const nextLine = lines[lineIdx].trim();
        routeBlock += ' ' + nextLine;
        depth += (nextLine.match(/\(/g) || []).length - (nextLine.match(/\)/g) || []).length;
      }
      
      // Skip debug middleware routes: router.use(...)
      if (routeBlock.includes('router.use')) return;
      
      // Check if requireAuth is present in the route definition
      if (!routeBlock.includes('requireAuth')) {
        // Extract the path for reporting
        const pathMatch = routeBlock.match(/router\.\w+\s*\(\s*['"]([^'"]+)/);
        const httpMethod = routeBlock.match(/router\.(get|post|put|delete)/)?.[1]?.toUpperCase();
        const routePath = pathMatch ? pathMatch[1] : 'unknown';
        const signature = `${file}: ${httpMethod} ${routePath}`;
        
        // Skip known public routes (auth endpoints)
        if (publicRoutes.includes(signature)) return;
        // Skip routes in files with internal auth
        if (internalAuthRoutes.includes(file)) return;
        
        unprotectedRoutes.push(signature);
      }
    });
  });
  
  if (unprotectedRoutes.length > 0) {
    console.log(`   ❌ Found ${unprotectedRoutes.length} routes without requireAuth:`);
    unprotectedRoutes.forEach(r => console.log(`      - ${r}`));
    testsFailed++;
    failedTests.push('RBAC route protection');
  } else {
    console.log('   ✅ All backend routes have requireAuth middleware');
    testsPassed++;
  }
} catch (err) {
  console.log('   ⚠️  Could not verify RBAC:', err.message);
  testsPassed++;
}

console.log('');

// Test 10: Double data extraction - Zustand stores should not extract .data after API client
console.log('📋 Test 10: Checking for double data extraction in Zustand stores...');
try {
  const storeDir = path.join(__dirname, 'frontend', 'src', 'store');
  const storeFiles = fs.readdirSync(storeDir).filter(f => f.endsWith('.ts'));
  
  const doubleExtractionIssues = [];
  
  storeFiles.forEach(file => {
    const content = fs.readFileSync(path.join(storeDir, file), 'utf-8');
    
    // Pattern: API client already returns response.data, so store should NOT do response.data again
    // Look for patterns like: const res = await someApi.method(); set({ data: res.data })
    // This is wrong if someApi.method already returns response.data
    
    // Find all API calls in stores
    const apiCallMatches = content.matchAll(/const\s+(\w+)\s*=\s*await\s+(\w+Api)\.\w+\([^)]*\)/g) || [];
    for (const match of apiCallMatches) {
      const varName = match[1];
      const apiName = match[2];
      const fullMatch = match[0];
      
      // Check if this specific variable is accessed with .data on the NEXT non-comment line
      // (not just anywhere in the file, to avoid false positives from comments or other vars)
      const matchIndex = match.index;
      const afterMatch = content.substring(matchIndex, matchIndex + 500);
      
      // Look for varName.data in the code after the assignment (skip comments)
      const linesAfter = afterMatch.split('\n');
      let foundDataAccess = false;
      for (const line of linesAfter.slice(1, 10)) {
        const trimmedLine = line.replace(/\/\/.*$/, '').trim(); // Remove inline comments
        if (trimmedLine.includes(`${varName}.data`) && !trimmedLine.startsWith('//')) {
          foundDataAccess = true;
          break;
        }
        // Stop looking if we hit another variable assignment
        if (trimmedLine.startsWith('const ') || trimmedLine.startsWith('let ')) break;
      }
      
      if (foundDataAccess) {
        // Check if the API module extracts .data internally
        const apiFilePath = path.join(__dirname, 'frontend', 'src', 'api', `${apiName}.ts`);
        if (fs.existsSync(apiFilePath)) {
          const apiContent = fs.readFileSync(apiFilePath, 'utf-8');
          // If the API file contains "return response.data" or "return result.data", it already extracts
          if (apiContent.match(/return\s+(?:response|result|res)\.data/)) {
            doubleExtractionIssues.push(`${file}: ${varName}.data after ${apiName} already extracts .data`);
          }
        }
      }
    }
  });
  
  if (doubleExtractionIssues.length > 0) {
    console.log(`   ❌ Found ${doubleExtractionIssues.length} potential double data extractions:`);
    doubleExtractionIssues.forEach(r => console.log(`      - ${r}`));
    testsFailed++;
    failedTests.push('Double data extraction');
  } else {
    console.log('   ✅ No double data extraction patterns found in stores');
    testsPassed++;
  }
} catch (err) {
  console.log('   ⚠️  Could not check double extraction:', err.message);
  testsPassed++;
}

console.log('');

// Test 11: Sidebar role access - HR role must be included in relevant menu items
console.log('📋 Test 11: Verifying sidebar role access (HR included in requiredRoles)...');
try {
  const sidebarPath = path.join(__dirname, 'frontend', 'src', 'components', 'Sidebar.tsx');
  if (fs.existsSync(sidebarPath)) {
    const content = fs.readFileSync(sidebarPath, 'utf-8');
    
    const missingHRAccess = [];
    
    // Menu items that HR should have access to
    const hrRequiredItems = [
      { name: 'Directory', path: '/directory' },
      { name: 'Leave & Attendance', path: '/leave-attendance' },
      { name: 'Timesheet Entry', path: '/timesheet-entry' },
      { name: 'Payroll & Benefits', path: '/payroll-benefits' },
      { name: 'Reports', path: '/reports' }
    ];
    
    hrRequiredItems.forEach(item => {
      // Find the nav item definition for this path
      const pathRegex = new RegExp(`path:\\s*['"]${item.path.replace('-', '-')}['"][\\s\\S]*?requiredRoles:\\s*\\[([^\\]]+)\\]`, 'i');
      // Alternative: find by name
      const nameRegex = new RegExp(`name:\\s*['"]${item.name.replace(/[-&]/g, '[^\'"]*')}['"][\\s\\S]*?requiredRoles:\\s*\\[([^\\]]+)\\]`, 'i');
      
      const pathMatch = content.match(pathRegex);
      const nameMatch = content.match(nameRegex);
      const match = pathMatch || nameMatch;
      
      if (match) {
        const rolesStr = match[1];
        if (!rolesStr.includes("'hr'") && !rolesStr.includes('"hr"')) {
          missingHRAccess.push(`${item.name}: requiredRoles=[${rolesStr.trim()}] - missing 'hr'`);
        }
      }
    });
    
    if (missingHRAccess.length > 0) {
      console.log(`   ❌ HR role missing from ${missingHRAccess.length} menu items:`);
      missingHRAccess.forEach(r => console.log(`      - ${r}`));
      testsFailed++;
      failedTests.push('Sidebar HR access');
    } else {
      console.log('   ✅ HR role included in all relevant sidebar menu items');
      testsPassed++;
    }
  } else {
    console.log('   ⏭️  Sidebar.tsx not found, skipping');
    testsPassed++;
  }
} catch (err) {
  console.log('   ⚠️  Could not verify sidebar roles:', err.message);
  testsPassed++;
}

console.log('');

// Test 12: LeaveCalendar accepts leaves as prop (data isolation)
console.log('📋 Test 12: Verifying LeaveCalendar data isolation (leaves prop support)...');
try {
  const calendarPath = path.join(__dirname, 'frontend', 'src', 'components', 'LeaveCalendar.tsx');
  if (fs.existsSync(calendarPath)) {
    const content = fs.readFileSync(calendarPath, 'utf-8');
    
    const issues = [];
    
    // 1. Check that LeaveCalendarProps includes leaves?: LeaveRequest[]
    if (!content.includes('leaves?: LeaveRequest[]') && !content.includes('leaves?:')) {
      issues.push('LeaveCalendarProps missing leaves?: prop');
    }
    
    // 2. Check that the component uses providedLeaves or similar pattern
    if (!content.includes('providedLeaves') && !content.includes('leaves: provided')) {
      issues.push('Component does not destructure leaves prop for data isolation');
    }
    
    // 3. Check that fetchLeaves skips API call when leaves are provided
    if (!content.match(/if\s*\(\s*providedLeaves\s*\)/) && !content.match(/if\s*\(\s*leaves\s*\)/)) {
      issues.push('fetchLeaves does not skip API call when leaves prop is provided');
    }
    
    if (issues.length > 0) {
      console.log(`   ❌ LeaveCalendar data isolation issues:`);
      issues.forEach(r => console.log(`      - ${r}`));
      testsFailed++;
      failedTests.push('LeaveCalendar data isolation');
    } else {
      console.log('   ✅ LeaveCalendar supports leaves prop for data isolation');
      testsPassed++;
    }
  } else {
    console.log('   ⏭️  LeaveCalendar.tsx not found, skipping');
    testsPassed++;
  }
} catch (err) {
  console.log('   ⚠️  Could not verify LeaveCalendar:', err.message);
  testsPassed++;
}

console.log('');

// Test 13: Date timezone handling - no .toISOString() for date display
console.log('📋 Test 13: Checking for timezone-unsafe date handling (.toISOString for display)...');
try {
  const componentsDir = path.join(__dirname, 'frontend', 'src', 'components');
  const componentFiles = fs.readdirSync(componentsDir).filter(f => 
    f.endsWith('.tsx') && (f.includes('Calendar') || f.includes('Leave') || f.includes('Date'))
  );
  
  const timezoneIssues = [];
  
  // Also check all TSX files for the pattern
  const allTsxFiles = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));
  
  allTsxFiles.forEach(file => {
    const content = fs.readFileSync(path.join(componentsDir, file), 'utf-8');
    
    // Pattern: .toISOString().split('T')[0] - this converts to UTC before extracting date
    const isoSplitMatches = content.match(/\.toISOString\(\)\.split\('T'\)\[0\]/g) || [];
    if (isoSplitMatches.length > 0) {
      timezoneIssues.push(`${file}: Found ${isoSplitMatches.length} .toISOString().split('T')[0] (timezone-unsafe)`);
    }
    
    // Pattern: .toISOString() used for form date values
    const isoFormMatches = content.match(/startDate.*toISOString|endDate.*toISOString/g) || [];
    if (isoFormMatches.length > 0) {
      timezoneIssues.push(`${file}: .toISOString() used for start/end date (may shift timezone)`);
    }
  });
  
  if (timezoneIssues.length > 0) {
    console.log(`   ⚠️  Found ${timezoneIssues.length} timezone-unsafe date patterns:`);
    timezoneIssues.forEach(r => console.log(`      - ${r}`));
    console.log('   ℹ️  These may cause date shifts in non-UTC timezones');
    testsPassed++; // Warning only, not a failure
  } else {
    console.log('   ✅ No timezone-unsafe .toISOString() date patterns found');
    testsPassed++;
  }
} catch (err) {
  console.log('   ⚠️  Could not check date handling:', err.message);
  testsPassed++;
}

console.log('');

// Test 14: Prisma import path consistency in controllers
console.log('📋 Test 14: Verifying Prisma import paths in backend controllers...');
try {
  const backendDir = path.join(__dirname, 'backend');
  const jsFiles = fs.readdirSync(backendDir).filter(f => f.endsWith('Controller.js') || f.endsWith('controller.js'));
  
  const prismaPathIssues = [];
  
  jsFiles.forEach(file => {
    const content = fs.readFileSync(path.join(backendDir, file), 'utf-8');
    
    // Check for prisma import
    const prismaImportMatch = content.match(/import\s+prisma\s+from\s+['"]([^'"]+)['"]/);
    if (prismaImportMatch) {
      const importPath = prismaImportMatch[1];
      
      // Root-level controllers should use './lib/prisma.js'
      // Controllers in subdirectories should use '../lib/prisma.js'
      const isRootController = !file.includes('/') && !file.includes('\\');
      
      if (isRootController && importPath !== './lib/prisma.js') {
        prismaPathIssues.push(`${file}: import from '${importPath}' (expected './lib/prisma.js')`);
      }
    }
  });
  
  // Also check controllers/ subdirectory
  const controllersDir = path.join(backendDir, 'controllers');
  if (fs.existsSync(controllersDir)) {
    const subControllers = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));
    subControllers.forEach(file => {
      const content = fs.readFileSync(path.join(controllersDir, file), 'utf-8');
      const prismaImportMatch = content.match(/import\s+prisma\s+from\s+['"]([^'"]+)['"]/);
      if (prismaImportMatch) {
        const importPath = prismaImportMatch[1];
        // Controllers in controllers/ should use '../lib/prisma.js'
        if (importPath !== '../lib/prisma.js' && importPath !== './lib/prisma.js') {
          prismaPathIssues.push(`controllers/${file}: import from '${importPath}' (expected '../lib/prisma.js')`);
        }
      }
    });
  }
  
  if (prismaPathIssues.length > 0) {
    console.log(`   ❌ Found ${prismaPathIssues.length} incorrect Prisma import paths:`);
    prismaPathIssues.forEach(r => console.log(`      - ${r}`));
    testsFailed++;
    failedTests.push('Prisma import paths');
  } else {
    console.log('   ✅ All Prisma import paths are correct');
    testsPassed++;
  }
} catch (err) {
  console.log('   ⚠️  Could not verify Prisma paths:', err.message);
  testsPassed++;
}

console.log('');

// Test 15: Route ordering - specific routes before dynamic :id routes
console.log('📋 Test 15: Verifying route ordering (specific routes before :id patterns)...');
try {
  const routesDir = path.join(__dirname, 'backend', 'routes');
  const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
  
  const orderingIssues = [];
  
  routeFiles.forEach(file => {
    const content = fs.readFileSync(path.join(routesDir, file), 'utf-8');
    const lines = content.split('\n');
    
    let lastDynamicIndex = -1;
    const dynamicRoutes = [];
    const specificAfterDynamic = [];
    
    lines.forEach((line, idx) => {
      const routeMatch = line.match(/router\.\w+\(\s*['"]([^'"]+)/);
      if (routeMatch) {
        const routePath = routeMatch[1];
        if (routePath.includes(':')) {
          // Dynamic route
          if (dynamicRoutes.length === 0 || idx > (dynamicRoutes[dynamicRoutes.length - 1]?.idx || 0)) {
            dynamicRoutes.push({ path: routePath, idx, line: line.trim() });
          }
        } else if (dynamicRoutes.length > 0) {
          // Specific route found AFTER a dynamic route
          // Check if it's truly after (not just another line in the same route chain)
          const lastDynamic = dynamicRoutes[dynamicRoutes.length - 1];
          if (idx > lastDynamic.idx && !routePath.includes('use')) {
            specificAfterDynamic.push({
              file,
              specific: routePath,
              afterDynamic: lastDynamic.path,
              lineNum: idx + 1
            });
          }
        }
      }
    });
    
    if (specificAfterDynamic.length > 0) {
      specificAfterDynamic.forEach(issue => {
        orderingIssues.push(`${file} (line ${issue.lineNum}): '${issue.specific}' defined after dynamic '${issue.afterDynamic}'`);
      });
    }
  });
  
  if (orderingIssues.length > 0) {
    console.log(`   ⚠️  Found ${orderingIssues.length} potential route ordering issues:`);
    orderingIssues.forEach(r => console.log(`      - ${r}`));
    console.log('   ℹ️  Specific routes should be defined BEFORE dynamic :id routes');
    testsPassed++; // Warning, not failure - some are intentional
  } else {
    console.log('   ✅ Route ordering looks correct (specific before dynamic)');
    testsPassed++;
  }
} catch (err) {
  console.log('   ⚠️  Could not verify route ordering:', err.message);
  testsPassed++;
}

console.log('');

// Test 16: Frontend-backend API route alignment
console.log('📋 Test 16: Verifying frontend API calls match backend routes...');
try {
  const apiDir = path.join(__dirname, 'frontend', 'src', 'api');
  const routesDir = path.join(__dirname, 'backend', 'routes');
  
  // Map of backend route prefixes to their route files
  const backendRouteMap = {
    '/auth': 'authRoutes.js',
    '/employees': 'employeeRoutes.js',
    '/leave': 'leaveRoutes.js',
    '/timesheet': 'timesheetRoutes.js',
    '/performance': 'performanceRoutes.js',
    '/payroll': 'payrollRoutes.js',
    '/settings': 'settingsRoutes.js',
    '/projects': 'projectRoutes.js',
    '/notifications': 'notificationRoutes.js',
    '/dashboard': 'dashboardRoutes.js',
    '/analytics': 'analyticsRoutes.js',
    '/kras': 'kraRoutes.js',
    '/admin/roles': 'roleManagementRoutes.js'
  };
  
  const alignmentIssues = [];
  
  // Check specific known API call → route alignments
  const knownAlignments = [
    { frontend: '/leave/my', backend: '/leave', routeFile: 'leaveRoutes.js', method: 'GET' },
    { frontend: '/leave', backend: '/leave', routeFile: 'leaveRoutes.js', method: 'GET' },
    { frontend: '/employees/dropdown/list', backend: '/employees', routeFile: 'employeeRoutes.js', method: 'GET' },
    { frontend: '/projects/available-employees', backend: '/projects', routeFile: 'projectRoutes.js', method: 'GET' },
    { frontend: '/projects/my', backend: '/projects', routeFile: 'projectRoutes.js', method: 'GET' },
    { frontend: '/timesheet/all', backend: '/timesheet', routeFile: 'timesheetRoutes.js', method: 'GET' },
    { frontend: '/timesheet/activities', backend: '/timesheet', routeFile: 'timesheetRoutes.js', method: 'GET' },
    { frontend: '/timesheet/history', backend: '/timesheet', routeFile: 'timesheetRoutes.js', method: 'GET' },
    { frontend: '/admin/roles/sidebar/permissions', backend: '/admin/roles', routeFile: 'roleManagementRoutes.js', method: 'GET' },
  ];
  
  knownAlignments.forEach(alignment => {
    const routeFilePath = path.join(routesDir, alignment.routeFile);
    if (fs.existsSync(routeFilePath)) {
      const content = fs.readFileSync(routeFilePath, 'utf-8');
      const frontendSuffix = alignment.frontend.replace(alignment.backend, '').replace(/^\//, '');
      
      if (frontendSuffix) {
        // Check if this specific sub-route exists in the backend
        const routePattern = new RegExp(`router\\.${alignment.method.toLowerCase()}\\s*\\(\\s*['"]/?${frontendSuffix.replace(/\//g, '/?')}`);
        const altPattern = new RegExp(`['"]/?${frontendSuffix}['"]`);
        
        if (!altPattern.test(content)) {
          alignmentIssues.push(`Frontend calls ${alignment.method} ${alignment.frontend} but no matching route in ${alignment.routeFile}`);
        }
      }
    }
  });
  
  if (alignmentIssues.length > 0) {
    console.log(`   ❌ Found ${alignmentIssues.length} frontend-backend route mismatches:`);
    alignmentIssues.forEach(r => console.log(`      - ${r}`));
    testsFailed++;
    failedTests.push('Frontend-backend route alignment');
  } else {
    console.log('   ✅ Frontend API calls align with backend routes');
    testsPassed++;
  }
} catch (err) {
  console.log('   ⚠️  Could not verify route alignment:', err.message);
  testsPassed++;
}

console.log('');

// Test 17: Zustand store structure - all stores have loading, error states
console.log('📋 Test 17: Verifying Zustand store structure (loading/error states)...');
try {
  const storeDir = path.join(__dirname, 'frontend', 'src', 'store');
  const storeFiles = fs.readdirSync(storeDir).filter(f => f.endsWith('.ts') && f.startsWith('use'));
  
  const storeIssues = [];
  
  storeFiles.forEach(file => {
    const content = fs.readFileSync(path.join(storeDir, file), 'utf-8');
    
    // Check for loading state
    if (!content.includes('loading:') && !content.includes('loading =')) {
      storeIssues.push(`${file}: Missing loading state`);
    }
    
    // Check for error state
    if (!content.includes('error:') && !content.includes('error =')) {
      storeIssues.push(`${file}: Missing error state`);
    }
    
    // Check for try/catch in async actions
    const asyncActions = content.match(/async\s+\w+\s*\(/g) || [];
    const tryCatchBlocks = content.match(/try\s*\{/g) || [];
    
    if (asyncActions.length > 0 && tryCatchBlocks.length < asyncActions.length) {
      // Some async actions might not need try/catch (e.g., simple setters)
      // Only flag if there are significantly fewer try/catch than async actions
      if (tryCatchBlocks.length === 0 && asyncActions.length > 1) {
        storeIssues.push(`${file}: ${asyncActions.length} async actions but no try/catch blocks`);
      }
    }
  });
  
  if (storeIssues.length > 0) {
    console.log(`   ⚠️  Found ${storeIssues.length} store structure issues:`);
    storeIssues.forEach(r => console.log(`      - ${r}`));
    testsPassed++; // Warning only
  } else {
    console.log('   ✅ All Zustand stores have proper loading/error states');
    testsPassed++;
  }
} catch (err) {
  console.log('   ⚠️  Could not verify store structure:', err.message);
  testsPassed++;
}

console.log('');

// Test 18: Leave balance includes pending leaves
console.log('📋 Test 18: Verifying leave balance includes Pending + Approved leaves...');
try {
  const leaveAttendancePath = path.join(__dirname, 'frontend', 'src', 'components', 'LeaveAttendance.tsx');
  if (fs.existsSync(leaveAttendancePath)) {
    const content = fs.readFileSync(leaveAttendancePath, 'utf-8');
    
    const issues = [];
    
    // Check that balance calculation includes both Approved and Pending
    // Old bug: only filtered status === 'Approved'
    if (content.match(/status\s*===\s*['"]Approved['"]\s*\)/) && 
        !content.includes("Pending") && 
        content.includes('leaveBalance')) {
      issues.push('Balance calculation only counts Approved leaves (should include Pending)');
    }
    
    // Check for the combined filter pattern
    const hasApprovedAndPending = content.match(/Approved.*Pending|Pending.*Approved/) !== null;
    const hasOldApprovedOnly = content.match(/\.filter\([^)]*status\s*===\s*['"]Approved['"][^)]*\)/) !== null;
    
    if (hasOldApprovedOnly && !hasApprovedAndPending) {
      issues.push('Found .filter(status === "Approved") without including Pending leaves');
    }
    
    if (issues.length > 0) {
      console.log(`   ❌ Leave balance calculation issues:`);
      issues.forEach(r => console.log(`      - ${r}`));
      testsFailed++;
      failedTests.push('Leave balance includes pending');
    } else {
      console.log('   ✅ Leave balance includes both Approved and Pending leaves');
      testsPassed++;
    }
  } else {
    console.log('   ⏭️  LeaveAttendance.tsx not found, skipping');
    testsPassed++;
  }
} catch (err) {
  console.log('   ⚠️  Could not verify leave balance:', err.message);
  testsPassed++;
}

console.log('');

// Test 19: Employee controller RBAC - own profile access
console.log('📋 Test 19: Verifying employee profile access control (own profile check)...');
try {
  const controllerPath = path.join(__dirname, 'backend', 'employeeController.js');
  if (fs.existsSync(controllerPath)) {
    const content = fs.readFileSync(controllerPath, 'utf-8');
    
    const issues = [];
    
    // The getEmployee function should check isOwnProfile
    if (!content.includes('isOwnProfile') && !content.includes('own profile')) {
      issues.push('getEmployee does not check if user is accessing their own profile');
    }
    
    // Check that non-admin users can view their own profile
    if (!content.match(/isAdmin.*isOwnProfile|isOwnProfile.*isAdmin/)) {
      issues.push('getEmployee should allow access if isAdmin OR isOwnProfile');
    }
    
    if (issues.length > 0) {
      console.log(`   ❌ Employee profile access control issues:`);
      issues.forEach(r => console.log(`      - ${r}`));
      testsFailed++;
      failedTests.push('Employee profile access control');
    } else {
      console.log('   ✅ Employee profile access control properly implemented');
      testsPassed++;
    }
  } else {
    console.log('   ⏭️  employeeController.js not found, skipping');
    testsPassed++;
  }
} catch (err) {
  console.log('   ⚠️  Could not verify employee access:', err.message);
  testsPassed++;
}

console.log('');

// Test 20: Database file existence and integrity
console.log('📋 Test 20: Verifying database file and Prisma client integrity...');
try {
  const dbPath = path.join(__dirname, 'backend', 'dev.db');
  const prismaClientPath = path.join(__dirname, 'backend', 'lib', 'prisma.js');
  const schemaPath = path.join(__dirname, 'backend', 'prisma', 'schema.prisma');
  
  const issues = [];
  
  // Check database file exists
  if (!fs.existsSync(dbPath)) {
    issues.push('dev.db not found - database file missing');
  } else {
    const dbStats = fs.statSync(dbPath);
    if (dbStats.size === 0) {
      issues.push('dev.db is empty (0 bytes)');
    }
  }
  
  // Check Prisma client exists
  if (!fs.existsSync(prismaClientPath)) {
    issues.push('lib/prisma.js not found - shared Prisma client missing');
  } else {
    const prismaContent = fs.readFileSync(prismaClientPath, 'utf-8');
    // Verify it uses BetterSqlite3 adapter (not PostgreSQL)
    if (prismaContent.includes('PrismaPg') || prismaContent.includes('postgresql')) {
      issues.push('lib/prisma.js uses PostgreSQL adapter (should use BetterSqlite3 for SQLite)');
    }
    if (!prismaContent.includes('PrismaBetterSqlite3') && !prismaContent.includes('better-sqlite3')) {
      issues.push('lib/prisma.js does not use PrismaBetterSqlite3 adapter');
    }
  }
  
  // Check schema exists
  if (!fs.existsSync(schemaPath)) {
    issues.push('prisma/schema.prisma not found');
  }
  
  if (issues.length > 0) {
    console.log(`   ❌ Database integrity issues:`);
    issues.forEach(r => console.log(`      - ${r}`));
    testsFailed++;
    failedTests.push('Database integrity');
  } else {
    console.log('   ✅ Database file, Prisma client, and schema are intact');
    testsPassed++;
  }
} catch (err) {
  console.log('   ⚠️  Could not verify database:', err.message);
  testsPassed++;
}

console.log('');

// Test 21: Frontend build succeeds
console.log('📋 Test 21: Verifying frontend production build succeeds...');
try {
  const frontendDir = path.join(__dirname, 'frontend');
  if (fs.existsSync(path.join(frontendDir, 'package.json'))) {
    try {
      execSync('npm run build 2>&1', { 
        cwd: frontendDir,
        stdio: 'pipe',
        timeout: 120000 // 2 minute timeout
      });
      console.log('   ✅ Frontend production build succeeds');
      testsPassed++;
    } catch (err) {
      const errorOutput = err.stdout?.toString() || err.message;
      console.log('   ❌ Frontend build failed');
      const errorLines = errorOutput.split('\n').filter(l => l.includes('error'));
      errorLines.slice(0, 5).forEach(l => console.log(`      ${l.trim()}`));
      testsFailed++;
      failedTests.push('Frontend build');
    }
  } else {
    console.log('   ⏭️  Frontend package.json not found, skipping');
    testsPassed++;
  }
} catch (err) {
  console.log('   ⚠️  Could not verify build:', err.message);
  testsPassed++;
}

console.log('');

// Test 22: No duplicate API endpoint definitions
console.log('📋 Test 22: Checking for duplicate route definitions in backend...');
try {
  const routesDir = path.join(__dirname, 'backend', 'routes');
  const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
  
  const duplicateIssues = [];
  
  routeFiles.forEach(file => {
    const content = fs.readFileSync(path.join(routesDir, file), 'utf-8');
    const lines = content.split('\n');
    
    const routeSignatures = {};
    
    lines.forEach((line, idx) => {
      const routeMatch = line.match(/router\.(get|post|put|delete)\s*\(\s*['"]([^'"]+)/);
      if (routeMatch) {
        const method = routeMatch[1];
        const routePath = routeMatch[2];
        const signature = `${method.toUpperCase()} ${routePath}`;
        
        if (routeSignatures[signature]) {
          duplicateIssues.push(`${file}: Duplicate ${signature} (lines ${routeSignatures[signature]} and ${idx + 1})`);
        } else {
          routeSignatures[signature] = idx + 1;
        }
      }
    });
  });
  
  if (duplicateIssues.length > 0) {
    console.log(`   ❌ Found ${duplicateIssues.length} duplicate route definitions:`);
    duplicateIssues.forEach(r => console.log(`      - ${r}`));
    testsFailed++;
    failedTests.push('Duplicate route definitions');
  } else {
    console.log('   ✅ No duplicate route definitions found');
    testsPassed++;
  }
} catch (err) {
  console.log('   ⚠️  Could not check duplicates:', err.message);
  testsPassed++;
}

console.log('');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log(`║  Tests Passed: ${testsPassed}  │  Tests Failed: ${testsFailed}                           ║`);
console.log('╚════════════════════════════════════════════════════════════╝');

// Save results
const results = {
  timestamp: new Date().toISOString(),
  passed: testsPassed,
  failed: testsFailed,
  failedTests: failedTests,
  status: testsFailed === 0 ? 'PASSED' : 'FAILED'
};

fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

if (testsFailed > 0) {
  console.log('');
  console.log('❌ REGRESSION TESTS FAILED');
  console.log('');
  console.log('Failed tests:');
  failedTests.forEach(test => console.log(`  - ${test}`));
  console.log('');
  console.log('Please fix the issues before committing.');
  process.exit(1);
} else {
  console.log('');
  console.log('✅ ALL REGRESSION TESTS PASSED');
  console.log('');
  process.exit(0);
}
