export enum SessionStatus {
  INITIALIZING = "initializing",
  ACTIVE = "active",
  PAUSED = "paused",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum SessionPhase {
  BRIEF = "brief",
  INITIALIZE_AGENTS = "initialize_agents",
  GENERATE_IDEAS = "generate_ideas",
  INDEPENDENT_REVIEW = "independent_review",
  TOURNAMENT = "tournament",
  FINAL_DECISION = "final_decision",
}

export interface SessionProgress {
  sessionId: string;
  currentPhase: SessionPhase;
  progress: number; // 0-100
  message: string;
  timestamp: string;
  estimatedTimeRemaining?: number;
}

export interface CreateSessionInput {
  coreIdea: string;
  genre: string;
  targetAudience: string;
  themes: string[];
}

export interface CreativeBrief {
  sessionId: string;
  coreIdea: string;
  genre: string;
  targetAudience: string;
  themes: string[];
  createdAt: Date;
  updatedAt: Date;
}
