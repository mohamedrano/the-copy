# دليل النشر السريع - The Copy

## ✅ ملخص ما تم تنفيذه

تم تنفيذ جميع متطلبات خيار A (Firebase Hosting + Cloud Run) بنجاح:

### 1. البنية التحتية
- ✅ تجهيز pnpm 10.18.3
- ✅ سكربت تجميع الواجهات (`tools/assemble-web.mjs`)
- ✅ تحديث `package.json` بالسكربتات المطلوبة
- ✅ Dockerfile لـ Stations (Express + Drizzle)
- ✅ Dockerfile لـ Jules (Fastify + Prisma)

### 2. الأمان
- ✅ CORS مضبوط في Stations
- ✅ CORS مضبوط في Jules
- ✅ Rate Limiting مفعّل في كلا الخدمتين
- ✅ نقاط `/healthz` للفحص الصحي

### 3. التكوين
- ✅ `.firebaserc` (مشروع: the-copy-production)
- ✅ `firebase.json` بتوجيه API والواجهات
- ✅ GitHub Actions workflow (`.github/workflows/deploy.yml`)

### 4. التوثيق
- ✅ دليل النشر الشامل ([DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md))

---

## 🚀 خطوات النشر السريع

### المرحلة 1: إعداد GCP (مرة واحدة)

```bash
# 1. تسجيل الدخول وتحديد المشروع
gcloud auth login
gcloud config set project the-copy-production

# 2. تفعيل الخدمات
gcloud services enable run.googleapis.com secretmanager.googleapis.com artifactregistry.googleapis.com

# 3. إنشاء Artifact Registry
gcloud artifacts repositories create the-copy-repo \
  --repository-format=docker \
  --location=europe-west1

# 4. إنشاء الأسرار (غيّر القيم)
printf 'postgresql://...' | gcloud secrets create STATIONS_DATABASE_URL --data-file=-
printf 'change_me_32_chars' | gcloud secrets create STATIONS_SESSION_SECRET --data-file=-
printf 'redis://...' | gcloud secrets create STATIONS_REDIS_URL --data-file=-
printf 'your-gemini-key' | gcloud secrets create STATIONS_GEMINI_API_KEY --data-file=-
printf 'postgresql://...' | gcloud secrets create JULES_DATABASE_URL --data-file=-
printf 'your-jwt-secret' | gcloud secrets create JULES_JWT_SECRET --data-file=-
printf 'your-gemini-key' | gcloud secrets create JULES_GEMINI_API_KEY --data-file=-
printf 'your-sentry-dsn' | gcloud secrets create SENTRY_DSN --data-file=-
```

### المرحلة 2: إعداد قواعد البيانات

```bash
# Stations
cd apps/stations
pnpm db:push

# Jules
cd ../multi-agent-story/backend
npx prisma generate
npx prisma migrate deploy
```

### المرحلة 3: البناء والنشر المحلي

```bash
# من جذر المشروع
cd /home/user/the-copy

# 1. بناء الواجهات
pnpm install --frozen-lockfile
pnpm run web:dist

# 2. بناء Stations API
docker build -f apps/stations/Dockerfile \
  -t europe-west1-docker.pkg.dev/the-copy-production/the-copy-repo/stations-api:v1 .
docker push europe-west1-docker.pkg.dev/the-copy-production/the-copy-repo/stations-api:v1

# 3. نشر Stations
gcloud run deploy stations-api \
  --image=europe-west1-docker.pkg.dev/the-copy-production/the-copy-repo/stations-api:v1 \
  --platform=managed --region=europe-west1 --allow-unauthenticated \
  --cpu=1 --memory=512Mi --max-instances=20 --min-instances=0 \
  --set-env-vars=NODE_ENV=production,PORT=8080 \
  --set-secrets=DATABASE_URL=STATIONS_DATABASE_URL:latest,SESSION_SECRET=STATIONS_SESSION_SECRET:latest,REDIS_URL=STATIONS_REDIS_URL:latest,GOOGLE_GEMINI_API_KEY=STATIONS_GEMINI_API_KEY:latest,SENTRY_DSN=SENTRY_DSN:latest

# 4. بناء Jules API
docker build -f apps/multi-agent-story/backend/Dockerfile \
  -t europe-west1-docker.pkg.dev/the-copy-production/the-copy-repo/jules-api:v1 .
docker push europe-west1-docker.pkg.dev/the-copy-production/the-copy-repo/jules-api:v1

# 5. نشر Jules
gcloud run deploy jules-api \
  --image=europe-west1-docker.pkg.dev/the-copy-production/the-copy-repo/jules-api:v1 \
  --platform=managed --region=europe-west1 --allow-unauthenticated \
  --cpu=1 --memory=512Mi --max-instances=20 --min-instances=0 \
  --set-env-vars=NODE_ENV=production,PORT=8080 \
  --set-secrets=DATABASE_URL=JULES_DATABASE_URL:latest,JWT_SECRET=JULES_JWT_SECRET:latest,REDIS_URL=STATIONS_REDIS_URL:latest,JULES_GEMINI_API_KEY=JULES_GEMINI_API_KEY:latest,SENTRY_DSN=SENTRY_DSN:latest

# 6. نشر Firebase Hosting
firebase login
firebase use the-copy-production
firebase deploy --only hosting
```

