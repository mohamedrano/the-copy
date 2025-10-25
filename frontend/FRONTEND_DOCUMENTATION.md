# Frontend Documentation - الواجهة الأمامية

## نظرة عامة

الواجهة الأمامية لمنصة **The Copy** مبنية باستخدام Next.js 15.3.3 مع React 18.3.1 وTypeScript، وتوفر واجهة مستخدم حديثة ومتجاوبة لتحليل النصوص الدرامية باستخدام الذكاء الاصطناعي.

## الهيكل التقني

### التقنيات الأساسية
- **Next.js 15.3.3**: إطار عمل React مع App Router
- **React 18.3.1**: مكتبة واجهة المستخدم
- **TypeScript 5.x**: لغة البرمجة مع الكتابة الصارمة
- **Tailwind CSS 3.4.1**: إطار عمل CSS للتصميم
- **Google Genkit 1.20.0**: إطار عمل الذكاء الاصطناعي

### مكتبات واجهة المستخدم
- **Radix UI**: مكتبة مكونات شاملة
- **Lucide React 0.475.0**: نظام الأيقونات
- **Recharts 2.15.1**: مكتبة الرسوم البيانية
- **React Hook Form 7.54.2**: إدارة النماذج
- **Zod 3.25.76**: التحقق من صحة البيانات

## هيكل المشروع

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (main)/            # المسارات الرئيسية
│   │   │   ├── analysis/      # صفحات التحليل
│   │   │   ├── brainstorm/    # صفحة العصف الذهني
│   │   │   ├── editor/        # محرر السيناريو
│   │   │   └── layout.tsx     # تخطيط رئيسي
│   │   ├── api/               # API Routes
│   │   ├── globals.css        # أنماط عامة
│   │   ├── layout.tsx         # تخطيط التطبيق
│   │   └── page.tsx           # الصفحة الرئيسية
│   ├── components/            # المكونات
│   │   ├── ui/               # مكونات واجهة المستخدم
│   │   ├── ScreenplayEditor.tsx
│   │   ├── file-upload.tsx
│   │   └── stations-pipeline.tsx
│   ├── lib/                   # المكتبات والأدوات
│   │   ├── ai/               # نظام الذكاء الاصطناعي
│   │   ├── drama-analyst/    # محلل الدراما
│   │   └── utils.ts          # أدوات مساعدة
│   ├── hooks/                # React Hooks مخصصة
│   └── types/                # تعريفات الأنواع
├── public/                   # الملفات العامة
├── tests/                    # الاختبارات
├── package.json
└── README.md
```

## المكونات الرئيسية

### 1. ScreenplayEditor
محرر نصوص متقدم يدعم:
- **تنسيق السيناريو**: تنسيق تلقائي للشخصيات والحوار والأفعال
- **دعم العربية**: تصنيف نصوص عربية متطور
- **اختصارات لوحة المفاتيح**: تنقل سريع بين أنواع التنسيق
- **معاينة مباشرة**: عرض النص بتنسيق احترافي

```typescript
interface ScreenplayEditorProps {
  onBack?: () => void;
}

