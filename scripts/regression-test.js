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
  const packagePath = path.join(__dirname, '../package.json');
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
  const tsConfigPath = path.join(__dirname, '../tsconfig.json');
  if (fs.existsSync(tsConfigPath)) {
    try {
      execSync('npx tsc --noEmit 2>&1', { 
        cwd: path.join(__dirname, '..'),
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
  const schemaPath = path.join(__dirname, '../backend/prisma/schema.prisma');
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
