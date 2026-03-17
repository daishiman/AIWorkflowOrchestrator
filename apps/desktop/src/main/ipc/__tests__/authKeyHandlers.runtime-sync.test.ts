/**
 * AuthKeyHandlers ランタイム同期テスト
 *
 * task-06-main-chat-settings-runtime-sync / GAP-06
 * Phase 4: TDD Red Phase
 *
 * auth-key:exists の source フィールド詳細確認と
 * P42 準拠の trim バリデーション追加テスト。
 *
 * 対応テストケース:
 *   IT-012  - auth-key:exists source: "saved"
 *   IT-012b - auth-key:exists source: "not-set"
 *   IT-013  - auth-key:set 空白のみキー（P42 .trim() バリデーション）
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { IpcMainInvokeEvent, BrowserWindow } from "electron";

// BrowserWindow.fromWebContents のモック
const mockFromWebContents = vi.fn();

// ipcMain モック
const mockIpcMain = {
  handle: vi.fn(),
  removeHandler: vi.fn(),
};

vi.mock("electron", () => ({
  ipcMain: {
    handle: (...args: unknown[]) => mockIpcMain.handle(...args),
    removeHandler: (...args: unknown[]) => mockIpcMain.removeHandler(...args),
  },
  BrowserWindow: {
    fromWebContents: (...args: unknown[]) => mockFromWebContents(...args),
  },
}));

vi.mock("../../../preload/channels", () => ({
  IPC_CHANNELS: {
    AUTH_KEY_SET: "auth-key:set",
    AUTH_KEY_EXISTS: "auth-key:exists",
    AUTH_KEY_VALIDATE: "auth-key:validate",
    AUTH_KEY_DELETE: "auth-key:delete",
  },
}));

// AuthKeyService モック
const mockAuthKeyService = {
  setKey: vi.fn().mockResolvedValue(undefined),
  getKey: vi.fn().mockResolvedValue(null),
  hasKey: vi.fn().mockResolvedValue(false),
  validateKey: vi.fn().mockResolvedValue(true),
  deleteKey: vi.fn().mockResolvedValue(undefined),
  clearCache: vi.fn(),
};

import {
  registerAuthKeyHandlers,
  resetAuthKeyHandlersState,
} from "../authKeyHandlers";

describe("authKeyHandlers - ランタイム同期 (GAP-06)", () => {
  const validApiKey = "sk-ant-api03-valid-test-key-1234567890abcdef";

  const mockWindow = {
    id: 1,
    webContents: { id: 1 },
  } as unknown as BrowserWindow;

  const mockSender = {
    id: 1,
    getType: vi.fn().mockReturnValue("window"),
    isDevToolsOpened: vi.fn().mockReturnValue(false),
  };

  const createMockEvent = (): IpcMainInvokeEvent =>
    ({
      sender: mockSender,
      senderFrame: { url: "file://localhost/app/index.html" },
    }) as unknown as IpcMainInvokeEvent;

  const getRegisteredHandler = (
    channel: string,
  ): ((event: IpcMainInvokeEvent, ...args: unknown[]) => Promise<unknown>) => {
    const handleCalls = mockIpcMain.handle.mock.calls;
    const handlerEntry = handleCalls.find(
      (call: unknown[]) => call[0] === channel,
    );
    if (!handlerEntry) {
      throw new Error(`Handler for channel "${channel}" not found`);
    }
    return handlerEntry[1] as (
      event: IpcMainInvokeEvent,
      ...args: unknown[]
    ) => Promise<unknown>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resetAuthKeyHandlersState();

    mockFromWebContents.mockReturnValue(mockWindow);

    mockAuthKeyService.setKey.mockResolvedValue(undefined);
    mockAuthKeyService.getKey.mockResolvedValue(null);
    mockAuthKeyService.hasKey.mockResolvedValue(false);
    mockAuthKeyService.validateKey.mockResolvedValue(true);
    mockAuthKeyService.deleteKey.mockResolvedValue(undefined);

    mockSender.getType.mockReturnValue("window");
    mockSender.isDevToolsOpened.mockReturnValue(false);

    // 環境変数をリセット
    delete process.env.ANTHROPIC_API_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.ANTHROPIC_API_KEY;
  });

  // ===================================================
  // IT-012: auth-key:exists - source: "saved"
  // ===================================================
  describe("IT-012: auth-key:exists - source フィールド（saved）", () => {
    it("ローカルに保存されたキーが存在する場合、source が 'saved' になる", async () => {
      // Arrange: 環境変数なし、ストレージにキーあり
      delete process.env.ANTHROPIC_API_KEY;
      mockAuthKeyService.getKey.mockResolvedValue(
        "sk-ant-api03-saved-local-key",
      );

      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:exists");
      const event = createMockEvent();

      // Act
      const result = await handler(event);

      // Assert
      expect(result).toEqual({ exists: true, source: "saved" });
    });

    it("source フィールドはレスポンスに必ず含まれる", async () => {
      mockAuthKeyService.getKey.mockResolvedValue("sk-ant-api03-any-key");
      delete process.env.ANTHROPIC_API_KEY;

      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:exists");
      const result = (await handler(createMockEvent())) as Record<
        string,
        unknown
      >;

      expect(result).toHaveProperty("source");
      expect(typeof result.source).toBe("string");
    });
  });

  // ===================================================
  // IT-012b: auth-key:exists - source: "not-set"
  // ===================================================
  describe("IT-012b: auth-key:exists - source フィールド（not-set）", () => {
    it("キーが存在しない場合、source が 'not-set' になる", async () => {
      // Arrange: 環境変数なし、ストレージにキーなし
      delete process.env.ANTHROPIC_API_KEY;
      mockAuthKeyService.getKey.mockResolvedValue(null);

      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:exists");
      const event = createMockEvent();

      // Act
      const result = await handler(event);

      // Assert
      expect(result).toEqual({ exists: false, source: "not-set" });
    });

    it("ストレージが空文字を返した場合、source が 'not-set' になる", async () => {
      // Arrange: getKey が空文字を返すケース
      delete process.env.ANTHROPIC_API_KEY;
      mockAuthKeyService.getKey.mockResolvedValue("");

      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:exists");

      const result = await handler(createMockEvent());

      expect(result).toEqual({ exists: false, source: "not-set" });
    });
  });

  // ===================================================
  // IT-013: auth-key:set - P42 準拠の trim バリデーション
  // ===================================================
  describe("IT-013: auth-key:set - 空白のみキーは VALIDATION_ERROR（P42）", () => {
    it("空白のみの文字列はバリデーションエラーを返す（.trim() === '' チェック）", async () => {
      // Arrange: P42 — trim後に空文字になるキーは拒否される
      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:set");
      const event = createMockEvent();

      // Act: スペースのみの入力（P42 違反パターン）
      const result = await handler(event, { key: "   " });

      // Assert: サービスは呼ばれずエラーを返す
      expect(result).toEqual({
        success: false,
        error: expect.any(String),
      });
      expect(mockAuthKeyService.setKey).not.toHaveBeenCalled();
    });

    it("タブ文字のみの入力もバリデーションエラーを返す", async () => {
      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:set");

      const result = await handler(createMockEvent(), { key: "\t\t" });

      expect((result as { success: boolean }).success).toBe(false);
      expect(mockAuthKeyService.setKey).not.toHaveBeenCalled();
    });

    it("有効なキー形式（sk- プレフィックス付き）は正常に処理される", async () => {
      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:set");

      const result = await handler(createMockEvent(), { key: validApiKey });

      expect(result).toEqual({ success: true });
      expect(mockAuthKeyService.setKey).toHaveBeenCalledWith(validApiKey);
    });
  });
});
