import React from 'react';
import { TaskCategory, TaskType } from '@core/enums';
import { TASK_CATEGORY_MAP } from '@core/constants';
import { ENHANCED_TASK_DESCRIPTIONS } from '@orchestration/orchestration';
import {
  LightBulbIcon,
  SparklesIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  ChartBarIcon,
  UsersIcon,
  CodeBracketIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
  BeakerIcon,
  ArrowsRightLeftIcon,
  FilmIcon,
  ClipboardDocumentIcon,
} from '@ui/icons';

interface TaskSelectorProps {
  selectedTask: TaskType | null;
  onTaskSelect: (taskType: TaskType) => void;
}

interface TaskOption {
  id: TaskType;
  label: string;
  icon: React.ReactNode;
  category: TaskCategory;
  description: string;
}

const taskOptionsList: TaskOption[] = [
  // Core tasks
  { id: TaskType.ANALYSIS, label: "تحليل نقدي", icon: <LightBulbIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.ANALYSIS], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.ANALYSIS] },
  { id: TaskType.CREATIVE, label: "إبداع محاكاتي", icon: <SparklesIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.CREATIVE], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.CREATIVE] },
  { id: TaskType.INTEGRATED, label: "سير عمل متكامل", icon: <DocumentTextIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.INTEGRATED], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.INTEGRATED] },
  { id: TaskType.COMPLETION, label: "وضع الاستكمال", icon: <PencilSquareIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.COMPLETION], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.COMPLETION] },
  
  // Advanced analytical (existing)
  { id: TaskType.RHYTHM_MAPPING, label: "رسم خرائط الإيقاع", icon: <ChartBarIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.RHYTHM_MAPPING], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.RHYTHM_MAPPING] },
  { id: TaskType.CHARACTER_NETWORK, label: "تحليل شبكات الشخصيات", icon: <UsersIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.CHARACTER_NETWORK], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.CHARACTER_NETWORK] },
  { id: TaskType.DIALOGUE_FORENSICS, label: "تحليل الحوار الجنائي", icon: <MagnifyingGlassIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.DIALOGUE_FORENSICS], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.DIALOGUE_FORENSICS] },
  { id: TaskType.THEMATIC_MINING, label: "التنقيب عن الموضوعات", icon: <MagnifyingGlassIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.THEMATIC_MINING], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.THEMATIC_MINING] },
  { id: TaskType.STYLE_FINGERPRINT, label: "بصمة الأسلوب", icon: <CodeBracketIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.STYLE_FINGERPRINT], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.STYLE_FINGERPRINT] },
  { id: TaskType.CONFLICT_DYNAMICS, label: "ديناميكيات الصراع", icon: <ChartBarIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.CONFLICT_DYNAMICS], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.CONFLICT_DYNAMICS] },
  
  // Advanced creative (existing)
  { id: TaskType.ADAPTIVE_REWRITING, label: "إعادة الكتابة التكيفية", icon: <ArrowsRightLeftIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.ADAPTIVE_REWRITING], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.ADAPTIVE_REWRITING] },
  { id: TaskType.SCENE_GENERATOR, label: "مولد المشاهد", icon: <FilmIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.SCENE_GENERATOR], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.SCENE_GENERATOR] },
  { id: TaskType.CHARACTER_VOICE, label: "محاكي صوت الشخصيات", icon: <UsersIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.CHARACTER_VOICE], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.CHARACTER_VOICE] },
  { id: TaskType.WORLD_BUILDER, label: "باني العوالم", icon: <GlobeAltIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.WORLD_BUILDER], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.WORLD_BUILDER] },
  
  // Predictive and generative (existing)
  { id: TaskType.PLOT_PREDICTOR, label: "متنبئ مسار الحبكة", icon: <BeakerIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.PLOT_PREDICTOR], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.PLOT_PREDICTOR] },
  { id: TaskType.TENSION_OPTIMIZER, label: "محسن التوتر الدرامي", icon: <BeakerIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.TENSION_OPTIMIZER], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.TENSION_OPTIMIZER] },
  { id: TaskType.AUDIENCE_RESONANCE, label: "محلل صدى الجمهور", icon: <UsersIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.AUDIENCE_RESONANCE], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.AUDIENCE_RESONANCE] },
  { id: TaskType.PLATFORM_ADAPTER, label: "محول المنصات", icon: <ArrowsRightLeftIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.PLATFORM_ADAPTER], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.PLATFORM_ADAPTER] },

  // New Advanced Modules (Units 3-11)
  { id: TaskType.CHARACTER_DEEP_ANALYZER, label: "مُحلل الشخصيات العميق (و3)", icon: <UsersIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.CHARACTER_DEEP_ANALYZER], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.CHARACTER_DEEP_ANALYZER] },
  { id: TaskType.DIALOGUE_ADVANCED_ANALYZER, label: "محلل الحوار المتطور (و4)", icon: <MagnifyingGlassIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.DIALOGUE_ADVANCED_ANALYZER], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.DIALOGUE_ADVANCED_ANALYZER] },
  { id: TaskType.VISUAL_CINEMATIC_ANALYZER, label: "محلل السياق البصري (و5)", icon: <FilmIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.VISUAL_CINEMATIC_ANALYZER], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.VISUAL_CINEMATIC_ANALYZER] },
  { id: TaskType.THEMES_MESSAGES_ANALYZER, label: "محلل الموضوعات والرسائل (و6)", icon: <LightBulbIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.THEMES_MESSAGES_ANALYZER], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.THEMES_MESSAGES_ANALYZER] },
  { id: TaskType.CULTURAL_HISTORICAL_ANALYZER, label: "محلل السياق الثقافي (و7)", icon: <GlobeAltIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.CULTURAL_HISTORICAL_ANALYZER], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.CULTURAL_HISTORICAL_ANALYZER] },
  { id: TaskType.PRODUCIBILITY_ANALYZER, label: "محلل القابلية للإنتاج (و8)", icon: <ChartBarIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.PRODUCIBILITY_ANALYZER], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.PRODUCIBILITY_ANALYZER] },
  { id: TaskType.TARGET_AUDIENCE_ANALYZER, label: "محلل الجمهور المستهدف (و9)", icon: <UsersIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.TARGET_AUDIENCE_ANALYZER], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.TARGET_AUDIENCE_ANALYZER] },
  { id: TaskType.LITERARY_QUALITY_ANALYZER, label: "محلل الجودة الأدبية (و10)", icon: <PencilSquareIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.LITERARY_QUALITY_ANALYZER], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.LITERARY_QUALITY_ANALYZER] },
  { id: TaskType.RECOMMENDATIONS_GENERATOR, label: "مولد التوصيات (و11)", icon: <SparklesIcon className="w-5 h-5" />, category: TASK_CATEGORY_MAP[TaskType.RECOMMENDATIONS_GENERATOR], description: ENHANCED_TASK_DESCRIPTIONS[TaskType.RECOMMENDATIONS_GENERATOR] },
];

