#!/bin/bash
# Build script for The Copy project

# Add pnpm to PATH
export PATH="/home/user/.global_modules/bin:$PATH"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Building The Copy Project${NC}"
echo "========================================"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ pnpm found: $(pnpm --version)${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "\n${BLUE}📦 Installing dependencies...${NC}"
    pnpm install --frozen-lockfile || {
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    }
fi

# Build all applications
echo -e "\n${BLUE}🏗️  Building all applications...${NC}"
pnpm run build:all || {
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
}

# Assemble web directory
echo -e "\n${BLUE}📦 Assembling web directory...${NC}"
pnpm run web:assemble || {
    echo -e "${RED}❌ Assembly failed${NC}"
    exit 1
}

echo -e "\n${GREEN}✅ Build complete!${NC}"
echo -e "${BLUE}📁 Output: ./web/${NC}"
ls -lh web/ || true
