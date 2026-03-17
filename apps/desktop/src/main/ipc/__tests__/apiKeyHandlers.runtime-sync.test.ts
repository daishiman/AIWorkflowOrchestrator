/**
 * apiKeyHandlers ランタイム同期テスト
 *
 * task-06-main-chat-settings-runtime-sync / GAP-05 / GAP-07
 * Phase 4: TDD Red Phase
 *
 * LLMAdapterFactory.clearInstance() の呼び出し確認と
 * apiKey:validate デバウンス動作のテスト。
 *
 * 対応テストケース:
 *   IT-014 - api-key:save 後に LLMAdapterFactory.clearInstance() が呼ばれる
 *   IT-015 - api-key:validate デバウンス（Phase 5 実装後に GREEN）
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";

// === モック変数 ===
const mockClearInstance = vi.fn();
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

// === モック定義 ===

vi.mock("../../adapters/llm/LLMAdapterFactory", () => ({
  LLMAdapterFactory: {
    clearInstance: (...args: unknown[]) => mockClearInstance(...args),
  },
}));

vi.mock("@repo/shared/infrastructure/ai/apiKeyValidator", () => ({
  validateApiKey: vi.fn().mockResolvedValue({
    provider: "openai",
    status: "valid",
    validatedAt: "2026-03-17T00:00:00.000Z",
  }),
}));

const mockIpcHandle = vi.fn();

vi.mock("electron", () => ({
  ipcMain: {
    handle: (...args: unknown[]) => mockIpcHandle(...args),
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

vi.mock("../../infrastructure/security/ipc-validator.js", () => ({
  withValidation: vi.fn(
    (
      _channel: string,
      handler: (...args: unknown[]) => Promise<unknown>,
      _options: unknown,
    ) => handler,
  ),
}));

vi.mock("electron-store", () => ({
  default: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
  })),
}));

vi.mock("../../infrastructure/apiKeyStorage.js", () => ({
  createApiKeyStorage: vi.fn(() => mockApiKeyStorage),
}));

vi.mock("@repo/shared/types/api-keys", () => ({
  isValidAIProvider: (provider: unknown) =>
    typeof provider === "string" &&
    ["openai", "anthropic", "google", "xai"].includes(provider),
  API_KEY_ERROR_CODES: {
    SAVE_FAILED: "api-key/save-failed",
    GET_FAILED: "api-key/get-failed",
    DELETE_FAILED: "api-key/delete-failed",
    INVALID_PROVIDER: "api-key/invalid-provider",
    INVALID_API_KEY_FORMAT: "api-key/invalid-api-key-format",
    EMPTY_API_KEY: "api-key/empty-api-key",
    API_KEY_TOO_LONG: "api-key/api-key-too-long",
  },
  API_KEY_CONSTRAINTS: {
    minLength: 1,
    maxLength: 256,
    forbiddenPattern: /[<>'";&|]/,
  },
  AI_PROVIDERS: ["openai", "anthropic", "google", "xai"],
}));

// === テスト ===

const mockMainWindow = {
  webContents: { send: vi.fn() },
  isDestroyed: () => false,
} as unknown as BrowserWindowType;

interface IPCResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

describe("apiKeyHandlers - ランタイム同期 (GAP-05/GAP-07)", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    mockSaveApiKey.mockResolvedValue({ success: true });
    mockDeleteApiKey.mockResolvedValue({ success: true });
    mockListProviders.mockResolvedValue({
      providers: [],
      registeredCount: 0,
      totalCount: 0,
    });

    mockIpcHandle.mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    const { registerApiKeyHandlers } = await import("../apiKeyHandlers");
    registerApiKeyHandlers(mockMainWindow, mockApiKeyStorage);
  });

  afterEach(() => {
    vi.resetModules();
  });

  // ===================================================
  // IT-014: api-key:save 後に clearInstance() が呼ばれる
  // ===================================================
  describe("IT-014: api-key:save 後に LLMAdapterFactory.clearInstance() が呼ばれる", () => {
    it("正常保存時に clearInstance がプロバイダー名で呼ばれる", async () => {
      const handler = handlers.get("apiKey:save");
      if (!handler) throw new Error("apiKey:save handler not registered");

      const result = (await handler(
        {},
        { provider: "openai", apiKey: "sk-valid-openai-key" },
      )) as IPCResponse<unknown>;

      expect(result.success).toBe(true);
      expect(mockClearInstance).toHaveBeenCalledWith("openai");
    });

    it("anthropic キー保存時に clearInstance が 'anthropic' で呼ばれる", async () => {
      const handler = handlers.get("apiKey:save");
      if (!handler) throw new Error("apiKey:save handler not registered");

      await handler(
        {},
        { provider: "anthropic", apiKey: "sk-valid-anthropic-key" },
      );

      expect(mockClearInstance).toHaveBeenCalledWith("anthropic");
    });

    it("保存失敗時は clearInstance が呼ばれない", async () => {
      const handler = handlers.get("apiKey:save");
      if (!handler) throw new Error("apiKey:save handler not registered");

      mockSaveApiKey.mockResolvedValue({
        success: false,
        errorCode: "api-key/save-failed",
        errorMessage: "Storage error",
      });

      const result = (await handler(
        {},
        { provider: "openai", apiKey: "sk-valid-key" },
      )) as IPCResponse<unknown>;

      expect(result.success).toBe(false);
      expect(mockClearInstance).not.toHaveBeenCalled();
    });

    it("プロバイダーが不正な場合は clearInstance が呼ばれない", async () => {
      const handler = handlers.get("apiKey:save");
      if (!handler) throw new Error("apiKey:save handler not registered");

      const result = (await handler(
        {},
        { provider: "unknown-provider", apiKey: "sk-valid-key" },
      )) as IPCResponse<unknown>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("api-key/invalid-provider");
      expect(mockClearInstance).not.toHaveBeenCalled();
    });

    it("api-key:delete 後にも clearInstance が呼ばれる", async () => {
      const handler = handlers.get("apiKey:delete");
      if (!handler) throw new Error("apiKey:delete handler not registered");

      const result = (await handler(
        {},
        { provider: "openai" },
      )) as IPCResponse<unknown>;

      expect(result.success).toBe(true);
      expect(mockClearInstance).toHaveBeenCalledWith("openai");
    });

    it("clearInstance がエラーを投げても save 自体は成功レスポンスを返す", async () => {
      const handler = handlers.get("apiKey:save");
      if (!handler) throw new Error("apiKey:save handler not registered");

      mockClearInstance.mockImplementationOnce(() => {
        throw new Error("Cache clear failed");
      });

      const result = (await handler(
        {},
        { provider: "openai", apiKey: "sk-valid-openai-key" },
      )) as IPCResponse<unknown>;

      // clearInstance のエラーは警告として記録され、save は成功を返す
      expect(result.success).toBe(true);
    });
  });

  // ===================================================
  // IT-015: api-key:validate デバウンス後に 1 回のみ呼ばれる
  // ===================================================
  describe("IT-015: api-key:validate デバウンス後に 1 回のみ呼ばれる", () => {
    it("不正なプロバイダーに対してエラーレスポンスを返す", async () => {
      // 外部 HTTP を発火させない範囲でハンドラー動作を確認
      const handler = handlers.get("apiKey:validate");
      if (!handler) throw new Error("apiKey:validate handler not registered");

      const result = (await handler(
        {},
        { provider: "invalid-provider", apiKey: "sk-key" },
      )) as IPCResponse<unknown>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("api-key/invalid-provider");
    });

    // Phase 5 実装後に GREEN になるテスト（デバウンス 300ms）
    it.todo(
      "300ms 内の連続呼び出しをデバウンスして validateApiKey を 1 回のみ実行する（Phase 5 で実装）",
    );

    // Phase 5 実装後に GREEN になるテスト（成功レスポンス確認）
    it.todo(
      "正常プロバイダーと有効キーに対して validateApiKey が呼ばれ成功レスポンスを返す（Phase 5 でモック再設計）",
    );
  });
});
