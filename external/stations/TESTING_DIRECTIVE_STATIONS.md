# 🧪 الأمر التوجيهي لتحسين التغطية الاختبارية - مشروع Stations

## 📋 نظرة عامة

هذا الأمر التوجيهي مخصص لتحسين التغطية الاختبارية لنظام تحليل النصوص الدرامية المتقدم "Stations" بشكل منهجي وشامل. النظام يتكون من **7 محطات متسلسلة** لتحليل النصوص السردية والدرامية باستخدام TypeScript و Gemini AI.

---

## 🎯 الهدف الأساسي

تطوير مجموعة شاملة من الاختبارات عالية الجودة تغطي:
- **المحطات السبع** لتحليل النصوص الدرامية
- **خدمات الذكاء الاصطناعي** (Gemini Service)
- **النماذج الأساسية** (Base Entities)
- **واجهة المستخدم** React/TypeScript
- **API Routes** و Express Server
- **تكامل النظام** بين المحطات

---

## 🔍 المرحلة الأولى: تحليل التغطية الحالية

### 1.1 فحص الملفات الأساسية بدون اختبارات

قم بفحص الملفات التالية وتحديد أولويات الاختبار:

**المحطات الأساسية (أولوية عالية):**
```
server/stations/station1/station1-text-analysis.ts
server/stations/station2/station2-conceptual-analysis.ts
server/stations/station3/station3-network-builder.ts
server/stations/station4/station4-efficiency-metrics.ts
server/stations/station5/station5-dynamic-symbolic-stylistic.ts
server/stations/station6/station6-diagnostics-treatment.ts
server/stations/station7/station7-finalization.ts
```

**النماذج والكيانات الأساسية (أولوية عالية):**
```
server/core/models/base-entities.ts
server/core/pipeline/base-station.ts
```

**خدمات الذكاء الاصطناعي (أولوية عالية):**
```
server/services/ai/gemini-service.ts
server/services/ai/result-selector.ts
```

**وحدات التحليل (أولوية متوسطة):**
```
server/analysis_modules/efficiency-metrics.ts
server/analysis_modules/network-diagnostics.ts
```

**واجهة المستخدم (أولوية متوسطة):**
```
src/components/AnalysisCard.tsx
src/components/ConflictNetwork.tsx
src/components/DiagnosticPanel.tsx
src/components/StationProgress.tsx
```

### 1.2 تحديد المسارات الحرجة

ركز على اختبار:
- **تدفق البيانات** بين المحطات السبع
- **معالجة أخطاء API** مع Gemini
- **تحويل البيانات** من JSON إلى النماذج
- **حالات الفشل** وآليات الاستعادة
- **التحقق من صحة المدخلات** العربية والإنجليزية

---

## 🧪 المرحلة الثانية: تطوير الاختبارات المتخصصة

### 2.1 اختبارات المحطات (Station Tests)

#### Station 1 - Text Analysis Tests
```typescript
// tests/stations/station1.test.ts
describe('Station1TextAnalysis', () => {
  // اختبار تحديد الشخصيات الرئيسية
  test('should identify major characters from Arabic text', async () => {
    const arabicText = 'في قرية صغيرة يعيش أحمد وفاطمة...';
    // تحقق من استخراج الشخصيات بدقة
  });

  // اختبار تحليل العلاقات
  test('should analyze relationships between characters', async () => {
    // تحقق من كشف العلاقات الدرامية
  });

  // اختبار معالجة النصوص القصيرة
  test('should handle short texts gracefully', async () => {
    // تحقق من التعامل مع النصوص أقل من 100 حرف
  });

  // اختبار فشل API
  test('should handle Gemini API failures', async () => {
    // محاكاة فشل API والتحقق من الاستعادة
  });
});
```

#### Station 3 - Network Builder Tests
```typescript
// tests/stations/station3.test.ts
describe('Station3NetworkBuilder', () => {
  // اختبار بناء الشبكة
  test('should build conflict network from station1 output', async () => {
    // تحقق من تحويل تحليل النص إلى شبكة صراع
  });

  // اختبار استدلال العلاقات
  test('should infer relationships using AI', async () => {
    // تحقق من دقة استدلال العلاقات بالذكاء الاصطناعي
  });

  // اختبار اللقطات الزمنية
  test('should create network snapshots', async () => {
    // تحقق من إنشاء لقطات زمنية لتطور الشبكة
  });
});
```

