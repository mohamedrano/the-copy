#!/bin/bash

# Drama Analyst Deployment Script
# This script handles deployment to various platforms

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="drama-analyst"
VERSION=${1:-"latest"}
PLATFORM=${2:-"all"}
BUILD_DIR="./dist"
BACKEND_DIR="./backend"

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version 18 or higher is required"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    # Frontend dependencies
    npm ci --prefer-offline --no-audit
    
    # Backend dependencies
    if [ -d "$BACKEND_DIR" ]; then
        cd "$BACKEND_DIR"
        npm ci --prefer-offline --no-audit
        cd ..
    fi
    
    log_success "Dependencies installed"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Unit tests
    npm run test:coverage
    
    # E2E tests
    npm run test:e2e
    
    # Type checking
    npx tsc --noEmit
    
    log_success "All tests passed"
}

# Build application
build_application() {
    log_info "Building application..."
    
    # Clean previous build
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
    fi
    
    # Build frontend
    npm run build
    
    # Build backend (if exists)
    if [ -d "$BACKEND_DIR" ]; then
        cd "$BACKEND_DIR"
        npm run build || log_warning "Backend build not configured"
        cd ..
    fi
    
    log_success "Application built successfully"
}

# Deploy to Vercel
deploy_vercel() {
    log_info "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI is not installed. Install it with: npm i -g vercel"
        exit 1
    fi
    
    # Deploy to Vercel
    vercel --prod --yes
    
    log_success "Deployed to Vercel successfully"
}

# Deploy to Netlify
deploy_netlify() {
    log_info "Deploying to Netlify..."
    
    if ! command -v netlify &> /dev/null; then
        log_error "Netlify CLI is not installed. Install it with: npm i -g netlify-cli"
        exit 1
    fi
    
    # Deploy to Netlify
    netlify deploy --prod --dir="$BUILD_DIR"
    
    log_success "Deployed to Netlify successfully"
}

# Deploy to GitHub Pages
deploy_github_pages() {
    log_info "Deploying to GitHub Pages..."
    
    if [ -z "$GITHUB_TOKEN" ]; then
        log_error "GITHUB_TOKEN environment variable is not set"
        exit 1
    fi
    
    # Use gh-pages package for deployment
    npx gh-pages -d "$BUILD_DIR" -t true
    
    log_success "Deployed to GitHub Pages successfully"
}

# Deploy with Docker
deploy_docker() {
    log_info "Building and deploying with Docker..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Build Docker image
    docker build -t "$APP_NAME:$VERSION" -f Dockerfile.dev --target production .
    
    # Run container
    docker run -d \
        --name "$APP_NAME" \
        -p 80:80 \
        -p 3001:3001 \
        "$APP_NAME:$VERSION"
    
    log_success "Deployed with Docker successfully"
}

# Deploy with Docker Compose
deploy_docker_compose() {
    log_info "Deploying with Docker Compose..."
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Start services
    docker-compose up -d --build
    
    log_success "Deployed with Docker Compose successfully"
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Wait for services to start
    sleep 10
    
    # Check frontend
    if curl -f http://localhost:80 > /dev/null 2>&1; then
        log_success "Frontend is healthy"
    else
        log_error "Frontend health check failed"
        exit 1
    fi
    
    # Check backend
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        log_success "Backend is healthy"
    else
        log_warning "Backend health check failed (might not be configured)"
    fi
}

# Cleanup
cleanup() {
    log_info "Cleaning up..."
    
    # Stop and remove containers
    docker-compose down 2>/dev/null || true
    docker stop "$APP_NAME" 2>/dev/null || true
    docker rm "$APP_NAME" 2>/dev/null || true
    
    log_success "Cleanup completed"
}

# Main deployment function
deploy() {
    log_info "Starting deployment process..."
    log_info "Platform: $PLATFORM"
    log_info "Version: $VERSION"
    
    case $PLATFORM in
        "vercel")
            check_prerequisites
            install_dependencies
            run_tests
            build_application
            deploy_vercel
            ;;
        "netlify")
            check_prerequisites
            install_dependencies
            run_tests
            build_application
            deploy_netlify
            ;;
        "github-pages")
            check_prerequisites
            install_dependencies
            run_tests
            build_application
            deploy_github_pages
            ;;
        "docker")
            check_prerequisites
            install_dependencies
            run_tests
            build_application
            deploy_docker
            health_check
            ;;
        "docker-compose")
            cleanup
            check_prerequisites
            install_dependencies
            run_tests
            build_application
            deploy_docker_compose
            health_check
            ;;
        "all")
            check_prerequisites
            install_dependencies
            run_tests
            build_application
            
            # Try to deploy to all platforms
            deploy_vercel || log_warning "Vercel deployment failed"
            deploy_netlify || log_warning "Netlify deployment failed"
            deploy_github_pages || log_warning "GitHub Pages deployment failed"
            ;;
        *)
            log_error "Unknown platform: $PLATFORM"
            echo "Available platforms: vercel, netlify, github-pages, docker, docker-compose, all"
            exit 1
            ;;
    esac
    
    log_success "Deployment completed successfully!"
}

# Show help
show_help() {
    echo "Drama Analyst Deployment Script"
    echo ""
    echo "Usage: $0 [VERSION] [PLATFORM]"
    echo ""
    echo "Arguments:"
    echo "  VERSION    Version tag (default: latest)"
    echo "  PLATFORM   Deployment platform (default: all)"
    echo ""
    echo "Available platforms:"
    echo "  vercel         Deploy to Vercel"
    echo "  netlify        Deploy to Netlify"
    echo "  github-pages   Deploy to GitHub Pages"
    echo "  docker         Deploy with Docker"
    echo "  docker-compose Deploy with Docker Compose"
    echo "  all            Deploy to all platforms"
    echo ""
    echo "Examples:"
    echo "  $0                    # Deploy latest version to all platforms"
    echo "  $0 v1.0.0 vercel     # Deploy v1.0.0 to Vercel"
    echo "  $0 latest docker     # Deploy latest to Docker"
    echo ""
}

# Handle script arguments
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

# Run deployment
deploy

