// tests/pipeline-validation.test.ts
import { describe, it, expect } from 'vitest';
import {
  PipelineInputSchema,
  validateAndNormalizePipelineInput,
  normalizePipelineInput,
  type PipelineInput,
} from '../src/lib/ai/stations/types';
import { ZodError } from 'zod';

describe('Pipeline Input Validation', () => {
  describe('PipelineInputSchema', () => {
    it('should validate correct input with all required fields', () => {
      const validInput = {
        fullText: 'هذا نص تجريبي للسيناريو',
        projectName: 'test-project',
        language: 'ar' as const,
      };

      const result = PipelineInputSchema.parse(validInput);
      expect(result.fullText).toBe(validInput.fullText);
      expect(result.projectName).toBe(validInput.projectName);
      expect(result.language).toBe('ar');
    });

    it('should apply default values for optional fields', () => {
      const minimalInput = {
        fullText: 'Test text',
        projectName: 'test-project',
      };

      const result = PipelineInputSchema.parse(minimalInput);
      expect(result.language).toBe('ar'); // default
      expect(result.context).toEqual({});
      expect(result.flags).toEqual({
        runStations: true,
        fastMode: false,
        skipValidation: false,
        verboseLogging: false,
      });
      expect(result.agents).toEqual({ temperature: 0.2 });
    });

    it('should accept proseFilePath as optional field', () => {
      const inputWithProse = {
        fullText: 'Test text',
        projectName: 'test-project',
        proseFilePath: '/path/to/prose.txt',
      };

      const result = PipelineInputSchema.parse(inputWithProse);
      expect(result.proseFilePath).toBe('/path/to/prose.txt');
    });

    it('should reject input with missing fullText', () => {
      const invalidInput = {
        projectName: 'test-project',
      };

      expect(() => PipelineInputSchema.parse(invalidInput)).toThrow(ZodError);
    });

    it('should reject input with empty fullText', () => {
      const invalidInput = {
        fullText: '',
        projectName: 'test-project',
      };

      expect(() => PipelineInputSchema.parse(invalidInput)).toThrow(ZodError);
    });

    it('should reject input with missing projectName', () => {
      const invalidInput = {
        fullText: 'Test text',
      };

      expect(() => PipelineInputSchema.parse(invalidInput)).toThrow(ZodError);
    });

    it('should accept valid language values', () => {
      const inputAr = {
        fullText: 'Test text',
        projectName: 'test-project',
        language: 'ar' as const,
      };

      const inputEn = {
        fullText: 'Test text',
        projectName: 'test-project',
        language: 'en' as const,
      };

      expect(() => PipelineInputSchema.parse(inputAr)).not.toThrow();
      expect(() => PipelineInputSchema.parse(inputEn)).not.toThrow();
    });

    it('should reject invalid language values', () => {
      const invalidInput = {
        fullText: 'Test text',
        projectName: 'test-project',
        language: 'fr', // not allowed
      };

      expect(() => PipelineInputSchema.parse(invalidInput)).toThrow(ZodError);
    });

    it('should validate context object fields', () => {
      const inputWithContext = {
        fullText: 'Test text',
        projectName: 'test-project',
        context: {
          title: 'Test Drama',
          author: 'Test Author',
          sceneHints: ['scene1', 'scene2'],
          genre: 'Drama',
        },
      };

      const result = PipelineInputSchema.parse(inputWithContext);
      expect(result.context?.title).toBe('Test Drama');
      expect(result.context?.author).toBe('Test Author');
      expect(result.context?.sceneHints).toEqual(['scene1', 'scene2']);
    });

    it('should validate flags object fields', () => {
      const inputWithFlags = {
        fullText: 'Test text',
        projectName: 'test-project',
        flags: {
          runStations: false,
          fastMode: true,
          verboseLogging: true,
        },
      };

      const result = PipelineInputSchema.parse(inputWithFlags);
      expect(result.flags?.runStations).toBe(false);
      expect(result.flags?.fastMode).toBe(true);
      expect(result.flags?.verboseLogging).toBe(true);
    });

    it('should validate agents configuration', () => {
      const inputWithAgents = {
        fullText: 'Test text',
        projectName: 'test-project',
        agents: {
          temperature: 0.5,
          maxTokens: 1000,
          model: 'gemini-pro',
        },
      };

      const result = PipelineInputSchema.parse(inputWithAgents);
      expect(result.agents?.temperature).toBe(0.5);
      expect(result.agents?.maxTokens).toBe(1000);
      expect(result.agents?.model).toBe('gemini-pro');
    });

    it('should reject invalid temperature values', () => {
      const invalidInput = {
        fullText: 'Test text',
        projectName: 'test-project',
        agents: {
          temperature: 3.0, // > 2.0
        },
      };

      expect(() => PipelineInputSchema.parse(invalidInput)).toThrow(ZodError);
    });
  });

  describe('normalizePipelineInput', () => {
    it('should normalize screenplayText to fullText', () => {
      const input = {
        screenplayText: 'Test screenplay',
        projectName: 'test-project',
      };

      const normalized = normalizePipelineInput(input);
      expect((normalized as any).fullText).toBe('Test screenplay');
    });

    it('should normalize text to fullText', () => {
      const input = {
        text: 'Test text content',
        projectName: 'test-project',
      };

      const normalized = normalizePipelineInput(input);
      expect((normalized as any).fullText).toBe('Test text content');
    });

    it('should normalize script to fullText', () => {
      const input = {
        script: 'Test script content',
        projectName: 'test-project',
      };

      const normalized = normalizePipelineInput(input);
      expect((normalized as any).fullText).toBe('Test script content');
    });

    it('should use fullText if provided (priority)', () => {
      const input = {
        fullText: 'Primary text',
        screenplayText: 'Secondary text',
        projectName: 'test-project',
      };

      const normalized = normalizePipelineInput(input);
      expect((normalized as any).fullText).toBe('Primary text');
    });

    it('should normalize project to projectName', () => {
      const input = {
        fullText: 'Test text',
        project: 'my-project',
      };

      const normalized = normalizePipelineInput(input);
      expect((normalized as any).projectName).toBe('my-project');
    });

    it('should use default projectName if not provided', () => {
      const input = {
        fullText: 'Test text',
      };

      const normalized = normalizePipelineInput(input);
      expect((normalized as any).projectName).toBe('untitled-project');
    });

    it('should merge context fields', () => {
      const input = {
        fullText: 'Test text',
        projectName: 'test-project',
        title: 'Drama Title',
        author: 'Drama Author',
        context: {
          genre: 'Thriller',
        },
      };

      const normalized = normalizePipelineInput(input);
      const context = (normalized as any).context;
      expect(context.title).toBe('Drama Title');
      expect(context.author).toBe('Drama Author');
      expect(context.genre).toBe('Thriller');
    });

    it('should handle invalid input gracefully', () => {
      expect(normalizePipelineInput(null)).toBeNull();
      expect(normalizePipelineInput(undefined)).toBeUndefined();
      expect(normalizePipelineInput('string')).toBe('string');
      expect(normalizePipelineInput(123)).toBe(123);
    });
  });

  describe('validateAndNormalizePipelineInput', () => {
    it('should normalize and validate in one step', () => {
      const input = {
        screenplayText: 'Test screenplay',
        project: 'my-project',
        language: 'en',
      };

      const result = validateAndNormalizePipelineInput(input);
      expect(result.fullText).toBe('Test screenplay');
      expect(result.projectName).toBe('my-project');
      expect(result.language).toBe('en');
    });

    it('should throw error for invalid normalized input', () => {
      const input = {
        text: '', // empty text after normalization
        projectName: 'test-project',
      };

      expect(() => validateAndNormalizePipelineInput(input)).toThrow(ZodError);
    });

    it('should handle complex input with all fields', () => {
      const complexInput = {
        screenplayText: 'Complex screenplay text',
        project: 'complex-project',
        proseFilePath: '/path/to/prose',
        language: 'ar',
        title: 'Complex Drama',
        author: 'Author Name',
        sceneHints: ['hint1', 'hint2'],
        runStations: true,
        fastMode: false,
        temperature: 0.7,
      };

      const result = validateAndNormalizePipelineInput(complexInput);
      expect(result.fullText).toBe('Complex screenplay text');
      expect(result.projectName).toBe('complex-project');
      expect(result.proseFilePath).toBe('/path/to/prose');
      expect(result.language).toBe('ar');
      expect(result.context?.title).toBe('Complex Drama');
      expect(result.context?.author).toBe('Author Name');
      expect(result.flags?.runStations).toBe(true);
      expect(result.flags?.fastMode).toBe(false);
    });

    it('should preserve type safety after validation', () => {
      const input = {
        fullText: 'Test text',
        projectName: 'test-project',
      };

      const result: PipelineInput = validateAndNormalizePipelineInput(input);

      // TypeScript should recognize these as valid properties
      expect(typeof result.fullText).toBe('string');
      expect(typeof result.projectName).toBe('string');
      expect(typeof result.language).toBe('string');
      expect(typeof result.context).toBe('object');
      expect(typeof result.flags).toBe('object');
      expect(typeof result.agents).toBe('object');
    });
  });

  describe('Edge Cases', () => {
    it('should handle Arabic text correctly', () => {
      const arabicInput = {
        fullText: 'هذا نص عربي للدراما والمسلسلات التلفزيونية',
        projectName: 'مشروع-عربي',
        language: 'ar' as const,
      };

      const result = PipelineInputSchema.parse(arabicInput);
      expect(result.fullText).toBe(arabicInput.fullText);
      expect(result.language).toBe('ar');
    });

    it('should handle very long text', () => {
      const longText = 'A'.repeat(100000);
      const input = {
        fullText: longText,
        projectName: 'long-text-project',
      };

      const result = PipelineInputSchema.parse(input);
      expect(result.fullText.length).toBe(100000);
    });

    it('should handle special characters in projectName', () => {
      const input = {
        fullText: 'Test text',
        projectName: 'project-with-special-chars_123',
      };

      const result = PipelineInputSchema.parse(input);
      expect(result.projectName).toBe('project-with-special-chars_123');
    });

    it('should handle empty arrays in context', () => {
      const input = {
        fullText: 'Test text',
        projectName: 'test-project',
        context: {
          sceneHints: [],
        },
      };

      const result = PipelineInputSchema.parse(input);
      expect(result.context?.sceneHints).toEqual([]);
    });

    it('should handle mixed normalized and direct fields', () => {
      const input = {
        fullText: 'Direct text',
        screenplayText: 'Normalized text', // should be ignored
        projectName: 'Direct project',
        project: 'Normalized project', // should be ignored
      };

      const normalized = normalizePipelineInput(input);
      const result = PipelineInputSchema.parse(normalized);
      expect(result.fullText).toBe('Direct text');
      expect(result.projectName).toBe('Direct project');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should validate typical API request', () => {
      const apiRequest = {
        fullText: 'Scene 1: INT. COFFEE SHOP - DAY\n\nJohn enters and orders coffee.',
        projectName: 'coffee-shop-drama',
        language: 'en',
        context: {
          title: 'Coffee Shop Chronicles',
          author: 'Jane Doe',
        },
        flags: {
          fastMode: true,
        },
      };

      const result = validateAndNormalizePipelineInput(apiRequest);
      expect(result.fullText).toContain('COFFEE SHOP');
      expect(result.flags?.fastMode).toBe(true);
    });

    it('should validate legacy format input', () => {
      const legacyInput = {
        screenplayText: 'Old format screenplay',
        project: 'legacy-project',
      };

      const result = validateAndNormalizePipelineInput(legacyInput);
      expect(result.fullText).toBe('Old format screenplay');
      expect(result.projectName).toBe('legacy-project');
    });

    it('should validate minimal required input', () => {
      const minimalInput = {
        fullText: 'Minimal text',
        projectName: 'minimal',
      };

      const result = validateAndNormalizePipelineInput(minimalInput);
      expect(result.fullText).toBe('Minimal text');
      expect(result.projectName).toBe('minimal');
      expect(result.language).toBe('ar'); // default
    });
  });
});
