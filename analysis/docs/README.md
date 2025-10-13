# محرر السيناريو العربي

## نظرة عامة تشغيلية

تطبيق ويب مبني بـ React و TypeScript مخصص لكتابة وتحليل السيناريوهات العربية مع دعم كامل للنصوص من اليمين إلى اليسار (RTL) والتنسيق المخصص للسيناريوهات.

## المتطلبات الأساسية

- **Node.js**: الإصدار 18 أو أحدث
- **npm**: يأتي مع Node.js
- **متصفح حديث**: يدعم ES2020+

## الأوامر الأساسية

```bash
# تثبيت التبعيات
npm install

# تشغيل خادم التطوير
npm run dev
# يعمل على: http://localhost:5173

# بناء للإنتاج
npm run build

# معاينة البناء
npm run preview

# تشغيل الاختبارات
npm run test
```

## البنية العامة

```
src/
├── components/           # مكونات React
│   ├── editor/          # المحرر الأساسي
│   └── naqid/           # لوحة التحليل (الواجهة الحالية)
├── services/            # منطق العمليات والتحليل
├── types/               # تعريفات TypeScript
├── modules/text/        # معالجة النصوص
└── agents/              # نظام الوكلاء الذكيين (مستبعد من التكوين)
```

## نقاط الدخول الرئيسية

1. **الواجهة الحالية**: `src/components/naqid/NaqidDashboard.tsx`
   - لوحة تحليل السيناريوهات
   - تقبل النص العربي وتعرض تحليلاً شاملاً

2. **المحرر الكامل**: `src/components/editor/CleanIntegratedScreenplayEditor.tsx`
   - محرر سيناريو متقدم مع أدوات شاملة
   - متاح ولكن غير مفعل حالياً

## التبديل بين الواجهات

لتفعيل المحرر بدلاً من لوحة التحليل:
1. عدّل `src/App.tsx`
2. غيّر الاستيراد من `NaqidDashboard` إلى `CleanIntegratedScreenplayEditor`

## التكنولوجيا المستخدمة

- **Frontend**: React 19 + TypeScript 5.8
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4.1
- **Icons**: Lucide React
- **Testing**: Node.js built-in test runner