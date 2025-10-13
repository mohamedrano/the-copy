import {
  PrismaClient,
  Tournament,
  TournamentTurn,
  Review,
  Idea,
} from "@prisma/client";
import { AgentService } from "./agent.service";
import { PromptBuilder } from "../integrations/gemini/prompts";
import { logger } from "../utils/logger";
import {
  TournamentResult,
  TournamentTurnResult,
} from "../types/tournament.types";

export class TournamentService {
  private prisma: PrismaClient;
  private agentService: AgentService;

  constructor(prisma: PrismaClient, agentService: AgentService) {
    this.prisma = prisma;
    this.agentService = agentService;
  }

  async executeTournament(
    sessionId: string,
    reviews: Review[],
    apiKey: string,
  ): Promise<Tournament> {
    try {
      logger.info("Starting tournament execution", {
        sessionId,
        reviewCount: reviews.length,
      });

      // Determine which ideas advance to tournament based on review scores
      const advancingIdeas = await this.selectAdvancingIdeas(reviews);

      if (advancingIdeas.length === 0) {
        throw new Error("No ideas qualified for tournament");
      }

      // Create tournament record
      const tournament = await this.prisma.tournament.create({
        data: {
          sessionId,
          status: "active",
          totalTurns: 8,
          currentTurn: 0,
          advancingIdeas: advancingIdeas.map((idea) => idea.id),
          metadata: {
            selectionCriteria: "review_scores",
            advancingCount: advancingIdeas.length,
          },
        },
      });

      // Execute 8 tournament turns
      const turns: TournamentTurn[] = [];

      for (let turnNumber = 1; turnNumber <= 8; turnNumber++) {
        const turn = await this.executeTournamentTurn(
          tournament.id,
          turnNumber,
          advancingIdeas,
          apiKey,
        );
        turns.push(turn);

        // Update tournament progress
        await this.prisma.tournament.update({
          where: { id: tournament.id },
          data: { currentTurn: turnNumber },
        });

        logger.info("Tournament turn completed", {
          tournamentId: tournament.id,
          turnNumber,
          totalTurns: 8,
        });
      }

      // Complete tournament
      const finalTournament = await this.prisma.tournament.update({
        where: { id: tournament.id },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
        include: { turns: true },
      });

      logger.info("Tournament completed successfully", {
        tournamentId: tournament.id,
        totalTurns: turns.length,
      });

      return finalTournament;
    } catch (error) {
      logger.error("Tournament execution failed", { error, sessionId });
      throw error;
    }
  }

  private async selectAdvancingIdeas(reviews: Review[]): Promise<Idea[]> {
    try {
      // Group reviews by idea
      const ideaReviews = new Map<string, Review[]>();

      for (const review of reviews) {
        if (review.status === "completed") {
          const ideaId = review.ideaId;
          if (!ideaReviews.has(ideaId)) {
            ideaReviews.set(ideaId, []);
          }
          ideaReviews.get(ideaId)!.push(review);
        }
      }

      // Calculate average scores for each idea
      const ideaScores = new Map<string, number>();

      for (const [ideaId, ideaReviewsList] of ideaReviews) {
        if (ideaReviewsList.length > 0) {
          const averageScore =
            ideaReviewsList.reduce(
              (sum, review) => sum + review.overallScore,
              0,
            ) / ideaReviewsList.length;

          ideaScores.set(ideaId, averageScore);
        }
      }

      // Get ideas with their scores
      const ideasWithScores = Array.from(ideaScores.entries())
        .map(([ideaId, score]) => ({ ideaId, score }))
        .sort((a, b) => b.score - a.score);

      // Select top ideas (minimum 2, maximum all if scores are close)
      const selectedIdeas: string[] = [];

      if (ideasWithScores.length >= 2) {
        // Always include the top 2
        selectedIdeas.push(ideasWithScores[0].ideaId);
        selectedIdeas.push(ideasWithScores[1].ideaId);

        // Include additional ideas if they're within 1 point of the second place
        const secondPlaceScore = ideasWithScores[1].score;
        for (let i = 2; i < ideasWithScores.length; i++) {
          if (ideasWithScores[i].score >= secondPlaceScore - 1) {
            selectedIdeas.push(ideasWithScores[i].ideaId);
          }
        }
      }

      // Fetch full idea objects
      const ideas = await this.prisma.idea.findMany({
        where: { id: { in: selectedIdeas } },
      });

      logger.info("Selected advancing ideas", {
        selectedCount: ideas.length,
        totalScoredIdeas: ideasWithScores.length,
        scores: ideasWithScores.slice(0, ideas.length),
      });

      return ideas;
    } catch (error) {
      logger.error("Failed to select advancing ideas", { error });
      throw error;
    }
  }

