/**
 * apiKeyHandlers - list ハンドラ GAP-05 バリデーションテスト
 *
 * Phase 6: テスト拡充
 * GAP-TEST-08: providers 配列バリデーション（P48 準拠）
 *
 * apiKeyHandlers.ts の list ハンドラに追加された
 * `Array.isArray(result?.providers)` バリデーションの動作を検証する。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";

// === Mock Setup ===

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

const mockMainWindow = {
  webContents: {
    send: vi.fn(),
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

import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../../preload/channels";

// === Type ===

interface IPCResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

interface ProviderListResult {
  providers: unknown[];
  registeredCount: number;
  totalCount: number;
}

// === Tests ===

describe("apiKeyHandlers - GAP-05 providers array validation", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    mockListProviders.mockResolvedValue({
      providers: [],
      registeredCount: 0,
      totalCount: 0,
    });

    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
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

  it("providers が null の場合、空配列にフォールバックする", async () => {
    const handler = handlers.get(IPC_CHANNELS.API_KEY_LIST);
    if (!handler) throw new Error("API_KEY_LIST handler not registered");

    mockListProviders.mockResolvedValue({
      providers: null,
      registeredCount: 0,
      totalCount: 0,
    });

    const result = (await handler({})) as IPCResponse<ProviderListResult>;

    expect(result.success).toBe(true);
    expect(result.data?.providers).toEqual([]);
    expect(result.data?.registeredCount).toBe(0);
    expect(result.data?.totalCount).toBe(0);
  });

  it("providers が undefined の場合、空配列にフォールバックする", async () => {
    const handler = handlers.get(IPC_CHANNELS.API_KEY_LIST);
    if (!handler) throw new Error("API_KEY_LIST handler not registered");

    mockListProviders.mockResolvedValue({
      registeredCount: 0,
      totalCount: 0,
    });

    const result = (await handler({})) as IPCResponse<ProviderListResult>;

    expect(result.success).toBe(true);
    expect(result.data?.providers).toEqual([]);
    expect(result.data?.registeredCount).toBe(0);
    expect(result.data?.totalCount).toBe(0);
  });

  it("providers が非配列（文字列）の場合、空配列にフォールバックする", async () => {
    const handler = handlers.get(IPC_CHANNELS.API_KEY_LIST);
    if (!handler) throw new Error("API_KEY_LIST handler not registered");

    mockListProviders.mockResolvedValue({
      providers: "not-an-array",
      registeredCount: 0,
      totalCount: 0,
    });

    const result = (await handler({})) as IPCResponse<ProviderListResult>;

    expect(result.success).toBe(true);
    expect(result.data?.providers).toEqual([]);
    expect(result.data?.registeredCount).toBe(0);
    expect(result.data?.totalCount).toBe(0);
  });

  it("listProviders が null を返す場合、空配列にフォールバックする", async () => {
    const handler = handlers.get(IPC_CHANNELS.API_KEY_LIST);
    if (!handler) throw new Error("API_KEY_LIST handler not registered");

    mockListProviders.mockResolvedValue(null);

    const result = (await handler({})) as IPCResponse<ProviderListResult>;

    expect(result.success).toBe(true);
    expect(result.data?.providers).toEqual([]);
    expect(result.data?.registeredCount).toBe(0);
    expect(result.data?.totalCount).toBe(0);
  });

  it("正常な providers 配列の場合、registeredCount を正しく再計算する", async () => {
    const handler = handlers.get(IPC_CHANNELS.API_KEY_LIST);
    if (!handler) throw new Error("API_KEY_LIST handler not registered");

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
          status: "registered",
          lastValidatedAt: "2025-12-10T12:00:00.000Z",
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
      registeredCount: 99, // ストレージ側の値は無視される
      totalCount: 99,
    });

    const result = (await handler({})) as IPCResponse<ProviderListResult>;

    expect(result.success).toBe(true);
    expect(result.data?.providers).toHaveLength(4);
    expect(result.data?.registeredCount).toBe(2);
    expect(result.data?.totalCount).toBe(4);
  });

  it("status フィールドが欠損した provider は registered にカウントされない", async () => {
    const handler = handlers.get(IPC_CHANNELS.API_KEY_LIST);
    if (!handler) throw new Error("API_KEY_LIST handler not registered");

    mockListProviders.mockResolvedValue({
      providers: [
        { provider: "openai", displayName: "OpenAI" }, // status なし
        {
          provider: "anthropic",
          displayName: "Anthropic",
          status: "registered",
        },
      ],
      registeredCount: 1,
      totalCount: 2,
    });

    const result = (await handler({})) as IPCResponse<ProviderListResult>;

    expect(result.success).toBe(true);
    expect(result.data?.registeredCount).toBe(1);
    expect(result.data?.totalCount).toBe(2);
  });

  it("listProviders が例外を投げる場合、エラーレスポンスを返す", async () => {
    const handler = handlers.get(IPC_CHANNELS.API_KEY_LIST);
    if (!handler) throw new Error("API_KEY_LIST handler not registered");

    mockListProviders.mockRejectedValue(new Error("Storage error"));

    const result = (await handler({})) as IPCResponse<ProviderListResult>;

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("api-key/get-failed");
  });
});
