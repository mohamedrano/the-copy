import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../app.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { logger } from "../../utils/logger.js";
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
  SessionError,
} from "../../utils/errors.js";

const createSessionSchema = z.object({
  title: z.string().min(1, "عنوان الجلسة مطلوب"),
  apiKeyId: z.string().uuid("معرف مفتاح API غير صالح"),
});

const updateSessionSchema = z.object({
  title: z.string().min(1, "عنوان الجلسة مطلوب").optional(),
  status: z
    .enum([
      "INITIALIZED",
      "BRIEF_SUBMITTED",
      "IDEAS_GENERATED",
      "REVIEWS_COMPLETED",
      "TOURNAMENT_STARTED",
      "TOURNAMENT_COMPLETED",
      "DECISION_MADE",
      "COMPLETED",
      "CANCELLED",
    ])
    .optional(),
  currentPhase: z
    .enum(["BRIEF", "IDEA_GENERATION", "REVIEW", "TOURNAMENT", "DECISION"])
    .optional(),
  progress: z.number().min(0).max(100).optional(),
});

const creativeBriefSchema = z.object({
  coreIdea: z.string().min(50, "الفكرة الأساسية يجب أن تكون 50 حرف على الأقل"),
  genre: z.string().min(3, "النوع الأدبي مطلوب"),
  targetAudience: z.string().optional(),
  themes: z.array(z.string()).optional(),
  additionalNotes: z.string().optional(),
});