  private async executeTournamentTurn(
    tournamentId: string,
    turnNumber: number,
    ideas: Idea[],
    apiKey: string,
  ): Promise<TournamentTurn> {
    try {
      logger.info("Executing tournament turn", {
        tournamentId,
        turnNumber,
        ideaCount: ideas.length,
      });

      // Select participating agents for this turn
      const participatingAgents = await this.selectTurnAgents(
        turnNumber,
        ideas[0].sessionId,
      );

      // Get previous turns' arguments for context
      const previousTurns = await this.prisma.tournamentTurn.findMany({
        where: {
          tournamentId,
          turnNumber: { lt: turnNumber },
        },
        orderBy: { turnNumber: "asc" },
      });

      const tournamentArguments: any[] = [];

      // Execute each participating agent
      for (const agent of participatingAgents) {
        const argument = await this.executeAgentArgument(
          agent,
          ideas,
          previousTurns,
          turnNumber,
          apiKey,
        );
        tournamentArguments.push(argument);
      }

      // Create tournament turn record
      const turn = await this.prisma.tournamentTurn.create({
        data: {
          tournamentId,
          turnNumber,
          status: "completed",
          arguments: tournamentArguments,
          participatingAgents: participatingAgents.map((a) => a.id),
          metadata: {
            argumentCount: tournamentArguments.length,
            agentTypes: participatingAgents.map((a) => a.agentType),
          },
        },
      });

      logger.info("Tournament turn completed", {
        turnId: turn.id,
        turnNumber,
        argumentCount: arguments.length,
      });

      return turn;
    } catch (error) {
      logger.error("Tournament turn execution failed", {
        tournamentId,
        turnNumber,
        error,
      });
      throw error;
    }
  }

  private async selectTurnAgents(
    turnNumber: number,
    sessionId: string,
  ): Promise<any[]> {
    // Get all active agents
    const allAgents = await this.prisma.agent.findMany({
      where: {
        sessionId,
        isActive: true,
      },
    });

    // Tournament strategy: different agents participate in different turns
    const turnStrategies = {
      1: ["story_architect", "character_development"], // Structure and characters
      2: ["realism_critic", "strategic_analyst"], // Reality check and strategy
      3: ["world_building", "theme_agent"], // World and themes
      4: ["dialogue_voice", "genre_tone"], // Voice and style
      5: ["pacing_agent", "conflict_tension"], // Rhythm and tension
      6: ["story_architect", "realism_critic"], // Core structure and realism
      7: ["strategic_analyst", "theme_agent"], // Strategy and themes
      8: ["character_development", "conflict_tension"], // Characters and climax
    };

    const agentTypesForTurn = turnStrategies[
      turnNumber as keyof typeof turnStrategies
    ] || ["story_architect", "realism_critic"];

    const selectedAgents = allAgents.filter((agent) =>
      agentTypesForTurn.includes(agent.agentType),
    );

    // If not enough agents found, add more
    if (selectedAgents.length < 2) {
      const remainingAgents = allAgents.filter(
        (agent) => !agentTypesForTurn.includes(agent.agentType),
      );
      selectedAgents.push(
        ...remainingAgents.slice(0, 2 - selectedAgents.length),
      );
    }

    return selectedAgents;
  }

