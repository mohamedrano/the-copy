export enum TournamentStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface TournamentData {
  id: string;
  sessionId: string;
  status: TournamentStatus;
  totalTurns: number;
  currentTurn: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TournamentTurn {
  id: string;
  tournamentId: string;
  turnNumber: number;
  participants: string[]; // Agent IDs
  arguments: TournamentArgument[];
  summary: string;
  momentumShift: any;
  createdAt: Date;
}

export interface TournamentArgument {
  id: string;
  agentId: string;
  agentType: string;
  argument: string;
  supportingEvidence: string[];
  emotionalAppeal: string;
  logicalReasoning: string;
  timestamp: Date;
}

export interface TournamentProgress {
  tournamentId: string;
  currentTurn: number;
  totalTurns: number;
  completedTurns: number;
  participants: string[];
  currentArguments: TournamentArgument[];
  momentum: any;
  estimatedTimeRemaining?: number;
}
