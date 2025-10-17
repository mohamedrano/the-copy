# ✅ قائمة التحقق من النشر - The Copy

## مرحلة 1: الإعداد الأولي (مرة واحدة)

### GCP Setup
- [ ] تسجيل دخول GCP: `gcloud auth login`
- [ ] تحديد المشروع: `gcloud config set project the-copy-production`
- [ ] تفعيل APIs:
  - [ ] Cloud Run
  - [ ] Secret Manager
  - [ ] Artifact Registry
- [ ] إنشاء Artifact Registry: `gcloud artifacts repositories create the-copy-repo`

### Secrets (Secret Manager)
- [ ] STATIONS_DATABASE_URL
- [ ] STATIONS_SESSION_SECRET (32+ chars)
- [ ] STATIONS_REDIS_URL
- [ ] STATIONS_GEMINI_API_KEY
- [ ] JULES_DATABASE_URL
- [ ] JULES_JWT_SECRET (32+ chars)
- [ ] JULES_GEMINI_API_KEY
- [ ] SENTRY_DSN

### قواعد البيانات
- [ ] إنشاء PostgreSQL instances (Stations & Jules)
- [ ] إعداد Redis instance
- [ ] تشغيل Stations migrations: `cd apps/stations && pnpm db:push`
- [ ] تشغيل Jules migrations: `cd apps/multi-agent-story/backend && npx prisma migrate deploy`

---

## مرحلة 2: النشر المحلي

### البناء
- [ ] تثبيت التبعيات: `pnpm install --frozen-lockfile`
- [ ] Type-check: `pnpm run type-check`
- [ ] Lint: `pnpm run lint`
- [ ] Test: `pnpm run test`
- [ ] بناء الواجهات: `pnpm run web:dist`

### Stations API
- [ ] بناء Docker image:
  ```bash
  docker build -f apps/stations/Dockerfile \
    -t europe-west1-docker.pkg.dev/the-copy-production/the-copy-repo/stations-api:v1 .
  ```
- [ ] دفع الصورة: `docker push ...`
- [ ] نشر Cloud Run:
  ```bash
  gcloud run deploy stations-api \
    --image=... \
    --region=europe-west1 \
    --set-secrets=...
  ```
- [ ] اختبار: `curl -I https://stations-api-xxx.run.app/healthz`

### Jules API
- [ ] بناء Docker image:
  ```bash
  docker build -f apps/multi-agent-story/backend/Dockerfile \
    -t europe-west1-docker.pkg.dev/the-copy-production/the-copy-repo/jules-api:v1 .
  ```
- [ ] دفع الصورة: `docker push ...`
- [ ] نشر Cloud Run:
  ```bash
  gcloud run deploy jules-api \
    --image=... \
    --region=europe-west1 \
    --set-secrets=...
  ```
- [ ] اختبار: `curl -I https://jules-api-xxx.run.app/healthz`

### Firebase Hosting
- [ ] تسجيل دخول: `firebase login`
- [ ] تحديد المشروع: `firebase use the-copy-production`
- [ ] نشر: `firebase deploy --only hosting`
- [ ] اختبار: فتح `https://the-copy-production.web.app`

---

## مرحلة 3: CI/CD Setup (مرة واحدة)

### Service Account
- [ ] إنشاء حساب خدمة:
  ```bash
  gcloud iam service-accounts create github-actions
  ```
- [ ] منح الصلاحيات:
  - [ ] Cloud Run Admin
  - [ ] Artifact Registry Admin
  - [ ] Secret Manager Accessor
  - [ ] Firebase Admin
- [ ] إنشاء مفتاح: `gcloud iam service-accounts keys create key.json`

### GitHub Secrets
- [ ] GCP_PROJECT_ID: `the-copy-production`
- [ ] GCP_SA_KEY: (محتوى key.json)
- [ ] FIREBASE_HOSTING_DOMAIN: `the-copy-production.web.app`

---

## مرحلة 4: التحقق النهائي

### Cloud Run Services
- [ ] Stations API يعمل: `/healthz` returns 200
- [ ] Jules API يعمل: `/healthz` returns 200
- [ ] Services متصلة بقواعد البيانات
- [ ] Secrets محقونة بشكل صحيح

### Firebase Hosting
- [ ] `/basic-editor/` يحمل بنجاح
- [ ] `/drama-analyst/` يحمل بنجاح
- [ ] `/stations/` يحمل بنجاح
- [ ] `/multi-agent-story/` يحمل بنجاح
- [ ] `/api/stations/health` يعمل
- [ ] `/api/jules/health` يعمل

### الأمان
- [ ] HTTPS مفعّل (تلقائي)
- [ ] CORS محدد بدقة
- [ ] Rate Limiting يعمل
- [ ] Security headers مفعّلة
- [ ] No secrets في الكود

### المراقبة
- [ ] Sentry متصل
- [ ] Cloud Logging يعمل
- [ ] Health checks نشطة
- [ ] Alerts مضبوطة (اختياري)

---

## مرحلة 5: ما بعد النشر

### الأسبوع الأول
- [ ] مراقبة السجلات يوميًا
- [ ] فحص استخدام الموارد
- [ ] مراقبة التكاليف
- [ ] جمع feedback المستخدمين

### الصيانة الدورية
- [ ] تحديث التبعيات أسبوعيًا
- [ ] مراجعة السجلات
- [ ] فحص النسخ الاحتياطية
- [ ] اختبار عملية الـ rollback

---

## 🚨 حالات الطوارئ

### Service Down
1. فحص Cloud Run logs: `gcloud run services logs read <service>`
2. فحص Health endpoint
3. Rollback إلى نسخة سابقة
4. إعادة النشر

### Database Issues
1. فحص اتصال قاعدة البيانات
2. فحص Secrets
3. مراجعة Migrations
4. استعادة من Backup

### High Traffic
1. زيادة max-instances في Cloud Run
2. تفعيل caching إضافي
3. مراقبة التكاليف
4. تحليل الأداء

---

## 📞 جهات الاتصال

- **DevOps Lead:** [الاسم]
- **Backend Lead:** [الاسم]
- **Frontend Lead:** [الاسم]
- **GCP Support:** support.google.com/cloud

---

## 📚 مراجع سريعة

| الأمر | الوصف |
|-------|------|
| `pnpm run web:dist` | بناء جميع الواجهات |
| `docker build -f apps/stations/Dockerfile .` | بناء Stations |
| `gcloud run deploy stations-api` | نشر Stations |
| `firebase deploy --only hosting` | نشر Firebase |
| `gcloud run services logs read <service>` | عرض السجلات |
| `firebase hosting:rollback` | التراجع |

---

**طبع هذه الصفحة واستخدمها كمرجع أثناء النشر!**

✅ = تم | ⏸️ = قيد التنفيذ | ❌ = فشل
