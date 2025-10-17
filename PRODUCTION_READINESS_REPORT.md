
---

# خيار A — Firebase Hosting + Cloud Run (Docker) للخدمات الخلفية

## 0) معايير النجاح

* بناء وتشغيل: `pnpm run build:all` و`pnpm run verify:all` دون أخطاء.
* أربع واجهات تعمل على نطاق Firebase تحت:

  * `/basic-editor`, `/drama-analyst`, `/stations`, `/multi-agent-story`
* توجيه API:

  * `/api/stations/**` → خدمة Cloud Run: `stations-api`
  * `/api/jules/**` → خدمة Cloud Run: `jules-api`
* أسرار الإنتاج عبر **Secret Manager**، وCORS مضبوط، وRate Limiting مفعل.
* Health checks، Sentry، وسجلات منظمة (Pino/Winston).
* وثائق تشغيل ونشر وRollback.

---

## 1) Assemble — التحضير

### 1.1 تثبيت الأدوات

```bash
corepack enable
corepack prepare pnpm@10.18.3 --activate
pnpm --version
npm i -g firebase-tools
```

### 1.2 إعداد ملفات البيئة (للتطوير فقط؛ الإنتاج عبر Secret Manager)

* `./.env` (جذر):

```
VITE_GEMINI_API_KEY=...
VITE_SENTRY_DSN=...
VITE_APP_ENV=production
VITE_ENABLE_ADVANCED_AGENTS=true
VITE_ENABLE_EXTERNAL_PROJECTS=true
```

* `apps/drama-analyst/.env`:

```
API_KEY=...
VITE_SENTRY_DSN=...
VITE_SENTRY_AUTH_TOKEN=...
VITE_APP_VERSION=1.0.0
```

* `apps/stations/.env`:

```
DATABASE_URL=postgresql://user:pass@host:5432/stations_db
SESSION_SECRET=change_me_min_32_chars
REDIS_URL=redis://...
GOOGLE_GEMINI_API_KEY=...
NODE_ENV=production
```

* `apps/multi-agent-story/backend/.env` (موجود—حدّث القيم).

### 1.3 إعداد GCP

```bash
gcloud auth login
gcloud config set project <PROJECT_ID>
gcloud services enable run.googleapis.com secretmanager.googleapis.com sqladmin.googleapis.com artifactregistry.googleapis.com
gcloud artifacts repositories create the-copy-repo --repository-format=docker --location=europe-west1
```

### 1.4 أسرار الإنتاج (Secret Manager)

أنشئ الأسرار التالية (أسماء واضحة لتعيينها لاحقًا في Cloud Run):

```
STATIONS_DATABASE_URL
STATIONS_SESSION_SECRET
STATIONS_REDIS_URL
STATIONS_GEMINI_API_KEY
JULES_DATABASE_URL
JULES_JWT_SECRET
JULES_GEMINI_API_KEY
SENTRY_DSN
```

أمثلة:

```bash
printf 'postgresql://...' | gcloud secrets create STATIONS_DATABASE_URL --data-file=-
printf 'change_me_32_chars_min' | gcloud secrets create STATIONS_SESSION_SECRET --data-file=-
# وهكذا لباقي الأسرار...
```

### 1.5 قواعد البيانات

* استخدم **Cloud SQL (PostgreSQL)** أو موفر خارجي.
* ترحيل المخططات:

```bash
# Stations (Drizzle)
cd apps/stations
pnpm db:push

# Jules (Prisma)
cd ../multi-agent-story/backend
npx prisma generate
npx prisma migrate deploy
```

* **Redis**: استخدم Memorystore أو Upstash، وحدّث `REDIS_URL`.

---

## 2) Grade — الجودة والاختبارات

```bash
pnpm install --frozen-lockfile
pnpm run type-check
pnpm run lint
pnpm run test
```

* حدّث الاختبارات الحرجة وفعّل تغطية ≥ 75% كحد أدنى.

---

## 3) Mix — إعداد الحاويات (Docker) للخدمات الخلفية

### 3.1 Dockerfile — Stations (Express + Drizzle)

ضع الملف في: `apps/stations/Dockerfile`

```Dockerfile
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
RUN pnpm -w --filter ./apps/stations deploy --prod /out

# -------- Runtime --------
FROM node:20-slim
WORKDIR /srv
ENV NODE_ENV=production PORT=8080
# متغيّرات ستُحقن من Cloud Run عبر Secret Manager
# DATABASE_URL, SESSION_SECRET, REDIS_URL, GOOGLE_GEMINI_API_KEY, SENTRY_DSN, ...
COPY --from=deploy /out .
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s CMD node -e "fetch('http://127.0.0.1:8080/healthz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node","dist/server.js"]
```

