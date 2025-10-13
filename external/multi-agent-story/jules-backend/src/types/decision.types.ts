export interface FinalDecisionResponse {
  id: string;
  sessionId: string;
  winningIdeaId: string;
  decisionReason: string;
  keyStrengths: string[];
  recommendations: string[];
  voteBreakdown: VoteBreakdown;
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VoteBreakdown {
  totalVotes: number;
  idea1Votes: number;
  idea2Votes: number;
  agentVotes: Record<
    string,
    {
      agentId: string;
      agentType: string;
      agentName: string;
      votedFor: "idea1" | "idea2";
      reasoning: string;
      confidence: number;
    }
  >;
  criteria: {
    quality: {
      idea1: number;
      idea2: number;
    };
    novelty: {
      idea1: number;
      idea2: number;
    };
    impact: {
      idea1: number;
      idea2: number;
    };
  };
}

export interface DecisionCreateRequest {
  sessionId: string;
  winningIdeaId: string;
  decisionReason: string;
  keyStrengths: string[];
  recommendations: string[];
  voteBreakdown: VoteBreakdown;
  confidence: number;
}

export interface DecisionUpdateRequest {
  decisionReason?: string;
  keyStrengths?: string[];
  recommendations?: string[];
  voteBreakdown?: Partial<VoteBreakdown>;
  confidence?: number;
}

export interface DecisionAnalysis {
  idea1: {
    id: string;
    title: string;
    strengths: string[];
    weaknesses: string[];
    averageScore: number;
    voteCount: number;
  };
  idea2: {
    id: string;
    title: string;
    strengths: string[];
    weaknesses: string[];
    averageScore: number;
    voteCount: number;
  };
  winner: "idea1" | "idea2";
  margin: number;
  confidence: number;
  reasoning: string;
}
