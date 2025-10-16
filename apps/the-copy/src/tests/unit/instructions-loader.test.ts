/**
 * Unit tests for Instructions Loader
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { instructionsLoader } from '../../services/instructions-loader';

// Mock fetch
global.fetch = vi.fn();

describe('Instructions Loader', () => {
  beforeEach(() => {
    instructionsLoader.clearCache();
    vi.clearAllMocks();
  });

  describe('loadInstructions', () => {
    it('should load instructions successfully', async () => {
      const mockInstructions = {
        systemPrompt: 'Test prompt',
        instructions: ['Test instruction 1', 'Test instruction 2']
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInstructions)
      });

      const result = await instructionsLoader.loadInstructions('analysis');
      
      expect(result).toEqual(mockInstructions);
      expect(fetch).toHaveBeenCalledWith('/instructions/analysis.json');
    });

    it('should use cache on second call', async () => {
      const mockInstructions = {
        systemPrompt: 'Test prompt',
        instructions: ['Test instruction']
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInstructions)
      });

      // First call
      await instructionsLoader.loadInstructions('analysis');
      
      // Second call should use cache
      const result = await instructionsLoader.loadInstructions('analysis');
      
      expect(result).toEqual(mockInstructions);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should return fallback on fetch failure', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await instructionsLoader.loadInstructions('nonexistent');
      
      expect(result.systemPrompt).toContain('nonexistent');
      expect(result.instructions).toBeInstanceOf(Array);
    });

    it('should handle invalid JSON format', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ invalid: 'format' })
      });

      const result = await instructionsLoader.loadInstructions('invalid');
      
      // Should fallback to default instructions
      expect(result.systemPrompt).toBeDefined();
      expect(result.instructions).toBeInstanceOf(Array);
    });
  });

  describe('preloadInstructions', () => {
    it('should preload multiple instructions', async () => {
      const mockInstructions = {
        systemPrompt: 'Test prompt',
        instructions: ['Test instruction']
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockInstructions)
      });

      await instructionsLoader.preloadInstructions(['analysis', 'creative']);
      
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenCalledWith('/instructions/analysis.json');
      expect(fetch).toHaveBeenCalledWith('/instructions/creative.json');
    });
  });

  describe('cache management', () => {
    it('should track cache status correctly', async () => {
      const mockInstructions = {
        systemPrompt: 'Test prompt',
        instructions: ['Test instruction']
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInstructions)
      });

      await instructionsLoader.loadInstructions('analysis');
      
      const status = instructionsLoader.getCacheStatus();
      expect(status.cached).toContain('analysis');
      expect(status.loading).toHaveLength(0);
    });

    it('should clear cache properly', async () => {
      const mockInstructions = {
        systemPrompt: 'Test prompt',
        instructions: ['Test instruction']
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInstructions)
      });

      await instructionsLoader.loadInstructions('analysis');
      instructionsLoader.clearCache();
      
      const status = instructionsLoader.getCacheStatus();
      expect(status.cached).toHaveLength(0);
    });
  });
});