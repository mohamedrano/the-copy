# Firebase Studio - منصة التحليل الدرامي المدعومة بالذكاء الاصطناعي

<div align="center">

![Firebase Studio](https://img.shields.io/badge/Firebase-Studio-orange?style=for-the-badge&logo=firebase)
![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Google AI](https://img.shields.io/badge/Google-Genkit-4285F4?style=for-the-badge&logo=google)

**منصة شاملة لتطوير تطبيقات الويب الإنتاجية مع قدرات الذكاء الاصطناعي وأدوات تحليل الدراما**

[🚀 البدء السريع](#-البدء-السريع) • [📖 التوثيق](#-التوثيق) • [🧪 الاختبارات](#-الاختبارات) • [🚀 النشر](#-النشر)

</div>

## 🎯 نظرة عامة

Firebase Studio هو تطبيق Next.js starter شامل مصمم للتطوير الإنتاجي مع تكامل متقدم للذكاء الاصطناعي، أدوات تحليل الدراما، وبنية تحتية قوية للاختبارات.

### ✨ المميزات الأساسية

- 🤖 **الذكاء الاصطناعي المتقدم**: تكامل Google Genkit مع Generative AI للتحليل الذكي
- 🎭 **تحليل الدراما**: أدوات متخصصة لتحليل النصوص الدرامية وتحرير السيناريوهات
- 🧪 **ضمان الجودة**: تغطية اختبارات 80% مع اختبارات E2E شاملة
- ⚡ **الأداء المحسن**: تحليل الحزم، تتبع Web Vitals، ومراقبة الأداء
- 🚀 **النشر الآلي**: خط إنتاج CI/CD مع Firebase Hosting

## 🏗️ البنية التقنية

### التقنيات الأساسية

| التقنية | الإصدار | الغرض |
|---------|---------|--------|
| **Next.js** | 15.3.3 | إطار عمل React مع App Router |
| **TypeScript** | 5.x | فحص الأنواع الثابت |
| **Tailwind CSS** | 3.4.1 | إطار عمل CSS |
| **Google Genkit** | 1.20.0 | إطار عمل تطبيقات الذكاء الاصطناعي |

### الذكاء الاصطناعي والتعلم الآلي

```typescript
// مثال على تكامل Genkit
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const ai = genkit({
  plugins: [googleAI()],
  model: 'gemini-pro'
});
```

### مكونات واجهة المستخدم

- **shadcn/ui**: مكتبة مكونات مبنية على Radix UI
- **Lucide React**: مكتبة الأيقونات
- **React Hook Form**: إدارة حالة النماذج
- **Zod**: التحقق من صحة المخططات

## 🚀 البدء السريع

### المتطلبات الأساسية

- **Node.js**: ≥20.0.0
- **npm**: أحدث إصدار مستقر
- **Git**: لإدارة الإصدارات

### التثبيت

```bash
# استنساخ المستودع
git clone <repository-url>
cd studio

# تثبيت التبعيات
npm install

# إعداد متغيرات البيئة
cp .env.example .env.local
# قم بتعبئة قيم التكوين الخاصة بك
```

### إعداد متغيرات البيئة

```bash
# ================================
# 🧠 مفاتيح API المطلوبة
# ================================
GOOGLE_GENAI_API_KEY=your_google_ai_key
SENTRY_DSN=your_sentry_dsn
FIREBASE_PROJECT_ID=your_firebase_project

# ================================
# 🔒 أعلام الميزات
# ================================
ENABLE_ANALYTICS=true
ENABLE_AI_SUGGESTIONS=true
ENABLE_3D_PREVIEW=true
```

### تشغيل التطوير

```bash
# تشغيل خادم التطوير
npm run dev

# تشغيل خادم Genkit للتطوير
npm run genkit:dev

# تشغيل Genkit مع مراقبة الملفات
npm run genkit:watch
```

الآن افتح [http://localhost:9002](http://localhost:9002) في متصفحك.

## 📁 هيكل المشروع

```
src/
├── app/                    # Next.js App Router
│   ├── (main)/            # مجموعات المسارات للتطبيق الرئيسي
│   │   └── analysis/      # أدوات وواجهات التحليل
│   ├── api/               # مسارات ونقاط API
│   ├── layout.tsx         # مكون التخطيط الجذر
│   ├── page.tsx           # مكون الصفحة الرئيسية
│   └── globals.css        # الأنماط العامة
├── components/            # مكونات React قابلة لإعادة الاستخدام
│   ├── ui/               # مكتبة مكونات shadcn/ui
│   ├── ErrorBoundary.tsx # مكون معالجة الأخطاء
│   ├── ScreenplayEditor.tsx # محرر تحليل الدراما
│   └── file-upload.tsx   # مكون معالجة الملفات
├── hooks/                # خطافات React مخصصة
├── lib/                  # وظائف المساعدة والتكوينات
│   ├── types/           # تعريفات أنواع TypeScript
│   ├── ai/              # وظائف مساعدة للذكاء الاصطناعي
│   ├── drama-analyst/   # منطق تحليل الدراما
│   └── utils.ts         # وظائف مساعدة عامة
└── ai/                   # تكامل الذكاء الاصطناعي
    ├── flows/           # تعريفات تدفقات Genkit AI
    ├── genkit.ts        # تكوين Genkit
    └── dev.ts           # أدوات الذكاء الاصطناعي للتطوير
```

## 🧪 الاختبارات

### اختبارات الوحدة

```bash
# تشغيل الاختبارات في وضع المراقبة
npm run test

# تشغيل الاختبارات مع تقرير التغطية
npm run test:coverage

# تشغيل الاختبارات مع واجهة المستخدم
npm run test:ui
```

### اختبارات E2E

```bash
# تشغيل اختبارات E2E
npm run e2e

# تشغيل اختبارات E2E مع واجهة المستخدم
npm run e2e:ui

# تشغيل اختبارات E2E في الوضع المرئي
npm run e2e:headed

# تصحيح اختبارات E2E
npm run e2e:debug
```

### معايير الجودة

| المعيار | المطلوب | الوصف |
|---------|---------|--------|
| **تغطية الأسطر** | ≥80% | نسبة الأسطر المختبرة |
| **تغطية الوظائف** | ≥80% | نسبة الوظائف المختبرة |
| **تغطية الفروع** | ≥80% | نسبة الفروع المختبرة |
| **حجم الحزمة** | ≤250KB | الحد الأقصى للحزمة المضغوطة |

## 🎭 ميزات تحليل الدراما

### محرر السيناريو

```typescript
// مثال على استخدام محرر السيناريو
import ScreenplayEditor from '@/components/ScreenplayEditor';

function DramaPage() {
  return (
    <ScreenplayEditor
      onBack={() => router.push('/')}
    />
  );
}
```

### المحلل الدرامي

```typescript
// مثال على تحليل النص الدرامي
import { submitTask } from '@/lib/drama-analyst/orchestration/executor';
import { TaskType } from '@/lib/drama-analyst/enums';

const analyzeScript = async (text: string) => {
  const result = await submitTask({
    agent: 'drama-analyzer',
    files: [{ textContent: text, fileName: 'script.txt' }],
    params: { taskType: TaskType.ANALYSIS }
  });
  
  return result;
};
```

## 🤖 تكامل الذكاء الاصطناعي

### تدفقات Genkit

```typescript
// تعريف تدفق AI مخصص
import { defineFlow } from 'genkit';

export const analyzeCharacterFlow = defineFlow(
  {
    name: 'analyzeCharacter',
    inputSchema: z.object({
      text: z.string(),
      character: z.string()
    }),
    outputSchema: z.object({
      analysis: z.string(),
      traits: z.array(z.string())
    })
  },
  async (input) => {
    // منطق تحليل الشخصية
    return {
      analysis: "تحليل الشخصية...",
      traits: ["شجاع", "ذكي", "مخلص"]
    };
  }
);
```

### العصف الذهني بالذكاء الاصطناعي

```typescript
// استخدام ميزة العصف الذهني
import { brainstormIdeas } from '@/ai/ai-team-brainstorming';

const ideas = await brainstormIdeas({
  topic: "تطوير شخصية البطل",
  context: "دراما تاريخية"
});
```

## 🚀 البناء والنشر

### البناء للتطوير

```bash
# بناء للتطوير
npm run build

# بناء مع تحليل الحزمة
npm run analyze
```

### البناء للإنتاج

```bash
# بناء للإنتاج
npm run build:production

# إنشاء تقرير الأداء
npm run performance:report
```

### النشر على Firebase

```bash
# تكوين Firebase
firebase init hosting

# نشر للإنتاج
firebase deploy --only hosting
```

## 📊 المراقبة والتحليل

### تكامل Sentry

```typescript
// تكوين Sentry للمراقبة
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### تتبع Web Vitals

```typescript
// تتبع مقاييس الأداء
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## 🔧 أوامر التطوير

### أوامر أساسية

```bash
npm run dev                 # تشغيل خادم التطوير
npm run build              # بناء التطبيق
npm run start              # تشغيل خادم الإنتاج
npm run lint               # فحص الكود
npm run format             # تنسيق الكود
npm run typecheck          # فحص أنواع TypeScript
```

### أوامر الاختبار

```bash
npm run test:all           # تشغيل جميع الاختبارات
npm run test:coverage      # اختبارات مع تقرير التغطية
npm run e2e                # اختبارات E2E
npm run a11y:ci           # اختبارات إمكانية الوصول
npm run perf:ci           # اختبارات الأداء
```

### أوامر الذكاء الاصطناعي

```bash
npm run genkit:dev         # تشغيل خادم Genkit للتطوير
npm run genkit:watch       # Genkit مع مراقبة الملفات
```

## 🛡️ الأمان

### التحقق من صحة المدخلات

```typescript
// استخدام Zod للتحقق من صحة المدخلات
import { z } from 'zod';

const userInputSchema = z.object({
  text: z.string().min(1).max(10000),
  type: z.enum(['analysis', 'creative', 'completion'])
});

const validateInput = (input: unknown) => {
  return userInputSchema.parse(input);
};
```

### إدارة الجلسات

```typescript
// إدارة آمنة للجلسات
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  maxAge: 24 * 60 * 60 * 1000, // 24 ساعة
  secure: process.env.NODE_ENV === 'production'
};
```

## 📈 الأداء

### تحسين الحزمة

- **تقسيم الكود**: تقسيم استراتيجي على مستوى المسارات والمكونات
- **Tree Shaking**: استيرادات صحيحة لتمكين tree shaking
- **الاستيرادات الديناميكية**: تحميل التبعيات الثقيلة عند الطلب
- **ضغط Gzip/Brotli**: ضغط مُمكن للاستجابات

### أهداف الأداء

| المقياس | الهدف | الوصف |
|---------|-------|--------|
| **FCP** | <1.8s | First Contentful Paint |
| **LCP** | <2.5s | Largest Contentful Paint |
| **CLS** | <0.1 | Cumulative Layout Shift |
| **FID** | <100ms | First Input Delay |

## 🤝 المساهمة

### إرشادات التطوير

1. **استخدم TypeScript**: جميع الملفات يجب أن تستخدم TypeScript مع فحص صارم للأنواع
2. **اتبع أنماط المكونات**: استخدم مكونات وظيفية مع hooks
3. **اكتب الاختبارات**: تأكد من تغطية اختبارات ≥80%
4. **وثق الكود**: استخدم تعليقات JSDoc للوظائف والمكونات

### سير العمل

```bash
# إنشاء فرع جديد
git checkout -b feature/new-feature

# إجراء التغييرات والاختبار
npm run test:all
npm run lint
npm run typecheck

# إرسال التغييرات
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

## 📚 الموارد الإضافية

- [📖 توثيق Next.js](https://nextjs.org/docs)
- [🤖 توثيق Google Genkit](https://firebase.google.com/docs/genkit)
- [🎨 مكونات shadcn/ui](https://ui.shadcn.com/)
- [🧪 توثيق Playwright](https://playwright.dev/)
- [📊 Firebase Hosting](https://firebase.google.com/docs/hosting)

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 🆘 الدعم

إذا واجهت أي مشاكل أو لديك أسئلة:

1. تحقق من [الأسئلة الشائعة](docs/FAQ.md)
2. ابحث في [القضايا المفتوحة](../../issues)
3. أنشئ [قضية جديدة](../../issues/new)

---

<div align="center">

**صُنع بـ ❤️ باستخدام Next.js و Google AI**

[⬆️ العودة للأعلى](#firebase-studio---منصة-التحليل-الدرامي-المدعومة-بالذكاء-الاصطناعي)

</div>