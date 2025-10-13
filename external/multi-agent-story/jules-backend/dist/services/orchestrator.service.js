import { logger } from '../utils/logger';
import { EventEmitter } from 'events';
export class OrchestratorService extends EventEmitter {
    prisma;
    agentService;
    ideaService;
    reviewService;
    tournamentService;
    decisionService;
    constructor(prisma, agentService, ideaService, reviewService, tournamentService, decisionService) {
        super();
        this.prisma = prisma;
        this.agentService = agentService;
        this.ideaService = ideaService;
        this.reviewService = reviewService;
        this.tournamentService = tournamentService;
        this.decisionService = decisionService;
    }
    async initializeSession(sessionId, apiKey) {
        try {
            logger.info('Initializing session orchestration', { sessionId });
            // Update session status
            await this.updateSessionStatus(sessionId, 'initializing', 'brief');
            // Create agent team
            await this.agentService.createAgentTeam(sessionId, apiKey);
            // Update session to ready state
            await this.updateSessionStatus(sessionId, 'ready', 'brief');
            this.emit('sessionInitialized', { sessionId });
            logger.info('Session orchestration initialized successfully', { sessionId });
        }
        catch (error) {
            logger.error('Failed to initialize session orchestration', { error, sessionId });
            await this.updateSessionStatus(sessionId, 'error', 'brief');
            throw error;
        }
    }
    async startPhase(sessionId, phase, apiKey, context) {
        try {
            logger.info('Starting orchestration phase', { sessionId, phase });
            await this.updateSessionStatus(sessionId, 'processing', phase);
            let result;
            switch (phase) {
                case 'brief':
                    result = await this.handleBriefPhase(sessionId, context, apiKey);
                    break;
                case 'idea_generation':
                    result = await this.handleIdeaGenerationPhase(sessionId, context, apiKey);
                    break;
                case 'review':
                    result = await this.handleReviewPhase(sessionId, context, apiKey);
                    break;
                case 'tournament':
                    result = await this.handleTournamentPhase(sessionId, context, apiKey);
                    break;
                case 'decision':
                    result = await this.handleDecisionPhase(sessionId, context, apiKey);
                    break;
                default:
                    throw new Error(`Unknown phase: ${phase}`);
            }
            // Update session status based on result
            const nextPhase = this.getNextPhase(phase);
            const nextStatus = nextPhase ? 'ready' : 'completed';
            await this.updateSessionStatus(sessionId, nextStatus, nextPhase || phase);
            this.emit('phaseCompleted', { sessionId, phase, result });
            logger.info('Phase completed successfully', { sessionId, phase });
            return result;
        }
        catch (error) {
            logger.error('Phase execution failed', { error, sessionId, phase });
            await this.updateSessionStatus(sessionId, 'error', phase);
            throw error;
        }
    }
    async handleBriefPhase(sessionId, context, apiKey) {
        logger.info('Handling brief phase', { sessionId });
        // Brief phase is just validation and preparation
        // The actual brief data should already be stored in the session
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: { creativeBrief: true }
        });
        if (!session || !session.creativeBrief) {
            throw new Error('Session or creative brief not found');
        }
        // Validate brief completeness
        const brief = session.creativeBrief;
        if (!brief.coreIdea || !brief.genre) {
            throw new Error('Creative brief is incomplete');
        }
        return {
            phase: 'brief',
            success: true,
            data: {
                brief: brief,
                message: 'Creative brief validated successfully'
            },
            timestamp: new Date()
        };
    }
    async handleIdeaGenerationPhase(sessionId, context, apiKey) {
        logger.info('Handling idea generation phase', { sessionId });
        // Get session with creative brief
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: { creativeBrief: true }
        });
        if (!session || !session.creativeBrief) {
            throw new Error('Session or creative brief not found');
        }
        // Generate two ideas using Story Architect and Character Development agents
        const ideas = await this.ideaService.generateIdeas(sessionId, session.creativeBrief, apiKey);
        return {
            phase: 'idea_generation',
            success: true,
            data: {
                ideas: ideas,
                message: `Generated ${ideas.length} ideas successfully`
            },
            timestamp: new Date()
        };
    }
    async handleReviewPhase(sessionId, context, apiKey) {
        logger.info('Handling review phase', { sessionId });
        // Get all ideas for this session
        const ideas = await this.prisma.idea.findMany({
            where: { sessionId }
        });
        if (ideas.length === 0) {
            throw new Error('No ideas found for review');
        }
        // Execute all agents to review all ideas
        const reviews = await this.reviewService.executeIndependentReviews(sessionId, ideas, apiKey);
        return {
            phase: 'review',
            success: true,
            data: {
                reviews: reviews,
                message: `Completed ${reviews.length} independent reviews`
            },
            timestamp: new Date()
        };
    }
    async handleTournamentPhase(sessionId, context, apiKey) {
        logger.info('Handling tournament phase', { sessionId });
        // Get reviews to determine which ideas advance
        const reviews = await this.prisma.review.findMany({
            where: { sessionId },
            include: { idea: true }
        });
        if (reviews.length === 0) {
            throw new Error('No reviews found for tournament');
        }
        // Execute tournament with 8 turns
        const tournament = await this.tournamentService.executeTournament(sessionId, reviews, apiKey);
        return {
            phase: 'tournament',
            success: true,
            data: {
                tournament: tournament,
                message: 'Tournament completed successfully'
            },
            timestamp: new Date()
        };
    }
    async handleDecisionPhase(sessionId, context, apiKey) {
        logger.info('Handling decision phase', { sessionId });
        // Get tournament results
        const tournament = await this.prisma.tournament.findFirst({
            where: { sessionId },
            include: {
                turns: true,
                reviews: true
            }
        });
        if (!tournament) {
            throw new Error('No tournament found for decision phase');
        }
        // Make final decision
        const decision = await this.decisionService.makeFinalDecision(sessionId, tournament, apiKey);
        return {
            phase: 'decision',
            success: true,
            data: {
                decision: decision,
                message: 'Final decision completed successfully'
            },
            timestamp: new Date()
        };
    }
    async updateSessionStatus(sessionId, status, phase) {
        await this.prisma.session.update({
            where: { id: sessionId },
            data: {
                status,
                currentPhase: phase,
                updatedAt: new Date()
            }
        });
        logger.info('Updated session status', { sessionId, status, phase });
    }
    getNextPhase(currentPhase) {
        const phaseOrder = [
            'brief',
            'idea_generation',
            'review',
            'tournament',
            'decision'
        ];
        const currentIndex = phaseOrder.indexOf(currentPhase);
        if (currentIndex === -1 || currentIndex === phaseOrder.length - 1) {
            return null;
        }
        return phaseOrder[currentIndex + 1];
    }
    async getSessionProgress(sessionId) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                creativeBrief: true,
                ideas: true,
                reviews: true,
                tournaments: true,
                finalDecisions: true
            }
        });
        if (!session) {
            throw new Error('Session not found');
        }
        const phaseOrder = [
            'brief',
            'idea_generation',
            'review',
            'tournament',
            'decision'
        ];
        const currentPhaseIndex = phaseOrder.indexOf(session.currentPhase);
        const progress = ((currentPhaseIndex + 1) / phaseOrder.length) * 100;
        return {
            sessionId,
            status: session.status,
            currentPhase: session.currentPhase,
            progress: Math.round(progress),
            phaseOrder,
            completedPhases: phaseOrder.slice(0, currentPhaseIndex + 1),
            remainingPhases: phaseOrder.slice(currentPhaseIndex + 1),
            data: {
                hasBrief: !!session.creativeBrief,
                ideaCount: session.ideas.length,
                reviewCount: session.reviews.length,
                tournamentCount: session.tournaments.length,
                decisionCount: session.finalDecisions.length
            }
        };
    }
    async pauseSession(sessionId) {
        await this.updateSessionStatus(sessionId, 'paused', session.currentPhase);
        this.emit('sessionPaused', { sessionId });
    }
    async resumeSession(sessionId) {
        await this.updateSessionStatus(sessionId, 'ready', session.currentPhase);
        this.emit('sessionResumed', { sessionId });
    }
    async cancelSession(sessionId) {
        await this.updateSessionStatus(sessionId, 'cancelled', session.currentPhase);
        this.emit('sessionCancelled', { sessionId });
    }
    // WebSocket event handlers
    onSessionUpdate(callback) {
        this.on('sessionInitialized', callback);
        this.on('phaseCompleted', callback);
        this.on('sessionPaused', callback);
        this.on('sessionResumed', callback);
        this.on('sessionCancelled', callback);
    }
    removeSessionUpdateListener(callback) {
        this.off('sessionInitialized', callback);
        this.off('phaseCompleted', callback);
        this.off('sessionPaused', callback);
        this.off('sessionResumed', callback);
        this.off('sessionCancelled', callback);
    }
}
//# sourceMappingURL=orchestrator.service.js.map