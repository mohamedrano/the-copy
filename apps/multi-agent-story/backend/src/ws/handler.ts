import { FastifyRequest, FastifyReply } from 'fastify';
import { SocketStream } from '@fastify/websocket';

interface WSMessage {
  type: string;
  data: any;
}

export async function wsHandler(connection: SocketStream, request: FastifyRequest) {
  const { sessionId } = request.params as { sessionId: string };
  const fastify = request.server as any;
  
  // Get access token from cookies
  const accessToken = request.cookies.access_token;
  
  if (!accessToken) {
    connection.socket.send(JSON.stringify({
      type: 'error',
      data: { message: 'No access token provided' }
    }));
    connection.socket.close();
    return;
  }
  
  // Verify token
  let user: any;
  try {
    user = await fastify.jwt.verify(accessToken);
    
    // Ensure it's an access token
    if (user.type !== 'access') {
      throw new Error('Invalid token type');
    }
  } catch (err) {
    connection.socket.send(JSON.stringify({
      type: 'error',
      data: { message: 'Invalid or expired token' }
    }));
    connection.socket.close();
    return;
  }
  
  // Verify session access
  const session = await fastify.prisma.session.findUnique({
    where: { id: sessionId },
  });
  
  if (!session) {
    connection.socket.send(JSON.stringify({
      type: 'error',
      data: { message: 'Session not found' }
    }));
    connection.socket.close();
    return;
  }
  
  if (session.userId !== user.id && user.role !== 'ADMIN') {
    connection.socket.send(JSON.stringify({
      type: 'error',
      data: { message: 'Forbidden' }
    }));
    connection.socket.close();
    return;
  }
  
  // Add to session connections
  const redisKey = `ws:${sessionId}`;
  await fastify.redis.sadd(redisKey, connection.socket.id);
  
  // Send welcome message
  connection.socket.send(JSON.stringify({
    type: 'connected',
    data: {
      sessionId,
      userId: user.id,
      message: 'Connected to session'
    }
  }));
  
  // Subscribe to session events
  const subscriber = fastify.redis.duplicate();
  await subscriber.subscribe(`session:${sessionId}:events`);
  
  subscriber.on('message', (channel: string, message: string) => {
    try {
      connection.socket.send(message);
    } catch (err) {
      fastify.log.error('Failed to send message to client:', err);
    }
  });
  
  // Handle incoming messages
  connection.socket.on('message', async (message: Buffer) => {
    try {
      const data: WSMessage = JSON.parse(message.toString());
      
      switch (data.type) {
        case 'pause_session':
          await handlePauseSession(fastify, sessionId, user.id);
          break;
          
        case 'resume_session':
          await handleResumeSession(fastify, sessionId, user.id);
          break;
          
        case 'send_message':
          await handleSendMessage(fastify, sessionId, user.id, data.data);
          break;
          
        case 'ping':
          connection.socket.send(JSON.stringify({ type: 'pong' }));
          break;
          
        default:
          connection.socket.send(JSON.stringify({
            type: 'error',
            data: { message: `Unknown message type: ${data.type}` }
          }));
      }
    } catch (err) {
      fastify.log.error('Failed to process message:', err);
      connection.socket.send(JSON.stringify({
        type: 'error',
        data: { message: 'Failed to process message' }
      }));
    }
  });
  
  // Handle disconnection
  connection.socket.on('close', async () => {
    await fastify.redis.srem(redisKey, connection.socket.id);
    await subscriber.unsubscribe();
    subscriber.quit();
  });
}

// Helper functions
async function handlePauseSession(fastify: any, sessionId: string, userId: string) {
  await fastify.prisma.session.update({
    where: { id: sessionId },
    data: { status: 'PAUSED' },
  });
  
  // Broadcast to all clients
  await broadcastToSession(fastify, sessionId, {
    type: 'session_paused',
    data: { sessionId, userId }
  });
}

async function handleResumeSession(fastify: any, sessionId: string, userId: string) {
  await fastify.prisma.session.update({
    where: { id: sessionId },
    data: { status: 'ACTIVE' },
  });
  
  // Broadcast to all clients
  await broadcastToSession(fastify, sessionId, {
    type: 'session_resumed',
    data: { sessionId, userId }
  });
}

async function handleSendMessage(fastify: any, sessionId: string, userId: string, content: string) {
  const message = await fastify.prisma.message.create({
    data: {
      sessionId,
      type: 'USER',
      content,
      metadata: { userId },
    },
  });
  
  // Broadcast to all clients
  await broadcastToSession(fastify, sessionId, {
    type: 'new_message',
    data: message
  });
}

async function broadcastToSession(fastify: any, sessionId: string, message: any) {
  await fastify.redis.publish(
    `session:${sessionId}:events`,
    JSON.stringify(message)
  );
}
