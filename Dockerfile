# Multi-stage build for "the copy" application
# Stage 1: Build external projects
FROM node:20-alpine AS external-builder
WORKDIR /ext

# Install build dependencies
RUN apk add --no-cache git

# Drama Analyst
COPY external/drama-analyst/package*.json ./drama-analyst/
RUN cd drama-analyst && npm ci --only=production --silent
COPY external/drama-analyst ./drama-analyst
RUN cd drama-analyst && npm run build

# Stations
COPY external/stations/package*.json ./stations/
RUN cd stations && npm ci --only=production --silent
COPY external/stations ./stations
RUN cd stations && npm run build

# Multi-Agent Story (frontend only)
COPY external/multi-agent-story/jules-frontend/package*.json ./multi-agent-story/
RUN cd multi-agent-story && npm ci --only=production --silent
COPY external/multi-agent-story/jules-frontend ./multi-agent-story
RUN cd multi-agent-story && npm run build

# Stage 2: Build main application
FROM node:20-alpine AS main-builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --silent

# Copy source code
COPY . .

# Copy built external projects
COPY --from=external-builder /ext/drama-analyst/dist ./public/drama-analyst
COPY --from=external-builder /ext/stations/dist ./public/stations
COPY --from=external-builder /ext/multi-agent-story/dist ./public/multi-agent-story

# Build main application
RUN npm run build

# Stage 3: Production runtime
FROM nginx:alpine AS production

# Install runtime dependencies
RUN apk add --no-cache wget curl

# Copy built application
COPY --from=main-builder /app/dist /usr/share/nginx/html

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
