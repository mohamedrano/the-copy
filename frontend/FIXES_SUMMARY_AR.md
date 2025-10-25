# ملخص شامل للإصلاحات المطبقة

## نظرة عامة تنفيذية

تم تطبيق مجموعة شاملة من الإصلاحات لحل مشاكل التشغيل، عرض الواجهة، وتعارضات الإعدادات في تطبيق Next.js + Gemini AI.

---

## 1️⃣ وحدة Gemini الأساسية الموحدة

### الملف: `src/lib/ai/gemini-core.ts`

#### ✅ توحيد حدود التوكنز
- **ثابت عالمي**: `MAX_TOKENS_PER_USE = 48192`
- يُطبق بشكل موحد على جميع استدعاءات API
- يلغي القيم غير المتسقة السابقة (8192، 30000، إلخ)

#### ✅ مُهل زمنية حسب النموذج
تم تطبيق تحديد معدل الطلبات بناءً على نوع النموذج:

| النموذج | المهلة الزمنية |
|---------|----------------|
| `gemini-2.5-flash-lite` | **6 ثوانٍ** بين الطلبات |
| `gemini-2.5-flash` | **10 ثوانٍ** بين الطلبات |
| `gemini-2.5-pro` | **15 ثانية** بين الطلبات |

```typescript
await throttleByModel(modelId); // يُستدعى قبل كل طلب API
```

#### ✅ تحليل JSON متساهل
يتعامل مع الاستجابات غير JSON من Gemini بشكل آمن:

**استراتيجيات التحليل**:
1. محاولة `JSON.parse()` مباشرة
2. استخراج من كتل كود ```json...```
3. مطابقة أنماط بنيات JSON
4. إصلاح JSON المبتور

```typescript
const parsed = parseJsonLenient(rawText); // يرجع JSON أو null
```

#### ✅ أدوات تطبيع النصوص
تمنع خطأ "Objects are not valid as a React child":

```typescript
toText(value);           // تحويل أي قيمة إلى نص، يتعامل مع {raw: string}
safeSub(value, 0, 100);  // عملية substring آمنة
safeSplit(value, '\n');  // عملية split آمنة
```

---

## 2️⃣ إصلاحات إعدادات Next.js

### الملف: `next.config.ts`

#### ✅ حل تعارض Turbopack/Webpack
**المشكلة**: تحذير "Webpack is configured while Turbopack is not"

**الحل**:
- إزالة إعدادات webpack غير المشروطة
- جعل webpack اختياريًا عبر متغير بيئة `FORCE_WEBPACK=1`
- Turbopack الآن هو الافتراضي في بيئة التطوير

```typescript
// استخدام webpack فقط عند الحاجة الصريحة
...(process.env.FORCE_WEBPACK === "1" && {
  webpack: (config, { isServer }) => {
    // تخصيصات webpack
  }
})
```

#### ✅ دعم أصول التطوير
**المشكلة**: تحذيرات cross-origin في بيئة Workstations

**الحل**:
```typescript
...(process.env.ALLOWED_DEV_ORIGIN && {
  allowedDevOrigins: [process.env.ALLOWED_DEV_ORIGIN],
})
```

**الاستخدام**:
```bash
export ALLOWED_DEV_ORIGIN="https://9002-firebase-the-copy--XXXX.cluster-....dev"
```

#### ✅ إصلاح CSP للخطوط
**المشكلة**: خطأ CSP يمنع الخطوط الخارجية من `r2cdn.perplexity.ai`

**الحل**:
```typescript
"font-src 'self' https://fonts.gstatic.com https://r2cdn.perplexity.ai data:"
```

**توصية**: للإنتاج، استضف الخطوط محليًا في مجلد `public/fonts/`

---

## 3️⃣ Middleware لرؤوس CSP

### الملف الجديد: `src/middleware.ts`

**الميزات**:
- قواعد CSP ملائمة للتطوير (تسمح بـ `unsafe-eval` للـ HMR)
- تضمين تلقائي لـ `ALLOWED_DEV_ORIGIN`
- استثناء الملفات الثابتة من المعالجة
- HSTS مشروط (الإنتاج فقط)

**نمط المطابقة**:
```typescript
matcher: [
  '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
]
```

---

## 4️⃣ حماية تسجيل Web Components

### الملف الجديد: `src/lib/web-components.ts`

**الوظائف الرئيسية**:

