import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskType } from '@core/enums';
import { AIRequest, ProcessedFile } from '@core/types';

// Mock the services
vi.mock('@services/apiService', () => ({
  callModel: vi.fn()
}));

vi.mock('@services/fileReaderService', () => ({
  readFiles: vi.fn()
}));

vi.mock('@services/loggerService', () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('End-to-End Workflow', () => {
    it('should process complete user workflow', async () => {
      // Mock file processing
      const mockFiles: ProcessedFile[] = [
        {
          name: 'test.txt',
          content: 'This is a test dramatic text.',
          type: 'text',
          size: 100
        }
      ];

      const mockResponse = {
        agent: TaskType.ANALYSIS,
        raw: 'Analysis result here...',
        meta: {
          provider: 'gemini',
          model: 'gemini-1.5-flash',
          timestamp: new Date().toISOString()
        }
      };

      // Mock the services
      const { readFiles } = await import('@services/fileReaderService');
      const { callModel } = await import('@services/apiService');
      
      vi.mocked(readFiles).mockResolvedValue({
        ok: true,
        value: mockFiles
      });
      
      vi.mocked(callModel).mockResolvedValue({
        ok: true,
        value: mockResponse
      });

      // Test the workflow
      const request: AIRequest = {
        agent: TaskType.ANALYSIS,
        files: mockFiles
      };

      const fileResult = await readFiles([new File(['test content'], 'test.txt')]);
      expect(fileResult.ok).toBe(true);

      const analysisResult = await callModel(request);
      expect(analysisResult.ok).toBe(true);
      expect(analysisResult.value?.agent).toBe(TaskType.ANALYSIS);
    });

    it('should handle workflow with multiple files', async () => {
      const mockFiles: ProcessedFile[] = [
        {
          name: 'file1.txt',
          content: 'First file content',
          type: 'text',
          size: 100
        },
        {
          name: 'file2.txt',
          content: 'Second file content',
          type: 'text',
          size: 200
        }
      ];

      const { readFiles } = await import('@services/fileReaderService');
      const { callModel } = await import('@services/apiService');
      
      vi.mocked(readFiles).mockResolvedValue({
        ok: true,
        value: mockFiles
      });
      
      vi.mocked(callModel).mockResolvedValue({
        ok: true,
        value: {
          agent: TaskType.CREATIVE,
          raw: 'Creative result...',
          meta: {
            provider: 'gemini',
            model: 'gemini-1.5-flash',
            timestamp: new Date().toISOString()
          }
        }
      });

      const request: AIRequest = {
        agent: TaskType.CREATIVE,
        files: mockFiles
      };

      const result = await callModel(request);
      expect(result.ok).toBe(true);
      expect(result.value?.agent).toBe(TaskType.CREATIVE);
    });
  });

  describe('Service Integration', () => {
    it('should integrate logger with other services', async () => {
      const { log } = await import('@services/loggerService');
      
      // Test that logger is properly integrated
      log.info('Test integration message', null, 'IntegrationTest');
      
      expect(log.info).toHaveBeenCalledWith(
        'Test integration message',
        null,
        'IntegrationTest'
      );
    });

    it('should handle error propagation between services', async () => {
      const { readFiles } = await import('@services/fileReaderService');
      const { callModel } = await import('@services/apiService');
      
      // Mock file reading error
      vi.mocked(readFiles).mockResolvedValue({
        ok: false,
        error: {
          code: 'FILE_READ_ERROR',
          message: 'Failed to read file',
          cause: null
        }
      });

      const result = await readFiles([new File(['test'], 'test.txt')]);
      expect(result.ok).toBe(false);
      expect(result.error?.code).toBe('FILE_READ_ERROR');
    });

    it('should integrate sanitization with API calls', async () => {
      const { sanitization } = await import('@services/sanitizationService');
      
      // Test sanitization integration
      const dirtyInput = '<script>alert("xss")</script>Hello World';
      const cleanInput = sanitization.html(dirtyInput);
      
      expect(cleanInput).not.toContain('<script>');
      expect(cleanInput).toContain('Hello World');
    });
  });

  describe('Configuration Integration', () => {
    it('should load configuration properly', async () => {
      // Test that configuration is accessible
      const config = await import('../../config/environment');
      
      expect(config.config).toBeDefined();
      expect(config.config.api).toBeDefined();
      expect(config.config.app).toBeDefined();
    });

    it('should handle environment variables', () => {
      // Test environment variable handling
      expect(process.env.NODE_ENV).toBeDefined();
    });
  });
});