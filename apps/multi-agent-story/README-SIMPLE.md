# Jules Platform - دليل التشغيل السريع

## التثبيت والتشغيل بأمر واحد

### 1. التثبيت
```bash
npm install
```

هذا الأمر سيقوم بـ:
- ✅ تثبيت جميع التبعيات للـ Backend والـ Frontend
- ✅ توليد Prisma Client
- ✅ إعداد البيئة تلقائياً

### 2. التشغيل
```bash
npm start
```

هذا الأمر سيقوم بـ:
- ✅ التحقق من التبعيات
- ✅ بناء المشروع إذا لم يكن مبنياً
- ✅ تشغيل Database Migrations
- ✅ تشغيل Backend و Frontend معاً

### 3. الوصول إلى التطبيق
- **الواجهة الأمامية**: http://localhost:4173
- **API الخلفية**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## أوامر إضافية

### التطوير (Development)
```bash
npm run dev
```
يشغل Backend و Frontend في وضع التطوير مع Hot Reload

### بناء المشروع (Build)
```bash
npm run build
```
يبني Backend و Frontend للإنتاج

### قاعدة البيانات
```bash
# توليد Prisma Client
npm run prisma:generate

# تشغيل Migrations
npm run prisma:migrate

# فتح Prisma Studio
cd jules-backend && npm run prisma:studio
```

### الاختبارات
```bash
npm test
```

### فحص الكود
```bash
npm run lint
```

---

## إعداد قاعدة البيانات

### الخيار 1: استخدام Docker (موصى به)
```bash
docker-compose up -d postgres redis
npm run prisma:migrate
```

### الخيار 2: PostgreSQL محلي
1. قم بتثبيت PostgreSQL
2. أنشئ قاعدة بيانات `jules_db`
3. حدّث `DATABASE_URL` في ملف `.env`
4. شغّل: `npm run prisma:migrate`

---

## متغيرات البيئة

الملف `.env` يتم إنشاؤه تلقائياً عند أول تشغيل. يمكنك تعديله حسب الحاجة:

```env
# PostgreSQL
DATABASE_URL=postgresql://jules_user:password@localhost:5432/jules_db

# Security
JWT_SECRET=your_secret_here_min_32_chars
ENCRYPTION_KEY=your_encryption_key_here

# Frontend
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

---

## حل المشاكل الشائعة

### المشكلة: "Dependencies not found"
**الحل:**
```bash
npm install
```

### المشكلة: "Backend not built"
**الحل:**
```bash
npm run build:backend
```

### المشكلة: "Database connection failed"
**الحل:**
```bash
# تشغيل PostgreSQL
docker-compose up -d postgres

# أو تحقق من DATABASE_URL في .env
```

### المشكلة: "Port already in use"
**الحل:**
```bash
# إيقاف العمليات على المنافذ
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

---

## هيكل المشروع المبسط

```
jules-platform/
├── jules-backend/          # Backend API (Fastify + TypeScript)
├── jules-frontend/         # Frontend (React + TypeScript + Vite)
├── scripts/                # سكريبتات التشغيل
│   ├── start.js           # سكريبت التشغيل الرئيسي
│   └── setup-db.js        # إعداد قاعدة البيانات
├── package.json           # التبعيات والأوامر الموحدة
└── .env                   # متغيرات البيئة (يُنشأ تلقائياً)
```

---

## للنشر في بيئة الإنتاج

راجع [DEPLOYMENT.md](DEPLOYMENT.md) للتفاصيل الكاملة.

**اختصار سريع:**
```bash
# بناء ونشر بـ Docker
docker-compose -f docker-compose.prod.yml up --build -d
```

---

## الدعم

للمزيد من المعلومات:
- [README.md](README.md) - نظرة عامة كاملة
- [CLAUDE.md](CLAUDE.md) - دليل التطوير
- [DEPLOYMENT.md](DEPLOYMENT.md) - دليل النشر
