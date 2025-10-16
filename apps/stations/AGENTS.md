📋 توجيهات الترميز للوكيل - نظام Stations
🎯 نظرة عامة على المشروع
أنت تعمل على نظام Stations - منصة تحليل نصوص درامية متقدمة تستخدم الذكاء الاصطناعي. النظام عبارة عن خط أنابيب (pipeline) من 7 محطات متسلسلة، كل محطة تُنفذ مرحلة تحليلية محددة على النصوص السردية والدرامية.
المكونات الأساسية:

الخادم الخلفي: Express + TypeScript + Gemini AI
واجهة المستخدم: React 18 + Vite + Tailwind CSS + shadcn/ui
قاعدة البيانات: Drizzle ORM
اللغة الأساسية: TypeScript (strict mode)...


🏗️ البنية المعمارية - خريطة ذهنية
stations/
│
├── 🔧 server/                    [الخادم الخلفي - المنطق الأساسي]
│   ├── stations/                 [7 محطات تحليلية متسلسلة]
│   │   ├── station1/            → تحليل النص الأساسي (الشخصيات والعلاقات)
│   │   ├── station2/            → التحليل المفاهيمي (الثيمات والنوع)
│   │   ├── station3/            → بناء شبكة الصراع (الأهم!)
│   │   ├── station4/            → قياس الكفاءة والفعالية
│   │   ├── station5/            → التحليل الديناميكي والرمزي
│   │   ├── station6/            → التشخيص والعلاج
│   │   └── station7/            → التصور والعرض النهائي
│   │
│   ├── core/                     [النواة - الكيانات والقواعد]
│   │   ├── models/              → Character, Relationship, Conflict, ConflictNetwork
│   │   └── pipeline/            → BaseStation (الفئة الأب لجميع المحطات)
│   │
│   ├── services/                 [الخدمات الحيوية]
│   │   └── ai/                  
│   │       ├── gemini-service.ts  → الواجهة الرئيسية لـ Gemini API
│   │       └── result-selector.ts → اختيار أفضل النتائج
│   │
│   ├── analysis_modules/         [وحدات التحليل المتخصصة]
│   │   ├── network-diagnostics.ts → تشخيص الشبكات
│   │   └── efficiency-metrics.ts  → حساب المقاييس
│   │
│   ├── index.ts                  → نقطة دخول الخادم
│   ├── routes.ts                 → API endpoints
│   ├── run-all-stations.ts       → أوركسترا المحطات
│   └── storage.ts                → إدارة التخزين
│
├── 🎨 src/                       [واجهة المستخدم - React]
│   ├── components/               [مكونات UI]
│   │   ├── ui/                  → مكونات shadcn/ui الأساسية
│   │   ├── AnalysisCard.tsx     → عرض نتائج التحليل
│   │   ├── ConflictNetwork.tsx  → تصور الشبكة
│   │   ├── DiagnosticPanel.tsx  → لوحة التشخيص
│   │   └── StationProgress.tsx  → تتبع تقدم المحطات
│   │
│   ├── contexts/                 [إدارة الحالة العامة]
│   │   ├── LanguageContext.tsx  → التبديل بين العربية/الإنجليزية
│   │   └── ThemeContext.tsx     → الوضع الفاتح/الداكن
│   │
│   ├── pages/
│   │   └── HomePage.tsx         → الصفحة الرئيسية
│   │
│   └── lib/
│       ├── utils.ts             → أدوات مساعدة
│       └── queryClient.ts       → إعدادات React Query
│
└── 📄 shared/
    └── schema.ts                 [المخططات المشتركة بين الخادم والعميل]

🔑 المفاهيم الجوهرية
1. ConflictNetwork - القلب النابض للنظام
هذا هو الكيان المركزي الذي تدور حوله جميع العمليات:
typescriptinterface ConflictNetwork {
  id: string;
  name: string;
  characters: Map<string, Character>;      // الشخصيات
  relationships: Map<string, Relationship>; // العلاقات بين الشخصيات
  conflicts: Map<string, Conflict>;        // الصراعات الدرامية
  snapshots: NetworkSnapshot[];            // لقطات زمنية للتطور
  metadata: Record<string, any>;
}
قاعدة حرجة:

المحطة 3 تُنشئ هذه الشبكة من الصفر
المحطات 4-7 تعتمد عليها بالكامل
أي تعديل على بنية ConflictNetwork يؤثر على السلسلة بأكملها


2. التدفق التسلسلي - القاعدة الذهبية
النص الخام → المحطة 1 → المحطة 2 → المحطة 3 → ... → المحطة 7
           ↓         ↓         ↓                    ↓
        معلومات   ثيمات    شبكة              تصورات
        أساسية    ومفاهيم   الصراع             نهائية
قواعد التدفق:

لا يمكن تخطي محطات: كل محطة تعتمد على مخرجات السابقة
التحليل الأساسي (المحطة 1 فقط): سريع (~1 دقيقة)
التحليل الشامل (1-7): بطيء (5-10 دقائق)
معالجة الأخطاء: إذا فشلت محطة، تتوقف السلسلة بأكملها


3. Gemini AI Integration - العقل المدبر
typescript// server/services/ai/gemini-service.ts
export enum GeminiModel {
  PRO = 'gemini-1.5-pro-latest',      // للتحليلات المعقدة
  FLASH = 'gemini-1.5-flash-latest'   // للعمليات السريعة
}
قواعد الاستخدام:

