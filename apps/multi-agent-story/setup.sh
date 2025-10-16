#!/bin/bash

# Jules Platform - Setup Script
# This script sets up the entire Jules platform including frontend and backend

echo "=========================================="
echo "🚀 Jules Platform Setup Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 20+${NC}"
    exit 1
fi

# Check if PNPM is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️ PNPM is not installed. Installing...${NC}"
    npm install -g pnpm
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️ Docker is not installed. Please install Docker for production deployment.${NC}"
fi

echo -e "${GREEN}✓ Prerequisites checked${NC}"

# Install root dependencies
echo "📦 Installing root dependencies..."
pnpm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
pnpm install

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
pnpm prisma:generate

# Go back to root
cd ..

# Copy environment files
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️ Please update .env file with your API keys and configuration${NC}"
fi

if [ ! -f backend/.env ]; then
    echo "📋 Creating backend/.env file..."
    cp backend/.env.example backend/.env 2>/dev/null || echo "# Backend Environment Variables" > backend/.env
fi

echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo ""
echo "=========================================="
echo "📚 Next Steps:"
echo "=========================================="
echo "1. Update .env file with your configuration:"
echo "   - GEMINI_API_KEY"
echo "   - DATABASE_URL"
echo "   - JWT_SECRET"
echo ""
echo "2. Start PostgreSQL and Redis (using Docker):"
echo "   docker-compose up -d postgres redis"
echo ""
echo "3. Run database migrations:"
echo "   cd backend && pnpm prisma:migrate"
echo ""
echo "4. Start the development servers:"
echo "   pnpm run dev"
echo ""
echo "=========================================="
