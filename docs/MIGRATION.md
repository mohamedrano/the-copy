# خطة الانتقال إلى البنية المحسنة

## نظرة عامة

هذا الدليل يوضح خطوات الانتقال من البنية الحالية إلى البنية المحسنة المقترحة لمحرر السيناريو العربي.

## الوضع الحالي

### البنية الحالية:
```
src/
├── components/
│   ├── editor/
│   │   ├── CleanIntegratedScreenplayEditor.tsx (غير مفعل)
│   │   └── AdvancedAgentsPopup.tsx
│   ├── naqid/
│   │   └── NaqidDashboard.tsx (الواجهة الحالية)
│   └── legacy/ (مستبعد من tsconfig)
├── agents/ (27 وكيل متخصص)
├── services/
├── config/
└── types/
```

### المشاكل المحددة:
1. **الواجهة الافتراضية**: NaqidDashboard بدلاً من المحرر المتقدم
2. **ملفات legacy مستبعدة**: قد تحتوي على كود مفيد
3. **تنظيم الملفات**: بعض الملفات في مواقع غير مثلى
4. **تسمية غير موحدة**: خليط من kebab-case و camelCase

## البنية المقترحة

### الهيكل الجديد:
```
src/
├── components/
│   ├── editor/
│   │   ├── screenplay-editor.tsx (الرئيسي)
│   │   ├── agents-popup.tsx
│   │   └── text-replacement.ts
│   ├── dashboard/
│   │   └── analysis-dashboard.tsx (ناقد)
│   └── shared/
│       ├── ui-components.tsx
│       └── rtl-wrapper.tsx
├── agents/
│   ├── core/
│   │   ├── index.ts (نقطة الدخول)
│   │   ├── integrated-agent.ts
│   │   └── gemini-service.ts
│   ├── analysis/ (17 وكيل)
│   ├── generation/ (5 وكلاء)
│   ├── transformation/ (3 وكلاء)
│   └── evaluation/ (2 وكيل)
├── services/
│   ├── analysis-service.ts
│   ├── state-manager.ts
│   └── auto-save-manager.ts
├── modules/
│   ├── text/
│   │   └── dom-text-replacement.ts
│   └── rtl/
│       └── arabic-support.ts
├── config/
│   ├── agents-config.ts
│   ├── environment.ts
│   └── prompts.ts
├── types/
│   ├── screenplay.types.ts
│   ├── agent.types.ts
│   └── ui.types.ts
└── utils/
    ├── screenplay-classifier.ts
    └── arabic-helpers.ts
```

## خطوات الانتقال

### المرحلة 1: التحضير (يوم 1)
1. **نسخ احتياطي كامل**
   ```bash
   git add .
   git commit -m "backup before migration"
   git tag v1.0-pre-migration
   ```

2. **تحليل التبعيات**
   - فحص جميع الاستيرادات
   - تحديد الملفات المترابطة
   - توثيق التبعيات الخارجية

3. **إنشاء فروع العمل**
   ```bash
   git checkout -b migration/structure-refactor
   git checkout -b migration/ui-switch
   git checkout -b migration/cleanup
   ```

### المرحلة 2: إعادة تنظيم الملفات (يوم 2-3)

#### 2.1 إعادة تسمية المكونات
```bash
# تحويل إلى kebab-case
mv src/components/editor/CleanIntegratedScreenplayEditor.tsx \
   src/components/editor/screenplay-editor.tsx

mv src/components/editor/AdvancedAgentsPopup.tsx \
   src/components/editor/agents-popup.tsx

mv src/components/naqid/NaqidDashboard.tsx \
   src/components/dashboard/analysis-dashboard.tsx
```

#### 2.2 إعادة تنظيم الوكلاء
```bash
# تحويل أسماء ملفات الوكلاء
cd src/agents/analysis/
for file in *.ts; do
  new_name=$(echo "$file" | sed 's/\([A-Z]\)/-\L\1/g' | sed 's/^-//')
  mv "$file" "$new_name"
done
```

#### 2.3 تحديث المسارات
- تحديث جميع الاستيرادات
- إضافة alias paths في tsconfig.json
- تحديث vite.config.ts

### المرحلة 3: تحديث التكوين (يوم 4)

#### 3.1 تحديث tsconfig.json
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/agents/*": ["src/agents/*"],
      "@/services/*": ["src/services/*"],
      "@/types/*": ["src/types/*"],
      "@/config/*": ["src/config/*"]
    }
  },
  "include": ["src"],
  "exclude": [
    "node_modules",
    "dist",
    "archive/**/*"
  ]
}
```

#### 3.2 تحديث vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: 'localhost',
    port: 5177,
  }
})
```

#### 3.3 تحسين tailwind.config.js
```javascript
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'arabic': ['Amiri', 'Cairo', 'Tajawal', 'Noto Sans Arabic', 'sans-serif'],
      },
      direction: {
        'rtl': 'rtl',
      }
    },
  },
  darkMode: 'class',
  plugins: [],
}
```

### المرحلة 4: تبديل الواجهة الافتراضية (يوم 5)

#### 4.1 تحديث App.tsx
```typescript
// قبل
import NaqidDashboard from './components/naqid/NaqidDashboard';

export default function App() {
  return <NaqidDashboard />;
}

// بعد
import ScreenplayEditor from '@/components/editor/screenplay-editor';

export default function App() {
  return <ScreenplayEditor />;
}
```

