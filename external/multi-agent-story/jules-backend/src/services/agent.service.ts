import { PrismaClient, Agent, AgentType } from "@prisma/client";
import { GeminiPool } from "../integrations/gemini/pool";
import { PromptBuilder } from "../integrations/gemini/prompts";
import { logger } from "../utils/logger";
import { AgentExecutionResult } from "../types/agent.types";
import * as fs from "fs";
import * as path from "path";

export class AgentService {
  private prisma: PrismaClient;
  private geminiPool: GeminiPool;
  private agentGuides: Map<AgentType, string> = new Map();

  constructor(prisma: PrismaClient, geminiPool: GeminiPool) {
    this.prisma = prisma;
    this.geminiPool = geminiPool;
    this.loadAgentGuides();
  }

  private loadAgentGuides(): void {
    const guideDirectory = path.join(process.cwd(), "agent-guides");
    const guideFiles = {
      story_architect: "story_architect_guide.md",
      realism_critic: "realism_critic_guide.md",
      strategic_analyst: "strategic_analyst_guide.md",
      character_development: "character_development_guide.md",
      character_expansion: "character_expansion_guide.md",
      world_building: "world_building_guide.md",
      dialogue_voice: "dialogue_voice_guide.md",
      theme_agent: "theme_agent_guide.md",
      genre_tone: "genre_tone_guide.md",
      pacing_agent: "pacing_agent_guide.md",
      conflict_tension: "conflict_tension_guide.md",
    };

    for (const [agentType, filename] of Object.entries(guideFiles)) {
      try {
        const filePath = path.join(guideDirectory, filename);
        const content = fs.readFileSync(filePath, "utf-8");
        this.agentGuides.set(agentType as AgentType, content);
        logger.info(`Loaded agent guide for ${agentType}`);
      } catch (error) {
        logger.error(`Failed to load agent guide for ${agentType}`, { error });
      }
    }
  }

  async createAgentTeam(sessionId: string, apiKey: string): Promise<Agent[]> {
    try {
      logger.info("Creating agent team for session", { sessionId });

      const agents: Agent[] = [];
      const agentTypes: AgentType[] = [
        "story_architect",
        "realism_critic",
        "strategic_analyst",
        "character_development",
        "character_expansion",
        "world_building",
        "dialogue_voice",
        "theme_agent",
        "genre_tone",
        "pacing_agent",
        "conflict_tension",
      ];

      for (const agentType of agentTypes) {
        const agent = await this.createAgent(sessionId, agentType, apiKey);
        agents.push(agent);
      }

      logger.info("Agent team created successfully", {
        sessionId,
        agentCount: agents.length,
      });

      return agents;
    } catch (error) {
      logger.error("Failed to create agent team", { error, sessionId });
      throw error;
    }
  }

  private async createAgent(
    sessionId: string,
    agentType: AgentType,
    apiKey: string,
  ): Promise<Agent> {
    const guideContent = this.agentGuides.get(agentType) || "";

    const agent = await this.prisma.agent.create({
      data: {
        sessionId,
        agentType,
        agentName: this.getAgentName(agentType),
        status: "active",
        configuration: {
          model: "gemini-2.0-flash-exp",
          temperature: this.getAgentTemperature(agentType),
          maxTokens: this.getAgentMaxTokens(agentType),
          guideContent,
        },
        isActive: true,
        lastUsedAt: new Date(),
      },
    });

    logger.info("Created agent", {
      agentId: agent.id,
      agentType,
      sessionId,
    });

    return agent;
  }

