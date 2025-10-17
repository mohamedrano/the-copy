import { describe, it, expect } from 'vitest';
import {
  MIN_FILES_REQUIRED,
  TASKS_REQUIRING_COMPLETION_SCOPE,
  COMPLETION_ENHANCEMENT_OPTIONS,
  TASK_LABELS,
  TASK_CATEGORY_MAP,
  SUPPORTED_MIME_TYPES,
  TASKS_EXPECTING_JSON_RESPONSE
} from './constants';
import { TaskType, TaskCategory } from './enums';

describe('Core Constants', () => {
  describe('MIN_FILES_REQUIRED', () => {
    it('should be a positive number', () => {
      expect(MIN_FILES_REQUIRED).toBeGreaterThan(0);
      expect(typeof MIN_FILES_REQUIRED).toBe('number');
    });
  });

  describe('TASKS_REQUIRING_COMPLETION_SCOPE', () => {
    it('should be an array', () => {
      expect(Array.isArray(TASKS_REQUIRING_COMPLETION_SCOPE)).toBe(true);
    });

    it('should contain valid task types', () => {
      TASKS_REQUIRING_COMPLETION_SCOPE.forEach(taskType => {
        expect(Object.values(TaskType)).toContain(taskType);
      });
    });
  });

  describe('COMPLETION_ENHANCEMENT_OPTIONS', () => {
    it('should be an array', () => {
      expect(Array.isArray(COMPLETION_ENHANCEMENT_OPTIONS)).toBe(true);
    });

    it('should have valid structure', () => {
      COMPLETION_ENHANCEMENT_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('label');
        expect(typeof option.id).toBe('string');
        expect(typeof option.label).toBe('string');
      });
    });
  });

  describe('TASK_LABELS', () => {
    it('should be an object', () => {
      expect(typeof TASK_LABELS).toBe('object');
      expect(TASK_LABELS).not.toBeNull();
    });

    it('should have labels for all task types', () => {
      Object.values(TaskType).forEach(taskType => {
        expect(TASK_LABELS[taskType]).toBeDefined();
        expect(typeof TASK_LABELS[taskType]).toBe('string');
        expect(TASK_LABELS[taskType].length).toBeGreaterThan(0);
      });
    });

    it('should have Arabic labels', () => {
      // Check that labels contain Arabic text (non-ASCII characters)
      Object.values(TASK_LABELS).forEach(label => {
        const hasArabic = /[\u0600-\u06FF]/.test(label);
        expect(hasArabic).toBe(true);
      });
    });
  });

  describe('TASK_CATEGORY_MAP', () => {
    it('should be an object', () => {
      expect(typeof TASK_CATEGORY_MAP).toBe('object');
      expect(TASK_CATEGORY_MAP).not.toBeNull();
    });

    it('should map task types to valid categories', () => {
      Object.entries(TASK_CATEGORY_MAP).forEach(([taskType, category]) => {
        expect(Object.values(TaskType)).toContain(taskType as TaskType);
        expect(Object.values(TaskCategory)).toContain(category);
      });
    });
  });

  describe('SUPPORTED_MIME_TYPES', () => {
    it('should be an object', () => {
      expect(typeof SUPPORTED_MIME_TYPES).toBe('object');
      expect(SUPPORTED_MIME_TYPES).not.toBeNull();
    });

    it('should have valid structure', () => {
      Object.entries(SUPPORTED_MIME_TYPES).forEach(([mimeType, extensions]) => {
        expect(typeof mimeType).toBe('string');
        expect(Array.isArray(extensions)).toBe(true);
        extensions.forEach(ext => {
          expect(typeof ext).toBe('string');
          expect(ext.startsWith('.')).toBe(true);
        });
      });
    });
  });

  describe('TASKS_EXPECTING_JSON_RESPONSE', () => {
    it('should be an array', () => {
      expect(Array.isArray(TASKS_EXPECTING_JSON_RESPONSE)).toBe(true);
    });

    it('should contain valid task types', () => {
      TASKS_EXPECTING_JSON_RESPONSE.forEach(taskType => {
        expect(Object.values(TaskType)).toContain(taskType);
      });
    });
  });

  describe('Constants Integration', () => {
    it('should have consistent task type coverage', () => {
      const taskTypes = Object.values(TaskType);
      const labelsKeys = Object.keys(TASK_LABELS);
      const categoryKeys = Object.keys(TASK_CATEGORY_MAP);
      
      expect(labelsKeys.length).toBe(taskTypes.length);
      expect(categoryKeys.length).toBe(taskTypes.length);
    });

    it('should have unique JSON response tasks', () => {
      const uniqueTasks = [...new Set(TASKS_EXPECTING_JSON_RESPONSE)];
      expect(TASKS_EXPECTING_JSON_RESPONSE.length).toBe(uniqueTasks.length);
    });

    it('should have consistent enhancement options structure', () => {
      COMPLETION_ENHANCEMENT_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('label');
        expect(typeof option.id).toBe('string');
        expect(typeof option.label).toBe('string');
      });
    });
  });
});
