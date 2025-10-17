# -------- Base Deps --------
FROM node:20-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

# نسخ ملفات التعاريف فقط أولاً لتسريع الـ cache
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/stations/package.json apps/stations/
COPY packages/*/package.json packages/*/

RUN pnpm install --frozen-lockfile

# -------- Build --------
FROM deps AS build
COPY . .
RUN pnpm -w --filter ./apps/stations build

# تصدير حزمة معتمدة للإطلاق (pruned)
FROM deps AS deploy
COPY --from=build /app .
RUN pnpm -w --filter ./apps/stations deploy --prod /out

# -------- Runtime --------
FROM node:20-slim
WORKDIR /srv
ENV NODE_ENV=production PORT=8080
# متغيّرات ستُحقن من Cloud Run عبر Secret Manager
# DATABASE_URL, SESSION_SECRET, REDIS_URL, GOOGLE_GEMINI_API_KEY, SENTRY_DSN, ...
COPY --from=deploy /out .

# إنشاء مجلدات الـ logs والتحليل
RUN mkdir -p /srv/logs /srv/analysis_output

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s CMD node -e "fetch('http://127.0.0.1:8080/healthz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "dist/server.js"]
