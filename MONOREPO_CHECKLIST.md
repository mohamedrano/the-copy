# Monorepo Setup Checklist

## المرحلة 1: الإعداد الأساسي ✅ (مكتمل)

- [x] تثبيت pnpm (v10.18.3)
- [x] إنشاء مجلدات apps/
  - [x] apps/main-app/
  - [x] apps/basic-editor/
  - [x] apps/drama-analyst/
  - [x] apps/stations/
  - [x] apps/multi-agent-story/
- [x] إنشاء مجلدات packages/
  - [x] packages/shared-ui/
  - [x] packages/shared-types/
  - [x] packages/shared-utils/
- [x] إنشاء pnpm-workspace.yaml
- [x] إنشاء package.json الرئيسي
- [x] إنشاء tsconfig.base.json
- [x] إعداد package.json لكل حزمة مشتركة
- [x] إعداد tsconfig.json لكل حزمة مشتركة
- [x] إنشاء src/index.ts لكل حزمة
- [x] إنشاء الوثائق (README + Reports)

## المرحلة 2: نقل التطبيقات ⏳ (قيد الانتظار)

### التطبيق الرئيسي (main-app)
- [ ] نقل src/ من الجذر إلى apps/main-app/src/
- [ ] نقل public/ إلى apps/main-app/public/
- [ ] نقل vite.config.ts إلى apps/main-app/
- [ ] نقل index.html إلى apps/main-app/
- [ ] إنشاء package.json في apps/main-app/
- [ ] إنشاء tsconfig.json في apps/main-app/
- [ ] تحديث import paths
- [ ] اختبار: pnpm --filter main-app run dev

### محلل الدراما (drama-analyst)
- [ ] نقل من external/drama-analyst/ إلى apps/drama-analyst/
- [ ] التحقق من package.json
- [ ] التحقق من tsconfig.json
- [ ] تحديث import paths (إذا لزم)
- [ ] اختبار: pnpm --filter drama-analyst run dev

### المحطات (stations)
- [ ] نقل من external/stations/ إلى apps/stations/
- [ ] التحقق من package.json
- [ ] التحقق من tsconfig.json
- [ ] تحديث import paths (إذا لزم)
- [ ] اختبار: pnpm --filter stations run dev

### القصة متعددة الوكلاء (multi-agent-story)
- [ ] نقل من external/multi-agent-story/ إلى apps/multi-agent-story/
- [ ] التحقق من package.json
- [ ] التحقق من tsconfig.json
- [ ] تحديث import paths (إذا لزم)
- [ ] اختبار: pnpm --filter multi-agent-story run dev

### المحرر الأساسي (basic-editor)
- [ ] تحديد الكود المطلوب استخراجه
- [ ] إنشاء structure في apps/basic-editor/
- [ ] نقل/نسخ الكود
- [ ] إنشاء package.json
- [ ] إنشاء tsconfig.json
- [ ] إنشاء vite.config.ts
- [ ] اختبار: pnpm --filter basic-editor run dev

## المرحلة 3: استخراج الأكواد المشتركة ⏳ (قيد الانتظار)

### Shared UI (packages/shared-ui/)
- [ ] تحديد UI components المشتركة
- [ ] نقل Button components (إن وجدت)
- [ ] نقل Input components (إن وجدت)
- [ ] نقل Layout components (إن وجدة)
- [ ] إنشاء index.ts مع exports
- [ ] تحديث dependencies

### Shared Types (packages/shared-types/)
- [ ] تحديد Types المشتركة
- [ ] نقل User types (إن وجدة)
- [ ] نقل API types (إن وجدة)
- [ ] نقل Common interfaces
- [ ] إنشاء index.ts مع exports

### Shared Utils (packages/shared-utils/)
- [ ] تحديد Utility functions المشتركة
- [ ] نقل Date/Time utilities (إن وجدة)
- [ ] نقل String utilities (إن وجدة)
- [ ] نقل Validation utilities (إن وجدة)
- [ ] إنشاء index.ts مع exports

## المرحلة 4: تحديث Dependencies ⏳ (قيد الانتظار)

