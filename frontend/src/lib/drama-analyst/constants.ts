import { TaskType, TaskCategory } from './enums';

export const MIN_FILES_REQUIRED = 1;

export const TASKS_REQUIRING_COMPLETION_SCOPE = [
  TaskType.COMPLETION
];

export const COMPLETION_ENHANCEMENT_OPTIONS = [
  TaskType.CHARACTER_DEEP_ANALYZER,
  TaskType.DIALOGUE_ADVANCED_ANALYZER,
  TaskType.VISUAL_CINEMATIC_ANALYZER
];

export const TASK_LABELS: Record<TaskType, string> = {
  [TaskType.ANALYSIS]: 'تحليل درامي',
  [TaskType.CREATIVE]: 'إبداع محاكي',
  [TaskType.INTEGRATED]: 'تحليل متكامل',
  [TaskType.COMPLETION]: 'إكمال النص',
  [TaskType.CHARACTER_DEEP_ANALYZER]: 'تحليل الشخصيات المعمق',
  [TaskType.DIALOGUE_ADVANCED_ANALYZER]: 'تحليل الحوار المتقدم',
  [TaskType.VISUAL_CINEMATIC_ANALYZER]: 'التحليل البصري السينمائي',
  [TaskType.THEMES_MESSAGES_ANALYZER]: 'تحليل المواضيع والرسائل',
  [TaskType.CULTURAL_HISTORICAL_ANALYZER]: 'التحليل الثقافي التاريخي',
  [TaskType.PRODUCIBILITY_ANALYZER]: 'تحليل القابلية للإنتاج',
  [TaskType.TARGET_AUDIENCE_ANALYZER]: 'تحليل الجمهور المستهدف',
  [TaskType.LITERARY_QUALITY_ANALYZER]: 'تحليل الجودة الأدبية',
  [TaskType.RECOMMENDATIONS_GENERATOR]: 'مولد التوصيات',
  [TaskType.RHYTHM_MAPPING]: 'رسم خريطة الإيقاع',
  [TaskType.CHARACTER_NETWORK]: 'شبكة الشخصيات',
  [TaskType.DIALOGUE_FORENSICS]: 'تشريح الحوار',
  [TaskType.THEMATIC_MINING]: 'استخراج الثيمات',
  [TaskType.STYLE_FINGERPRINT]: 'بصمة الأسلوب',
  [TaskType.CONFLICT_DYNAMICS]: 'ديناميكيات الصراع',
  [TaskType.ADAPTIVE_REWRITING]: 'إعادة الكتابة التكيفية',
  [TaskType.SCENE_GENERATOR]: 'مولد المشاهد',
  [TaskType.CHARACTER_VOICE]: 'صوت الشخصية',
  [TaskType.WORLD_BUILDER]: 'بناء العالم',
  [TaskType.PLOT_PREDICTOR]: 'متنبئ الحبكة',
  [TaskType.TENSION_OPTIMIZER]: 'محسّن التوتر',
  [TaskType.AUDIENCE_RESONANCE]: 'صدى الجمهور',
  [TaskType.PLATFORM_ADAPTER]: 'محول المنصة'
};

export const TASK_CATEGORY_MAP: Record<TaskType, TaskCategory> = {
  [TaskType.ANALYSIS]: TaskCategory.CORE,
  [TaskType.CREATIVE]: TaskCategory.CORE,
  [TaskType.INTEGRATED]: TaskCategory.CORE,
  [TaskType.COMPLETION]: TaskCategory.CORE,
  [TaskType.CHARACTER_DEEP_ANALYZER]: TaskCategory.ADVANCED_MODULES,
  [TaskType.DIALOGUE_ADVANCED_ANALYZER]: TaskCategory.ADVANCED_MODULES,
  [TaskType.VISUAL_CINEMATIC_ANALYZER]: TaskCategory.ADVANCED_MODULES,
  [TaskType.THEMES_MESSAGES_ANALYZER]: TaskCategory.ADVANCED_MODULES,
  [TaskType.CULTURAL_HISTORICAL_ANALYZER]: TaskCategory.ADVANCED_MODULES,
  [TaskType.PRODUCIBILITY_ANALYZER]: TaskCategory.ADVANCED_MODULES,
  [TaskType.TARGET_AUDIENCE_ANALYZER]: TaskCategory.ADVANCED_MODULES,
  [TaskType.LITERARY_QUALITY_ANALYZER]: TaskCategory.ADVANCED_MODULES,
  [TaskType.RECOMMENDATIONS_GENERATOR]: TaskCategory.ADVANCED_MODULES,
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
  [TaskType.PLATFORM_ADAPTER]: TaskCategory.ADVANCED_MODULES
};

export const SUPPORTED_MIME_TYPES = [
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const TASKS_EXPECTING_JSON_RESPONSE = [
  TaskType.ANALYSIS,
  TaskType.INTEGRATED
];