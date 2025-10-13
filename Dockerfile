# Stage 1: Build external apps
FROM node:20-alpine AS external-builder
WORKDIR /ext

# Drama Analyst
COPY external/drama-analyst/package*.json ./drama-analyst/
RUN cd drama-analyst && npm ci
COPY external/drama-analyst ./drama-analyst
RUN cd drama-analyst && npm run build

# Stations
COPY external/stations/package*.json ./stations/
RUN cd stations && npm ci
COPY external/stations ./stations
RUN cd stations && npm run build

# Multi-Agent Story (frontend only)
COPY external/multi-agent-story/jules-frontend/package*.json ./multi-agent-story/
RUN cd multi-agent-story && npm ci
COPY external/multi-agent-story/jules-frontend ./multi-agent-story
RUN cd multi-agent-story && npm run build

# Stage 2: Build main app
FROM node:20-alpine AS main-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
COPY --from=external-builder /ext/drama-analyst/dist ./public/drama-analyst
COPY --from=external-builder /ext/stations/dist ./public/stations
COPY --from=external-builder /ext/multi-agent-story/dist ./public/multi-agent-story
RUN npm run build

# Stage 3: Nginx
FROM nginx:alpine
COPY --from=main-builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN apk add --no-cache wget
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost/healthz || exit 1
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
