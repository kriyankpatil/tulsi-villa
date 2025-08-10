@echo off
echo 🚀 Tulsi Villa - Deployment Script
echo ==================================

REM Check if git is initialized
if not exist ".git" (
    echo ❌ Git repository not found. Please initialize git first:
    echo    git init
    echo    git add .
    echo    git commit -m "Initial commit"
    pause
    exit /b 1
)

REM Check if all changes are committed
git status --porcelain >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  You have uncommitted changes. Please commit them first:
    echo    git add .
    echo    git commit -m "Ready for deployment"
    pause
    exit /b 1
)

REM Build the application
echo 🔨 Building application...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Please fix the errors and try again.
    pause
    exit /b 1
)

echo ✅ Build successful!

REM Push to remote repository
echo 📤 Pushing to remote repository...
git push origin main

if %errorlevel% equ 0 (
    echo ✅ Code pushed successfully!
    echo.
    echo 🎯 Next steps:
    echo 1. Go to https://vercel.com
    echo 2. Create new project
    echo 3. Import your GitHub repository
    echo 4. Set environment variables:
    echo    - DATABASE_URL
    echo    - JWT_SECRET
    echo    - ADMIN_EMAIL
    echo 5. Deploy!
    echo.
    echo 📚 See DEPLOYMENT.md for detailed instructions
) else (
    echo ❌ Failed to push to remote repository
)

pause
