import { ConnectionManager } from "./connection-manager";
import { OrchestratorService } from "../../services/orchestrator.service";
import { logger } from "../../utils/logger";

export class WebSocketEventHandlers {
  private connectionManager: ConnectionManager;
  private orchestratorService: OrchestratorService;

  constructor(
    connectionManager: ConnectionManager,
    orchestratorService: OrchestratorService,
  ) {
    this.connectionManager = connectionManager;
    this.orchestratorService = orchestratorService;
    this.setupOrchestratorListeners();
  }

  private setupOrchestratorListeners(): void {
    // Listen to orchestrator events and broadcast to WebSocket clients
    this.orchestratorService.on("sessionInitialized", (data) => {
      this.handleSessionInitialized(data);
    });

    this.orchestratorService.on("phaseCompleted", (data) => {
      this.handlePhaseCompleted(data);
    });

    this.orchestratorService.on("sessionPaused", (data) => {
      this.handleSessionPaused(data);
    });

    this.orchestratorService.on("sessionResumed", (data) => {
      this.handleSessionResumed(data);
    });

    this.orchestratorService.on("sessionCancelled", (data) => {
      this.handleSessionCancelled(data);
    });
  }

  private handleSessionInitialized(data: { sessionId: string }): void {
    logger.info("Broadcasting session initialized", {
      sessionId: data.sessionId,
    });

    this.connectionManager.broadcastToSession(
      data.sessionId,
      "session_initialized",
      {
        sessionId: data.sessionId,
        status: "initialized",
        timestamp: new Date().toISOString(),
      },
    );
  }

  private handlePhaseCompleted(data: {
    sessionId: string;
    phase: string;
    result: any;
  }): void {
    logger.info("Broadcasting phase completed", {
      sessionId: data.sessionId,
      phase: data.phase,
    });

    this.connectionManager.broadcastToSession(
      data.sessionId,
      "phase_completed",
      {
        sessionId: data.sessionId,
        phase: data.phase,
        result: data.result,
        timestamp: new Date().toISOString(),
      },
    );
  }

  private handleSessionPaused(data: { sessionId: string }): void {
    logger.info("Broadcasting session paused", { sessionId: data.sessionId });

    this.connectionManager.broadcastToSession(
      data.sessionId,
      "session_paused",
      {
        sessionId: data.sessionId,
        status: "paused",
        timestamp: new Date().toISOString(),
      },
    );
  }

  private handleSessionResumed(data: { sessionId: string }): void {
    logger.info("Broadcasting session resumed", { sessionId: data.sessionId });

    this.connectionManager.broadcastToSession(
      data.sessionId,
      "session_resumed",
      {
        sessionId: data.sessionId,
        status: "resumed",
        timestamp: new Date().toISOString(),
      },
    );
  }

  private handleSessionCancelled(data: { sessionId: string }): void {
    logger.info("Broadcasting session cancelled", {
      sessionId: data.sessionId,
    });

    this.connectionManager.broadcastToSession(
      data.sessionId,
      "session_cancelled",
      {
        sessionId: data.sessionId,
        status: "cancelled",
        timestamp: new Date().toISOString(),
      },
    );
  }

  // Agent execution events
  broadcastAgentStarted(
    sessionId: string,
    agentId: string,
    agentType: string,
  ): void {
    this.connectionManager.broadcastToSession(sessionId, "agent_started", {
      sessionId,
      agentId,
      agentType,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastAgentCompleted(
    sessionId: string,
    agentId: string,
    result: any,
  ): void {
    this.connectionManager.broadcastToSession(sessionId, "agent_completed", {
      sessionId,
      agentId,
      result,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastAgentFailed(
    sessionId: string,
    agentId: string,
    error: string,
  ): void {
    this.connectionManager.broadcastToSession(sessionId, "agent_failed", {
      sessionId,
      agentId,
      error,
      timestamp: new Date().toISOString(),
    });
  }

  // Idea generation events
  broadcastIdeaGenerationStarted(sessionId: string): void {
    this.connectionManager.broadcastToSession(
      sessionId,
      "idea_generation_started",
      {
        sessionId,
        timestamp: new Date().toISOString(),
      },
    );
  }

  broadcastIdeaGenerated(sessionId: string, idea: any): void {
    this.connectionManager.broadcastToSession(sessionId, "idea_generated", {
      sessionId,
      idea,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastIdeaGenerationCompleted(sessionId: string, ideas: any[]): void {
    this.connectionManager.broadcastToSession(
      sessionId,
      "idea_generation_completed",
      {
        sessionId,
        ideas,
        ideaCount: ideas.length,
        timestamp: new Date().toISOString(),
      },
    );
  }

  // Review events
  broadcastReviewStarted(
    sessionId: string,
    reviewId: string,
    agentType: string,
  ): void {
    this.connectionManager.broadcastToSession(sessionId, "review_started", {
      sessionId,
      reviewId,
      agentType,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastReviewCompleted(sessionId: string, review: any): void {
    this.connectionManager.broadcastToSession(sessionId, "review_completed", {
      sessionId,
      review,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastReviewPhaseCompleted(sessionId: string, reviews: any[]): void {
    this.connectionManager.broadcastToSession(
      sessionId,
      "review_phase_completed",
      {
        sessionId,
        reviews,
        reviewCount: reviews.length,
        timestamp: new Date().toISOString(),
      },
    );
  }

  // Tournament events
  broadcastTournamentStarted(sessionId: string, tournament: any): void {
    this.connectionManager.broadcastToSession(sessionId, "tournament_started", {
      sessionId,
      tournament,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastTournamentTurnStarted(sessionId: string, turnNumber: number): void {
    this.connectionManager.broadcastToSession(
      sessionId,
      "tournament_turn_started",
      {
        sessionId,
        turnNumber,
        timestamp: new Date().toISOString(),
      },
    );
  }

  broadcastTournamentTurnCompleted(sessionId: string, turn: any): void {
    this.connectionManager.broadcastToSession(
      sessionId,
      "tournament_turn_completed",
      {
        sessionId,
        turn,
        timestamp: new Date().toISOString(),
      },
    );
  }

  broadcastTournamentCompleted(sessionId: string, tournament: any): void {
    this.connectionManager.broadcastToSession(
      sessionId,
      "tournament_completed",
      {
        sessionId,
        tournament,
        timestamp: new Date().toISOString(),
      },
    );
  }

  // Decision events
  broadcastDecisionStarted(sessionId: string): void {
    this.connectionManager.broadcastToSession(sessionId, "decision_started", {
      sessionId,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastDecisionCompleted(sessionId: string, decision: any): void {
    this.connectionManager.broadcastToSession(sessionId, "decision_completed", {
      sessionId,
      decision,
      timestamp: new Date().toISOString(),
    });
  }

  // Progress events
  broadcastProgressUpdate(sessionId: string, progress: any): void {
    this.connectionManager.broadcastToSession(sessionId, "progress_update", {
      sessionId,
      progress,
      timestamp: new Date().toISOString(),
    });
  }

  // Error events
  broadcastError(sessionId: string, error: string, details?: any): void {
    this.connectionManager.broadcastToSession(sessionId, "error", {
      sessionId,
      error,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  // Session status events
  broadcastSessionStatusUpdate(
    sessionId: string,
    status: string,
    phase?: string,
  ): void {
    this.connectionManager.broadcastToSession(
      sessionId,
      "session_status_update",
      {
        sessionId,
        status,
        phase,
        timestamp: new Date().toISOString(),
      },
    );
  }
}
