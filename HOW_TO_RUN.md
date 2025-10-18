# 🚀 كيف تشغّل الاختبارات؟

## ⚡ الطريقة الأسرع (للمستخدم)

### الخطوة 1: افتح 6 نوافذ Terminal في IDE

في VS Code أو أي IDE:
- اضغط `Ctrl+Shift+\`` لفتح Terminal جديد
- كرر لفتح 6 terminals

### الخطوة 2: شغّل كل خدمة في terminal منفصل

**Terminal 1:**
```bash
cd /home/user/the-copy
pnpm run dev:shell
```

**Terminal 2:**
```bash
cd /home/user/the-copy
pnpm run dev:basic
```

**Terminal 3:**
```bash
cd /home/user/the-copy
pnpm run dev:drama
```

**Terminal 4:**
```bash
cd /home/user/the-copy
pnpm run dev:stations
```

**Terminal 5:**
```bash
cd /home/user/the-copy
pnpm run dev:story
```

**Terminal 6 (للاختبارات):**
```bash
cd /home/user/the-copy
# انتظر 30-60 ثانية حتى تبدأ جميع الخدمات أعلاه
sleep 60
node tools/advanced-health-check.mjs
```

---

## 🌐 اختبار سريع في المتصفح (موصى به!)

بعد تشغيل الخدمات، افتح:

1. **http://localhost:5173/**
   - ✅ يجب أن ترى: صفحة Shell مع 4 بطاقات للتطبيقات

2. **http://localhost:5173/basic-editor/**
   - ✅ يجب أن ترى: واجهة المحرر (БЕЗ البطاقات!)
   - ❌ يجب ألا ترى: البطاقات الأربع

3. **http://localhost:5173/drama-analyst/**
   - ✅ يجب أن ترى: واجهة المحلل (БЕЗ البطاقات!)
   - ❌ يجب ألا ترى: البطاقات الأربع

4. **http://localhost:5173/multi-agent-story/**
   - ✅ يجب أن ترى: واجهة القصص (БЕЗ البطاقات!)
   - ❌ يجب ألا ترى: البطاقات الأربع

5. **http://localhost:5173/stations/**
   - ✅ يجب أن ترى: واجهة المحطات (БЕЗ البطاقات!)
   - ❌ يجب ألا ترى: البطاقات الأربع

### 🎯 النجاح = كل صفحة مختلفة!

إذا رأيت **5 واجهات مختلفة**، فالإصلاح **نجح** 🎉

---

## 🧪 الاختبارات الآلية (اختياري)

بعد التأكد من أن الخدمات تعمل:

```bash
# في Terminal 6
cd /home/user/the-copy

# فحص الصحة
node tools/advanced-health-check.mjs

# استخراج التوقيعات
node tools/derive-page-signatures.mjs

# (متقدم) Playwright E2E
npx playwright install --with-deps chromium
npx playwright test

# تجميع النتائج
node tools/summarize-results.mjs
cat reports/postfix-verification.md
```

---

## 📊 ماذا تعني النتائج؟

### ✅ نجح الفحص إذا:

```
✅ The Copy                       │ 200 │
✅ المحرر الأساسي                 │ 200 │
✅ المحلل الدرامي                 │ 200 │
✅ Multi-Agent Story              │ 200 │
✅ Stations                       │ 200 │

📊 الملخص: 5/5 نجح
```

### ❌ فشل إذا:

```
❌ المحرر الأساسي                 │   0 │
   ❗ Found forbidden signature: "the-copy-shell"
```

معناها: المحرر يعرض صفحة Shell بدلاً من صفحته!

---

## 🐛 مشاكل شائعة

### المشكلة 1: "command not found: pnpm"

**الحل:**
```bash
corepack enable
corepack prepare pnpm@10.18.3 --activate
pnpm --version
```

### المشكلة 2: "Port already in use"

**الحل:**
```bash
# إيقاف الخدمات القديمة
pkill -f "vite"

# أو بالمنافذ:
lsof -ti :5173 | xargs kill -9
lsof -ti :5178 | xargs kill -9
lsof -ti :5001 | xargs kill -9
lsof -ti :5181 | xargs kill -9
lsof -ti :5002 | xargs kill -9
```

### المشكلة 3: الخدمات لا تبدأ

تحقق من اللوجز في Terminal، عادةً المشكلة:
- اعتماديات مفقودة → `pnpm install`
- `GEMINI_API_KEY` (لا مشكلة، سيعمل بدونه)

---

## 📖 المراجع السريعة

- **توثيق كامل**: [ROUTING_FIX.md](ROUTING_FIX.md)
- **دليل اختبار**: [TESTING.md](TESTING.md)
- **بدء سريع**: [QUICK_START.md](QUICK_START.md)
- **تقرير القبول**: [reports/ACCEPTANCE_TEST_REPORT.md](reports/ACCEPTANCE_TEST_REPORT.md)

---

## 💡 نصيحة ذهبية

**لا تحتاج الاختبارات الآلية للتأكد من النجاح!**

فقط:
1. شغّل الخدمات الخمس
2. افتح المتصفح
3. تحقق بصرياً من الروابط الخمسة أعلاه

إذا كانت كل صفحة **مختلفة** → **نجحت!** 🎉

---

**آخر تحديث**: 2025-10-18
**الوقت المتوقع**: 5 دقائق للتشغيل + 2 دقيقة للتحقق
