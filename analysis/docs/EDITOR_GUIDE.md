# دليل محرر السيناريو العربي

## مواصفات المحرر

### الموقع الأساسي
`src/components/editor/CleanIntegratedScreenplayEditor.tsx`

### خصائص المحرر الأساسية

#### 1. منطقة التحرير
- **Element**: `<div contentEditable>` (السطر 1780)
- **الاتجاه**: RTL للنصوص العربية
- **الخطوط**: `Amiri, Cairo, Noto Sans Arabic, Arial`
- **المعالجات**: `onKeyDown`, `onPaste`, `onInput`

#### 2. تنسيقات السيناريو المدعومة

##### أ. رؤوس المشاهد
```
نمط: مشهد 1، مشهد 2 - ليل-داخلي
التنسيق: نص عريض، محاذاة وسط، مرقم
المثال: "مشهد 1 – ليل-داخلي"
```

##### ب. أسماء الشخصيات
```
نمط: اسم عربي + نقطتان (:)
التنسيق: نص عريض، محاذاة وسط، أحرف كبيرة
المثال: "أحمد:"
```

##### ج. الحوار
```
الموقع: تحت أسماء الشخصيات مباشرة
التنسيق: محاذاة وسط مع هوامش
الخصائص: RTL، فقرة مسكونة
```

##### د. أسطر الحركة/الوصف
```
الكشف: أفعال عربية (60+ فعل)
التنسيق: محاذاة يمين، RTL
الأفعال: يدخل، يخرج، ينظر، يرفع، تبتسم...
```

##### هـ. الانتقالات
```
الأنواع: قطع، ذوبان، انتقال
التنسيق: نص عريض، محاذاة وسط
```

##### و. البسملة (خاص)
```
النص: "بسم الله الرحمن الرحيم"
المعالجة: تعامل خاص وتنسيق مميز
```

## كيفية حقن الأنماط

### 1. التصنيف التلقائي
```typescript
// المصنف يحلل النص ويحدد النوع
const classifier = new ScreenplayClassifier();
const lineType = classifier.classifyLine(text);

// التطبيق التلقائي للتنسيق
const styles = getFormatStyles(lineType);
element.style.apply(styles);
```

### 2. أنماط CSS المطبقة

#### رؤوس المشاهد
```css
text-align: center;
font-weight: bold;
margin: 20px 0;
text-transform: uppercase;
```

#### أسماء الشخصيات
```css
text-align: center;
font-weight: bold;
margin: 15px 0 5px 0;
text-transform: uppercase;
```

#### الحوار
```css
text-align: center;
margin: 0 60px;
line-height: 1.6;
direction: rtl;
```

#### أسطر الحركة
```css
text-align: right;
margin: 10px 0;
direction: rtl;
font-style: normal;
```

## القيود المعروفة

### 1. القيود التقنية
- **استيراد الملفات**: لا يدعم استيراد .docx مباشرة
- **التصدير**: محدود بصيغ نصية أساسية
- **التعاون المباشر**: غير مفعل حالياً

### 2. قيود النصوص
- **الخطوط المطلوبة**: يحتاج خطوط عربية مثبتة
- **النصوص المختلطة**: قد تحتاج معايرة دقيقة
- **علامات الترقيم**: حساسة للرموز العربية/الإنجليزية

### 3. قيود الأداء
- **النصوص الطويلة**: قد تبطئ التصنيف الفوري
- **الذاكرة**: الفئات المدمجة تزيد استهلاك الذاكرة

## إرشادات المساهمة

### 1. تطوير المصنف
```typescript
// إضافة أفعال جديدة
ACTION_VERBS: ['فعل جديد', ...existing]

// تحديث الأنماط
SCENE_HEADER: /^مشهد\s+\d+.*$/

// اختبار التحديثات
npm run test
```

### 2. تعديل الأنماط
```typescript
// في getFormatStyles()
case 'SCENE_HEADER':
  return {
    textAlign: 'center',
    fontWeight: 'bold',
    // أنماط جديدة...
  };
```

### 3. إضافة تنسيقات جديدة
1. أضف النوع الجديد إلى `ScreenplayClassifier`
2. حدّث `getFormatStyles()` لدعم النوع
3. اختبر مع نصوص عربية متنوعة
4. تأكد من دعم RTL الصحيح

### 4. اختبار التغييرات
```bash
# اختبار المصنف
npm run test

# اختبار في البيئة المحلية
npm run dev

# اختبار البناء
npm run build
```

## الاستخدام المتقدم

### 1. تخصيص الخطوط
```typescript
// في CleanIntegratedScreenplayEditor
const customFonts = [
  'خط مخصص',
  'Amiri',
  'Cairo',
  'Noto Sans Arabic'
];
```

### 2. إضافة اختصارات لوحة المفاتيح
```typescript
// في handleKeyDown
case 'F1': // اختصار مخصص
  applySceneHeaderFormat();
  break;
```

### 3. حفظ تلقائي مخصص
```typescript
const autoSave = new AutoSaveManager(15000); // كل 15 ثانية
autoSave.setSaveCallback(async (content) => {
  // منطق حفظ مخصص
});
```