import { PrismaClient } from "@prisma/client";
import {
  CreateSessionInput,
  SessionStatus,
  SessionPhase,
} from "@/types/session.types";
import { logger } from "@/utils/logger";

export class SessionService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createSession(userId: string, brief: CreateSessionInput) {
    try {
      const session = await this.prisma.session.create({
        data: {
          userId,
          status: SessionStatus.INITIALIZING,
          currentPhase: SessionPhase.BRIEF,
          creativeBrief: {
            create: {
              coreIdea: brief.coreIdea,
              genre: brief.genre,
              targetAudience: brief.targetAudience,
              themes: brief.themes,
            },
          },
        },
        include: {
          creativeBrief: true,
        },
      });

      logger.info("Session created", { sessionId: session.id, userId });
      return session;
    } catch (error) {
      logger.error("Failed to create session", { error, userId });
      throw error;
    }
  }

  async getSessionById(sessionId: string, userId: string) {
    try {
      const session = await this.prisma.session.findFirst({
        where: {
          id: sessionId,
          userId,
        },
        include: {
          creativeBrief: true,
          agents: true,
          ideas: true,
          reviews: true,
          tournament: true,
          finalDecision: true,
        },
      });

      if (!session) {
        throw new Error("Session not found");
      }

      return session;
    } catch (error) {
      logger.error("Failed to get session", { error, sessionId, userId });
      throw error;
    }
  }

  async getUserSessions(userId: string) {
    try {
      const sessions = await this.prisma.session.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          creativeBrief: true,
        },
      });

      return sessions;
    } catch (error) {
      logger.error("Failed to get user sessions", { error, userId });
      throw error;
    }
  }

  async updateSessionStatus(sessionId: string, status: SessionStatus) {
    try {
      const session = await this.prisma.session.update({
        where: { id: sessionId },
        data: { status },
      });

      logger.info("Session status updated", { sessionId, status });
      return session;
    } catch (error) {
      logger.error("Failed to update session status", {
        error,
        sessionId,
        status,
      });
      throw error;
    }
  }

  async updateSessionPhase(sessionId: string, phase: SessionPhase) {
    try {
      const session = await this.prisma.session.update({
        where: { id: sessionId },
        data: { currentPhase: phase },
      });

      logger.info("Session phase updated", { sessionId, phase });
      return session;
    } catch (error) {
      logger.error("Failed to update session phase", {
        error,
        sessionId,
        phase,
      });
      throw error;
    }
  }

  async deleteSession(sessionId: string, userId: string) {
    try {
      await this.prisma.session.deleteMany({
        where: {
          id: sessionId,
          userId,
        },
      });

      logger.info("Session deleted", { sessionId, userId });
    } catch (error) {
      logger.error("Failed to delete session", { error, sessionId, userId });
      throw error;
    }
  }
}
