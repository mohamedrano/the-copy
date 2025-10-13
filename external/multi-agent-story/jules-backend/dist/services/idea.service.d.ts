import { PrismaClient, Idea } from '@prisma/client';
import { AgentService } from './agent.service';
import { CreativeBrief } from '../types/session.types';
export declare class IdeaService {
    private prisma;
    private agentService;
    constructor(prisma: PrismaClient, agentService: AgentService);
    generateIdeas(sessionId: string, creativeBrief: CreativeBrief, apiKey: string): Promise<Idea[]>;
    private parseGeneratedIdeas;
    private extractIdeaSections;
    private findNextMarker;
    private parseIdeaSection;
    private parseCharacters;
    private enhanceIdeasWithCharacterDevelopment;
    private parseCharacterEnhancements;
    getIdeasBySession(sessionId: string): Promise<Idea[]>;
    getIdeaById(ideaId: string): Promise<Idea | null>;
    updateIdeaStatus(ideaId: string, status: string): Promise<void>;
}
//# sourceMappingURL=idea.service.d.ts.map