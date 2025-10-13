export declare function encryptApiKey(apiKey: string): string;
export declare function decryptApiKey(encryptedApiKey: string): string;
export declare function hashPassword(password: string): Promise<string>;
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
//# sourceMappingURL=encryption.d.ts.map