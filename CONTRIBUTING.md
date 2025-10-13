# دليل المساهمة - The Copy

نرحب بمساهماتكم في تطوير **The Copy**! هذا الدليل يوضح كيفية المساهمة في المشروع بشكل فعال.

## كيفية المساهمة

### 1. الإبلاغ عن المشاكل
- استخدم [GitHub Issues](https://github.com/your-org/the-copy/issues) للإبلاغ عن الأخطاء
- ابحث عن المشاكل المماثلة قبل إنشاء مشكلة جديدة
- قدم وصفاً مفصلاً للمشكلة مع خطوات إعادة الإنتاج

### 2. اقتراح ميزات جديدة
- استخدم [GitHub Discussions](https://github.com/your-org/the-copy/discussions) لاقتراح ميزات جديدة
- ناقش الفكرة مع المجتمع قبل البدء في التطوير
- قدم وصفاً واضحاً للميزة المقترحة وفوائدها

### 3. إرسال Pull Requests
- Fork المستودع
- أنشئ فرعاً جديداً للميزة أو الإصلاح
- اتبع معايير الكود المحددة
- أرسل Pull Request مع وصف مفصل

## إعداد بيئة التطوير

### المتطلبات
- Node.js 18.0.0 أو أحدث
- npm 9.0.0 أو أحدث
- Git 2.30.0 أو أحدث
- محرر نصوص يدعم TypeScript (VS Code مفضل)

### خطوات الإعداد
```bash
# 1. استنساخ المستودع
git clone https://github.com/your-org/the-copy.git
cd the-copy

# 2. تثبيت التبعيات
npm install

# 3. تشغيل الخادم المحلي
npm run dev

# 4. تشغيل الاختبارات
npm test
```

### إعداد VS Code
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint"
  ]
}
```

## معايير الكود

### TypeScript
- استخدم TypeScript الصارم
- اكتب أنواع واضحة ومحددة
- تجنب استخدام `any` إلا في حالات ضرورية
- استخدم TSDoc للتوثيق

```typescript
/**
 * تحليل سيناريو باستخدام الذكاء الاصطناعي
 * 
 * @param script - بيانات السيناريو المراد تحليلها
 * @returns نتائج التحليل
 * 
 * @example
 * ```typescript
 * const result = await analyzeScreenplay(script);
 * ```
 */
export async function analyzeScreenplay(script: Script): Promise<AnalysisResult> {
  // الكود هنا
}
```

### React
- استخدم Functional Components مع Hooks
- اكتب Props interfaces واضحة
- استخدم TypeScript للتحقق من الأنواع
- اجعل المكونات قابلة لإعادة الاستخدام

```typescript
interface ScreenplayEditorProps {
  onBack: () => void;
  initialText?: string;
}

export const ScreenplayEditor: React.FC<ScreenplayEditorProps> = ({ 
  onBack, 
  initialText = '' 
}) => {
  // الكود هنا
};
```

### CSS و Styling
- استخدم Tailwind CSS للتصميم
- اجعل التصميم متجاوباً
- استخدم ألوان متسقة مع نظام التصميم
- اختبر على أحجام شاشات مختلفة

### معالجة النصوص العربية
- استخدم اتجاه النص من اليمين لليسار (RTL)
- تأكد من دعم الخطوط العربية
- اختبر مع نصوص عربية مختلفة
- استخدم Unicode بشكل صحيح

## اختبار الكود

### أنواع الاختبارات
1. **اختبارات الوحدة** - اختبار المكونات الفردية
2. **اختبارات التكامل** - اختبار التفاعل بين المكونات
3. **اختبارات الأداء** - اختبار سرعة المعالجة
4. **اختبارات الواجهة** - اختبار تجربة المستخدم

### تشغيل الاختبارات
```bash
# جميع الاختبارات
npm test

# اختبارات الوحدة
npm run test:unit

# اختبارات التكامل
npm run test:integration

# تقرير التغطية
npm run test:coverage

