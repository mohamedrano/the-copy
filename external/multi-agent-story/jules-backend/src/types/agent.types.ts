export enum AgentType {
  STORY_ARCHITECT = "story_architect",
  REALISM_CRITIC = "realism_critic",
  STRATEGIC_ANALYST = "strategic_analyst",
  CHARACTER_DEVELOPMENT = "character_development",
  CHARACTER_EXPANSION = "character_expansion",
  WORLD_BUILDING = "world_building",
  DIALOGUE_VOICE = "dialogue_voice",
  THEME = "theme",
  GENRE_TONE = "genre_tone",
  PACING = "pacing",
  CONFLICT_TENSION = "conflict_tension",
}

export interface AgentConfig {
  agentType: AgentType;
  agentName: string;
  guideFile: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface AgentInstance {
  id: string;
  sessionId: string;
  agentType: AgentType;
  agentName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentResponse {
  id: string;
  agentType: AgentType;
  content: string;
  tokensUsed: number;
  processingTime: number;
  timestamp: Date;
}

export interface ReviewOutput {
  id: string;
  agentId: string;
  ideaId: string;
  qualityScore: number;
  noveltyScore: number;
  impactScore: number;
  reasoning: string;
  suggestions: string[];
  timestamp: Date;
}

export interface AgentStats {
  totalAgents: number;
  activeAgents: number;
  inactiveAgents: number;
  totalResponses: number;
  averageResponseTime: number;
}
