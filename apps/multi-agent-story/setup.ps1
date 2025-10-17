# Jules Platform - Setup Script for Windows PowerShell
# This script sets up the entire Jules platform including frontend and backend

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 Jules Platform Setup Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 20+" -ForegroundColor Red
    exit 1
}

# Check if PNPM is installed
try {
    $pnpmVersion = pnpm --version
    Write-Host "✓ PNPM is installed: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️ PNPM is not installed. Installing..." -ForegroundColor Yellow
    npm install -g pnpm
}

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker is installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Docker is not installed. Please install Docker for production deployment." -ForegroundColor Yellow
}

Write-Host "`n✓ Prerequisites checked" -ForegroundColor Green

# Install root dependencies
Write-Host "`n📦 Installing root dependencies..." -ForegroundColor Yellow
pnpm install

# Install backend dependencies
Write-Host "`n📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
pnpm install

# Generate Prisma client
Write-Host "`n🗄️ Generating Prisma client..." -ForegroundColor Yellow
pnpm prisma:generate

# Go back to root
Set-Location ..

# Copy environment files
if (!(Test-Path .env)) {
    Write-Host "`n📋 Creating .env file from template..." -ForegroundColor Yellow
    if (Test-Path .env.example) {
        Copy-Item .env.example .env
    } else {
        # Create a basic .env file
        @"
# Jules Platform Environment Variables
NODE_ENV=development

# Gemini AI Configuration
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
GEMINI_MODEL=gemini-2.0-flash-exp

# Database Configuration
DATABASE_URL=postgresql://jules_user:password@localhost:5432/jules_db
POSTGRES_PASSWORD=password

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# Authentication
JWT_SECRET=your-secret-key-here
ENCRYPTION_KEY=your-encryption-key-here

# API Configuration
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
"@ | Out-File -FilePath .env -Encoding utf8
    }
    Write-Host "⚠️ Please update .env file with your API keys and configuration" -ForegroundColor Yellow
}

if (!(Test-Path backend/.env)) {
    Write-Host "`n📋 Creating backend/.env file..." -ForegroundColor Yellow
    Copy-Item .env backend/.env
}

Write-Host "`n✅ Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📚 Next Steps:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "1. Update .env file with your configuration:"
Write-Host "   - GEMINI_API_KEY"
Write-Host "   - DATABASE_URL"
Write-Host "   - JWT_SECRET"
Write-Host ""
Write-Host "2. Start PostgreSQL and Redis (using Docker):"
Write-Host "   docker-compose up -d postgres redis"
Write-Host ""
Write-Host "3. Run database migrations:"
Write-Host "   cd backend && pnpm prisma:migrate"
Write-Host ""
Write-Host "4. Start the development servers:"
Write-Host "   pnpm run dev"
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
