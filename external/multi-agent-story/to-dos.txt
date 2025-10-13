# مشروع: Jules Platform — تحويل التطبيق إلى Production-Ready

> **أمر توجيهي (Prompt) شامل وقابل للتنفيذ لوكيل ترميز** لتنفيذ جميع توصيات تقرير تدقيق جاهزية الإنتاج المرفق وتحويل المنصة إلى جاهزية إنتاج فعلية، مع توثيق، اختبارات، وميزانيات أداء واضحة.

---

## 📋 نظرة عامة

* **نوع المشروع:** Web Application — TypeScript (Node.js 20+ / Fastify / React+Vite / PostgreSQL / Redis / Docker)
* **البيئة المستهدفة:** نشر متعدد الحاويات عبر Docker (Backend/Frontend/DB/Redis/NGINX)
* **الهدف:** إزالة حواجز P0 بالكامل، إغلاق فجوات الأمان والمرصودية، ضبط الأداء والهيكلة، وإطلاق خط CI/CD موثوق يضمن جودة الكود.
* **مستوى الجودة المطلوب:** Production-Grade (صفر أخطاء TypeScript، صفر ثغرات عالية/حرجة، تغطية اختبارات ≥ 80%، التزام بميزانيات الأداء).

## 🎯 الأهداف الرئيسية

1. فك انسداد البناء (114 خطأ TypeScript) وتحديث Prisma Schema ليتطابق مع الكود.
2. إغلاق ثغرة @fastify/jwt وتحديث تبعيات الأمان، وتشديد CSP، وتفعيل Rate Limiting وأسرار Docker.
3. إنشاء مرصودية (Observability): Prometheus metrics + Structured logging مع Correlation IDs.
4. خفض حجم الحِزم الأمامية (Bundle Size) إلى الميزانيات المحددة وتفعيل التقسيم.
5. تأسيس CI/CD كامل على GitHub Actions حتى بناء صور Docker ونشر Staging.
6. تأسيس اختبارات وحدة/تكامل/E2E مع تغطية ≥ 80%، واختبار تحميل API.

## ⚙️ المعايير الإلزامية

* ✅ TypeScript Strict، صفر أخطاء `npm run type-check` في الواجهة والخلفية.
* ✅ أمن: صفر ثغرات High/Critical في `npm audit`، أسرار عبر Docker Secrets، CSP خالية من `unsafe-inline/unsafe-eval`.
* ✅ مرصودية: `/metrics` مكشوفة بـ Prometheus، تسجيل منظم مع `correlationId`.
* ✅ أداء: Budgets — Main bundle < 500KB gzipped، Vendor < 300KB، TTI < 3.5s، p95 API < 200ms.
* ✅ هيكلة: فصل إعدادات البيئات (dev/stage/prod)، Versioned API (`/api/v1`)، وDependency Injection بدون `new Service()` في المسارات.
* ❌ محظور: استخدام `any` غير مبرر، أسرار داخل `.env` للإنتاج، `console.log` مكان الـ logger، إنشاء الخدمات مباشرة داخل الـ routes.

---

# 📦 المرحلة 1: P0 — فك الانسداد وإصلاحات حرجة

**الأولوية:** 🔴 حرجة

### المهمة 1.1: إصلاح الوصول إلى متغيرات البيئة (config.ts)

**الوصف:** استخدام bracket notation بدل dot لحل `noPropertyAccessFromIndexSignature`.
**الخطوات التنفيذية:**

1. طبّق الفرق المقترح **P0-FIX-001** على `jules-backend/src/config.ts` (استبدال `process.env.VAR` بـ `process.env['VAR']`).
2. أضف دالة التحقق `validateConfig()` مع شروط الطول للـ `JWT_SECRET` و`ENCRYPTION_KEY` (**P0-FIX-004**).

```bash
cd jules-backend
sed -i 's/process\.env\.\([A-Z_]\+\)/process.env["\1"]/g' src/config.ts
```

