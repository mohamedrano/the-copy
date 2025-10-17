# Drama Analyst Makefile
# Simplifies Docker and deployment operations

.PHONY: help dev prod build clean test lint deploy

# Default target
help: ## Show this help message
	@echo "Drama Analyst - Available Commands:"
	@echo "=================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# =====================================================
# Development Commands
# =====================================================

dev: ## Start development environment
	@echo "🚀 Starting development environment..."
	docker-compose -f docker-compose.dev.yml up --build

dev-detached: ## Start development environment in background
	@echo "🚀 Starting development environment in background..."
	docker-compose -f docker-compose.dev.yml up -d --build

dev-logs: ## Show development logs
	@echo "📋 Showing development logs..."
	docker-compose -f docker-compose.dev.yml logs -f

dev-stop: ## Stop development environment
	@echo "🛑 Stopping development environment..."
	docker-compose -f docker-compose.dev.yml down

dev-clean: ## Clean development environment
	@echo "🧹 Cleaning development environment..."
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans

# =====================================================
# Production Commands
# =====================================================

prod: ## Start production environment
	@echo "🚀 Starting production environment..."
	docker-compose -f docker-compose.prod.yml up -d --build

prod-logs: ## Show production logs
	@echo "📋 Showing production logs..."
	docker-compose -f docker-compose.prod.yml logs -f

prod-stop: ## Stop production environment
	@echo "🛑 Stopping production environment..."
	docker-compose -f docker-compose.prod.yml down

prod-clean: ## Clean production environment
	@echo "🧹 Cleaning production environment..."
	docker-compose -f docker-compose.prod.yml down -v --remove-orphans

prod-restart: ## Restart production environment
	@echo "🔄 Restarting production environment..."
	docker-compose -f docker-compose.prod.yml restart

# =====================================================
# Build Commands
# =====================================================

build: ## Build all Docker images
	@echo "🏗️ Building Docker images..."
	docker-compose build

build-dev: ## Build development images
	@echo "🏗️ Building development images..."
	docker-compose -f docker-compose.dev.yml build

build-prod: ## Build production images
	@echo "🏗️ Building production images..."
	docker-compose -f docker-compose.prod.yml build

build-no-cache: ## Build images without cache
	@echo "🏗️ Building images without cache..."
	docker-compose build --no-cache

# =====================================================
# Testing Commands
# =====================================================

test: ## Run all tests
	@echo "🧪 Running tests..."
	npm run test:all

test-coverage: ## Run tests with coverage
	@echo "🧪 Running tests with coverage..."
	npm run test:coverage

test-e2e: ## Run E2E tests
	@echo "🧪 Running E2E tests..."
	npm run test:e2e

test-docker: ## Run tests in Docker
	@echo "🧪 Running tests in Docker..."
	docker run --rm -v $(PWD):/app -w /app node:18-alpine npm ci && npm run test:all

# =====================================================
# Linting and Code Quality
# =====================================================

lint: ## Run linting
	@echo "🔍 Running linting..."
	npm run lint

lint-fix: ## Fix linting issues
	@echo "🔧 Fixing linting issues..."
	npm run lint:fix

type-check: ## Run TypeScript type checking
	@echo "📝 Running TypeScript type checking..."
	npm run type-check

# =====================================================
# Deployment Commands
# =====================================================

deploy-vercel: ## Deploy to Vercel
	@echo "🚀 Deploying to Vercel..."
	./scripts/deploy.sh latest vercel

deploy-netlify: ## Deploy to Netlify
	@echo "🚀 Deploying to Netlify..."
	./scripts/deploy.sh latest netlify

deploy-github: ## Deploy to GitHub Pages
	@echo "🚀 Deploying to GitHub Pages..."
	./scripts/deploy.sh latest github-pages

deploy-docker: ## Deploy with Docker
	@echo "🚀 Deploying with Docker..."
	./scripts/deploy.sh latest docker-compose

deploy-all: ## Deploy to all platforms
	@echo "🚀 Deploying to all platforms..."
	./scripts/deploy.sh latest all

# =====================================================
# Utility Commands
# =====================================================

clean: ## Clean all Docker resources
	@echo "🧹 Cleaning Docker resources..."
	docker system prune -f
	docker volume prune -f
	docker network prune -f

clean-all: ## Clean everything including images
	@echo "🧹 Cleaning everything..."
	docker system prune -a -f
	docker volume prune -f
	docker network prune -f

logs: ## Show logs for all services
	@echo "📋 Showing logs for all services..."
	docker-compose logs -f

