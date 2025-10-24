# The Copy Backend - واجهة برمجة التطبيقات الخلفية

<div align="center">

![Express.js](https://img.shields.io/badge/Express.js-4.18.2-green?style=for-the-badge&logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Google AI](https://img.shields.io/badge/Google-AI-4285F4?style=for-the-badge&logo=google)
![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=for-the-badge&logo=node.js)

**واجهة برمجة تطبيقات قوية لمنصة تحليل النصوص الدرامية بالذكاء الاصطناعي**

[🚀 البدء السريع](#-البدء-السريع) • [📖 API التوثيق](#-api-التوثيق) • [🧪 الاختبارات](#-الاختبارات) • [🚀 النشر](#-النشر)

</div>

## 🎯 نظرة عامة

Backend API مبني بـ Express.js و TypeScript لدعم منصة تحليل النصوص الدرامية. يوفر endpoints متقدمة لتحليل النصوص باستخدام Google Generative AI مع معالجة آمنة للملفات ونظام logging شامل.

### ✨ المميزات الأساسية

- 🤖 **تكامل Google AI**: تحليل متقدم للنصوص الدرامية
- 📁 **معالجة الملفات**: دعم PDF, DOCX, TXT
- 🔒 **الأمان**: Helmet, CORS, Rate Limiting
- 📊 **Logging**: نظام تسجيل شامل مع Winston
- ✅ **التحقق**: Zod schema validation
- 🧪 **الاختبارات**: Vitest مع تغطية شاملة

## 🏗️ البنية التقنية

### التقنيات الأساسية

| التقنية | الإصدار | الغرض |
|---------|---------|--------|
| **Express.js** | 4.18.2 | إطار عمل الخادم |
| **TypeScript** | 5.x | فحص الأنواع الثابت |
| **Google Generative AI** | 0.24.1 | تحليل النصوص بالذكاء الاصطناعي |
| **Zod** | 3.25.76 | التحقق من صحة البيانات |
| **Winston** | 3.11.0 | نظام التسجيل |

### الأمان والحماية

```typescript
// مثال على إعداد الأمان
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100 // حد أقصى 100 طلب لكل IP
});

app.use(helmet());
app.use(limiter);
```

## 🚀 البدء السريع

### المتطلبات الأساسية

- **Node.js**: ≥20.0.0
- **npm**: أحدث إصدار مستقر
- **Google AI API Key**: للتحليل بالذكاء الاصطناعي

### التثبيت

```bash
# الانتقال لمجلد Backend
cd backend

# تثبيت التبعيات
npm install

# إعداد متغيرات البيئة
cp .env.example .env
# أضف مفتاح Google AI في .env
```

### إعداد متغيرات البيئة

```bash
# ================================
# 🧠 مفاتيح API المطلوبة
# ================================
GOOGLE_GENAI_API_KEY=your_google_ai_key_here

# ================================
# 🔧 إعدادات الخادم
# ================================
PORT=3001
NODE_ENV=development

# ================================
# 🔒 إعدادات الأمان
# ================================
CORS_ORIGIN=http://localhost:9002
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### تشغيل التطوير

```bash
# تشغيل خادم التطوير مع مراقبة الملفات
npm run dev

# الخادم يعمل على http://localhost:3001
```

## 📁 هيكل المشروع

```
src/
├── config/                 # إعدادات التطبيق
│   └── env.ts             # إدارة متغيرات البيئة
├── controllers/           # منطق معالجة الطلبات
│   └── analysis.controller.ts
├── middleware/            # Middleware functions
│   └── index.ts          # CORS, Helmet, Rate limiting
├── services/             # منطق الأعمال
│   ├── analysis.service.ts
│   └── gemini.service.ts
├── types/                # تعريفات أنواع TypeScript
│   └── index.ts
├── utils/                # وظائف مساعدة
│   └── logger.ts         # إعداد Winston logger
└── server.ts             # نقطة دخول التطبيق
```

## 📖 API التوثيق

### نقاط النهاية الأساسية

#### 🏥 Health Check

```http
GET /api/health
```

**الاستجابة:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345,
  "environment": "development"
}
```

#### 🔄 Pipeline Analysis

```http
POST /api/analysis/pipeline
Content-Type: multipart/form-data
```

**المعاملات:**
- `file`: ملف النص (PDF, DOCX, TXT)
- `analysisType`: نوع التحليل (optional)

**مثال الاستجابة:**
```json
{
  "success": true,
  "data": {
    "analysisId": "uuid-here",
    "results": {
      "characters": [...],
      "themes": [...],
      "structure": {...}
    }
  }
}
```

#### 📝 Screenplay Review

```http
POST /api/analysis/review-screenplay
Content-Type: application/json
```

**Body:**
```json
{
  "text": "نص السيناريو هنا...",
  "options": {
    "analysisDepth": "detailed",
    "language": "ar"
  }
}
```

## 🧪 الاختبارات

### تشغيل الاختبارات

```bash
# تشغيل جميع الاختبارات
npm run test

# تشغيل الاختبارات مع تقرير التغطية
npm run test:coverage

# فحص أنواع TypeScript
npm run typecheck

# فحص الكود
npm run lint
```

### معايير الجودة

| المعيار | المطلوب | الوصف |
|---------|---------|--------|
| **تغطية الاختبارات** | ≥80% | نسبة الكود المختبر |
| **TypeScript** | صارم | فحص أنواع بدون أخطاء |
| **ESLint** | 0 تحذيرات | كود نظيف بدون تحذيرات |

## 🔧 أوامر التطوير

### أوامر أساسية

```bash
npm run dev                 # تشغيل خادم التطوير
npm run build              # بناء التطبيق
npm run start              # تشغيل خادم الإنتاج
npm run lint               # فحص الكود
npm run lint:fix           # إصلاح مشاكل الكود تلقائياً
npm run typecheck          # فحص أنواع TypeScript
```

### أوامر الاختبار

```bash
npm run test               # تشغيل الاختبارات
npm run test:coverage      # اختبارات مع تقرير التغطية
```

## 🛡️ الأمان

### الحماية المطبقة

- **Helmet**: حماية HTTP headers
- **CORS**: تحكم في الوصول عبر المصادر
- **Rate Limiting**: حد أقصى للطلبات
- **Input Validation**: التحقق من صحة المدخلات بـ Zod
- **File Upload Security**: فحص أنواع الملفات المسموحة

### مثال التحقق من المدخلات

```typescript
import { z } from 'zod';

const analysisRequestSchema = z.object({
  text: z.string().min(10).max(50000),
  analysisType: z.enum(['basic', 'detailed', 'comprehensive']).optional(),
  language: z.enum(['ar', 'en']).default('ar')
});

// استخدام في Controller
const validateRequest = (req: Request) => {
  return analysisRequestSchema.parse(req.body);
};
```

## 📊 المراقبة والتسجيل

### نظام التسجيل

```typescript
import { logger } from '@/utils/logger';

// تسجيل المعلومات
logger.info('Analysis request received', { 
  userId: 'user123', 
  analysisType: 'detailed' 
});

// تسجيل الأخطاء
logger.error('Analysis failed', { 
  error: error.message, 
  stack: error.stack 
});
```

### مستويات التسجيل

- **error**: أخطاء النظام
- **warn**: تحذيرات
- **info**: معلومات عامة
- **debug**: معلومات التطوير

## 🚀 البناء والنشر

### البناء للإنتاج

```bash
# بناء التطبيق
npm run build

# تشغيل الإنتاج
npm run start
```

### متغيرات بيئة الإنتاج

```bash
NODE_ENV=production
PORT=3001
GOOGLE_GENAI_API_KEY=your_production_key
CORS_ORIGIN=https://your-frontend-domain.com
```

## 🔗 التكامل مع Frontend

### إعداد CORS

```typescript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:9002',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### نقاط الاتصال

- **Frontend URL**: `http://localhost:9002`
- **Backend URL**: `http://localhost:3001`
- **API Base**: `/api`

## 🤝 المساهمة

### إرشادات التطوير

1. **استخدم TypeScript**: جميع الملفات بـ TypeScript
2. **اتبع ESLint**: كود نظيف بدون تحذيرات
3. **اكتب الاختبارات**: تغطية ≥80%
4. **وثق الكود**: تعليقات واضحة

### سير العمل

```bash
# إنشاء فرع جديد
git checkout -b feature/new-endpoint

# إجراء التغييرات
npm run test
npm run lint
npm run typecheck

# إرسال التغييرات
git commit -m "feat: add new analysis endpoint"
git push origin feature/new-endpoint
```

## 📚 الموارد الإضافية

- [📖 توثيق Express.js](https://expressjs.com/)
- [🤖 Google Generative AI](https://ai.google.dev/)
- [🔍 Zod Documentation](https://zod.dev/)
- [📊 Winston Logger](https://github.com/winstonjs/winston)

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT.

## 🆘 الدعم

للمساعدة والدعم:

1. تحقق من التوثيق
2. ابحث في القضايا المفتوحة
3. أنشئ قضية جديدة

---

<div align="center">

**صُنع بـ ❤️ باستخدام Express.js و Google AI**

[⬆️ العودة للأعلى](#the-copy-backend---واجهة-برمجة-التطبيقات-الخلفية)

</div>