  async executeAgent(
    agentId: string,
    task: string,
    context: any,
    apiKey: string,
  ): Promise<AgentExecutionResult> {
    try {
      const agent = await this.prisma.agent.findUnique({
        where: { id: agentId },
      });

      if (!agent) {
        throw new Error(`Agent not found: ${agentId}`);
      }

      if (!agent.isActive) {
        throw new Error(`Agent is not active: ${agentId}`);
      }

      const geminiClient = await this.geminiPool.getClient(apiKey);
      const guideContent = agent.configuration.guideContent || "";

      const prompt = PromptBuilder.buildAgentPrompt(
        agent.agentType,
        guideContent,
        context,
      );

      logger.info("Executing agent task", {
        agentId,
        agentType: agent.agentType,
        taskType: task,
        promptLength: prompt.length,
      });

      const startTime = Date.now();
      const response = await geminiClient.generate(prompt, {
        temperature: agent.configuration.temperature,
        maxTokens: agent.configuration.maxTokens,
      });

      const duration = Date.now() - startTime;

      // Update agent usage
      await this.prisma.agent.update({
        where: { id: agentId },
        data: {
          lastUsedAt: new Date(),
          usageCount: {
            increment: 1,
          },
        },
      });

      const result: AgentExecutionResult = {
        agentId,
        agentType: agent.agentType,
        agentName: agent.agentName,
        response: response.text,
        tokensUsed: response.tokensUsed,
        duration,
        success: true,
        timestamp: new Date(),
      };

      logger.info("Agent execution completed", {
        agentId,
        duration,
        tokensUsed: response.tokensUsed,
      });

      return result;
    } catch (error) {
      logger.error("Agent execution failed", {
        agentId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return {
        agentId,
        agentType: "story_architect",
        agentName: "Unknown",
        response: "",
        tokensUsed: 0,
        duration: 0,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      };
    }
  }

  async executeAgentTeam(
    sessionId: string,
    task: string,
    context: any,
    apiKey: string,
  ): Promise<AgentExecutionResult[]> {
    try {
      const agents = await this.prisma.agent.findMany({
        where: {
          sessionId,
          isActive: true,
        },
      });

      logger.info("Executing agent team", {
        sessionId,
        task,
        agentCount: agents.length,
      });

      const results: AgentExecutionResult[] = [];

      // Execute agents in parallel for better performance
      const promises = agents.map((agent) =>
        this.executeAgent(agent.id, task, context, apiKey),
      );

      const executionResults = await Promise.allSettled(promises);

      for (const result of executionResults) {
        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          logger.error("Agent execution failed", {
            error: result.reason,
          });
          results.push({
            agentId: "unknown",
            agentType: "story_architect",
            agentName: "Unknown",
            response: "",
            tokensUsed: 0,
            duration: 0,
            success: false,
            error: result.reason,
            timestamp: new Date(),
          });
        }
      }

      logger.info("Agent team execution completed", {
        sessionId,
        successCount: results.filter((r) => r.success).length,
        totalCount: results.length,
      });

      return results;
    } catch (error) {
      logger.error("Agent team execution failed", { error, sessionId });
      throw error;
    }
  }

  async getAgentById(agentId: string): Promise<Agent | null> {
    return await this.prisma.agent.findUnique({
      where: { id: agentId },
    });
  }

  async getAgentsBySession(sessionId: string): Promise<Agent[]> {
    return await this.prisma.agent.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });
  }

  async updateAgentStatus(
    agentId: string,
    status: "active" | "inactive",
  ): Promise<void> {
    await this.prisma.agent.update({
      where: { id: agentId },
      data: {
        isActive: status === "active",
        status,
      },
    });

    logger.info("Updated agent status", { agentId, status });
  }

  private getAgentName(agentType: AgentType): string {
    const names = {
      story_architect: "مهندس القصة",
      realism_critic: "ناقد الواقعية",
      strategic_analyst: "المحلل الاستراتيجي",
      character_development: "مطور الشخصيات",
      character_expansion: "موسع الشخصيات",
      world_building: "باني العالم",
      dialogue_voice: "خبير الحوار",
      theme_agent: "وكيل الموضوعات",
      genre_tone: "خبير النوع والأسلوب",
      pacing_agent: "وكيل الإيقاع",
      conflict_tension: "وكيل الصراع والتوتر",
    };

    return names[agentType] || agentType;
  }

  private getAgentTemperature(agentType: AgentType): number {
    const temperatures = {
      story_architect: 0.8,
      realism_critic: 0.6,
      strategic_analyst: 0.7,
      character_development: 0.8,
      character_expansion: 0.8,
      world_building: 0.9,
      dialogue_voice: 0.8,
      theme_agent: 0.7,
      genre_tone: 0.8,
      pacing_agent: 0.7,
      conflict_tension: 0.8,
    };

    return temperatures[agentType] || 0.7;
  }

  private getAgentMaxTokens(agentType: AgentType): number {
    const tokenLimits = {
      story_architect: 40000,
      realism_critic: 35000,
      strategic_analyst: 35000,
      character_development: 40000,
      character_expansion: 40000,
      world_building: 45000,
      dialogue_voice: 35000,
      theme_agent: 35000,
      genre_tone: 35000,
      pacing_agent: 30000,
      conflict_tension: 35000,
    };

    return tokenLimits[agentType] || 35000;
  }

  async testAgentConnection(agentId: string, apiKey: string): Promise<boolean> {
    try {
      const agent = await this.getAgentById(agentId);
      if (!agent) {
        return false;
      }

      const geminiClient = await this.geminiPool.getClient(apiKey);
      return await geminiClient.testConnection();
    } catch (error) {
      logger.error("Agent connection test failed", { agentId, error });
      return false;
    }
  }

  async getAgentStats(sessionId: string): Promise<any> {
    const agents = await this.getAgentsBySession(sessionId);

    return {
      totalAgents: agents.length,
      activeAgents: agents.filter((a) => a.isActive).length,
      totalUsage: agents.reduce((sum, a) => sum + a.usageCount, 0),
      lastUsed: agents.reduce(
        (latest, a) => (a.lastUsedAt > latest ? a.lastUsedAt : latest),
        new Date(0),
      ),
    };
  }
}
