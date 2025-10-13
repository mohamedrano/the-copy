import { logger } from '../../utils/logger';
export async function tournamentRoutes(fastify, options) {
    const { tournamentService } = options;
    // Get tournament for a session
    fastify.get('/sessions/:sessionId/tournament', async (request, reply) => {
        try {
            const userId = request.user?.id;
            const { sessionId } = request.params;
            if (!userId) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }
            const tournament = await tournamentService.getTournamentBySession(sessionId);
            if (!tournament) {
                return reply.status(404).send({ error: 'Tournament not found' });
            }
            reply.send({ tournament });
        }
        catch (error) {
            logger.error('Failed to get tournament', { error });
            reply.status(500).send({ error: 'Failed to get tournament' });
        }
    });
    // Get tournament by ID
    fastify.get('/tournaments/:tournamentId', async (request, reply) => {
        try {
            const userId = request.user?.id;
            const { tournamentId } = request.params;
            if (!userId) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }
            const tournament = await tournamentService.getTournamentById(tournamentId);
            if (!tournament) {
                return reply.status(404).send({ error: 'Tournament not found' });
            }
            reply.send({ tournament });
        }
        catch (error) {
            logger.error('Failed to get tournament', { error });
            reply.status(500).send({ error: 'Failed to get tournament' });
        }
    });
    // Get tournament summary
    fastify.get('/tournaments/:tournamentId/summary', async (request, reply) => {
        try {
            const userId = request.user?.id;
            const { tournamentId } = request.params;
            if (!userId) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }
            const summary = await tournamentService.getTournamentSummary(tournamentId);
            if (!summary) {
                return reply.status(404).send({ error: 'Tournament not found' });
            }
            reply.send({ summary });
        }
        catch (error) {
            logger.error('Failed to get tournament summary', { error });
            reply.status(500).send({ error: 'Failed to get tournament summary' });
        }
    });
}
//# sourceMappingURL=tournament.routes.js.map