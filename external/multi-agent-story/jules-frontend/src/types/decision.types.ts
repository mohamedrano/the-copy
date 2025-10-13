// Decision types
export type DecisionStatus = 'pending' | 'in_progress' | 'completed' | 'error'
export type DecisionMethod = 'automatic' | 'manual' | 'hybrid'

export interface Decision {
  id: string
  sessionId: string
  tournamentId: string
  status: DecisionStatus
  method: DecisionMethod
  winningIdea: WinningIdea
  rationale: DecisionRationale
  recommendations: Recommendation[]
  statistics: DecisionStatistics
  metadata: DecisionMetadata
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface WinningIdea {
  ideaId: string
  title: string
  content: string
  score: number
  confidence: number
  strengths: string[]
  weaknesses: string[]
  potential: number
  marketability: number
  feasibility: number
}

export interface DecisionRationale {
  summary: string
  keyFactors: DecisionFactor[]
  comparison: IdeaComparison
  votingBreakdown: VotingBreakdown
  agentConsensus: AgentConsensus
  finalReasoning: string
}

export interface DecisionFactor {
  factor: string
  weight: number
  impact: number
  reasoning: string
  evidence: string[]
}

export interface IdeaComparison {
  idea1: IdeaComparisonItem
  idea2: IdeaComparisonItem
  winner: string
  margin: number
  keyDifferences: string[]
}

export interface IdeaComparisonItem {
  ideaId: string
  title: string
  scores: {
    structure: number
    characters: number
    originality: number
    marketability: number
    feasibility: number
    emotionalImpact: number
    overall: number
  }
  strengths: string[]
  weaknesses: string[]
}

export interface VotingBreakdown {
  totalVotes: number
  idea1Votes: number
  idea2Votes: number
  abstentions: number
  agentVotes: AgentVote[]
  confidence: number
}

export interface AgentVote {
  agentId: string
  agentType: string
  agentName: string
  ideaId: string
  reason: string
  confidence: number
  timestamp: string
}

export interface AgentConsensus {
  agreement: number
  dissentingAgents: string[]
  consensusPoints: string[]
  disagreementPoints: string[]
  overallSentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
}

export interface Recommendation {
  id: string
  category: 'development' | 'marketing' | 'production' | 'distribution'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  rationale: string
  implementation: string[]
  timeline: string
  resources: string[]
  successMetrics: string[]
}

export interface DecisionStatistics {
  totalIdeas: number
  totalVotes: number
  totalArguments: number
  averageScore: number
  scoreDistribution: ScoreDistribution
  agentParticipation: AgentParticipation[]
  timeToDecision: number
  confidence: number
}

export interface ScoreDistribution {
  min: number
  max: number
  mean: number
  median: number
  standardDeviation: number
  quartiles: {
    q1: number
    q2: number
    q3: number
  }
}

export interface AgentParticipation {
  agentId: string
  agentType: string
  participationRate: number
  argumentCount: number
  voteCount: number
  influence: number
}

export interface DecisionMetadata {
  version: string
  algorithm: string
  parameters: Record<string, any>
  quality: number
  reliability: number
  transparency: number
}

// Decision creation and update types
export interface MakeDecisionRequest {
  method?: DecisionMethod
  parameters?: DecisionParameters
  manualOverride?: ManualOverride
}

export interface DecisionParameters {
  scoringWeights: Record<string, number>
  votingThreshold: number
  confidenceThreshold: number
  tieBreaker: 'random' | 'quality' | 'popularity' | 'manual'
}

export interface ManualOverride {
  winningIdeaId: string
  reason: string
  overrideType: 'user' | 'admin' | 'system'
}

// Decision analysis types
export interface DecisionAnalysis {
  decisionId: string
  quality: DecisionQuality
  fairness: DecisionFairness
  transparency: DecisionTransparency
  insights: DecisionInsight[]
  improvements: DecisionImprovement[]
}

export interface DecisionQuality {
  overall: number
  accuracy: number
  consistency: number
  reliability: number
  validity: number
}

export interface DecisionFairness {
  overall: number
  bias: number
  representation: number
  equality: number
  transparency: number
}

export interface DecisionTransparency {
  overall: number
  explainability: number
  traceability: number
  auditability: number
  interpretability: number
}

export interface DecisionInsight {
  type: 'pattern' | 'anomaly' | 'trend' | 'correlation'
  title: string
  description: string
  significance: number
  evidence: string[]
  implications: string[]
}

export interface DecisionImprovement {
  area: string
  current: number
  target: number
  gap: number
  recommendations: string[]
  priority: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
}

// Decision export types
export interface DecisionExport {
  decision: Decision
  analysis: DecisionAnalysis
  rawData: any
  exportDate: string
  format: 'json' | 'pdf' | 'docx' | 'csv'
}

// Decision statistics types
export interface DecisionStats {
  totalDecisions: number
  averageConfidence: number
  averageQuality: number
  mostCommonWinners: string[]
  agentPerformance: AgentDecisionPerformance[]
  decisionTrends: DecisionTrend[]
}

export interface AgentDecisionPerformance {
  agentId: string
  agentType: string
  accuracy: number
  consistency: number
  influence: number
  participation: number
}

export interface DecisionTrend {
  period: string
  decisions: number
  averageConfidence: number
  averageQuality: number
  commonFactors: string[]
}

