# Production Dockerfile for Drama Analyst
# Multi-stage build optimized for production deployment

# =====================================================
# Base Stage
# =====================================================
FROM node:18-alpine AS base

# Install system dependencies and security updates
RUN apk add --no-cache \
    git \
    curl \
    bash \
    dumb-init \
    && apk upgrade --no-cache \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs \
    && adduser -S drama-user -u 1001

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./

# =====================================================
# Dependencies Stage
# =====================================================
FROM base AS dependencies

# Install all dependencies
RUN npm ci --prefer-offline --no-audit \
    && npm cache clean --force

# =====================================================
# Build Stage
# =====================================================
FROM dependencies AS build

# Copy source code
COPY --chown=drama-user:nodejs . .

# Switch to non-root user
USER drama-user

# Build the application
ENV NODE_ENV=production
RUN npm run build

# =====================================================
# Production Stage
# =====================================================
FROM nginx:1.25-alpine AS production

# Install additional tools and security updates
RUN apk add --no-cache \
    curl \
    dumb-init \
    && apk upgrade --no-cache \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nginx \
    && adduser -S nginx-user -u 1001

# Copy built application from build stage
COPY --from=build --chown=nginx-user:nginx /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY --chown=nginx-user:nginx nginx.conf /etc/nginx/conf.d/default.conf

# Copy custom error pages
COPY --from=build --chown=nginx-user:nginx /app/dist/index.html /usr/share/nginx/html/404.html

# Create nginx cache directories with proper permissions
RUN mkdir -p /var/cache/nginx \
    && chown -R nginx-user:nginx /var/cache/nginx \
    && chown -R nginx-user:nginx /var/log/nginx \
    && chown -R nginx-user:nginx /etc/nginx/conf.d \
    && chmod -R 755 /var/cache/nginx

# Switch to non-root user
USER nginx-user

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Start nginx with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]

