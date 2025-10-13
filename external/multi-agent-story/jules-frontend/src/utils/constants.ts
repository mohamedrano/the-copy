// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

// Application Configuration
export const APP_NAME = 'Jules'
export const APP_VERSION = '1.0.0'

// Session Configuration
export const SESSION_PHASES = {
  BRIEF: 'brief',
  IDEA_GENERATION: 'idea_generation',
  REVIEW: 'review',
  TOURNAMENT: 'tournament',
  DECISION: 'decision'
} as const

export const SESSION_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

// Agent Configuration
export const AGENT_TYPES = {
  STORY_ARCHITECT: 'story_architect',
  REALISM_CRITIC: 'realism_critic',
  STRATEGIC_ANALYST: 'strategic_analyst',
  CHARACTER_DEVELOPMENT: 'character_development',
  CHARACTER_EXPANSION: 'character_expansion',
  WORLD_BUILDING: 'world_building',
  DIALOGUE_VOICE: 'dialogue_voice',
  THEME_AGENT: 'theme_agent',
  GENRE_TONE: 'genre_tone',
  PACING_AGENT: 'pacing_agent',
  CONFLICT_TENSION: 'conflict_tension'
} as const

export const AGENT_NAMES = {
  [AGENT_TYPES.STORY_ARCHITECT]: 'مهندس القصة',
  [AGENT_TYPES.REALISM_CRITIC]: 'ناقد الواقعية',
  [AGENT_TYPES.STRATEGIC_ANALYST]: 'المحلل الاستراتيجي',
  [AGENT_TYPES.CHARACTER_DEVELOPMENT]: 'مطور الشخصيات',
  [AGENT_TYPES.CHARACTER_EXPANSION]: 'موسع الشخصيات',
  [AGENT_TYPES.WORLD_BUILDING]: 'باني العالم',
  [AGENT_TYPES.DIALOGUE_VOICE]: 'خبير الحوار',
  [AGENT_TYPES.THEME_AGENT]: 'وكيل الموضوعات',
  [AGENT_TYPES.GENRE_TONE]: 'خبير النوع والأسلوب',
  [AGENT_TYPES.PACING_AGENT]: 'وكيل الإيقاع',
  [AGENT_TYPES.CONFLICT_TENSION]: 'وكيل الصراع والتوتر'
} as const

// Tournament Configuration
export const TOURNAMENT_CONFIG = {
  MAX_TURNS: 8,
  TURN_DURATION: 15, // seconds
  VOTING_DURATION: 30 // seconds
} as const

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200
} as const

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  CORE_IDEA_MIN_LENGTH: 50,
  CORE_IDEA_MAX_LENGTH: 5000,
  THEME_MAX_LENGTH: 100
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'خطأ في الاتصال بالشبكة',
  UNAUTHORIZED: 'غير مصرح لك بالوصول',
  FORBIDDEN: 'ممنوع الوصول',
  NOT_FOUND: 'المورد غير موجود',
  VALIDATION_ERROR: 'خطأ في التحقق من البيانات',
  SERVER_ERROR: 'خطأ في الخادم',
  UNKNOWN_ERROR: 'حدث خطأ غير متوقع'
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  SESSION_CREATED: 'تم إنشاء الجلسة بنجاح',
  SESSION_UPDATED: 'تم تحديث الجلسة بنجاح',
  SESSION_DELETED: 'تم حذف الجلسة بنجاح',
  IDEA_GENERATED: 'تم توليد الأفكار بنجاح',
  TOURNAMENT_STARTED: 'تم بدء البطولة بنجاح',
  DECISION_MADE: 'تم اتخاذ القرار بنجاح'
} as const

