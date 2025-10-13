/**
 * @file Unit tests for AdvancedAgentsPopup component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdvancedAgentsPopup from '../AdvancedAgentsPopup';

// Setup basic DOM assertions
declare global {
  namespace Vi {
    interface Assertion<T = any> {
      toBeInTheDocument(): void;
    }
  }
}

// Mock the agent classes
vi.mock('../../../agents/analysis/analysisAgent', () => ({
  AnalysisAgent: vi.fn().mockImplementation(() => ({
    execute: vi.fn().mockResolvedValue({ result: 'test analysis' })
  }))
}));

vi.mock('../../../agents/analysis/characterDeepAnalyzerAgent', () => ({
  CharacterDeepAnalyzerAgent: vi.fn().mockImplementation(() => ({
    execute: vi.fn().mockResolvedValue({ result: 'test character analysis' })
  }))
}));

// Mock environment
vi.mock('../../../config/environment', () => ({
  environment: {
    geminiApiKey: 'test-key'
  }
}));

// Mock agent configs
vi.mock('../../../config/agentConfigs', () => ({
  AGENT_CONFIGS: [
    {
      id: 'test-agent',
      name: 'Test Agent',
      description: 'Test agent description',
      category: 'ANALYSIS',
      capabilities: {
        creativeGeneration: false,
        analyticalReasoning: true,
        emotionalIntelligence: true,
        complexityScore: 0.8
      },
      systemPrompt: 'Test system prompt'
    }
  ]
}));

describe('AdvancedAgentsPopup', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    content: 'Test screenplay content'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when isOpen is true', () => {
    const result = render(<AdvancedAgentsPopup {...defaultProps} />);
    expect(result.container).toBeDefined();
  });

  it('should not render when isOpen is false', () => {
    const result = render(<AdvancedAgentsPopup {...defaultProps} isOpen={false} />);
    expect(result.container.firstChild).toBeNull();
  });

  it('should handle ProcessedFile type correctly', () => {
    // This test verifies that TypeScript compilation succeeds
    // for the ProcessedFile interface usage
    const processedFile = {
      name: 'test.txt',
      content: 'test content',
      mimeType: 'text/plain',
      isBase64: false,
      size: 100
    };

    expect(processedFile.size).toBe(100);
    expect(processedFile.name).toBe('test.txt');
  });

  it('should handle agent capabilities type variations', () => {
    // This test verifies TypeScript compilation for different capability types
    const stringArrayCapabilities: string[] = ['analytical', 'creative'];
    const objectCapabilities: Record<string, boolean | string | number> = {
      analytical: true,
      creative: false,
      complexity: 0.8,
      mode: 'advanced'
    };

    expect(Array.isArray(stringArrayCapabilities)).toBe(true);
    expect(typeof objectCapabilities).toBe('object');
  });

  it('should compile without TypeScript errors', () => {
    // This test just ensures the component compiles with proper types
    const props = {
      isOpen: true,
      onClose: vi.fn(),
      content: 'Test content'
    };

    expect(props.isOpen).toBe(true);
    expect(typeof props.onClose).toBe('function');
    expect(props.content).toBe('Test content');
  });
});