استخدم PRO للمحطات 2, 3, 5, 6 (تحليلات عميقة)
استخدم FLASH للمحطات 1, 4, 7 (عمليات أسرع)
معالجة الأخطاء: إعادة المحاولة 3 مرات مع تأخير تصاعدي
لا تستدعِ Gemini مباشرة - استخدم GeminiService دائماً


📐 قواعد الترميز الصارمة
✅ قواعد TypeScript
typescript// ✅ صحيح: استخدام الأنواع الصارمة
interface Station1Input {
  fullText: string;
  projectName: string;
  additionalContext?: Record<string, any>;
}

interface Station1Output {
  majorCharacters: string[];
  characterAnalysis: Map<string, CharacterProfile>;
  relationships: Relationship[];
  narrativeStyle: NarrativeStyleAnalysis;
  metadata: StationMetadata;
}

// ❌ خطأ: استخدام any
function processText(data: any): any { ... }

// ✅ صحيح: معالجة الأخطاء
async function analyzeText(input: Station1Input): Promise<Station1Output> {
  try {
    const result = await geminiService.analyze(input);
    if (!result.majorCharacters || result.majorCharacters.length === 0) {
      throw new ValidationError('No characters found in text');
    }
    return result;
  } catch (error) {
    logger.error('Station 1 analysis failed', { error, input });
    throw new StationProcessingError('Failed to analyze text', { cause: error });
  }
}
القواعد الإلزامية:

لا any أبداً - استخدم unknown أو أنواع محددة
معالجة جميع الأخطاء - try/catch في كل عملية async
التحقق من المدخلات - استخدم Zod لتحقق من البيانات
توثيق JSDoc - لجميع الدوال والواجهات العامة


✅ قواعد React
tsx// ✅ صحيح: مكون نظيف مع TypeScript
interface StationProgressProps {
  completedStations: number[];
  currentStation: number | null;
  totalStations: number;
  onStationClick?: (stationId: number) => void;
}

export function StationProgress({ 
  completedStations, 
  currentStation, 
  totalStations,
  onStationClick 
}: StationProgressProps) {
  return (
    <div className="flex gap-4 items-center" dir="rtl">
      {Array.from({ length: totalStations }, (_, i) => i + 1).map((stationNum) => (
        <StationBadge
          key={stationNum}
          number={stationNum}
          isCompleted={completedStations.includes(stationNum)}
          isCurrent={currentStation === stationNum}
          onClick={() => onStationClick?.(stationNum)}
        />
      ))}
    </div>
  );
}

// ❌ خطأ: عدم استخدام الأنواع
export function StationProgress(props) { ... }

// ❌ خطأ: استخدام inline styles بدلاً من Tailwind
<div style={{ display: 'flex', gap: '16px' }}>...</div>
قواعد React الإلزامية:

TypeScript Props دائماً - مع interface منفصل
Tailwind CSS فقط - لا inline styles
React Query للبيانات - لا useState للبيانات من الخادم
معالجة Loading/Error states - في كل استدعاء API
RTL Support - استخدم dir="rtl" للمحتوى العربي


✅ قواعد API Design
typescript// ✅ صحيح: API endpoint موثق ومُنظم
/**
 * POST /api/analyze-full-pipeline
 * يُشغل جميع المحطات السبع بالتسلسل
 * 
 * @body {string} fullText - النص الكامل للتحليل (100 حرف على الأقل)
 * @body {string} projectName - اسم المشروع
 * @returns {Promise<PipelineResult>} نتائج جميع المحطات
 * @throws {400} إذا كان النص قصيراً جداً
 * @throws {500} إذا فشلت أي محطة
 */
router.post('/analyze-full-pipeline', async (req, res) => {
  try {
    const { fullText, projectName } = req.body;
    
    // التحقق من المدخلات
    if (!fullText || fullText.length < 100) {
      return res.status(400).json({ 
        error: 'Text too short. Minimum 100 characters required.' 
      });
    }

    // تشغيل المحطات
    const results = await runAllStations(fullText, projectName);
    
    res.json({ success: true, data: results });
  } catch (error) {
    logger.error('Pipeline failed', { error });
    res.status(500).json({ 
      error: 'Analysis pipeline failed', 
      details: error.message 
    });
  }
});
قواعد API:

توثيق JSDoc - لكل endpoint
التحقق من المدخلات - قبل المعالجة
معالجة الأخطاء - مع رموز HTTP صحيحة
تسجيل الأخطاء - باستخدام logger
استجابات متسقة - { success, data?, error? }


🔧 سيناريوهات التطوير الشائعة
سيناريو 1: إضافة محطة جديدة
typescript// 1. أنشئ ملف المحطة الجديد
// server/stations/station8/station8-my-analysis.ts

import { BaseStation } from '@/server/core/pipeline/base-station';
import { ConflictNetwork } from '@/server/core/models/base-entities';

interface Station8Input {
  network: ConflictNetwork;
  previousResults: Station7Output;
}

interface Station8Output {
  myNewAnalysis: SomeAnalysisResult;
  metadata: StationMetadata;
}

