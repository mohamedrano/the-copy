# 🚀 Jules Platform - دليل الإعداد والتشغيل السريع

## 📋 المتطلبات الأساسية

### 1. البرمجيات المطلوبة
- **Node.js**: >= 20.0.0
- **pnpm**: >= 8.0.0
- **PostgreSQL**: 15 أو أحدث
- **Redis**: (اختياري للإنتاج)
- **Docker**: (اختياري - للتشغيل السريع)

### 2. مفاتيح API المطلوبة
- **Google Gemini API Key**: احصل عليه من [Google AI Studio](https://makersuite.google.com/app/apikey)

---

## ⚡ التشغيل السريع (Development)

### الخطوة 1: تثبيت التبعيات

```bash
# من مجلد المشروع الرئيسي
cd apps/multi-agent-story

# تثبيت تبعيات Frontend
pnpm install

# تثبيت تبعيات Backend
cd backend
pnpm install
cd ..
```

### الخطوة 2: إعداد متغيرات البيئة

#### Frontend (.env)
ملف `.env` موجود مسبقاً، فقط قم بتحديث القيم:

```bash
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_APP_ENV=development
```

#### Backend (backend/.env)
ملف `backend/.env` موجود مسبقاً، قم بتحديث المفاتيح التالية:

```bash
# ⚠️ مهم: أضف مفتاح Gemini API الخاص بك
GEMINI_API_KEY="your_actual_gemini_api_key_here"

# Database (إذا كان لديك PostgreSQL محلي)
DATABASE_URL="postgresql://jules_user:jules_password@localhost:5432/jules_db"

# أو استخدم قاعدة بيانات افتراضية للتطوير
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jules_dev"

# JWT Secret (للأمان - غيّر هذا في الإنتاج)
JWT_SECRET="development-secret-key-change-in-production-min-32-chars"

# Redis (اختياري للتطوير)
REDIS_URL="redis://localhost:6379"
```

### الخطوة 3: إعداد قاعدة البيانات

#### الخيار 1: PostgreSQL محلي

```bash
# إنشاء قاعدة البيانات
createdb jules_db

# أو عبر psql
psql -U postgres
CREATE DATABASE jules_db;
\q

# تشغيل Prisma migrations
cd backend
npx prisma generate
npx prisma migrate dev --name init
cd ..
```

#### الخيار 2: PostgreSQL عبر Docker

```bash
# تشغيل PostgreSQL في container
docker run -d \
  --name jules-postgres \
  -p 5432:5432 \
  -e POSTGRES_USER=jules_user \
  -e POSTGRES_PASSWORD=jules_password \
  -e POSTGRES_DB=jules_db \
  postgres:15

# ثم تشغيل migrations
cd backend
npx prisma generate
npx prisma migrate dev --name init
cd ..
```

### الخطوة 4: تشغيل التطبيق

#### الطريقة 1: تشغيل منفصل (موصى به للتطوير)

```bash
# Terminal 1: Backend
cd apps/multi-agent-story/backend
pnpm run dev
# سيعمل على http://localhost:8000

# Terminal 2: Frontend
cd apps/multi-agent-story
pnpm run dev
# سيعمل على http://localhost:5181
```

#### الطريقة 2: استخدام concurrently (من المجلد الرئيسي)

```bash
# إذا كان مُثبت concurrently
cd apps/multi-agent-story
npx concurrently \
  "cd backend && pnpm run dev" \
  "pnpm run dev"
```

### الخطوة 5: افتح التطبيق

- **Frontend**: [http://localhost:5181](http://localhost:5181)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs) *(إذا كان متاحاً)*

---

## 🐳 التشغيل باستخدام Docker (الأسهل)

### الخيار 1: Docker Compose (Full Stack)

```bash
cd apps/multi-agent-story

# تعديل docker-compose.yml وإضافة GEMINI_API_KEY
# ثم تشغيل:
docker-compose up --build

# أو للخلفية:
docker-compose up -d --build
```

### الخيار 2: Frontend فقط

```bash
cd apps/multi-agent-story

# بناء Frontend
docker build -f Dockerfile.frontend -t jules-frontend .

# تشغيل
docker run -p 5181:80 jules-frontend
```

---

## 🧪 الاختبار

```bash
# Frontend Tests
cd apps/multi-agent-story
pnpm test

# مع coverage
pnpm test:coverage

# Backend Tests (إذا كانت موجودة)
cd backend
pnpm test
```

---

## 🔧 استكشاف الأخطاء

### 1. خطأ: "pnpm: command not found"

```bash
# تثبيت pnpm
npm install -g pnpm@latest

# أو باستخدام corepack
corepack enable
corepack prepare pnpm@latest --activate
```

### 2. خطأ: Database connection failed

```bash
# تأكد من تشغيل PostgreSQL
# Linux/Mac:
sudo systemctl status postgresql

# أو Docker:
docker ps | grep postgres

# تحقق من DATABASE_URL في backend/.env
```

### 3. خطأ: Gemini API Error

```bash
# تأكد من:
# 1. مفتاح API صحيح في backend/.env
# 2. المفتاح نشط في Google AI Studio
# 3. لا توجد مسافات زائدة في GEMINI_API_KEY
```

### 4. خطأ: Port already in use

```bash
# إيقاف العملية على المنفذ 5181
lsof -ti:5181 | xargs kill -9

# أو 8000 للـ Backend
lsof -ti:8000 | xargs kill -9
```

### 5. Frontend لا يتصل بـ Backend

```bash
# تأكد من:
# 1. Backend يعمل على http://localhost:8000
# 2. VITE_API_URL في .env صحيح
# 3. CORS مفعّل في Backend

# اختبار Backend:
curl http://localhost:8000/health
```

---

## 📦 البناء للإنتاج

### Frontend

```bash
cd apps/multi-agent-story

# البناء (سيذهب إلى ../../public/multi-agent-story/)
pnpm build

# معاينة البناء
pnpm preview
```

### Backend

```bash
cd apps/multi-agent-story/backend

# البناء
pnpm build

# التشغيل
NODE_ENV=production pnpm start
```

---

## 📚 موارد إضافية

- **README الرئيسي**: [README.md](./README.md)
- **توثيق الوكلاء**: [AGENTS.md](./AGENTS.md)
- **دليل النشر**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **دليل الإنتاج**: [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md)

---

## 🆘 الدعم والمساعدة

إذا واجهت مشاكل:

1. تحقق من هذا الدليل أولاً
2. راجع ملفات `.env` والتأكد من جميع المفاتيح
3. تأكد من تشغيل PostgreSQL و Redis (إن لزم)
4. راجع logs في Terminal

---

## ✅ Checklist السريع

- [ ] Node.js >= 20 مُثبت
- [ ] pnpm مُثبت
- [ ] PostgreSQL يعمل
- [ ] مفتاح Gemini API موجود في `backend/.env`
- [ ] DATABASE_URL محدث في `backend/.env`
- [ ] `pnpm install` تم في Frontend و Backend
- [ ] Prisma migrations تم تشغيلها
- [ ] Backend يعمل على port 8000
- [ ] Frontend يعمل على port 5181
- [ ] التطبيق يفتح في المتصفح بنجاح

---

**🎉 بالتوفيق في استخدام Jules Platform!**