### 2.2 اختبارات النماذج الأساسية (Base Entities Tests)

```typescript
// tests/core/base-entities.test.ts
describe('ConflictNetworkImpl', () => {
  // اختبار إضافة الشخصيات
  test('should add characters to network', () => {
    const network = new ConflictNetworkImpl('test', 'Test Network');
    const character: Character = {
      id: 'char1',
      name: 'أحمد',
      description: 'شخصية رئيسية',
      profile: {
        personalityTraits: 'شجاع ومتهور',
        motivationsGoals: 'البحث عن العدالة',
        potentialArc: 'تطور من المتهور إلى الحكيم'
      },
      metadata: {}
    };
    
    network.addCharacter(character);
    expect(network.characters.get('char1')).toEqual(character);
  });

  // اختبار إنشاء اللقطات
  test('should create network snapshots', () => {
    // تحقق من إنشاء لقطات زمنية صحيحة
  });

  // اختبار العلاقات المعقدة
  test('should handle complex relationship types', () => {
    // تحقق من دعم جميع أنواع العلاقات
  });
});
```

### 2.3 اختبارات خدمة Gemini AI

```typescript
// tests/services/gemini-service.test.ts
describe('GeminiService', () => {
  // اختبار التوليد الأساسي
  test('should generate content with Arabic prompts', async () => {
    const mockResponse = { major_characters: ['أحمد', 'فاطمة'] };
    // محاكاة استجابة Gemini وتحقق من التحليل
  });

  // اختبار معالجة الأخطاء
  test('should handle API rate limits', async () => {
    // محاكاة تجاوز حدود API والتحقق من إعادة المحاولة
  });

  // اختبار النماذج المختلفة
  test('should switch between PRO and FLASH models', async () => {
    // تحقق من التبديل بين نماذج Gemini
  });

  // اختبار التحقق من صحة JSON
  test('should validate and parse JSON responses', async () => {
    // تحقق من تحليل استجابات JSON المعقدة
  });
});
```

### 2.4 اختبارات واجهة المستخدم

```typescript
// tests/components/StationProgress.test.tsx
import { render, screen } from '@testing-library/react';
import { StationProgress } from '@/components/StationProgress';

describe('StationProgress Component', () => {
  // اختبار عرض التقدم
  test('should display correct progress for completed stations', () => {
    const completedStations = [1, 2, 3];
    render(<StationProgress completedStations={completedStations} />);
    
    expect(screen.getByText('المحطة 1')).toBeInTheDocument();
    expect(screen.getByText('المحطة 3')).toHaveClass('completed');
  });

  // اختبار الدعم للغة العربية
  test('should handle RTL layout for Arabic content', () => {
    // تحقق من دعم التخطيط من اليمين لليسار
  });
});
```

---

## 🔧 المرحلة الثالثة: اختبارات التكامل المتقدمة

### 3.1 اختبار Pipeline الكامل

```typescript
// tests/integration/full-pipeline.test.ts
describe('Full Analysis Pipeline', () => {
  // اختبار التدفق الكامل
  test('should complete full 7-station analysis', async () => {
    const sampleText = `في قرية صغيرة على ضفاف النيل، يعيش أحمد، شاب طموح يحلم بأن يصبح طبيباً. 
    لكن والده، الحاج محمود، يريده أن يعمل في الأرض مثل أجداده. 
    تدخل فاطمة، ابنة عم أحمد، في حياته كحب أول، لكنها مخطوبة لابن التاجر الثري في القرية...`;

    const pipeline = new AnalysisPipeline(mockGeminiService);
    const result = await pipeline.runFullAnalysis({
      fullText: sampleText,
      projectName: 'Test Story'
    });

    // تحقق من اكتمال جميع المحطات
    expect(result.station1).toBeDefined();
    expect(result.station3.network.characters.size).toBeGreaterThan(0);
    expect(result.station4.overallEfficiencyScore).toBeGreaterThan(0);
    expect(result.station6.overallHealthScore).toBeGreaterThan(0);
  });

  // اختبار معالجة الأخطاء المتسلسلة
  test('should handle cascading failures gracefully', async () => {
    // محاكاة فشل في المحطة 2 والتحقق من تأثيره على المحطات التالية
  });
});
```

