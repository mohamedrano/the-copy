# Backend Documentation - الواجهة الخلفية

## نظرة عامة

الواجهة الخلفية لمنصة **The Copy** مبنية باستخدام Express.js مع TypeScript، وتوفر API قوي وآمن لمعالجة طلبات تحليل النصوص الدرامية باستخدام الذكاء الاصطناعي.

## الهيكل التقني

### التقنيات الأساسية
- **Express.js 4.18.2**: إطار عمل خادم Node.js
- **TypeScript 5.x**: لغة البرمجة مع الكتابة الصارمة
- **tsx 4.7.0**: تنفيذ TypeScript للتطوير
- **Google Generative AI 0.24.1**: تكامل Gemini API

### مكتبات الأمان والوسطاء
- **Helmet 7.1.0**: رؤوس الأمان
- **CORS 2.8.5**: إدارة طلبات Cross-origin
- **Express Rate Limit 7.1.5**: تحديد معدل الطلبات
- **Compression 1.7.4**: ضغط الاستجابات

### معالجة الملفات والبيانات
- **Multer 1.4.5-lts.1**: تحميل الملفات
- **PDF.js 4.4.168**: معالجة ملفات PDF
- **Mammoth 1.7.0**: معالجة ملفات DOCX
- **Zod 3.25.76**: التحقق من صحة البيانات

## هيكل المشروع

```
backend/
├── src/
│   ├── config/
│   │   └── env.ts              # إعدادات البيئة
│   ├── controllers/
│   │   └── analysis.controller.ts  # تحكم التحليل
│   ├── middleware/
│   │   └── index.ts            # الوسطاء
│   ├── services/
│   │   ├── analysis.service.ts # خدمة التحليل
│   │   └── gemini.service.ts   # خدمة Gemini
│   ├── types/
│   │   └── index.ts            # تعريفات الأنواع
│   ├── utils/
│   │   └── logger.ts           # نظام السجلات
│   └── server.ts               # الخادم الرئيسي
├── logs/                       # ملفات السجلات
├── .env.example               # مثال متغيرات البيئة
├── package.json
└── README.md
```

## إعداد الخادم

### الخادم الرئيسي (server.ts)
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

const app = express();

// الوسطاء الأساسية
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// تحديد معدل الطلبات
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100 // حد أقصى 100 طلب لكل IP
});
app.use('/api/', limiter);
```

### إعدادات البيئة (config/env.ts)
```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(3001),
  GOOGLE_AI_API_KEY: z.string().min(1),
  CORS_ORIGIN: z.string().url().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(100),
});

export const env = envSchema.parse(process.env);
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
```

## نظام السجلات

### إعداد Winston Logger
```typescript
import winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      service: 'the-copy-backend',
      ...meta,
    });
  })
);

export const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
```

## خدمات الذكاء الاصطناعي

### خدمة Gemini (services/gemini.service.ts)
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(env.GOOGLE_AI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async analyzeText(text: string, prompt: string): Promise<string> {
    try {
      const fullPrompt = `${prompt}\n\nالنص للتحليل:\n${text}`;
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error('خطأ في تحليل النص مع Gemini:', error);
      throw new Error('فشل في تحليل النص');
    }
  }
}

export const geminiService = new GeminiService();
```

### خدمة التحليل (services/analysis.service.ts)
```typescript
import { geminiService } from './gemini.service';
import { logger } from '@/utils/logger';

export interface AnalysisRequest {
  text: string;
  analysisType: 'basic' | 'deep' | 'character' | 'dialogue';
  language?: 'ar' | 'en';
}

export interface AnalysisResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class AnalysisService {
  async performAnalysis(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      logger.info('بدء تحليل النص', { 
        type: request.analysisType,
        textLength: request.text.length 
      });

      const prompt = this.buildPrompt(request.analysisType, request.language);
      const result = await geminiService.analyzeText(request.text, prompt);

      logger.info('تم إكمال التحليل بنجاح');
      return {
        success: true,
        data: {
          analysis: result,
          metadata: {
            analysisType: request.analysisType,
            language: request.language || 'ar',
            timestamp: new Date().toISOString(),
          }
        }
      };
    } catch (error) {
      logger.error('خطأ في خدمة التحليل:', error);
      return {
        success: false,
        error: 'فشل في تحليل النص'
      };
    }
  }

  private buildPrompt(analysisType: string, language = 'ar'): string {
    const prompts = {
      basic: 'قم بتحليل أساسي للنص الدرامي التالي، مع التركيز على الشخصيات والحبكة والموضوعات الرئيسية.',
      deep: 'قم بتحليل عميق ومفصل للنص الدرامي، شامل البنية السردية، تطوير الشخصيات، الصراعات، والرسائل.',
      character: 'ركز على تحليل الشخصيات في النص: دوافعها، علاقاتها، تطورها عبر الأحداث.',
      dialogue: 'حلل جودة الحوار: الأصالة، الطبيعية، التمايز بين الشخصيات، الفعالية الدرامية.'
    };

    return prompts[analysisType as keyof typeof prompts] || prompts.basic;
  }
}

export const analysisService = new AnalysisService();
```

## المتحكمات (Controllers)

