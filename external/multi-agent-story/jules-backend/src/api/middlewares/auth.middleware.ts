import { FastifyRequest, FastifyReply } from "fastify";
import { logger } from "../../utils/logger";

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export async function authMiddleware(
  request: AuthenticatedRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    // Skip authentication for public routes
    const publicRoutes = [
      "/health",
      "/api/v1/auth/login",
      "/api/v1/auth/register",
    ];

    if (publicRoutes.includes(request.url)) {
      return;
    }

    // Extract token from Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      reply.code(401).send({ error: "Authorization header required" });
      return;
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const payload = request.server.jwt.verify(token) as any;

    if (payload.type !== "access") {
      reply.code(401).send({ error: "Invalid token type" });
      return;
    }

    // Attach user info to request
    request.user = {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
    };

    logger.debug("User authenticated", { userId: payload.userId });
  } catch (error) {
    logger.error("Authentication failed", { error });
    reply.code(401).send({ error: "Invalid token" });
  }
}
