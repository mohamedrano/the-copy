import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from 'http';
import express from 'express';
import { registerRoutes } from '../../server/routes';
import { environment } from '../../server/config/environment';

// Mock للبيئة
process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.VALID_API_KEYS = 'test-api-key-1,test-api-key-2';
process.env.SESSION_SECRET = 'test-session-secret-minimum-32-characters-long';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.ALLOWED_ORIGINS = 'http://localhost:3000,http://localhost:5000';

describe('POST /api/analyze-text', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // تسجيل المسارات
    await registerRoutes(app);
    
    server = createServer(app);
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('Authentication', () => {
    it('should return 401 when no API key is provided', async () => {
      const response = await request(app)
        .post('/api/analyze-text')
        .send({
          fullText: 'نص تجريبي للاختبار',
          projectName: 'مشروع اختبار'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });

    it('should return 403 when invalid API key is provided', async () => {
      const response = await request(app)
        .post('/api/analyze-text')
        .set('X-API-Key', 'invalid-key')
        .send({
          fullText: 'نص تجريبي للاختبار',
          projectName: 'مشروع اختبار'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Invalid API key');
    });

    it('should accept valid API key', async () => {
      const response = await request(app)
        .post('/api/analyze-text')
        .set('X-API-Key', 'test-api-key-1')
        .send({
          fullText: 'نص تجريبي للاختبار',
          projectName: 'مشروع اختبار'
        });

      // قد يفشل بسبب عدم وجود Gemini API حقيقي، لكن يجب أن يمر التحقق من API key
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });
  });

  describe('Input Validation', () => {
    it('should return 400 for missing fullText', async () => {
      const response = await request(app)
        .post('/api/analyze-text')
        .set('X-API-Key', 'test-api-key-1')
        .send({
          projectName: 'مشروع اختبار'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('بيانات غير صالحة');
    });

    it('should return 400 for missing projectName', async () => {
      const response = await request(app)
        .post('/api/analyze-text')
        .set('X-API-Key', 'test-api-key-1')
        .send({
          fullText: 'نص تجريبي للاختبار'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('بيانات غير صالحة');
    });

    it('should return 400 for text too short', async () => {
      const response = await request(app)
        .post('/api/analyze-text')
        .set('X-API-Key', 'test-api-key-1')
        .send({
          fullText: 'قصير',
          projectName: 'مشروع اختبار'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('بيانات غير صالحة');
    });

    it('should return 400 for text too long', async () => {
      const longText = 'أ'.repeat(500001); // 500,001 characters
      
      const response = await request(app)
        .post('/api/analyze-text')
        .set('X-API-Key', 'test-api-key-1')
        .send({
          fullText: longText,
          projectName: 'مشروع اختبار'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('بيانات غير صالحة');
    });

    it('should return 400 for project name too long', async () => {
      const longProjectName = 'أ'.repeat(257); // 257 characters
      
      const response = await request(app)
        .post('/api/analyze-text')
        .set('X-API-Key', 'test-api-key-1')
        .send({
          fullText: 'نص تجريبي طويل بما فيه الكفاية للاختبار',
          projectName: longProjectName
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('بيانات غير صالحة');
    });
  });

  describe('Content Type Validation', () => {
    it('should return 400 for non-JSON content', async () => {
      const response = await request(app)
        .post('/api/analyze-text')
        .set('X-API-Key', 'test-api-key-1')
        .set('Content-Type', 'text/plain')
        .send('نص تجريبي');

      expect(response.status).toBe(400);
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting gracefully', async () => {
      // إرسال عدة طلبات متتالية
      const promises = Array.from({ length: 5 }, () =>
        request(app)
          .post('/api/analyze-text')
          .set('X-API-Key', 'test-api-key-1')
          .send({
            fullText: 'نص تجريبي للاختبار',
            projectName: 'مشروع اختبار'
          })
      );

      const responses = await Promise.all(promises);
      
      // يجب أن تمر بعض الطلبات (حسب إعدادات rate limiting)
      const successResponses = responses.filter(r => r.status < 400);
      expect(successResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/analyze-text')
        .set('X-API-Key', 'test-api-key-1')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      expect(response.status).toBe(400);
    });

    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/analyze-text')
        .set('X-API-Key', 'test-api-key-1')
        .send();

      expect(response.status).toBe(400);
    });
  });
});

