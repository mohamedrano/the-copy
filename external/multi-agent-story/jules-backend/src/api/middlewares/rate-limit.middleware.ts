import { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";
import { config } from "../../config";
import { logger } from "../../utils/logger";

export async function setupRateLimit(fastify: FastifyInstance): Promise<void> {
  try {
    await fastify.register(rateLimit, {
      max: config.rateLimitPerMinute,
      timeWindow: "1 minute",
      errorResponseBuilder: (request, context) => {
        return {
          error: "Too many requests",
          message: "تم تجاوز الحد المسموح من الطلبات",
          retryAfter: context.after,
          limit: context.max,
          ttl: context.ttl,
        };
      },
    });

    logger.info("Rate limiting configured", {
      maxRequests: config.rateLimitPerMinute,
      timeWindow: "1 minute",
    });
  } catch (error) {
    logger.error("Failed to setup rate limiting", { error });
    throw error;
  }
}

export async function setupStrictRateLimit(
  fastify: FastifyInstance,
  max: number,
  timeWindow: string,
): Promise<void> {
  await fastify.register(rateLimit, {
    max,
    timeWindow,
    errorResponseBuilder: (request, context) => {
      return {
        error: "Too many requests",
        message: `تم تجاوز الحد المسموح: ${max} طلبات كل ${timeWindow}`,
        retryAfter: context.after,
      };
    },
  });
}
