@echo off
REM Windows Husky Setup Script

echo.
echo 🔧 Setting up Husky pre-commit hooks for Windows...
echo.

REM Check if husky is installed
npm list husky >nul 2>&1
if errorlevel 1 (
  echo 📦 Installing husky...
  call npm install husky --save-dev
)

REM Initialize husky
echo ⚙️  Initializing husky...
call npx husky install

REM Create pre-commit hook using husky add command
echo 📝 Creating pre-commit hook...
call npx husky add .husky/pre-commit "node scripts/regression-test.js"

echo.
echo ✅ Husky setup complete!
echo.
echo 📝 Pre-commit hook is now active.
echo    Regression tests will run automatically before each commit.
echo.
echo To bypass the hook (not recommended):
echo    git commit --no-verify
echo.
pause
