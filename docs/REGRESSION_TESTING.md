# Regression Testing & Pre-Commit Validation

## Overview

This document describes the automated regression testing system that runs before every commit to ensure code quality and prevent breaking changes.

## What Gets Tested

### 1. **Critical File Modifications** ✅
- Monitors changes to core system files:
  - `backend/lib/prisma.js` (Database client)
  - `backend/middleware/auth.js` (Authentication)
  - `frontend/src/store/useAuthStore.ts` (Auth state)
  - `frontend/src/api/apiClient.ts` (API client)
- Alerts if critical files are modified
- Requires developer to verify backward compatibility

### 2. **Package.json Integrity** ✅
- Validates package.json structure
- Ensures name and version fields exist
- Prevents corrupted dependency files

### 3. **Code Quality** ✅
- Checks for excessive console.log statements
- Warns if debug logs exceed 20 statements
- Helps maintain clean production code

### 4. **Import Validation** ✅
- Detects broken or malformed imports
- Checks for undefined/null import paths
- Prevents module resolution errors

### 5. **API Endpoint Consistency** ✅
- Verifies API endpoints are properly configured
- Checks for hardcoded URLs
- Ensures environment variables are used

### 6. **TypeScript Compilation** ✅
- Runs TypeScript compiler
- Detects type errors before commit
- Prevents runtime type issues

### 7. **Database Schema Consistency** ✅
- Validates Prisma schema integrity
- Checks for required database models:
  - User
  - Employee
  - SalaryComponent
  - EmployeeSalary
- Ensures schema changes don't break migrations

### 8. **Security Checks** ✅
- Detects hardcoded secrets (passwords, API keys)
- Identifies potential SQL injection risks
- Prevents accidental credential exposure

## Installation

### Step 1: Install Dependencies
```bash
npm install husky --save-dev
```

### Step 2: Run Setup Script
```bash
bash scripts/setup-husky.sh
```

Or manually:
```bash
npx husky install
chmod +x .husky/pre-commit
chmod +x scripts/regression-test.js
```

### Step 3: Verify Installation
```bash
ls -la .husky/
# Should show: pre-commit file
```

## Usage

### Normal Workflow
```bash
git add .
git commit -m "Your commit message"
# Regression tests run automatically
# If all pass → commit succeeds
# If any fail → commit is aborted
```

### Bypass Hook (Not Recommended)
```bash
git commit --no-verify
```

## Test Results

After each commit attempt, results are saved to `.regression-results.json`:

```json
{
  "timestamp": "2026-04-16T18:24:00.000Z",
  "passed": 8,
  "failed": 0,
  "failedTests": [],
  "status": "PASSED"
}
```

## Example Output

### ✅ All Tests Pass
```
╔════════════════════════════════════════════════════════════╗
║         REGRESSION TEST SUITE - PRE-COMMIT CHECK           ║
╚════════════════════════════════════════════════════════════╝

📋 Test 1: Checking for critical file modifications...
   ✅ No critical files modified

📋 Test 2: Verifying package.json integrity...
   ✅ package.json valid (v1.0.0)

📋 Test 3: Checking for excessive console.log statements...
   ✅ Console statements within acceptable range (5)

📋 Test 4: Checking for broken imports...
   ✅ No broken imports detected

📋 Test 5: Verifying API endpoint consistency...
   ✅ API endpoints properly configured

📋 Test 6: Checking for TypeScript compilation errors...
   ✅ TypeScript compilation successful

📋 Test 7: Verifying database schema consistency...
   ✅ All required database models present

📋 Test 8: Checking for common security issues...
   ✅ No obvious security issues detected

╔════════════════════════════════════════════════════════════╗
║  Tests Passed: 8  │  Tests Failed: 0                           ║
╚════════════════════════════════════════════════════════════╝

✅ ALL REGRESSION TESTS PASSED
```

### ❌ Tests Fail
```
╔════════════════════════════════════════════════════════════╗
║         REGRESSION TEST SUITE - PRE-COMMIT CHECK           ║
╚════════════════════════════════════════════════════════════╝

📋 Test 1: Checking for critical file modifications...
   ⚠️  Critical files modified:
      - backend/lib/prisma.js
   ✅ Please ensure backward compatibility is maintained

📋 Test 6: Checking for TypeScript compilation errors...
   ❌ TypeScript compilation errors found
      error TS2339: Property 'foo' does not exist on type 'Bar'

╔════════════════════════════════════════════════════════════╗
║  Tests Passed: 6  │  Tests Failed: 2                           ║
╚════════════════════════════════════════════════════════════╝

❌ REGRESSION TESTS FAILED

Failed tests:
  - TypeScript compilation

Please fix the issues before committing.
```

## Fixing Failed Tests

### TypeScript Errors
```bash
# View all TypeScript errors
npx tsc --noEmit

# Fix errors in your code, then try committing again
```

### Broken Imports
```bash
# Check import statements in modified files
# Ensure all imported modules exist and are correctly spelled
```

### Security Issues
```bash
# Remove hardcoded secrets
# Use environment variables instead
# Example: const apiKey = process.env.API_KEY;
```

### Critical File Changes
```bash
# If you modified critical files:
# 1. Verify backward compatibility
# 2. Test with existing code
# 3. Document breaking changes
# 4. Update migration guides
```

## Customization

To add more tests, edit `scripts/regression-test.js`:

```javascript
// Add new test
console.log('📋 Test 9: Your custom test...');
try {
  // Your test logic
  console.log('   ✅ Test passed');
  testsPassed++;
} catch (err) {
  console.log('   ❌ Test failed:', err.message);
  testsFailed++;
  failedTests.push('Your test name');
}
```

## Troubleshooting

### Hook Not Running
```bash
# Check if husky is installed
npm list husky

# Reinstall husky
npm install husky --save-dev
npx husky install
```

### Permission Denied
```bash
# Make scripts executable
chmod +x .husky/pre-commit
chmod +x scripts/regression-test.js
```

### Tests Always Fail
```bash
# Check git staging
git status

# Verify no uncommitted changes
git diff

# Try committing with verbose output
git commit -m "test" --verbose
```

## Best Practices

1. **Fix Issues Immediately**: Don't bypass the hook
2. **Keep Tests Updated**: Add tests for new features
3. **Review Results**: Check `.regression-results.json` after commits
4. **Document Changes**: Update this file when adding tests
5. **Test Locally**: Run `node scripts/regression-test.js` before committing

## CI/CD Integration

To run regression tests in CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Run Regression Tests
  run: node scripts/regression-test.js
```

## Support

For issues or questions about regression testing:
1. Check `.regression-results.json` for detailed results
2. Review the test output in terminal
3. Consult this documentation
4. Update the test script as needed

---

**Last Updated**: April 16, 2026
**Version**: 1.0.0
