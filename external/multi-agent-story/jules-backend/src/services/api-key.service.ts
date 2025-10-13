import { PrismaClient } from "@prisma/client";
import { encryptApiKey, decryptApiKey } from "@/utils/encryption";
import { logger } from "@/utils/logger";

export class ApiKeyService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createApiKey(userId: string, apiKey: string, keyName: string) {
    try {
      const encryptedKey = encryptApiKey(apiKey);

      const savedKey = await this.prisma.apiKey.create({
        data: {
          userId,
          keyName,
          encryptedKey,
          isActive: true,
        },
      });

      logger.info("API key created", { userId, keyName });
      return savedKey;
    } catch (error) {
      logger.error("Failed to create API key", { error, userId });
      throw error;
    }
  }

  async getUserApiKeys(userId: string) {
    try {
      const apiKeys = await this.prisma.apiKey.findMany({
        where: {
          userId,
          isActive: true,
        },
        select: {
          id: true,
          keyName: true,
          createdAt: true,
          lastUsedAt: true,
        },
      });

      return apiKeys;
    } catch (error) {
      logger.error("Failed to get user API keys", { error, userId });
      throw error;
    }
  }

  async getActiveApiKey(userId: string) {
    try {
      const apiKey = await this.prisma.apiKey.findFirst({
        where: {
          userId,
          isActive: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!apiKey) {
        return null;
      }

      const decryptedKey = decryptApiKey(apiKey.encryptedKey);

      // Update last used timestamp
      await this.prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      });

      return decryptedKey;
    } catch (error) {
      logger.error("Failed to get active API key", { error, userId });
      throw error;
    }
  }

  async deleteApiKey(keyId: string, userId: string) {
    try {
      await this.prisma.apiKey.updateMany({
        where: {
          id: keyId,
          userId,
        },
        data: {
          isActive: false,
        },
      });

      logger.info("API key deleted", { keyId, userId });
    } catch (error) {
      logger.error("Failed to delete API key", { error, keyId, userId });
      throw error;
    }
  }

  async validateApiKey(userId: string): Promise<boolean> {
    try {
      const apiKey = await this.prisma.apiKey.findFirst({
        where: {
          userId,
          isActive: true,
        },
      });

      return !!apiKey;
    } catch (error) {
      logger.error("Failed to validate API key", { error, userId });
      return false;
    }
  }
}