**التقنيات:** TypeScript، ts-node.
**معايير القبول:**

* [ ] ينجح `npm run type-check` في الخلفية دون أخطاء متعلقة بـ env.
* [ ] عند نقص المتغيرات/قصر الأطوال، يفشل التشغيل برسالة خطأ واضحة.

---

### المهمة 1.2: تصحيح نمط التصدير في `decision.service.ts`

**الوصف:** الملف لا يُعامَل كـ module؛ أضف `export` صريح.
**الخطوات:**

1. أضف `export`/`export default` للوظائف/الكائنات الرئيسية.
2. أصلح الاستيرادات المرتبطة في الملفات الثلاثة المتأثرة.
   **معايير القبول:**

* [ ] اختفاء أخطاء الاستيراد في الملفات الثلاثة.
* [ ] نجاح بناء الخلفية.

---

### المهمة 1.3: مواءمة Prisma Schema مع الكود

**الوصف:** حقول ناقصة تسبب 40+ خطأ TS.
**الخطوات:**

1. طبّق الفرق **P0-FIX-002** لإضافة الحقول (`title`, `configuration`, `usageCount`, `lastUsedAt`, `content`, `metadata`, `overallScore`, `status`…).
2. شغّل:

```bash
cd jules-backend
npx prisma generate
npx prisma migrate dev --name add_missing_fields
npm run type-check
```

**معايير القبول:**

* [ ] انخفاض أخطاء TS المتعلقة بالنماذج إلى 0.
* [ ] نجاح أوامر Prisma دون فشل.

---

### المهمة 1.4: معالجة ثغرة @fastify/jwt وتبعيات الأمان

**الوصف:** غلق CVE عبر تحديث التبعيات والقفل.
**الخطوات:**

```bash
cd jules-backend
npm audit fix --force
npm update @fastify/jwt@^10.0.0
npm audit --audit-level=high
```

**معايير القبول:**

* [ ] 0 ثغرات High/Critical في الخلفية والواجهة.

---

### المهمة 1.5: تثبيت تبعية مفقودة للمسارات

**الوصف:** فشل البناء بسبب `fastify-type-provider-zod` غير مثبتة.

```bash
cd jules-backend
npm i fastify-type-provider-zod
npm run build
```

**معايير القبول:**

* [ ] نجاح بناء الخلفية.

---

### المهمة 1.6: تصحيح مسارات Docker Compose

**الوصف:** سياقات بناء خاطئة.
**الخطوات:**

1. طبّق **P0-FIX-003** على `docker-compose.yml` لتصبح `./jules-backend` و`./jules-frontend`.
2. أعد البناء:

```bash
docker-compose build
```

**معايير القبول:**

* [ ] بناء ناجح لكل الخدمات.

---

# 🟠 المرحلة 2: أمن وإعدادات إنتاج

**الأولوية:** 🟠 عالية

### المهمة 2.1: تشديد Content-Security-Policy (NGINX)

**الخطوات:**

* حدّث `nginx.conf` لإزالة `unsafe-inline` و`unsafe-eval`، مثال:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self';" always;
```

**التحقق:**

```bash
curl -I http://localhost | grep -i content-security-policy
```

**معايير القبول:**

* [ ] CSP خالية من `unsafe-*`.

---

### المهمة 2.2: Rate Limiting على جميع الـ endpoints

**الخطوات:**

```ts
// في bootstrap الخاص بـ Fastify
import rateLimit from '@fastify/rate-limit';
await fastify.register(rateLimit, { max: 100, timeWindow: '1 minute' });
```

**التحقق:**

```bash
ab -n 1000 -c 10 http://localhost:8000/api/v1/health
```

**معايير القبول:**

* [ ] استجابات 429 عند تجاوز الحد.

---

### المهمة 2.3: أسرار الإنتاج عبر Docker Secrets

**الخطوات:**

* عرّف أسرار `JWT_SECRET`, `ENCRYPTION_KEY`, `DATABASE_URL` في `docker-compose.prod.yml`:

```yaml
services:
  backend:
    secrets:
      - jwt_secret
      - encryption_key
      - database_url
