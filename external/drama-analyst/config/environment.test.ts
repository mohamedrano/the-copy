import { describe, it, expect } from 'vitest';
import { config } from './environment';

describe('Environment Configuration', () => {
  describe('API Configuration', () => {
    it('should have API configuration', () => {
      expect(config.api).toBeDefined();
    });

    it('should have Gemini API key', () => {
      expect(config.api.geminiKey).toBeDefined();
      expect(typeof config.api.geminiKey).toBe('string');
    });

    it('should have Gemini model name', () => {
      expect(config.api.geminiModel).toBeDefined();
      expect(typeof config.api.geminiModel).toBe('string');
    });

    it('should have retry configuration', () => {
      expect(config.api.retries).toBeDefined();
      expect(typeof config.api.retries).toBe('number');
      expect(config.api.retries).toBeGreaterThan(0);
    });

    it('should have timeout configuration', () => {
      expect(config.api.timeout).toBeDefined();
      expect(typeof config.api.timeout).toBe('number');
      expect(config.api.timeout).toBeGreaterThan(0);
    });

    it('should have reasonable timeout value', () => {
      expect(config.api.timeout).toBeGreaterThanOrEqual(30000); // At least 30 seconds
      expect(config.api.timeout).toBeLessThanOrEqual(300000); // At most 5 minutes
    });

    it('should have reasonable retry count', () => {
      expect(config.api.retries).toBeGreaterThanOrEqual(1);
      expect(config.api.retries).toBeLessThanOrEqual(10);
    });
  });

  describe('Configuration Structure', () => {
    it('should be a valid configuration object', () => {
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
    });

    it('should have all required top-level properties', () => {
      expect(config).toHaveProperty('api');
    });

    it('should not have null or undefined values in API config', () => {
      Object.values(config.api).forEach(value => {
        expect(value).not.toBeNull();
        expect(value).not.toBeUndefined();
      });
    });

    it('should have valid property types', () => {
      expect(typeof config.api.geminiKey).toBe('string');
      expect(typeof config.api.geminiModel).toBe('string');
      expect(typeof config.api.retries).toBe('number');
      expect(typeof config.api.timeout).toBe('number');
    });
  });

  describe('Default Values', () => {
    it('should have default Gemini model if not specified', () => {
      expect(config.api.geminiModel).toBeTruthy();
    });

    it('should have default retries if not specified', () => {
      expect(config.api.retries).toBeGreaterThan(0);
    });

    it('should have default timeout if not specified', () => {
      expect(config.api.timeout).toBeGreaterThan(0);
    });
  });
});