### 3.2 اختبار الأداء

```typescript
// tests/performance/stations-performance.test.ts
describe('Performance Tests', () => {
  // اختبار أداء المحطات
  test('should complete Station 1 within time limit', async () => {
    const startTime = Date.now();
    await station1.process(testInput);
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(60000); // أقل من دقيقة
  });

  // اختبار استهلاك الذاكرة
  test('should not exceed memory limits', async () => {
    // مراقبة استهلاك الذاكرة أثناء التحليل
  });
});
```

---

## 📊 المرحلة الرابعة: اختبارات الحالات الحدية

### 4.1 اختبار النصوص المتنوعة

```typescript
// tests/edge-cases/text-variations.test.ts
describe('Text Variation Tests', () => {
  // نصوص قصيرة جداً
  test('should handle very short texts', async () => {
    const shortText = 'أحمد يحب فاطمة.';
    // تحقق من التعامل مع النصوص القصيرة
  });

  // نصوص طويلة جداً
  test('should handle very long texts', async () => {
    const longText = 'نص طويل جداً...'.repeat(1000);
    // تحقق من التعامل مع النصوص الطويلة
  });

  // نصوص مختلطة (عربي/إنجليزي)
  test('should handle mixed language texts', async () => {
    const mixedText = 'Ahmed loves فاطمة and they live in Cairo';
    // تحقق من التعامل مع النصوص المختلطة
  });

  // نصوص بدون شخصيات واضحة
  test('should handle texts without clear characters', async () => {
    const descriptiveText = 'المناظر الطبيعية جميلة في الربيع...';
    // تحقق من التعامل مع النصوص الوصفية
  });
});
```

### 4.2 اختبار أخطاء API

```typescript
// tests/edge-cases/api-failures.test.ts
describe('API Failure Scenarios', () => {
  // انقطاع الاتصال
  test('should handle network timeouts', async () => {
    // محاكاة انقطاع الشبكة
  });

  // تجاوز حدود الاستخدام
  test('should handle rate limit exceeded', async () => {
    // محاكاة تجاوز حدود API
  });

  // استجابات غير صالحة
  test('should handle invalid JSON responses', async () => {
    // محاكاة استجابات JSON غير صالحة
  });
});
```

---

## 🎨 المرحلة الخامسة: اختبارات واجهة المستخدم المتقدمة

### 5.1 اختبار التفاعل

```typescript
// tests/ui/user-interactions.test.tsx
describe('User Interaction Tests', () => {
  // اختبار إدخال النص
  test('should accept Arabic text input', async () => {
    render(<TextInput />);
    const textArea = screen.getByRole('textbox');
    
    await userEvent.type(textArea, 'نص عربي للاختبار');
    expect(textArea).toHaveValue('نص عربي للاختبار');
  });

  // اختبار تبديل اللغة
  test('should toggle between Arabic and English', async () => {
    render(<LanguageToggle />);
    const toggleButton = screen.getByRole('button', { name: /language/i });
    
    await userEvent.click(toggleButton);
    expect(document.documentElement).toHaveAttribute('dir', 'ltr');
  });

  // اختبار عرض النتائج
  test('should display analysis results correctly', async () => {
    const mockResults = {
      majorCharacters: ['أحمد', 'فاطمة'],
      overallEfficiencyScore: 85
    };
    
    render(<AnalysisCard results={mockResults} />);
    expect(screen.getByText('أحمد')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });
});
```

### 5.2 اختبار إمكانية الوصول

```typescript
// tests/accessibility/a11y.test.tsx
describe('Accessibility Tests', () => {
  // اختبار دعم قارئ الشاشة
  test('should be accessible to screen readers', async () => {
    render(<StationProgress />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label');
  });

  // اختبار التنقل بلوحة المفاتيح
  test('should support keyboard navigation', async () => {
    render(<Navigation />);
    const firstLink = screen.getAllByRole('link')[0];
    
    firstLink.focus();
    expect(firstLink).toHaveFocus();
  });
});
```

---

## 🔄 المرحلة السادسة: التحقق من الجودة

### 6.1 إعداد أدوات الاختبار

```json
// package.json - إضافة scripts الاختبار
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "test:stations": "vitest tests/stations",
    "test:integration": "vitest tests/integration",
    "test:e2e": "playwright test"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "playwright": "^1.40.0",
    "msw": "^2.0.0"
  }
}
```

