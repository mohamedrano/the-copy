# 🚀 Jules Platform - البدء السريع

## التشغيل بأمر واحد فقط!

### الخطوة 1: التثبيت
```bash
npm install
```
⏱️ سيستغرق دقيقتين تقريباً

### الخطوة 2: تشغيل قاعدة البيانات (اختياري)
```bash
# إذا كنت تستخدم Docker
docker-compose up -d postgres redis

# أو استخدم PostgreSQL محلي
```

### الخطوة 3: التشغيل
```bash
npm start
```

✅ **هذا كل شيء!** المشروع سيعمل الآن على:
- Frontend: http://localhost:4173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## ماذا يحدث خلف الكواليس؟

عند تشغيل `npm start`:
1. ✓ يتحقق من التبعيات ويثبتها إن لم تكن موجودة
2. ✓ يبني Backend و Frontend إن لم يكونا مبنيين
3. ✓ يشغل Database Migrations
4. ✓ يشغل Backend و Frontend معاً

---

## أوامر سريعة أخرى

### وضع التطوير (مع Hot Reload)
```bash
npm run dev
```

### بناء المشروع للإنتاج
```bash
npm run build
```

### إعادة تثبيت كل شيء
```bash
npm run clean
npm install
```

---

## لا تعمل؟ حل سريع

### المشكلة: خطأ في قاعدة البيانات
```bash
# تشغيل PostgreSQL بـ Docker
docker-compose up -d postgres

# أو تعديل DATABASE_URL في .env
```

### المشكلة: المنفذ مستخدم
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <رقم_العملية> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### المشكلة: خطأ في البناء
```bash
npm run clean
npm install
npm run build
```

---

## المزيد من التفاصيل

راجع:
- [README-SIMPLE.md](README-SIMPLE.md) - دليل مفصل
- [README.md](README.md) - الوثائق الكاملة
- [DEPLOYMENT.md](DEPLOYMENT.md) - النشر في الإنتاج
