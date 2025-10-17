# المحرر الأساسي - Arabic Screenplay Editor

محرر سيناريو عربي بسيط ومستقل، يمكن تشغيله بشكل منفصل أو دمجه في التطبيق الرئيسي.

## المميزات

- محرر نصوص متخصص للسيناريوهات العربية
- دعم كامل للغة العربية (RTL)
- واجهة بسيطة وسهلة الاستخدام
- يعمل كتطبيق مستقل أو مضمن عبر iframe
- حجم صغير (204 KB فقط)

## التثبيت

```bash
npm install
```

## الأوامر المتاحة

### التطوير
```bash
npm run dev
```
يشغل خادم التطوير على `http://localhost:5178`

### البناء
```bash
npm run build
```
يبني التطبيق للإنتاج في `../../public/basic-editor`

### البناء مع فحص TypeScript
```bash
npm run build:check
```
يفحص الأخطاء قبل البناء

### فحص الأنواع
```bash
npm run type-check
```
يفحص أخطاء TypeScript فقط

### المعاينة
```bash
npm run preview
```
يعاين البناء الإنتاجي

## البنية

```
basic-editor/
├── src/
│   ├── App.tsx                   # المكون الرئيسي
│   ├── main.tsx                  # نقطة الدخول
│   ├── ScreenplayEditor.tsx      # المحرر
│   └── index.css                 # الأنماط
├── index.html                    # صفحة HTML
├── vite.config.ts               # إعدادات Vite
├── package.json
├── tsconfig.json
└── README.md
```

## التكامل مع التطبيق الرئيسي

يتم تحميل المحرر في التطبيق الرئيسي عبر iframe:

```typescript
<ExternalAppFrame
  url="/basic-editor"
  title="المحرر الأساسي"
/>
```

## التقنيات المستخدمة

- **React 18** - مكتبة واجهة المستخدم
- **TypeScript 5** - للأمان النوعي
- **Vite 5** - أداة البناء السريعة
- **Lucide React** - للأيقونات

## الإعدادات

### Vite Configuration
```typescript
export default defineConfig({
  base: '/basic-editor/',
  build: {
    outDir: '../../public/basic-editor',
  }
});
```

### TypeScript Configuration
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "noUnusedLocals": false,
    "skipLibCheck": true
  }
}
```

## نتائج البناء

```
public/basic-editor/
├── index.html (0.74 KB)
└── assets/
    ├── index.css (1.40 KB)
    ├── index.js (51.54 KB)
    └── react-vendor.js (140.87 KB)

Total: 204 KB (59.49 KB gzipped)
```

## الترخيص

راجع ملف LICENSE في جذر المشروع.
