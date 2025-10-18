# 🚀 دليل تشغيل الاختبارات - خطوة بخطوة

## الطريقة 1: تشغيل يدوي (موصى به)

### الخطوة 1️⃣: تشغيل الخدمات (5 نوافذ terminal)

افتح 5 نوافذ terminal منفصلة وشغّل في كل واحدة:

```bash
# Terminal 1 - Shell
cd /home/user/the-copy
pnpm run dev:shell
```

```bash
# Terminal 2 - Basic Editor
cd /home/user/the-copy
pnpm run dev:basic
```

```bash
# Terminal 3 - Drama Analyst
cd /home/user/the-copy
pnpm run dev:drama
```

```bash
# Terminal 4 - Stations
cd /home/user/the-copy
pnpm run dev:stations
```

```bash
# Terminal 5 - Multi-Agent Story
cd /home/user/the-copy
pnpm run dev:story
```

### الخطوة 2️⃣: انتظر 30-60 ثانية

انتظر حتى ترى رسائل "ready" أو "server started" في جميع النوافذ.

### الخطوة 3️⃣: اختبار يدوي سريع

افتح المتصفح على:
- http://localhost:5173/ → يجب أن ترى **صفحة Shell** مع 4 بطاقات
- http://localhost:5173/basic-editor/ → يجب أن ترى **المحرر** (مختلف!)
- http://localhost:5173/drama-analyst/ → يجب أن ترى **المحلل** (مختلف!)
- http://localhost:5173/multi-agent-story/ → يجب أن ترى **القصص** (مختلف!)
- http://localhost:5173/stations/ → يجب أن ترى **المحطات** (مختلف!)

### الخطوة 4️⃣: اختبارات آلية (terminal جديد)

```bash
# في terminal سادس
cd /home/user/the-copy

# فحص الصحة
node tools/advanced-health-check.mjs

# استخراج التوقيعات
node tools/derive-page-signatures.mjs

# (اختياري) Playwright E2E
npx playwright install --with-deps chromium
npx playwright test

# تجميع النتائج
node tools/summarize-results.mjs
```

---

## الطريقة 2: باستخدام screen/tmux

إذا كان لديك screen أو tmux:

```bash
# إنشاء جلسة screen
screen -S the-copy-tests

# داخل screen، شغّل كل خدمة في نافذة جديدة
# Ctrl+A ثم C لإنشاء نافذة جديدة
# Ctrl+A ثم N للتنقل بين النوافذ

# نافذة 0
pnpm run dev:shell

# نافذة 1 (Ctrl+A, C)
pnpm run dev:basic

# نافذة 2 (Ctrl+A, C)
pnpm run dev:drama

# نافذة 3 (Ctrl+A, C)
pnpm run dev:stations

# نافذة 4 (Ctrl+A, C)
pnpm run dev:story

# نافذة 5 (Ctrl+A, C) - للاختبارات
sleep 60
node tools/advanced-health-check.mjs
```

---

## الطريقة 3: طريقة سريعة بدون اختبارات آلية

```bash
# شغّل الخدمات في الخلفية (قد لا تعمل في كل البيئات)
pnpm run dev:shell > /tmp/shell.log 2>&1 &
sleep 5
pnpm run dev:basic > /tmp/basic.log 2>&1 &
sleep 5
pnpm run dev:drama > /tmp/drama.log 2>&1 &
sleep 5
pnpm run dev:stations > /tmp/stations.log 2>&1 &
sleep 5
pnpm run dev:story > /tmp/story.log 2>&1 &

# انتظر
sleep 60

# اختبر
curl -I http://localhost:5173/
curl -I http://localhost:5173/basic-editor/
curl -I http://localhost:5173/drama-analyst/

# شاهد اللوجز
tail -f /tmp/*.log
```

---

## ✅ معايير النجاح - ماذا تتوقع؟

### اختبار المتصفح اليدوي

كل صفحة يجب أن تكون **مختلفة**:

| URL | ما يجب أن تراه | ما لا يجب أن تراه |
|-----|----------------|-------------------|
| `/` | صفحة Shell مع 4 بطاقات | - |
| `/basic-editor/` | واجهة المحرر | ❌ البطاقات الأربع |
| `/drama-analyst/` | واجهة المحلل | ❌ البطاقات الأربع |
| `/multi-agent-story/` | واجهة القصص | ❌ البطاقات الأربع |
| `/stations/` | واجهة المحطات | ❌ البطاقات الأربع |

### فحص الصحة

```bash
node tools/advanced-health-check.mjs
```

**النتيجة المتوقعة**:
```
✅ The Copy                       │ 200 │
✅ المحرر الأساسي                 │ 200 │
✅ المحلل الدرامي                 │ 200 │
✅ Multi-Agent Story              │ 200 │
✅ Stations                       │ 200 │

📊 الملخص: 5/5 نجح | 0/5 فشل
✅ نجح الفحص!
```

---

## 🐛 استكشاف المشاكل

### المشكلة: لا يمكن بدء الخدمات

```bash
# تحقق من المنافذ المستخدمة
lsof -i :5173 -i :5178 -i :5001 -i :5181 -i :5002 | grep LISTEN

# إذا كانت مشغولة، أوقفها:
pkill -f "vite"
# أو
lsof -ti :5173 | xargs kill -9
```

### المشكلة: run-p لا يعمل

هذه مشكلة شائعة في بعض البيئات. الحل:
- استخدم الطريقة 1 (نوافذ منفصلة) ✅
- أو استخدم screen/tmux

### المشكلة: ECONNREFUSED

معناها أن الخدمة لم تبدأ بعد. انتظر أكثر أو تحقق من اللوجز.

---

## 📊 قراءة النتائج

بعد تشغيل الاختبارات:

```bash
# التقرير النهائي
cat reports/postfix-verification.md

# نتائج الصحة
cat reports/health-summary.json | jq

# توقيعات الصفحات
cat reports/page-signatures.json | jq
```

---

## 🎯 الخلاصة

**أبسط طريقة**:
1. افتح 5 نوافذ terminal
2. شغّل خدمة في كل نافذة
3. افتح المتصفح وتحقق بصرياً
4. (اختياري) شغّل الاختبارات الآلية

**إذا نجحت**: ستجد كل صفحة **مختلفة** عن الأخرى! 🎉

---

**آخر تحديث**: 2025-10-18
