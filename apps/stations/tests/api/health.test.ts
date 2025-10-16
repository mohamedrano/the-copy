import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from 'http';
import express from 'express';
import healthRouter from '../../server/routes/health';

describe('GET /health', () => {
  let app: express.Application;
  let server: unknown;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use('/health', healthRouter);
    
    server = createServer(app);
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  it('should return 200 with health status', async () => {
    const response = await request(app)
      .get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('environment');
    expect(response.body).toHaveProperty('version');
  });

  it('should include checks object', async () => {
    const response = await request(app)
      .get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('checks');
    expect(typeof response.body.checks).toBe('object');
  });

  it('should return valid timestamp format', async () => {
    const response = await request(app)
      .get('/health');

    expect(response.status).toBe(200);
    expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should return valid uptime', async () => {
    const response = await request(app)
      .get('/health');

    expect(response.status).toBe(200);
    expect(typeof response.body.uptime).toBe('number');
    expect(response.body.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should return correct environment', async () => {
    const response = await request(app)
      .get('/health');

    expect(response.status).toBe(200);
    expect(['development', 'production', 'test']).toContain(response.body.environment);
  });
});

