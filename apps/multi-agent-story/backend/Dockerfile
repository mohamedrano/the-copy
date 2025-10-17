# -------- Base Deps --------
FROM node:20-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/multi-agent-story/backend/package.json apps/multi-agent-story/backend/
COPY apps/multi-agent-story/backend/prisma ./apps/multi-agent-story/backend/prisma
COPY packages/*/package.json packages/*/

RUN pnpm install --frozen-lockfile

# -------- Build --------
FROM deps AS build
COPY . .
# Prisma generate قبل البناء
WORKDIR /app/apps/multi-agent-story/backend
RUN npx prisma generate
WORKDIR /app
RUN pnpm -w --filter ./apps/multi-agent-story/backend build

# -------- Deploy Pack --------
FROM deps AS deploy
COPY --from=build /app .
WORKDIR /app/apps/multi-agent-story/backend
RUN npx prisma generate
WORKDIR /app
RUN pnpm -w --filter ./apps/multi-agent-story/backend deploy --prod /out

# -------- Runtime --------
FROM node:20-slim
WORKDIR /srv
ENV NODE_ENV=production PORT=8080
# JULES_DATABASE_URL, JULES_JWT_SECRET, JULES_GEMINI_API_KEY, SENTRY_DSN, REDIS_URL ...

# تثبيت openssl للـ Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=deploy /out .

# نسخ ملفات Prisma المولدة
COPY --from=build /app/apps/multi-agent-story/backend/node_modules/.prisma /srv/node_modules/.prisma

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s CMD node -e "fetch('http://127.0.0.1:8080/healthz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "dist/server.js"]
