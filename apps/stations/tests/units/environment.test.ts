import { createRequire } from 'node:module';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const nodeRequire = createRequire(import.meta.url);
const environmentModulePath = '../../server/config/environment';

type EnvironmentModule = typeof import('../../server/config/environment');

const loadEnvironmentModule = (): EnvironmentModule => {
  const moduleId = nodeRequire.resolve(environmentModulePath);
  delete nodeRequire.cache[moduleId];
  return nodeRequire(environmentModulePath) as EnvironmentModule;
};

// حفظ متغيرات البيئة الأصلية
const originalEnv = process.env;

describe('Environment Configuration', () => {
  beforeEach(() => {
    // إعادة تعيين متغيرات البيئة قبل كل اختبار
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // استعادة متغيرات البيئة الأصلية بعد كل اختبار
    process.env = originalEnv;
  });

  describe('Required Environment Variables', () => {
    it('should throw error when GEMINI_API_KEY is missing', () => {
      delete process.env.GEMINI_API_KEY;
      
      expect(() => {
        // إعادة تحميل الوحدة لاختبار التحقق
        loadEnvironmentModule();
      }).toThrow();
    });

    it('should throw error when DATABASE_URL is missing', () => {
      process.env.GEMINI_API_KEY = 'test-key';
      delete process.env.DATABASE_URL;
      
      expect(() => {
        loadEnvironmentModule();
      }).toThrow();
    });

    it('should throw error when SESSION_SECRET is too short', () => {
      process.env.GEMINI_API_KEY = 'test-key';
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.SESSION_SECRET = 'short';
      
      expect(() => {
        loadEnvironmentModule();
      }).toThrow();
    });
  });

  describe('Environment Validation', () => {
    beforeEach(() => {
      // إعداد متغيرات البيئة الصحيحة
      process.env.NODE_ENV = 'test';
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
      process.env.VALID_API_KEYS = 'key1,key2,key3';
      process.env.SESSION_SECRET = 'test-session-secret-minimum-32-characters-long';
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000,https://example.com';
    });

    it('should parse VALID_API_KEYS correctly', () => {
      const { environment } = loadEnvironmentModule();
      
      const config = environment.getConfig();
      expect(config.VALID_API_KEYS).toEqual(['key1', 'key2', 'key3']);
    });

    it('should parse ALLOWED_ORIGINS correctly', () => {
      const { environment } = loadEnvironmentModule();
      
      const config = environment.getConfig();
      expect(config.ALLOWED_ORIGINS).toEqual(['http://localhost:3000', 'https://example.com']);
    });

    it('should set default values for optional variables', () => {
      const { environment } = loadEnvironmentModule();
      
      const config = environment.getConfig();
      expect(config.PORT).toBe(5000);
      expect(config.LOG_LEVEL).toBe('info');
      expect(config.ENABLE_CACHE).toBe(false);
    });

    it('should convert string numbers to numbers', () => {
      process.env.PORT = '3000';
      process.env.RATE_LIMIT_MAX_REQUESTS = '50';
      
      const { environment } = loadEnvironmentModule();
      
      const config = environment.getConfig();
      expect(config.PORT).toBe(3000);
      expect(config.RATE_LIMIT_MAX_REQUESTS).toBe(50);
    });

    it('should convert string booleans to booleans', () => {
      process.env.ENABLE_CACHE = 'true';
      process.env.DEBUG = 'false';
      
      const { environment } = loadEnvironmentModule();
      
      const config = environment.getConfig();
      expect(config.ENABLE_CACHE).toBe(true);
      expect(config.DEBUG).toBe(false);
    });
  });

  describe('Environment Helper Methods', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
      process.env.GEMINI_API_KEY = 'test-key';
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.VALID_API_KEYS = 'key1';
      process.env.SESSION_SECRET = 'test-session-secret-minimum-32-characters-long';
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
    });

    it('should correctly identify development environment', () => {
      process.env.NODE_ENV = 'development';
      
      const { environment } = loadEnvironmentModule();
      
      expect(environment.isDevelopment()).toBe(true);
      expect(environment.isProduction()).toBe(false);
      expect(environment.isTest()).toBe(false);
    });

    it('should correctly identify production environment', () => {
      process.env.NODE_ENV = 'production';

      const { environment } = loadEnvironmentModule();

      expect(environment.isDevelopment()).toBe(false);
      expect(environment.isProduction()).toBe(true);
      expect(environment.isTest()).toBe(false);
    });

    it('should correctly identify test environment', () => {
      process.env.NODE_ENV = 'test';

      const { environment } = loadEnvironmentModule();

      expect(environment.isDevelopment()).toBe(false);
      expect(environment.isProduction()).toBe(false);
      expect(environment.isTest()).toBe(true);
    });
  });

  describe('Configuration Getters', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
      process.env.GEMINI_API_KEY = 'test-key';
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.VALID_API_KEYS = 'key1,key2';
      process.env.SESSION_SECRET = 'test-session-secret-minimum-32-characters-long';
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
      process.env.REDIS_HOST = 'localhost';
      process.env.REDIS_PORT = '6379';
    });

    it('should return database configuration', () => {
      const { environment } = loadEnvironmentModule();

      const dbConfig = environment.getDatabaseConfig();
      expect(dbConfig.url).toBe('postgresql://test:test@localhost:5432/test');
      expect(dbConfig.pool).toHaveProperty('min');
      expect(dbConfig.pool).toHaveProperty('max');
    });

    it('should return Redis configuration', () => {
      const { environment } = loadEnvironmentModule();

      const redisConfig = environment.getRedisConfig();
      expect(redisConfig.host).toBe('localhost');
      expect(redisConfig.port).toBe(6379);
    });

    it('should return security configuration', () => {
      const { environment } = loadEnvironmentModule();

      const securityConfig = environment.getSecurityConfig();
      expect(securityConfig.validApiKeys).toEqual(['key1', 'key2']);
      expect(securityConfig.allowedOrigins).toEqual(['http://localhost:3000']);
    });
  });
});

