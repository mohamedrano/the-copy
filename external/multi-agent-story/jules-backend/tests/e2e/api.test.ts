import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { app } from '../../src/app'

describe('API E2E Tests', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.status).toBe('ok')
      expect(body.environment).toBeDefined()
    })
  })

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: `test${Date.now()}@example.com`,
          password: 'TestPassword123!',
          name: 'Test User'
        }
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.user).toBeDefined()
      expect(body.tokens).toBeDefined()
      expect(body.tokens.accessToken).toBeDefined()
    })

    it('should login existing user', async () => {
      // First register
      const email = `test${Date.now()}@example.com`
      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email,
          password: 'TestPassword123!',
          name: 'Test User'
        }
      })

      // Then login
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email,
          password: 'TestPassword123!'
        }
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.user).toBeDefined()
      expect(body.tokens).toBeDefined()
    })

    it('should reject invalid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        }
      })

      expect(response.statusCode).toBe(401)
    })
  })

  describe('Protected Routes', () => {
    it('should reject requests without authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/sessions'
      })

      expect(response.statusCode).toBe(401)
    })
  })
})