export async function sessionRoutes(fastify: FastifyInstance) {
  /**
   * GET /sessions - Get user's sessions
   */
  fastify.get(
    "/",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const userId = (request as any).user.userId;

      try {
        const sessions = await prisma.session.findMany({
          where: { userId },
          include: {
            creativeBrief: true,
            _count: {
              select: {
                ideas: true,
                agents: true,
                reviews: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        return reply.send({
          success: true,
          data: { sessions },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error("Get sessions failed", {
          userId,
          error: error instanceof Error ? error.message : String(error),
        });

        throw new Error("فشل في جلب الجلسات");
      }
    },
  );

  /**
   * POST /sessions - Create new session
   */
  fastify.post(
    "/",
    {
      preHandler: [authenticate, validateRequest(createSessionSchema)],
    },
    async (request, reply) => {
      const { title, apiKeyId } = request.body as z.infer<
        typeof createSessionSchema
      >;
      const userId = (request as any).user.userId;

      try {
        // Verify API key belongs to user
        const apiKey = await prisma.apiKey.findFirst({
          where: {
            id: apiKeyId,
            userId,
            isActive: true,
          },
        });

        if (!apiKey) {
          throw new NotFoundError("مفتاح API غير موجود أو غير مفعل");
        }

        // Create session
        const session = await prisma.session.create({
          data: {
            title,
            userId,
            apiKeyId,
          },
          include: {
            creativeBrief: true,
            _count: {
              select: {
                ideas: true,
                agents: true,
                reviews: true,
              },
            },
          },
        });

        logger.info("Session created", {
          sessionId: session.id,
          userId,
          title,
        });

        return reply.status(201).send({
          success: true,
          data: { session },
          message: "تم إنشاء الجلسة بنجاح",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw error;
        }

        logger.error("Create session failed", {
          userId,
          title,
          apiKeyId,
          error: error instanceof Error ? error.message : String(error),
        });

        throw new Error("فشل في إنشاء الجلسة");
      }
    },
  );

  /**
   * GET /sessions/:id - Get session by ID
   */
  fastify.get(
    "/:id",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const userId = (request as any).user.userId;

      try {
        const session = await prisma.session.findFirst({
          where: {
            id,
            userId,
          },
          include: {
            creativeBrief: true,
            ideas: true,
            agents: true,
            reviews: true,
            tournaments: {
              include: {
                turns: true,
              },
            },
            finalDecision: true,
            _count: {
              select: {
                ideas: true,
                agents: true,
                reviews: true,
              },
            },
          },
        });

        if (!session) {
          throw new NotFoundError("الجلسة غير موجودة");
        }

        return reply.send({
          success: true,
          data: { session },
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw error;
        }

        logger.error("Get session failed", {
          sessionId: id,
          userId,
          error: error instanceof Error ? error.message : String(error),
        });

        throw new Error("فشل في جلب الجلسة");
      }
    },
  );

  /**
   * PUT /sessions/:id - Update session
   */
  fastify.put(
    "/:id",
    {
      preHandler: [authenticate, validateRequest(updateSessionSchema)],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const updateData = request.body as z.infer<typeof updateSessionSchema>;
      const userId = (request as any).user.userId;

      try {
        // Check if session exists and belongs to user
        const existingSession = await prisma.session.findFirst({
          where: {
            id,
            userId,
          },
        });

        if (!existingSession) {
          throw new NotFoundError("الجلسة غير موجودة");
        }

        // Update session
        const session = await prisma.session.update({
          where: { id },
          data: updateData,
          include: {
            creativeBrief: true,
            _count: {
              select: {
                ideas: true,
                agents: true,
                reviews: true,
              },
            },
          },
        });

        logger.info("Session updated", {
          sessionId: id,
          userId,
          updateData,
        });

        return reply.send({
          success: true,
          data: { session },
          message: "تم تحديث الجلسة بنجاح",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw error;
        }

        logger.error("Update session failed", {
          sessionId: id,
          userId,
          updateData,
          error: error instanceof Error ? error.message : String(error),
        });

        throw new Error("فشل في تحديث الجلسة");
      }
    },
  );

  /**
   * POST /sessions/:id/brief - Submit creative brief
   */
  fastify.post(
    "/:id/brief",
    {
      preHandler: [authenticate, validateRequest(creativeBriefSchema)],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const brief = request.body as z.infer<typeof creativeBriefSchema>;
      const userId = (request as any).user.userId;

      try {
        // Check if session exists and belongs to user
        const session = await prisma.session.findFirst({
          where: {
            id,
            userId,
          },
        });

        if (!session) {
          throw new NotFoundError("الجلسة غير موجودة");
        }

        // Check if brief already exists
        const existingBrief = await prisma.creativeBrief.findUnique({
          where: { sessionId: id },
        });

        if (existingBrief) {
          throw new ValidationError("الموجز الإبداعي موجود مسبقاً");
        }

        // Create or update brief
        const creativeBrief = await prisma.creativeBrief.create({
          data: {
            sessionId: id,
            ...brief,
          },
        });

        // Update session status
        await prisma.session.update({
          where: { id },
          data: {
            status: "BRIEF_SUBMITTED",
            currentPhase: "IDEA_GENERATION",
            progress: 20,
          },
        });

        logger.info("Creative brief submitted", {
          sessionId: id,
          userId,
        });

        return reply.send({
          success: true,
          data: { creativeBrief },
          message: "تم تقديم الموجز الإبداعي بنجاح",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        if (
          error instanceof NotFoundError ||
          error instanceof ValidationError
        ) {
          throw error;
        }

        logger.error("Submit brief failed", {
          sessionId: id,
          userId,
          error: error instanceof Error ? error.message : String(error),
        });

        throw new Error("فشل في تقديم الموجز الإبداعي");
      }
    },
  );

  /**
   * POST /sessions/:id/start - Start narrative development process
   */
  fastify.post(
    "/:id/start",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const userId = (request as any).user.userId;

      try {
        const session = await prisma.session.findFirst({
          where: {
            id,
            userId,
          },
          include: {
            creativeBrief: true,
            apiKey: true,
          },
        });

        if (!session) {
          throw new NotFoundError("الجلسة غير موجودة");
        }

        if (!session.creativeBrief) {
          throw new ValidationError("يجب تقديم الموجز الإبداعي أولاً");
        }

        // Get decrypted API key
        const { decryptApiKey } = await import("../../utils/encryption.js");
        const encryptionKey = process.env.ENCRYPTION_KEY;

        if (!encryptionKey) {
          throw new Error("مفتاح التشفير غير مُعرّف");
        }

        const apiKey = decryptApiKey(
          session.apiKey.encryptedKey,
          encryptionKey,
        );

        // TODO: Start orchestrator process
        // This will be implemented when we create the orchestrator service
        logger.info("Narrative development process started", {
          sessionId: id,
          userId,
        });

        return reply.send({
          success: true,
          message: "بدأت عملية التطوير السردي",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        if (
          error instanceof NotFoundError ||
          error instanceof ValidationError
        ) {
          throw error;
        }

        logger.error("Start process failed", {
          sessionId: id,
          userId,
          error: error instanceof Error ? error.message : String(error),
        });

        throw new Error("فشل في بدء العملية");
      }
    },
  );

  /**
   * DELETE /sessions/:id - Delete session
   */
  fastify.delete(
    "/:id",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const userId = (request as any).user.userId;

      try {
        // Check if session exists and belongs to user
        const session = await prisma.session.findFirst({
          where: {
            id,
            userId,
          },
        });

        if (!session) {
          throw new NotFoundError("الجلسة غير موجودة");
        }

        // Delete session (cascade will handle related records)
        await prisma.session.delete({
          where: { id },
        });

        logger.info("Session deleted", {
          sessionId: id,
          userId,
        });

        return reply.send({
          success: true,
          message: "تم حذف الجلسة بنجاح",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw error;
        }

        logger.error("Delete session failed", {
          sessionId: id,
          userId,
          error: error instanceof Error ? error.message : String(error),
        });

        throw new Error("فشل في حذف الجلسة");
      }
    },
  );
}
