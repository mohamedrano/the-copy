import { FastifyRequest, FastifyReply } from "fastify";
import { ZodSchema, ZodError } from "zod";
import { logger } from "../../utils/logger";

export interface ValidationRequest extends FastifyRequest {
  validationError?: string;
}

export function validateBody(schema: ZodSchema) {
  return async (
    request: ValidationRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    try {
      schema.parse(request.body);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");

        logger.warn("Validation failed", {
          errors: error.errors,
          body: request.body,
        });

        reply.code(400).send({
          error: "Validation failed",
          details: errorMessage,
          errors: error.errors,
        });
        return;
      }

      logger.error("Validation error", { error });
      reply.code(400).send({ error: "Invalid request body" });
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return async (
    request: ValidationRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    try {
      schema.parse(request.query);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");

        logger.warn("Query validation failed", {
          errors: error.errors,
          query: request.query,
        });

        reply.code(400).send({
          error: "Invalid query parameters",
          details: errorMessage,
          errors: error.errors,
        });
        return;
      }

      logger.error("Query validation error", { error });
      reply.code(400).send({ error: "Invalid query parameters" });
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return async (
    request: ValidationRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    try {
      schema.parse(request.params);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");

        logger.warn("Params validation failed", {
          errors: error.errors,
          params: request.params,
        });

        reply.code(400).send({
          error: "Invalid URL parameters",
          details: errorMessage,
          errors: error.errors,
        });
        return;
      }

      logger.error("Params validation error", { error });
      reply.code(400).send({ error: "Invalid URL parameters" });
    }
  };
}
