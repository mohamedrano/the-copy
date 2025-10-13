import { PrismaClient } from '@prisma/client';
import { AgentService } from './agent.service';
import { IdeaService } from './idea.service';
import { ReviewService } from './review.service';
import { TournamentService } from './tournament.service';
import { DecisionService } from './decision.service';
import { SessionPhase, OrchestrationContext, PhaseResult } from '../types/session.types';
import { EventEmitter } from 'events';
export declare class OrchestratorService extends EventEmitter {
    private prisma;
    private agentService;
    private ideaService;
    private reviewService;
    private tournamentService;
    private decisionService;
    constructor(prisma: PrismaClient, agentService: AgentService, ideaService: IdeaService, reviewService: ReviewService, tournamentService: TournamentService, decisionService: DecisionService);
    initializeSession(sessionId: string, apiKey: string): Promise<void>;
    startPhase(sessionId: string, phase: SessionPhase, apiKey: string, context?: OrchestrationContext): Promise<PhaseResult>;
    private handleBriefPhase;
    private handleIdeaGenerationPhase;
    private handleReviewPhase;
    private handleTournamentPhase;
    private handleDecisionPhase;
    private updateSessionStatus;
    private getNextPhase;
    getSessionProgress(sessionId: string): Promise<any>;
    pauseSession(sessionId: string): Promise<void>;
    resumeSession(sessionId: string): Promise<void>;
    cancelSession(sessionId: string): Promise<void>;
    onSessionUpdate(callback: (data: any) => void): void;
    removeSessionUpdateListener(callback: (data: any) => void): void;
}
//# sourceMappingURL=orchestrator.service.d.ts.map