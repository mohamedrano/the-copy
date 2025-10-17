# Backend Dockerfile for Drama Analyst
# Optimized for security, performance, and production deployment

# =====================================================
# Base Stage
# =====================================================
FROM node:18-alpine AS base

# Install system dependencies and security updates
RUN apk add --no-cache \
    dumb-init \
    curl \
    && apk upgrade --no-cache \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs \
    && adduser -S backend-user -u 1001

# Set working directory
WORKDIR /app

# =====================================================
# Dependencies Stage
# =====================================================
FROM base AS dependencies

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --prefer-offline --no-audit \
    && npm cache clean --force

# =====================================================
# Development Stage
# =====================================================
FROM base AS development

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci --prefer-offline --no-audit \
    && npm cache clean --force

# Copy source code
COPY --chown=backend-user:nodejs . .

# Switch to non-root user
USER backend-user

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start development server
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "dev"]

# =====================================================
# Production Stage
# =====================================================
FROM dependencies AS production

# Copy source code
COPY --chown=backend-user:nodejs . .

# Switch to non-root user
USER backend-user

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start production server
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]