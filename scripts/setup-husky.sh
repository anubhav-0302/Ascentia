#!/bin/bash

echo "🔧 Setting up Husky pre-commit hooks..."
echo ""

# Check if husky is installed
if ! npm list husky > /dev/null 2>&1; then
  echo "📦 Installing husky..."
  npm install husky --save-dev
fi

# Initialize husky
echo "⚙️  Initializing husky..."
npx husky install

# Make pre-commit hook executable
echo "🔐 Setting permissions for pre-commit hook..."
chmod +x .husky/pre-commit

# Make regression test script executable
chmod +x scripts/regression-test.js

echo ""
echo "✅ Husky setup complete!"
echo ""
echo "📝 Pre-commit hook is now active."
echo "   Regression tests will run automatically before each commit."
echo ""
echo "To bypass the hook (not recommended):"
echo "   git commit --no-verify"
echo ""
