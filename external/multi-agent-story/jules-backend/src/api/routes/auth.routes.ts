import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { ApiKeyService } from "../../services/api-key.service";
import { logger } from "../../utils/logger";
import { hashPassword, verifyPassword } from "../../utils/encryption";
import { generateTokens, verifyToken } from "../../utils/jwt";

// Schemas
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const ApiKeySchema = z.object({
  apiKey: z.string().min(1),
  keyName: z.string().min(1).max(100),
});

export async function authRoutes(
  fastify: FastifyInstance,
  apiKeyService: ApiKeyService,
) {

  // Register user
  fastify.post(
    "/register",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password", "name"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            name: { type: "string", minLength: 2, maxLength: 100 },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { email, password, name } = request.body as z.infer<
          typeof RegisterSchema
        >;

        // Check if user already exists
        const existingUser = await fastify.prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          return reply.status(400).send({ error: "User already exists" });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await fastify.prisma.user.create({
          data: {
            email,
            hashedPassword,
            name,
          },
        });

        // Generate tokens
        const tokens = generateTokens(user.id);

        logger.info("User registered", { userId: user.id, email });

        reply.status(201).send({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt.toISOString(),
          },
          tokens,
        });
      } catch (error) {
        logger.error("Registration failed", { error });
        reply.status(500).send({ error: "Registration failed" });
      }
    },
  );

  // Login user
  fastify.post(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 1 },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { email, password } = request.body as z.infer<typeof LoginSchema>;

        // Find user
        const user = await fastify.prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return reply.status(401).send({ error: "Invalid credentials" });
        }

        // Verify password
        const isValidPassword = await verifyPassword(
          password,
          user.hashedPassword,
        );
        if (!isValidPassword) {
          return reply.status(401).send({ error: "Invalid credentials" });
        }

        // Generate tokens
        const tokens = generateTokens(user.id);

        logger.info("User logged in", { userId: user.id, email });

        reply.send({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          tokens,
        });
      } catch (error) {
        logger.error("Login failed", { error });
        reply.status(500).send({ error: "Login failed" });
      }
    },
  );

  // Add API key
  fastify.post(
    "/api-keys",
    {
      schema: {
        body: {
          type: "object",
          required: ["apiKey", "keyName"],
          properties: {
            apiKey: { type: "string", minLength: 1 },
            keyName: { type: "string", minLength: 1, maxLength: 100 },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = (request as any).user?.id;
        const { apiKey, keyName } = request.body as z.infer<
          typeof ApiKeySchema
        >;

        if (!userId) {
          return reply.status(401).send({ error: "Unauthorized" });
        }

        const savedApiKey = await apiKeyService.createApiKey(
          userId,
          apiKey,
          keyName,
        );

        logger.info("API key added", { userId, keyName });

        reply.status(201).send({
          apiKey: {
            id: savedApiKey.id,
            keyName: savedApiKey.keyName,
            createdAt: savedApiKey.createdAt.toISOString(),
          },
        });
      } catch (error) {
        logger.error("Failed to add API key", { error });
        reply.status(500).send({ error: "Failed to add API key" });
      }
    },
  );

  // Get user API keys
  fastify.get("/api-keys", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user?.id;

      if (!userId) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const apiKeys = await apiKeyService.getUserApiKeys(userId);

      reply.send({ apiKeys });
    } catch (error) {
      logger.error("Failed to get API keys", { error });
      reply.status(500).send({ error: "Failed to get API keys" });
    }
  });

  // Delete API key
  fastify.delete(
    "/api-keys/:keyId",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = (request as any).user?.id;
        const { keyId } = request.params as { keyId: string };

        if (!userId) {
          return reply.status(401).send({ error: "Unauthorized" });
        }

        await apiKeyService.deleteApiKey(keyId, userId);

        logger.info("API key deleted", { userId, keyId });

        reply.send({ message: "API key deleted successfully" });
      } catch (error) {
        logger.error("Failed to delete API key", { error });
        reply.status(500).send({ error: "Failed to delete API key" });
      }
    },
  );

  // Refresh token
  fastify.post(
    "/refresh",
    {
      schema: {
        body: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: { type: "string" },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { refreshToken } = request.body as { refreshToken: string };

        // Verify refresh token
        const payload = verifyToken(refreshToken);

        if (payload.type !== "refresh") {
          return reply.status(401).send({ error: "Invalid token type" });
        }

        // Generate new tokens
        const tokens = generateTokens(payload.userId);

        reply.send({ tokens });
      } catch (error) {
        logger.error("Token refresh failed", { error });
        reply.status(401).send({ error: "Invalid refresh token" });
      }
    },
  );
}
