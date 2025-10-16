import { TaskType, TaskCategory } from './enums';
import { CompletionEnhancementOption } from './types';

export const APP_TITLE = 'المحلل الدرامي والمبدع المحاكي';
export const GEMINI_TEXT_MODEL = 'gemini-2.5-pro';
export const MIN_FILES_REQUIRED = 1;
export const MAX_FILE_SIZE_MB = 20;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const TASKS_REQUIRING_COMPLETION_SCOPE: TaskType[] = [
  TaskType.COMPLETION,
  TaskType.PLOT_PREDICTOR,
  TaskType.TENSION_OPTIMIZER,
  TaskType.SCENE_GENERATOR,
  TaskType.ADAPTIVE_REWRITING,
  TaskType.WORLD_BUILDER,
];

export const COMPLETION_ENHANCEMENT_OPTIONS: CompletionEnhancementOption[] = [
  { id: TaskType.THEMATIC_MINING, label: 'التنقيب عن الموضوعات (موجود)' },
  { id: TaskType.STYLE_FINGERPRINT, label: 'بصمة الأسلوب (موجود)' },
  { id: TaskType.CONFLICT_DYNAMICS, label: 'ديناميكيات الصراع (موجود)' },
  { id: TaskType.CHARACTER_VOICE, label: 'محاكي صوت الشخصيات (موجود)' },
  { id: TaskType.CHARACTER_DEEP_ANALYZER, label: 'تحليل الشخصيات العميق (جديد)' },
  { id: TaskType.DIALOGUE_ADVANCED_ANALYZER, label: 'محلل الحوار المتطور (جديد)' },
  { id: TaskType.THEMES_MESSAGES_ANALYZER, label: 'محلل الموضوعات والرسائل (جديد)' },
];

export const TASK_LABELS: Record<TaskType, string> = {
  [TaskType.ANALYSIS]: 'تحليل نقدي',
  [TaskType.CREATIVE]: 'إبداع محاكاتي',
  [TaskType.INTEGRATED]: 'سير عمل متكامل',
  [TaskType.COMPLETION]: 'استكمال النص',
  [TaskType.RHYTHM_MAPPING]: 'رسم خرائط الإيقاع',
  [TaskType.CHARACTER_NETWORK]: 'تحليل شبكات الشخصيات',
  [TaskType.DIALOGUE_FORENSICS]: 'تحليل الحوار',
  [TaskType.THEMATIC_MINING]: 'التنقيب عن الموضوعات',
  [TaskType.STYLE_FINGERPRINT]: 'بصمة الأسلوب',
  [TaskType.CONFLICT_DYNAMICS]: 'ديناميكيات الصراع',
  [TaskType.ADAPTIVE_REWRITING]: 'إعادة كتابة تكيفية',
  [TaskType.SCENE_GENERATOR]: 'مولد المشاهد',
  [TaskType.CHARACTER_VOICE]: 'محاكاة صوت الشخصيات',
  [TaskType.WORLD_BUILDER]: 'بناء العوالم',
  [TaskType.PLOT_PREDICTOR]: 'التنبؤ بالحبكة',
  [TaskType.TENSION_OPTIMIZER]: 'تحسين التوتر',
  [TaskType.AUDIENCE_RESONANCE]: 'تحليل صدى الجمهور',
  [TaskType.PLATFORM_ADAPTER]: 'تحويل المنصات',
  [TaskType.CHARACTER_DEEP_ANALYZER]: 'تحليل الشخصيات العميق',
  [TaskType.DIALOGUE_ADVANCED_ANALYZER]: 'تحليل الحوار المتقدم',
  [TaskType.VISUAL_CINEMATIC_ANALYZER]: 'تحليل السياق البصري',
  [TaskType.THEMES_MESSAGES_ANALYZER]: 'تحليل الموضوعات والرسائل',
  [TaskType.CULTURAL_HISTORICAL_ANALYZER]: 'تحليل السياق الثقافي',
  [TaskType.PRODUCIBILITY_ANALYZER]: 'تحليل القابلية للإنتاج',
  [TaskType.TARGET_AUDIENCE_ANALYZER]: 'تحليل الجمهور المستهدف',
  [TaskType.LITERARY_QUALITY_ANALYZER]: 'تحليل الجودة الأدبية',
  [TaskType.RECOMMENDATIONS_GENERATOR]: 'مولد التوصيات',
};

