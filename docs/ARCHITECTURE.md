# بنية النظام المعمارية

## نظرة عامة على البنية

يتبع محرر السيناريو العربي بنية طبقية حديثة مع فصل واضح للاهتمامات:

```
┌─────────────────────────────────────────┐
│           طبقة العرض (UI Layer)          │
│  React Components + Tailwind CSS       │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│        طبقة المنطق (Logic Layer)        │
│     Services + State Management         │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│       طبقة الوكلاء (Agents Layer)       │
│    AI Agents + Analysis + Generation    │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│        طبقة البيانات (Data Layer)        │
│      Types + Configs + Modules          │
└─────────────────────────────────────────┘
```

## الطبقات التفصيلية

### 1. طبقة العرض (Components)

#### المكونات الرئيسية:
- **NaqidDashboard**: واجهة التحليل السريع (الحالية)
- **CleanIntegratedScreenplayEditor**: المحرر المتقدم (غير مفعل)
- **AdvancedAgentsPopup**: واجهة الوكلاء المتقدمة

#### خصائص RTL/Arabic:
- اتجاه النص: `direction: rtl`
- الخطوط: Amiri, Cairo, Tajawal
- التخطيط: Flexbox مع `justify-content: flex-end`
- التنسيق: Tailwind CSS مع دعم `dark:` mode

### 2. طبقة الخدمات (Services)

#### الخدمات الأساسية:
- **AnalysisService**: تحليل النصوص والسيناريوهات
- **StateManager**: إدارة حالة التطبيق
- **AutoSaveManager**: الحفظ التلقائي
- **SearchEngine**: البحث والاستبدال المتقدم
- **CollaborationSystem**: نظام التعاون (مستقبلي)

### 3. طبقة الوكلاء (Agents)

#### التصنيف الهرمي:

```
agents/
├── core/                    # الوكلاء الأساسية
│   ├── index.ts            # نقطة الدخول المركزية
│   ├── integratedAgent.ts  # الوكيل المتكامل
│   └── geminiService.ts    # خدمة Gemini AI
├── analysis/               # وكلاء التحليل
│   ├── analysisAgent.ts           # التحليل العام
│   ├── characterDeepAnalyzer.ts   # تحليل الشخصيات المتعمق
│   ├── dialogueForensics.ts       # تحليل الحوار الجنائي
│   ├── rhythmMapping.ts           # تحليل الإيقاع
│   └── ...                       # 15+ وكيل متخصص
├── generation/             # وكلاء التوليد
│   ├── creativeAgent.ts           # التوليد الإبداعي
│   ├── sceneGenerator.ts          # توليد المشاهد
│   └── worldBuilder.ts            # بناء العوالم
├── transformation/         # وكلاء التحويل
│   ├── adaptiveRewriting.ts       # إعادة الكتابة التكيفية
│   └── platformAdapter.ts         # تكييف المنصات
└── evaluation/            # وكلاء التقييم
    ├── audienceResonance.ts       # صدى الجمهور
    └── tensionOptimizer.ts        # تحسين التوتر
```

### 4. طبقة البيانات (Data Layer)

#### التعريفات الأساسية:
```typescript
interface Script {
  rawText: string;
  totalLines: number;
  scenes: Scene[];
  characters: Record<string, Character>;
  dialogueLines: DialogueLine[];
}

interface Scene {
  id: string;
  heading: string;
  index: number;
  startLineNumber: number;
  endLineNumber?: number;
  lines: string[];
  dialogues: DialogueLine[];
  actionLines: SceneActionLine[];
}
```

## تدفق البيانات

### 1. تدفق التحليل:
```
نص خام → ScreenplayClassifier → Script مهيكل → AnalysisService → نتائج التحليل
```

### 2. تدفق التحرير:
```
إدخال المستخدم → Editor Component → State Manager → Auto Save → Local Storage
```

### 3. تدفق الوكلاء:
```
محتوى → Agent Selection → AI Processing → Results → UI Display
```

## إدارة الحالة

### StateManager Pattern:
- **Subscribe/Notify**: نمط المراقب للتحديثات
- **Centralized State**: حالة مركزية للمكونات
- **Type Safety**: أمان الأنواع مع TypeScript

### Auto-Save Strategy:
- **Interval**: كل 30 ثانية
- **Change Detection**: مقارنة المحتوى
- **Error Handling**: إعادة المحاولة عند الفشل

## قيود RTL/Arabic

### التحديات المعالجة:
1. **اتجاه النص**: حل بـ `direction: rtl` عالمياً
2. **التخطيط**: Flexbox مع `justify-content` مناسب
3. **الخطوط**: تحميل خطوط عربية محسنة
4. **التشكيل**: إزالة التشكيل للمعالجة
5. **علامات الترقيم**: دعم علامات عربية (؟، ؛)

### الحلول المطبقة:
```css
.rtl-container {
  direction: rtl;
  text-align: right;
  font-family: 'Amiri', 'Cairo', 'Noto Sans Arabic';
}
```

## تبرير القرارات المعمارية

### 1. فصل الوكلاء:
- **السبب**: قابلية الصيانة والتوسع
- **الفائدة**: إضافة وكلاء جديدة بسهولة
- **التكلفة**: تعقيد إضافي في البداية

### 2. TypeScript الصارم:
- **السبب**: أمان الأنواع وتجربة تطوير أفضل
- **الفائدة**: اكتشاف الأخطاء مبكراً
- **التكلفة**: وقت إعداد إضافي

### 3. Tailwind CSS:
- **السبب**: سرعة التطوير ودعم RTL
- **الفائدة**: تناسق التصميم
- **التكلفة**: حجم CSS أكبر

### 4. Vite Build Tool:
- **السبب**: سرعة التطوير والبناء
- **الفائدة**: HMR سريع
- **التكلفة**: تبعية إضافية

## نقاط التوسع المستقبلية

1. **WebSocket Integration**: للتعاون المباشر
2. **PWA Support**: للعمل دون اتصال
3. **Plugin System**: لوكلاء مخصصة
4. **Cloud Storage**: للمزامنة عبر الأجهزة
5. **Mobile Responsive**: تحسين للهواتف

## مقاييس الأداء

- **Bundle Size**: < 2MB (مضغوط)
- **First Load**: < 3 ثواني
- **Time to Interactive**: < 5 ثواني
- **Memory Usage**: < 100MB (متوسط)

## الأمان

- **Input Sanitization**: تنظيف المدخلات
- **XSS Protection**: حماية من البرمجة النصية
- **CSP Headers**: سياسة أمان المحتوى
- **API Rate Limiting**: تحديد معدل الطلبات