export class Station8MyAnalysis extends BaseStation<Station8Input, Station8Output> {
  constructor(config: StationConfig, geminiService: GeminiService) {
    super('Station8MyAnalysis', config, geminiService);
  }

  async process(input: Station8Input): Promise<Station8Output> {
    this.logger.info('Starting Station 8 analysis');
    
    try {
      // منطق التحليل هنا
      const analysis = await this.performAnalysis(input.network);
      
      return {
        myNewAnalysis: analysis,
        metadata: this.createMetadata('Success')
      };
    } catch (error) {
      this.logger.error('Station 8 failed', { error });
      throw new StationProcessingError('Station 8 analysis failed', { cause: error });
    }
  }

  private async performAnalysis(network: ConflictNetwork): Promise<SomeAnalysisResult> {
    // استخدم geminiService للتحليل
    const prompt = this.buildPrompt(network);
    const result = await this.geminiService.generateContent(prompt, {
      model: GeminiModel.PRO,
      temperature: 0.7
    });
    
    return this.parseResult(result);
  }
}

// 2. أضف المحطة إلى run-all-stations.ts
// server/run-all-stations.ts

export async function runAllStations(...) {
  // ... المحطات السابقة
  
  // المحطة 8: التحليل الجديد
  const station8 = new Station8MyAnalysis(config, geminiService);
  const station8Result = await station8.process({
    network: station3Result.conflictNetwork,
    previousResults: station7Result
  });
  
  return {
    ...previousResults,
    station8: station8Result
  };
}
نقاط تفتيش:

 يرث من BaseStation
 يستخدم GeminiService وليس API مباشرة
 معالجة أخطاء شاملة
 logging في جميع المراحل
 توثيق JSDoc
 اختبارات وحدة (unit tests)


سيناريو 2: تعديل ConflictNetwork
typescript// ⚠️ تحذير: تعديل ConflictNetwork يؤثر على المحطات 4-7

// ✅ صحيح: إضافة خاصية اختيارية
interface ConflictNetwork {
  // ... الخصائص الموجودة
  myNewProperty?: SomeNewType;  // اختيارية لعدم كسر الكود الموجود
}

// ✅ صحيح: تحديث المحطات المتأثرة
// server/stations/station4/station4-efficiency-metrics.ts
async process(input: Station4Input): Promise<Station4Output> {
  const network = input.conflictNetwork;
  
  // التحقق من وجود الخاصية الجديدة
  if (network.myNewProperty) {
    // منطق إضافي
  }
  
  // ... بقية المنطق
}

// ❌ خطأ: إضافة خاصية إلزامية بدون migration
interface ConflictNetwork {
  myNewProperty: SomeNewType;  // سيكسر الكود الموجود!
}
خطوات آمنة لتعديل ConflictNetwork:

أضف الخاصية كـ optional أولاً
حدّث المحطة 3 لتعبئة الخاصية
حدّث المحطات 4-7 لاستخدام الخاصية
اختبر السلسلة كاملة
(اختياري) اجعلها required في إصدار لاحق


سيناريو 3: إضافة مكون UI جديد
tsx// src/components/MyNewVisualization.tsx

import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { ConflictNetwork } from '@/server/core/models/base-entities';

interface MyNewVisualizationProps {
  network: ConflictNetwork;
  className?: string;
}

