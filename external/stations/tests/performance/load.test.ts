import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from 'http';
import express from 'express';
import { registerRoutes } from '../../server/routes';

// Mock للبيئة
process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.VALID_API_KEYS = 'test-api-key-1,test-api-key-2';
process.env.SESSION_SECRET = 'test-session-secret-minimum-32-characters-long';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.ALLOWED_ORIGINS = 'http://localhost:3000,http://localhost:5000';

describe('Performance Tests', () => {
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

  describe('Response Time Tests', () => {
    it('should respond to health check within 100ms', async () => {
      const start = Date.now();
      
      const response = await request(app)
        .get('/health');
      
      const duration = Date.now() - start;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(100);
    });

    it('should handle multiple concurrent health checks', async () => {
      const start = Date.now();
      
      // إرسال 10 طلبات متزامنة
      const promises = Array.from({ length: 10 }, () =>
        request(app).get('/health')
      );
      
      const responses = await Promise.all(promises);
      const duration = Date.now() - start;
      
      // جميع الطلبات يجب أن تنجح
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      // يجب أن تكتمل في أقل من ثانية
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not leak memory with repeated requests', async () => {
      const initialMemory = process.memoryUsage();
      
      // إرسال 100 طلب
      for (let i = 0; i < 100; i++) {
        await request(app)
          .get('/health');
      }
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // يجب ألا تزيد الذاكرة بأكثر من 10MB
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle 50 concurrent requests', async () => {
      const start = Date.now();
      
      const promises = Array.from({ length: 50 }, (_, index) =>
        request(app)
          .get('/health')
          .set('X-Request-ID', `test-${index}`)
      );
      
      const responses = await Promise.all(promises);
      const duration = Date.now() - start;
      
      // جميع الطلبات يجب أن تنجح
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBe(50);
      
      // يجب أن تكتمل في أقل من 5 ثوان
      expect(duration).toBeLessThan(5000);
    });

    it('should handle mixed request types concurrently', async () => {
      const start = Date.now();
      
      const promises = [
        // 10 طلبات health check
        ...Array.from({ length: 10 }, () => request(app).get('/health')),
        // 5 طلبات analyze-text (قد تفشل بسبب عدم وجود Gemini API حقيقي)
        ...Array.from({ length: 5 }, () =>
          request(app)
            .post('/api/analyze-text')
            .set('X-API-Key', 'test-api-key-1')
            .send({
              fullText: 'نص تجريبي للاختبار',
              projectName: 'مشروع اختبار'
            })
        )
      ];
      
      const responses = await Promise.all(promises);
      const duration = Date.now() - start;
      
      // على الأقل health checks يجب أن تنجح
      const healthChecks = responses.slice(0, 10);
      healthChecks.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      // يجب أن تكتمل في أقل من 10 ثوان
      expect(duration).toBeLessThan(10000);
    });
  });

  describe('Error Handling Under Load', () => {
    it('should handle errors gracefully under load', async () => {
      const promises = Array.from({ length: 20 }, (_, index) => {
        if (index % 2 === 0) {
          // طلبات صحيحة
          return request(app).get('/health');
        } else {
          // طلبات خاطئة
          return request(app)
            .post('/api/analyze-text')
            .send({ invalid: 'data' });
        }
      });
      
      const responses = await Promise.all(promises);
      
      // يجب أن تنجح الطلبات الصحيحة
      const healthResponses = responses.filter((_, index) => index % 2 === 0);
      healthResponses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      // يجب أن تفشل الطلبات الخاطئة بشكل صحيح
      const errorResponses = responses.filter((_, index) => index % 2 === 1);
      errorResponses.forEach(response => {
        expect(response.status).toBeGreaterThanOrEqual(400);
      });
    });
  });

  describe('Resource Cleanup', () => {
    it('should clean up resources after requests', async () => {
      const initialConnections = server.connections || 0;
      
      // إرسال عدة طلبات
      for (let i = 0; i < 10; i++) {
        await request(app).get('/health');
      }
      
      // انتظار قليل للتنظيف
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const finalConnections = server.connections || 0;
      
      // يجب ألا تزيد الاتصالات بشكل كبير
      expect(finalConnections).toBeLessThanOrEqual(initialConnections + 5);
    });
  });
});

