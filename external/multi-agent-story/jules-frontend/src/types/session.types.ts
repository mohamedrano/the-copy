// Session types
export type SessionStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
export type SessionPhase = 'brief' | 'idea_generation' | 'review' | 'tournament' | 'decision'

export interface Session {
  id: string
  userId: string
  title?: string
  status: SessionStatus
  currentPhase: SessionPhase
  creativeBrief: CreativeBrief
  progress: SessionProgress
  settings: SessionSettings
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface CreativeBrief {
  id: string
  sessionId: string
  coreIdea: string
  genre: string
  targetAudience?: string
  themes: string[]
  constraints?: string[]
  inspirations?: string[]
  goals?: string[]
  createdAt: string
  updatedAt: string
}

export interface SessionProgress {
  phase: SessionPhase
  progress: number
  currentStep: string
  totalSteps: number
  estimatedTimeRemaining?: number
  lastUpdated: string
}

export interface SessionSettings {
  maxIdeas: number
  tournamentRounds: number
  reviewDepth: 'basic' | 'detailed' | 'comprehensive'
  agentConfig: AgentSessionConfig
  notifications: NotificationSettings
}

export interface AgentSessionConfig {
  temperature: number
  maxTokens: number
  responseTime: number
  retryAttempts: number
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  phaseComplete: boolean
  errors: boolean
}

// Session creation and update types
export interface CreateSessionRequest {
  title?: string
  creativeBrief: CreateCreativeBriefRequest
  settings?: Partial<SessionSettings>
}

export interface CreateCreativeBriefRequest {
  coreIdea: string
  genre: string
  targetAudience?: string
  themes: string[]
  constraints?: string[]
  inspirations?: string[]
  goals?: string[]
}

export interface UpdateSessionRequest {
  title?: string
  status?: SessionStatus
  currentPhase?: SessionPhase
  creativeBrief?: Partial<CreateCreativeBriefRequest>
  settings?: Partial<SessionSettings>
}

// Session statistics types
export interface SessionStats {
  totalSessions: number
  activeSessions: number
  completedSessions: number
  averageDuration: number
  averageIdeasPerSession: number
  mostPopularGenres: string[]
  mostPopularThemes: string[]
  successRate: number
}

// Session activity types
export interface SessionActivity {
  id: string
  sessionId: string
  type: 'phase_start' | 'phase_complete' | 'idea_generated' | 'review_completed' | 'tournament_turn' | 'decision_made' | 'error'
  description: string
  data?: any
  timestamp: string
}

// Session export types
export interface SessionExport {
  session: Session
  ideas: any[]
  reviews: any[]
  tournament: any[]
  decision: any[]
  activities: SessionActivity[]
  exportDate: string
  format: 'json' | 'pdf' | 'docx'
}

// Session search and filter types
export interface SessionFilters {
  status?: SessionStatus[]
  phase?: SessionPhase[]
  genre?: string[]
  themes?: string[]
  dateRange?: {
    start: string
    end: string
  }
  search?: string
}

export interface SessionSearchResult {
  sessions: Session[]
  total: number
  page: number
  limit: number
  filters: SessionFilters
}

