import { PrismaClient, Review, Idea, Agent } from "@prisma/client";
import { AgentService } from "./agent.service";
import { PromptBuilder } from "../integrations/gemini/prompts";
import { logger } from "../utils/logger";
import { ReviewResult, ReviewScore } from "../types/idea.types";

export class ReviewService {
  private prisma: PrismaClient;
  private agentService: AgentService;

  constructor(prisma: PrismaClient, agentService: AgentService) {
    this.prisma = prisma;
    this.agentService = agentService;
  }

  async executeIndependentReviews(
    sessionId: string,
    ideas: Idea[],
    apiKey: string,
  ): Promise<Review[]> {
    try {
      logger.info("Starting independent reviews", {
        sessionId,
        ideaCount: ideas.length,
      });

      // Get all active agents for this session
      const agents = await this.prisma.agent.findMany({
        where: {
          sessionId,
          isActive: true,
        },
      });

      if (agents.length === 0) {
        throw new Error("No active agents found for review");
      }

      const reviews: Review[] = [];

      // Execute reviews in parallel for better performance
      const reviewPromises: Promise<Review>[] = [];

      for (const agent of agents) {
        for (const idea of ideas) {
          reviewPromises.push(this.executeSingleReview(agent, idea, apiKey));
        }
      }

      // Wait for all reviews to complete
      const reviewResults = await Promise.allSettled(reviewPromises);

      // Process results
      for (const result of reviewResults) {
        if (result.status === "fulfilled") {
          reviews.push(result.value);
        } else {
          logger.error("Review execution failed", {
            error: result.reason,
          });
        }
      }

      logger.info("Independent reviews completed", {
        sessionId,
        reviewCount: reviews.length,
        expectedCount: agents.length * ideas.length,
      });

      return reviews;
    } catch (error) {
      logger.error("Independent reviews failed", { error, sessionId });
      throw error;
    }
  }