export function MyNewVisualization({ network, className }: MyNewVisualizationProps) {
  const { t, isRTL } = useLanguage();
  
  // حساب البيانات مرة واحدة
  const visualizationData = useMemo(() => {
    return computeVisualization(network);
  }, [network]);

  return (
    <Card className={className} dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle>{t('myVisualization.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visualizationData.map((item, index) => (
            <div 
              key={index}
              className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800"
            >
              <h3 className="text-lg font-semibold mb-2">
                {isRTL ? item.titleAr : item.titleEn}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// دالة مساعدة منفصلة
function computeVisualization(network: ConflictNetwork) {
  // منطق الحساب
  return [];
}
نقاط تفتيش UI:

 TypeScript Props مع interface
 useMemo للحسابات الثقيلة
 دعم RTL/LTR
 دعم الترجمة (useLanguage)
 دعم الوضع الداكن (dark mode)
 Tailwind CSS فقط
 استخدام مكونات shadcn/ui
 responsive design


🧪 قواعد الاختبار
typescript// tests/stations/station3.test.ts

import { describe, test, expect, beforeEach } from 'vitest';
import { Station3NetworkBuilder } from '@/server/stations/station3/station3-network-builder';
import { MockGeminiService } from '../mocks/gemini-service.mock';
import { createTestInput } from '../fixtures/test-data';

describe('Station3NetworkBuilder', () => {
  let station3: Station3NetworkBuilder;
  let mockGeminiService: MockGeminiService;

  beforeEach(() => {
    mockGeminiService = new MockGeminiService();
    station3 = new Station3NetworkBuilder({}, mockGeminiService);
  });

  test('should build valid ConflictNetwork from input', async () => {
    // Arrange
    const input = createTestInput('complex-story');
    
    // Act
    const result = await station3.process(input);
    
    // Assert
    expect(result.conflictNetwork).toBeDefined();
    expect(result.conflictNetwork.characters.size).toBeGreaterThan(0);
    expect(result.conflictNetwork.relationships.size).toBeGreaterThan(0);
    expect(result.conflictNetwork.conflicts.size).toBeGreaterThan(0);
    expect(result.metadata.status).toBe('Success');
  });

  test('should handle missing characters gracefully', async () => {
    // Arrange
    const input = createTestInput('no-characters');
    
    // Act & Assert
    await expect(station3.process(input)).rejects.toThrow(
      'No characters found in previous analysis'
    );
  });

  test('should create valid relationships between characters', async () => {
    // Arrange
    const input = createTestInput('relationship-heavy');
    
    // Act
    const result = await station3.process(input);
    
    // Assert
    const relationships = Array.from(result.conflictNetwork.relationships.values());
    relationships.forEach(rel => {
      expect(rel.source).toBeDefined();
      expect(rel.target).toBeDefined();
      expect(rel.nature).toBeOneOf(['positive', 'negative', 'neutral', 'complex']);
      expect(rel.strength).toBeGreaterThanOrEqual(0);
      expect(rel.strength).toBeLessThanOrEqual(1);
    });
  });
});
قواعد الاختبار:

اختبر كل محطة بشكل منفصل - unit tests
اختبر السلسلة كاملة - integration tests
استخدم mocks لـ Gemini - لا استدعاءات API حقيقية
اختبر حالات الفشل - error handling
بيانات اختبار واقعية - في tests/fixtures/


🚨 الأخطاء الشائعة وكيفية تجنبها
خطأ 1: تجاهل التسلسل
typescript// ❌ خطأ: محاولة تشغيل محطة 4 بدون محطة 3
const station4 = new Station4EfficiencyMetrics(config, geminiService);
const result = await station4.process({ 
  conflictNetwork: undefined  // لا توجد شبكة!
});

// ✅ صحيح: التأكد من تسلسل المحطات
const station3Result = await station3.process(station2Input);
const station4Result = await station4.process({
  conflictNetwork: station3Result.conflictNetwork
});

خطأ 2: عدم معالجة الأخطاء في API
typescript// ❌ خطأ: ترك الأخطاء تنتشر بدون معالجة
router.post('/analyze', async (req, res) => {
  const result = await geminiService.analyze(req.body.text);
  res.json(result);  // ماذا لو فشل analyze؟
});

// ✅ صحيح: معالجة شاملة
router.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.length < 100) {
      return res.status(400).json({ 
        error: 'Text too short',
        minLength: 100 
      });
    }

    const result = await geminiService.analyze(text);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Analysis failed', { error, body: req.body });
    res.status(500).json({ 
      error: 'Analysis failed',
      message: error.message 
    });
  }
});

خطأ 3: استخدام localStorage في React
tsx// ❌ خطأ: localStorage غير متاح في بيئة Claude.ai
const [data, setData] = useState(() => {
  return JSON.parse(localStorage.getItem('analysisData') || '{}');
});

// ✅ صحيح: استخدام React Query للتخزين المؤقت
const { data } = useQuery({
  queryKey: ['analysis', projectId],
  queryFn: () => fetchAnalysis(projectId),
  staleTime: 5 * 60 * 1000  // 5 دقائق
});

خطأ 4: نسيان RTL Support
tsx// ❌ خطأ: تجاهل الاتجاه العربي
<div className="flex gap-4">
  <span>اسم الشخصية:</span>
  <strong>{character.name}</strong>
</div>

// ✅ صحيح: دعم RTL
const { isRTL } = useLanguage();

<div className="flex gap-4" dir={isRTL ? 'rtl' : 'ltr'}>
  <span>{t('character.name')}:</span>
  <strong>{character.name}</strong>
</div>

📊 دليل الأداء
تحسين استدعاءات Gemini
typescript// ❌ بطيء: استدعاءات متتالية
for (const character of characters) {
  const analysis = await geminiService.analyze(character);
  results.push(analysis);
}

// ✅ سريع: استدعاءات متوازية
const promises = characters.map(char => 
  geminiService.analyze(char)
);
const results = await Promise.all(promises);

// ✅ أسرع: استدعاء واحد بدفعة
const prompt = `Analyze these characters in batch:\n${JSON.stringify(characters)}`;
const batchResult = await geminiService.analyze(prompt);

تحسين React
tsx// ❌ بطيء: إعادة حساب في كل render
function NetworkVisualization({ network }) {
  const data = processNetworkData(network);  // تُنفذ في كل مرة!
  return <Chart data={data} />;
}

// ✅ سريع: useMemo
function NetworkVisualization({ network }) {
  const data = useMemo(() => 
    processNetworkData(network), 
    [network]
  );
  return <Chart data={data} />;
}

// ✅ أسرع: React Query مع staleTime
const { data } = useQuery({
  queryKey: ['network', network.id],
  queryFn: () => processNetworkData(network),
  staleTime: 10 * 60 * 1000  // لا تعيد الحساب لمدة 10 دقائق
});

🎨 دليل التصميم (UI/UX)
الألوان
typescript// استخدم متغيرات Tailwind المُعرّفة
const colors = {
  primary: 'blue-600',
  secondary: 'slate-600',
  success: 'green-600',
  warning: 'amber-600',
  error: 'red-600',
  
  // Dark mode
  primaryDark: 'blue-400',
  secondaryDark: 'slate-400'
};

التخطيط (Layout)
tsx// ✅ استخدم Grid للتخطيطات المعقدة
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</div>

