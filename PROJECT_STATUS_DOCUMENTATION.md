# توثيق حالة المشروع - The Copy
## Project Status Documentation

**تاريخ التحديث**: 2025-10-15
**الإصدار**: 1.0.0
**حالة المشروع**: 🟢 قيد التطوير النشط

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [الهيكل المعماري](#الهيكل-المعماري)
3. [التطبيقات الأربعة](#التطبيقات-الأربعة)
4. [حالة البناء والنشر](#حالة-البناء-والنشر)
5. [المشاكل المعروفة](#المشاكل-المعروفة)
6. [التقنيات المستخدمة](#التقنيات-المستخدمة)
7. [خريطة الطريق](#خريطة-الطريق)
8. [فريق العمل والمساهمة](#فريق-العمل-والمساهمة)

---

## 🎯 نظرة عامة

### ما هو "The Copy"؟

**The Copy** (النسخة) هو منصة شاملة لتطوير السيناريوهات العربية، تجمع بين أربعة تطبيقات متخصصة في نظام واحد موحد. المشروع يستخدم بنية Monorepo هجينة تدمج التطبيقات المدمجة والخارجية.

### الأهداف الرئيسية

1. **توفير بيئة متكاملة** لكتابة وتحليل السيناريوهات العربية
2. **دمج الذكاء الاصطناعي** في عملية الكتابة والتحليل
3. **دعم معايير الصناعة** للسيناريوهات الدرامية
4. **تسهيل التعاون** بين الكتاب والمطورين

### الجمهور المستهدف

- 🎬 كتّاب السيناريو (محترفون وهواة)
- 🎭 منتجون ومخرجون سينمائيون
- 📚 طلاب السينما والدراما
- 🏢 شركات الإنتاج الدرامي
- 🤖 باحثو الذكاء الاصطناعي في معالجة اللغة العربية

---

## 🏗️ الهيكل المعماري

### البنية العامة

المشروع يتبع نمط **Hybrid Monorepo** باستخدام **pnpm workspaces**:

```
the-copy/
│
├── 🎯 التطبيق الرئيسي (Main App)
│   └── src/
│       ├── App.tsx (Router)
│       └── components/
│           ├── HomePage.tsx (4 أزرار)
│           ├── editor/ (القسم 1 - مدمج)
│           ├── ProjectsPage.tsx (القسم 2 - iframe)
│           ├── TemplatesPage.tsx (القسم 3 - iframe)
│           └── ExportPage.tsx (القسم 4 - iframe)
│
├── 📦 Workspaces (apps/)
│   ├── main-app/          # التطبيق الأساسي
│   ├── basic-editor/      # محرر مستقل
│   ├── drama-analyst/     # محلل الدراما
│   ├── stations/          # المحطات
│   └── multi-agent-story/ # القصة متعددة الوكلاء
│
├── 📦 Shared Packages (packages/)
│   ├── shared-ui/         # مكونات UI مشتركة
│   ├── shared-types/      # أنواع TypeScript مشتركة
│   └── shared-utils/      # وظائف مساعدة مشتركة
│
├── 🔌 External Projects (external/)
│   ├── drama-analyst/     # نسخة كاملة 29 وكيل AI
│   ├── stations/          # نظام المحطات + Express
│   └── multi-agent-story/ # Jules (React + Fastify + DB)
│
└── 📂 Public (public/)
    ├── drama-analyst/     # ✅ مبني (974 KB)
    ├── stations/          # ✅ مبني (495 KB)
    └── multi-agent-story/ # ⚠️ مشكلة (نسخة drama-analyst)
```

### نمط التكامل

| القسم | النوع | طريقة التحميل | الحالة |
|-------|------|---------------|--------|
| **القسم 1**: المحرر الأساسي | مدمج | React Component | ✅ يعمل |
| **القسم 2**: محلل الدراما | خارجي | iframe | ✅ يعمل |
| **القسم 3**: المحطات | خارجي | iframe | ✅ يعمل |
| **القسم 4**: القصة متعددة الوكلاء | خارجي | iframe | ⚠️ مشكلة |

---

## 🎬 التطبيقات الأربعة

### 1️⃣ المحرر الأساسي (Basic Editor)

**النوع**: مكون React مدمج
**الموقع**: `src/components/editor/ScreenplayEditor.tsx`
**الحجم**: جزء من التطبيق الرئيسي (~150 KB)
**الحالة**: ✅ **يعمل بشكل كامل**

#### المميزات
- ✅ محرر نصوص عربي متقدم
- ✅ تصنيف تلقائي لعناصر السيناريو
  - رؤوس المشاهد (Scene Headers)
  - أسماء الشخصيات (Character Names)
  - الحوار (Dialogue)
  - الإجراءات (Action Lines)
- ✅ معاينة فورية منسقة
- ✅ دعم RTL كامل للنصوص العربية
- ✅ حفظ واستيراد السيناريوهات

#### التقنيات
- React 18
- TypeScript
- CSS Modules
- معالج نصوص عربي مخصص

#### كيفية الوصول
```typescript
// من HomePage.tsx
<button onClick={() => onNavigate('basic-editor')}>
  📝 المحرر الأساسي
</button>

// في App.tsx
case 'basic-editor':
  return <ScreenplayEditor onBack={() => setCurrentPage('home')} />;
```

---

### 2️⃣ محلل الدراما (Drama Analyst)

**النوع**: تطبيق React SPA مستقل
**الموقع**: `external/drama-analyst/` + `apps/drama-analyst/`
**الحجم**: 974 KB (مبني)
**المنفذ**: 5179 (تطوير)
**الحالة**: ✅ **يعمل بشكل كامل**

#### المميزات الرئيسية
- 🤖 **29 وكيل ذكاء اصطناعي متخصص**:
  - 4 وكلاء أساسيين (Core)
  - 6 وكلاء تحليليين (Analytical)
  - 4 وكلاء إبداعيين (Creative)
  - 4 وكلاء تنبؤيين (Predictive)
  - 11 وحدة تحليل متقدمة

- 📊 **قدرات التحليل**:
  - تحليل الشخصيات والشبكات
  - تحليل الحوار والأنماط اللغوية
  - تحليل الإيقاع الدرامي
  - تحليل التوتر والصراع
  - تحليل السياق الثقافي
  - تقييم الجودة الأدبية

- 🎯 **التكامل**:
  - Google Gemini API
  - معالجة ملفات Word/PDF
  - PWA مع Service Worker
  - Sentry للمراقبة

#### البنية المعمارية

```
drama-analyst/
├── agents/              # 29 وكيل AI منظمة حسب الفئات
│   ├── core/           # الوكلاء الأساسيين
│   ├── analysis/       # وكلاء التحليل
│   ├── generation/     # وكلاء التوليد
│   └── evaluation/     # وكلاء التقييم
├── core/               # الأنواع والثوابت
│   ├── types.ts       # AIAgentConfig, AIRequest, etc.
│   ├── enums.ts       # TaskType, TaskCategory
│   └── constants.ts   # التكوينات
├── orchestration/      # نظام الأوركسترا
│   ├── orchestration.ts  # AIAgentOrchestraManager (Singleton)
│   ├── executor.ts       # تنفيذ المهام
│   └── promptBuilder.ts  # بناء Prompts ديناميكياً
├── services/           # الخدمات
│   ├── geminiService.ts     # تكامل Gemini API
│   └── fileReaderService.ts # معالجة الملفات
└── ui/                 # واجهة المستخدم
    ├── App.tsx
    └── components/
```

#### كيفية الوصول
```typescript
// من ProjectsPage.tsx
<ExternalAppFrame
  url="/drama-analyst/"
  title="Drama Analyst"
/>
```

#### الاستخدام النموذجي
1. المستخدم يرفع ملف سيناريو
2. يختار نوع التحليل من 29 وكيل
3. النظام يعالج النص عبر:
   - fileReaderService → ProcessedFile
   - AgentOrchestra → اختيار الوكيل المناسب
   - GeminiService → استدعاء API
   - PromptBuilder → بناء prompt محسّن
4. عرض النتائج بتنسيق عربي

---

### 3️⃣ المحطات (Stations)

**النوع**: تطبيق Full-stack (React + Express)
**الموقع**: `external/stations/` + `apps/stations/`
**الحجم**: 495 KB (مبني)
**المنفذ**: 5180 (تطوير)
**الحالة**: ✅ **يعمل بشكل كامل**

#### المميزات
- 📊 **محطات السيناريو الدرامي**:
  - الفصل الأول (Setup)
  - نقطة التحول الأولى
  - التصاعد (Rising Action)
  - نقطة المنتصف (Midpoint)
  - نقطة التحول الثانية
  - الذروة (Climax)
  - الحل (Resolution)

- 🎭 **تحليل الهيكل الدرامي**:
  - تحديد محطات القصة
  - تقييم التوازن الدرامي
  - اقتراحات التحسين
  - رسم خريطة السرد

- 🔧 **Backend API**:
  - Express.js server
  - REST API endpoints
  - معالجة البيانات
  - حفظ التحليلات

#### البنية

```
stations/
├── server/                # Express Backend
│   ├── stations/         # محطات التحليل
│   │   ├── actOne.js
│   │   ├── plotPoint1.js
│   │   ├── midpoint.js
│   │   └── ...
│   ├── routes/
│   └── services/
├── src/                  # React Frontend
│   ├── components/
│   ├── pages/
│   └── services/
└── shared/               # كود مشترك بين Frontend/Backend
```

#### كيفية الوصول
```typescript
// من TemplatesPage.tsx
<ExternalAppFrame
  url="/stations/"
  title="Stations"
/>
```

---

### 4️⃣ القصة متعددة الوكلاء (Multi-Agent Story / Jules)

**النوع**: تطبيق Full-stack معقد (React + Fastify + PostgreSQL)
**الموقع**: `external/multi-agent-story/`
**الحجم**: غير محدد (مشكلة بناء)
**المنفذ**: 5181 (frontend), 3001 (backend)
**الحالة**: ⚠️ **يوجد مشكلة - قيد الإصلاح**

#### المميزات المخططة
- 🤖 **نظام وكلاء متعدد**:
  - وكيل الحبكة (Plot Agent)
  - وكيل الشخصيات (Character Agent)
  - وكيل الحوار (Dialogue Agent)
  - وكيل البيئة (Setting Agent)
  - وكيل التنسيق (Coordinator Agent)

- 📝 **توليد القصص**:
  - توليد تعاوني للقصص
  - تطوير الشخصيات
  - بناء الأحداث
  - حفظ الجلسات

- 🔧 **البنية التحتية**:
  - Fastify backend
  - PostgreSQL database (Prisma ORM)
  - WebSocket للتواصل الحي
  - نظام الجلسات

#### البنية المعقدة

```
multi-agent-story/
├── jules-frontend/        # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── StoryGeneration.tsx
│   │   │   ├── AgentsView.tsx
│   │   │   └── SessionHistory.tsx
│   │   ├── services/
│   │   │   ├── apiClient.ts
│   │   │   └── websocketClient.ts
│   │   └── App.tsx
│   ├── vite.config.ts
│   └── package.json
│
├── jules-backend/         # Fastify API
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   └── controllers/
│   │   ├── services/
│   │   │   ├── agentService.ts
│   │   │   ├── storyService.ts
│   │   │   └── sessionService.ts
│   │   ├── agents/
│   │   │   ├── PlotAgent.ts
│   │   │   ├── CharacterAgent.ts
│   │   │   └── ...
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── package.json
│
└── package.json           # Root package.json
```

#### المشكلة الحالية

⚠️ **المشكلة**: `public/multi-agent-story/` يحتوي على نسخة من drama-analyst بدلاً من Jules!

**الأسباب المحتملة**:
1. فشل بناء `jules-frontend`
2. خطأ في script النسخ
3. تكوين `vite.config.ts` غير صحيح
4. مشاكل في dependencies

**خطوات الإصلاح المطلوبة**:
```bash
# 1. التحقق من بناء Frontend
cd external/multi-agent-story/jules-frontend
pnpm install
pnpm build  # يجب أن ينشئ dist/

# 2. التحقق من vite.config.ts
# يجب أن يحتوي على:
# base: '/multi-agent-story/'
# outDir: '../../../public/multi-agent-story/'

# 3. إعادة البناء ونسخ الملفات
pnpm build
ls -lh ../../../public/multi-agent-story/

# 4. التحقق من Backend
cd ../jules-backend
pnpm install
pnpm build
```

---

## 🚀 حالة البناء والنشر

### حالة البناء (Build Status)

| التطبيق | حالة البناء | الحجم | آخر بناء ناجح |
|---------|-------------|-------|---------------|
| **Main App** | ✅ نجح | ~2 MB | 2025-10-15 |
| **Basic Editor** | ✅ نجح | مدمج | - |
| **Drama Analyst** | ✅ نجح | 974 KB | 2025-10-14 |
| **Stations** | ✅ نجح | 495 KB | 2025-10-14 |
| **Multi-Agent Story** | ❌ فشل | - | - |

### أوامر البناء

```bash
# بناء جميع التطبيقات
pnpm build              # كل شيء
pnpm build:main         # التطبيق الرئيسي
pnpm build:drama        # Drama Analyst → public/drama-analyst/
pnpm build:stations     # Stations → public/stations/
pnpm build:story        # Multi-agent → public/multi-agent-story/

# التحقق من النوع والجودة
pnpm type-check         # فحص TypeScript
pnpm lint              # فحص ESLint
pnpm test              # الاختبارات

# التحقق الشامل
pnpm verify:all        # type-check + lint + test
```

### بيئات النشر

| البيئة | URL | الحالة | الاستخدام |
|--------|-----|--------|-----------|
| **Development** | `localhost:5177` | 🟢 نشط | التطوير المحلي |
| **Preview** | `localhost:4173` | 🟡 متاح | معاينة البناء |
| **Staging** | TBD | ⚪ غير مفعّل | الاختبار قبل الإنتاج |
| **Production** | TBD | ⚪ غير مفعّل | البيئة الحية |

### Docker Support

```bash
# بناء صورة Docker
docker build -t the-copy:latest .

# تشغيل الحاوية
docker run -p 80:80 the-copy:latest

# Docker Compose
docker-compose up -d
```

---

## ⚠️ المشاكل المعروفة

### 🔴 مشاكل حرجة (Critical)

#### 1. Multi-Agent Story - Build Failure
**الوصف**: فشل بناء تطبيق Jules وظهور drama-analyst بدلاً منه
**التأثير**: القسم 4 لا يعمل، يعرض محتوى خاطئ
**الأولوية**: 🔴 عالية جداً
**الحالة**: قيد التحقيق

**خطوات الحل**:
1. فحص `jules-frontend/vite.config.ts`
2. التأكد من path: `outDir: '../../../public/multi-agent-story/'`
3. فحص dependencies في `package.json`
4. إعادة بناء من الصفر
5. التحقق من scripts في root `package.json`

#### 2. Build Script للتطبيقات الخارجية
**الوصف**: عدم وجود script موحد لبناء جميع التطبيقات الخارجية
**التأثير**: بناء يدوي لكل تطبيق
**الأولوية**: 🟡 متوسطة
**الحالة**: مقترح للتحسين

**الحل المقترح**:
```json
// في root package.json
{
  "scripts": {
    "build:external": "npm run build:drama && npm run build:stations && npm run build:story",
    "build:prod": "npm run build:external && npm run build:main"
  }
}
```

### 🟡 مشاكل ثانوية (Minor)

#### 3. تكرار Dependencies
**الوصف**: بعض الحزم مكررة في workspaces مختلفة
**التأثير**: زيادة حجم `node_modules/`
**الأولوية**: 🟢 منخفضة
**الحالة**: مقبول حالياً

**التحسين المقترح**: استخدام shared packages أكثر

#### 4. توثيق غير مكتمل
**الوصف**: بعض المكونات تفتقر للتوثيق
**التأثير**: صعوبة الصيانة للمطورين الجدد
**الأولوية**: 🟢 منخفضة
**الحالة**: جاري العمل عليه (هذا الملف!)

---

## 🛠️ التقنيات المستخدمة

### Frontend Stack

| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| **React** | 18.2 - 19.2 | إطار العمل الأساسي |
| **TypeScript** | 5.3 - 5.9 | لغة البرمجة |
| **Vite** | 5.2 - 7.1 | أداة البناء |
| **Tailwind CSS** | 4.1.13+ | التنسيق |
| **Lucide React** | 0.545.0 | الأيقونات |

### Backend Stack

| التقنية | الإصدار | التطبيق |
|---------|---------|----------|
| **Express** | Latest | Stations |
| **Fastify** | Latest | Multi-Agent Story |
| **PostgreSQL** | 15+ | Multi-Agent Story (Database) |
| **Prisma** | Latest | ORM للـ database |

### AI & ML

| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| **Google Gemini API** | 0.24.1 | محرك الذكاء الاصطناعي |
| **@google/generative-ai** | Latest | SDK للتكامل |

### DevOps & Tools

| الأداة | الإصدار | الغرض |
|--------|---------|-------|
| **pnpm** | 10.18.3 | مدير الحزم |
| **ESLint** | 8.57+ | Linting |
| **Prettier** | Latest | Code formatting |
| **Vitest** | 3.2.4 | Unit testing |
| **Playwright** | 1.56.0 | E2E testing |
| **Sentry** | 10.18.0 | Error tracking |

### Monitoring & Analytics

- **Sentry**: تتبع الأخطاء في الإنتاج
- **Web Vitals**: قياس أداء التطبيق
- **Lighthouse**: تقييم الجودة

---

## 🗺️ خريطة الطريق

### ✅ المكتمل (Q4 2024 - Q1 2025)

- [x] إنشاء البنية الأساسية للمشروع
- [x] تطوير المحرر الأساسي
- [x] بناء Drama Analyst مع 29 وكيل
- [x] تطوير نظام Stations
- [x] تحويل المشروع إلى Monorepo
- [x] إعداد pnpm workspaces
- [x] تكامل iframe للتطبيقات الخارجية
- [x] إنشاء توثيق شامل

### 🟡 قيد العمل (Q2 2025)

- [ ] إصلاح بناء Multi-Agent Story
- [ ] تحسين نظام الوكلاء الذكيين
- [ ] إضافة اختبارات شاملة
- [ ] تحسين الأداء والتحميل
- [ ] إضافة دعم offline للتطبيقات

### 🔮 المخطط (Q3-Q4 2025)

#### الميزات الجديدة

1. **نظام المستخدمين والمصادقة**
   - تسجيل الدخول
   - حفظ السيناريوهات في السحابة
   - مشاركة السيناريوهات

2. **التعاون الحي (Real-time Collaboration)**
   - تحرير متزامن
   - تعليقات وملاحظات
   - نظام إشعارات

3. **مكتبة القوالب**
   - قوالب سيناريو جاهزة
   - قوالب حسب النوع (دراما، كوميديا، إلخ)
   - مشاركة القوالب من المجتمع

4. **تحسينات AI**
   - نماذج AI محلية (llama.cpp)
   - تحليل أكثر دقة
   - توليد محتوى إبداعي محسّن

5. **التصدير المتقدم**
   - PDF احترافي
   - Final Draft format
   - Fountain format
   - HTML/Web view

#### التحسينات التقنية

1. **الأداء**
   - Code splitting محسّن
   - Lazy loading للمكونات
   - Service Workers للتخزين المؤقت
   - Image optimization

2. **التجربة**
   - UI/UX محسّن
   - Dark mode
   - Accessibility (A11y)
   - i18n support (English + Arabic)

3. **DevOps**
   - CI/CD pipeline
   - Automated testing
   - Docker optimization
   - Kubernetes deployment

---

## 👥 فريق العمل والمساهمة

### هيكل الفريق (مقترح)

```
Project Owner
    │
    ├── Frontend Lead
    │   ├── React Developers (2-3)
    │   └── UI/UX Designer
    │
    ├── Backend Lead
    │   ├── Node.js Developers (2)
    │   └── Database Administrator
    │
    ├── AI/ML Lead
    │   ├── NLP Engineers (2)
    │   └── Prompt Engineers (2)
    │
    └── DevOps Engineer
```

### المساهمة

نرحب بالمساهمات! يرجى اتباع هذه الخطوات:

1. **Fork المشروع**
2. **إنشاء فرع للميزة**: `git checkout -b feature/amazing-feature`
3. **Commit التغييرات**: `git commit -m 'Add amazing feature'`
4. **Push للفرع**: `git push origin feature/amazing-feature`
5. **فتح Pull Request**

#### معايير المساهمة

- ✅ كود نظيف ومُنسّق (ESLint + Prettier)
- ✅ اختبارات للميزات الجديدة
- ✅ توثيق شامل
- ✅ Commit messages واضحة
- ✅ مراجعة الكود (Code Review)

### الاتصال

- **المشاكل التقنية**: [GitHub Issues](https://github.com/your-org/the-copy/issues)
- **الأسئلة**: [GitHub Discussions](https://github.com/your-org/the-copy/discussions)
- **البريد الإلكتروني**: support@the-copy.com (TBD)

---

## 📊 إحصائيات المشروع

### حجم الكود (تقريبي)

| المقياس | القيمة |
|---------|--------|
| **إجمالي الملفات** | ~2,500 |
| **سطور الكود** | ~75,000 |
| **Components React** | ~150 |
| **AI Agents** | 29 |
| **API Endpoints** | ~40 |
| **Tests** | ~200 |

### التبعيات (Dependencies)

- **Production Dependencies**: ~50
- **Dev Dependencies**: ~80
- **Total Package Size**: ~500 MB (node_modules)
- **Built Size**: ~3.5 MB (compressed)

---

## 📝 ملاحظات إضافية

### الأمان (Security)

- ✅ API keys في متغيرات البيئة
- ✅ HTTPS فقط في الإنتاج
- ✅ CSP headers مُفعّلة
- ✅ Input sanitization
- ⚠️ Auth system (مخطط)

### الأداء (Performance)

- ✅ Code splitting
- ✅ Tree shaking
- ✅ Minification
- ✅ Compression
- ⚠️ CDN (مخطط)

### الصيانة (Maintenance)

- ✅ TypeScript strict mode
- ✅ ESLint configuration
- ✅ Automated testing
- ⚠️ CI/CD (قيد الإعداد)

---

## 🎓 الموارد والمراجع

### التوثيق الداخلي

- [CLAUDE.md](./CLAUDE.md) - دليل Claude Code
- [README.md](./README.md) - مقدمة المشروع
- [ARCHITECTURE.md](./ARCHITECTURE.md) - الهندسة المعمارية
- [CONTRIBUTING.md](./CONTRIBUTING.md) - دليل المساهمة
- [external/README.md](./external/README.md) - التطبيقات الخارجية
- [external/BUILD_GUIDE.md](./external/BUILD_GUIDE.md) - دليل البناء

### الموارد الخارجية

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Google Gemini API Docs](https://ai.google.dev/docs)

---

## 📜 الترخيص

هذا المشروع مرخص تحت **MIT License** - انظر ملف [LICENSE](./LICENSE) للتفاصيل.

---

## 🙏 الشكر والتقدير

- فريق React و TypeScript
- مجتمع المطورين العرب
- Google AI team (Gemini)
- جميع المساهمين في المشروع
- مستخدمي التطبيق ومُقدّمي الملاحظات

---

**آخر تحديث**: 2025-10-15
**الإصدار**: 1.0.0
**الحالة**: 🟢 نشط ومُحدّث

**تم إنشاؤه بواسطة**: Claude Code
**للاستخدام مع**: فريق تطوير The Copy