// Group tasks by category
const groupedTasks = taskOptionsList.reduce((acc, task) => {
  const category = task.category || TaskCategory.CORE; // Fallback category
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push(task);
  return acc;
}, {} as Record<TaskCategory, TaskOption[]>);

// Define explicit order for categories
const categoryOrder: TaskCategory[] = [
  TaskCategory.CORE,
  TaskCategory.ANALYSIS,
  TaskCategory.CREATIVE,
  TaskCategory.PREDICTIVE,
  TaskCategory.ADVANCED_MODULES,
];

// Define icon for visual indicator
const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);


export const TaskSelector: React.FC<TaskSelectorProps> = ({ selectedTask, onTaskSelect }) => {
  const selectedCategory = selectedTask ? TASK_CATEGORY_MAP[selectedTask] : null;

  return (
    <div className="w-full p-6 bg-slate-800 rounded-xl shadow-xl border border-panel-border backdrop-blur-xs bg-panel" data-testid="task-selector">
      <h3 className="text-2xl font-semibold mb-6 text-primary-light flex items-center">
        <LightBulbIcon className="w-7 h-7 me-2" /> اختر الخدمة المطلوبة
      </h3>
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1 pb-2">
        {categoryOrder.map(category => {
          const tasksInCategory = groupedTasks[category];
          if (!tasksInCategory || tasksInCategory.length === 0) return null;

          const isSelectedCategory = selectedCategory === category;

          return (
            <div key={category} className={`p-3 rounded-lg transition-all duration-300 ${isSelectedCategory ? 'bg-slate-700/50 ring-2 ring-primary' : ''}`}>
              <h4 className={`flex items-center text-lg font-semibold mb-3 border-b-2 pb-1 transition-colors duration-300 ${
                  isSelectedCategory 
                    ? 'text-secondary-light border-secondary' 
                    : 'text-primary-light border-primary-dark'
                }`}>
                {isSelectedCategory && <ChevronLeftIcon className="w-5 h-5 me-2" />}
                {category}
              </h4>
              <div className="space-y-2">
                {tasksInCategory.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => onTaskSelect(option.id)}
                    className={`w-full flex items-center p-3 rounded-lg border-2 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800
                      ${selectedTask === option.id 
                        ? 'bg-primary border-primary-light shadow-lg scale-101 ring-primary-light' 
                        : 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500 ring-transparent'}`}
                    aria-pressed={selectedTask === option.id}
                    title={option.description} 
                  >
                    <span className={`me-3 ${selectedTask === option.id ? 'text-slate-900' : 'text-primary-light'}`}>{option.icon}</span>
                    <div className="text-right flex-grow">
                      <span className={`block font-semibold text-sm ${selectedTask === option.id ? 'text-slate-900' : 'text-slate-100'}`}>
                        {option.label}
                      </span>
                      <p className={`block text-xs mt-0.5 ${selectedTask === option.id ? 'text-slate-800' : 'text-slate-400'} truncate-2-lines`}>
                        {option.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
