import { describe, it, expect, vi } from 'vitest';
import { loadAgentConfig, getAllAgentConfigs } from '@agents/index';
import { TaskType } from '@core/enums';

// Mock dynamic imports
vi.mock('@agents/analysis/agent', () => ({
  ANALYSIS_AGENT_CONFIG: {
    id: TaskType.ANALYSIS,
    name: 'Analysis Agent',
    description: 'Test analysis agent'
  }
}));

describe('Agent Loading', () => {
  it('should load analysis agent config', async () => {
    const config = await loadAgentConfig(TaskType.ANALYSIS);
    expect(config).toBeDefined();
    expect(config.id).toBe(TaskType.ANALYSIS);
    expect(config.name).toBe('Analysis Agent');
  });

  it('should handle unknown task type', async () => {
    await expect(loadAgentConfig('UNKNOWN' as TaskType))
      .rejects.toThrow('Unknown task type: UNKNOWN');
  });

  it('should load all agent configs', async () => {
    const configs = await getAllAgentConfigs();
    expect(configs).toBeInstanceOf(Array);
    expect(configs.length).toBeGreaterThan(0);
  });
});

