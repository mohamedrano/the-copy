import { PrismaClient } from "@prisma/client";
import { AgentService } from "./agent.service";
import { logger } from "../utils/logger";

export class DecisionService {
  private prisma: PrismaClient;
  private agentService: AgentService;

  constructor(prisma: PrismaClient, agentService: AgentService) {
    this.prisma = prisma;
    this.agentService = agentService;
  }

  /**
   * Make final decision.
   * Overloads:
   * - makeFinalDecision(sessionId, winningIdeaId, decisionRationale, keyStrengths, recommendations, voteBreakdown)
   * - makeFinalDecision(sessionId, tournamentObj, apiKey)
   */
  async makeFinalDecision(
    sessionId: string,
    arg2: string | any,
    arg3?: string | any,
    keyStrengths?: string[],
    recommendations?: string[],
    voteBreakdown?: Record<string, any>,
  ) {
    try {
      let payload: any = {};

      // If second arg is an object, assume it's a tournament object and perform analysis
      if (typeof arg2 === "object") {
        const tournament = arg2;
        // Simple heuristic: pick idea with highest aggregate score in tournament
        const ideaScores: Record<string, number> = {};
        (tournament.turns || []).forEach((turn: any) => {
          (turn.arguments || []).forEach((arg: any) => {
            const id = arg.ideaId || arg.primaryIdeaId || arg.idea?.id;
            const score = arg.score || arg.weight || 0;
            if (!id) return;
            ideaScores[id] = (ideaScores[id] || 0) + score;
          });
        });

        const winningIdeaId = Object.keys(ideaScores).sort((a, b) =>
          (ideaScores[b] || 0) - (ideaScores[a] || 0),
        )[0];

        payload = {
          sessionId,
          winningIdeaId: winningIdeaId || null,
          decisionRationale: `Automatically selected from tournament results`,
          keyStrengths: [],
          recommendations: [],
          voteBreakdown: ideaScores,
        };
      } else {
        // Explicit call
        payload = {
          sessionId,
          winningIdeaId: arg2,
          decisionRationale: (arg3 as string) || "",
          keyStrengths: keyStrengths || [],
          recommendations: recommendations || [],
          voteBreakdown: voteBreakdown || {},
        };
      }

      const finalDecision = await this.prisma.finalDecision.create({
        data: payload,
      });

      logger.info("Final decision created", {
        sessionId,
        winningIdeaId: payload.winningIdeaId,
      });
      return finalDecision;
    } catch (error) {
      logger.error("Failed to create final decision", { error, sessionId });
      throw error;
    }
  }

  async getFinalDecisionById(decisionId: string) {
    try {
      const decision = await this.prisma.finalDecision.findUnique({
        where: { id: decisionId },
      });
      return decision;
    } catch (error) {
      logger.error("Failed to get final decision by id", { error, decisionId });
      throw error;
    }
  }

  async getDecisionSummary(decisionId: string) {
    try {
      const decision = await this.prisma.finalDecision.findUnique({
        where: { id: decisionId },
        include: { session: true },
      });

      if (!decision) return null;

      // Build a simple summary
      return {
        id: decision.id,
        sessionId: decision.sessionId,
        winningIdeaId: decision.winningIdeaId,
        rationale: decision.decisionRationale,
        keyStrengths: decision.keyStrengths,
        recommendations: decision.recommendations,
        voteBreakdown: decision.voteBreakdown,
        createdAt: decision.createdAt,
      };
    } catch (error) {
      logger.error("Failed to get decision summary", { error, decisionId });
      throw error;
    }
  }

  async getFinalDecisionBySession(sessionId: string) {
    try {
      const finalDecision = await this.prisma.finalDecision.findUnique({
        where: { sessionId },
      });

      return finalDecision;
    } catch (error) {
      logger.error("Failed to get final decision", { error, sessionId });
      throw error;
    }
  }
}
