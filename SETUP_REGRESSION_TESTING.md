# Quick Setup: Regression Testing

## One-Command Setup

Run this in the project root:

```bash
npm install husky --save-dev && npx husky install && chmod +x .husky/pre-commit && chmod +x scripts/regression-test.js
```

## Or Step-by-Step

### 1. Install Husky
```bash
npm install husky --save-dev
```

### 2. Initialize Husky
```bash
npx husky install
```

### 3. Make Scripts Executable
```bash
chmod +x .husky/pre-commit
chmod +x scripts/regression-test.js
```

### 4. Test the Setup
```bash
# Try making a small change and committing
echo "# test" >> README.md
git add README.md
git commit -m "test regression setup"
```

You should see the regression test output before the commit completes.

## What Happens Now

Every time you run `git commit`:

1. ✅ Staged files are analyzed
2. ✅ 8 regression tests run automatically
3. ✅ If all pass → commit succeeds
4. ❌ If any fail → commit is blocked with error details

## Test Results

Check results after each commit:
```bash
cat .regression-results.json
```

## Disable Hook (Temporary)
```bash
git commit --no-verify
```

## Re-enable Hook
```bash
npx husky install
```

## Files Created

- `.husky/pre-commit` - Hook that runs tests
- `scripts/regression-test.js` - Test suite
- `.regression-results.json` - Results after each commit
- `REGRESSION_TESTING.md` - Full documentation

## Next Steps

1. ✅ Run setup commands above
2. ✅ Make a test commit to verify
3. ✅ Read `REGRESSION_TESTING.md` for details
4. ✅ Customize tests in `scripts/regression-test.js` as needed

---

**Ready to go!** Your commits are now protected by automated regression testing. 🎉