export default function ScreenplayEditor({ onBack }: ScreenplayEditorProps)
```

### 2. FileUpload
مكون تحميل الملفات يدعم:
- **PDF و DOCX**: استخراج النص من الملفات
- **السحب والإفلات**: واجهة سهلة الاستخدام
- **التحقق من الصحة**: فحص نوع وحجم الملف

### 3. StationsPipeline
عرض مرئي لمحطات التحليل:
- **تتبع التقدم**: عرض حالة كل محطة
- **النتائج التفاعلية**: عرض نتائج كل مرحلة
- **التنقل**: الانتقال بين المحطات

## نظام الذكاء الاصطناعي

### هيكل المحطات السبع
1. **محطة 1**: تحليل النص الأساسي
2. **محطة 2**: التحليل المفاهيمي
3. **محطة 3**: بناء الشبكات
4. **محطة 4**: مقاييس الكفاءة
5. **محطة 5**: التحليل الأسلوبي الديناميكي
6. **محطة 6**: التشخيص والعلاج
7. **محطة 7**: الانتهاء والتلخيص

### وكلاء التحليل المتخصصون
- **محلل الشخصيات العميق**: تحليل نفسي للشخصيات
- **طب الحوار الشرعي**: تقييم جودة الحوار
- **المحلل الثقافي التاريخي**: تحليل السياق الثقافي
- **محلل الجمهور**: تحديد الجمهور المستهدف
- **محلل الإنتاج**: تقييم قابلية الإنتاج

## إدارة الحالة

### React Hooks المستخدمة
- **useState**: إدارة الحالة المحلية
- **useEffect**: التأثيرات الجانبية
- **useCallback**: تحسين الأداء للدوال
- **useMemo**: تحسين الأداء للحسابات

### Custom Hooks
- **useToast**: عرض الإشعارات
- **useMobile**: كشف الأجهزة المحمولة

## التوجيه والصفحات

### المسارات الرئيسية
- `/`: الصفحة الرئيسية
- `/analysis/initial`: التحليل الأولي
- `/analysis/deep`: التحليل العميق
- `/brainstorm`: العصف الذهني
- `/editor`: محرر السيناريو

### API Routes
- `/api/health`: فحص صحة النظام
- `/api/review-screenplay`: مراجعة السيناريو

## دعم اللغة العربية

### تصنيف النصوص العربية
```typescript
class ScreenplayClassifier {
  static readonly AR_AB_LETTER = '\\u0600-\\u06FF';
  static readonly ACTION_VERBS = new RegExp(/* أفعال عربية */);
  
  static isCharacterLine(line: string): boolean
  static isLikelyAction(line: string): boolean
  static isBasmala(line: string): boolean
}
```

### الخطوط العربية
- **Amiri**: للنصوص التقليدية
- **Cairo**: للواجهات الحديثة
- **Tajawal**: للنصوص النظيفة

## التصميم والأنماط

### نظام الألوان
```css
:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(222.2 84% 4.9%);
  --primary: hsl(222.2 47.4% 11.2%);
  --secondary: hsl(210 40% 96%);
}
```

### الاستجابة
- **Mobile First**: تصميم يبدأ بالأجهزة المحمولة
- **Breakpoints**: نقاط توقف متعددة للشاشات
- **Grid System**: نظام شبكة مرن

## الاختبارات

### أنواع الاختبارات
- **Unit Tests**: اختبارات المكونات الفردية
- **Integration Tests**: اختبارات التكامل
- **E2E Tests**: اختبارات شاملة مع Playwright

### إعداد الاختبارات
```bash
# تشغيل الاختبارات
npm run test

# اختبارات مع التغطية
npm run test:coverage

# اختبارات E2E
npm run e2e
```

## الأداء والتحسين

### تقسيم الكود
```typescript
// Dynamic imports للمكونات الثقيلة
const FileUpload = dynamic(() => import("@/components/file-upload"), {
  loading: () => <LoadingSpinner />
});
```

### تحسين الصور والخطوط
- **Next.js Image**: تحسين الصور التلقائي
- **Font Optimization**: تحميل خطوط محسن
- **Bundle Analysis**: تحليل حجم الحزم

## البناء والنشر

### أوامر البناء
```bash
# التطوير
npm run dev

# البناء للإنتاج
npm run build

# تشغيل الإنتاج
npm run start

# تحليل الحزم
npm run analyze
```

### متغيرات البيئة
```env
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_api_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

## الأمان

### حماية البيانات
- **Input Sanitization**: تنظيف المدخلات
- **XSS Protection**: حماية من البرمجة النصية
- **CSRF Protection**: حماية من التزوير

### إدارة المفاتيح
- **Environment Variables**: متغيرات البيئة الآمنة
- **API Key Rotation**: تدوير مفاتيح API

## التطوير والصيانة

### معايير الكود
- **ESLint**: قواعد الكود الصارمة
- **Prettier**: تنسيق الكود التلقائي
- **TypeScript**: فحص الأنواع الصارم

### Git Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  }
}
```

## استكشاف الأخطاء

### مشاكل شائعة
1. **خطأ تحميل الملفات**: تحقق من أنواع الملفات المدعومة
2. **بطء التحليل**: تحقق من اتصال API
3. **مشاكل التنسيق**: تحقق من إعدادات اللغة

### أدوات التشخيص
- **React DevTools**: فحص المكونات
- **Network Tab**: مراقبة طلبات API
- **Console Logs**: رسائل التشخيص

---

*للمزيد من المعلومات، راجع التوثيق الرئيسي والكود المصدري.*