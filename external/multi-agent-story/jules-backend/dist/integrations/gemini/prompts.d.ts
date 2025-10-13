import { AgentType } from '../../types/agent.types';
import { CreativeBrief } from '../../types/session.types';
export declare class PromptBuilder {
    static buildAgentPrompt(agentType: AgentType, guideContent: string, context: {
        creativeBrief?: CreativeBrief;
        idea?: any;
        sessionData?: any;
        phase?: string;
    }): string;
    private static getBasePrompt;
    private static buildContextPrompt;
    private static getTaskPrompt;
    private static getAgentName;
    static buildIdeaGenerationPrompt(creativeBrief: CreativeBrief): string;
    static buildReviewPrompt(agentType: AgentType, idea: any, guideContent: string): string;
    static buildTournamentPrompt(agentType: AgentType, idea: any, previousArguments: any[], guideContent: string): string;
}
//# sourceMappingURL=prompts.d.ts.map