# اختبارات الأداء
npm run test:performance
```

### كتابة اختبارات جديدة
```typescript
import { render, screen } from '@testing-library/react';
import { ScreenplayEditor } from './ScreenplayEditor';

describe('ScreenplayEditor', () => {
  it('should render the editor interface', () => {
    render(<ScreenplayEditor onBack={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should handle Arabic text input', () => {
    const arabicText = 'مشهد 1 - داخل المنزل - ليل';
    render(<ScreenplayEditor onBack={() => {}} initialText={arabicText} />);
    expect(screen.getByDisplayValue(arabicText)).toBeInTheDocument();
  });
});
```

## التوثيق

### توثيق الكود
- استخدم TSDoc لجميع الدوال والواجهات العامة
- اكتب أمثلة واضحة
- وثق المعاملات والقيم المرجعة
- اذكر الاستثناءات المحتملة

### توثيق الميزات
- اكتب README للميزات الجديدة
- حدث التوثيق عند تغيير API
- استخدم أمثلة عملية
- وثق القيود والمتطلبات

### ترجمة التوثيق
- اكتب التوثيق بالعربية للمستخدمين
- استخدم الإنجليزية للكود والتعليقات
- تأكد من دقة الترجمة
- استخدم مصطلحات متسقة

## إدارة الإصدارات

### Git Workflow
1. **main** - الفرع الرئيسي للإنتاج
2. **develop** - فرع التطوير
3. **feature/*** - فروع الميزات الجديدة
4. **bugfix/*** - فروع إصلاح الأخطاء
5. **hotfix/*** - فروع الإصلاحات العاجلة

### رسائل Commit
استخدم [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(editor): add Arabic text direction support
fix(analysis): resolve character counting issue
docs(readme): update installation instructions
test(agents): add unit tests for analysis agents
```

### إصدارات جديدة
- نتبع [Semantic Versioning](https://semver.org/)
- نحدث CHANGELOG.md مع كل إصدار
- نستخدم GitHub Releases لتوثيق الإصدارات

## مراجعة الكود

### معايير المراجعة
1. **صحة الكود** - هل يعمل الكود كما هو متوقع؟
2. **جودة الكود** - هل يتبع معايير المشروع؟
3. **الأداء** - هل يؤثر على أداء التطبيق؟
4. **الأمان** - هل هناك ثغرات أمنية؟
5. **التوثيق** - هل الكود موثق بشكل كافي؟

### عملية المراجعة
1. مراجعة الكود بعناية
2. اختبار التغييرات محلياً
3. تقديم تعليقات بناءة
4. الموافقة على التغييرات المقبولة

## الدعم والمساعدة

### الحصول على المساعدة
- اطرح الأسئلة في [GitHub Discussions](https://github.com/your-org/the-copy/discussions)
- ابحث في [الوثائق](https://github.com/your-org/the-copy/wiki)
- تواصل مع المطورين عبر البريد الإلكتروني

### المساهمة في المجتمع
- شارك في المناقشات
- ساعد المطورين الجدد
- شارك تجربتك مع المشروع
- اقترح تحسينات

## قواعد السلوك

### مبادئنا
- **الاحترام** - تعامل مع الجميع باحترام
- **التعاون** - اعمل مع الآخرين لتحقيق الأهداف المشتركة
- **الشفافية** - كن واضحاً ومفتوحاً
- **التحسين المستمر** - ابحث عن طرق لتحسين المشروع

### السلوك المقبول
- استخدام لغة مهذبة ومحترمة
- التركيز على ما هو أفضل للمشروع
- احترام وجهات النظر المختلفة
- قبول النقد البناء

### السلوك غير المقبول
- استخدام لغة مسيئة أو مهينة
- التمييز أو المضايقة
- نشر معلومات خاصة
- إساءة استخدام المشروع

## الاعتراف

نقدر جميع المساهمات ونعترف بها:
- إدراج المساهمين في README
- ذكر المساهمات في إصدارات جديدة
- منح شهادات تقدير للمساهمين المتميزين

---

**شكراً لمساهمتكم في تطوير The Copy!** 🎬✨