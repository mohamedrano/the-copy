import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from 'http';
import express from 'express';
import { corsOptions } from '../../server/middleware/security';

describe('CORS Security', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    
    // تطبيق CORS
    const cors = require('cors');
    app.use(cors(corsOptions));
    
    // مسار اختبار
    app.get('/test', (req, res) => {
      res.json({ message: 'success' });
    });
    
    app.post('/test', (req, res) => {
      res.json({ message: 'success' });
    });
    
    server = createServer(app);
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('Allowed Origins', () => {
    it('should allow requests from allowed origins', async () => {
      const response = await request(app)
        .get('/test')
        .set('Origin', 'http://localhost:3000');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    it('should allow requests without origin (mobile apps, Postman)', async () => {
      const response = await request(app)
        .get('/test');

      expect(response.status).toBe(200);
    });

    it('should block requests from disallowed origins', async () => {
      const response = await request(app)
        .get('/test')
        .set('Origin', 'https://malicious-site.com');

      expect(response.status).toBe(500); // CORS error
    });
  });

  describe('CORS Headers', () => {
    it('should include proper CORS headers', async () => {
      const response = await request(app)
        .get('/test')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-credentials');
    });

    it('should handle preflight requests', async () => {
      const response = await request(app)
        .options('/test')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type');

      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-methods']).toContain('POST');
      expect(response.headers['access-control-allow-headers']).toContain('Content-Type');
    });
  });

  describe('HTTP Methods', () => {
    it('should allow GET requests', async () => {
      const response = await request(app)
        .get('/test')
        .set('Origin', 'http://localhost:3000');

      expect(response.status).toBe(200);
    });

    it('should allow POST requests', async () => {
      const response = await request(app)
        .post('/test')
        .set('Origin', 'http://localhost:3000')
        .send({ data: 'test' });

      expect(response.status).toBe(200);
    });

    it('should allow OPTIONS requests', async () => {
      const response = await request(app)
        .options('/test')
        .set('Origin', 'http://localhost:3000');

      expect(response.status).toBe(204);
    });
  });
});

