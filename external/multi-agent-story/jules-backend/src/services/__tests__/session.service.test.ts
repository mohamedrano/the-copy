import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { SessionService } from "../session.service";

describe("SessionService", () => {
  let prisma: PrismaClient;
  let sessionService: SessionService;
  let testSessionId: string;

  beforeEach(async () => {
    prisma = new PrismaClient();
    sessionService = new SessionService(prisma);

    // Create test session
    const session = await prisma.session.create({
      data: {
        userId: "test-user-id",
        status: "initializing",
        currentPhase: "brief",
      },
    });
    testSessionId = session.id;
  });

  afterEach(async () => {
    // Cleanup
    if (testSessionId) {
      await prisma.session.delete({ where: { id: testSessionId } });
    }
    await prisma.$disconnect();
  });

  describe("createSession", () => {
    it("should create a new session", async () => {
      const session = await sessionService.createSession("test-user-id-2");

      expect(session).toHaveProperty("id");
      expect(session.userId).toBe("test-user-id-2");
      expect(session.status).toBe("initializing");
      expect(session.currentPhase).toBe("brief");

      // Cleanup
      await prisma.session.delete({ where: { id: session.id } });
    });
  });

  describe("getSessionById", () => {
    it("should return a session by id", async () => {
      const session = await sessionService.getSessionById(testSessionId);

      expect(session).toBeDefined();
      expect(session?.id).toBe(testSessionId);
      expect(session?.userId).toBe("test-user-id");
    });

    it("should return null for non-existent session", async () => {
      const session = await sessionService.getSessionById("non-existent-id");

      expect(session).toBeNull();
    });
  });

  describe("updateSessionStatus", () => {
    it("should update session status", async () => {
      const updatedSession = await sessionService.updateSessionStatus(
        testSessionId,
        "active",
      );

      expect(updatedSession).toBeDefined();
      expect(updatedSession?.status).toBe("active");
    });
  });

  describe("updateSessionPhase", () => {
    it("should update session phase", async () => {
      const updatedSession = await sessionService.updateSessionPhase(
        testSessionId,
        "character_development",
      );

      expect(updatedSession).toBeDefined();
      expect(updatedSession?.currentPhase).toBe("character_development");
    });
  });

  describe("getUserSessions", () => {
    it("should return sessions for a user", async () => {
      // Create another session for the same user
      await prisma.session.create({
        data: {
          userId: "test-user-id",
          status: "active",
          currentPhase: "character_development",
        },
      });

      const sessions = await sessionService.getUserSessions("test-user-id");

      expect(sessions).toHaveLength(2);
      expect(sessions[0].userId).toBe("test-user-id");
      expect(sessions[1].userId).toBe("test-user-id");
    });
  });
});
