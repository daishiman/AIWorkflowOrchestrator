/**
 * APIキーIPCハンドラー テスト
 *
 * TDD Phase: Red（失敗するテストを先に作成）
 *
 * @see docs/30-workflows/api-key-management/architecture.md
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";

// === Mock Setup ===

// Mock API Key Storage
const mockSaveApiKey = vi.fn();
const mockGetApiKey = vi.fn();
const mockDeleteApiKey = vi.fn();
const mockListProviders = vi.fn();
const mockHasApiKey = vi.fn();

const mockApiKeyStorage = {
  saveApiKey: mockSaveApiKey,
  getApiKey: mockGetApiKey,
  deleteApiKey: mockDeleteApiKey,
  listProviders: mockListProviders,
  hasApiKey: mockHasApiKey,
};

// Mock API Key Validator
const mockValidateApiKey = vi.fn();

// Mock BrowserWindow
const mockWebContentsSend = vi.fn();
const mockMainWindow = {
  webContents: {
    send: mockWebContentsSend,
  },
  isDestroyed: () => false,
} as unknown as BrowserWindowType;

// Mock electron modules
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
  BrowserWindow: {
    fromWebContents: vi.fn().mockReturnValue({ id: 1 }),
  },
  safeStorage: {
    isEncryptionAvailable: vi.fn(() => true),
    encryptString: vi.fn((str: string) => Buffer.from(`encrypted:${str}`)),
    decryptString: vi.fn((buf: Buffer) =>
      buf.toString().replace("encrypted:", ""),
    ),
  },
}));

// Mock ipc-validator to pass validation
vi.mock("../infrastructure/security/ipc-validator.js", () => ({
  withValidation: vi.fn(
    (
      _channel: string,
      handler: (...args: unknown[]) => Promise<unknown>,
      _options: unknown,
    ) => handler,
  ),
}));

// Mock electron-store
vi.mock("electron-store", () => ({
  default: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
  })),
}));

// Mock apiKeyStorage module
vi.mock("../infrastructure/apiKeyStorage.js", () => ({
  createApiKeyStorage: vi.fn(() => mockApiKeyStorage),
}));

// Mock @repo/shared/types/api-keys
vi.mock("@repo/shared/types/api-keys", () => ({
  isValidAIProvider: (provider: unknown) =>
    typeof provider === "string" &&
    ["openai", "anthropic", "google", "xai"].includes(provider),
  API_KEY_ERROR_CODES: {
    SAVE_FAILED: "api-key/save-failed",
    ENCRYPTION_FAILED: "api-key/encryption-failed",
    ENCRYPTION_NOT_AVAILABLE: "api-key/encryption-not-available",
    GET_FAILED: "api-key/get-failed",
    DECRYPTION_FAILED: "api-key/decryption-failed",
    NOT_FOUND: "api-key/not-found",
    DELETE_FAILED: "api-key/delete-failed",
    VALIDATION_FAILED: "api-key/validation-failed",
    VALIDATION_TIMEOUT: "api-key/validation-timeout",
    VALIDATION_NETWORK_ERROR: "api-key/validation-network-error",
    INVALID_PROVIDER: "api-key/invalid-provider",
    INVALID_API_KEY_FORMAT: "api-key/invalid-api-key-format",
    EMPTY_API_KEY: "api-key/empty-api-key",
    API_KEY_TOO_LONG: "api-key/api-key-too-long",
    IPC_FORBIDDEN: "api-key/ipc-forbidden",
    IPC_INVALID_SENDER: "api-key/ipc-invalid-sender",
  },
  API_KEY_CONSTRAINTS: {
    minLength: 1,
    maxLength: 256,
    forbiddenPattern: /[<>'";&|]/,
  },
  AI_PROVIDERS: ["openai", "anthropic", "google", "xai"],
  AI_PROVIDER_META: {
    openai: {
      id: "openai",
      displayName: "OpenAI",
      keyPrefix: "sk-",
      validationEndpoint: "https://api.openai.com/v1/models",
      validationMethod: "GET",
    },
    anthropic: {
      id: "anthropic",
      displayName: "Anthropic",
      keyPrefix: "sk-ant-",
      validationEndpoint: "https://api.anthropic.com/v1/messages",
      validationMethod: "POST",
    },
    google: {
      id: "google",
      displayName: "Google AI",
      keyPrefix: undefined,
      validationEndpoint: "https://generativelanguage.googleapis.com/v1/models",
      validationMethod: "GET",
    },
    xai: {
      id: "xai",
      displayName: "xAI",
      keyPrefix: "xai-",
      validationEndpoint: "https://api.x.ai/v1/models",
      validationMethod: "GET",
    },
  },
  apiKeySaveInputSchema: {
    parse: vi.fn((input) => input),
    safeParse: vi.fn((input) => ({ success: true, data: input })),
  },
  apiKeyDeleteInputSchema: {
    parse: vi.fn((input) => input),
    safeParse: vi.fn((input) => ({ success: true, data: input })),
  },
  apiKeyValidateInputSchema: {
    parse: vi.fn((input) => input),
    safeParse: vi.fn((input) => ({ success: true, data: input })),
  },
}));

// Import after mocks
import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";

// === Type Definitions ===

interface IPCResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

type AIProvider = "openai" | "anthropic" | "google" | "xai";

// === Tests ===

describe("apiKeyHandlers", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    // Default mock responses
    mockSaveApiKey.mockResolvedValue({ success: true });
    mockGetApiKey.mockResolvedValue(null);
    mockDeleteApiKey.mockResolvedValue({ success: true });
    mockListProviders.mockResolvedValue({
      providers: [
        {
          provider: "openai",
          displayName: "OpenAI",
          status: "not_registered",
          lastValidatedAt: null,
        },
        {
          provider: "anthropic",
          displayName: "Anthropic",
          status: "not_registered",
          lastValidatedAt: null,
        },
        {
          provider: "google",
          displayName: "Google AI",
          status: "not_registered",
          lastValidatedAt: null,
        },
        {
          provider: "xai",
          displayName: "xAI",
          status: "not_registered",
          lastValidatedAt: null,
        },
      ],
      registeredCount: 0,
      totalCount: 4,
    });
    mockHasApiKey.mockResolvedValue(false);
    mockValidateApiKey.mockResolvedValue({
      provider: "openai",
      status: "valid",
      validatedAt: new Date().toISOString(),
    });

    // Capture registered handlers
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    // Try to import and register handlers (will fail in Red phase)
    try {
      const { registerApiKeyHandlers } = await import("./apiKeyHandlers");
      registerApiKeyHandlers(mockMainWindow, mockApiKeyStorage);
    } catch {
      // Expected in Red phase - module doesn't exist or throws
    }
  });

  afterEach(() => {
    vi.resetModules();
  });

  // === Handler Registration ===

  describe("registerApiKeyHandlers", () => {
    it("should register API_KEY_SAVE handler", () => {
      expect(handlers.has(IPC_CHANNELS.API_KEY_SAVE)).toBe(true);
    });

    it("should register API_KEY_DELETE handler", () => {
      expect(handlers.has(IPC_CHANNELS.API_KEY_DELETE)).toBe(true);
    });

    it("should register API_KEY_VALIDATE handler", () => {
      expect(handlers.has(IPC_CHANNELS.API_KEY_VALIDATE)).toBe(true);
    });

    it("should register API_KEY_LIST handler", () => {
      expect(handlers.has(IPC_CHANNELS.API_KEY_LIST)).toBe(true);
    });

    it("should NOT expose API_KEY_GET handler (security)", () => {
      // apiKey:get is internal only, not registered as IPC handler
      expect(handlers.has("apiKey:get")).toBe(false);
    });
  });

  // === API_KEY_SAVE Handler ===

  describe("API_KEY_SAVE handler", () => {
    it("should save API key for valid provider", async () => {
      const handler = handlers.get(IPC_CHANNELS.API_KEY_SAVE);
      if (!handler) {
        throw new Error("API_KEY_SAVE handler not registered");
      }

      mockSaveApiKey.mockResolvedValue({ success: true });

      const result = (await handler(
        {},
        { provider: "openai", apiKey: "sk-test1234567890" },
      )) as IPCResponse<{ provider: AIProvider; savedAt: string }>;

      expect(result.success).toBe(true);
      expect(mockSaveApiKey).toHaveBeenCalledWith(
        "openai",
        "sk-test1234567890",
      );
    });

    it("should save API key for all supported providers", async () => {
      const handler = handlers.get(IPC_CHANNELS.API_KEY_SAVE);
      if (!handler) {
        throw new Error("API_KEY_SAVE handler not registered");
      }

      const providers: AIProvider[] = ["openai", "anthropic", "google", "xai"];

      for (const provider of providers) {
        mockSaveApiKey.mockResolvedValue({ success: true });

        const result = (await handler(
          {},
          { provider, apiKey: `${provider}-key-123` },
        )) as IPCResponse<{ provider: AIProvider; savedAt: string }>;

        expect(result.success).toBe(true);
      }
    });

    it("should return error for invalid provider", async () => {
      const handler = handlers.get(IPC_CHANNELS.API_KEY_SAVE);
      if (!handler) {
        throw new Error("API_KEY_SAVE handler not registered");
      }

      const result = (await handler(
        {},
        { provider: "invalid-provider", apiKey: "test-key" },
      )) as IPCResponse<void>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("api-key/invalid-provider");
    });

    it("should return error for empty API key", async () => {
      const handler = handlers.get(IPC_CHANNELS.API_KEY_SAVE);
      if (!handler) {
        throw new Error("API_KEY_SAVE handler not registered");
      }

      const result = (await handler(
        {},
        { provider: "openai", apiKey: "" },
      )) as IPCResponse<void>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("api-key/empty-api-key");
    });

    it("should return error on storage failure", async () => {
      const handler = handlers.get(IPC_CHANNELS.API_KEY_SAVE);
      if (!handler) {
        throw new Error("API_KEY_SAVE handler not registered");
      }

      mockSaveApiKey.mockResolvedValue({
        success: false,
        errorCode: "api-key/save-failed",
        errorMessage: "Storage error",
      });

      const result = (await handler(
        {},
        { provider: "openai", apiKey: "sk-test123" },
      )) as IPCResponse<void>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("api-key/save-failed");
    });

    it("should not log API key value", async () => {
      const handler = handlers.get(IPC_CHANNELS.API_KEY_SAVE);
      if (!handler) {
        throw new Error("API_KEY_SAVE handler not registered");
      }

      const consoleSpy = vi.spyOn(console, "log");
      const consoleErrorSpy = vi.spyOn(console, "error");

      const secretKey = "sk-super-secret-key-12345";
      mockSaveApiKey.mockResolvedValue({ success: true });

      await handler({}, { provider: "openai", apiKey: secretKey });

      const allLogCalls = [
        ...consoleSpy.mock.calls.flat(),
        ...consoleErrorSpy.mock.calls.flat(),
      ].join(" ");

      expect(allLogCalls).not.toContain(secretKey);

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  // === API_KEY_DELETE Handler ===

  describe("API_KEY_DELETE handler", () => {
    it("should delete API key for valid provider", async () => {
      const handler = handlers.get(IPC_CHANNELS.API_KEY_DELETE);
      if (!handler) {
        throw new Error("API_KEY_DELETE handler not registered");
      }

      mockDeleteApiKey.mockResolvedValue({ success: true });

      const result = (await handler(
        {},
        { provider: "openai" },
      )) as IPCResponse<{ provider: AIProvider; deletedAt: string }>;

      expect(result.success).toBe(true);
      expect(mockDeleteApiKey).toHaveBeenCalledWith("openai");
    });

    it("should return success even if key does not exist (idempotent)", async () => {
      const handler = handlers.get(IPC_CHANNELS.API_KEY_DELETE);
      if (!handler) {
        throw new Error("API_KEY_DELETE handler not registered");
      }

      mockDeleteApiKey.mockResolvedValue({ success: true });

      const result = (await handler(
        {},
        { provider: "anthropic" },
      )) as IPCResponse<{ provider: AIProvider; deletedAt: string }>;

      expect(result.success).toBe(true);
    });

    it("should return error for invalid provider", async () => {
      const handler = handlers.get(IPC_CHANNELS.API_KEY_DELETE);
      if (!handler) {
        throw new Error("API_KEY_DELETE handler not registered");
      }

      const result = (await handler(
        {},
        { provider: "invalid" },
      )) as IPCResponse<void>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("api-key/invalid-provider");
    });

    it("should return error on storage failure", async () => {
      const handler = handlers.get(IPC_CHANNELS.API_KEY_DELETE);
      if (!handler) {
        throw new Error("API_KEY_DELETE handler not registered");
      }

      mockDeleteApiKey.mockResolvedValue({
        success: false,
        errorCode: "api-key/delete-failed",
        errorMessage: "Storage error",
      });

      const result = (await handler(
        {},
        { provider: "openai" },
      )) as IPCResponse<void>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("api-key/delete-failed");
    });
  });

  // === API_KEY_VALIDATE Handler ===

  describe("API_KEY_VALIDATE handler", () => {
    it("should validate API key against provider API", async () => {
      const handler = handlers.get(IPC_CHANNELS.API_KEY_VALIDATE);
      if (!handler) {
        throw new Error("API_KEY_VALIDATE handler not registered");
      }

      // Note: Validation will call external API, mock the response
      const result = (await handler(
        {},
        { provider: "openai", apiKey: "sk-valid-key-123" },
      )) as IPCResponse<{
        provider: AIProvider;
        status: string;
        validatedAt: string;
      }>;

      expect(result.success).toBe(true);
      expect(result.data?.provider).toBe("openai");
      expect(result.data?.status).toBeDefined();
    });

    it("should return validation result for invalid key", async () => {
      const handler = handlers.get(IPC_CHANNELS.API_KEY_VALIDATE);
      if (!handler) {
        throw new Error("API_KEY_VALIDATE handler not registered");
      }

      const result = (await handler(
        {},
        { provider: "openai", apiKey: "invalid-key" },
      )) as IPCResponse<{
        provider: AIProvider;
        status: string;
        validatedAt: string;
        errorMessage?: string;
      }>;

      // Even for invalid key, the handler should succeed (returning validation result)
      expect(result.success).toBe(true);
      // The status in data indicates whether key is valid
      expect(result.data?.status).toBeDefined();
    });

    it("should return error for invalid provider", async () => {
      const handler = handlers.get(IPC_CHANNELS.API_KEY_VALIDATE);
      if (!handler) {
        throw new Error("API_KEY_VALIDATE handler not registered");
      }

      const result = (await handler(
        {},
        { provider: "invalid", apiKey: "test-key" },
      )) as IPCResponse<void>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("api-key/invalid-provider");
    });

    it("should handle network timeout", async () => {
      const handler = handlers.get(IPC_CHANNELS.API_KEY_VALIDATE);
      if (!handler) {
        throw new Error("API_KEY_VALIDATE handler not registered");
      }

      // Mock timeout scenario
      const result = (await handler(
        {},
        { provider: "openai", apiKey: "sk-test-timeout" },
      )) as IPCResponse<{
        provider: AIProvider;
        status: string;
        validatedAt: string;
      }>;

      expect(result.success).toBe(true);
      // timeout status should be in data.status, not as error
      expect(result.data).toBeDefined();
    });

    it("should not log API key in validation errors", async () => {
      const handler = handlers.get(IPC_CHANNELS.API_KEY_VALIDATE);
      if (!handler) {
        throw new Error("API_KEY_VALIDATE handler not registered");
      }

      const consoleSpy = vi.spyOn(console, "log");
      const consoleErrorSpy = vi.spyOn(console, "error");

      const secretKey = "sk-secret-validation-key";

      await handler({}, { provider: "openai", apiKey: secretKey });

      const allLogCalls = [
        ...consoleSpy.mock.calls.flat(),
        ...consoleErrorSpy.mock.calls.flat(),
      ].join(" ");

      expect(allLogCalls).not.toContain(secretKey);

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  // === API_KEY_LIST Handler ===

  describe("API_KEY_LIST handler", () => {
    it("should return all provider statuses", async () => {
      const handler = handlers.get(IPC_CHANNELS.API_KEY_LIST);
      if (!handler) {
        throw new Error("API_KEY_LIST handler not registered");
      }

      mockListProviders.mockResolvedValue({
        providers: [
          {
            provider: "openai",
            displayName: "OpenAI",
            status: "registered",
            lastValidatedAt: "2025-12-10T12:00:00.000Z",
          },
          {
            provider: "anthropic",
            displayName: "Anthropic",
            status: "not_registered",
            lastValidatedAt: null,
          },
          {
            provider: "google",
            displayName: "Google AI",
            status: "not_registered",
            lastValidatedAt: null,
          },
          {
            provider: "xai",
            displayName: "xAI",
            status: "not_registered",
            lastValidatedAt: null,
          },
        ],
        registeredCount: 1,
        totalCount: 4,
      });

      const result = (await handler({})) as IPCResponse<{
        providers: Array<{
          provider: AIProvider;
          displayName: string;
          status: string;
          lastValidatedAt: string | null;
        }>;
        registeredCount: number;
        totalCount: number;
      }>;

      expect(result.success).toBe(true);
      expect(result.data?.providers).toHaveLength(4);
      expect(result.data?.registeredCount).toBe(1);
      expect(result.data?.totalCount).toBe(4);
    });

    it("should not expose API key values", async () => {
      const handler = handlers.get(IPC_CHANNELS.API_KEY_LIST);
      if (!handler) {
        throw new Error("API_KEY_LIST handler not registered");
      }

      const result = (await handler({})) as IPCResponse<{
        providers: unknown[];
      }>;

      const resultString = JSON.stringify(result);
      expect(resultString).not.toContain("encryptedKey");
      expect(resultString).not.toContain("sk-");
      expect(resultString).not.toContain("apiKey");
    });

    it("should include display names for all providers", async () => {
      const handler = handlers.get(IPC_CHANNELS.API_KEY_LIST);
      if (!handler) {
        throw new Error("API_KEY_LIST handler not registered");
      }

      const result = (await handler({})) as IPCResponse<{
        providers: Array<{ displayName: string }>;
      }>;

      expect(result.success).toBe(true);
      const displayNames = result.data?.providers.map((p) => p.displayName);
      expect(displayNames).toContain("OpenAI");
      expect(displayNames).toContain("Anthropic");
      expect(displayNames).toContain("Google AI");
      expect(displayNames).toContain("xAI");
    });
  });

  // === Security Tests ===

  describe("Security", () => {
    it("should sanitize error messages to not include API key", async () => {
      const handler = handlers.get(IPC_CHANNELS.API_KEY_SAVE);
      if (!handler) {
        throw new Error("API_KEY_SAVE handler not registered");
      }

      const secretKey = "sk-super-secret-key-12345";
      mockSaveApiKey.mockResolvedValue({
        success: false,
        errorCode: "api-key/save-failed",
        errorMessage: `Failed to save: ${secretKey}`,
      });

      const result = (await handler(
        {},
        { provider: "openai", apiKey: secretKey },
      )) as IPCResponse<void>;

      expect(result.success).toBe(false);
      expect(result.error?.message).not.toContain(secretKey);
      expect(result.error?.message).not.toContain("sk-");
    });

    it("should reject SQL injection attempts in provider", async () => {
      const handler = handlers.get(IPC_CHANNELS.API_KEY_SAVE);
      if (!handler) {
        throw new Error("API_KEY_SAVE handler not registered");
      }

      const result = (await handler(
        {},
        { provider: "openai; DROP TABLE users;", apiKey: "test-key" },
      )) as IPCResponse<void>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("api-key/invalid-provider");
    });

    it("should reject XSS attempts in API key", async () => {
      const handler = handlers.get(IPC_CHANNELS.API_KEY_SAVE);
      if (!handler) {
        throw new Error("API_KEY_SAVE handler not registered");
      }

      const result = (await handler(
        {},
        { provider: "openai", apiKey: "<script>alert('xss')</script>" },
      )) as IPCResponse<void>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("api-key/invalid-api-key-format");
    });
  });

  // === Error Handling ===

  describe("Error handling", () => {
    it("should handle unexpected errors gracefully", async () => {
      const handler = handlers.get(IPC_CHANNELS.API_KEY_SAVE);
      if (!handler) {
        throw new Error("API_KEY_SAVE handler not registered");
      }

      mockSaveApiKey.mockRejectedValue(new Error("Unexpected error"));

      const result = (await handler(
        {},
        { provider: "openai", apiKey: "sk-test123" },
      )) as IPCResponse<void>;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should not expose internal error details", async () => {
      const handler = handlers.get(IPC_CHANNELS.API_KEY_SAVE);
      if (!handler) {
        throw new Error("API_KEY_SAVE handler not registered");
      }

      mockSaveApiKey.mockRejectedValue(
        new Error("Internal: database connection failed at host=db.internal"),
      );

      const result = (await handler(
        {},
        { provider: "openai", apiKey: "sk-test123" },
      )) as IPCResponse<void>;

      expect(result.success).toBe(false);
      expect(result.error?.message).not.toContain("db.internal");
      expect(result.error?.message).not.toContain("database connection");
    });
  });
});
