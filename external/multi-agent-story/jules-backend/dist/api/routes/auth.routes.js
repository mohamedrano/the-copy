import { z } from 'zod';
import { logger } from '../../utils/logger';
import { hashPassword, verifyPassword } from '../../utils/encryption';
import { generateTokens, verifyToken } from '../../utils/jwt';
// Schemas
const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2).max(100)
});
const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});
const ApiKeySchema = z.object({
    apiKey: z.string().min(1),
    keyName: z.string().min(1).max(100)
});
export async function authRoutes(fastify, apiKeyService) {
    const app = fastify.withTypeProvider();
    // Register user
    app.post('/register', {
        schema: {
            body: RegisterSchema,
            response: {
                201: z.object({
                    user: z.object({
                        id: z.string(),
                        email: z.string(),
                        name: z.string(),
                        createdAt: z.string()
                    }),
                    tokens: z.object({
                        accessToken: z.string(),
                        refreshToken: z.string()
                    })
                })
            }
        }
    }, async (request, reply) => {
        try {
            const { email, password, name } = request.body;
            // Check if user already exists
            const existingUser = await fastify.prisma.user.findUnique({
                where: { email }
            });
            if (existingUser) {
                return reply.status(400).send({ error: 'User already exists' });
            }
            // Hash password
            const hashedPassword = await hashPassword(password);
            // Create user
            const user = await fastify.prisma.user.create({
                data: {
                    email,
                    hashedPassword,
                    name
                }
            });
            // Generate tokens
            const tokens = generateTokens(user.id);
            logger.info('User registered', { userId: user.id, email });
            reply.status(201).send({
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    createdAt: user.createdAt.toISOString()
                },
                tokens
            });
        }
        catch (error) {
            logger.error('Registration failed', { error });
            reply.status(500).send({ error: 'Registration failed' });
        }
    });
    // Login user
    app.post('/login', {
        schema: {
            body: LoginSchema,
            response: {
                200: z.object({
                    user: z.object({
                        id: z.string(),
                        email: z.string(),
                        name: z.string()
                    }),
                    tokens: z.object({
                        accessToken: z.string(),
                        refreshToken: z.string()
                    })
                })
            }
        }
    }, async (request, reply) => {
        try {
            const { email, password } = request.body;
            // Find user
            const user = await fastify.prisma.user.findUnique({
                where: { email }
            });
            if (!user) {
                return reply.status(401).send({ error: 'Invalid credentials' });
            }
            // Verify password
            const isValidPassword = await verifyPassword(password, user.hashedPassword);
            if (!isValidPassword) {
                return reply.status(401).send({ error: 'Invalid credentials' });
            }
            // Generate tokens
            const tokens = generateTokens(user.id);
            logger.info('User logged in', { userId: user.id, email });
            reply.send({
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                },
                tokens
            });
        }
        catch (error) {
            logger.error('Login failed', { error });
            reply.status(500).send({ error: 'Login failed' });
        }
    });
    // Add API key
    app.post('/api-keys', {
        schema: {
            body: ApiKeySchema,
            response: {
                201: z.object({
                    apiKey: z.object({
                        id: z.string(),
                        keyName: z.string(),
                        createdAt: z.string()
                    })
                })
            }
        }
    }, async (request, reply) => {
        try {
            const userId = request.user?.id;
            const { apiKey, keyName } = request.body;
            if (!userId) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }
            const savedApiKey = await apiKeyService.createApiKey(userId, apiKey, keyName);
            logger.info('API key added', { userId, keyName });
            reply.status(201).send({
                apiKey: {
                    id: savedApiKey.id,
                    keyName: savedApiKey.keyName,
                    createdAt: savedApiKey.createdAt.toISOString()
                }
            });
        }
        catch (error) {
            logger.error('Failed to add API key', { error });
            reply.status(500).send({ error: 'Failed to add API key' });
        }
    });
    // Get user API keys
    app.get('/api-keys', async (request, reply) => {
        try {
            const userId = request.user?.id;
            if (!userId) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }
            const apiKeys = await apiKeyService.getUserApiKeys(userId);
            reply.send({ apiKeys });
        }
        catch (error) {
            logger.error('Failed to get API keys', { error });
            reply.status(500).send({ error: 'Failed to get API keys' });
        }
    });
    // Delete API key
    app.delete('/api-keys/:keyId', async (request, reply) => {
        try {
            const userId = request.user?.id;
            const { keyId } = request.params;
            if (!userId) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }
            await apiKeyService.deleteApiKey(keyId, userId);
            logger.info('API key deleted', { userId, keyId });
            reply.send({ message: 'API key deleted successfully' });
        }
        catch (error) {
            logger.error('Failed to delete API key', { error });
            reply.status(500).send({ error: 'Failed to delete API key' });
        }
    });
    // Refresh token
    app.post('/refresh', {
        schema: {
            body: z.object({
                refreshToken: z.string()
            })
        }
    }, async (request, reply) => {
        try {
            const { refreshToken } = request.body;
            // Verify refresh token
            const payload = verifyToken(refreshToken);
            if (payload.type !== 'refresh') {
                return reply.status(401).send({ error: 'Invalid token type' });
            }
            // Generate new tokens
            const tokens = generateTokens(payload.userId);
            reply.send({ tokens });
        }
        catch (error) {
            logger.error('Token refresh failed', { error });
            reply.status(401).send({ error: 'Invalid refresh token' });
        }
    });
}
//# sourceMappingURL=auth.routes.js.map