```typescript
// ضمان تحميل polyfills مرة واحدة فقط
ensureWebComponentsPolyfill('webcomponents-ce');

// تسجيل عنصر آمن
defineOnce('my-element', MyElementClass);

// التحقق من وجود عنصر
if (isElementDefined('my-element')) { /* ... */ }

// انتظار تعريف عنصر
await whenDefined('my-element', 5000);
```

**يمنع الخطأ**: `"A custom element with name 'mce-autosize-textarea' has already been defined"`

---

## 5️⃣ تحديث خدمات Gemini

### خدمة محطات Gemini
**الملف**: `src/lib/ai/stations/gemini-service.ts`

**التغييرات**:
- دمج `throttleByModel()` قبل كل طلب
- استخدام `normalizeGenConfig()` لحدود التوكنز الموحدة
- تطبيق `parseJsonLenient()` لتحليل الاستجابات
- الرجوع إلى النص الخام عند فشل تحليل JSON

**قبل**:
```typescript
config: {
  maxOutputTokens: request.maxTokens || 8192,  // غير متسق
  temperature: request.temperature || 0.7,
}
```

**بعد**:
```typescript
await throttleByModel(modelName);

const genConfig = normalizeGenConfig();
const finalConfig = {
  ...genConfig,
  maxOutputTokens: request.maxTokens ?? MAX_TOKENS_PER_USE, // دائمًا 48192
};
```

### الخدمة الرئيسية
**الملف**: `src/lib/ai/gemini-service.ts`
- نفس التكامل مع الوحدة الأساسية
- حدود توكنز موحدة
- مهل زمنية حسب النموذج

### خدمة محلل الدراما
**الملف**: `src/lib/drama-analyst/services/geminiService.ts`
- الهجرة إلى الوحدة الأساسية الموحدة
- تحليل JSON متساهل
- استخدام ثابت `MAX_TOKENS_PER_USE`

---

## 6️⃣ تحديثات المحطات لعمليات النص الآمنة

### المحطة 1
**الملف**: `src/lib/ai/stations/station1-text-analysis.ts`

**التغييرات**:
```typescript
// قبل
context: fullText.substring(0, 30000)
return result.content.split('\n')

// بعد
context: safeSub(fullText, 0, 30000)
return safeSplit(toText(result.content), '\n')
```

### المحطة 2
**الملف**: `src/lib/ai/stations/station2-conceptual-analysis.ts`

**التغييرات**:
```typescript
// قبل
context: context.fullText?.substring(0, 25000) ?? ""

// بعد
context: safeSub(context.fullText, 0, 25000)
```

جميع `result.content` → `toText(result.content)` قبل الاستخدام

### المحطة 3
**الملف**: `src/lib/ai/stations/station3-network-builder.ts`

**التغييرات**:
```typescript
// قبل
`${input.station2Output.storyStatement.substring(0, 50)}...`

// بعد
`${safeSub(input.station2Output.storyStatement, 0, 50)}...`
```

### المحطة 5
**الملف**: `src/lib/ai/stations/station5-dynamic-symbolic-stylistic.ts`

**التغييرات**:
- تحديث جميع استدعاءات `fullText.substring(...)` لاستخدام `safeSub()`

---

## 7️⃣ إصلاحات مكونات الواجهة

### بطاقة المحطة
**الملف**: `src/components/station-card.tsx`

**المشكلة**: عرض كائنات كأطفال React مباشرة

**الحل**:
```typescript
import { toText } from "@/lib/ai/gemini-core";

// قبل
<p>بيان القصة: {data.storyStatement}</p>

// بعد
<p>بيان القصة: {toText(data.storyStatement)}</p>
```

**الحقول المُحدثة**:
- ✅ `data.storyStatement`
- ✅ `data.hybridGenre`
- ✅ `data.majorCharacters`
- ✅ `data.narrativeStyleAnalysis.overallTone`
- ✅ `data.networkSummary.charactersCount`
- ✅ `data.networkSummary.relationshipsCount`
- ✅ `data.finalReport.executiveSummary`

---

## 📋 متغيرات البيئة المطلوبة

### للتطوير
```bash
# السماح بأصل التطوير لـ hot reloading
export ALLOWED_DEV_ORIGIN="https://9002-firebase-the-copy--XXXX.cluster-....dev"

# اختياري: فرض webpack بدلاً من Turbopack
# export FORCE_WEBPACK=1
```

### إعدادات Gemini API
```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
NEXT_PUBLIC_GEMINI_MODEL=gemini-2.5-pro
```

