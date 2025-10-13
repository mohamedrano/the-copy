# API Documentation - The Copy

## نظرة عامة

هذا المستند يوضح API العامة لتطبيق **The Copy** - محرر السيناريو العربي الذكي. يحتوي على جميع الواجهات والدوال والأنواع المتاحة للاستخدام الخارجي.

## المكونات الرئيسية

### App Component

#### `App()`
المكون الجذر للتطبيق الذي يوفر نظام التنقل الرئيسي.

```typescript
export default function App(): JSX.Element
```

**الوصف:** مكون React الجذر الذي يدير التنقل بين صفحات التطبيق المختلفة.

**المثال:**
```tsx
import App from './App';

function Root() {
  return <App />;
}
```

#### `PageId`
نوع البيانات لمعرفات الصفحات المتاحة.

```typescript
export type PageId = 'home' | 'basic-editor' | 'projects' | 'templates' | 'export' | 'settings'
```

#### `NavigationHandler`
نوع البيانات لدالة معالج التنقل.

```typescript
export type NavigationHandler = (pageId: PageId) => void
```

## خدمات التحليل

### AnalysisService

#### `AnalysisService`
فئة خدمة التحليل الأساسية للسيناريوهات.

```typescript
export default class AnalysisService
```

**الوصف:** يوفر قدرات تحليل شاملة للسيناريوهات، بما في ذلك حساب المقاييس الكمية وتوليد الرؤى النوعية باستخدام الذكاء الاصطناعي.

**المثال:**
```typescript
import AnalysisService from './services/AnalysisService';
import { GeminiService } from './lib/ai/geminiService';

const aiService = new GeminiService();
const analysisService = new AnalysisService(aiService);
const result = await analysisService.analyze(script);
```

#### `analyze(script, rawTextOverride?)`
يقوم بتحليل شامل للسيناريو.

```typescript
async analyze(script: Script, rawTextOverride?: string): Promise<AnalysisResult>
```

**المعاملات:**
- `script` - بيانات السيناريو المنظمة للتحليل
- `rawTextOverride` - نص خام اختياري لاستخدامه في سياق الذكاء الاصطناعي

**القيمة المرجعة:** Promise يحل إلى نتائج التحليل الشاملة

**المثال:**
```typescript
const result = await analysisService.analyze(script);
console.log(`نسبة الحوار: ${result.dialogueToActionRatio}`);
```

#### `CharacterDialogueStat`
إحصائيات حوار الشخصية.

```typescript
export interface CharacterDialogueStat {
  name: string;
  dialogueLines: number;
}
```

#### `AnalysisResult`
نتائج التحليل الشاملة.

```typescript
export interface AnalysisResult {
  totalScenes: number;
  characterDialogueCounts: CharacterDialogueStat[];
  dialogueToActionRatio: number;
  synopsis: string;
  logline: string;
}
```

#### `AIWritingAssistantLike`
واجهة مساعد الكتابة بالذكاء الاصطناعي.

```typescript
export interface AIWritingAssistantLike {
  generateText(prompt: string, context: string, options?: Record<string, unknown>): Promise<{ text?: string }>;
}
```

## نظام الوكلاء الذكيين

### AgentFacade

#### `AgentCategory`
فئات الوكلاء للتنظيم.

```typescript
export enum AgentCategory {
  CORE = 'core',
  ANALYSIS = 'analysis',
  GENERATION = 'generation',
  TRANSFORMATION = 'transformation',
  EVALUATION = 'evaluation'
}
```

#### `AGENT_CONFIGS`
سجل تكوينات الوكلاء المتاحة.

```typescript
export const AGENT_CONFIGS: readonly AIAgentConfig[]
```

**الوصف:** مصفوفة ثابتة تحتوي على جميع الوكلاء المُكوَّنة في النظام.

#### `getAgentsByCategory(category)`
إرجاع الوكلاء حسب الفئة.

```typescript
export function getAgentsByCategory(category: AgentCategory): AIAgentConfig[]
```

**المعاملات:**
- `category` - فئة الوكلاء المطلوبة

**القيمة المرجعة:** مصفوفة من تكوينات الوكلاء المطابقة للفئة

**المثال:**
```typescript
const analysisAgents = getAgentsByCategory(AgentCategory.ANALYSIS);
console.log(`وجدت ${analysisAgents.length} وكلاء تحليل`);
```

#### `getAgentById(id)`
البحث عن وكيل بالمعرف.

```typescript
export function getAgentById(id: string): AIAgentConfig | undefined
```

**المعاملات:**
- `id` - معرف الوكيل المطلوب

**القيمة المرجعة:** تكوين الوكيل المطابق أو undefined إذا لم يوجد

**المثال:**
```typescript
const agent = getAgentById('analysis');
if (agent) {
  console.log(`وجدت الوكيل: ${agent.name}`);
}
```

#### `AgentExecutor`
واجهة تنفيذ الوكلاء.

```typescript
export interface AgentExecutor {
  execute(agentId: string, input: string, context?: any): Promise<any>;
}
```