### 3.2 Dockerfile — Jules (Fastify + Prisma + BullMQ)

ضع الملف في: `apps/multi-agent-story/backend/Dockerfile`

```Dockerfile
# -------- Base Deps --------
FROM node:20-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/multi-agent-story/backend/package.json apps/multi-agent-story/backend/
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
RUN pnpm -w --filter ./apps/multi-agent-story/backend deploy --prod /out

# -------- Runtime --------
FROM node:20-slim
WORKDIR /srv
ENV NODE_ENV=production PORT=8080
# JULES_DATABASE_URL, JULES_JWT_SECRET, JULES_GEMINI_API_KEY, SENTRY_DSN, REDIS_URL ...
COPY --from=deploy /out .
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s CMD node -e "fetch('http://127.0.0.1:8080/healthz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node","dist/server.js"]
```

### 3.3 CORS وRate Limiting (مقتطفات)

* **Express/Stations**:

```ts
// apps/stations/src/server.ts
import rateLimit from "express-rate-limit";
import cors from "cors";

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN?.split(",") ?? [], credentials: true }));
app.use(rateLimit({ windowMs: 60_000, max: 600 })); // 10 rps تقريبًا
app.get("/healthz", (_,res)=>res.status(200).send("ok"));
```

* **Fastify/Jules**:

```ts
// apps/multi-agent-story/backend/src/server.ts
import cors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";

await app.register(cors, { origin: process.env.ALLOWED_ORIGIN?.split(",") ?? [] });
await app.register(fastifyRateLimit, { max: 600, timeWindow: "1 minute" });
app.get("/healthz", async ()=> "ok");
```

---

## 4) Render — التجميع، إعادة كتابة المسارات، والنشر

### 4.1 تجميع الواجهات الأربع في مجلد واحد للنشر

أنشئ سكربت تجميع بسيط (Node) في `tools/assemble-web.mjs`:

```js
import { cpSync, rmSync, mkdirSync } from "fs";
import { join } from "path";

const root = process.cwd();
const out = join(root, "web");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const apps = [
  ["apps/basic-editor/dist", "basic-editor"],
  ["apps/drama-analyst/dist", "drama-analyst"],
  ["apps/stations/dist", "stations"],
  ["apps/multi-agent-story/dist", "multi-agent-story"]
];

for (const [src, name] of apps) {
  cpSync(join(root, src), join(out, name), { recursive: true });
}
console.log("Assembled web/ with 4 apps.");
```

أضف إلى `package.json` (الجذر):

```json
{
  "scripts": {
    "build:all": "pnpm -r build",
    "web:assemble": "node tools/assemble-web.mjs",
    "web:dist": "pnpm run build:all && pnpm run web:assemble"
  }
}
```

### 4.2 إعداد Firebase Hosting لإيواء المجلد الموحّد ومسارات الـ API

* `.firebaserc`:

```json
{
  "projects": {
    "default": "<YOUR_PROJECT_ID>"
  }
}
```

* `firebase.json` (موقع واحد، “public”: "web"):

```json
{
  "hosting": {
    "public": "web",
    "ignore": ["**/.*", "**/node_modules/**"],
    "headers": [
      {
        "source": "**",
        "headers": [
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [{ "key": "Cache-Control", "value": "public,max-age=31536000,immutable" }]
      }
    ],
    "rewrites": [
      { "source": "/api/stations/**", "run": { "serviceId": "stations-api", "region": "europe-west1" } },
      { "source": "/api/jules/**", "run": { "serviceId": "jules-api", "region": "europe-west1" } },
      { "source": "/basic-editor/**", "destination": "/basic-editor/index.html" },
      { "source": "/drama-analyst/**", "destination": "/drama-analyst/index.html" },
      { "source": "/stations/**", "destination": "/stations/index.html" },
      { "source": "/multi-agent-story/**", "destination": "/multi-agent-story/index.html" }
    ]
  }
}
```

> المبدأ: نبني كل واجهة إلى `dist/` خاصتها ثم نجمعها في `web/<app>`، ونستخدم **rewrites** لتوجيه `/api/*` نحو Cloud Run.

### 4.3 نشر الواجهات

```bash
pnpm run web:dist
firebase login
firebase use <YOUR_PROJECT_ID>
firebase deploy --only hosting
```

---

## 5) Export — نشر Cloud Run والربط بالأسرار

### 5.1 بناء ودفع صور Docker إلى Artifact Registry

