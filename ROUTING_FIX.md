# إصلاح مشكلة التوجيه - كل الصفحات تفتح الهوم

## 📋 ملخص المشكلة

كانت جميع التطبيقات الفرعية (basic-editor, drama-analyst, stations, multi-agent-story) تفتح صفحة الـShell الرئيسية بدلاً من واجهاتها الفعلية عند الوصول إليها عبر المسارات الفرعية.

## 🔍 السبب الجذري

1. **غياب Proxy في تطبيق الـShell**: لم يكن هناك إعادة توجيه للمسارات الفرعية `/basic-editor/`, `/drama-analyst/`, إلخ إلى المنافذ الصحيحة للتطبيقات الفرعية
2. **SPA Fallback**: سيرفر Vite في الـShell كان يعيد توجيه كل الطلبات غير المعروفة إلى `index.html` الخاص به
3. **عدم تطابق المنافذ**: بعض التطبيقات كانت تستخدم منافذ مختلفة عن المتوقعة في التكوين

## ✅ الحلول المطبقة

### 1. إضافة Proxy في تطبيق الـShell

**الملف**: [`apps/the-copy/vite.config.ts`](apps/the-copy/vite.config.ts#L33-L55)

```typescript
server: {
  host: 'localhost',
  port: 5173,
  proxy: {
    '/basic-editor': {
      target: 'http://localhost:5178',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/basic-editor/, ''),
    },
    '/drama-analyst': {
      target: 'http://localhost:5001',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/drama-analyst/, ''),
    },
    '/multi-agent-story': {
      target: 'http://localhost:5181',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/multi-agent-story/, ''),
    },
    '/stations': {
      target: 'http://localhost:5002',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/stations/, ''),
    },
  }
}
```

**النتيجة**: عند زيارة `http://localhost:5173/drama-analyst/` لن يعيد Vite صفحة الـShell، بل سيمرر الطلب إلى منفذ 5001.

### 2. تحديث nginx.conf للإنتاج

**الملف**: [`nginx.conf`](nginx.conf#L51-L73)

أضفت مسار `/basic-editor/` إلى التكوين ليكون متسقاً مع بقية التطبيقات.

### 3. إصلاح معالجة GEMINI_API_KEY في Stations

**الملف**: [`apps/stations/server/run-all-stations.ts`](apps/stations/server/run-all-stations.ts#L58-L77)

**قبل**:
```typescript
if (!config.apiKey) {
  throw new Error('GEMINI_API_KEY is required...');
}
```

**بعد**:
```typescript
if (!config.apiKey) {
  logger.warn('[AnalysisPipeline] GEMINI_API_KEY not set. AI analysis endpoints will respond with 503.');
  // Create a dummy service that will fail gracefully
  this.geminiService = new GeminiService({
    apiKey: 'dummy-key-ai-disabled',
    defaultModel: GeminiModel.FLASH,
    fallbackModel: GeminiModel.FLASH,
    maxRetries: 0,
    timeout: 1000,
  });
} else {
  // Normal initialization
}
```

**النتيجة**: التطبيق لن ينهار عند غياب المفتاح، بل سيستمر بالعمل مع تعطيل ميزات الذكاء الاصطناعي فقط.

### 4. إضافة اعتماديات مفقودة

```bash
pnpm -w add nanoid          # للمستودع الجذري
pnpm -w add npm-run-all -D  # لتشغيل التطبيقات بالتوازي
```

### 5. سكريبتات تشغيل موحدة

**الملف**: [`package.json`](package.json#L38)

```json
{
  "scripts": {
    "dev:shell": "pnpm --filter @the-copy/the-copy run dev",
    "dev:all": "run-p dev:shell dev:basic dev:drama dev:stations dev:story"
  }
}
```

**الاستخدام**:
```bash
pnpm run dev:all
```

### 6. أداة فحص الصحة التلقائية

**الملف**: [`tools/health-check.mjs`](tools/health-check.mjs)

اختبار آلي يتحقق من توفر جميع التطبيقات على المنافذ الصحيحة:

```bash
node tools/health-check.mjs
```

**المخرجات**:
```
🔍 بدء فحص صحة التطبيقات...

┌─────────────────────────────────────────────────────────────────┐
│                        نتائج الفحص                              │
├─────────────────────────────────────────────────────────────────┤
│ ✅ Shell (The Copy)        │ 200 │ OK                        │
│ ✅ Basic Editor            │ 200 │ OK                        │
│ ✅ Drama Analyst           │ 200 │ OK                        │
│ ✅ Multi-Agent Story       │ 200 │ OK                        │
│ ✅ Stations                │ 200 │ OK                        │
└─────────────────────────────────────────────────────────────────┘

✅ نجح الفحص! جميع التطبيقات (5/5) تعمل بشكل صحيح.
```

## 📊 خريطة المنافذ

| التطبيق             | المنفذ | المسار الفرعي        | vite.config base        |
|--------------------|-------|--------------------|------------------------|
| The Copy (Shell)   | 5173  | `/`                | `/`                    |
| Basic Editor       | 5178  | `/basic-editor/`   | `/basic-editor/`       |
| Drama Analyst      | 5001  | `/drama-analyst/`  | `/drama-analyst/`      |
| Multi-Agent Story  | 5181  | `/multi-agent-story/` | `/multi-agent-story/` |
| Stations           | 5002  | `/stations/`       | `/stations/`           |

## 🚀 التشغيل والاختبار

### 1. تثبيت الاعتماديات

```bash
pnpm install
```

### 2. نسخ ملفات البيئة

```bash
cp .env.example .env
cp apps/stations/.env.example apps/stations/.env
cp apps/drama-analyst/.env.example apps/drama-analyst/.env
cp apps/multi-agent-story/.env.example apps/multi-agent-story/.env
```

### 3. تعديل المفاتيح السرية

افتح `.env` وعدل:
```bash
VITE_GEMINI_API_KEY=your_actual_key_here
GEMINI_API_KEY=your_actual_key_here
```

### 4. تشغيل جميع التطبيقات

```bash
pnpm run dev:all
```

### 5. فحص الصحة

```bash
node tools/health-check.mjs
```

### 6. الاختبار اليدوي

افتح المتصفح وتحقق من:
- [http://localhost:5173/](http://localhost:5173/) - Shell
- [http://localhost:5173/basic-editor/](http://localhost:5173/basic-editor/) - المحرر الأساسي
- [http://localhost:5173/drama-analyst/](http://localhost:5173/drama-analyst/) - محلل الدراما
- [http://localhost:5173/multi-agent-story/](http://localhost:5173/multi-agent-story/) - العصف الذهني
- [http://localhost:5173/stations/](http://localhost:5173/stations/) - المحطات التحليلية

## 🏗️ النشر للإنتاج

### 1. البناء

```bash
pnpm run build:all
```

### 2. استخدام Nginx

نسخ ملف التكوين:
```bash
sudo cp nginx.conf /etc/nginx/sites-available/the-copy
sudo ln -s /etc/nginx/sites-available/the-copy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. تشغيل Stations كخدمة

إنشاء ملف systemd: `/etc/systemd/system/the-copy-stations.service`

```ini
[Unit]
Description=The Copy Stations Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/srv/the-copy/apps/stations
Environment="NODE_ENV=production"
Environment="GEMINI_API_KEY=your_key_here"
ExecStart=/usr/bin/node server/index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

تفعيل الخدمة:
```bash
sudo systemctl enable the-copy-stations
sudo systemctl start the-copy-stations
```

## 📁 الملفات المعدلة

### ملفات جديدة
- ✨ `tools/health-check.mjs` - أداة فحص الصحة
- ✨ `.env.example` - قالب متغيرات البيئة للجذر
- ✨ `apps/stations/.env.example`
- ✨ `apps/drama-analyst/.env.example`
- ✨ `apps/multi-agent-story/.env.example`
- 📝 `ROUTING_FIX.md` - هذا الملف

### ملفات معدلة
- 🔧 `apps/the-copy/vite.config.ts` - إضافة Proxy
- 🔧 `apps/stations/server/run-all-stations.ts` - معالجة fail-open للمفتاح
- 🔧 `package.json` - إضافة `dev:all` و`nanoid` و`npm-run-all`
- 🔧 `nginx.conf` - إضافة `/basic-editor/`

## 🎯 معايير النجاح

- ✅ كل تطبيق فرعي يعرض واجهته الفعلية وليس صفحة الـShell
- ✅ `health-check.mjs` يعيد كود خروج 0 (نجاح)
- ✅ Stations يعمل بدون `GEMINI_API_KEY` (مع تعطيل الذكاء فقط)
- ✅ `pnpm run dev:all` يشغل جميع التطبيقات بنجاح
- ✅ كل مسار فرعي يعمل بشكل مستقل دون تداخل

## 🐛 استكشاف الأخطاء

### المشكلة: `EADDRINUSE: address already in use`

**الحل**:
```bash
# إيقاف العمليات المستخدمة للمنافذ
lsof -i :5173 -i :5178 -i :5001 -i :5181 -i :5002 | grep LISTEN | awk '{print $2}' | xargs kill
```

### المشكلة: `404 Not Found` على المسارات الفرعية

**الحل**:
1. تأكد من تشغيل جميع التطبيقات: `pnpm run dev:all`
2. تحقق من إعدادات Proxy في `apps/the-copy/vite.config.ts`
3. تحقق من أن `base` صحيح في `vite.config.ts` لكل تطبيق

### المشكلة: Stations ينهار عند البدء

**الحل**:
1. تأكد من وجود `GEMINI_API_KEY` في `.env`
2. أو تجاهل الخطأ - التطبيق سيعمل بدون ميزات الذكاء

## 📚 مراجع

- [Vite Proxy Configuration](https://vitejs.dev/config/server-options.html#server-proxy)
- [Nginx Location Directive](https://nginx.org/en/docs/http/ngx_http_core_module.html#location)
- [Vite Base Option](https://vitejs.dev/config/shared-options.html#base)

---

**تاريخ الإصلاح**: 2025-10-18
**الحالة**: ✅ مكتمل ومختبر