---

## ✅ قائمة التحقق من الاختبارات

### 1. خادم التطوير
```bash
cd frontend
export ALLOWED_DEV_ORIGIN="https://your-workstation-url"
pnpm dev -p 9002
```

**التحقق**:
- [ ] لا يوجد تحذير "Webpack is configured while Turbopack is not"
- [ ] لا يوجد تحذير "allowedDevOrigins"
- [ ] Hot reload يعمل بشكل صحيح

### 2. تحميل الخطوط
**التحقق**:
- [ ] لا توجد أخطاء CSP في console المتصفح
- [ ] الخطوط تُحمل من `fonts.gstatic.com` أو المصدر المستضاف محليًا

### 3. خط أنابيب التحليل
```
1. انتقل إلى /analysis/deep
2. ارفع أو الصق نصًا دراميًا
3. انقر "ابدأ التحليل"
```

**التحقق**:
- [ ] جميع المحطات تكتمل بدون أخطاء
- [ ] لا يوجد خطأ "Objects are not valid as a React child"
- [ ] لا يوجد خطأ `substring is not a function`
- [ ] لا يوجد خطأ `split is not a function`
- [ ] نتائج المحطات تُعرض بشكل صحيح في البطاقات

### 4. تحديد معدل API
راقب سجلات console:

**الإخراج المتوقع**:
```
[Gemini Core] Throttling gemini-2.5-flash-lite: waiting 6000ms
[Gemini Service] Generating content with model gemini-2.5-flash-lite
  tokenLimit: 48192
  temperature: 0.2
```

**التحقق**:
- [ ] رسائل المُهل تظهر بين الطلبات
- [ ] المُهل تطابق نوع النموذج (6ث/10ث/15ث)
- [ ] حد التوكنز دائمًا 48192

### 5. التعامل مع استجابات غير JSON
إذا أرجع Gemini نصًا عاديًا بدلاً من JSON:

**التحقق**:
- [ ] خط الأنابيب يستمر (لا يتعطل)
- [ ] تحذير مُسجل: "Gemini response did not contain valid JSON payload"
- [ ] استخدام النص الخام كبديل: `{ raw: "..." }`
- [ ] الواجهة تعرض محتوى النص بشكل صحيح

---

## 🔧 مصفوفة حل الأخطاء

| الخطأ | السبب الجذري | الحل |
|-------|--------------|------|
| "Webpack is configured while Turbopack is not" | إعدادات webpack غير مشروطة | نقل webpack إلى كتلة مشروطة |
| تحذير "allowedDevOrigins" | إعدادات أصل التطوير مفقودة | إضافة دعم متغير بيئة `ALLOWED_DEV_ORIGIN` |
| حجب CSP للخطوط | نطاق الخط الخارجي غير مُدرج في القائمة البيضاء | إضافة `r2cdn.perplexity.ai` إلى font-src |
| "Custom element already defined" | تسجيل مكرر | إنشاء حارس `defineOnce()` |
| "Objects are not valid as React child" | عرض `{raw: string}` مباشرة | تغليف بأداة `toText()` |
| "substring is not a function" | الاستدعاء على كائن بدلاً من نص | استخدام أداة `safeSub()` |
| "split is not a function" | الاستدعاء على كائن بدلاً من نص | استخدام أداة `safeSplit()` |
| "Gemini response did not contain valid JSON" | استجابة نصية عادية | محلل متساهل مع بديل |
| حدود توكنز غير متسقة | قيم مختلفة عبر الملفات | توحيد إلى `MAX_TOKENS_PER_USE` |
| مشاكل تحديد معدل API | لا توجد مُهل بين الطلبات | مُهل حسب النموذج |

---

## 🏗️ قرارات معمارية

### لماذا وحدة أساسية موحدة؟
1. **مصدر حقيقة واحد**: جميع إعدادات Gemini في مكان واحد
2. **مبدأ DRY**: تجنب تكرار منطق المُهل/التحليل
3. **سهولة المراجعة**: حدود التوكنز مرئية في ثابت واحد
4. **أمان النوع**: أنواع TypeScript مشتركة عبر الخدمات

### لماذا تحليل JSON متساهل؟
Gemini API أحيانًا يُرجع:
- شروحات نصية عادية
- نص مع كتل كود ```json```
- JSON مبتور (قطع منتصف التوليد)
- استجابات بصيغة مختلطة