```bash
# من جذر المستودع
# Stations
docker build -f apps/stations/Dockerfile -t europe-west1-docker.pkg.dev/<PROJECT_ID>/the-copy-repo/stations-api:$(git rev-parse --short HEAD) .
docker push europe-west1-docker.pkg.dev/<PROJECT_ID>/the-copy-repo/stations-api:$(git rev-parse --short HEAD)

# Jules
docker build -f apps/multi-agent-story/backend/Dockerfile -t europe-west1-docker.pkg.dev/<PROJECT_ID>/the-copy-repo/jules-api:$(git rev-parse --short HEAD) .
docker push europe-west1-docker.pkg.dev/<PROJECT_ID>/the-copy-repo/jules-api:$(git rev-parse --short HEAD)
```

### 5.2 نشر إلى Cloud Run مع ربط الأسرار

```bash
# Stations
gcloud run deploy stations-api \
  --image=europe-west1-docker.pkg.dev/<PROJECT_ID>/the-copy-repo/stations-api:$(git rev-parse --short HEAD) \
  --platform=managed --region=europe-west1 --allow-unauthenticated \
  --cpu=1 --memory=512Mi --max-instances=20 --min-instances=0 \
  --set-env-vars=NODE_ENV=production,PORT=8080 \
  --set-env-vars=ALLOWED_ORIGIN=https://<YOUR_FIREBASE_HOSTING_DOMAIN> \
  --set-secrets=DATABASE_URL=STATIONS_DATABASE_URL:latest,SESSION_SECRET=STATIONS_SESSION_SECRET:latest,REDIS_URL=STATIONS_REDIS_URL:latest,GOOGLE_GEMINI_API_KEY=STATIONS_GEMINI_API_KEY:latest,SENTRY_DSN=SENTRY_DSN:latest

# Jules
gcloud run deploy jules-api \
  --image=europe-west1-docker.pkg.dev/<PROJECT_ID>/the-copy-repo/jules-api:$(git rev-parse --short HEAD) \
  --platform=managed --region=europe-west1 --allow-unauthenticated \
  --cpu=1 --memory=512Mi --max-instances=20 --min-instances=0 \
  --set-env-vars=NODE_ENV=production,PORT=8080 \
  --set-env-vars=ALLOWED_ORIGIN=https://<YOUR_FIREBASE_HOSTING_DOMAIN> \
  --set-secrets=DATABASE_URL=JULES_DATABASE_URL:latest,JWТ_SECRET=JULES_JWT_SECRET:latest,REDIS_URL=STATIONS_REDIS_URL:latest,JULES_GEMINI_API_KEY=JULES_GEMINI_API_KEY:latest,SENTRY_DSN=SENTRY_DSN:latest
```

> ملاحظة: استخدم نفس Redis إن رغبت (أعدل اسم السر)، أو أنشئ سراً منفصلاً لـ Jules.

### 5.3 التحقق السريع

```bash
curl -I https://<cloud-run-domain>/healthz
curl -I https://<your-firebase-domain>/api/stations/healthz
curl -I https://<your-firebase-domain>/api/jules/healthz
```

---

## 6) CI/CD — GitHub Actions (بناء + نشر تلقائي)

أنشئ `.github/workflows/deploy.yml`:

```yaml
name: Deploy (Cloud Run + Firebase)

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    env:
      PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
      REGION: europe-west1
      REPO: the-copy-repo
      SHA: ${{ github.sha }}

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node & pnpm
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: corepack enable && corepack prepare pnpm@10.18.3 --activate

      - name: Install deps
        run: pnpm install --frozen-lockfile

      - name: Type-check + Lint + Test
        run: |
          pnpm run type-check
          pnpm run lint
          pnpm run test

      - name: Build frontends
        run: pnpm run web:dist

      - name: Set up gcloud
        uses: google-github-actions/setup-gcloud@v2
        with:
          project_id: ${{ env.PROJECT_ID }}
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          export_default_credentials: true

      - name: Configure Docker auth
        run: gcloud auth configure-docker europe-west1-docker.pkg.dev --quiet

      - name: Build & Push Stations image
        run: |
          docker build -f apps/stations/Dockerfile -t europe-west1-docker.pkg.dev/${PROJECT_ID}/${REPO}/stations-api:${SHA::7} .
          docker push europe-west1-docker.pkg.dev/${PROJECT_ID}/${REPO}/stations-api:${SHA::7}

      - name: Build & Push Jules image
        run: |
          docker build -f apps/multi-agent-story/backend/Dockerfile -t europe-west1-docker.pkg.dev/${PROJECT_ID}/${REPO}/jules-api:${SHA::7} .
          docker push europe-west1-docker.pkg.dev/${PROJECT_ID}/${REPO}/jules-api:${SHA::7}

      - name: Deploy Stations to Cloud Run
        run: |
          gcloud run deploy stations-api \
            --image=europe-west1-docker.pkg.dev/${PROJECT_ID}/${REPO}/stations-api:${SHA::7} \
            --platform=managed --region=${{ env.REGION }} --allow-unauthenticated \
            --set-env-vars=NODE_ENV=production,PORT=8080,ALLOWED_ORIGIN=https://$HOSTING_DOMAIN \
            --set-secrets=DATABASE_URL=STATIONS_DATABASE_URL:latest,SESSION_SECRET=STATIONS_SESSION_SECRET:latest,REDIS_URL=STATIONS_REDIS_URL:latest,GOOGLE_GEMINI_API_KEY=STATIONS_GEMINI_API_KEY:latest,SENTRY_DSN=SENTRY_DSN:latest
        env:
          HOSTING_DOMAIN: ${{ secrets.FIREBASE_HOSTING_DOMAIN }}

      - name: Deploy Jules to Cloud Run
        run: |
          gcloud run deploy jules-api \
            --image=europe-west1-docker.pkg.dev/${PROJECT_ID}/${REPO}/jules-api:${SHA::7} \
            --platform=managed --region=${{ env.REGION }} --allow-unauthenticated \
            --set-env-vars=NODE_ENV=production,PORT=8080,ALLOWED_ORIGIN=https://$HOSTING_DOMAIN \
            --set-secrets=DATABASE_URL=JULES_DATABASE_URL:latest,JWТ_SECRET=JULES_JWT_SECRET:latest,REDIS_URL=STATIONS_REDIS_URL:latest,JULES_GEMINI_API_KEY=JULES_GEMINI_API_KEY:latest,SENTRY_DSN=SENTRY_DSN:latest
        env:
          HOSTING_DOMAIN: ${{ secrets.FIREBASE_HOSTING_DOMAIN }}

      - name: Deploy Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.GCP_SA_KEY }}'
          projectId: '${{ env.PROJECT_ID }}'
          channelId: live
```

> أسرار لازمة في GitHub:
> `GCP_PROJECT_ID`, `GCP_SA_KEY` (JSON لخدمة الحساب بصلاحيات Artifact Registry, Cloud Run Admin, Secret Manager Access, Firebase Admin), و`FIREBASE_HOSTING_DOMAIN`.

---

## 7) الأمن والمراقبة

* **HTTPS**: تلقائيًا عبر Firebase Hosting وCloud Run. فعّل HSTS عبر رؤوس Hosting.
* **CSP**: أضِف سياسة محافظة في `firebase.json` إن لزم.
* **Sentry**: فعّل DSN في الواجهات والخلفيات.
* **Logs**: استخدم Pino (Jules) وWinston (Stations) بمستويات `info/error`، وتصديرها إلى Cloud Logging.
* **Healthz**: نقاط `/healthz` مُفعّلة في الخدمتين.
* **Backups**: فعّل نسخًا احتياطيًا يوميًا لـ Cloud SQL (PITR إن أمكن)، ووثّق إجراء الاستعادة.

---

## 8) تسلسل التنفيذ السريع (يدوي)

```bash
# A) إعداد
corepack enable
corepack prepare pnpm@10.18.3 --activate
pnpm install --frozen-lockfile

# B) قواعد البيانات
cd apps/stations && pnpm db:push
cd ../multi-agent-story/backend && npx prisma generate && npx prisma migrate deploy

# C) بناء وتجميع الواجهات
cd ../../..
pnpm run web:dist

# D) بناء ودفع الحاويات
docker build -f apps/stations/Dockerfile -t europe-west1-docker.pkg.dev/<PROJECT_ID>/the-copy-repo/stations-api:$(git rev-parse --short HEAD) .
docker push  europe-west1-docker.pkg.dev/<PROJECT_ID>/the-copy-repo/stations-api:$(git rev-parse --short HEAD)

docker build -f apps/multi-agent-story/backend/Dockerfile -t europe-west1-docker.pkg.dev/<PROJECT_ID>/the-copy-repo/jules-api:$(git rev-parse --short HEAD) .
docker push  europe-west1-docker.pkg.dev/<PROJECT_ID>/the-copy-repo/jules-api:$(git rev-parse --short HEAD)

# E) نشر Cloud Run (مع ربط الأسرار)
# (الأوامر مذكورة في قسم 5.2)

# F) نشر Firebase Hosting
firebase login
firebase use <PROJECT_ID>
firebase deploy --only hosting
```

---