// ✅ استخدم Flex للتخطيطات البسيطة
<div className="flex items-center justify-between gap-4">
  <span>العنوان</span>
  <Button>إجراء</Button>
</div>

الحركات (Animations)
tsximport { motion } from 'framer-motion';

// ✅ حركات خفيفة وسلسة
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>

// ❌ تجنب الحركات المزعجة
<motion.div
  animate={{ 
    scale: [1, 1.5, 1], 
    rotate: [0, 360, 0] 
  }}
  transition={{ duration: 0.5, repeat: Infinity }}
>

🔐 الأمان والخصوصية
typescript// ✅ لا تسجل البيانات الRetryAContinueEditحساسة
typescript// ✅ لا تسجل البيانات الحساسة
logger.info('Analysis started', { 
  projectId: input.projectId,
  textLength: input.fullText.length,
  // ❌ لا تسجل النص الكامل!
  // fullText: input.fullText
});

// ✅ صحيح: إخفاء المعلومات الحساسة
logger.info('API key validated', {
  keyPrefix: apiKey.substring(0, 8) + '...',
  keyLength: apiKey.length
});

// ❌ خطأ: تسجيل مفتاح API كاملاً
logger.info('Using API key', { apiKey });

حماية API Endpoints
typescript// ✅ صحيح: rate limiting
import rateLimit from 'express-rate-limit';

const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // 5 طلبات كحد أقصى
  message: 'Too many analysis requests, please try again later'
});

router.post('/analyze-full-pipeline', analysisLimiter, async (req, res) => {
  // ...
});

// ✅ صحيح: التحقق من حجم الإدخال
const MAX_TEXT_LENGTH = 500_000; // 500k حرف

router.post('/analyze', async (req, res) => {
  const { fullText } = req.body;
  
  if (fullText.length > MAX_TEXT_LENGTH) {
    return res.status(413).json({ 
      error: 'Text too long',
      maxLength: MAX_TEXT_LENGTH,
      actualLength: fullText.length
    });
  }
  
  // ...
});

التحقق من المدخلات
typescriptimport { z } from 'zod';

// ✅ صحيح: استخدام Zod للتحقق
const AnalysisInputSchema = z.object({
  fullText: z.string()
    .min(100, 'Text must be at least 100 characters')
    .max(500_000, 'Text must not exceed 500,000 characters'),
  projectName: z.string()
    .min(1, 'Project name is required')
    .max(100, 'Project name too long'),
  language: z.enum(['ar', 'en']).optional(),
  options: z.object({
    stationsToRun: z.array(z.number().min(1).max(7)).optional(),
    skipCache: z.boolean().optional()
  }).optional()
});

router.post('/analyze', async (req, res) => {
  try {
    // التحقق من المدخلات
    const validated = AnalysisInputSchema.parse(req.body);
    
    // المتابعة بأمان
    const result = await runAnalysis(validated);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid input',
        details: error.errors 
      });
    }
    throw error;
  }
});

📚 موارد مهمة للوكيل
الملفات الحرجة التي يجب قراءتها
📁 يجب قراءتها دائماً:
├── server/core/models/base-entities.ts          ← تعريفات الكيانات الأساسية
├── server/services/ai/gemini-service.ts         ← واجهة Gemini AI
├── server/core/pipeline/base-station.ts         ← الفئة الأب للمحطات
├── shared/schema.ts                             ← المخططات المشتركة
└── server/routes.ts                             ← API endpoints

📁 يجب الرجوع إليها عند الحاجة:
├── server/stations/station3/station3-network-builder.ts  ← أهم محطة
├── server/analysis_modules/network-diagnostics.ts        ← منطق التشخيص
├── server/analysis_modules/efficiency-metrics.ts         ← حساب المقاييس
└── src/components/ConflictNetwork.tsx                    ← تصور الشبكة

أنماط الاستدعاء (Prompts) لـ Gemini
typescript// ✅ نمط قوي: تعليمات واضحة + أمثلة + تنسيق محدد
const buildCharacterAnalysisPrompt = (text: string) => `
أنت محلل نصوص دراماتيكية متخصص. مهمتك: استخراج الشخصيات الرئيسية من النص التالي.

التعليمات:
1. استخرج 3-7 شخصيات رئيسية فقط (ليس الثانوية)
2. لكل شخصية، حدد:
   - الاسم الكامل
   - السمات الشخصية (3-5 سمات)
   - الدوافع والأهداف
   - العلاقات الأساسية مع شخصيات أخرى

تنسيق الإخراج: JSON بالشكل التالي:
{
  "characters": [
    {
      "name": "اسم الشخصية",
      "traits": ["سمة1", "سمة2", "سمة3"],
      "motivations": "الدوافع والأهداف",
      "relationships": [
        {"with": "شخصية أخرى", "type": "نوع العلاقة"}
      ]
    }
  ]
}

مثال على شخصية صحيحة:
{
  "name": "أحمد المحامي",
  "traits": ["عادل", "مثابر", "متفائل"],
  "motivations": "البحث عن الحقيقة وتحقيق العدالة",
  "relationships": [
    {"with": "فاطمة", "type": "زوجة"}
  ]
}

النص للتحليل:
${text}

الإخراج (JSON فقط):
`;

// ❌ نمط ضعيف: غامض وبدون تنسيق
const weakPrompt = (text: string) => `
حلل هذا النص واستخرج الشخصيات:
${text}
`;

