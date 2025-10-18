# 🧪 دليل الاختبار - Testing Guide

هذا الملف يحتوي على تعليمات كاملة لتشغيل جميع الاختبارات.

---

## 🚀 البدء السريع

```bash
# 1. التثبيت
pnpm install

# 2. تشغيل جميع الخدمات
pnpm run dev:all

# 3. في terminal آخر (بعد 60 ثانية):
node tools/advanced-health-check.mjs
```

---

## 🏥 اختبارات الصحة (Health Checks)

### فحص صحة متقدم (موصى به)

```bash
node tools/advanced-health-check.mjs
```

**يفحص**:
- HTTP 200 على جميع المسارات
- عدم احتواء الصفحات الفرعية على توقيعات Shell
- وجود توقيعات فريدة لكل صفحة

**المخرجات**: `reports/health-summary.json`

### فحص صحة بسيط

```bash
node tools/health-check.mjs
```

---

## 🔖 توقيعات الصفحات

```bash
node tools/derive-page-signatures.mjs
```

**يستخرج**:
- عناوين الصفحات (Title tags)
- Root IDs
- الكلمات المفتاحية المميزة

**المخرجات**: `reports/page-signatures.json`

---

## 🎭 اختبارات Playwright E2E

### التثبيت الأول

```bash
# تثبيت متصفحات Playwright
npx playwright install --with-deps chromium
```

### تشغيل جميع الاختبارات

```bash
npx playwright test
```

### تشغيل اختبار محدد

```bash
npx playwright test e2e/01-shell.spec.ts
npx playwright test e2e/02-basic-editor.spec.ts
npx playwright test e2e/03-drama-analyst.spec.ts
npx playwright test e2e/04-stations.spec.ts
npx playwright test e2e/05-multi-agent-story.spec.ts
```

### مع واجهة مرئية

```bash
npx playwright test --ui
```

### مع المتصفح المرئي

```bash
npx playwright test --headed
```

### Debug mode

```bash
npx playwright test --debug
```

### عرض التقرير

```bash
npx playwright show-report
```

**المخرجات**:
- `reports/playwright-results.json`
- `playwright-report/` (HTML)

---

## 📊 تجميع النتائج

```bash
node tools/summarize-results.mjs
```

**ينتج**:
- تقرير موحد بصيغة Markdown
- جدول بوابات القبول
- ملخص تنفيذي

**المخرجات**: `reports/postfix-verification.md`

---

## 🔄 سيناريو الاختبار الكامل

```bash
#!/bin/bash

echo "🚀 بدء سيناريو الاختبار الكامل..."

# 1. التحضير
echo "📦 تثبيت الاعتماديات..."
pnpm install

# 2. تشغيل الخدمات
echo "🔌 تشغيل جميع الخدمات..."
pnpm run dev:all &
DEV_PID=$!

# 3. الانتظار
echo "⏳ انتظار بدء الخدمات (60 ثانية)..."
sleep 60

# 4. استخراج التوقيعات
echo "🔖 استخراج توقيعات الصفحات..."
node tools/derive-page-signatures.mjs

# 5. فحص الصحة
echo "🏥 تشغيل فحص الصحة..."
node tools/advanced-health-check.mjs
HEALTH_EXIT=$?

# 6. Playwright E2E
echo "🎭 تشغيل اختبارات Playwright..."
npx playwright test
PLAYWRIGHT_EXIT=$?

# 7. تجميع النتائج
echo "📊 تجميع النتائج..."
node tools/summarize-results.mjs

# 8. التنظيف
echo "🧹 إيقاف الخدمات..."
kill $DEV_PID

# 9. النتيجة
echo ""
if [ $HEALTH_EXIT -eq 0 ] && [ $PLAYWRIGHT_EXIT -eq 0 ]; then
  echo "✅ نجح جميع الاختبارات!"
  echo "📄 راجع التقرير: reports/postfix-verification.md"
  exit 0
else
  echo "❌ فشل بعض الاختبارات!"
  echo "📄 راجع التفاصيل في: reports/"
  exit 1
fi
```

احفظ هذا في `scripts/run-all-tests.sh` وشغّله:

```bash
chmod +x scripts/run-all-tests.sh
./scripts/run-all-tests.sh
```

---

## 📁 ملفات الاختبار

### السكريبتات
- `tools/advanced-health-check.mjs` - فحص صحة متقدم
- `tools/derive-page-signatures.mjs` - استخراج التوقيعات
- `tools/health-check.mjs` - فحص صحة بسيط
- `tools/summarize-results.mjs` - تجميع النتائج

### اختبارات E2E
- `e2e/01-shell.spec.ts` - Shell application
- `e2e/02-basic-editor.spec.ts` - Basic Editor
- `e2e/03-drama-analyst.spec.ts` - Drama Analyst
- `e2e/04-stations.spec.ts` - Stations
- `e2e/05-multi-agent-story.spec.ts` - Multi-Agent Story

### التكوين
- `playwright.config.ts` - تكوين Playwright

---

## 🎯 معايير النجاح

### Health Check ✅
- جميع المسارات تعيد HTTP 200
- كل صفحة فرعية **لا** تحتوي على `data-testid="the-copy-shell"`
- توقيعات فريدة لكل تطبيق

### Playwright E2E ✅
- جميع الاختبارات (15+) تنجح
- لا أخطاء Console حرجة
- كل صفحة تعرض محتواها الفريد

### بوابات القبول ✅
1. ✅ HTTP 200 على جميع المسارات
2. ✅ توقيعات فريدة
3. ✅ Playwright 100% نجاح
4. ✅ Stations يعمل بدون GEMINI_API_KEY

---

## 🐛 استكشاف الأخطاء

### المشكلة: لا يمكن الوصول إلى المنافذ

```bash
# تحقق من أن الخدمات تعمل
lsof -i :5173 -i :5178 -i :5001 -i :5181 -i :5002 | grep LISTEN

# إذا كانت فارغة، شغّل الخدمات:
pnpm run dev:all
```

### المشكلة: Playwright يفشل

```bash
# تحقق من أن المتصفحات مثبتة
npx playwright install --with-deps chromium

# شغّل في debug mode
npx playwright test --debug
```

### المشكلة: health-check يفشل

```bash
# تحقق من BASE_URL
export TEST_BASE_URL=http://localhost:5173
node tools/advanced-health-check.mjs

# أو مباشرة:
curl -I http://localhost:5173/
curl -I http://localhost:5173/basic-editor/
```

---

## 📚 المراجع

- [تقرير الإصلاحات الكامل](ROUTING_FIX.md)
- [دليل البدء السريع](QUICK_START.md)
- [تقرير اختبار القبول](reports/ACCEPTANCE_TEST_REPORT.md)
- [Playwright Docs](https://playwright.dev/)

---

**آخر تحديث**: 2025-10-18
**الحالة**: ✅ جاهز للاستخدام
