# 🚀 دليل البدء السريع - The Copy

## ⚡ التشغيل السريع (خطوتان فقط!)

### 1️⃣ التثبيت

```bash
pnpm install
```

### 2️⃣ التشغيل

```bash
pnpm run dev:all
```

انتظر حتى تبدأ جميع التطبيقات، ثم افتح المتصفح على:
**[http://localhost:5173/](http://localhost:5173/)**

---

## 🎯 الوصول السريع للتطبيقات

بعد تشغيل `pnpm run dev:all`، ستتوفر التطبيقات على:

| التطبيق | الرابط |
|---------|--------|
| 🏠 **الصفحة الرئيسية** | [localhost:5173/](http://localhost:5173/) |
| ✍️ **المحرر الأساسي** | [localhost:5173/basic-editor/](http://localhost:5173/basic-editor/) |
| 🎭 **محلل الدراما** | [localhost:5173/drama-analyst/](http://localhost:5173/drama-analyst/) |
| 🎨 **العصف الذهني** | [localhost:5173/multi-agent-story/](http://localhost:5173/multi-agent-story/) |
| 📊 **المحطات التحليلية** | [localhost:5173/stations/](http://localhost:5173/stations/) |

---

## 🔧 إعداد مفاتيح API (اختياري)

إذا كنت تريد استخدام ميزات الذكاء الاصطناعي:

```bash
# 1. نسخ ملفات البيئة
cp .env.example .env

# 2. تعديل الملف وإضافة مفتاح Gemini
nano .env
```

أضف:
```env
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

> 💡 **ملاحظة**: التطبيقات ستعمل بدون المفاتيح، لكن ميزات الذكاء الاصطناعي ستكون معطلة.

---

## ✅ فحص الصحة

للتأكد من أن جميع التطبيقات تعمل بشكل صحيح:

```bash
node tools/health-check.mjs
```

**مخرجات متوقعة**:
```
✅ نجح الفحص! جميع التطبيقات (5/5) تعمل بشكل صحيح.
```

---

## 🛠️ أوامر مفيدة

```bash
# تشغيل تطبيق واحد فقط
pnpm run dev:shell          # الصفحة الرئيسية فقط
pnpm run dev:basic          # المحرر الأساسي فقط
pnpm run dev:drama          # محلل الدراما فقط
pnpm run dev:stations       # المحطات فقط
pnpm run dev:story          # العصف الذهني فقط

# بناء للإنتاج
pnpm run build:all

# فحص الأنواع
pnpm run type-check

# تشغيل الاختبارات
pnpm run test
```

---

## 🐛 حل المشاكل الشائعة

### المشكلة: `EADDRINUSE: address already in use`

**الحل**:
```bash
# إيقاف جميع العمليات المستخدمة للمنافذ
lsof -i :5173 -i :5178 -i :5001 -i :5181 -i :5002 | grep LISTEN | awk '{print $2}' | xargs kill

# ثم إعادة التشغيل
pnpm run dev:all
```

### المشكلة: صفحة 404 على المسارات الفرعية

**الحل**:
1. تأكد من تشغيل `pnpm run dev:all` وليس `pnpm run dev`
2. انتظر حتى تبدأ جميع التطبيقات (قد يستغرق 10-30 ثانية)
3. جرب تحديث الصفحة (F5 أو Ctrl+R)

### المشكلة: Stations ينهار عند البدء

**الحل**: لا مشكلة! سيعمل بدون مفتاح API ولكن بدون ميزات الذكاء الاصطناعي.

---

## 📚 مراجع إضافية

- 📖 [دليل إصلاح التوجيه الكامل](ROUTING_FIX.md)
- 🏗️ [معلومات البناء والنشر](ROUTING_FIX.md#-النشر-للإنتاج)
- 🔍 [تفاصيل تقنية حول المشكلة والحل](ROUTING_FIX.md#-السبب-الجذري)

---

**آخر تحديث**: 2025-10-18
**الحالة**: ✅ جاهز للاستخدام