### المرحلة 4: إعداد CI/CD (مرة واحدة)

```bash
# 1. إنشاء حساب خدمة
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# 2. منح الصلاحيات
SA_EMAIL="github-actions@the-copy-production.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding the-copy-production \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding the-copy-production \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/artifactregistry.admin"

gcloud projects add-iam-policy-binding the-copy-production \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/secretmanager.secretAccessor"

# 3. إنشاء مفتاح
gcloud iam service-accounts keys create key.json --iam-account=${SA_EMAIL}

# 4. أضف في GitHub Secrets:
# - GCP_PROJECT_ID: the-copy-production
# - GCP_SA_KEY: (محتوى key.json)
# - FIREBASE_HOSTING_DOMAIN: the-copy-production.web.app
```

---

## 🔍 التحقق

```bash
# 1. فحص Cloud Run
gcloud run services list --region=europe-west1
curl -I https://stations-api-xxx.run.app/healthz
curl -I https://jules-api-xxx.run.app/healthz

# 2. فحص Firebase Hosting
curl -I https://the-copy-production.web.app/basic-editor/
curl -I https://the-copy-production.web.app/drama-analyst/
curl -I https://the-copy-production.web.app/stations/
curl -I https://the-copy-production.web.app/multi-agent-story/

# 3. فحص توجيه API
curl -I https://the-copy-production.web.app/api/stations/health
curl -I https://the-copy-production.web.app/api/jules/health
```

---

## 📝 الملفات المنشأة/المعدلة

1. **أدوات البناء:**
   - `tools/assemble-web.mjs` - سكربت تجميع الواجهات
   - `package.json` - سكربتات `web:assemble` و `web:dist`

2. **Docker:**
   - `apps/stations/Dockerfile` - حاوية Stations API
   - `apps/multi-agent-story/backend/Dockerfile` - حاوية Jules API

3. **الأمان:**
   - `apps/stations/server/routes/health.ts` - نقطة `/healthz`
   - `apps/multi-agent-story/backend/src/server.ts` - نقطة `/healthz`

4. **Firebase:**
   - `.firebaserc` - تكوين المشروع
   - `firebase.json` - توجيه Hosting والـ API

5. **CI/CD:**
   - `.github/workflows/deploy.yml` - سير عمل النشر التلقائي

6. **التوثيق:**
   - `DEPLOYMENT_GUIDE.md` - دليل شامل
   - `QUICK_DEPLOY.md` - هذا الملف

---

## ⚠️ ملاحظات مهمة

1. **قبل النشر الأول:**
   - تأكد من إنشاء جميع الأسرار في Secret Manager
   - قم بتشغيل الترحيلات لقواعد البيانات
   - حدّث `ALLOWED_ORIGIN` في متغيرات Cloud Run

2. **الأمان:**
   - لا تضع أسرار حقيقية في ملفات `.env`
   - استخدم Secret Manager للإنتاج فقط
   - راجع CORS origins في كل خدمة

3. **التكلفة:**
   - Cloud Run: مجاني حتى حد معين
   - Firebase Hosting: مجاني حتى 10GB/شهر
   - راقب الاستخدام عبر GCP Console

---

## 🆘 حل المشاكل الشائعة

### الخطأ: "Permission denied"
```bash
# تحقق من صلاحيات حساب الخدمة
gcloud projects get-iam-policy the-copy-production
```

### الخطأ: "Secret not found"
```bash
# تحقق من الأسرار
gcloud secrets list
```

### الخطأ: Docker build fails
```bash
# تنظيف الكاش
docker system prune -a
pnpm clean:all && pnpm install
```

---

## 📚 المراجع

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - الدليل الشامل
- [CLAUDE.md](CLAUDE.md) - البنية التقنية
- [PRODUCTION_READINESS_REPORT.md](PRODUCTION_READINESS_REPORT.md) - التقرير الكامل

---

**جاهز للنشر!** 🚀