### متحكم التحليل (controllers/analysis.controller.ts)
```typescript
import { Request, Response } from 'express';
import { z } from 'zod';
import { analysisService, AnalysisRequest } from '@/services/analysis.service';
import { logger } from '@/utils/logger';

const analysisRequestSchema = z.object({
  text: z.string().min(10, 'النص قصير جداً للتحليل'),
  analysisType: z.enum(['basic', 'deep', 'character', 'dialogue']).default('basic'),
  language: z.enum(['ar', 'en']).default('ar'),
});

export class AnalysisController {
  async analyzeText(req: Request, res: Response) {
    try {
      const validatedData = analysisRequestSchema.parse(req.body);
      
      logger.info('طلب تحليل جديد', {
        ip: req.ip,
        analysisType: validatedData.analysisType,
        textLength: validatedData.text.length
      });

      const result = await analysisService.performAnalysis(validatedData);

      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      logger.error('خطأ في متحكم التحليل:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'بيانات الطلب غير صحيحة',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'خطأ داخلي في الخادم'
        });
      }
    }
  }

  async healthCheck(req: Request, res: Response) {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    });
  }
}

export const analysisController = new AnalysisController();
```

## المسارات (Routes)

### إعداد المسارات
```typescript
import { Router } from 'express';
import { analysisController } from '@/controllers/analysis.controller';

const router = Router();

// مسارات التحليل
router.post('/analysis/text', analysisController.analyzeText);
router.post('/analysis/pipeline', analysisController.runPipeline);
router.post('/analysis/review-screenplay', analysisController.reviewScreenplay);

// مسار فحص الصحة
router.get('/health', analysisController.healthCheck);

export default router;
```

## الوسطاء (Middleware)

### وسطاء الأمان والتحقق
```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

// وسيط تسجيل الطلبات
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.info('طلب جديد', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
};

// وسيط معالجة الأخطاء
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('خطأ في الخادم:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method
  });

  res.status(500).json({
    success: false,
    error: 'خطأ داخلي في الخادم'
  });
};

// وسيط التحقق من المفاتيح
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('X-API-Key');
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'مفتاح API مطلوب'
    });
  }

  // التحقق من صحة المفتاح
  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({
      success: false,
      error: 'مفتاح API غير صحيح'
    });
  }

  next();
};
```

## معالجة الملفات

### تحميل ومعالجة الملفات
```typescript
import multer from 'multer';
import * as mammoth from 'mammoth';
import * as pdfParse from 'pdf-parse';

// إعداد Multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم'));
    }
  }
});

// معالجة ملفات PDF
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    logger.error('خطأ في استخراج النص من PDF:', error);
    throw new Error('فشل في معالجة ملف PDF');
  }
}

// معالجة ملفات DOCX
export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    logger.error('خطأ في استخراج النص من DOCX:', error);
    throw new Error('فشل في معالجة ملف DOCX');
  }
}
```

## التحقق من صحة البيانات

### مخططات Zod
```typescript
import { z } from 'zod';

export const TextAnalysisSchema = z.object({
  text: z.string().min(10, 'النص قصير جداً').max(100000, 'النص طويل جداً'),
  analysisType: z.enum(['basic', 'deep', 'character', 'dialogue']),
  language: z.enum(['ar', 'en']).default('ar'),
  options: z.object({
    includeMetadata: z.boolean().default(true),
    format: z.enum(['json', 'text']).default('json'),
  }).optional(),
});

export const PipelineRequestSchema = z.object({
  fullText: z.string().min(50),
  projectName: z.string().min(1),
  language: z.enum(['ar', 'en']).default('ar'),
  context: z.object({
    title: z.string().optional(),
    author: z.string().optional(),
    genre: z.string().optional(),
  }).optional(),
});
```

## الأمان

### إعدادات الأمان
```typescript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// رؤوس الأمان
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// تحديد معدل الطلبات
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'تم تجاوز الحد الأقصى للطلبات'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
```

## الاختبارات

### إعداد الاختبارات
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/server';

describe('Analysis API', () => {
  it('should analyze text successfully', async () => {
    const response = await request(app)
      .post('/api/analysis/text')
      .send({
        text: 'نص تجريبي للتحليل',
        analysisType: 'basic',
        language: 'ar'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });

  it('should return error for invalid input', async () => {
    const response = await request(app)
      .post('/api/analysis/text')
      .send({
        text: 'قصير',
        analysisType: 'invalid'
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
```

## النشر والإنتاج

### إعداد الإنتاج
```typescript
// إعدادات الإنتاج
if (isProduction) {
  // تفعيل HTTPS
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });

  // تحسين الأداء
  app.use(compression());
  
  // سجلات الإنتاج
  logger.add(new winston.transports.File({
    filename: 'logs/production.log',
    level: 'info'
  }));
}
```

### أوامر النشر
```bash
# بناء المشروع
npm run build

# تشغيل الإنتاج
npm run start

# مع PM2
pm2 start dist/server.js --name "the-copy-backend"
```

## مراقبة الأداء

### مقاييس الأداء
```typescript
import { performance } from 'perf_hooks';

// وسيط قياس الأداء
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = performance.now();
  
  res.on('finish', () => {
    const duration = performance.now() - start;
    logger.info('أداء الطلب', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration.toFixed(2)}ms`
    });
  });
  
  next();
};
```

## استكشاف الأخطاء

### مشاكل شائعة
1. **خطأ اتصال Gemini API**: تحقق من مفتاح API
2. **تجاوز حد الطلبات**: راجع إعدادات Rate Limiting
3. **خطأ معالجة الملفات**: تحقق من نوع وحجم الملف
4. **مشاكل CORS**: راجع إعدادات CORS

### أدوات التشخيص
- **Winston Logs**: سجلات مفصلة
- **Health Check**: فحص صحة النظام
- **Performance Metrics**: مقاييس الأداء

---

*للمزيد من المعلومات، راجع التوثيق الرئيسي والكود المصدري.*