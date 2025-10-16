/**
 * Unit tests for Agents Facade
 */

import { describe, it, expect } from 'vitest';
import { 
  AGENT_CONFIGS, 
  AgentCategory, 
  getAgentsByCategory, 
  getAgentById,
  SimpleAgentExecutor 
} from '../../agents/core/index';

describe('Agents Facade', () => {
  describe('Agent Configuration', () => {
    it('should have all required agents', () => {
      expect(AGENT_CONFIGS).toBeDefined();
      expect(AGENT_CONFIGS.length).toBeGreaterThan(10);
    });

    it('should have valid agent structure', () => {
      const agent = AGENT_CONFIGS[0];
      expect(agent).toHaveProperty('id');
      expect(agent).toHaveProperty('name');
      expect(agent).toHaveProperty('description');
      expect(agent).toHaveProperty('category');
      expect(agent).toHaveProperty('capabilities');
    });

    it('should have Arabic names for agents', () => {
      const analysisAgent = getAgentById('analysis');
      expect(analysisAgent?.name).toContain('محلل');
    });
  });

  describe('Agent Categories', () => {
    it('should categorize agents correctly', () => {
      const analysisAgents = getAgentsByCategory(AgentCategory.ANALYSIS);
      const generationAgents = getAgentsByCategory(AgentCategory.GENERATION);
      
      expect(analysisAgents.length).toBeGreaterThan(0);
      expect(generationAgents.length).toBeGreaterThan(0);
    });

    it('should find agents by ID', () => {
      const agent = getAgentById('analysis');
      expect(agent).toBeDefined();
      expect(agent?.id).toBe('analysis');
    });

    it('should return undefined for non-existent agent', () => {
      const agent = getAgentById('non-existent');
      expect(agent).toBeUndefined();
    });
  });

  describe('Agent Executor', () => {
    it('should execute agent successfully', async () => {
      const executor = new SimpleAgentExecutor();
      const result = await executor.execute('analysis', 'نص تجريبي');
      
      expect(result).toHaveProperty('agentId', 'analysis');
      expect(result).toHaveProperty('input', 'نص تجريبي');
      expect(result).toHaveProperty('output');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('timestamp');
    });

    it('should throw error for non-existent agent', async () => {
      const executor = new SimpleAgentExecutor();
      
      await expect(executor.execute('non-existent', 'input'))
        .rejects.toThrow('Agent not found: non-existent');
    });
  });

  describe('Agent Capabilities', () => {
    it('should have required capabilities', () => {
      const agent = AGENT_CONFIGS[0];
      const caps = agent.capabilities;
      
      expect(caps).toHaveProperty('reasoningChains');
      expect(caps).toHaveProperty('toolUse');
      expect(caps).toHaveProperty('memorySystem');
      expect(caps).toHaveProperty('creativeGeneration');
    });

    it('should have model configuration', () => {
      const agent = AGENT_CONFIGS[0];
      
      expect(agent).toHaveProperty('modelConfig');
      expect(agent.modelConfig).toHaveProperty('temperature');
      expect(agent.modelConfig).toHaveProperty('maxTokens');
    });
  });
});