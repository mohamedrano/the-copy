# 🧪 دليل الاختبارات - نظام Stations

## 📋 نظرة عامة

هذا المجلد يحتوي على جميع اختبارات النظام، منظمة حسب النوع والوظيفة.

## 📁 هيكل الاختبارات

```
tests/
├── setup.ts                 # إعدادات الاختبارات العامة
├── api/                     # اختبارات API
│   ├── analyze-text.test.ts # اختبارات تحليل النص
│   └── health.test.ts       # اختبارات health check
├── units/                   # اختبارات الوحدات
│   └── environment.test.ts  # اختبارات إدارة البيئة
├── security/                # اختبارات الأمان
│   └── cors.test.ts         # اختبارات CORS
├── performance/             # اختبارات الأداء
│   └── load.test.ts         # اختبارات الحمل
└── README.md               # هذا الملف
```

## 🚀 تشغيل الاختبارات

### جميع الاختبارات
```bash
npm test
```

### اختبارات مع المراقبة
```bash
npm run test:watch
```

### اختبارات مع تغطية الكود
```bash
npm run test:coverage
```

### واجهة الاختبارات
```bash
npm run test:ui
```

### اختبارات محددة
```bash
# اختبارات API فقط
npm test tests/api

# اختبارات الأمان فقط
npm test tests/security

# اختبارات الأداء فقط
npm test tests/performance
```

## 📊 معايير التغطية

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## 🔧 إعدادات الاختبار

### متغيرات البيئة
يتم تعيين متغيرات البيئة تلقائياً في `tests/setup.ts`:

```typescript
process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.VALID_API_KEYS = 'test-api-key-1,test-api-key-2';
// ... المزيد
```

### إعدادات Vitest
تم تكوين Vitest في `vitest.config.ts` مع:
- دعم TypeScript
- تغطية الكود
- مهلة زمنية للاختبارات
- ملفات الإعداد

## 📝 أنواع الاختبارات

### 1. اختبارات API
تختبر endpoints ووظائف API:
- التحقق من المصادقة
- التحقق من صحة البيانات
- معالجة الأخطاء
- Rate limiting

### 2. اختبارات الوحدات
تختبر الوحدات الفردية:
- إدارة متغيرات البيئة
- معالجة البيانات
- دوال مساعدة

### 3. اختبارات الأمان
تختبر جوانب الأمان:
- CORS
- Headers الأمان
- التحقق من المدخلات
- Rate limiting

### 4. اختبارات الأداء
تختبر الأداء تحت الحمل:
- زمن الاستجابة
- الاستخدام المتزامن
- استخدام الذاكرة
- معالجة الأخطاء تحت الحمل

## 🛠️ إضافة اختبارات جديدة

### 1. اختبار API جديد
```typescript
// tests/api/new-endpoint.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';

describe('POST /api/new-endpoint', () => {
  it('should handle valid request', async () => {
    const response = await request(app)
      .post('/api/new-endpoint')
      .send({ data: 'test' });

    expect(response.status).toBe(200);
  });
});
```

### 2. اختبار وحدة جديدة
```typescript
// tests/units/new-module.test.ts
import { describe, it, expect } from 'vitest';
import { newFunction } from '../../server/modules/new-module';

describe('newFunction', () => {
  it('should return expected result', () => {
    const result = newFunction('input');
    expect(result).toBe('expected');
  });
});
```

## 🐛 استكشاف الأخطاء

### مشاكل شائعة

1. **فشل في تحميل الوحدات**
   - تأكد من مسارات الاستيراد
   - تحقق من إعدادات TypeScript

2. **فشل في اختبارات البيئة**
   - تأكد من تعيين متغيرات البيئة
   - تحقق من صحة القيم

3. **فشل في اختبارات API**
   - تأكد من تشغيل الخادم
   - تحقق من إعدادات CORS

### تسجيل مفصل
```bash
# تشغيل اختبار واحد مع تسجيل مفصل
npm test tests/api/analyze-text.test.ts -- --reporter=verbose
```

## 📈 مراقبة الأداء

### اختبارات الحمل
```typescript
// مثال على اختبار الحمل
it('should handle 100 concurrent requests', async () => {
  const promises = Array.from({ length: 100 }, () =>
    request(app).get('/health')
  );
  
  const responses = await Promise.all(promises);
  expect(responses.every(r => r.status === 200)).toBe(true);
});
```

### قياس الذاكرة
```typescript
// مثال على قياس الذاكرة
it('should not leak memory', async () => {
  const initialMemory = process.memoryUsage();
  
  // تنفيذ العمليات
  
  const finalMemory = process.memoryUsage();
  const increase = finalMemory.heapUsed - initialMemory.heapUsed;
  
  expect(increase).toBeLessThan(10 * 1024 * 1024); // 10MB
});
```

## 🔄 CI/CD

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:coverage
```

## 📚 موارد إضافية

- [Vitest Documentation](https://vitest.dev/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