معادلات المقاييس المهمة
typescript/**
 * معامل جيني (Gini Coefficient)
 * يقيس عدم المساواة في توزيع المشاركة
 * القيمة: 0 (توازن تام) إلى 1 (عدم توازن كامل)
 */
function calculateGiniCoefficient(values: number[]): number {
  const n = values.length;
  const sortedValues = [...values].sort((a, b) => a - b);
  
  let sumOfDifferences = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      sumOfDifferences += Math.abs(sortedValues[i] - sortedValues[j]);
    }
  }
  
  const meanValue = values.reduce((sum, val) => sum + val, 0) / n;
  const gini = sumOfDifferences / (2 * n * n * meanValue);
  
  return gini;
}

/**
 * تماسك الصراع (Conflict Cohesion)
 * يقيس مدى ترابط الصراعات في الشبكة
 * القيمة: 0 (صراعات منعزلة) إلى 1 (شبكة متماسكة)
 */
function calculateConflictCohesion(network: ConflictNetwork): number {
  const conflicts = Array.from(network.conflicts.values());
  
  // عدد الشخصيات المشاركة في أكثر من صراع
  const characterConflictCount = new Map<string, number>();
  conflicts.forEach(conflict => {
    conflict.involvedCharacters.forEach(charId => {
      characterConflictCount.set(
        charId, 
        (characterConflictCount.get(charId) || 0) + 1
      );
    });
  });
  
  const multiConflictChars = Array.from(characterConflictCount.values())
    .filter(count => count > 1).length;
  
  const totalChars = network.characters.size;
  
  return totalChars > 0 ? multiConflictChars / totalChars : 0;
}

/**
 * كفاءة السرد (Narrative Efficiency)
 * يقيس مدى استغلال العناصر السردية
 */
function calculateNarrativeEfficiency(network: ConflictNetwork): {
  characterEfficiency: number;
  relationshipEfficiency: number;
  conflictEfficiency: number;
  overall: number;
} {
  const totalCharacters = network.characters.size;
  const activeCharacters = Array.from(network.characters.values())
    .filter(char => char.conflictInvolvements.length > 0).length;
  
  const totalRelationships = network.relationships.size;
  const meaningfulRelationships = Array.from(network.relationships.values())
    .filter(rel => rel.strength >= 0.5).length;
  
  const totalConflicts = network.conflicts.size;
  const progressingConflicts = Array.from(network.conflicts.values())
    .filter(conf => conf.currentStage !== 'exposition').length;
  
  const charEff = totalCharacters > 0 ? activeCharacters / totalCharacters : 0;
  const relEff = totalRelationships > 0 ? meaningfulRelationships / totalRelationships : 0;
  const confEff = totalConflicts > 0 ? progressingConflicts / totalConflicts : 0;
  
  return {
    characterEfficiency: charEff,
    relationshipEfficiency: relEff,
    conflictEfficiency: confEff,
    overall: (charEff + relEff + confEff) / 3
  };
}

🎯 سيناريوهات متقدمة
سيناريو 4: التعامل مع نصوص طويلة جداً
typescript// مشكلة: نصوص طويلة تتجاوز حد Gemini (1M tokens)
// الحل: تقسيم النص إلى أجزاء

interface TextChunk {
  index: number;
  content: string;
  tokenCount: number;
}

async function analyzeWithChunking(
  fullText: string,
  geminiService: GeminiService
): Promise<AnalysisResult> {
  const MAX_TOKENS_PER_CHUNK = 100_000; // ~75k كلمة
  
  // 1. تقسيم النص
  const chunks = splitTextIntoChunks(fullText, MAX_TOKENS_PER_CHUNK);
  
  // 2. تحليل كل جزء
  const chunkResults = await Promise.all(
    chunks.map(chunk => analyzeChunk(chunk, geminiService))
  );
  
  // 3. دمج النتائج
  const mergedResult = mergeChunkResults(chunkResults);
  
  return mergedResult;
}

function splitTextIntoChunks(
  text: string, 
  maxTokens: number
): TextChunk[] {
  // تقسيم ذكي عند نهايات المشاهد/الفصول
  const scenes = text.split(/\n\n={3,}\n\n/); // مفصولة بـ ===
  
  const chunks: TextChunk[] = [];
  let currentChunk = '';
  let chunkIndex = 0;
  
  for (const scene of scenes) {
    const estimatedTokens = estimateTokenCount(currentChunk + scene);
    
    if (estimatedTokens > maxTokens && currentChunk.length > 0) {
      // حفظ الجزء الحالي
      chunks.push({
        index: chunkIndex++,
        content: currentChunk.trim(),
        tokenCount: estimateTokenCount(currentChunk)
      });
      currentChunk = scene;
    } else {
      currentChunk += '\n\n' + scene;
    }
  }
  
  // الجزء الأخير
  if (currentChunk.length > 0) {
    chunks.push({
      index: chunkIndex,
      content: currentChunk.trim(),
      tokenCount: estimateTokenCount(currentChunk)
    });
  }
  
  return chunks;
}

function estimateTokenCount(text: string): number {
  // تقدير تقريبي: 1 token ≈ 0.75 كلمة للعربية
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / 0.75);
}

