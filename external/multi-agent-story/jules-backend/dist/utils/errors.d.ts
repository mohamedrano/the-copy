export declare class JulesError extends Error {
    statusCode: number;
    errorCode: string;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, errorCode?: string, isOperational?: boolean);
}
export declare class ValidationError extends JulesError {
    constructor(message: string, field?: string);
}
export declare class AuthenticationError extends JulesError {
    constructor(message?: string);
}
export declare class AuthorizationError extends JulesError {
    constructor(message?: string);
}
export declare class NotFoundError extends JulesError {
    constructor(message?: string);
}
export declare class ConflictError extends JulesError {
    constructor(message?: string);
}
export declare class RateLimitError extends JulesError {
    constructor(message?: string);
}
export declare class GeminiAPIError extends JulesError {
    constructor(message?: string);
}
export declare class DatabaseError extends JulesError {
    constructor(message?: string);
}
export declare class SessionError extends JulesError {
    constructor(message?: string);
}
export declare class AgentError extends JulesError {
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map