### 6.2 إعداد Mock Services

```typescript
// tests/mocks/gemini-service.mock.ts
export class MockGeminiService extends GeminiService {
  async generate<T>(params: any): Promise<{ content: T }> {
    // محاكاة استجابات Gemini المختلفة
    if (params.prompt.includes('major_characters')) {
      return {
        content: {
          major_characters: ['أحمد', 'فاطمة', 'الحاج محمود']
        } as T
      };
    }
    
    // محاكاة استجابات أخرى...
    return { content: {} as T };
  }
}
```

### 6.3 تقرير التغطية المستهدف

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85
        },
        // متطلبات خاصة للمحطات الحرجة
        'server/stations/': {
          branches: 90,
          functions: 95,
          lines: 90,
          statements: 90
        },
        'server/core/': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        }
      }
    }
  }
});
```

---

## 📋 المرحلة السابعة: التنفيذ والتحقق

### 7.1 خطة التنفيذ المرحلية

**الأسبوع الأول:**
- ✅ إعداد بيئة الاختبار (Vitest, Testing Library)
- ✅ اختبارات النماذج الأساسية (base-entities.ts)
- ✅ اختبارات خدمة Gemini الأساسية

**الأسبوع الثاني:**
- ✅ اختبارات المحطة 1 (تحليل النص)
- ✅ اختبارات المحطة 3 (بناء الشبكة)
- ✅ اختبارات المحطة 4 (قياس الكفاءة)

**الأسبوع الثالث:**
- ✅ اختبارات المحطات المتبقية (2, 5, 6, 7)
- ✅ اختبارات التكامل بين المحطات
- ✅ اختبارات الأداء

**الأسبوع الرابع:**
- ✅ اختبارات واجهة المستخدم
- ✅ اختبارات الحالات الحدية
- ✅ تحسين التغطية وإصلاح الثغرات

### 7.2 معايير النجاح

**التغطية الكمية:**
- تغطية إجمالية: 85%+
- تغطية المحطات الحرجة: 90%+
- تغطية النماذج الأساسية: 95%+

**التغطية النوعية:**
- اختبار جميع مسارات الأخطاء الحرجة
- اختبار التكامل بين المحطات
- اختبار الأداء تحت الضغط
- اختبار دعم اللغة العربية

### 7.3 التحقق النهائي

```bash
# تشغيل جميع الاختبارات
npm run test:coverage

# تحقق من عدم وجود regression
npm run test:integration

# اختبار الأداء
npm run test:performance

# تحقق من جودة الكود
npm run lint && npm run type-check
```

---

## 📊 ملخص التحسينات المتوقعة

### الملفات المُحسَّنة:
1. **المحطات السبع** - اختبارات شاملة لكل محطة
2. **النماذج الأساسية** - اختبارات وحدة كاملة
3. **خدمات AI** - اختبارات مع محاكاة الأخطاء
4. **واجهة المستخدم** - اختبارات تفاعل وإمكانية وصول
5. **API Routes** - اختبارات تكامل شاملة

### السلوكيات المُختبرة الجديدة:
- تحليل النصوص العربية المعقدة
- معالجة أخطاء API وإعادة المحاولة
- تدفق البيانات بين المحطات السبع
- تحويل JSON إلى نماذج البيانات
- دعم RTL في واجهة المستخدم
- قياس الأداء تحت الضغط

### الحالات الحدية المُغطاة:
- النصوص القصيرة والطويلة جداً
- النصوص المختلطة (عربي/إنجليزي)
- فشل الشبكة وتجاوز حدود API
- البيانات المفقودة أو التالفة
- التحميل المتزامن للمحطات المتعددة

---

## 🎯 الخلاصة

هذا الأمر التوجيهي المخصص يضمن:
- **تغطية شاملة** لجميع مكونات النظام الحرجة
- **اختبارات متخصصة** لطبيعة تحليل النصوص العربية
- **معالجة قوية للأخطاء** في بيئة الذكاء الاصطناعي
- **ضمان الجودة** للتدفق المعقد بين المحطات السبع
- **دعم مستقبلي** لتطوير المحطات الجديدة

النتيجة النهائية ستكون نظام اختبار قوي وشامل يضمن موثوقية وجودة نظام تحليل النصوص الدرامية في جميع الظروف والحالات.
