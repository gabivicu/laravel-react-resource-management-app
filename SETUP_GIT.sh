#!/bin/bash

# Git Setup Script for Resource Management SaaS
# Run this script to initialize Git and push to GitHub

set -e

echo "🚀 Setting up Git repository..."

# 1. Initialize Git
echo "📦 Initializing Git repository..."
git init

# 2. Add remote
echo "🔗 Adding remote repository..."
git remote add origin https://github.com/gabivicu/laravel-react-resource-management-app.git || \
git remote set-url origin https://github.com/gabivicu/laravel-react-resource-management-app.git

# 3. Add all files
echo "📝 Staging files..."
git add .

# 4. Create initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Resource Management SaaS application

- Laravel 12 backend with modular architecture
- React + TypeScript + Vite frontend
- Multi-tenancy support with strict data isolation
- Advanced RBAC with granular permissions
- Docker setup with PostgreSQL and Redis
- Comprehensive test suite (PHPUnit + Vitest)
- Kanban board for task management
- Resource allocation management
- Analytics dashboard
- API-first design with Laravel Sanctum"

# 5. Set main branch
echo "🌿 Setting main branch..."
git branch -M main

# 6. Show status
echo ""
echo "✅ Git repository initialized!"
echo ""
echo "📊 Repository status:"
git status
echo ""
echo "🔗 Remote repository:"
git remote -v
echo ""
echo "📤 To push to GitHub, run:"
echo "   git push -u origin main"
echo ""
echo "⚠️  Make sure you have:"
echo "   1. GitHub credentials configured"
echo "   2. SSH key or Personal Access Token set up"
echo ""
