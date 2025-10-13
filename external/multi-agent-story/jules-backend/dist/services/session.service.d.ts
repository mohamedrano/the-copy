import { PrismaClient } from '@prisma/client';
import { CreateSessionInput, SessionStatus, SessionPhase } from '@/types/session.types';
export declare class SessionService {
    private prisma;
    constructor(prisma: PrismaClient);
    createSession(userId: string, brief: CreateSessionInput): Promise<{
        creativeBrief: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sessionId: string;
            themes: string[];
            genre: string;
            targetAudience: string;
            coreIdea: string;
        } | null;
    } & {
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currentPhase: string;
        progress: number;
    }>;
    getSessionById(sessionId: string, userId: string): Promise<{
        tournament: {
            status: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sessionId: string;
            totalTurns: number;
            currentTurn: number;
        } | null;
        reviews: {
            id: string;
            createdAt: Date;
            sessionId: string;
            agentId: string;
            ideaId: string;
            qualityScore: number;
            noveltyScore: number;
            impactScore: number;
            reasoning: string;
            suggestions: string[];
        }[];
        creativeBrief: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sessionId: string;
            themes: string[];
            genre: string;
            targetAudience: string;
            coreIdea: string;
        } | null;
        agents: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            agentType: string;
            sessionId: string;
            agentName: string;
        }[];
        ideas: {
            status: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sessionId: string;
            ideaNumber: number;
            title: string;
            logline: string;
            synopsis: string;
            threeActStructure: import("@prisma/client/runtime/library").JsonValue;
            characters: import("@prisma/client/runtime/library").JsonValue;
            keyScenes: import("@prisma/client/runtime/library").JsonValue;
            themes: string[];
            genre: string;
            tone: string;
            targetAudience: string;
        }[];
        finalDecision: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sessionId: string;
            recommendations: string[];
            winningIdeaId: string;
            decisionRationale: string;
            keyStrengths: string[];
            voteBreakdown: import("@prisma/client/runtime/library").JsonValue;
        } | null;
    } & {
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currentPhase: string;
        progress: number;
    }>;
    getUserSessions(userId: string): Promise<({
        creativeBrief: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sessionId: string;
            themes: string[];
            genre: string;
            targetAudience: string;
            coreIdea: string;
        } | null;
    } & {
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currentPhase: string;
        progress: number;
    })[]>;
    updateSessionStatus(sessionId: string, status: SessionStatus): Promise<{
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currentPhase: string;
        progress: number;
    }>;
    updateSessionPhase(sessionId: string, phase: SessionPhase): Promise<{
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currentPhase: string;
        progress: number;
    }>;
    deleteSession(sessionId: string, userId: string): Promise<void>;
}
//# sourceMappingURL=session.service.d.ts.map