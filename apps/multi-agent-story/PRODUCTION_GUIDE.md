# 🚀 دليل النشر الإنتاجي الشامل - Jules Platform

## 📋 جدول المحتويات
1. [المتطلبات الأساسية](#المتطلبات-الأساسية)
2. [إعداد البيئة المحلية](#إعداد-البيئة-المحلية)
3. [النشر باستخدام Docker](#النشر-باستخدام-docker)
4. [النشر على Firebase & Cloud Run](#النشر-على-firebase--cloud-run)
5. [المراقبة والصيانة](#المراقبة-والصيانة)

---

## المتطلبات الأساسية

### 🛠️ أدوات مطلوبة:
- **Node.js** v20+
- **PNPM** v8+
- **Docker** & **Docker Compose**
- **PostgreSQL** 16+
- **Redis** 7+
- **Git**
- **Firebase CLI** (للنشر)
- **Google Cloud SDK** (للـ Cloud Run)

### 🔑 مفاتيح API المطلوبة:
- **Gemini API Key** من Google AI Studio
- **Firebase Service Account**
- **Sentry DSN** (اختياري للمراقبة)

---

## إعداد البيئة المحلية

### 1️⃣ استنساخ المشروع وتثبيت التبعيات

```bash
# Windows PowerShell
.\setup.ps1

# Linux/Mac
chmod +x setup.sh
./setup.sh
```

### 2️⃣ تكوين متغيرات البيئة

قم بتحديث ملف `.env` بالقيم الصحيحة:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your_actual_gemini_key_here
GEMINI_MODEL=gemini-2.0-flash-exp

# Database Configuration
DATABASE_URL=postgresql://jules_user:strong_password@postgres:5432/jules_db
POSTGRES_PASSWORD=strong_password

# Redis Configuration
REDIS_PASSWORD=redis_password_here
REDIS_URL=redis://:redis_password_here@redis:6379

# Security
JWT_SECRET=generate_32_char_secret_here
ENCRYPTION_KEY=generate_another_32_char_key

# Frontend URLs
VITE_API_URL=https://api.your-domain.com
VITE_WS_URL=wss://api.your-domain.com
```

### 3️⃣ إعداد قاعدة البيانات

```bash
# بدء PostgreSQL و Redis
docker-compose up -d postgres redis

# تشغيل Migrations
cd backend
pnpm prisma:migrate deploy
pnpm prisma:generate
```

---

## النشر باستخدام Docker

### 🐳 البناء والتشغيل الإنتاجي

```bash
# بناء جميع الصور
docker-compose -f docker-compose.prod.yml build

# التشغيل في الخلفية
docker-compose -f docker-compose.prod.yml up -d

# مشاهدة السجلات
docker-compose -f docker-compose.prod.yml logs -f
```

### 🔍 التحقق من الصحة

```bash
# فحص حالة الخدمات
docker-compose -f docker-compose.prod.yml ps

# اختبار Backend API
curl http://localhost:8000/health

# اختبار Frontend
curl http://localhost:80
```

---

## النشر على Firebase & Cloud Run

### 🔥 Firebase Hosting (Frontend)

#### 1. إعداد Firebase

```bash
# تثبيت Firebase CLI
npm install -g firebase-tools

# تسجيل الدخول
firebase login

# تهيئة المشروع
firebase init hosting
```

#### 2. بناء ونشر Frontend

```bash
# بناء الإنتاج
pnpm run build

# النشر إلى Firebase
firebase deploy --only hosting
```

### ☁️ Google Cloud Run (Backend)

#### 1. إعداد Google Cloud

```bash
# تثبيت gcloud CLI
# https://cloud.google.com/sdk/docs/install

# تسجيل الدخول
gcloud auth login

# تعيين المشروع
gcloud config set project YOUR_PROJECT_ID
```

#### 2. بناء ورفع صورة Docker

```bash
# بناء الصورة
docker build -t gcr.io/YOUR_PROJECT_ID/jules-backend:latest -f backend/Dockerfile.prod ./backend

# رفع الصورة
docker push gcr.io/YOUR_PROJECT_ID/jules-backend:latest
```

#### 3. نشر على Cloud Run

```bash
gcloud run deploy jules-backend \
  --image gcr.io/YOUR_PROJECT_ID/jules-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-env-vars DATABASE_URL="${DATABASE_URL}" \
  --set-env-vars REDIS_URL="${REDIS_URL}" \
  --set-env-vars JWT_SECRET="${JWT_SECRET}" \
  --set-env-vars GEMINI_API_KEY="${GEMINI_API_KEY}"
```

### 🗄️ إعداد قاعدة البيانات الإنتاجية

#### استخدام Cloud SQL (PostgreSQL)

```bash
# إنشاء instance
gcloud sql instances create jules-postgres \
  --database-version=POSTGRES_16 \
  --tier=db-g1-small \
  --region=us-central1

# إنشاء قاعدة البيانات
gcloud sql databases create jules_db \
  --instance=jules-postgres

# إنشاء المستخدم
gcloud sql users create jules_user \
  --instance=jules-postgres \
  --password=YOUR_SECURE_PASSWORD
```

#### استخدام Memorystore (Redis)

```bash
# إنشاء instance
gcloud redis instances create jules-redis \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_7_0
```

---

## المراقبة والصيانة

### 📊 إعداد المراقبة

#### Sentry Integration

```javascript
// backend/src/monitoring.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### Health Checks

```bash
# إضافة health check endpoints
GET /health          # Backend health
GET /health/db       # Database connectivity
GET /health/redis    # Redis connectivity
GET /health/ai       # Gemini API status
```

### 🔧 الصيانة الدورية

#### النسخ الاحتياطي اليومي

```bash
# نسخ احتياطي لقاعدة البيانات
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# رفع إلى Cloud Storage
gsutil cp backup_*.sql gs://your-backup-bucket/
```

#### تحديث الشهادات SSL

```bash
# تجديد شهادة Let's Encrypt
certbot renew --nginx
```

#### تنظيف السجلات

```bash
# تنظيف سجلات Docker
docker system prune -a --volumes

# تنظيف سجلات التطبيق (أقدم من 30 يوم)
find /var/log/jules -name "*.log" -mtime +30 -delete
```

---

## 🚨 استكشاف الأخطاء

### مشاكل شائعة وحلولها:

#### 1. خطأ في الاتصال بقاعدة البيانات
```bash
# التحقق من حالة PostgreSQL
docker-compose logs postgres

# إعادة تشغيل الخدمة
docker-compose restart postgres
```

#### 2. فشل Gemini API
```bash
# التحقق من الـ API Key
curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent \
  -H "x-goog-api-key: $GEMINI_API_KEY"
```

#### 3. مشاكل WebSocket
```nginx
# تأكد من تكوين Nginx للـ WebSocket
location /ws/ {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

---

## 📈 مؤشرات الأداء

### KPIs للمراقبة:
- **Response Time**: < 200ms للـ API
- **Uptime**: > 99.9%
- **Error Rate**: < 0.1%
- **Concurrent Sessions**: قدرة على 100+ جلسة متزامنة
- **AI Processing Time**: < 5 ثواني لكل agent

---

## 🔐 أفضل ممارسات الأمان

1. **تشفير جميع البيانات الحساسة**
2. **استخدام HTTPS دائماً**
3. **تحديث التبعيات بانتظام**
4. **مراجعة السجلات الأمنية**
5. **تطبيق Rate Limiting**
6. **استخدام WAF (Web Application Firewall)**

---

## 📞 الدعم

للمساعدة أو الإبلاغ عن مشاكل:
- 📧 Email: support@jules-platform.com
- 📱 Discord: [Jules Community](https://discord.gg/jules)
- 📚 Documentation: [docs.jules-platform.com](https://docs.jules-platform.com)

---

## 📝 ملاحظات إضافية

- تأكد من تحديث جميع المفاتيح والكلمات المرورية قبل النشر الإنتاجي
- قم بإجراء اختبار شامل في بيئة staging قبل النشر
- احتفظ بنسخ احتياطية منتظمة
- راقب استهلاك الموارد وقم بالتوسع حسب الحاجة

---

تم إعداد هذا الدليل بواسطة فريق Jules Platform 🚀
