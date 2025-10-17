# 🚀 Drama Analyst - Deployment Guide

This guide covers all deployment options for the Drama Analyst application.

## 📋 Prerequisites

### Required Tools
- **Node.js** 18+ 
- **npm** 8+
- **Git**

### Optional Tools (for specific deployments)
- **Docker** & **Docker Compose** (for containerized deployment)
- **Vercel CLI** (for Vercel deployment)
- **Netlify CLI** (for Netlify deployment)

### Environment Variables
Create a `.env` file with the following variables:

```bash
# Frontend
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_BACKEND_URL=http://localhost:3001
VITE_USE_BACKEND=true
VITE_SENTRY_DSN=your_sentry_dsn_here

# Backend
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
PORT=3001
FRONTEND_URL=http://localhost:5173
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm ci
```

### 2. Run Tests
```bash
npm run test:all
```

### 3. Build Application
```bash
npm run build
```

### 4. Deploy
```bash
# Deploy to all platforms
npm run deploy:all

# Or deploy to specific platform
npm run deploy:vercel
npm run deploy:netlify
npm run deploy:docker
```

## 🌐 Deployment Platforms

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
npm run deploy:vercel
```

**Features:**
- Automatic deployments from GitHub
- Edge functions support
- Built-in analytics
- Zero-config deployment

### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
npm run deploy:netlify
```

**Features:**
- Form handling
- Serverless functions
- Split testing
- Edge computing

### GitHub Pages
```bash
# Deploy
npm run deploy:github
```

**Features:**
- Free hosting
- Custom domains
- HTTPS by default
- Jekyll support

## 🐳 Docker Deployment

### Development
```bash
# Start development environment
npm run docker:dev
```

### Production
```bash
# Build and run production container
npm run docker:prod
```

### Manual Docker Commands
```bash
# Build image
docker build -t drama-analyst -f Dockerfile.dev --target production .

# Run container
docker run -d \
  --name drama-analyst \
  -p 80:80 \
  -p 3001:3001 \
  -e VITE_GEMINI_API_KEY=your_key \
  drama-analyst
```

## 🔧 CI/CD with GitHub Actions

The project includes comprehensive GitHub Actions workflows:

### Main CI Pipeline (`.github/workflows/ci.yml`)
- **Quality Checks**: TypeScript, linting, testing
- **Security Scanning**: NPM audit, CodeQL, Snyk
- **Performance Analysis**: Bundle size, Lighthouse CI
- **Backend Testing**: API health checks

### Deployment Workflows
- **Vercel**: `.github/workflows/deploy-vercel.yml`
- **Netlify**: `.github/workflows/deploy-netlify.yml`
- **GitHub Pages**: `.github/workflows/deploy-pages.yml`

### Required Secrets
Add these secrets to your GitHub repository:

```bash
# API Keys
VITE_GEMINI_API_KEY
GEMINI_API_KEY
VITE_SENTRY_DSN

# Deployment Tokens
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
NETLIFY_AUTH_TOKEN
NETLIFY_SITE_ID

# Security
SNYK_TOKEN
```

## 📊 Performance Monitoring

### Lighthouse CI
The project includes Lighthouse CI configuration (`.lighthouserc.json`) with performance budgets:

- **Performance**: ≥ 80
- **Accessibility**: ≥ 90
- **Best Practices**: ≥ 90
- **SEO**: ≥ 90
- **PWA**: ≥ 80

### Bundle Size Limits
- **JavaScript**: ≤ 500KB (gzipped)
- **CSS**: ≤ 100KB (gzipped)

## 🔒 Security Configuration

### Nginx Configuration
Production deployments include:
- Security headers (CSP, HSTS, X-Frame-Options)
- Rate limiting
- CORS configuration
- SSL/TLS termination

### Environment Security
- API keys stored in environment variables
- No hardcoded secrets in code
- Secure cookie settings
- HTTPS enforcement

## 🏥 Health Checks

### Frontend Health Check
```bash
curl http://localhost/health
```

### Backend Health Check
```bash
curl http://localhost:3001/health
```

### Docker Health Check
```bash
docker ps  # Check container status
docker logs drama-analyst  # Check logs
```

## 📝 Deployment Scripts

### Automated Deployment (`scripts/deploy.sh`)
```bash
# Usage
./scripts/deploy.sh [VERSION] [PLATFORM]

# Examples
./scripts/deploy.sh v1.0.0 vercel
./scripts/deploy.sh latest docker
./scripts/deploy.sh  # Deploy to all platforms
```

### Manual Steps
1. **Check Prerequisites**: Node.js, npm, required tools
2. **Install Dependencies**: `npm ci`
3. **Run Tests**: `npm run test:all`
4. **Build Application**: `npm run build`
5. **Deploy**: Platform-specific deployment
6. **Health Check**: Verify deployment success

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
npm run clean:all
npm ci
npm run build
```

#### Docker Issues
```bash
# Clean Docker cache
docker system prune -a
docker-compose down -v
docker-compose up --build
```

#### Environment Variables
- Ensure all required environment variables are set
- Check `.env` file exists and is properly formatted
- Verify secrets are configured in deployment platform

#### Network Issues
```bash
# Check connectivity
curl -I https://api.gemini.google.com
ping google.com
```

### Logs and Debugging
```bash
# Application logs
npm run dev  # Development logs

# Docker logs
docker logs drama-analyst

# Build logs
npm run build --verbose
```

## 📈 Monitoring and Analytics

### Sentry Integration
- Error tracking and performance monitoring
- Release tracking
- User feedback collection

### Performance Monitoring
- Web Vitals tracking
- Bundle size monitoring
- Lighthouse CI integration

### Uptime Monitoring
- Health check endpoints
- Automated monitoring setup
- Alert configuration

## 🔄 Rollback Procedures

### Vercel
```bash
vercel rollback [deployment-url]
```

### Netlify
```bash
netlify rollback [site-id]
```

### Docker
```bash
# Rollback to previous image
docker tag drama-analyst:previous drama-analyst:latest
docker-compose up -d
```

### GitHub Pages
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)

## 🤝 Support

For deployment issues:
1. Check the troubleshooting section
2. Review GitHub Actions logs
3. Check platform-specific documentation
4. Create an issue in the repository

---

**Happy Deploying! 🚀**