  private async executeSingleReview(
    agent: Agent,
    idea: Idea,
    apiKey: string,
  ): Promise<Review> {
    try {
      logger.info("Executing single review", {
        agentId: agent.id,
        agentType: agent.agentType,
        ideaId: idea.id,
      });

      // Check if review already exists
      const existingReview = await this.prisma.review.findFirst({
        where: {
          sessionId: agent.sessionId,
          agentId: agent.id,
          ideaId: idea.id,
        },
      });

      if (existingReview) {
        logger.info("Review already exists, skipping", {
          reviewId: existingReview.id,
        });
        return existingReview;
      }

      // Execute agent review
      const reviewResult = await this.agentService.executeAgent(
        agent.id,
        "review",
        { idea },
        apiKey,
      );

      if (!reviewResult.success) {
        throw new Error(`Agent review failed: ${reviewResult.error}`);
      }

      // Parse review scores and content
      const parsedReview = this.parseReviewResponse(reviewResult.response);

      // Create review record
      const review = await this.prisma.review.create({
        data: {
          sessionId: agent.sessionId,
          agentId: agent.id,
          ideaId: idea.id,
          content: reviewResult.response,
          qualityScore: parsedReview.scores.quality,
          noveltyScore: parsedReview.scores.novelty,
          impactScore: parsedReview.scores.impact,
          overallScore: parsedReview.scores.overall,
          strengths: parsedReview.strengths,
          weaknesses: parsedReview.weaknesses,
          recommendations: parsedReview.recommendations,
          justification: parsedReview.justification,
          status: "completed",
          metadata: {
            agentType: agent.agentType,
            agentName: agent.agentName,
            tokensUsed: reviewResult.tokensUsed,
            duration: reviewResult.duration,
            reviewMethod: "ai_generated",
          },
        },
      });

      logger.info("Single review completed", {
        reviewId: review.id,
        agentType: agent.agentType,
        overallScore: review.overallScore,
      });

      return review;
    } catch (error) {
      logger.error("Single review execution failed", {
        agentId: agent.id,
        ideaId: idea.id,
        error,
      });

      // Create failed review record
      const review = await this.prisma.review.create({
        data: {
          sessionId: agent.sessionId,
          agentId: agent.id,
          ideaId: idea.id,
          content: "",
          qualityScore: 0,
          noveltyScore: 0,
          impactScore: 0,
          overallScore: 0,
          strengths: [],
          weaknesses: [],
          recommendations: [],
          justification: `Review failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          status: "failed",
          metadata: {
            agentType: agent.agentType,
            agentName: agent.agentName,
            error: error instanceof Error ? error.message : "Unknown error",
            reviewMethod: "ai_generated",
          },
        },
      });

      return review;
    }
  }

  private parseReviewResponse(response: string): {
    scores: ReviewScore;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    justification: string;
  } {
    try {
      // Initialize default values
      const result = {
        scores: {
          quality: 5,
          novelty: 5,
          impact: 5,
          overall: 5,
        },
        strengths: [] as string[],
        weaknesses: [] as string[],
        recommendations: [] as string[],
        justification: "",
      };

      // Extract scores
      const scorePatterns = {
        quality:
          /(?:الجودة العامة|Overall Quality|Quality)[:\s]*(\d+(?:\.\d+)?)/i,
        novelty: /(?:الأصالة|Novelty)[:\s]*(\d+(?:\.\d+)?)/i,
        impact: /(?:التأثير|Impact)[:\s]*(\d+(?:\.\d+)?)/i,
        overall: /(?:التقييم العام|Overall Assessment)[:\s]*(\d+(?:\.\d+)?)/i,
      };

      for (const [key, pattern] of Object.entries(scorePatterns)) {
        const match = response.match(pattern);
        if (match) {
          const score = parseFloat(match[1]);
          if (score >= 1 && score <= 10) {
            result.scores[key as keyof ReviewScore] = score;
          }
        }
      }

      // Calculate overall score if not explicitly provided
      if (result.scores.overall === 5) {
        result.scores.overall =
          (result.scores.quality +
            result.scores.novelty +
            result.scores.impact) /
          3;
      }

      // Extract strengths
      const strengthsMatch = response.match(
        /(?:نقاط القوة|Strengths)[:\s]*([\s\S]*?)(?:\n\n|\n(?:نقاط|Points|Weaknesses|الضعف))/i,
      );
      if (strengthsMatch) {
        result.strengths = this.parseList(strengthsMatch[1]);
      }

      // Extract weaknesses
      const weaknessesMatch = response.match(
        /(?:نقاط الضعف|Weaknesses)[:\s]*([\s\S]*?)(?:\n\n|\n(?:التوصيات|Recommendations|الضوابط))/i,
      );
      if (weaknessesMatch) {
        result.weaknesses = this.parseList(weaknessesMatch[1]);
      }

      // Extract recommendations
      const recommendationsMatch = response.match(
        /(?:التوصيات|Recommendations)[:\s]*([\s\S]*?)(?:\n\n|\n(?:التبرير|Justification|التوضيح))/i,
      );
      if (recommendationsMatch) {
        result.recommendations = this.parseList(recommendationsMatch[1]);
      }

      // Extract justification
      const justificationMatch = response.match(
        /(?:البرير|Justification)[:\s]*([\s\S]*?)(?:\n\n|$)/i,
      );
      if (justificationMatch) {
        result.justification = justificationMatch[1].trim();
      }

      // Fallback: if no structured sections found, use the full response
      if (
        !result.strengths.length &&
        !result.weaknesses.length &&
        !result.recommendations.length
      ) {
        result.justification = response.trim();
      }

      return result;
    } catch (error) {
      logger.error("Failed to parse review response", { error });

      return {
        scores: { quality: 5, novelty: 5, impact: 5, overall: 5 },
        strengths: [],
        weaknesses: [],
        recommendations: [],
        justification: response || "Failed to parse review response",
      };
    }
  }

  private parseList(text: string): string[] {
    if (!text) return [];

    // Split by common list separators
    const separators = ["\n-", "\n•", "\n*", "\n1.", "\n2.", "\n3."];
    let items: string[] = [];

    for (const separator of separators) {
      if (text.includes(separator)) {
        items = text
          .split(separator)
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
          .slice(1); // Remove first empty item
        break;
      }
    }

    // If no separators found, try splitting by newlines
    if (items.length === 0) {
      items = text
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    // Clean up items
    items = items
      .map((item) => {
        // Remove numbering
        item = item.replace(/^\d+\.?\s*/, "");
        // Remove bullet points
        item = item.replace(/^[-•*]\s*/, "");
        return item.trim();
      })
      .filter((item) => item.length > 0);

    return items;
  }

  async getReviewsBySession(sessionId: string): Promise<Review[]> {
    return await this.prisma.review.findMany({
      where: { sessionId },
      include: {
        agent: true,
        idea: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async getReviewsByIdea(ideaId: string): Promise<Review[]> {
    return await this.prisma.review.findMany({
      where: { ideaId },
      include: {
        agent: true,
      },
      orderBy: { overallScore: "desc" },
    });
  }

  async getReviewSummary(sessionId: string): Promise<any> {
    const reviews = await this.getReviewsBySession(sessionId);

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageScores: { quality: 0, novelty: 0, impact: 0, overall: 0 },
        completedReviews: 0,
        failedReviews: 0,
      };
    }

    const completedReviews = reviews.filter((r) => r.status === "completed");
    const failedReviews = reviews.filter((r) => r.status === "failed");

    const averageScores = {
      quality:
        completedReviews.reduce((sum, r) => sum + r.qualityScore, 0) /
        completedReviews.length,
      novelty:
        completedReviews.reduce((sum, r) => sum + r.noveltyScore, 0) /
        completedReviews.length,
      impact:
        completedReviews.reduce((sum, r) => sum + r.impactScore, 0) /
        completedReviews.length,
      overall:
        completedReviews.reduce((sum, r) => sum + r.overallScore, 0) /
        completedReviews.length,
    };

    return {
      totalReviews: reviews.length,
      averageScores,
      completedReviews: completedReviews.length,
      failedReviews: failedReviews.length,
      reviewsByAgent: this.groupReviewsByAgent(reviews),
    };
  }

  private groupReviewsByAgent(reviews: Review[]): any {
    const grouped: any = {};

    for (const review of reviews) {
      const agentType = review.agent?.agentType || "unknown";
      if (!grouped[agentType]) {
        grouped[agentType] = {
          agentName: review.agent?.agentName || "Unknown",
          reviewCount: 0,
          averageScore: 0,
          reviews: [],
        };
      }

      grouped[agentType].reviewCount++;
      grouped[agentType].reviews.push({
        id: review.id,
        ideaId: review.ideaId,
        overallScore: review.overallScore,
        status: review.status,
      });
    }

    // Calculate average scores
    for (const agentType in grouped) {
      const agentReviews = grouped[agentType].reviews;
      const completedReviews = agentReviews.filter(
        (r: any) => r.status === "completed",
      );

      if (completedReviews.length > 0) {
        grouped[agentType].averageScore =
          completedReviews.reduce(
            (sum: number, r: any) => sum + r.overallScore,
            0,
          ) / completedReviews.length;
      }
    }

    return grouped;
  }

  async updateReviewStatus(reviewId: string, status: string): Promise<void> {
    await this.prisma.review.update({
      where: { id: reviewId },
      data: { status },
    });

    logger.info("Updated review status", { reviewId, status });
  }
}
