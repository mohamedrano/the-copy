import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { DecisionService } from "../../services/decision.service";
import { logger } from "../../utils/logger";

export async function decisionRoutes(
  fastify: FastifyInstance,
  options: { decisionService: DecisionService },
) {
  const { decisionService } = options;

  // Get final decision for a session
  fastify.get(
    "/sessions/:sessionId/decision",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = (request as any).user?.id;
        const { sessionId } = request.params as { sessionId: string };

        if (!userId) {
          return reply.status(401).send({ error: "Unauthorized" });
        }

        const decision =
          await decisionService.getFinalDecisionBySession(sessionId);

        if (!decision) {
          return reply.status(404).send({ error: "Final decision not found" });
        }

        reply.send({ decision });
      } catch (error) {
        logger.error("Failed to get final decision", { error });
        reply.status(500).send({ error: "Failed to get final decision" });
      }
    },
  );

  // Get decision by ID
  fastify.get(
    "/decisions/:decisionId",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = (request as any).user?.id;
        const { decisionId } = request.params as { decisionId: string };

        if (!userId) {
          return reply.status(401).send({ error: "Unauthorized" });
        }

        const decision = await decisionService.getFinalDecisionById(decisionId);

        if (!decision) {
          return reply.status(404).send({ error: "Decision not found" });
        }

        reply.send({ decision });
      } catch (error) {
        logger.error("Failed to get decision", { error });
        reply.status(500).send({ error: "Failed to get decision" });
      }
    },
  );

  // Get decision summary
  fastify.get(
    "/decisions/:decisionId/summary",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = (request as any).user?.id;
        const { decisionId } = request.params as { decisionId: string };

        if (!userId) {
          return reply.status(401).send({ error: "Unauthorized" });
        }

        const summary = await decisionService.getDecisionSummary(decisionId);

        if (!summary) {
          return reply.status(404).send({ error: "Decision not found" });
        }

        reply.send({ summary });
      } catch (error) {
        logger.error("Failed to get decision summary", { error });
        reply.status(500).send({ error: "Failed to get decision summary" });
      }
    },
  );
}