status: ## Show status of all containers
	@echo "📊 Container status:"
	docker-compose ps

health: ## Check health of all services
	@echo "🏥 Checking health of all services..."
	@echo "Frontend: $$(curl -s -o /dev/null -w '%{http_code}' http://localhost:80/health || echo 'DOWN')"
	@echo "Backend: $$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/health || echo 'DOWN')"
	@echo "Redis: $$(docker exec drama-analyst-prod-redis redis-cli ping 2>/dev/null || echo 'DOWN')"
	@echo "PostgreSQL: $$(docker exec drama-analyst-prod-postgres pg_isready -U drama_user 2>/dev/null && echo 'UP' || echo 'DOWN')"

# =====================================================
# Database Commands
# =====================================================

db-backup: ## Backup database
	@echo "💾 Backing up database..."
	docker exec drama-analyst-prod-postgres pg_dump -U drama_user drama_analyst > backup_$(shell date +%Y%m%d_%H%M%S).sql

db-restore: ## Restore database from backup
	@echo "📥 Restoring database..."
	@read -p "Enter backup file path: " file; \
	docker exec -i drama-analyst-prod-postgres psql -U drama_user drama_analyst < $$file

db-shell: ## Access database shell
	@echo "🐘 Accessing database shell..."
	docker exec -it drama-analyst-prod-postgres psql -U drama_user drama_analyst

# =====================================================
# Monitoring Commands
# =====================================================

monitor: ## Start monitoring services
	@echo "📊 Starting monitoring services..."
	docker-compose -f docker-compose.prod.yml --profile monitoring up -d

monitor-stop: ## Stop monitoring services
	@echo "🛑 Stopping monitoring services..."
	docker-compose -f docker-compose.prod.yml --profile monitoring down

grafana: ## Open Grafana dashboard
	@echo "📊 Opening Grafana dashboard..."
	@echo "URL: http://localhost:3000"
	@echo "Username: admin"
	@echo "Password: Check GRAFANA_PASSWORD environment variable"
	@command -v xdg-open >/dev/null 2>&1 && xdg-open http://localhost:3000 || echo "Open http://localhost:3000 in your browser"

prometheus: ## Open Prometheus dashboard
	@echo "📊 Opening Prometheus dashboard..."
	@echo "URL: http://localhost:9090"
	@command -v xdg-open >/dev/null 2>&1 && xdg-open http://localhost:9090 || echo "Open http://localhost:9090 in your browser"

# =====================================================
# Security Commands
# =====================================================

security-scan: ## Run security scan
	@echo "🔒 Running security scan..."
	npm audit --audit-level=moderate
	docker run --rm -v $(PWD):/app securecodewarrior/docker-security-scan:latest /app

update-deps: ## Update dependencies
	@echo "🔄 Updating dependencies..."
	npm update
	cd backend && npm update

# =====================================================
# Development Setup
# =====================================================

setup: ## Initial setup
	@echo "⚙️ Setting up development environment..."
	npm ci
	cd backend && npm ci
	@echo "✅ Setup complete!"

setup-dev: ## Setup development environment
	@echo "⚙️ Setting up development environment..."
	cp .env.example .env
	@echo "📝 Please edit .env file with your configuration"
	@echo "🚀 Run 'make dev' to start development environment"

# =====================================================
# Quick Commands
# =====================================================

quick-start: setup-dev dev ## Quick start for new developers

quick-deploy: build-prod deploy-docker ## Quick deployment

quick-test: lint type-check test ## Quick test suite

# =====================================================
# Environment Information
# =====================================================

info: ## Show environment information
	@echo "📊 Environment Information:"
	@echo "=========================="
	@echo "Node.js: $$(node --version)"
	@echo "npm: $$(npm --version)"
	@echo "Docker: $$(docker --version)"
	@echo "Docker Compose: $$(docker-compose --version)"
	@echo "Git: $$(git --version)"
	@echo ""
	@echo "📁 Project Structure:"
	@echo "Frontend: $(PWD)"
	@echo "Backend: $(PWD)/backend"
	@echo "Docker Files: Dockerfile, docker-compose.yml"
	@echo ""
	@echo "🌐 Ports:"
	@echo "Frontend Dev: http://localhost:5173"
	@echo "Frontend Prod: http://localhost:80"
	@echo "Backend: http://localhost:3001"
	@echo "Grafana: http://localhost:3000"
	@echo "Prometheus: http://localhost:9090"

