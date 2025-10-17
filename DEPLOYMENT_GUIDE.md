# دليل النشر - The Copy

## نظرة عامة

يستخدم The Copy استراتيجية نشر حديثة تعتمد على:
- **Firebase Hosting** لاستضافة الواجهات الأربعة
- **Cloud Run** لتشغيل الخدمات الخلفية (Stations API & Jules API)
- **Secret Manager** لإدارة الأسرار
- **GitHub Actions** للنشر التلقائي

## البنية التحتية

### الواجهات (Frontends)
- **Basic Editor** - `/basic-editor/`
- **Drama Analyst** - `/drama-analyst/`
- **Stations** - `/stations/`
- **Multi-Agent Story** - `/multi-agent-story/`

### الخدمات الخلفية (Backend Services)
- **Stations API** - Cloud Run service (`stations-api`)
- **Jules API** - Cloud Run service (`jules-api`)

### توجيه API
- `/api/stations/**` → `stations-api` (Cloud Run)
- `/api/jules/**` → `jules-api` (Cloud Run)

---

## المتطلبات الأساسية

### 1. الأدوات المطلوبة

```bash
# تثبيت pnpm
npm install -g pnpm@10.18.3

# تثبيت Firebase CLI
npm install -g firebase-tools

# تثبيت gcloud CLI
# راجع: https://cloud.google.com/sdk/docs/install
```

### 2. حساب Google Cloud Platform

1. إنشاء مشروع GCP جديد أو استخدام مشروع موجود
2. تفعيل الخدمات المطلوبة:
   - Cloud Run API
   - Secret Manager API
   - Cloud SQL Admin API
   - Artifact Registry API

```bash
gcloud auth login
gcloud config set project <PROJECT_ID>

gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  sqladmin.googleapis.com \
  artifactregistry.googleapis.com
```

### 3. إنشاء Artifact Registry

```bash
gcloud artifacts repositories create the-copy-repo \
  --repository-format=docker \
  --location=europe-west1 \
  --description="The Copy Docker images"
```

---

## إعداد البيئة

### 1. ملفات البيئة المحلية (للتطوير)

#### الجذر (`.env`)
```env
VITE_GEMINI_API_KEY=<your-gemini-api-key>
VITE_SENTRY_DSN=<your-sentry-dsn>
VITE_APP_ENV=production
VITE_ENABLE_ADVANCED_AGENTS=true
VITE_ENABLE_EXTERNAL_PROJECTS=true
```

#### Drama Analyst (`apps/drama-analyst/.env`)
```env
API_KEY=<your-gemini-api-key>
VITE_SENTRY_DSN=<your-sentry-dsn>
VITE_SENTRY_AUTH_TOKEN=<your-sentry-auth-token>
VITE_APP_VERSION=1.0.0
```

#### Stations (`apps/stations/.env`)
```env
DATABASE_URL=postgresql://user:pass@host:5432/stations_db
SESSION_SECRET=<min-32-chars-secret>
REDIS_URL=redis://default:password@host:6379
GOOGLE_GEMINI_API_KEY=<your-gemini-api-key>
NODE_ENV=production
```

#### Jules Backend (`apps/multi-agent-story/backend/.env`)
```env
DATABASE_URL=postgresql://user:pass@host:5432/jules_db
JWT_SECRET=<your-jwt-secret>
REDIS_URL=redis://default:password@host:6379
JULES_GEMINI_API_KEY=<your-gemini-api-key>
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
```

### 2. Secret Manager (الإنتاج)

إنشاء الأسرار في GCP Secret Manager:

```bash
# Stations Secrets
printf 'postgresql://...' | gcloud secrets create STATIONS_DATABASE_URL --data-file=-
printf '<32-chars-min>' | gcloud secrets create STATIONS_SESSION_SECRET --data-file=-
printf 'redis://...' | gcloud secrets create STATIONS_REDIS_URL --data-file=-
printf '<gemini-api-key>' | gcloud secrets create STATIONS_GEMINI_API_KEY --data-file=-

# Jules Secrets
printf 'postgresql://...' | gcloud secrets create JULES_DATABASE_URL --data-file=-
printf '<jwt-secret>' | gcloud secrets create JULES_JWT_SECRET --data-file=-
printf '<gemini-api-key>' | gcloud secrets create JULES_GEMINI_API_KEY --data-file=-

# Shared Secrets
printf '<sentry-dsn>' | gcloud secrets create SENTRY_DSN --data-file=-
```

### 3. قواعد البيانات

#### إنشاء Cloud SQL Instance (اختياري)

```bash
gcloud sql instances create the-copy-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=europe-west1
```

#### تشغيل الترحيلات (Migrations)