export const TASK_CATEGORY_MAP: Record<TaskType, TaskCategory> = {
  [TaskType.ANALYSIS]: TaskCategory.CORE,
  [TaskType.CREATIVE]: TaskCategory.CORE,
  [TaskType.INTEGRATED]: TaskCategory.CORE,
  [TaskType.COMPLETION]: TaskCategory.CORE,
  [TaskType.RHYTHM_MAPPING]: TaskCategory.ANALYSIS,
  [TaskType.CHARACTER_NETWORK]: TaskCategory.ANALYSIS,
  [TaskType.DIALOGUE_FORENSICS]: TaskCategory.ANALYSIS,
  [TaskType.THEMATIC_MINING]: TaskCategory.ANALYSIS,
  [TaskType.STYLE_FINGERPRINT]: TaskCategory.ANALYSIS,
  [TaskType.CONFLICT_DYNAMICS]: TaskCategory.ANALYSIS,
  [TaskType.ADAPTIVE_REWRITING]: TaskCategory.CREATIVE,
  [TaskType.SCENE_GENERATOR]: TaskCategory.CREATIVE,
  [TaskType.CHARACTER_VOICE]: TaskCategory.CREATIVE,
  [TaskType.WORLD_BUILDER]: TaskCategory.CREATIVE,
  [TaskType.PLOT_PREDICTOR]: TaskCategory.PREDICTIVE,
  [TaskType.TENSION_OPTIMIZER]: TaskCategory.PREDICTIVE,
  [TaskType.AUDIENCE_RESONANCE]: TaskCategory.PREDICTIVE,
  [TaskType.PLATFORM_ADAPTER]: TaskCategory.PREDICTIVE,
  [TaskType.CHARACTER_DEEP_ANALYZER]: TaskCategory.ADVANCED_MODULES,
  [TaskType.DIALOGUE_ADVANCED_ANALYZER]: TaskCategory.ADVANCED_MODULES,
  [TaskType.VISUAL_CINEMATIC_ANALYZER]: TaskCategory.ADVANCED_MODULES,
  [TaskType.THEMES_MESSAGES_ANALYZER]: TaskCategory.ADVANCED_MODULES,
  [TaskType.CULTURAL_HISTORICAL_ANALYZER]: TaskCategory.ADVANCED_MODULES,
  [TaskType.PRODUCIBILITY_ANALYZER]: TaskCategory.ADVANCED_MODULES,
  [TaskType.TARGET_AUDIENCE_ANALYZER]: TaskCategory.ADVANCED_MODULES,
  [TaskType.LITERARY_QUALITY_ANALYZER]: TaskCategory.ADVANCED_MODULES,
  [TaskType.RECOMMENDATIONS_GENERATOR]: TaskCategory.ADVANCED_MODULES,
};

export const PROMPT_PERSONA_BASE = `أنت "الكاتب الناقد الخارق بالذكاء الاصطناعي" (CritiqueConstruct AI). دورك يتغير بناءً على المهمة:
- للمهام التحليلية (مثل ${TaskType.ANALYSIS}, ${TaskType.RHYTHM_MAPPING}): أنت محلل درامي وخبير في بنية النصوص.
- للمهام الإبداعية (مثل ${TaskType.CREATIVE}, ${TaskType.SCENE_GENERATOR}): أنت كاتب سيناريو ومؤلف مبدع يحاكي الأساليب.
- للمهام التنبؤية (مثل ${TaskType.PLOT_PREDICTOR}, ${TaskType.TENSION_OPTIMIZER}): أنت مستشرف وخبير في تطوير الحبكات الدرامية.
- لمهمة الاستكمال (TaskType.COMPLETION): أنت كاتب سيناريو ماهر ومتخصص في فهم السياق ومواصلة السرد بشكل متسق وفني، ويمكنك دمج قدرات تحليلية وإبداعية متقدمة إذا طُلب منك ذلك.
- لوحدات التحليل المتخصصة (مثل ${TaskType.CHARACTER_DEEP_ANALYZER}, ${TaskType.VISUAL_CINEMATIC_ANALYZER}): أنت خبير متخصص في المجال المحدد للوحدة، قادر على إجراء تحليلات معمقة وتقديم نتائج منظمة.
مهمتك هي التفاعل مع النصوص الدرامية المقدمة وتقديم خدمات فائقة بناءً على المهمة المحددة.

## فهم عام للمدخلات:
سيتم تزويدك بملفات نصية (txt, md)، صور (png, jpg)، PDF، ومعلومات إضافية من المستخدم، بما في ذلك "نطاق الاستكمال المطلوب" لبعض المهام، ومعلومات عن "السياق السابق" إذا كان هذا استكمالاً تكرارياً، وقائمة بـ "تحسينات الاستكمال" إذا تم اختيارها.
- **ملفات .docx**: سيتم تزويدك بمحتواها النصي المستخرج (إذا نجح الاستخراج). إذا كان الملف فارغًا أو تعذر استخراج نصه، سيتم إعلامك بذلك.
- **ملفات .doc (القديمة)**: لا يمكن قراءة محتواها مباشرة في البيئة الحالية؛ سيتم إعلامك بوجودها واسمها فقط.
- **ملفات PDF والصور**: سترسل كبيانات. قد تتمكن من معالجة محتوى PDF إذا كان يحتوي على طبقة نصية أو إذا كنت تدعم OCR، وستتمكن من تحليل الصور.

## قواعد صارمة للإخراج:
1.  **اللغة:** جميع مخرجاتك **باللغة العربية الفصحى فقط**.
2.  **التنسيق:**
    *   للمهام البسيطة: قدم نصاً واضحاً.
    *   للمهام المتقدمة التي لها واجهات بيانات محددة (انظر أدناه، بما في ذلك وحدات التحليل المتخصصة): **يجب أن تكون استجابتك الأساسية كائن JSON صالح تمامًا يطابق بنية الواجهة 'AdvancedModuleResult' أو الواجهة المحددة للمهمة**. يجب أن يحتوي كائن JSON على حقل 'title'، وحقل 'summary' يلخص النتائج الرئيسية، وحقل 'details' يحتوي على كائن JSON فرعي يضم النتائج التفصيلية للوحدة بناءً على المكونات المطلوبة. قد يحتوي أيضًا على حقل 'recommendations' إذا كان ذلك مناسبًا. قد يسبق الـJSON أو يليه \'\'\'json\n{...}\n\'\'\' الذي سيتم إزالته. **اجتهد لملء أكبر قدر ممكن من حقول الواجهة المطلوبة بشكل منطقي بناءً على التحليل.**
3.  **الأمانة للمصدر:** حافظ على روح وأسلوب النص الأصلي عند الإبداع أو الاستكمال.
`;

