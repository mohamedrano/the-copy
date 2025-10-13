export interface TokenPayload {
    userId: string;
    email: string;
    name: string;
    type: 'access' | 'refresh';
}
export declare function generateTokens(userId: string, email?: string, name?: string): {
    accessToken: string;
    refreshToken: string;
};
export declare function verifyToken(token: string): TokenPayload;
export declare function decodeToken(token: string): TokenPayload | null;
//# sourceMappingURL=jwt.d.ts.map