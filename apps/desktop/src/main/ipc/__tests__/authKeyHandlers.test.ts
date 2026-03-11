/**
 * AuthKeyHandlers IPC ハンドラーテスト
 *
 * TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE: Claude Agent SDK用認証キー管理基盤
 * Phase 4-5: テスト作成と実装（TDD Green Phase）
 *
 * 認証キー管理のための IPC ハンドラーをテストする。
 * sender 検証、バリデーション、レスポンス形式を確認する。
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

// IPC_CHANNELS モック
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

// モック後にインポート
import {
  registerAuthKeyHandlers,
  unregisterAuthKeyHandlers,
  resetAuthKeyHandlersState,
} from "../authKeyHandlers";

describe("authKeyHandlers", () => {
  // テスト用の有効なAPIキー
  const validApiKey = "sk-ant-api03-valid-test-key-1234567890abcdef";
  const invalidApiKey = "invalid-key";

  // モック BrowserWindow
  const mockWindow = {
    id: 1,
    webContents: {
      id: 1,
    },
  } as unknown as BrowserWindow;

  // モック sender
  const mockSender = {
    id: 1,
    getType: vi.fn().mockReturnValue("window"),
    isDevToolsOpened: vi.fn().mockReturnValue(false),
  };

  // モック IPC イベント
  const createMockEvent = (): IpcMainInvokeEvent =>
    ({
      sender: mockSender,
      senderFrame: {
        url: "file://localhost/app/index.html",
      },
    }) as unknown as IpcMainInvokeEvent;

  // 登録されたハンドラーを取得するヘルパー
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

    // ハンドラー登録状態をリセット
    resetAuthKeyHandlersState();

    // BrowserWindow.fromWebContents のデフォルト動作
    mockFromWebContents.mockReturnValue(mockWindow);

    // AuthKeyService モックをリセット
    mockAuthKeyService.setKey.mockResolvedValue(undefined);
    mockAuthKeyService.getKey.mockResolvedValue(null);
    mockAuthKeyService.hasKey.mockResolvedValue(false);
    mockAuthKeyService.validateKey.mockResolvedValue(true);
    mockAuthKeyService.deleteKey.mockResolvedValue(undefined);

    // sender モックをリセット
    mockSender.getType.mockReturnValue("window");
    mockSender.isDevToolsOpened.mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("AUTH_KEY_SET (auth-key:set)", () => {
    it("APIキーを保存できる", async () => {
      // Arrange
      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:set");
      const event = createMockEvent();

      // Act
      const result = await handler(event, { key: validApiKey });

      // Assert
      expect(mockAuthKeyService.setKey).toHaveBeenCalledWith(validApiKey);
      expect(result).toEqual({ success: true });
    });

    it("バリデーションエラー時は失敗レスポンスを返す", async () => {
      // Arrange
      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:set");
      const event = createMockEvent();

      // Act - 空のキー
      const result = await handler(event, { key: "" });

      // Assert
      expect(result).toEqual({
        success: false,
        error: expect.stringMatching(/empty|required/i),
      });
      expect(mockAuthKeyService.setKey).not.toHaveBeenCalled();
    });

    it("無効なキー形式はバリデーションエラーを返す", async () => {
      // Arrange
      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:set");
      const event = createMockEvent();

      // Act
      const result = await handler(event, { key: invalidApiKey });

      // Assert
      expect(result).toEqual({
        success: false,
        error: expect.stringMatching(/Invalid|format/i),
      });
    });

    it("sender検証失敗時はUnauthorizedを返す", async () => {
      // Arrange
      mockFromWebContents.mockReturnValue(null); // BrowserWindow が見つからない

      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:set");
      const event = createMockEvent();

      // Act
      const result = await handler(event, { key: validApiKey });

      // Assert
      expect(result).toEqual({
        success: false,
        error: expect.objectContaining({
          code: expect.any(String),
          message: expect.any(String),
        }),
      });
    });

    it("サービスエラー時はエラーメッセージを返す", async () => {
      // Arrange
      mockAuthKeyService.setKey.mockRejectedValue(new Error("Storage error"));

      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:set");
      const event = createMockEvent();

      // Act
      const result = await handler(event, { key: validApiKey });

      // Assert
      expect(result).toEqual({
        success: false,
        error: "Storage error",
      });
    });
  });

  describe("AUTH_KEY_VALIDATE (auth-key:validate)", () => {
    it("保存済みキーを検証できる", async () => {
      // Arrange
      mockAuthKeyService.validateKey.mockResolvedValue(true);

      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:validate");
      const event = createMockEvent();

      // Act
      const result = await handler(event, { key: validApiKey });

      // Assert
      expect(mockAuthKeyService.validateKey).toHaveBeenCalledWith(validApiKey);
      expect(result).toEqual({ valid: true });
    });

    it("無効なキーの場合はvalid=falseを返す", async () => {
      // Arrange
      mockAuthKeyService.validateKey.mockResolvedValue(false);

      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:validate");
      const event = createMockEvent();

      // Act
      const result = await handler(event, { key: validApiKey });

      // Assert
      expect(result).toEqual({ valid: false });
    });

    it("sender検証失敗時はエラーレスポンスを返す", async () => {
      // Arrange
      mockFromWebContents.mockReturnValue(null);

      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:validate");
      const event = createMockEvent();

      // Act
      const result = (await handler(event, { key: validApiKey })) as {
        success: boolean;
      };

      // Assert
      expect(result.success).toBe(false);
    });

    it("バリデーションエラー時はvalid=falseとエラーメッセージを返す", async () => {
      // Arrange
      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:validate");
      const event = createMockEvent();

      // Act - 空のキー
      const result = await handler(event, { key: "" });

      // Assert
      expect(result).toEqual({
        valid: false,
        error: expect.any(String),
      });
    });
  });

  describe("AUTH_KEY_DELETE (auth-key:delete)", () => {
    it("保存済みキーを削除できる", async () => {
      // Arrange
      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:delete");
      const event = createMockEvent();

      // Act
      const result = await handler(event);

      // Assert
      expect(mockAuthKeyService.deleteKey).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it("sender検証失敗時はエラーレスポンスを返す", async () => {
      // Arrange
      mockFromWebContents.mockReturnValue(null);

      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:delete");
      const event = createMockEvent();

      // Act
      const result = (await handler(event)) as { success: boolean };

      // Assert
      expect(result.success).toBe(false);
    });

    it("サービスエラー時はエラーメッセージを返す", async () => {
      // Arrange
      mockAuthKeyService.deleteKey.mockRejectedValue(
        new Error("Delete failed"),
      );

      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:delete");
      const event = createMockEvent();

      // Act
      const result = await handler(event);

      // Assert
      expect(result).toEqual({
        success: false,
        error: "Delete failed",
      });
    });
  });

  describe("AUTH_KEY_EXISTS (auth-key:exists)", () => {
    it("storeにキーがなくても環境変数があればexists=trueを返す", async () => {
      // Arrange
      const originalEnvKey = process.env.ANTHROPIC_API_KEY;
      process.env.ANTHROPIC_API_KEY = "sk-ant-api03-env-fallback-key";
      mockAuthKeyService.getKey.mockResolvedValue(
        "sk-ant-api03-env-fallback-key",
      );

      try {
        registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
        const handler = getRegisteredHandler("auth-key:exists");
        const event = createMockEvent();

        // Act
        const result = await handler(event);

        // Assert
        expect(mockAuthKeyService.getKey).toHaveBeenCalled();
        expect(result).toEqual({ exists: true, source: "env-fallback" });
      } finally {
        if (originalEnvKey === undefined) {
          delete process.env.ANTHROPIC_API_KEY;
        } else {
          process.env.ANTHROPIC_API_KEY = originalEnvKey;
        }
      }
    });

    it("キー設定状態を確認できる - 設定あり", async () => {
      // Arrange
      mockAuthKeyService.getKey.mockResolvedValue(
        "sk-ant-api03-saved-local-key",
      );
      delete process.env.ANTHROPIC_API_KEY;

      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:exists");
      const event = createMockEvent();

      // Act
      const result = await handler(event);

      // Assert
      expect(mockAuthKeyService.getKey).toHaveBeenCalled();
      expect(result).toEqual({ exists: true, source: "saved" });
    });

    it("キー設定状態を確認できる - 設定なし", async () => {
      // Arrange
      mockAuthKeyService.getKey.mockResolvedValue(null);

      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:exists");
      const event = createMockEvent();

      // Act
      const result = await handler(event);

      // Assert
      expect(result).toEqual({ exists: false, source: "not-set" });
    });

    it("sender検証失敗時はエラーレスポンスを返す", async () => {
      // Arrange
      mockFromWebContents.mockReturnValue(null);

      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:exists");
      const event = createMockEvent();

      // Act
      const result = (await handler(event)) as { success: boolean };

      // Assert
      expect(result.success).toBe(false);
    });

    it("レスポンスにキーの値は含まれない", async () => {
      // Arrange
      mockAuthKeyService.getKey.mockResolvedValue("sk-ant-api03-secret");

      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:exists");
      const event = createMockEvent();

      // Act
      const result = (await handler(event)) as Record<string, unknown>;

      // Assert - レスポンスに 'key' フィールドがないことを確認
      expect(result).not.toHaveProperty("key");
      expect(Object.keys(result)).toEqual(["exists", "source"]);
    });
  });

  describe("ハンドラー登録/解除", () => {
    it("registerAuthKeyHandlersで4つのハンドラーが登録される", () => {
      // Act
      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);

      // Assert
      expect(mockIpcMain.handle).toHaveBeenCalledTimes(4);
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        "auth-key:set",
        expect.any(Function),
      );
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        "auth-key:exists",
        expect.any(Function),
      );
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        "auth-key:validate",
        expect.any(Function),
      );
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        "auth-key:delete",
        expect.any(Function),
      );
    });

    it("unregisterAuthKeyHandlersで全ハンドラーが解除される", () => {
      // Arrange
      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);

      // Act
      unregisterAuthKeyHandlers();

      // Assert
      expect(mockIpcMain.removeHandler).toHaveBeenCalledWith("auth-key:set");
      expect(mockIpcMain.removeHandler).toHaveBeenCalledWith("auth-key:exists");
      expect(mockIpcMain.removeHandler).toHaveBeenCalledWith(
        "auth-key:validate",
      );
      expect(mockIpcMain.removeHandler).toHaveBeenCalledWith("auth-key:delete");
    });

    it("二重登録は無視される", () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Act
      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      registerAuthKeyHandlers(mockWindow, mockAuthKeyService); // 2回目

      // Assert - 1回目の4つのみ登録
      expect(mockIpcMain.handle).toHaveBeenCalledTimes(4);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("already registered"),
      );

      consoleSpy.mockRestore();
    });

    it("unregister後に再登録できる", () => {
      // Arrange
      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);

      // Act
      unregisterAuthKeyHandlers();
      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);

      // Assert
      expect(mockIpcMain.removeHandler).toHaveBeenCalledTimes(4);
      expect(mockIpcMain.handle).toHaveBeenCalledTimes(8);
    });

    it("未登録状態でunregisterしても安全に終了する", () => {
      // Act
      unregisterAuthKeyHandlers();

      // Assert
      expect(mockIpcMain.removeHandler).not.toHaveBeenCalled();
    });

    it("register/unregisterを複数回繰り返しても状態が壊れない", () => {
      // Act
      for (let i = 0; i < 3; i++) {
        registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
        unregisterAuthKeyHandlers();
      }

      // Assert
      expect(mockIpcMain.handle).toHaveBeenCalledTimes(12);
      expect(mockIpcMain.removeHandler).toHaveBeenCalledTimes(12);
    });
  });

  describe("セキュリティ", () => {
    it("エラーメッセージからAPIキーがサニタイズされる", async () => {
      // Arrange
      const errorWithKey = new Error(
        `Invalid key: ${validApiKey} is not valid`,
      );
      mockAuthKeyService.setKey.mockRejectedValue(errorWithKey);

      registerAuthKeyHandlers(mockWindow, mockAuthKeyService);
      const handler = getRegisteredHandler("auth-key:set");
      const event = createMockEvent();

      // Act
      const result = (await handler(event, { key: validApiKey })) as {
        success: boolean;
        error?: string;
      };

      // Assert - エラーメッセージにAPIキーが含まれていないことを確認
      expect(result.error).not.toContain(validApiKey);
      expect(result.error).toContain("[REDACTED]");
    });
  });
});
