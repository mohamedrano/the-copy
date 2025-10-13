import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema } from 'zod';
export interface ValidationRequest extends FastifyRequest {
    validationError?: string;
}
export declare function validateBody(schema: ZodSchema): (request: ValidationRequest, reply: FastifyReply) => Promise<void>;
export declare function validateQuery(schema: ZodSchema): (request: ValidationRequest, reply: FastifyReply) => Promise<void>;
export declare function validateParams(schema: ZodSchema): (request: ValidationRequest, reply: FastifyReply) => Promise<void>;
//# sourceMappingURL=validate.middleware.d.ts.map