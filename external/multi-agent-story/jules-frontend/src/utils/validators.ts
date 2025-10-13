import { z } from 'zod'

// Common validation schemas
export const emailSchema = z
  .string()
  .min(1, 'البريد الإلكتروني مطلوب')
  .email('البريد الإلكتروني غير صحيح')

export const passwordSchema = z
  .string()
  .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  .max(100, 'كلمة المرور طويلة جداً')

export const nameSchema = z
  .string()
  .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
  .max(100, 'الاسم طويل جداً')
  .regex(/^[\u0600-\u06FF\s\w]+$/, 'الاسم يحتوي على أحرف غير مسموحة')

// Auth validation schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'كلمة المرور مطلوبة')
})

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword']
})

// API Key validation schemas
export const createApiKeySchema = z.object({
  keyName: z
    .string()
    .min(1, 'اسم المفتاح مطلوب')
    .max(100, 'اسم المفتاح طويل جداً'),
  apiKey: z
    .string()
    .min(1, 'مفتاح API مطلوب')
    .regex(/^AIza[0-9A-Za-z-_]{35}$/, 'مفتاح API غير صحيح')
})

export const updateApiKeySchema = z.object({
  keyName: z
    .string()
    .min(1, 'اسم المفتاح مطلوب')
    .max(100, 'اسم المفتاح طويل جداً')
    .optional(),
  apiKey: z
    .string()
    .min(1, 'مفتاح API مطلوب')
    .regex(/^AIza[0-9A-Za-z-_]{35}$/, 'مفتاح API غير صحيح')
    .optional()
})

// Session validation schemas
export const creativeBriefSchema = z.object({
  coreIdea: z
    .string()
    .min(50, 'الفكرة الأساسية يجب أن تكون 50 حرف على الأقل')
    .max(5000, 'الفكرة الأساسية طويلة جداً'),
  genre: z
    .string()
    .min(1, 'النوع الأدبي مطلوب')
    .max(100, 'النوع الأدبي طويل جداً'),
  targetAudience: z
    .string()
    .max(1000, 'الجمهور المستهدف طويل جداً')
    .optional(),
  themes: z
    .array(z.string().max(100, 'الموضوع طويل جداً'))
    .min(1, 'يجب تحديد موضوع واحد على الأقل')
    .max(10, 'لا يمكن تحديد أكثر من 10 مواضيع')
})

export const createSessionSchema = z.object({
  title: z
    .string()
    .min(1, 'عنوان الجلسة مطلوب')
    .max(200, 'عنوان الجلسة طويل جداً')
    .optional(),
  creativeBrief: creativeBriefSchema
})

export const updateSessionSchema = z.object({
  title: z
    .string()
    .min(1, 'عنوان الجلسة مطلوب')
    .max(200, 'عنوان الجلسة طويل جداً')
    .optional(),
  status: z
    .enum(['draft', 'active', 'paused', 'completed', 'cancelled'])
    .optional()
})

// Agent validation schemas
export const updateAgentConfigSchema = z.object({
  temperature: z
    .number()
    .min(0, 'درجة الحرارة يجب أن تكون 0 أو أكثر')
    .max(2, 'درجة الحرارة يجب أن تكون 2 أو أقل')
    .optional(),
  maxTokens: z
    .number()
    .min(1000, 'الحد الأقصى للرموز يجب أن يكون 1000 أو أكثر')
    .max(100000, 'الحد الأقصى للرموز يجب أن يكون 100000 أو أقل')
    .optional(),
  isActive: z
    .boolean()
    .optional()
})

export const testAgentSchema = z.object({
  prompt: z
    .string()
    .min(1, 'المحث مطلوب')
    .max(10000, 'المحث طويل جداً')
})

// Idea validation schemas
export const generateIdeasSchema = z.object({
  count: z
    .number()
    .min(1, 'يجب توليد فكرة واحدة على الأقل')
    .max(5, 'لا يمكن توليد أكثر من 5 أفكار')
    .default(2),
  focus: z
    .string()
    .max(1000, 'التركيز طويل جداً')
    .optional()
})

export const updateIdeaSchema = z.object({
  title: z
    .string()
    .min(1, 'عنوان الفكرة مطلوب')
    .max(200, 'عنوان الفكرة طويل جداً')
    .optional(),
  content: z
    .string()
    .min(1, 'محتوى الفكرة مطلوب')
    .optional()
})

// Tournament validation schemas
export const startTournamentSchema = z.object({
  maxTurns: z
    .number()
    .min(4, 'يجب أن تكون البطولة 4 أدوار على الأقل')
    .max(12, 'لا يمكن أن تكون البطولة أكثر من 12 دور')
    .default(8),
  turnDuration: z
    .number()
    .min(10, 'مدة الدور يجب أن تكون 10 ثوان على الأقل')
    .max(300, 'مدة الدور يجب أن تكون 300 ثانية أو أقل')
    .default(15)
})

export const voteSchema = z.object({
  ideaId: z
    .string()
    .min(1, 'معرف الفكرة مطلوب'),
  reason: z
    .string()
    .min(1, 'سبب التصويت مطلوب')
    .max(1000, 'سبب التصويت طويل جداً')
})

// Decision validation schemas
export const makeDecisionSchema = z.object({
  winningIdeaId: z
    .string()
    .min(1, 'معرف الفكرة الفائزة مطلوب'),
  rationale: z
    .string()
    .min(1, 'التبرير مطلوب')
    .max(5000, 'التبرير طويل جداً'),
  recommendations: z
    .array(z.string().max(1000, 'التوصية طويلة جداً'))
    .min(1, 'يجب تقديم توصية واحدة على الأقل')
    .max(20, 'لا يمكن تقديم أكثر من 20 توصية')
})

// Utility functions for validation
export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
} => {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: ['خطأ في التحقق من البيانات'] } }
  }
}

export const getFieldError = (errors: Record<string, string[]> | undefined, field: string): string | undefined => {
  if (!errors || !errors[field]) return undefined
  return errors[field][0]
}

export const hasFieldError = (errors: Record<string, string[]> | undefined, field: string): boolean => {
  return !!(errors && errors[field] && errors[field].length > 0)
}

