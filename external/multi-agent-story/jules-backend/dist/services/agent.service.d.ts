import { PrismaClient, Agent } from '@prisma/client';
import { GeminiPool } from '../integrations/gemini/pool';
import { AgentExecutionResult } from '../types/agent.types';
export declare class AgentService {
    private prisma;
    private geminiPool;
    private agentGuides;
    constructor(prisma: PrismaClient, geminiPool: GeminiPool);
    private loadAgentGuides;
    createAgentTeam(sessionId: string, apiKey: string): Promise<Agent[]>;
    private createAgent;
    executeAgent(agentId: string, task: string, context: any, apiKey: string): Promise<AgentExecutionResult>;
    executeAgentTeam(sessionId: string, task: string, context: any, apiKey: string): Promise<AgentExecutionResult[]>;
    getAgentById(agentId: string): Promise<Agent | null>;
    getAgentsBySession(sessionId: string): Promise<Agent[]>;
    updateAgentStatus(agentId: string, status: 'active' | 'inactive'): Promise<void>;
    private getAgentName;
    private getAgentTemperature;
    private getAgentMaxTokens;
    testAgentConnection(agentId: string, apiKey: string): Promise<boolean>;
    getAgentStats(sessionId: string): Promise<any>;
}
//# sourceMappingURL=agent.service.d.ts.map