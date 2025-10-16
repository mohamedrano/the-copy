# Multi-stage build for "the copy" application
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.18.3

# Copy package files for dependency resolution
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/multi-agent-story/package.json ./apps/multi-agent-story/
COPY apps/drama-analyst/package.json ./apps/drama-analyst/
COPY apps/stations/package.json ./apps/stations/
COPY apps/the-copy/package.json ./apps/the-copy/
COPY packages/shared-ui/package.json ./packages/shared-ui/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-types/package.json ./packages/shared-types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build all applications
RUN pnpm run build

# Stage 2: Production runtime
FROM nginx:alpine AS production

# Install runtime dependencies
RUN apk add --no-cache wget curl

# Copy built applications
COPY --from=builder /app/public /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user for security
RUN addgroup -g 1001 -S nginx && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Switch to non-root user
USER nginx

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/healthz || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