```bash
# Stations (Drizzle)
cd apps/stations
pnpm db:push

# Jules (Prisma)
cd apps/multi-agent-story/backend
npx prisma generate
npx prisma migrate deploy
```

---

## عملية البناء والنشر

### البناء المحلي

```bash
# 1. تثبيت التبعيات
pnpm install --frozen-lockfile

# 2. فحص الأنواع
pnpm run type-check

# 3. فحص الكود
pnpm run lint

# 4. اختبار
pnpm run test

# 5. بناء جميع الواجهات وتجميعها
pnpm run web:dist
# ينتج: مجلد web/ يحتوي على:
#   - web/basic-editor/
#   - web/drama-analyst/
#   - web/stations/
#   - web/multi-agent-story/
```

### بناء ونشر صور Docker

#### Stations API

```bash
# البناء
docker build -f apps/stations/Dockerfile \
  -t europe-west1-docker.pkg.dev/<PROJECT_ID>/the-copy-repo/stations-api:$(git rev-parse --short HEAD) .

# الدفع
docker push europe-west1-docker.pkg.dev/<PROJECT_ID>/the-copy-repo/stations-api:$(git rev-parse --short HEAD)

# النشر إلى Cloud Run
gcloud run deploy stations-api \
  --image=europe-west1-docker.pkg.dev/<PROJECT_ID>/the-copy-repo/stations-api:$(git rev-parse --short HEAD) \
  --platform=managed \
  --region=europe-west1 \
  --allow-unauthenticated \
  --cpu=1 \
  --memory=512Mi \
  --max-instances=20 \
  --min-instances=0 \
  --set-env-vars=NODE_ENV=production,PORT=8080,ALLOWED_ORIGIN=https://<YOUR_DOMAIN> \
  --set-secrets=DATABASE_URL=STATIONS_DATABASE_URL:latest,SESSION_SECRET=STATIONS_SESSION_SECRET:latest,REDIS_URL=STATIONS_REDIS_URL:latest,GOOGLE_GEMINI_API_KEY=STATIONS_GEMINI_API_KEY:latest,SENTRY_DSN=SENTRY_DSN:latest
```

#### Jules API

```bash
# البناء
docker build -f apps/multi-agent-story/backend/Dockerfile \
  -t europe-west1-docker.pkg.dev/<PROJECT_ID>/the-copy-repo/jules-api:$(git rev-parse --short HEAD) .

# الدفع
docker push europe-west1-docker.pkg.dev/<PROJECT_ID>/the-copy-repo/jules-api:$(git rev-parse --short HEAD)

# النشر إلى Cloud Run
gcloud run deploy jules-api \
  --image=europe-west1-docker.pkg.dev/<PROJECT_ID>/the-copy-repo/jules-api:$(git rev-parse --short HEAD) \
  --platform=managed \
  --region=europe-west1 \
  --allow-unauthenticated \
  --cpu=1 \
  --memory=512Mi \
  --max-instances=20 \
  --min-instances=0 \
  --set-env-vars=NODE_ENV=production,PORT=8080,ALLOWED_ORIGIN=https://<YOUR_DOMAIN> \
  --set-secrets=DATABASE_URL=JULES_DATABASE_URL:latest,JWT_SECRET=JULES_JWT_SECRET:latest,REDIS_URL=STATIONS_REDIS_URL:latest,JULES_GEMINI_API_KEY=JULES_GEMINI_API_KEY:latest,SENTRY_DSN=SENTRY_DSN:latest
```

### نشر Firebase Hosting

```bash
firebase login
firebase use <PROJECT_ID>
firebase deploy --only hosting
```

---

## النشر التلقائي (CI/CD)

### إعداد GitHub Secrets

في إعدادات المستودع على GitHub، أضف الأسرار التالية:

1. **GCP_PROJECT_ID** - معرف مشروع GCP
2. **GCP_SA_KEY** - مفتاح حساب الخدمة (JSON) بالصلاحيات:
   - Artifact Registry Admin
   - Cloud Run Admin
   - Secret Manager Secret Accessor
   - Firebase Admin
3. **FIREBASE_HOSTING_DOMAIN** - النطاق الخاص بك (مثل: `the-copy.web.app`)

### إنشاء حساب خدمة (Service Account)

```bash
# إنشاء حساب الخدمة
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Service Account"

# منح الصلاحيات
PROJECT_ID=$(gcloud config get-value project)
SA_EMAIL="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/artifactregistry.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/secretmanager.secretAccessor"

# إنشاء مفتاح JSON
gcloud iam service-accounts keys create key.json \
  --iam-account=${SA_EMAIL}

# انسخ محتوى key.json وأضفه كسر GCP_SA_KEY في GitHub
```

