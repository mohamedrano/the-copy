import { ConnectionManager } from './connection-manager';
import { OrchestratorService } from '../../services/orchestrator.service';
export declare class WebSocketEventHandlers {
    private connectionManager;
    private orchestratorService;
    constructor(connectionManager: ConnectionManager, orchestratorService: OrchestratorService);
    private setupOrchestratorListeners;
    private handleSessionInitialized;
    private handlePhaseCompleted;
    private handleSessionPaused;
    private handleSessionResumed;
    private handleSessionCancelled;
    broadcastAgentStarted(sessionId: string, agentId: string, agentType: string): void;
    broadcastAgentCompleted(sessionId: string, agentId: string, result: any): void;
    broadcastAgentFailed(sessionId: string, agentId: string, error: string): void;
    broadcastIdeaGenerationStarted(sessionId: string): void;
    broadcastIdeaGenerated(sessionId: string, idea: any): void;
    broadcastIdeaGenerationCompleted(sessionId: string, ideas: any[]): void;
    broadcastReviewStarted(sessionId: string, reviewId: string, agentType: string): void;
    broadcastReviewCompleted(sessionId: string, review: any): void;
    broadcastReviewPhaseCompleted(sessionId: string, reviews: any[]): void;
    broadcastTournamentStarted(sessionId: string, tournament: any): void;
    broadcastTournamentTurnStarted(sessionId: string, turnNumber: number): void;
    broadcastTournamentTurnCompleted(sessionId: string, turn: any): void;
    broadcastTournamentCompleted(sessionId: string, tournament: any): void;
    broadcastDecisionStarted(sessionId: string): void;
    broadcastDecisionCompleted(sessionId: string, decision: any): void;
    broadcastProgressUpdate(sessionId: string, progress: any): void;
    broadcastError(sessionId: string, error: string, details?: any): void;
    broadcastSessionStatusUpdate(sessionId: string, status: string, phase?: string): void;
}
//# sourceMappingURL=event-handlers.d.ts.map