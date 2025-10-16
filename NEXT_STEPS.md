# الخطوات التالية - تعليمات البدء

## الحالة الحالية ✅

تم بنجاح إعداد البنية الأساسية لـ Monorepo. المشروع الآن جاهز لنقل التطبيقات.

---

## الخطوة الأولى: إنشاء Git Branch

**قبل أي شيء، أنشئ branch جديد:**

```bash
cd h:\the-copy
git checkout -b feature/monorepo-migration
git add apps/ packages/ pnpm-workspace.yaml tsconfig.base.json *.md
git commit -m "feat: setup monorepo structure with pnpm workspaces"
```

---

## الخطوة الثانية: نقل التطبيق الرئيسي

### 1. إنشاء package.json في apps/main-app/

```bash
cd apps/main-app
```

أنشئ `package.json`:

```json
{
  "name": "main-app",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "vitest run",
    "clean": "rm -rf dist"
  }
}
```

### 2. إنشاء tsconfig.json في apps/main-app/

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/agents/*": ["./src/agents/*"],
      "@/services/*": ["./src/services/*"],
      "@the-copy/shared-ui": ["../../packages/shared-ui/src"],
      "@the-copy/shared-types": ["../../packages/shared-types/src"],
      "@the-copy/shared-utils": ["../../packages/shared-utils/src"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. نقل الملفات

```bash
# من الجذر
cd h:\the-copy

# نقل المجلدات
mv src apps/main-app/
mv public apps/main-app/

# نقل الملفات
mv vite.config.ts apps/main-app/
mv index.html apps/main-app/
```

### 4. تحديث vite.config.ts في apps/main-app/

تأكد من أن المسارات صحيحة:

```typescript
// في apps/main-app/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@the-copy/shared-ui': path.resolve(__dirname, '../../packages/shared-ui/src'),
      '@the-copy/shared-types': path.resolve(__dirname, '../../packages/shared-types/src'),
      '@the-copy/shared-utils': path.resolve(__dirname, '../../packages/shared-utils/src'),
    }
  }
})
```

### 5. تثبيت Dependencies

```bash
# من الجذر
cd h:\the-copy
/c/Users/menot/AppData/Roaming/npm/pnpm install
```

### 6. اختبار التطبيق الرئيسي

```bash
/c/Users/menot/AppData/Roaming/npm/pnpm --filter main-app run dev
```

يجب أن يعمل على http://localhost:5173

### 7. Commit التغييرات

```bash
git add apps/main-app/
git commit -m "feat: migrate main app to monorepo structure"
```

---

## الخطوة الثالثة: نقل التطبيقات الخارجية

### 1. نقل drama-analyst

```bash
cd h:\the-copy

# نقل المجلد كله
cp -r external/drama-analyst/* apps/drama-analyst/

# التحقق من package.json
cd apps/drama-analyst
# تحديث name إلى "drama-analyst" إذا لزم
```

### 2. اختبار drama-analyst

```bash
cd h:\the-copy
/c/Users/menot/AppData/Roaming/npm/pnpm --filter drama-analyst install
/c/Users/menot/AppData/Roaming/npm/pnpm --filter drama-analyst run dev
```

### 3. كرر نفس العملية لـ stations و multi-agent-story

```bash
# stations
cp -r external/stations/* apps/stations/
/c/Users/menot/AppData/Roaming/npm/pnpm --filter stations install
/c/Users/menot/AppData/Roaming/npm/pnpm --filter stations run dev

# multi-agent-story
cp -r external/multi-agent-story/* apps/multi-agent-story/
/c/Users/menot/AppData/Roaming/npm/pnpm --filter multi-agent-story install
/c/Users/menot/AppData/Roaming/npm/pnpm --filter multi-agent-story run dev
```

### 4. Commit

```bash
git add apps/
git commit -m "feat: migrate external apps to monorepo"
```

---

## الخطوة الرابعة: اختبار شامل

### 1. تشغيل جميع التطبيقات

```bash
cd h:\the-copy
/c/Users/menot/AppData/Roaming/npm/pnpm dev
```

يجب أن تعمل جميع التطبيقات بدون أخطاء.

### 2. بناء جميع التطبيقات

```bash
/c/Users/menot/AppData/Roaming/npm/pnpm build
```

### 3. فحص TypeScript

```bash
/c/Users/menot/AppData/Roaming/npm/pnpm type-check
```

---

## الخطوة الخامسة: التنظيف (بعد التأكد)

**فقط بعد التأكد من أن كل شيء يعمل:**

```bash
cd h:\the-copy

# حذف الملفات القديمة
rm -rf external/

# إذا كان هناك src/ و public/ في الجذر (بعد النقل)
# rm -rf src/ public/ vite.config.ts index.html
```

---

## الأوامر المختصرة المفيدة

```bash
# Alias لـ pnpm (اختياري)
alias pnpm='/c/Users/menot/AppData/Roaming/npm/pnpm'

# تشغيل تطبيق محدد
pnpm dev:main
pnpm dev:drama
pnpm dev:stations

# بناء تطبيق محدد
pnpm build:main
pnpm build:drama

# تنظيف كل شيء
pnpm clean:all

# تثبيت كل شيء
pnpm install
```

---

## استكشاف الأخطاء

### مشكلة: pnpm not found

```bash
# استخدم المسار الكامل
/c/Users/menot/AppData/Roaming/npm/pnpm <command>
```

### مشكلة: Module not found

```bash
# تأكد من تثبيت dependencies
pnpm install

# تنظيف وإعادة التثبيت
pnpm clean:all
pnpm install
```

### مشكلة: TypeScript errors

```bash
# تنظيف cache
rm -rf apps/*/tsconfig.tsbuildinfo
pnpm type-check
```

---

## ملاحظات هامة

1. **استخدم المسار الكامل لـ pnpm** إذا لم يكن في PATH
2. **اختبر بعد كل خطوة** قبل الانتقال للتالية
3. **commit بعد كل خطوة ناجحة** للتتبع الجيد
4. **لا تحذف الملفات القديمة** حتى تتأكد من عمل الجديد

---

## المساعدة والتوثيق

- **MONOREPO_README.md**: دليل استخدام مفصل
- **MONOREPO_SETUP_REPORT.md**: تقرير تقني شامل
- **MONOREPO_QUICK_SUMMARY.md**: ملخص سريع
- **MONOREPO_CHECKLIST.md**: قائمة تحقق كاملة

---

**ابدأ الآن!** 🚀

```bash
cd h:\the-copy
git checkout -b feature/monorepo-migration
```

ثم اتبع الخطوات أعلاه بالترتيب.