  private async executeAgentArgument(
    agent: any,
    ideas: Idea[],
    previousTurns: TournamentTurn[],
    turnNumber: number,
    apiKey: string,
  ): Promise<any> {
    try {
      // Build context from previous arguments
      const previousArguments = previousTurns.flatMap((turn) => turn.arguments);

      // Select primary idea for this argument (rotate between ideas)
      const primaryIdea = ideas[turnNumber % ideas.length];

      // Execute agent argument generation
      const argumentResult = await this.agentService.executeAgent(
        agent.id,
        "tournament_argument",
        {
          ideas,
          primaryIdea,
          previousArguments,
          turnNumber,
        },
        apiKey,
      );

      if (!argumentResult.success) {
        throw new Error(`Agent argument failed: ${argumentResult.error}`);
      }

      // Parse argument response
      const parsedArgument = this.parseArgumentResponse(
        argumentResult.response,
      );

      return {
        agentId: agent.id,
        agentType: agent.agentType,
        agentName: agent.agentName,
        ideaId: primaryIdea.id,
        ideaTitle: primaryIdea.title,
        content: argumentResult.response,
        stance: parsedArgument.stance,
        reasoning: parsedArgument.reasoning,
        evidence: parsedArgument.evidence,
        counterArguments: parsedArgument.counterArguments,
        metadata: {
          tokensUsed: argumentResult.tokensUsed,
          duration: argumentResult.duration,
          turnNumber,
        },
      };
    } catch (error) {
      logger.error("Agent argument execution failed", {
        agentId: agent.id,
        turnNumber,
        error,
      });

      return {
        agentId: agent.id,
        agentType: agent.agentType,
        agentName: agent.agentName,
        ideaId: ideas[0]?.id || "",
        ideaTitle: ideas[0]?.title || "Unknown",
        content: `Argument generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        stance: "neutral",
        reasoning: "",
        evidence: [],
        counterArguments: [],
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
          turnNumber,
        },
      };
    }
  }

  private parseArgumentResponse(response: string): {
    stance: string;
    reasoning: string;
    evidence: string[];
    counterArguments: string[];
  } {
    try {
      const result = {
        stance: "neutral",
        reasoning: "",
        evidence: [] as string[],
        counterArguments: [] as string[],
      };

      // Extract stance
      const stanceMatch = response.match(
        /(?:موقفي|My stance|Position)[:\s]*(.+?)(?:\n|$)/i,
      );
      if (stanceMatch) {
        result.stance = stanceMatch[1].trim();
      }

      // Extract reasoning
      const reasoningMatch = response.match(
        /(?:حجتي|My argument|Reasoning)[:\s]*([\s\S]*?)(?:\n(?:الأدلة|Evidence|الدليل)|$)/i,
      );
      if (reasoningMatch) {
        result.reasoning = reasoningMatch[1].trim();
      }

      // Extract evidence
      const evidenceMatch = response.match(
        /(?:الأدلة|Evidence)[:\s]*([\s\S]*?)(?:\n(?:الرد|Counter|Response)|$)/i,
      );
      if (evidenceMatch) {
        result.evidence = this.parseList(evidenceMatch[1]);
      }

      // Extract counter-arguments
      const counterMatch = response.match(
        /(?:الرد على الحجج|Counter-arguments|Response)[:\s]*([\s\S]*?)$/i,
      );
      if (counterMatch) {
        result.counterArguments = this.parseList(counterMatch[1]);
      }

      return result;
    } catch (error) {
      logger.error("Failed to parse argument response", { error });

      return {
        stance: "neutral",
        reasoning: response || "Failed to parse argument",
        evidence: [],
        counterArguments: [],
      };
    }
  }

  private parseList(text: string): string[] {
    if (!text) return [];

    const separators = ["\n-", "\n•", "\n*", "\n1.", "\n2.", "\n3."];
    let items: string[] = [];

    for (const separator of separators) {
      if (text.includes(separator)) {
        items = text
          .split(separator)
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
          .slice(1);
        break;
      }
    }

    if (items.length === 0) {
      items = text
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    items = items
      .map((item) => {
        item = item.replace(/^\d+\.?\s*/, "");
        item = item.replace(/^[-•*]\s*/, "");
        return item.trim();
      })
      .filter((item) => item.length > 0);

    return items;
  }

  async getTournamentBySession(sessionId: string): Promise<Tournament | null> {
    return await this.prisma.tournament.findFirst({
      where: { sessionId },
      include: {
        turns: {
          orderBy: { turnNumber: "asc" },
        },
      },
    });
  }

  async getTournamentById(tournamentId: string): Promise<Tournament | null> {
    return await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        turns: {
          orderBy: { turnNumber: "asc" },
        },
      },
    });
  }

  async getTournamentSummary(tournamentId: string): Promise<any> {
    const tournament = await this.getTournamentById(tournamentId);

    if (!tournament) {
      return null;
    }

    const allArguments = tournament.turns.flatMap((turn) => turn.arguments);
    const agentParticipation = new Map<string, number>();
    const ideaSupport = new Map<string, number>();

    // Analyze participation
    for (const argument of allArguments) {
      const agentType = argument.agentType || "unknown";
      agentParticipation.set(
        agentType,
        (agentParticipation.get(agentType) || 0) + 1,
      );

      const ideaId = argument.ideaId || "unknown";
      ideaSupport.set(ideaId, (ideaSupport.get(ideaId) || 0) + 1);
    }

    return {
      tournamentId,
      status: tournament.status,
      totalTurns: tournament.totalTurns,
      currentTurn: tournament.currentTurn,
      totalArguments: allArguments.length,
      agentParticipation: Object.fromEntries(agentParticipation),
      ideaSupport: Object.fromEntries(ideaSupport),
      turns: tournament.turns.map((turn) => ({
        turnNumber: turn.turnNumber,
        status: turn.status,
        argumentCount: turn.arguments.length,
        participatingAgents: turn.participatingAgents,
      })),
    };
  }
}
