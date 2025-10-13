import { PrismaClient, Tournament, Review } from '@prisma/client';
import { AgentService } from './agent.service';
export declare class TournamentService {
    private prisma;
    private agentService;
    constructor(prisma: PrismaClient, agentService: AgentService);
    executeTournament(sessionId: string, reviews: Review[], apiKey: string): Promise<Tournament>;
    private selectAdvancingIdeas;
    private executeTournamentTurn;
    private selectTurnAgents;
    private executeAgentArgument;
    private parseArgumentResponse;
    private parseList;
    getTournamentBySession(sessionId: string): Promise<Tournament | null>;
    getTournamentById(tournamentId: string): Promise<Tournament | null>;
    getTournamentSummary(tournamentId: string): Promise<any>;
}
//# sourceMappingURL=tournament.service.d.ts.map