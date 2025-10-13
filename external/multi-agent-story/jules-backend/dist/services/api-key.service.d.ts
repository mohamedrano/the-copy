import { PrismaClient } from '@prisma/client';
export declare class ApiKeyService {
    private prisma;
    constructor(prisma: PrismaClient);
    createApiKey(userId: string, apiKey: string, keyName: string): Promise<{
        id: string;
        keyName: string;
        encryptedKey: string;
        isActive: boolean;
        createdAt: Date;
        lastUsedAt: Date | null;
        updatedAt: Date;
        userId: string;
    }>;
    getUserApiKeys(userId: string): Promise<{
        id: string;
        keyName: string;
        createdAt: Date;
        lastUsedAt: Date | null;
    }[]>;
    getActiveApiKey(userId: string): Promise<string | null>;
    deleteApiKey(keyId: string, userId: string): Promise<void>;
    validateApiKey(userId: string): Promise<boolean>;
}
//# sourceMappingURL=api-key.service.d.ts.map