export const SEVEN_STATIONS_OF_DRAMATIC_ANALYSIS = `
**المحطات السبع للتحليل الدرامي (لـ TaskType.ANALYSIS و TaskType.INTEGRATED):**
1.  **التشخيص البنيوي للشخصيات وشبكة الصراعات.**
2.  **فحص الأساس المفاهيمي والإيقاع الأولي.**
3.  **تشخيص محركات الصراع والقياس الكمي.**
4.  **تحليل شبكة الصراع المُعمق.**
5.  **فك شفرات الرمزية والأسلوب.**
6.  **التشخيص الدقيق والحلول العملية.**
7.  **التقرير الشامل والتكيف مع المنصات (إذا طُلب).**
`;

export const THREE_STAGES_OF_EMULATIVE_CREATIVITY = `
**المراحل الثلاث للإبداع المحاكي (لـ TaskType.CREATIVE و TaskType.INTEGRATED):**
1.  **التحليل الأسلوبي المعمق:** اللغة، البنية، الشخصيات، العالم.
2.  **النمذجة الأسلوبية:** بناء خريطة أسلوب شاملة.
3.  **المحاكاة والإبداع:** إنتاج محتوى متسق.
`;

export const TASKS_EXPECTING_JSON_RESPONSE: TaskType[] = [
  TaskType.ANALYSIS,
  TaskType.INTEGRATED,
  TaskType.RHYTHM_MAPPING,
  TaskType.CHARACTER_NETWORK,
  TaskType.DIALOGUE_FORENSICS,
  TaskType.THEMATIC_MINING,
  TaskType.STYLE_FINGERPRINT,
  TaskType.CONFLICT_DYNAMICS,
  TaskType.PLOT_PREDICTOR,
  TaskType.TENSION_OPTIMIZER,
  TaskType.AUDIENCE_RESONANCE,
  TaskType.PLATFORM_ADAPTER,
  TaskType.WORLD_BUILDER,
  TaskType.CHARACTER_DEEP_ANALYZER,
  TaskType.DIALOGUE_ADVANCED_ANALYZER,
  TaskType.VISUAL_CINEMATIC_ANALYZER,
  TaskType.THEMES_MESSAGES_ANALYZER,
  TaskType.CULTURAL_HISTORICAL_ANALYZER,
  TaskType.PRODUCIBILITY_ANALYZER,
  TaskType.TARGET_AUDIENCE_ANALYZER,
  TaskType.LITERARY_QUALITY_ANALYZER,
  TaskType.RECOMMENDATIONS_GENERATOR,
];

export const SUPPORTED_MIME_TYPES: Record<string, string[]> = {
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
};
