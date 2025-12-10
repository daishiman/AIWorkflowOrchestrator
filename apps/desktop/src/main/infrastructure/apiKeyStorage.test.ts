/**
 * APIキーストレージ テスト
 *
 * TDD Phase: Red（失敗するテストを先に作成）
 *
 * @see docs/30-workflows/api-key-management/architecture.md
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// === Mock Setup ===

// Create persistent mock store instance BEFORE mocking
const mockStoreInstance = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
};

vi.mock("electron", () => ({
  safeStorage: {
    isEncryptionAvailable: vi.fn(),
    encryptString: vi.fn(),
    decryptString: vi.fn(),
  },
}));

vi.mock("electron-store", () => {
  return {
    default: vi.fn(() => mockStoreInstance),
  };
});

// Import AFTER mocks are set up
import { safeStorage } from "electron";
import {
  createApiKeyStorage,
  clearApiKeyStore,
  resetApiKeyStore,
} from "./apiKeyStorage";
import type { AIProvider } from "@repo/shared/types/api-keys";

// === Test Helpers ===

const createMockApiKeyEntry = (
  provider: AIProvider,
  encryptedKey: string = "encrypted-key-base64",
) => ({
  provider,
  encryptedKey,
  createdAt: "2025-12-10T12:00:00.000Z",
  updatedAt: "2025-12-10T12:00:00.000Z",
  lastValidatedAt: null,
});

// === Tests ===

describe("apiKeyStorage", () => {
  beforeEach(() => {
    // Reset mock implementations
    mockStoreInstance.get.mockReset();
    mockStoreInstance.set.mockReset();
    mockStoreInstance.delete.mockReset();
    mockStoreInstance.clear.mockReset();
    vi.mocked(safeStorage.isEncryptionAvailable).mockReset();
    vi.mocked(safeStorage.encryptString).mockReset();
    vi.mocked(safeStorage.decryptString).mockReset();

    // Reset store instance
    resetApiKeyStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // === createApiKeyStorage ===

  describe("createApiKeyStorage", () => {
    it("should return ApiKeyStorage interface with all required methods", () => {
      const storage = createApiKeyStorage();

      expect(storage).toHaveProperty("saveApiKey");
      expect(storage).toHaveProperty("getApiKey");
      expect(storage).toHaveProperty("deleteApiKey");
      expect(storage).toHaveProperty("listProviders");
      expect(storage).toHaveProperty("hasApiKey");
    });
  });

  // === saveApiKey ===

  describe("saveApiKey", () => {
    it("should encrypt and save API key when encryption is available", async () => {
      const storage = createApiKeyStorage();
      const apiKey = "sk-test1234567890abcdef";
      const encryptedBuffer = Buffer.from("encrypted-api-key");

      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(true);
      vi.mocked(safeStorage.encryptString).mockReturnValue(encryptedBuffer);
      mockStoreInstance.get.mockReturnValue({});

      const result = await storage.saveApiKey("openai", apiKey);

      expect(result.success).toBe(true);
      expect(safeStorage.encryptString).toHaveBeenCalledWith(apiKey);
      expect(mockStoreInstance.set).toHaveBeenCalled();
    });

    it("should store API key in plain text in development mode when encryption is not available", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const storage = createApiKeyStorage();
      const apiKey = "sk-test1234567890abcdef";

      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(false);
      mockStoreInstance.get.mockReturnValue({});

      const result = await storage.saveApiKey("openai", apiKey);

      expect(result.success).toBe(true);
      expect(safeStorage.encryptString).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it("should return error in production mode when encryption is not available", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const storage = createApiKeyStorage();
      const apiKey = "sk-test1234567890abcdef";

      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(false);

      const result = await storage.saveApiKey("openai", apiKey);

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe("api-key/encryption-not-available");

      process.env.NODE_ENV = originalEnv;
    });

    it("should overwrite existing API key for the same provider", async () => {
      const storage = createApiKeyStorage();
      const existingEntry = createMockApiKeyEntry(
        "openai",
        "old-encrypted-key",
      );
      const newApiKey = "sk-newkey1234567890";
      const newEncryptedBuffer = Buffer.from("new-encrypted-api-key");

      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(true);
      vi.mocked(safeStorage.encryptString).mockReturnValue(newEncryptedBuffer);
      mockStoreInstance.get.mockReturnValue({ openai: existingEntry });

      const result = await storage.saveApiKey("openai", newApiKey);

      expect(result.success).toBe(true);
      expect(mockStoreInstance.set).toHaveBeenCalledWith(
        "apiKeys",
        expect.objectContaining({
          openai: expect.objectContaining({
            provider: "openai",
            encryptedKey: newEncryptedBuffer.toString("base64"),
          }),
        }),
      );
    });

    it("should set createdAt and updatedAt timestamps", async () => {
      const storage = createApiKeyStorage();
      const apiKey = "sk-test1234567890abcdef";
      const encryptedBuffer = Buffer.from("encrypted-api-key");

      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(true);
      vi.mocked(safeStorage.encryptString).mockReturnValue(encryptedBuffer);
      mockStoreInstance.get.mockReturnValue({});

      await storage.saveApiKey("anthropic", apiKey);

      expect(mockStoreInstance.set).toHaveBeenCalledWith(
        "apiKeys",
        expect.objectContaining({
          anthropic: expect.objectContaining({
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        }),
      );
    });

    it("should handle store error gracefully", async () => {
      const storage = createApiKeyStorage();
      const apiKey = "sk-test1234567890abcdef";
      const encryptedBuffer = Buffer.from("encrypted-api-key");

      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(true);
      vi.mocked(safeStorage.encryptString).mockReturnValue(encryptedBuffer);
      mockStoreInstance.get.mockReturnValue({});
      mockStoreInstance.set.mockImplementation(() => {
        throw new Error("Store write failed");
      });

      const result = await storage.saveApiKey("openai", apiKey);

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe("api-key/save-failed");
    });

    it("should handle encryption error gracefully", async () => {
      const storage = createApiKeyStorage();
      const apiKey = "sk-test1234567890abcdef";

      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(true);
      vi.mocked(safeStorage.encryptString).mockImplementation(() => {
        throw new Error("Encryption failed");
      });
      mockStoreInstance.get.mockReturnValue({});

      const result = await storage.saveApiKey("openai", apiKey);

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe("api-key/encryption-failed");
    });

    it("should save API keys for all supported providers", async () => {
      const storage = createApiKeyStorage();
      const encryptedBuffer = Buffer.from("encrypted-api-key");
      const providers: AIProvider[] = ["openai", "anthropic", "google", "xai"];

      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(true);
      vi.mocked(safeStorage.encryptString).mockReturnValue(encryptedBuffer);

      for (const provider of providers) {
        mockStoreInstance.get.mockReturnValue({});
        const result = await storage.saveApiKey(provider, `${provider}-key`);
        expect(result.success).toBe(true);
      }
    });
  });

  // === getApiKey ===

  describe("getApiKey", () => {
    it("should decrypt and return API key when encryption is available", async () => {
      const storage = createApiKeyStorage();
      const decryptedKey = "sk-test1234567890abcdef";
      const encryptedBase64 = Buffer.from("encrypted-data").toString("base64");
      const entry = createMockApiKeyEntry("openai", encryptedBase64);

      mockStoreInstance.get.mockReturnValue({ openai: entry });
      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(true);
      vi.mocked(safeStorage.decryptString).mockReturnValue(decryptedKey);

      const result = await storage.getApiKey("openai");

      expect(result).toBe(decryptedKey);
      expect(safeStorage.decryptString).toHaveBeenCalledWith(
        Buffer.from(encryptedBase64, "base64"),
      );
    });

    it("should return plain text key when encryption is not available (development)", async () => {
      const storage = createApiKeyStorage();
      const plainKey = "sk-test1234567890abcdef";
      const entry = createMockApiKeyEntry("openai", plainKey);

      mockStoreInstance.get.mockReturnValue({ openai: entry });
      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(false);

      const result = await storage.getApiKey("openai");

      expect(result).toBe(plainKey);
      expect(safeStorage.decryptString).not.toHaveBeenCalled();
    });

    it("should return null when API key is not registered", async () => {
      const storage = createApiKeyStorage();

      mockStoreInstance.get.mockReturnValue({});

      const result = await storage.getApiKey("openai");

      expect(result).toBeNull();
    });

    it("should return null when provider entry does not exist", async () => {
      const storage = createApiKeyStorage();

      mockStoreInstance.get.mockReturnValue({
        anthropic: createMockApiKeyEntry("anthropic"),
      });

      const result = await storage.getApiKey("openai");

      expect(result).toBeNull();
    });

    it("should return null on decryption error", async () => {
      const storage = createApiKeyStorage();
      const entry = createMockApiKeyEntry("openai", "encrypted-data");

      mockStoreInstance.get.mockReturnValue({ openai: entry });
      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(true);
      vi.mocked(safeStorage.decryptString).mockImplementation(() => {
        throw new Error("Decryption failed");
      });

      const result = await storage.getApiKey("openai");

      expect(result).toBeNull();
    });

    it("should not log API key value in any case", async () => {
      const consoleSpy = vi.spyOn(console, "log");
      const consoleErrorSpy = vi.spyOn(console, "error");

      const storage = createApiKeyStorage();
      const decryptedKey = "sk-test1234567890abcdef";
      const entry = createMockApiKeyEntry("openai");

      mockStoreInstance.get.mockReturnValue({ openai: entry });
      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(true);
      vi.mocked(safeStorage.decryptString).mockReturnValue(decryptedKey);

      await storage.getApiKey("openai");

      // Check that API key is not in any log calls
      const allLogCalls = [
        ...consoleSpy.mock.calls.flat(),
        ...consoleErrorSpy.mock.calls.flat(),
      ].join(" ");

      expect(allLogCalls).not.toContain(decryptedKey);

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  // === deleteApiKey ===

  describe("deleteApiKey", () => {
    it("should delete API key for specified provider", async () => {
      const storage = createApiKeyStorage();
      const entry = createMockApiKeyEntry("openai");

      mockStoreInstance.get.mockReturnValue({ openai: entry });

      const result = await storage.deleteApiKey("openai");

      expect(result.success).toBe(true);
      expect(mockStoreInstance.set).toHaveBeenCalledWith(
        "apiKeys",
        expect.not.objectContaining({ openai: expect.anything() }),
      );
    });

    it("should return success even when API key does not exist", async () => {
      const storage = createApiKeyStorage();

      mockStoreInstance.get.mockReturnValue({});

      const result = await storage.deleteApiKey("openai");

      expect(result.success).toBe(true);
    });

    it("should not affect other providers when deleting", async () => {
      const storage = createApiKeyStorage();
      const openaiEntry = createMockApiKeyEntry("openai");
      const anthropicEntry = createMockApiKeyEntry("anthropic");

      mockStoreInstance.get.mockReturnValue({
        openai: openaiEntry,
        anthropic: anthropicEntry,
      });

      await storage.deleteApiKey("openai");

      expect(mockStoreInstance.set).toHaveBeenCalledWith(
        "apiKeys",
        expect.objectContaining({
          anthropic: anthropicEntry,
        }),
      );
    });

    it("should handle store error gracefully", async () => {
      const storage = createApiKeyStorage();

      mockStoreInstance.get.mockReturnValue({
        openai: createMockApiKeyEntry("openai"),
      });
      mockStoreInstance.set.mockImplementation(() => {
        throw new Error("Store write failed");
      });

      const result = await storage.deleteApiKey("openai");

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe("api-key/delete-failed");
    });
  });

  // === listProviders ===

  describe("listProviders", () => {
    it("should return status for all 4 providers", async () => {
      const storage = createApiKeyStorage();

      mockStoreInstance.get.mockReturnValue({});

      const result = await storage.listProviders();

      expect(result.providers).toHaveLength(4);
      expect(result.totalCount).toBe(4);
    });

    it("should return registered status for saved providers", async () => {
      const storage = createApiKeyStorage();
      const openaiEntry = createMockApiKeyEntry("openai");

      mockStoreInstance.get.mockReturnValue({ openai: openaiEntry });

      const result = await storage.listProviders();

      const openaiStatus = result.providers.find(
        (p) => p.provider === "openai",
      );
      expect(openaiStatus?.status).toBe("registered");
    });

    it("should return not_registered status for unsaved providers", async () => {
      const storage = createApiKeyStorage();

      mockStoreInstance.get.mockReturnValue({});

      const result = await storage.listProviders();

      const openaiStatus = result.providers.find(
        (p) => p.provider === "openai",
      );
      expect(openaiStatus?.status).toBe("not_registered");
    });

    it("should include display names for all providers", async () => {
      const storage = createApiKeyStorage();

      mockStoreInstance.get.mockReturnValue({});

      const result = await storage.listProviders();

      expect(result.providers.map((p) => p.displayName)).toEqual(
        expect.arrayContaining(["OpenAI", "Anthropic", "Google AI", "xAI"]),
      );
    });

    it("should count registered providers correctly", async () => {
      const storage = createApiKeyStorage();

      mockStoreInstance.get.mockReturnValue({
        openai: createMockApiKeyEntry("openai"),
        anthropic: createMockApiKeyEntry("anthropic"),
      });

      const result = await storage.listProviders();

      expect(result.registeredCount).toBe(2);
      expect(result.totalCount).toBe(4);
    });

    it("should include lastValidatedAt when available", async () => {
      const storage = createApiKeyStorage();
      const entry = {
        ...createMockApiKeyEntry("openai"),
        lastValidatedAt: "2025-12-10T15:00:00.000Z",
      };

      mockStoreInstance.get.mockReturnValue({ openai: entry });

      const result = await storage.listProviders();

      const openaiStatus = result.providers.find(
        (p) => p.provider === "openai",
      );
      expect(openaiStatus?.lastValidatedAt).toBe("2025-12-10T15:00:00.000Z");
    });

    it("should not expose API key values in the result", async () => {
      const storage = createApiKeyStorage();
      const entry = createMockApiKeyEntry("openai", "sensitive-encrypted-key");

      mockStoreInstance.get.mockReturnValue({ openai: entry });

      const result = await storage.listProviders();

      const resultString = JSON.stringify(result);
      expect(resultString).not.toContain("sensitive-encrypted-key");
      expect(resultString).not.toContain("encryptedKey");
    });
  });

  // === hasApiKey ===

  describe("hasApiKey", () => {
    it("should return true when API key is registered", async () => {
      const storage = createApiKeyStorage();

      mockStoreInstance.get.mockReturnValue({
        openai: createMockApiKeyEntry("openai"),
      });

      const result = await storage.hasApiKey("openai");

      expect(result).toBe(true);
    });

    it("should return false when API key is not registered", async () => {
      const storage = createApiKeyStorage();

      mockStoreInstance.get.mockReturnValue({});

      const result = await storage.hasApiKey("openai");

      expect(result).toBe(false);
    });

    it("should return false for unregistered provider when others are registered", async () => {
      const storage = createApiKeyStorage();

      mockStoreInstance.get.mockReturnValue({
        anthropic: createMockApiKeyEntry("anthropic"),
      });

      const result = await storage.hasApiKey("openai");

      expect(result).toBe(false);
    });
  });

  // === clearApiKeyStore (test utility) ===

  describe("clearApiKeyStore", () => {
    it("should clear the entire store", () => {
      clearApiKeyStore();

      expect(mockStoreInstance.clear).toHaveBeenCalled();
    });
  });

  // === Security Tests ===

  describe("Security", () => {
    it("should never return encrypted key in any public method result", async () => {
      const storage = createApiKeyStorage();
      const secretKey = "sk-super-secret-key-12345";
      const encryptedBuffer = Buffer.from("encrypted-secret");

      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(true);
      vi.mocked(safeStorage.encryptString).mockReturnValue(encryptedBuffer);
      mockStoreInstance.get.mockReturnValue({
        openai: createMockApiKeyEntry(
          "openai",
          encryptedBuffer.toString("base64"),
        ),
      });

      // saveApiKey result
      const saveResult = await storage.saveApiKey("openai", secretKey);
      expect(JSON.stringify(saveResult)).not.toContain(secretKey);

      // deleteApiKey result
      const deleteResult = await storage.deleteApiKey("openai");
      expect(JSON.stringify(deleteResult)).not.toContain(secretKey);

      // listProviders result
      const listResult = await storage.listProviders();
      expect(JSON.stringify(listResult)).not.toContain(secretKey);
      expect(JSON.stringify(listResult)).not.toContain("encryptedKey");
    });

    it("should sanitize error messages to not include API key", async () => {
      const storage = createApiKeyStorage();
      const secretKey = "sk-super-secret-key-12345";

      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(true);
      vi.mocked(safeStorage.encryptString).mockImplementation(() => {
        throw new Error(`Failed to encrypt: ${secretKey}`);
      });
      mockStoreInstance.get.mockReturnValue({});

      const result = await storage.saveApiKey("openai", secretKey);

      expect(result.success).toBe(false);
      expect(result.errorMessage).not.toContain(secretKey);
      expect(result.errorMessage).not.toContain("sk-");
    });
  });
});
