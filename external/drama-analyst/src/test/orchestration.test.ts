import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskType } from '@core/enums';

// Mock the orchestration module
vi.mock('@orchestration/orchestration', () => ({
  aiAgentOrchestra: {
    getAgentConfig: vi.fn(),
    executeTask: vi.fn(),
    getPerformanceMetrics: vi.fn(() => ({
      successRate: 0.95,
      averageExecutionTime: 1500,
      resourceUsage: 0.7
    }))
  }
}));

import { aiAgentOrchestra } from '@orchestration/orchestration';

describe('Orchestration System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have performance metrics', () => {
    const metrics = aiAgentOrchestra.getPerformanceMetrics(TaskType.ANALYSIS);
    expect(metrics).toBeDefined();
    expect(metrics.successRate).toBeGreaterThan(0);
    expect(metrics.averageExecutionTime).toBeGreaterThan(0);
    expect(metrics.resourceUsage).toBeGreaterThanOrEqual(0);
  });

  it('should handle agent execution', async () => {
    const mockResult = { success: true, data: 'test result' };
    (aiAgentOrchestra.executeTask as any).mockResolvedValue(mockResult);

    const result = await aiAgentOrchestra.executeTask(TaskType.ANALYSIS, [], {});
    expect(result).toEqual(mockResult);
  });
});
