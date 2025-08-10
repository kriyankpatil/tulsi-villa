#!/bin/bash

echo "🚀 Tulsi Villa - Deployment Script"
echo "=================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if all changes are committed
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Please commit them first:"
    echo "   git add ."
    echo "   git commit -m 'Ready for deployment'"
    exit 1
fi

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Push to remote repository
echo "📤 Pushing to remote repository..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Code pushed successfully!"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Go to https://vercel.com"
    echo "2. Create new project"
    echo "3. Import your GitHub repository"
    echo "4. Set environment variables:"
    echo "   - DATABASE_URL"
    echo "   - JWT_SECRET"
    echo "   - ADMIN_EMAIL"
    echo "5. Deploy!"
    echo ""
    echo "📚 See DEPLOYMENT.md for detailed instructions"
else
    echo "❌ Failed to push to remote repository"
    exit 1
fi
