import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth.routes";
import { agentRoutes } from "./agent.routes";
import { ideaRoutes } from "./idea.routes";
import { reviewRoutes } from "./review.routes";
import { tournamentRoutes } from "./tournament.routes";
import { decisionRoutes } from "./decision.routes";
import { logger } from "../../utils/logger";

export async function registerRoutes(
  fastify: FastifyInstance,
  services: {
    apiKeyService: any;
    agentService: any;
    ideaService: any;
    reviewService: any;
    tournamentService: any;
    decisionService: any;
  },
) {
  try {
    // Auth routes
    await fastify.register(authRoutes, {
      prefix: "/api/v1/auth",
      ...services,
    });

    // Agent routes
    await fastify.register(agentRoutes, {
      prefix: "/api/v1",
      ...services,
    });

    // Idea routes
    await fastify.register(ideaRoutes, {
      prefix: "/api/v1",
      ...services,
    });

    // Review routes
    await fastify.register(reviewRoutes, {
      prefix: "/api/v1",
      ...services,
    });

    // Tournament routes
    await fastify.register(tournamentRoutes, {
      prefix: "/api/v1",
      ...services,
    });

    // Decision routes
    await fastify.register(decisionRoutes, {
      prefix: "/api/v1",
      ...services,
    });

    logger.info("All routes registered successfully");
  } catch (error) {
    logger.error("Failed to register routes", { error });
    throw error;
  }
}
