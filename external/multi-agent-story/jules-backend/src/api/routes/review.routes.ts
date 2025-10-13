import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { ReviewService } from "../../services/review.service";
import { logger } from "../../utils/logger";

export async function reviewRoutes(
  fastify: FastifyInstance,
  options: { reviewService: ReviewService },
) {
  const { reviewService } = options;

  // Get reviews for a session
  fastify.get(
    "/sessions/:sessionId/reviews",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = (request as any).user?.id;
        const { sessionId } = request.params as { sessionId: string };

        if (!userId) {
          return reply.status(401).send({ error: "Unauthorized" });
        }

        const reviews = await reviewService.getReviewsBySession(sessionId);

        reply.send({ reviews });
      } catch (error) {
        logger.error("Failed to get reviews", { error });
        reply.status(500).send({ error: "Failed to get reviews" });
      }
    },
  );

  // Get reviews for an idea
  fastify.get(
    "/ideas/:ideaId/reviews",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = (request as any).user?.id;
        const { ideaId } = request.params as { ideaId: string };

        if (!userId) {
          return reply.status(401).send({ error: "Unauthorized" });
        }

        const reviews = await reviewService.getReviewsByIdea(ideaId);

        reply.send({ reviews });
      } catch (error) {
        logger.error("Failed to get idea reviews", { error });
        reply.status(500).send({ error: "Failed to get idea reviews" });
      }
    },
  );

  // Get review summary for session
  fastify.get(
    "/sessions/:sessionId/reviews/summary",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = (request as any).user?.id;
        const { sessionId } = request.params as { sessionId: string };

        if (!userId) {
          return reply.status(401).send({ error: "Unauthorized" });
        }

        const summary = await reviewService.getReviewSummary(sessionId);

        reply.send({ summary });
      } catch (error) {
        logger.error("Failed to get review summary", { error });
        reply.status(500).send({ error: "Failed to get review summary" });
      }
    },
  );
}
