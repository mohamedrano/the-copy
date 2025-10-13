import { logger } from '../../utils/logger';
export async function agentRoutes(fastify, options) {
    const { agentService } = options;
    // Get all agents for a session
    fastify.get('/sessions/:sessionId/agents', async (request, reply) => {
        try {
            const userId = request.user?.id;
            const { sessionId } = request.params;
            if (!userId) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }
            const agents = await agentService.getAgentsBySession(sessionId);
            reply.send({ agents });
        }
        catch (error) {
            logger.error('Failed to get agents', { error });
            reply.status(500).send({ error: 'Failed to get agents' });
        }
    });
    // Get agent by ID
    fastify.get('/agents/:agentId', async (request, reply) => {
        try {
            const userId = request.user?.id;
            const { agentId } = request.params;
            if (!userId) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }
            const agent = await agentService.getAgentById(agentId);
            if (!agent) {
                return reply.status(404).send({ error: 'Agent not found' });
            }
            reply.send({ agent });
        }
        catch (error) {
            logger.error('Failed to get agent', { error });
            reply.status(500).send({ error: 'Failed to get agent' });
        }
    });
    // Update agent status
    fastify.patch('/agents/:agentId/status', async (request, reply) => {
        try {
            const userId = request.user?.id;
            const { agentId } = request.params;
            const { status } = request.body;
            if (!userId) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }
            await agentService.updateAgentStatus(agentId, status);
            reply.send({ message: 'Agent status updated successfully' });
        }
        catch (error) {
            logger.error('Failed to update agent status', { error });
            reply.status(500).send({ error: 'Failed to update agent status' });
        }
    });
    // Test agent connection
    fastify.post('/agents/:agentId/test', async (request, reply) => {
        try {
            const userId = request.user?.id;
            const { agentId } = request.params;
            const { apiKey } = request.body;
            if (!userId) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }
            const isConnected = await agentService.testAgentConnection(agentId, apiKey);
            reply.send({
                connected: isConnected,
                message: isConnected ? 'Connection successful' : 'Connection failed'
            });
        }
        catch (error) {
            logger.error('Failed to test agent connection', { error });
            reply.status(500).send({ error: 'Failed to test agent connection' });
        }
    });
    // Get agent statistics for session
    fastify.get('/sessions/:sessionId/agents/stats', async (request, reply) => {
        try {
            const userId = request.user?.id;
            const { sessionId } = request.params;
            if (!userId) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }
            const stats = await agentService.getAgentStats(sessionId);
            reply.send({ stats });
        }
        catch (error) {
            logger.error('Failed to get agent stats', { error });
            reply.status(500).send({ error: 'Failed to get agent stats' });
        }
    });
}
//# sourceMappingURL=agent.routes.js.map