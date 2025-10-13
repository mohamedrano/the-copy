import { FastifyRequest, FastifyReply } from 'fastify';
export interface AuthenticatedRequest extends FastifyRequest {
    user?: {
        id: string;
        email: string;
        name: string;
    };
}
export declare function authMiddleware(request: AuthenticatedRequest, reply: FastifyReply): Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map