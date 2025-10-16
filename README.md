# The Copy - محرر السيناريو العربي الذكي

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/your-org/the-copy)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19+-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7+-646cff)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Coverage Gates](https://img.shields.io/badge/Coverage%20(Core%2FServices%2FUI)-99%25%2F94%25%2F98%25-brightgreen)](docs/testing/coverage-report.md)
[![Mutation Score](https://img.shields.io/badge/Mutation%20Score-60%25-yellow)](docs/testing/CONTRIBUTING-TESTS.md#اختبارات-الطفرات-mutation-testing)

## نظرة عامة

**The Copy** هو محرر سيناريو عربي متقدم مدعوم بالذكاء الاصطناعي، مصمم خصيصاً لكتابة وتحليل السيناريوهات العربية. يوفر المحرر واجهة مستخدم حديثة وسهلة الاستخدام مع قدرات تحليل ذكية متعددة الطبقات.

### المميزات الرئيسية

- 🎬 **محرر سيناريو متخصص** - واجهة مخصصة لكتابة السيناريوهات العربية
- 🤖 **ذكاء اصطناعي متقدم** - أكثر من 20 وكيل ذكي للتحليل والتوليد
- 📊 **تحليل شامل** - تحليل الشخصيات والحوار والإيقاع والجودة الأدبية
- 🎯 **تحسين التوتر** - تحليل وتحسين التوتر الدرامي
- 🌍 **تحليل ثقافي** - فهم السياق الثقافي والتاريخي
- 📱 **واجهة حديثة** - تصميم متجاوب وسهل الاستخدام

## الجمهور المستهدف

- **كتاب السيناريو** - المحترفون والهواة
- **منتجون ومخرجون** - لتحليل وتطوير المشاريع
- **طلاب السينما** - للتعلم والممارسة
- **شركات الإنتاج** - لتحسين جودة المحتوى

## البدء السريع

### المتطلبات

- Node.js 20.0.0 أو أحدث
- pnpm 10.0.0 أو أحدث
- متصفح حديث يدعم ES2020+
- Redis (للخادم الخلفي)
- PostgreSQL (للبيانات)

### التثبيت

```bash
# استنساخ المستودع
git clone https://github.com/your-org/the-copy.git
cd the-copy

# تثبيت التبعيات
pnpm install

# تشغيل جميع التطبيقات
pnpm run dev

# أو تشغيل تطبيق محدد
pnpm run dev:story    # Multi-Agent Story Platform
pnpm run dev:drama    # Drama Analyst
pnpm run dev:stations # Stations
pnpm run dev:basic    # Basic Editor
```

### البناء للإنتاج

```bash
# فحص الأنواع والجودة
pnpm run type-check
pnpm run lint
pnpm run test:coverage

# بناء جميع التطبيقات
pnpm run build

# بناء Docker
pnpm run docker:build
pnpm run docker:run
```

## الهندسة المعمارية

### هيكل Monorepo

```
the-copy/
├── apps/
│   ├── multi-agent-story/     # منصة التطوير القصصي متعدد الوكلاء
│   ├── drama-analyst/         # محلل الدراما المتقدم
│   ├── stations/              # محطة التحليل المتخصصة
│   ├── basic-editor/          # المحرر الأساسي
│   └── the-copy/              # التطبيق الرئيسي
├── packages/
│   ├── shared-types/          # الأنواع المشتركة
│   ├── shared-ui/             # مكونات الواجهة المشتركة
│   └── shared-utils/          # الأدوات المشتركة
└── docs/                      # الوثائق
```

### طبقات النظام

```
┌─────────────────────────────────────┐
│         واجهة المستخدم              │
│      (React + TypeScript)          │
├─────────────────────────────────────┤
│         خدمات API                  │
│      (Fastify + WebSocket)         │
├─────────────────────────────────────┤
│         نظام الطوابير              │
│      (BullMQ + Redis)              │
├─────────────────────────────────────┤
│         قاعدة البيانات             │
│      (PostgreSQL + Prisma)         │
├─────────────────────────────────────┤
│         وكلاء الذكاء الاصطناعي      │
│      (Gemini AI + Custom)          │
└─────────────────────────────────────┘
```

### المكونات الرئيسية

- **Multi-Agent Story Platform** - منصة التطوير القصصي مع 11 وكيل ذكي
- **Drama Analyst** - محلل الدراما المتقدم مع 20+ وكيل تحليلي
- **Stations** - محطة التحليل المتخصصة للسيناريوهات
- **Queue System** - نظام طوابير قوي باستخدام BullMQ
- **Authentication** - نظام مصادقة آمن مع JWT و httpOnly cookies

## حالات الاستخدام

### 1. كتابة سيناريو جديد
```typescript
import { ScreenplayEditor } from './components/editor/ScreenplayEditor';

// استخدام المحرر
<ScreenplayEditor onBack={() => navigate('home')} />
```

### 2. تحليل سيناريو موجود
```typescript
import AnalysisService from './services/AnalysisService';
import { GeminiService } from './lib/ai/geminiService';

const aiService = new GeminiService();
const analysisService = new AnalysisService(aiService);
const result = await analysisService.analyze(script);
```

### 3. استخدام الوكلاء الذكيين
```typescript
import { getAgentsByCategory, SimpleAgentExecutor } from './agents/core';

const analysisAgents = getAgentsByCategory(AgentCategory.ANALYSIS);
const executor = new SimpleAgentExecutor();
const result = await executor.execute('character-analyzer', screenplayText);
```

## أفضل الممارسات

### كتابة السيناريو
- استخدم العناوين الواضحة للمشاهد
- اكتب أسماء الشخصيات بخط واضح
- استخدم الحوار الطبيعي والمقنع
- اتبع التنسيق المعياري للسيناريو

### التحليل الذكي
- استخدم عدة وكلاء للحصول على تحليل شامل
- راجع نتائج التحليل قبل التطبيق
- استفد من التوصيات لتحسين المحتوى

## الاختبارات

### تشغيل الاختبارات
```bash
# جميع الاختبارات
pnpm run test

# اختبارات مع تغطية
pnpm run test:coverage

# فحص الجودة الشامل
pnpm run verify:all
```

### أنواع الاختبارات
- **اختبارات الوحدة** - اختبار المكونات الفردية
- **اختبارات التكامل** - اختبار التفاعل بين المكونات
- **اختبارات الأداء** - اختبار سرعة المعالجة
- **اختبارات الواجهة** - اختبار تجربة المستخدم

## النشر

### البيئات
- **التطوير** - `npm run dev`
- **الاختبار** - `npm run build && npm run preview`
- **الإنتاج** - `npm run build:prod`

### Docker
```bash
# بناء الصورة
pnpm run docker:build

# تشغيل الحاوية
pnpm run docker:run
```

## إدارة الإصدارات

نتبع [Semantic Versioning](https://semver.org/):
- **MAJOR** - تغييرات غير متوافقة
- **MINOR** - ميزات جديدة متوافقة
- **PATCH** - إصلاحات الأخطاء

## المساهمة

نرحب بمساهماتكم! يرجى قراءة [دليل المساهمة](CONTRIBUTING.md) أولاً.

### خطوات المساهمة
1. Fork المستودع
2. إنشاء فرع للميزة الجديدة
3. إجراء التغييرات مع الاختبارات
4. إرسال Pull Request

## الدعم

- **المشاكل التقنية** - [GitHub Issues](https://github.com/your-org/the-copy/issues)
- **الأسئلة العامة** - [Discussions](https://github.com/your-org/the-copy/discussions)
- **البريد الإلكتروني** - support@the-copy.com

## الترخيص

هذا المشروع مرخص تحت [رخصة MIT](LICENSE).

## الشكر

- فريق تطوير React و TypeScript
- مجتمع المطورين العرب
- جميع المساهمين في المشروع

---

**The Copy** - حيث تلتقي الإبداع بالذكاء الاصطناعي 🎬✨