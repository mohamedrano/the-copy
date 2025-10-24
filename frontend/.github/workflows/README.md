# CI/CD Pipeline Documentation

## Overview

This CI/CD pipeline provides comprehensive testing, quality assurance, and deployment automation for the Next.js application using GitHub Actions and Firebase Hosting.

## Required GitHub Secrets

Configure the following secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

### Firebase Secrets
- `FIREBASE_TOKEN` - Firebase CI token for deployment
- `FIREBASE_PROJECT_ID` - Your Firebase project ID

### Sentry Secrets (for error monitoring and sourcemaps)
- `SENTRY_AUTH_TOKEN` - Sentry authentication token
- `SENTRY_ORG` - Sentry organization slug
- `SENTRY_PROJECT` - Sentry project name
- `SENTRY_DSN` - Sentry DSN for error tracking
- `NEXT_PUBLIC_SENTRY_DSN` - Public Sentry DSN for client-side tracking

### API Keys
- `GEMINI_API_KEY_STAGING` - Gemini API key for staging/development
- `GEMINI_API_KEY_PROD` - Gemini API key for production (main branch)

## Pipeline Features

### 1. Test & Build Job

#### Quality Checks
- ✅ Type checking with TypeScript
- ✅ Linting with ESLint
- ✅ Unit tests with Vitest
- ✅ Coverage threshold enforcement (≥80%)
- ✅ Bundle size validation (<250KB compressed for first page)
- ✅ E2E tests with Playwright
- ✅ E2E success rate validation (≥95%)

#### Environment Selection
The pipeline automatically selects the appropriate Gemini API key based on the branch:
- **main branch** → Uses `GEMINI_API_KEY_PROD`
- **Other branches** → Uses `GEMINI_API_KEY_STAGING`

#### Artifacts Generated
- Coverage reports (unit tests)
- E2E test results and traces
- Bundle analysis report
- Performance report with Web Vitals

### 2. Deploy Job

#### Firebase Hosting Deployment
- **Main branch** → Deploys to `live` channel (production)
- **Pull requests** → Creates preview channels with 30-day expiration
- Automatic PR comments with preview URLs

#### Production Features (main branch only)
- Sourcemap upload to Sentry with release = commit SHA
- Sentry release creation
- Deployment summary in GitHub Actions

## Acceptance Criteria

### ✅ Build Quality
- Clean production build without critical warnings
- No TypeScript errors
- No critical ESLint errors (max 10 warnings)

### ✅ Test Coverage
- Overall coverage ≥ 80% (lines, functions, branches, statements)
- All tests passing

### ✅ E2E Tests
- Success rate ≥ 95% on critical flows
- Tests run on production build

### ✅ Performance
- First page bundle size < 250KB compressed
- LCP (Largest Contentful Paint) ≤ 2.5s on medium device
- Other Web Vitals within recommended thresholds:
  - FCP < 1.8s
  - CLS < 0.1
  - FID < 100ms
  - TTFB < 600ms

### ✅ Deployment
- Auto deploy succeeds on main branch
- Preview channels work correctly on feature branches
- PR comments include preview URLs

### ✅ Monitoring
- Sourcemaps uploaded to Sentry for error tracking
- Web Vitals reported and tracked
- Performance reports generated as artifacts

## Standard Commands

```bash
# Development
npm run dev              # Start dev server

# Quality Checks
npm run lint             # Lint code
npm run typecheck        # Check TypeScript types
npm run format:check     # Check code formatting

# Testing
npm run test             # Run unit tests (watch mode)
npm run test:coverage    # Run tests with coverage report
npm run e2e              # Run E2E tests (requires build)

# Build & Deploy
npm run build            # Production build
npm run analyze          # Build with bundle analysis

# Reports
npm run performance:report  # Generate performance report
```

## Workflow Triggers

The pipeline runs on:
- Push to `main` branch
- Pull requests to `main` branch

## Deployment URLs

- **Production (main)**: Your Firebase hosting live URL
- **Preview (PRs)**: Unique preview URL per PR (commented on PR)

## Monitoring & Reports

All pipeline runs generate the following artifacts:
1. **Coverage Report** - Detailed unit test coverage
2. **E2E Report** - Playwright test results with traces
3. **Bundle Analysis** - Bundle size breakdown
4. **Performance Report** - Comprehensive performance metrics

Access artifacts from the GitHub Actions run summary page.

## Local Development Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the required values in `.env.local`

3. Install dependencies:
   ```bash
   npm ci
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

## Troubleshooting

### Build Failures

1. **Coverage below 80%**: Add tests to increase coverage
2. **Bundle size too large**: 
   - Check for large dependencies
   - Use dynamic imports for heavy components
   - Optimize images and assets
3. **E2E failures**: 
   - Check test assertions
   - Verify test data setup
   - Review Playwright traces in artifacts

### Deployment Issues

1. **Firebase deployment fails**: 
   - Verify `FIREBASE_TOKEN` and `FIREBASE_PROJECT_ID` secrets
   - Check Firebase project configuration
2. **Sentry upload fails**: 
   - Verify Sentry secrets are configured
   - Check Sentry organization and project access

## Security Notes

- ✅ Server secrets (API keys, tokens) are never exposed to client
- ✅ Zod validation prevents secret leakage in environment variables
- ✅ Only `NEXT_PUBLIC_*` variables are accessible in browser
- ✅ Sourcemaps are uploaded to Sentry but not publicly accessible

## Continuous Improvement

The pipeline enforces quality standards to ensure:
- Maintainable codebase with high test coverage
- Fast, performant user experience
- Reliable deployments with monitoring
- Quick feedback on pull requests
