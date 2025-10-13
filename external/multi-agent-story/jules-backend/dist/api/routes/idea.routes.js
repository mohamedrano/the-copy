import { logger } from '../../utils/logger';
export async function ideaRoutes(fastify, options) {
    const { ideaService } = options;
    // Get ideas for a session
    fastify.get('/sessions/:sessionId/ideas', async (request, reply) => {
        try {
            const userId = request.user?.id;
            const { sessionId } = request.params;
            if (!userId) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }
            const ideas = await ideaService.getIdeasBySession(sessionId);
            reply.send({ ideas });
        }
        catch (error) {
            logger.error('Failed to get ideas', { error });
            reply.status(500).send({ error: 'Failed to get ideas' });
        }
    });
    // Get idea by ID
    fastify.get('/ideas/:ideaId', async (request, reply) => {
        try {
            const userId = request.user?.id;
            const { ideaId } = request.params;
            if (!userId) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }
            const idea = await ideaService.getIdeaById(ideaId);
            if (!idea) {
                return reply.status(404).send({ error: 'Idea not found' });
            }
            reply.send({ idea });
        }
        catch (error) {
            logger.error('Failed to get idea', { error });
            reply.status(500).send({ error: 'Failed to get idea' });
        }
    });
    // Update idea status
    fastify.patch('/ideas/:ideaId/status', async (request, reply) => {
        try {
            const userId = request.user?.id;
            const { ideaId } = request.params;
            const { status } = request.body;
            if (!userId) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }
            await ideaService.updateIdeaStatus(ideaId, status);
            reply.send({ message: 'Idea status updated successfully' });
        }
        catch (error) {
            logger.error('Failed to update idea status', { error });
            reply.status(500).send({ error: 'Failed to update idea status' });
        }
    });
}
//# sourceMappingURL=idea.routes.js.map