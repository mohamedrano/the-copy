// Tournament types
export type TournamentStatus = 'pending' | 'active' | 'paused' | 'completed' | 'cancelled'
export type TurnStatus = 'pending' | 'active' | 'completed' | 'voting' | 'completed'

export interface Tournament {
  id: string
  sessionId: string
  status: TournamentStatus
  currentTurn: number
  maxTurns: number
  turnDuration: number
  votingDuration: number
  ideas: TournamentIdea[]
  participants: TournamentParticipant[]
  settings: TournamentSettings
  stats: TournamentStats
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface TournamentIdea {
  id: string
  title: string
  content: string
  votes: number
  arguments: Argument[]
  strengths: string[]
  weaknesses: string[]
  potential: number
}

export interface TournamentParticipant {
  agentId: string
  agentType: string
  agentName: string
  isActive: boolean
  participationRate: number
  argumentCount: number
  voteCount: number
}

export interface TournamentSettings {
  maxTurns: number
  turnDuration: number
  votingDuration: number
  allowVoting: boolean
  allowArguments: boolean
  scoringMethod: 'simple' | 'weighted' | 'complex'
  tieBreaker: 'random' | 'quality' | 'popularity'
}

export interface TournamentStats {
  totalTurns: number
  completedTurns: number
  totalArguments: number
  totalVotes: number
  averageTurnDuration: number
  participationRate: number
  mostActiveAgent: string
  mostVotedIdea: string
}

// Tournament turn types
export interface TournamentTurn {
  id: string
  tournamentId: string
  turnNumber: number
  status: TurnStatus
  participants: TurnParticipant[]
  arguments: Argument[]
  votes: Vote[]
  winner?: string
  summary: string
  duration: number
  createdAt: string
  completedAt?: string
}

export interface TurnParticipant {
  agentId: string
  agentType: string
  agentName: string
  isActive: boolean
  argumentCount: number
  voteCount: number
}

export interface Argument {
  id: string
  agentId: string
  agentType: string
  agentName: string
  ideaId: string
  content: string
  type: 'support' | 'oppose' | 'neutral'
  strength: number
  evidence: string[]
  reasoning: string
  createdAt: string
}

export interface Vote {
  id: string
  agentId: string
  agentType: string
  ideaId: string
  reason: string
  confidence: number
  createdAt: string
}

// Tournament creation and management types
export interface StartTournamentRequest {
  maxTurns?: number
  turnDuration?: number
  votingDuration?: number
  allowVoting?: boolean
  allowArguments?: boolean
  scoringMethod?: 'simple' | 'weighted' | 'complex'
  tieBreaker?: 'random' | 'quality' | 'popularity'
}

export interface VoteRequest {
  ideaId: string
  reason: string
  confidence?: number
}

// Tournament progress types
export interface TournamentProgress {
  tournamentId: string
  currentTurn: number
  maxTurns: number
  progress: number
  estimatedTimeRemaining?: number
  status: TournamentStatus
  nextPhase?: string
}

// Tournament analysis types
export interface TournamentAnalysis {
  tournamentId: string
  ideaPerformance: IdeaPerformance[]
  agentPerformance: AgentPerformance[]
  argumentQuality: ArgumentQuality
  votingPatterns: VotingPattern[]
  insights: string[]
  recommendations: string[]
}

export interface IdeaPerformance {
  ideaId: string
  title: string
  totalVotes: number
  averageVote: number
  argumentCount: number
  supportCount: number
  opposeCount: number
  strength: number
  weakness: number
  potential: number
}

export interface AgentPerformance {
  agentId: string
  agentType: string
  agentName: string
  participationRate: number
  argumentCount: number
  voteCount: number
  influence: number
  quality: number
  consistency: number
}

export interface ArgumentQuality {
  averageLength: number
  averageStrength: number
  evidenceCount: number
  reasoningQuality: number
  persuasiveness: number
}

export interface VotingPattern {
  agentType: string
  votingBehavior: string
  consistency: number
  bias: string[]
  preferences: string[]
}

// Tournament export types
export interface TournamentExport {
  tournament: Tournament
  turns: TournamentTurn[]
  analysis: TournamentAnalysis
  exportDate: string
  format: 'json' | 'pdf' | 'csv'
}