#### 4.2 إضافة تبديل الواجهات
```typescript
import { useState } from 'react';
import ScreenplayEditor from '@/components/editor/screenplay-editor';
import AnalysisDashboard from '@/components/dashboard/analysis-dashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<'editor' | 'dashboard'>('editor');
  
  return (
    <div className="min-h-screen">
      <nav className="border-b p-4">
        <button onClick={() => setCurrentView('editor')}>المحرر</button>
        <button onClick={() => setCurrentView('dashboard')}>التحليل</button>
      </nav>
      
      {currentView === 'editor' ? <ScreenplayEditor /> : <AnalysisDashboard />}
    </div>
  );
}
```

### المرحلة 5: تحسين دعم RTL (يوم 6)

#### 5.1 إنشاء مكون RTL Wrapper
```typescript
// src/components/shared/rtl-wrapper.tsx
import React from 'react';

interface RTLWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const RTLWrapper: React.FC<RTLWrapperProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={`rtl-container ${className}`}
      dir="rtl"
      style={{
        fontFamily: 'Amiri, Cairo, Tajawal, "Noto Sans Arabic", sans-serif',
        textAlign: 'right',
        direction: 'rtl'
      }}
    >
      {children}
    </div>
  );
};
```

#### 5.2 تحديث CSS العام
```css
/* src/style.css */
.rtl-container {
  direction: rtl;
  text-align: right;
}

.rtl-container input,
.rtl-container textarea {
  text-align: right;
  direction: rtl;
}

/* دعم الخطوط العربية */
@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
```

### المرحلة 6: تنظيف وتحسين (يوم 7)

#### 6.1 حذف الملفات غير المستخدمة
```bash
# نقل legacy إلى archive
mv src/components/legacy archive/components-legacy

# حذف ملفات الاختبار القديمة
rm -rf src/tests/*.cjs

# تنظيف ملفات التحليل المؤقتة
rm -rf analysis/
```

#### 6.2 تحديث package.json
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint src --ext ts,tsx",
    "type-check": "tsc --noEmit"
  }
}
```

### المرحلة 7: الاختبار والتحقق (يوم 8)

#### 7.1 اختبارات التشغيل
```bash
# تنظيف وإعادة تثبيت
rm -rf node_modules package-lock.json
npm install

# اختبار البناء
npm run build

# اختبار التشغيل
npm run dev
```

#### 7.2 اختبارات الوظائف
- [ ] تحميل المحرر بنجاح
- [ ] عمل التنسيقات العربية
- [ ] وظائف البحث والاستبدال
- [ ] تشغيل الوكلاء الذكية
- [ ] الحفظ التلقائي
- [ ] التبديل بين الواجهات

#### 7.3 اختبارات الأداء
- [ ] وقت التحميل < 3 ثواني
- [ ] استجابة الواجهة < 100ms
- [ ] استهلاك الذاكرة < 100MB
- [ ] حجم البناء < 2MB

## خطة التراجع

### في حالة فشل الانتقال:
```bash
# العودة للنسخة السابقة
git checkout main
git reset --hard v1.0-pre-migration

# أو استعادة من نسخة احتياطية
cp -r backup/ src/
```

### نقاط التحقق:
1. **بعد كل مرحلة**: commit + tag
2. **اختبار فوري**: للتأكد من عدم كسر الوظائف
3. **نسخ احتياطية**: قبل التغييرات الكبيرة

## الجدول الزمني

| المرحلة | المدة | المهام الرئيسية |
|---------|-------|-----------------|
| 1 | يوم 1 | التحضير والنسخ الاحتياطي |
| 2 | يوم 2-3 | إعادة تنظيم الملفات |
| 3 | يوم 4 | تحديث التكوين |
| 4 | يوم 5 | تبديل الواجهة |
| 5 | يوم 6 | تحسين RTL |
| 6 | يوم 7 | التنظيف |
| 7 | يوم 8 | الاختبار |

## المخاطر والتخفيف

### المخاطر المحتملة:
1. **كسر التبعيات**: اختبار مستمر
2. **فقدان البيانات**: نسخ احتياطية متعددة
3. **مشاكل الأداء**: مراقبة مستمرة
4. **تعارض الخطوط**: اختبار على متصفحات متعددة

### استراتيجيات التخفيف:
- انتقال تدريجي بدلاً من جذري
- اختبار مكثف في كل مرحلة
- الاحتفاظ بالنسخة القديمة كاحتياطي
- توثيق شامل للتغييرات

## ما بعد الانتقال

### التحسينات المستقبلية:
1. **PWA Support**: للعمل دون اتصال
2. **WebSocket**: للتعاون المباشر
3. **Plugin System**: لوكلاء مخصصة
4. **Mobile Optimization**: تحسين للهواتف

### الصيانة المستمرة:
- مراجعة دورية للأداء
- تحديث التبعيات
- إضافة اختبارات جديدة
- تحسين تجربة المستخدم

هذه الخطة توفر انتقالاً آمناً ومنظماً إلى البنية المحسنة مع الحفاظ على جميع الوظائف الحالية وإضافة تحسينات جديدة.