### إضافة shared packages للتطبيقات
- [ ] main-app: إضافة @the-copy/shared-*
- [ ] drama-analyst: إضافة @the-copy/shared-* (إذا لزم)
- [ ] stations: إضافة @the-copy/shared-* (إذا لزم)
- [ ] multi-agent-story: إضافة @the-copy/shared-* (إذا لزم)
- [ ] basic-editor: إضافة @the-copy/shared-*

### تحديث Imports
- [ ] استبدال relative imports بـ @the-copy/shared-ui
- [ ] استبدال type imports بـ @the-copy/shared-types
- [ ] استبدال utility imports بـ @the-copy/shared-utils

## المرحلة 5: الاختبار والتحقق ⏳ (قيد الانتظار)

### اختبار التطبيقات الفردية
- [ ] pnpm --filter main-app run dev (✅/❌)
- [ ] pnpm --filter drama-analyst run dev (✅/❌)
- [ ] pnpm --filter stations run dev (✅/❌)
- [ ] pnpm --filter multi-agent-story run dev (✅/❌)
- [ ] pnpm --filter basic-editor run dev (✅/❌)

### اختبار البناء
- [ ] pnpm build:main (✅/❌)
- [ ] pnpm build:drama (✅/❌)
- [ ] pnpm build:stations (✅/❌)
- [ ] pnpm build:story (✅/❌)
- [ ] pnpm build:basic (✅/❌)
- [ ] pnpm build:all (✅/❌)

### فحوصات الجودة
- [ ] pnpm type-check (في كل تطبيق)
- [ ] pnpm lint (في كل تطبيق)
- [ ] pnpm test (في كل تطبيق)
- [ ] pnpm verify:all (جميع الفحوصات)

### اختبار Shared Packages
- [ ] استيراد من @the-copy/shared-ui يعمل
- [ ] استيراد من @the-copy/shared-types يعمل
- [ ] استيراد من @the-copy/shared-utils يعمل
- [ ] TypeScript intellisense يعمل
- [ ] Hot reload يعمل مع التغييرات

## المرحلة 6: التنظيف ⏳ (قيد الانتظار)

### حذف الملفات القديمة
- [ ] حذف src/ من الجذر (بعد التأكد من النقل)
- [ ] حذف public/ من الجذر (بعد التأكد من النقل)
- [ ] حذف external/ (بعد التأكد من النقل)
- [ ] حذف vite.config.ts من الجذر
- [ ] حذف index.html من الجذر

### تحديث .gitignore
- [ ] دمج .gitignore.monorepo مع .gitignore الأساسي
- [ ] إضافة قواعد monorepo-specific
- [ ] التحقق من عدم commit node_modules

### تنظيف Dependencies
- [ ] حذف dependencies غير المستخدمة
- [ ] توحيد versions عبر workspaces
- [ ] pnpm install لتنظيف lock file

## المرحلة 7: التوثيق والنشر ⏳ (قيد الانتظار)

### تحديث الوثائق
- [ ] تحديث README.md الرئيسي
- [ ] إنشاء README.md لكل تطبيق
- [ ] تحديث CLAUDE.md مع Monorepo structure
- [ ] توثيق shared packages

### CI/CD
- [ ] تحديث GitHub Actions workflows
- [ ] إضافة workflow لكل تطبيق
- [ ] إضافة quality gates
- [ ] اختبار CI pipeline

### Git
- [ ] git add للملفات الجديدة
- [ ] git commit مع رسالة وصفية
- [ ] اختبار على branch منفصل أولاً
- [ ] merge إلى main بعد التأكد

## ملاحظات هامة

### قبل البدء في المرحلة 2
1. إنشاء git branch جديد: `git checkout -b feature/monorepo-migration`
2. عمل backup كامل للمشروع
3. التأكد من أن جميع التغييرات الحالية committed

### أثناء النقل
1. نقل تطبيق واحد في المرة
2. اختبار بعد كل نقل
3. commit بعد كل خطوة ناجحة

### بعد الانتهاء
1. اختبار شامل لجميع التطبيقات
2. مراجعة Performance
3. مراجعة Bundle sizes

---

**آخر تحديث**: 2025-10-15
**الحالة الحالية**: المرحلة 1 مكتملة ✅
**الخطوة التالية**: البدء في المرحلة 2 (نقل التطبيقات)
