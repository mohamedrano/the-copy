# Contributing to Drama Analyst

Thank you for your interest in contributing to Drama Analyst! This guide will help you get started with contributing to our AI-powered dramatic text analysis platform.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)
- [Release Process](#release-process)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **Git**: Latest version
- **Docker**: For containerized development (optional)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/drama-analyst.git
   cd drama-analyst
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/original-owner/drama-analyst.git
   ```

## Development Setup

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Environment Configuration

Create environment files:

```bash
# Frontend environment
cp .env.example .env

# Backend environment
cp backend/.env.example backend/.env
```

Configure the following variables:

```bash
# Frontend (.env)
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_BACKEND_URL=http://localhost:3001
VITE_USE_BACKEND=true
VITE_SENTRY_DSN=your_sentry_dsn
VITE_GA4_MEASUREMENT_ID=your_ga4_id

# Backend (backend/.env)
GEMINI_API_KEY=your_gemini_api_key
PORT=3001
NODE_ENV=development
SENTRY_DSN=your_sentry_dsn
```

### 3. Start Development Servers

```bash
# Start frontend (Terminal 1)
npm run dev

# Start backend (Terminal 2)
cd backend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- API Documentation: http://localhost:3001/docs

## Project Structure

```
drama-analyst/
├── agents/                 # AI Agent configurations
│   ├── analysis/          # Core analysis agents
│   ├── creative/          # Creative generation agents
│   └── ...
├── backend/               # Backend proxy server
│   ├── src/              # Backend source code
│   ├── openapi.yaml      # API specification
│   └── package.json      # Backend dependencies
├── core/                 # Core types and constants
│   ├── types.ts         # TypeScript interfaces
│   ├── enums.ts         # Application enums
│   └── constants.ts     # Application constants
├── docs/                # Documentation
│   ├── ADRs/           # Architecture Decision Records
│   └── ...
├── orchestration/       # Agent orchestration logic
│   ├── orchestration.ts # Orchestration manager
│   ├── executor.ts      # Task execution
│   └── promptBuilder.ts # Dynamic prompt building
├── services/           # Application services
│   ├── geminiService.ts # AI service integration
│   ├── loggerService.ts # Logging service
│   └── ...
├── ui/                 # React frontend
│   ├── components/     # React components
│   ├── App.tsx        # Main application
│   └── main.tsx       # Application entry point
├── tests/              # Test files
├── .github/            # GitHub workflows
├── docker-compose.yml  # Docker configuration
├── Dockerfile         # Frontend Docker image
├── package.json       # Frontend dependencies
└── vite.config.ts     # Vite configuration
```

## Contributing Guidelines

### Types of Contributions

We welcome contributions in the following areas:

- **Bug Fixes**: Fix existing issues
- **Feature Development**: Add new functionality
- **Performance Improvements**: Optimize existing code
- **Documentation**: Improve documentation
- **Testing**: Add or improve tests
- **UI/UX**: Improve user interface and experience

### Before You Start

1. **Check Issues**: Look for existing issues or create a new one
2. **Discuss**: For major changes, discuss in issues first
3. **Branch**: Create a feature branch from `main`
4. **Plan**: Plan your changes and break them into logical commits

### Branch Naming

Use descriptive branch names:

```bash
# Feature branches
feature/add-new-agent
feature/improve-ui

# Bug fix branches
bugfix/fix-memory-leak
bugfix/resolve-type-error

# Documentation branches
docs/update-readme
docs/add-api-examples
```

## Pull Request Process

### 1. Create a Pull Request

1. Push your branch to your fork
2. Create a pull request against the `main` branch
3. Fill out the pull request template
4. Link any related issues

### 2. Pull Request Requirements

- **Tests**: All new code must have tests
- **Documentation**: Update documentation for new features
- **Type Safety**: Pass TypeScript strict mode checks
- **Linting**: Pass all linting checks
- **Performance**: No significant performance regressions

### 3. Review Process

- **Automated Checks**: CI/CD pipeline must pass
- **Code Review**: At least one maintainer review required
- **Testing**: Manual testing for user-facing changes
- **Documentation**: Documentation review for new features

### 4. Merge Process

- **Squash and Merge**: Use squash and merge for clean history
- **Delete Branch**: Delete feature branch after merge
- **Update Issues**: Close related issues and add release notes

## Code Style

### TypeScript

- **Strict Mode**: All code must pass TypeScript strict mode
- **Type Safety**: Explicit types for all public APIs
- **Error Handling**: Proper error handling with Result types
- **Documentation**: JSDoc comments for public functions

```typescript
/**
 * Processes uploaded files and extracts text content
 * @param files - Array of uploaded files
 * @returns Promise resolving to processed file content
 * @throws {Error} When file processing fails
 */
async function processFiles(files: File[]): Promise<ProcessedFile[]> {
  // Implementation...
}
```

### React

- **Functional Components**: Use functional components with hooks
- **TypeScript**: Proper typing for props and state
- **Error Boundaries**: Wrap components in error boundaries
- **Performance**: Use React.memo and useMemo for optimization

```typescript
interface ComponentProps {
  title: string;
  onAction: (value: string) => void;
}

const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
  // Implementation...
};
```

### File Organization

- **Path Aliases**: Use configured path aliases
- **Barrel Exports**: Use index.ts files for clean imports
- **Naming**: Use descriptive names for files and functions
- **Structure**: Follow established directory structure

## Testing

### Test Types

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Performance Tests**: Test performance characteristics

### Running Tests

```bash
# Unit tests
npm run test

# Test with coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

### Test Requirements

- **Coverage**: Minimum 80% test coverage
- **Quality**: Tests must be meaningful and maintainable
- **Performance**: Tests must run in reasonable time
- **Documentation**: Tests serve as documentation

## Documentation

### Documentation Types

- **API Documentation**: OpenAPI/Swagger specifications
- **Architecture**: Architecture Decision Records (ADRs)
- **User Guides**: User-facing documentation
- **Developer Guides**: Technical documentation
- **Code Comments**: Inline code documentation

### Writing Documentation

- **Clear**: Use clear, concise language
- **Complete**: Cover all necessary information
- **Current**: Keep documentation up to date
- **Examples**: Include practical examples
- **Structure**: Use consistent structure and formatting

## Release Process

### Version Numbering

We use [Semantic Versioning](https://semver.org/):

- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes (backward compatible)

### Release Steps

1. **Update Version**: Update version in package.json
2. **Update Changelog**: Update CHANGELOG.md
3. **Create Tag**: Create git tag for release
4. **Deploy**: Deploy to production
5. **Announce**: Announce release to community

### Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] Version bumped
- [ ] Changelog updated
- [ ] Release notes prepared
- [ ] Deployment successful
- [ ] Post-deployment verification

## Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Pull Requests**: Code-related discussions
- **Email**: support@drama-analyst.com for private matters

### Resources

- **Documentation**: Check the docs/ directory
- **Examples**: Look at existing code for patterns
- **ADRs**: Read Architecture Decision Records
- **API Docs**: Check the OpenAPI specification

## Recognition

Contributors will be recognized in:

- **README**: Contributor list
- **Release Notes**: Feature acknowledgments
- **Documentation**: Credit for significant contributions
- **Community**: Recognition in community channels

Thank you for contributing to Drama Analyst! Your contributions help make this project better for everyone.

