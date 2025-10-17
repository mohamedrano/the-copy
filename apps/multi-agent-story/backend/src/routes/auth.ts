import { FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// JWT token payload interface
interface JWTPayload {
  id: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

// Cookie configuration
const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

// Helper function to set cookies
function setAuthCookies(reply: any, accessToken: string, refreshToken: string) {
  reply.setCookie('access_token', accessToken, {
    ...cookieConfig,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  
  reply.setCookie('refresh_token', refreshToken, {
    ...cookieConfig,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// Helper function to clear cookies
function clearAuthCookies(reply: any) {
  reply.clearCookie('access_token', cookieConfig);
  reply.clearCookie('refresh_token', cookieConfig);
}

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  const { prisma } = fastify as any;

  // Register
  fastify.post('/register', async (request, reply) => {
    try {
      const { email, password, name } = registerSchema.parse(request.body);

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return reply.status(400).send({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      // Generate access and refresh tokens
      const accessToken = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        type: 'access',
      } as JWTPayload, { expiresIn: '15m' });

      const refreshToken = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        type: 'refresh',
      } as JWTPayload, { expiresIn: '7d' });

      // Set httpOnly cookies
      setAuthCookies(reply, accessToken, refreshToken);

      return reply.send({ user });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error.message });
    }
  });

  // Login
  fastify.post('/login', async (request, reply) => {
    try {
      const { email, password } = loginSchema.parse(request.body);

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      // Generate access and refresh tokens
      const accessToken = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        type: 'access',
      } as JWTPayload, { expiresIn: '15m' });

      const refreshToken = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        type: 'refresh',
      } as JWTPayload, { expiresIn: '7d' });

      // Set httpOnly cookies
      setAuthCookies(reply, accessToken, refreshToken);

      return reply.send({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error.message });
    }
  });

  // Verify token
  fastify.get('/verify', {
    preHandler: [fastify.authenticate],
  }, async (request: any, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return reply.send({ user });
  });

  // Refresh token endpoint
  fastify.post('/refresh', async (request, reply) => {
    try {
      const refreshToken = request.cookies.refresh_token;

      if (!refreshToken) {
        return reply.status(401).send({ error: 'Refresh token not found' });
      }

      // Verify refresh token
      const decoded = fastify.jwt.verify(refreshToken) as JWTPayload;

      if (decoded.type !== 'refresh') {
        return reply.status(401).send({ error: 'Invalid token type' });
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      // Generate new access token
      const newAccessToken = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        type: 'access',
      } as JWTPayload, { expiresIn: '15m' });

      // Set new access token cookie
      reply.setCookie('access_token', newAccessToken, {
        ...cookieConfig,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      return reply.send({ user });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(401).send({ error: 'Invalid refresh token' });
    }
  });

  // Logout
  fastify.post('/logout', async (request, reply) => {
    clearAuthCookies(reply);
    return reply.send({ message: 'Logged out successfully' });
  });
};