تحليل JSON صارم سيُعطل خط الأنابيب. التحليل المتساهل يسمح بـ:
- تدهور رشيق
- استمرار التحليل حتى مع بيانات جزئية
- تجربة مستخدم أفضل (بدون فشل صارم)

### لماذا safeSub/safeSplit؟
المحطة 2 تُرجع `storyStatement` والذي *قد* يكون:
- نصًا: `"This is the story statement"`
- كائنًا: `{raw: "This is the story statement"}`

استدعاء `.substring()` أو `.split()` على كائن يُعطل التطبيق. الأدوات الآمنة:
1. تطبع إلى نص أولاً عبر `toText()`
2. ثم تُنفذ عمليات النص
3. تُرجع نصًا/مصفوفة فارغة إذا كان الإدخال غير صالح

---

## 📚 دليل الهجرة

### للمطورين الذين يضيفون محطات جديدة

**افعل ✅**:
```typescript
import { 
  throttleByModel, 
  normalizeGenConfig, 
  toText, 
  safeSub 
} from '../gemini-core';

// في دالة تنفيذ المحطة:
await throttleByModel('gemini-2.5-flash');

const config = normalizeGenConfig();
const result = await geminiService.generate({
  prompt: myPrompt,
  context: safeSub(fullText, 0, 25000),
  ...config
});

// عند استخدام النتيجة:
const text = toText(result.content);
```

**لا تفعل ❌**:
```typescript
// ❌ لا تكتب حدود التوكنز مباشرة
maxOutputTokens: 8192

// ❌ لا تستدعِ substring مباشرة
fullText.substring(0, 1000)

// ❌ لا تعرض كائنات في الواجهة
<p>{data.someField}</p>

// ❌ لا تتخطَّ المُهل الزمنية
await geminiService.generate(...) // المُهل مفقودة!
```

### لمكونات الواجهة التي تعرض نتائج المحطات

**غلّف دائمًا القيم التي قد تكون كائنات**:
```typescript
import { toText } from '@/lib/ai/gemini-core';

// عرض آمن:
<p>{toText(data.anyField)}</p>
<p>{toText(data.nested?.field)}</p>
```

---

## 📝 سجل الالتزامات (Commits)

تم تطبيق هذه الإصلاحات في الالتزامات المنطقية التالية:

1. `feat(ai): create unified gemini-core module`
   - إنشاء الوحدة الأساسية الموحدة

2. `fix(config): resolve Turbopack/Webpack conflict`
   - حل تعارضات الإعدادات

3. `feat(security): add CSP middleware`
   - إضافة middleware للأمان

4. `feat(web-components): add registration guards`
   - حماية تسجيل Web Components

5. `refactor(ai): integrate services with core`
   - دمج جميع الخدمات مع الوحدة الأساسية

6. `fix(stations): use safe text utilities`
   - استخدام الأدوات الآمنة في المحطات

7. `fix(ui): prevent object rendering`
   - منع عرض الكائنات في الواجهة

---

## 🎯 النتائج المتوقعة بعد الدمج

✅ **اختفاء تحذيرات التطوير**:
- لا تحذير Turbopack/Webpack
- لا تحذير `allowedDevOrigins`

✅ **استقرار الواجهة**:
- لا أخطاء React عند عرض النتائج
- عرض صحيح لجميع البيانات

✅ **مرونة خط الأنابيب**:
- المحطات لا تتعطل عند مخرجات غير JSON
- استمرار التنفيذ مع بديل نصي

✅ **الالتزام بحدود API**:
- مُهل 6/10/15 ثانية حسب النموذج
- سجلات الاستدعاءات تُظهر التقيد

✅ **خصوصية المستخدم**:
- عدم عرض JSON للمستخدم النهائي
- واجهة نصية فقط

---

## 📞 الدعم

في حالة وجود مشاكل:
1. تحقق من console المتصفح للرسائل المحددة
2. تأكد من ضبط متغيرات البيئة بشكل صحيح
3. تأكد من تشغيل `pnpm install` بعد سحب التغييرات
4. تحقق من صلاحية Gemini API key ووجود حصة كافية

---

## 🔗 مراجع

- [توثيق Next.js 15 Turbopack](https://nextjs.org/docs/app/api-reference/next-config-js)
- [دليل Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [مواصفات Custom Elements](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry)
- [توثيق Gemini API](https://ai.google.dev/docs)

---

**نسخة المستند**: 1.0  
**آخر تحديث**: 2024-01-09  
**المؤلف**: فريق هندسة AI