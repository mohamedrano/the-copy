import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { ApiKeyService } from "../api-key.service";

describe("ApiKeyService", () => {
  let prisma: PrismaClient;
  let apiKeyService: ApiKeyService;
  let testUserId: string;
  let testApiKey: string;

  beforeEach(async () => {
    prisma = new PrismaClient();
    apiKeyService = new ApiKeyService(prisma);
    testUserId = "test-user-id";
    testApiKey = "test-api-key-12345";
  });

  afterEach(async () => {
    // Cleanup all api keys for the test user
    await prisma.apiKey.deleteMany({ where: { userId: testUserId } });
    await prisma.$disconnect();
  });

  describe("createApiKey", () => {
    it("should create a new API key", async () => {
      const apiKey = await apiKeyService.createApiKey(
        testUserId,
        testApiKey,
        "Test Key",
      );

      expect(apiKey).toHaveProperty("id");
      expect(apiKey.userId).toBe(testUserId);
      expect(apiKey.keyName).toBe("Test Key");
      expect(apiKey.isActive).toBe(true);
      expect(apiKey.encryptedKey).toBeDefined();
    });
  });

  describe("getUserApiKeys", () => {
    it("should return API keys for a user", async () => {
      // Create test API key
      await apiKeyService.createApiKey(testUserId, testApiKey, "Test Key");

      const apiKeys = await apiKeyService.getUserApiKeys(testUserId);

      expect(apiKeys).toHaveLength(1);
      expect(apiKeys[0].keyName).toBe("Test Key");
    });

    it("should return empty array for user with no API keys", async () => {
      const apiKeys = await apiKeyService.getUserApiKeys("non-existent-user");

      expect(apiKeys).toHaveLength(0);
    });
  });

  describe("getActiveApiKey", () => {
    it("should return decrypted active API key", async () => {
      // Create test API key
      await apiKeyService.createApiKey(testUserId, testApiKey, "Test Key");

      const decryptedKey = await apiKeyService.getActiveApiKey(testUserId);

      expect(decryptedKey).toBe(testApiKey);
    });

    it("should return null for user with no active API keys", async () => {
      const decryptedKey =
        await apiKeyService.getActiveApiKey("non-existent-user");

      expect(decryptedKey).toBeNull();
    });
  });

  describe("deleteApiKey", () => {
    it("should delete an API key", async () => {
      // Create test API key
      const apiKey = await apiKeyService.createApiKey(
        testUserId,
        testApiKey,
        "Test Key",
      );

      // Delete the API key
      await apiKeyService.deleteApiKey(apiKey.id, testUserId);

      // Try to get the API key
      const apiKeys = await apiKeyService.getUserApiKeys(testUserId);

      expect(apiKeys).toHaveLength(0);
    });
  });

  describe("validateApiKey", () => {
    it("should return true for user with active API key", async () => {
      // Create test API key
      await apiKeyService.createApiKey(testUserId, testApiKey, "Test Key");

      const isValid = await apiKeyService.validateApiKey(testUserId);

      expect(isValid).toBe(true);
    });

    it("should return false for user with no active API keys", async () => {
      const isValid = await apiKeyService.validateApiKey("non-existent-user");

      expect(isValid).toBe(false);
    });
  });
});