async function mergeChunkResults(
  results: ChunkAnalysisResult[]
): Promise<AnalysisResult> {
  // دمج الشخصيات (إزالة التكرارات)
  const allCharacters = new Map<string, Character>();
  results.forEach(result => {
    result.characters.forEach((char, name) => {
      if (allCharacters.has(name)) {
        // دمج معلومات الشخصية
        const existing = allCharacters.get(name)!;
        allCharacters.set(name, mergeCharacterInfo(existing, char));
      } else {
        allCharacters.set(name, char);
      }
    });
  });
  
  // دمج العلاقات والصراعات بنفس الطريقة
  // ...
  
  return {
    characters: allCharacters,
    // ...
  };
}

سيناريو 5: التخزين المؤقت الذكي (Caching)
typescript// استخدم Redis أو memory cache للنتائج الوسيطة

import { createClient } from 'redis';

class AnalysisCache {
  private client: ReturnType<typeof createClient>;
  private readonly TTL = 24 * 60 * 60; // 24 ساعة
  
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    this.client.connect();
  }
  
  // مفتاح فريد للتحليل
  private generateKey(
    text: string, 
    stationNumber: number
  ): string {
    // استخدم hash للنص لتقليل حجم المفتاح
    const textHash = this.hashText(text);
    return `analysis:${textHash}:station${stationNumber}`;
  }
  
  private hashText(text: string): string {
    const crypto = require('crypto');
    return crypto
      .createHash('sha256')
      .update(text)
      .digest('hex')
      .substring(0, 16);
  }
  
  async get<T>(
    text: string, 
    stationNumber: number
  ): Promise<T | null> {
    try {
      const key = this.generateKey(text, stationNumber);
      const cached = await this.client.get(key);
      
      if (cached) {
        console.log(`Cache hit for station ${stationNumber}`);
        return JSON.parse(cached) as T;
      }
      
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  async set<T>(
    text: string, 
    stationNumber: number, 
    data: T
  ): Promise<void> {
    try {
      const key = this.generateKey(text, stationNumber);
      await this.client.setEx(
        key, 
        this.TTL, 
        JSON.stringify(data)
      );
      console.log(`Cached result for station ${stationNumber}`);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
  
  async invalidate(text: string): Promise<void> {
    // حذف جميع نتائج المحطات للنص
    const textHash = this.hashText(text);
    const pattern = `analysis:${textHash}:*`;
    
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(keys);
      console.log(`Invalidated ${keys.length} cached results`);
    }
  }
}

// الاستخدام في المحطات
export class Station3NetworkBuilder extends BaseStation {
  constructor(
    config: StationConfig,
    geminiService: GeminiService,
    private cache: AnalysisCache
  ) {
    super('Station3NetworkBuilder', config, geminiService);
  }
  
  async process(input: Station3Input): Promise<Station3Output> {
    // 1. التحقق من الكاش
    const cached = await this.cache.get<Station3Output>(
      input.fullText, 
      3
    );
    
    if (cached && !input.options?.skipCache) {
      this.logger.info('Returning cached result for Station 3');
      return cached;
    }
    
    // 2. التحليل الفعلي
    this.logger.info('Performing fresh analysis for Station 3');
    const result = await this.performAnalysis(input);
    
    // 3. حفظ في الكاش
    await this.cache.set(input.fullText, 3, result);
    
    return result;
  }
}

سيناريو 6: معالجة الأخطاء المتقدمة
typescript// تعريف أنواع أخطاء مخصصة

export class StationError extends Error {
  constructor(
    message: string,
    public readonly stationName: string,
    public readonly stationNumber: number,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'StationError';
  }
}

export class GeminiAPIError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly retryable: boolean = true
  ) {
    super(message);
    this.name = 'GeminiAPIError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// استخدام في المحطات
export class Station1TextAnalysis extends BaseStation {
  async process(input: Station1Input): Promise<Station1Output> {
    try {
      // التحقق من المدخلات
      this.validateInput(input);
      
      // التحليل
      const result = await this.performAnalysis(input);
      
      // التحقق من المخرجات
      this.validateOutput(result);
      
      return result;
    } catch (error) {
      // معالجة مخصصة حسب نوع الخطأ
      if (error instanceof ValidationError) {
        throw new StationError(
          `Invalid input for Station 1: ${error.message}`,
          'Station1TextAnalysis',
          1,
          error
        );
      }
      
      if (error instanceof GeminiAPIError) {
        if (error.retryable) {
          // إعادة المحاولة مع exponential backoff
          return await this.retryWithBackoff(() => 
            this.performAnalysis(input)
          );
        }
        throw new StationError(
          `Gemini API error in Station 1: ${error.message}`,
          'Station1TextAnalysis',
          1,
          error
        );
      }
      
      // خطأ غير متوقع
      throw new StationError(
        `Unexpected error in Station 1: ${error.message}`,
        'Station1TextAnalysis',
        1,
        error instanceof Error ? error : undefined
      );
    }
  }
  
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        this.logger.warn(`Retry attempt ${attempt}/${maxRetries}, waiting ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Max retries exceeded');
  }
}

📋 Checklist للوكيل قبل كل Task
✅ قبل إضافة ميزة جديدة

 هل قرأت الملفات ذات الصلة في server/core/models/؟
 هل فهمت التدفق في server/run-all-stations.ts؟
 هل الميزة تتطلب تعديل ConflictNetwork؟
 إذا نعم، هل التعديل متوافق مع المحطات الموجودة؟
 هل ستحتاج لاستدعاء Gemini API؟
 هل لديك خطة للتخزين المؤقت (caching)؟
 هل الميزة تحتاج مكون UI جديد؟
 هل المكون يدعم RTL و dark mode؟


✅ قبل تعديل كود موجود

 هل قرأت الكود الحالي بالكامل؟
 هل فهمت السبب وراء التصميم الحالي؟
 هل التعديل سيكسر أي وظيفة موجودة؟
 هل اختبرت السيناريوهات الحرجة؟
 هل حدّثت التوثيق (JSDoc)؟
 هل حدّثت الاختبارات؟


✅ قبل الـ Commit

 هل الكود يمر من TypeScript strict checks؟
 هل الكود يمر من ESLint؟
 هل الكود منسق بـ Prettier؟
 هل جميع الاختبارات تنجح؟
 هل التوثيق محدث؟
 هل رسالة الـ commit واضحة ووصفية؟


🎓 مصطلحات مهمة
المصطلحالإنجليزيةالوصفشبكة الصراعConflictNetworkالبنية المركزية التي تربط الشخصيات والعلاقات والصراعاتمحطةStationوحدة تحليل مستقلة في خط الأنابيبالتماسكCohesionمدى ترابط عناصر الشبكةالكفاءة السرديةNarrative Efficiencyمدى استغلال العناصر السرديةمعامل جينيGini Coefficientمقياس عدم المساواة في التوزيعالشخصية المعزولةIsolated Characterشخصية بدون علاقات أو صراعاتالصراع المهملAbandoned Conflictصراع لم يتطور أو يُحلاللقطة الزمنيةSnapshotحالة الشبكة في نقطة زمنية محددة

🔗 روابط مرجعية سريعة
typescript// الكيانات الأساسية
import type { 
  Character,
  Relationship,
  Conflict,
  ConflictNetwork,
  NetworkSnapshot 
} from '@/server/core/models/base-entities';

// خدمات AI
import { GeminiService, GeminiModel } from '@/server/services/ai/gemini-service';

// المحطات
import { Station1TextAnalysis } from '@/server/stations/station1/station1-text-analysis';
import { Station3NetworkBuilder } from '@/server/stations/station3/station3-network-builder';

// التحليل
import { NetworkDiagnostics } from '@/server/analysis_modules/network-diagnostics';
import { EfficiencyMetrics } from '@/server/analysis_modules/efficiency-metrics';

// UI Components
import { ConflictNetwork } from '@/components/ConflictNetwork';
import { DiagnosticPanel } from '@/components/DiagnosticPanel';
import { StationProgress } from '@/components/StationProgress';

// Contexts
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

💡 نصائح ذهبية للوكيل
1. اقرأ قبل الكتابة
لا تبدأ الترميز قبل فهم السياق الكامل. اقرأ الملفات ذات الصلة أولاً.
2. اختبر محلياً
لا تفترض أن الكود يعمل. اختبر بنفسك قبل الالتزام.
3. الأداء مهم
تذكر أن المحطات تعمل بالتسلسل. أي تحسين في الأداء يتراكم.
4. العربية أولاً
النظام مُحسَّن للعربية. تأكد من دعم RTL والترجمات.
5. الأخطاء صديقتك
معالجة الأخطاء الجيدة = تجربة مستخدم أفضل.
6. التوثيق ليس اختيارياً
كود بدون توثيق = كود صعب الصيانة.
7. Gemini باهظ
قلل استدعاءات API قدر الإمكان. استخدم التخزين المؤقت.
8. التسلسل مقدس
لا تكسر تسلسل المحطات. إذا احتجت، أضف محطة جديدة.

🚀 أوامر سريعة للوكيل
bash# التطوير
npm run dev                    # تشغيل كامل (خادم + واجهة)
npm run dev:server            # خادم فقط
npm run dev:client            # واجهة فقط

# الاختبار
npm test                      # جميع الاختبارات
npm run test:watch           # مع المراقبة
npm run test:coverage        # مع التغطية
npm test -- station3         # اختبار محطة محددة

# البناء
npm run build                # بناء للإنتاج
npm run type-check           # فحص الأنواع
npm run lint                 # فحص الجودة
npm run format               # تنسيق الكود

# قاعدة البيانات
npm run db:generate          # توليد migrations
npm run db:push              # تطبيق التغييرات
npm run db:studio            # فتح Drizzle Studio

# التنظيف
rm -rf dist node_modules     # تنظيف كامل
npm install                  # إعادة التثبيت

🎯 الخلاصة
نظام Stations هو نظام معقد ومتقدم لتحليل النصوص الدرامية. كوكيل ترميز:

افهم التسلسل: المحطات تعمل بالتسلسل، لا يمكن تخطي أي منها
احترم البنية: ConflictNetwork هو القلب، أي تعديل عليه يؤثر على كل شيء
استخدم TypeScript بحكمة: أنواع صارمة، معالجة أخطاء شاملة
حسّن الأداء: استخدام التخزين المؤقت، المعالجة المتوازية
دعم العربية: RTL، ترجمات، خطوط عربية
اختبر دائماً: لا تعتمد على الافتراضات