secrets:
  jwt_secret: { file: ./secrets/jwt_secret.txt }
  encryption_key: { file: ./secrets/encryption_key.txt }
  database_url: { file: ./secrets/database_url.txt }
```

**معايير القبول:**

* [ ] عدم تمرير أسرار كمتغيرات بيئة مباشرة في الإنتاج.

---

# 🟠 المرحلة 3: الجودة والقابلية للصيانة

**الأولوية:** 🟠 عالية

### المهمة 3.1: تصفير أخطاء TypeScript وتخفيف `any`

**الخطوات:**

```bash
cd jules-backend && npm run type-check
cd ../jules-frontend && npm run type-check
```

* استبدال `any`، توحيد types وفق `prisma/schema`.
  **معايير القبول:**
* [ ] 0 أخطاء TypeScript في المشروعين.

---

### المهمة 3.2: ESLint/Prettier وتقليم الكود الميت

**الخطوات:**

```bash
npm run lint:fix
npm i -D prettier && echo '{ "singleQuote": true }' > .prettierrc
npm run format
npx ts-prune
```

**معايير القبول:**

* [ ] `npm run lint` = 0 errors و < 10 warnings
* [ ] `ts-prune` يُظهر < 5 unused exports

---

### المهمة 3.3: كسر الدوائر وتعقيد الدوال

**الخطوات:**

```bash
npx madge --circular src/
npx eslint src/ --ext .ts --format json | jq '.[] | select(.messages[].ruleId == "complexity")'
```

**معايير القبول:**

* [ ] 0 دوائر
* [ ] كل الدوال `complexity < 10`

---

# 🟡 المرحلة 4: الأداء والحزم الأمامية

**الأولوية:** 🟡 متوسطة

### المهمة 4.1: تقليل أحجام الحزم — Code Splitting/Tree Shaking

**الخطوات:**

* فعّل visualizer و`manualChunks` في `vite.config.ts`:

```ts
import { visualizer } from 'rollup-plugin-visualizer';
export default defineConfig({
  plugins: [react(), visualizer({ open: true, gzipSize: true })],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'state-vendor': ['zustand', '@tanstack/react-query']
        }
      }
    }
  }
});
```

**التحقق:**

```bash
cd jules-frontend
npm run build && ls -lh dist/assets/*.js
```

**معايير القبول:**

* [ ] Main bundle < 500KB gzipped، Vendor < 300KB، إجمالي التحميل الأولي < 800KB

---

### المهمة 4.2: Redis Caching + فهارس قاعدة البيانات

**الخطوات:**

* تفعيل تخزين مؤقت لجلسات/استجابات متكررة.
* إضافة فهارس Prisma ملائمة والاستدلال بـ `EXPLAIN ANALYZE`.
  **التحقق:**

```bash
redis-cli INFO stats | grep hit
# تشغيل EXPLAIN ANALYZE على الاستعلامات الحرجة
```

**معايير القبول:**

* [ ] Cache hit ratio > 70%
* [ ] زمن الاستعلام < 100ms

---

# 🟠 المرحلة 5: المرصودية (Observability) والتسجيل

**الأولوية:** 🟠 عالية

### المهمة 5.1: Prometheus Metrics + Endpoint

**أضف الملفات التالية:**

```ts
// jules-backend/src/utils/metrics.ts
import promClient from 'prom-client';
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });
export const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});
export { register };
```

```ts
// jules-backend/src/api/routes/metrics.routes.ts
import { FastifyPluginAsync } from 'fastify';
import { register } from '../../utils/metrics';
export const metricsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/metrics', async (_req, reply) => {
    reply.type('text/plain');
    return register.metrics();
  });
};
```

**معايير القبول:**

* [ ] `GET /metrics` يُرجع مقاييس صالحة للقراءة من Prometheus.

---

### المهمة 5.2: Structured Logging + Correlation IDs

**الخطوات:**

* أضف `correlationId` من `req.id` لجميع السجلات:

```ts
logger.info('Request received', {
  correlationId: req.id,
  method: req.method,
  url: req.url,
  userId: req.user?.id
});
```

**معايير القبول:**

* [ ] كل طلب يُسجَّل بـ `correlationId` موحّد عبر السلسلة.

---

# 🟡 المرحلة 6: الهيكلة (Config Separation / API v1 / DI)

**الأولوية:** 🟡 متوسطة

### المهمة 6.1: فصل إعدادات البيئات

**الخطوات:**

* أنشئ `config/production.ts`, `config/stage.ts`, `config/development.ts`، واستورد حسب `NODE_ENV`.
  **معايير القبول:**
* [ ] وجود 3 ملفات إعدادات واستخدامها فعليًا.

---

### المهمة 6.2: Versioned API

**الخطوات:**

* نقل جميع المسارات إلى `/api/v1/*` وتعديل الاختبارات والـ clients وفقًا لذلك.
  **معايير القبول:**
* [ ] جميع الـ endpoints تعمل تحت `/api/v1`.

---

### المهمة 6.3: Dependency Injection (tsyringe)

**الخطوات:**

* أضف `tsyringe`، وامنع إنشاء الخدمات مباشرة داخل routes.
* اربط الخدمات عبر الحاقن (container) وحقنها في الـ handlers.
  **معايير القبول:**
* [ ] لا يوجد `new Service()` داخل routes؛ المراقبة عبر ESLint rule مخصصة إن لزم.

---

# 🟠 المرحلة 7: الاختبارات (Unit/Integration/E2E) واختبار التحميل

**الأولوية:** 🟠 عالية

### المهمة 7.1: Unit/Integration — Backend

**الخطوات:**

```bash
cd jules-backend
npm run test:coverage
```

**معايير القبول:**

* [ ] Statements ≥ 80%، Branches ≥ 70%، Functions ≥ 75%، Lines ≥ 80%

### المهمة 7.2: E2E — Frontend

**الخطوات:**

* أضف Playwright/Cypress وتشغيل سيناريوهات حرجة.

```bash
cd jules-frontend
npm run test:e2e
```

**معايير القبول:**

* [ ] نجاح جميع سيناريوهات E2E الحرجة.

### المهمة 7.3: Load Testing — API

```bash
ab -n 10000 -c 100 http://localhost:8000/api/v1/health
```

**معايير القبول:**

* [ ] 0 failed requests، p95 < 200ms، p99 < 500ms

---

# 🟠 المرحلة 8: CI/CD — GitHub Actions → Docker Images

**الأولوية:** 🟠 عالية

### المهمة 8.1: إنشاء خطوط CI (Lint/Type-check/Test/Build/Security)

**الخطوات:**

* أضف ملف workflow كما في التقرير (`.github/workflows/ci.yml`) بمراحل:

  * `lint`، `type-check`، `test` مع خدمات Postgres/Redis، `build` مع رفع artifacts،
  * `security-scan` (npm audit + Trivy + رفع SARIF)،
  * `docker-build` (Buildx + push لـ backend/frontend بعلامات `sha` و`latest`).
    **معايير القبول:**
* [ ] جميع وظائف CI تمر على `main` و`develop`.
* [ ] رفع artifacts لبناء الواجهة والخلفية.
* [ ] صور Docker مُنشأة ومرفوعة إلى السجل.

---

# 🟠 المرحلة 9: Assemble → Grade → Mix → Render → Export (خطة تشغيلية)

**الأولوية:** 🟠 عالية

### المهمة 9.1: Assemble

```bash
git checkout -b production-readiness-fixes
git pull origin main
npm install -g npm-check-updates
cd jules-backend && ncu -u && npm install
cd ../jules-frontend && ncu -u && npm install
```

### المهمة 9.2: Grade (تطبيق إصلاحات P0)

* نفّذ المهام 1.1 → 1.6 بالتسلسل، وكل خطوة في **commit** مستقل:

```bash
git add . && git commit -m "fix(P0): env access + config validation"
# ...
```

### المهمة 9.3: Mix (Observability + Frontend Bundles)

* نفّذ مهام المراحل 4 و5 مع توثيق المخرجات (صور visualizer/metrics).

### المهمة 9.4: Render (بناء نهائي + Smoke Tests)

```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
sleep 10
curl -f http://localhost:8000/api/v1/health
curl -f http://localhost:8000/metrics | grep http_request_duration
curl -f http://localhost:3000 | grep "Jules"
docker exec jules-backend-prod npx prisma db pull
```

### المهمة 9.5: Export (إطلاق مضبوط)

* قائمة ما قبل النشر (الاختبارات/الأمن/نسخ احتياطي/خطة تراجع).
* ترحيل قاعدة البيانات:

```bash
docker exec jules-backend-prod npx prisma migrate deploy
```

* نشر خدمات backend وfrontend مع `--no-deps --build`.
* مراقبة 24–72 ساعة (error rate/latency/CPU/Memory/DB).

---

## 🔍 التحقق النهائي

**Checklist:**

* [ ] `npm run type-check` (frontend/backend) = 0 أخطاء
* [ ] `npm run build` (frontend/backend) ناجح
* [ ] `npm audit --audit-level=high` = 0 High/Critical
* [ ] `/metrics` متاح ويُجمعه Prometheus
* [ ] Bundles ضمن الميزانيات
* [ ] تغطية الاختبارات ≥ المتطلبات
* [ ] CI يمر، وصور Docker مرفوعة
* [ ] Staging يعمل وSmoke/E2E ناجحة

**أوامر الاختبار النهائية:**

```bash
# Backend
cd jules-backend && npm run type-check && npm run build && npm run test:coverage
# Frontend
cd ../jules-frontend && npm run type-check && npm run build && npm run test:e2e
# Docker
docker-compose build
# أمن
cd ../jules-backend && npm audit --audit-level=high
cd ../jules-frontend && npm audit --audit-level=high
# أداء
ab -n 1000 -c 10 http://localhost:8000/api/v1/health
```

## 📝 التوثيق المطلوب

* تقرير تنفيذ جاهزية الإنتاج (قبل/بعد) مع: قائمة الإصلاحات، لقطات visualizer، ميزانيات الأداء، نتائج الاختبارات والتغطية.
* ADR لنسخة API v1 وفصل الإعدادات والـ DI.
* توثيق تشغيل Prometheus ونتائج `/metrics`.

## ⚠️ ملاحظات مهمة

* احتفظ بكل خطوة في **commit** مستقل مع رسالة واضحة.
* سجّل مخرجات الأوامر والنتائج في مستند `docs/production-readiness/YYYYMMDD/`.
* لا تعتمد على متغيرات `.env` في الإنتاج؛ استخدم Docker Secrets حصراً.

---

### 👨‍💻 تعليمات تنفيذ للوكيل (Runbook قصير)

1. ابدأ من **المرحلة 1** وأنهِ جميع مهام P0 بالتسلسل.
2. انتقل إلى الأمن/الجودة/الأداء/المرصودية حسب ترتيب المراحل والأولويات.
3. بعد كل مهمة: شغّل أوامر **التحقق** وسجّل الدليل (logs/screenshots).
4. لا تنتقل للمرحلة التالية حتى تُستوفى **معايير القبول** بالكامل.
5. اختم ببناء صور Docker، تشغيل Staging، وتشغيل **Smoke/E2E/Load**، ثم ارفع التقرير النهائي.
