import { PrismaClient, Review, Idea } from '@prisma/client';
import { AgentService } from './agent.service';
export declare class ReviewService {
    private prisma;
    private agentService;
    constructor(prisma: PrismaClient, agentService: AgentService);
    executeIndependentReviews(sessionId: string, ideas: Idea[], apiKey: string): Promise<Review[]>;
    private executeSingleReview;
    private parseReviewResponse;
    private parseList;
    getReviewsBySession(sessionId: string): Promise<Review[]>;
    getReviewsByIdea(ideaId: string): Promise<Review[]>;
    getReviewSummary(sessionId: string): Promise<any>;
    private groupReviewsByAgent;
    updateReviewStatus(reviewId: string, status: string): Promise<void>;
}
//# sourceMappingURL=review.service.d.ts.map