import { FastifyError, FastifyRequest, FastifyReply } from "fastify";
import { logger } from "../../utils/logger";

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  // Log the error
  logger.error("Request error", {
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    statusCode: error.statusCode,
  });

  // Handle different error types
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : error.message;

  reply.status(statusCode).send({
    error: error.name || "Error",
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  });
}

export function setupErrorHandler(fastify: any): void {
  fastify.setErrorHandler(errorHandler);
}
