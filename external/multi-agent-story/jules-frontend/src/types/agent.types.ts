// Agent types
export type AgentType = 
  | 'story_architect'
  | 'realism_critic'
  | 'strategic_analyst'
  | 'character_development'
  | 'character_expansion'
  | 'world_building'
  | 'dialogue_voice'
  | 'theme_agent'
  | 'genre_tone'
  | 'pacing_agent'
  | 'conflict_tension'

export type AgentStatus = 'active' | 'inactive' | 'error' | 'processing'

export interface Agent {
  id: string
  sessionId: string
  agentType: AgentType
  agentName: string
  status: AgentStatus
  temperature: number
  maxTokens: number
  isActive: boolean
  guideContent: string
  config: AgentConfig
  stats: AgentStats
  createdAt: string
  updatedAt: string
}

export interface AgentConfig {
  temperature: number
  maxTokens: number
  topP?: number
  topK?: number
  stopSequences?: string[]
  safetySettings?: SafetySetting[]
}

export interface SafetySetting {
  category: string
  threshold: string
}

export interface AgentStats {
  totalRequests: number
  totalTokens: number
  averageResponseTime: number
  successRate: number
  lastUsedAt?: string
}

export interface UpdateAgentConfigRequest {
  temperature?: number
  maxTokens?: number
  topP?: number
  topK?: number
  stopSequences?: string[]
  safetySettings?: SafetySetting[]
  isActive?: boolean
}

export interface TestAgentRequest {
  prompt: string
  temperature?: number
  maxTokens?: number
}

export interface TestAgentResponse {
  response: string
  tokensUsed: number
  responseTime: number
  success: boolean
  error?: string
}

// Agent execution types
export interface AgentExecution {
  id: string
  agentId: string
  sessionId: string
  prompt: string
  response: string
  tokensUsed: number
  responseTime: number
  success: boolean
  error?: string
  createdAt: string
}

export interface AgentExecutionResult {
  success: boolean
  response: string
  tokensUsed: number
  responseTime: number
  error?: string
}

// Agent team types
export interface AgentTeam {
  sessionId: string
  agents: Agent[]
  isComplete: boolean
  createdAt: string
  updatedAt: string
}

export interface AgentTeamStatus {
  totalAgents: number
  activeAgents: number
  inactiveAgents: number
  errorAgents: number
  processingAgents: number
}