#### `SimpleAgentExecutor`
تنفيذ بسيط للوكلاء.

```typescript
export class SimpleAgentExecutor implements AgentExecutor
```

**الوصف:** تنفيذ أساسي لواجهة AgentExecutor مع تحميل تعليمات ديناميكي وسلوك احتياطي.

**المثال:**
```typescript
const executor = new SimpleAgentExecutor();
const result = await executor.execute('analysis', 'Analyze this screenplay');
console.log(result.output);
```

## أنواع البيانات الأساسية

### TaskType
معرفات مهام الوكلاء.

```typescript
export const enum TaskType {
  ANALYSIS = 'analysis',
  CREATIVE = 'creative',
  INTEGRATED = 'integrated',
  COMPLETION = 'completion',
  // ... المزيد من المهام
}
```

### TaskCategory
فئات المهام.

```typescript
export const enum TaskCategory {
  CORE = 'CORE',
  ANALYSIS = 'ANALYSIS',
  CREATIVE = 'CREATIVE',
  // ... المزيد من الفئات
}
```

### AIAgentConfig
تكوين شامل للوكيل الذكي.

```typescript
export interface AIAgentConfig {
  id?: string;
  name: string;
  description: string;
  category: TaskCategory | string;
  capabilities?: string[] | Record<string, boolean | string | number>;
  modelConfig?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
  systemPrompt?: string;
  // ... المزيد من الخصائص
}
```

### Screenplay Types

#### `Script`
نموذج البيانات الجذر للسيناريو المنظم.

```typescript
export interface Script {
  rawText: string;
  totalLines: number;
  scenes: Scene[];
  characters: Record<string, Character>;
  dialogueLines: DialogueLine[];
}
```

#### `Scene`
مشهد منظم من السيناريو.

```typescript
export interface Scene {
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

#### `Character`
معلومات الشخصية وحوارها.

```typescript
export interface Character {
  name: string;
  dialogueCount: number;
  dialogueLines: DialogueLine[];
  firstSceneId?: string;
}
```

#### `DialogueLine`
سطر حوار أو توجيه.

```typescript
export interface DialogueLine {
  id: string;
  character: string;
  text: string;
  lineNumber: number;
  sceneId: string;
  type: 'dialogue' | 'parenthetical';
}
```

#### `SceneActionLine`
سطر عمل أو وصف في المشهد.

```typescript
export interface SceneActionLine {
  text: string;
  lineNumber: number;
}
```

### Utility Types

#### `ProcessedFile`
ملف معالج لإدخال الوكلاء.

```typescript
export interface ProcessedFile {
  name: string;
  content: string;
  mimeType: string;
  isBase64: boolean;
  size: number;
}
```

#### `CompletionEnhancementOption`
خيار تحسين الإكمال.

```typescript
export interface CompletionEnhancementOption {
  id: TaskType;
  label: string;
}
```

## أمثلة الاستخدام

### تحليل سيناريو
```typescript
import AnalysisService from './services/AnalysisService';
import { GeminiService } from './lib/ai/geminiService';

// إنشاء خدمة التحليل
const aiService = new GeminiService();
const analysisService = new AnalysisService(aiService);

// تحليل السيناريو
const result = await analysisService.analyze(script);
console.log(`عدد المشاهد: ${result.totalScenes}`);
console.log(`نسبة الحوار: ${result.dialogueToActionRatio}`);
console.log(`الملخص: ${result.synopsis}`);
```

### استخدام الوكلاء الذكيين
```typescript
import { getAgentsByCategory, SimpleAgentExecutor, AgentCategory } from './agents/core';

// الحصول على وكلاء التحليل
const analysisAgents = getAgentsByCategory(AgentCategory.ANALYSIS);

// تنفيذ وكيل
const executor = new SimpleAgentExecutor();
const result = await executor.execute('character-analyzer', screenplayText);
console.log(result.output);
```

### التنقل في التطبيق
```typescript
import App, { PageId, NavigationHandler } from './App';

// معالج التنقل
const handleNavigation: NavigationHandler = (pageId: PageId) => {
  console.log(`الانتقال إلى: ${pageId}`);
};

// استخدام المكون
<App onNavigate={handleNavigation} />
```

## ملاحظات مهمة

### التوافق
- جميع الواجهات العامة مستقرة ومضمونة للتوافق
- التغييرات غير المتوافقة ستُعلن في CHANGELOG.md
- يُنصح بقراءة ملاحظات الإصدار قبل التحديث

### الأداء
- استخدم `useMemo` و `useCallback` للمكونات المعقدة
- تجنب إعادة إنشاء الكائنات في كل render
- استخدم lazy loading للمكونات الكبيرة

### الأمان
- جميع المدخلات تُنظف تلقائياً
- لا تضع مفاتيح API في الكود
- استخدم متغيرات البيئة للبيانات الحساسة

## الدعم

للحصول على المساعدة:
- **GitHub Issues:** للمشاكل التقنية
- **GitHub Discussions:** للأسئلة العامة
- **البريد الإلكتروني:** support@the-copy.com

---

**API موثوق ومستقر** 🔧