### سير العمل (Workflow)

الملف `.github/workflows/deploy.yml` يقوم بـ:

1. ✅ تثبيت التبعيات
2. ✅ فحص الأنواع (Type-check)
3. ✅ فحص الكود (Lint)
4. ✅ اختبار (Test)
5. 🏗️ بناء الواجهات
6. 🐳 بناء ودفع صور Docker
7. ☁️ نشر Cloud Run services
8. 🔥 نشر Firebase Hosting

يتم تشغيل السير تلقائيًا عند:
- Push إلى فرع `main`
- يمكن تشغيله يدويًا عبر GitHub UI

---

## التحقق من النشر

### 1. فحص Cloud Run Services

```bash
# الحصول على URLs
gcloud run services list --region=europe-west1

# فحص Stations API
curl -I https://stations-api-xxx.run.app/healthz

# فحص Jules API
curl -I https://jules-api-xxx.run.app/healthz
```

### 2. فحص Firebase Hosting

```bash
# فتح الموقع
firebase open hosting:site

# اختبار المسارات
curl -I https://<YOUR_DOMAIN>/basic-editor/
curl -I https://<YOUR_DOMAIN>/drama-analyst/
curl -I https://<YOUR_DOMAIN>/stations/
curl -I https://<YOUR_DOMAIN>/multi-agent-story/

# اختبار توجيه API
curl -I https://<YOUR_DOMAIN>/api/stations/health
curl -I https://<YOUR_DOMAIN>/api/jules/health
```

---

## استكشاف الأخطاء

### مشاكل البناء

```bash
# تنظيف الكاش
pnpm clean:all
pnpm install --frozen-lockfile

# فحص الأخطاء المحددة
pnpm run type-check
pnpm run lint
```

### مشاكل Docker

```bash
# فحص السجلات المحلية
docker logs <container-id>

# اختبار الصورة محليًا
docker run -p 8080:8080 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  europe-west1-docker.pkg.dev/<PROJECT_ID>/the-copy-repo/stations-api:latest
```

### مشاكل Cloud Run

```bash
# عرض السجلات
gcloud run services logs read stations-api --region=europe-west1

# وصف الخدمة
gcloud run services describe stations-api --region=europe-west1

# تحديث الخدمة
gcloud run services update stations-api \
  --region=europe-west1 \
  --set-env-vars=NEW_VAR=value
```

### مشاكل Firebase Hosting

```bash
# عرض السجلات
firebase hosting:sites:list

# معاينة قبل النشر
firebase hosting:channel:deploy preview

# التراجع عن نشر
firebase hosting:clone <SOURCE_SITE_ID>:<SOURCE_CHANNEL> <TARGET_SITE_ID>:<TARGET_CHANNEL>
```

---

## التراجع عن النشر (Rollback)

### Cloud Run

```bash
# عرض المراجعات
gcloud run revisions list --service=stations-api --region=europe-west1

# التراجع إلى مراجعة سابقة
gcloud run services update-traffic stations-api \
  --region=europe-west1 \
  --to-revisions=<REVISION_NAME>=100
```

### Firebase Hosting

```bash
# عرض الإصدارات
firebase hosting:versions:list

# التراجع
firebase hosting:rollback
```

---

## الأمان والمراقبة

### 1. الأمان

- ✅ HTTPS إجباري (تلقائي عبر Firebase & Cloud Run)
- ✅ CORS مضبوط بدقة
- ✅ Rate Limiting مفعّل (600 requests/min)
- ✅ Helmet headers للحماية
- ✅ أسرار محمية عبر Secret Manager

### 2. المراقبة

- 📊 **Sentry** للأخطاء والأداء
- 📝 **Cloud Logging** للسجلات
- 💓 **Health Checks** على `/healthz`
- 📈 **Cloud Monitoring** للمتريكات

### 3. النسخ الاحتياطي

- 🗄️ Cloud SQL automatic backups (إن استخدمت)
- 📁 نسخ احتياطي دورية لقواعد البيانات
- 🔄 Git history لجميع التعليمات البرمجية

---

## الموارد والمراجع

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Cloud Run Docs](https://cloud.google.com/run/docs)
- [Secret Manager Docs](https://cloud.google.com/secret-manager/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Dockerfile Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

## التواصل والدعم

للحصول على المساعدة:
1. راجع ملف [CLAUDE.md](CLAUDE.md) للتفاصيل التقنية
2. راجع ملف [PRODUCTION_READINESS_REPORT.md](PRODUCTION_READINESS_REPORT.md)
3. افتح Issue في GitHub
4. تواصل مع فريق التطوير

---

**آخر تحديث:** 2025-10-17
**الإصدار:** 1.0.0
