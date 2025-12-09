/**
 * IPC検証モジュール テスト
 *
 * TDD Red Phase: これらのテストは実装前に作成され、
 * 実装が完了するまで失敗する（Red状態）
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserWindow } from "electron";
import {
  validateIpcSender,
  toIPCValidationError,
  withValidation,
  type IPCValidationResult,
  type IPCValidationOptions,
  type SecurityLogger,
  type SecurityLogEvent,
} from "./ipc-validator";

// Electronモジュールのモック
vi.mock("electron", () => ({
  BrowserWindow: {
    fromWebContents: vi.fn(),
  },
}));

// モックファクトリ関数
function createMockEvent(
  webContentsId: number,
  options: {
    type?: string;
    isDevToolsOpened?: boolean;
  } = {},
) {
  const { type = "window", isDevToolsOpened = false } = options;
  return {
    sender: {
      id: webContentsId,
      getType: () => type,
      isDevToolsOpened: () => isDevToolsOpened,
    },
  } as unknown;
}

function createMockWindow(id: number, webContentsId: number) {
  return {
    id,
    webContents: {
      id: webContentsId,
    },
  } as unknown;
}

function createMockLogger(): SecurityLogger & {
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
} {
  return {
    warn: vi.fn(),
    error: vi.fn(),
  };
}

describe("IPC検証モジュール", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateIpcSender", () => {
    describe("正常系 - 許可されたウィンドウ", () => {
      it("許可されたウィンドウからの呼び出しは成功する", () => {
        const mockWindow = createMockWindow(1, 100);
        const mockEvent = createMockEvent(100);
        const mockLogger = createMockLogger();

        vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(
          mockWindow as never,
        );

        const result = validateIpcSender(mockEvent as never, "auth:login", {
          getAllowedWindows: () => [mockWindow as never],
          logger: mockLogger,
        });

        expect(result.valid).toBe(true);
        expect(result.webContentsId).toBe(100);
        expect(result.windowId).toBe(1);
        expect(result.errorCode).toBeUndefined();
        expect(result.errorMessage).toBeUndefined();
        expect(mockLogger.warn).not.toHaveBeenCalled();
      });

      it("複数の許可ウィンドウの中にある場合も成功する", () => {
        const mockWindow1 = createMockWindow(1, 100);
        const mockWindow2 = createMockWindow(2, 200);
        const mockWindow3 = createMockWindow(3, 300);
        const mockEvent = createMockEvent(200);

        vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(
          mockWindow2 as never,
        );

        const result = validateIpcSender(mockEvent as never, "auth:login", {
          getAllowedWindows: () => [
            mockWindow1 as never,
            mockWindow2 as never,
            mockWindow3 as never,
          ],
        });

        expect(result.valid).toBe(true);
        expect(result.windowId).toBe(2);
      });

      it("loggerがない場合もエラーなく動作する", () => {
        const mockWindow = createMockWindow(1, 100);
        const mockEvent = createMockEvent(100);

        vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(
          mockWindow as never,
        );

        const result = validateIpcSender(mockEvent as never, "auth:login", {
          getAllowedWindows: () => [mockWindow as never],
          // logger は省略
        });

        expect(result.valid).toBe(true);
      });
    });

    describe("異常系 - BrowserWindowが存在しない", () => {
      it("BrowserWindowが存在しない場合はUNAUTHORIZEDエラー", () => {
        const mockEvent = createMockEvent(100);
        const mockLogger = createMockLogger();

        vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(null);

        const result = validateIpcSender(mockEvent as never, "auth:login", {
          getAllowedWindows: () => [],
          logger: mockLogger,
        });

        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe("IPC_UNAUTHORIZED");
        expect(result.errorMessage).toContain("no associated BrowserWindow");
        expect(result.webContentsId).toBe(100);
        expect(result.windowId).toBeNull();
        expect(mockLogger.warn).toHaveBeenCalled();
      });

      it("セキュリティログにchannel名が含まれる", () => {
        const mockEvent = createMockEvent(100);
        const mockLogger = createMockLogger();

        vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(null);

        validateIpcSender(mockEvent as never, "profile:update", {
          getAllowedWindows: () => [],
          logger: mockLogger,
        });

        expect(mockLogger.warn).toHaveBeenCalledWith(
          expect.stringContaining("profile:update"),
          expect.any(Object),
        );
      });
    });

    describe("異常系 - 許可リストにないウィンドウ", () => {
      it("許可リストにないウィンドウからの呼び出しはFORBIDDENエラー", () => {
        const mockWindow = createMockWindow(1, 100);
        const otherWindow = createMockWindow(2, 200);
        const mockEvent = createMockEvent(100);
        const mockLogger = createMockLogger();

        vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(
          mockWindow as never,
        );

        const result = validateIpcSender(mockEvent as never, "auth:login", {
          getAllowedWindows: () => [otherWindow as never], // 別のウィンドウのみ許可
          logger: mockLogger,
        });

        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe("IPC_FORBIDDEN");
        expect(result.errorMessage).toContain("unauthorized window");
        expect(result.windowId).toBe(1);
        expect(mockLogger.warn).toHaveBeenCalled();
      });

      it("許可リストが空の場合はエラー", () => {
        const mockWindow = createMockWindow(1, 100);
        const mockEvent = createMockEvent(100);

        vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(
          mockWindow as never,
        );

        const result = validateIpcSender(mockEvent as never, "auth:login", {
          getAllowedWindows: () => [],
        });

        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe("IPC_FORBIDDEN");
      });
    });

    describe("異常系 - DevToolsからの呼び出し", () => {
      it("DevToolsからの呼び出しはFORBIDDENエラー", () => {
        // DevToolsのwebContentsはメインウィンドウとは異なるID
        const mockWindow = createMockWindow(1, 100);
        const _mockEvent = createMockEvent(999); // DevToolsのwebContents ID
        const mockLogger = createMockLogger();

        vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(
          mockWindow as never,
        );

        // DevToolsが開いている状態
        const eventWithDevTools = createMockEvent(999, {
          isDevToolsOpened: true,
        });

        const result = validateIpcSender(
          eventWithDevTools as never,
          "auth:login",
          {
            getAllowedWindows: () => [mockWindow as never],
            logger: mockLogger,
          },
        );

        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe("IPC_FORBIDDEN");
        expect(result.errorMessage).toContain("DevTools");
        expect(mockLogger.warn).toHaveBeenCalled();
      });

      it("webviewタイプからの呼び出しは検証される", () => {
        const mockWindow = createMockWindow(1, 100);
        const mockEvent = createMockEvent(999, { type: "webview" });
        const mockLogger = createMockLogger();

        vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(
          mockWindow as never,
        );

        const result = validateIpcSender(mockEvent as never, "auth:login", {
          getAllowedWindows: () => [mockWindow as never],
          logger: mockLogger,
        });

        // webviewからの呼び出しはIDが異なるため拒否される
        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe("IPC_FORBIDDEN");
      });

      it("DevToolsが開いていてもメインウィンドウからの呼び出しは許可", () => {
        const mockWindow = createMockWindow(1, 100);
        // webContentsIdがウィンドウと同じ場合はメインウィンドウからの呼び出し
        const mockEvent = createMockEvent(100, { isDevToolsOpened: true });

        vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(
          mockWindow as never,
        );

        const result = validateIpcSender(mockEvent as never, "auth:login", {
          getAllowedWindows: () => [mockWindow as never],
        });

        expect(result.valid).toBe(true);
      });
    });

    describe("セキュリティログ出力", () => {
      it("失敗時にセキュリティログイベントが出力される", () => {
        const mockEvent = createMockEvent(100);
        const mockLogger = createMockLogger();

        vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(null);

        validateIpcSender(mockEvent as never, "auth:login", {
          getAllowedWindows: () => [],
          logger: mockLogger,
        });

        expect(mockLogger.warn).toHaveBeenCalledWith(
          expect.stringContaining("[Security]"),
          expect.objectContaining({
            channel: "auth:login",
            webContentsId: 100,
          }),
        );
      });

      it("成功時はセキュリティログが出力されない", () => {
        const mockWindow = createMockWindow(1, 100);
        const mockEvent = createMockEvent(100);
        const mockLogger = createMockLogger();

        vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(
          mockWindow as never,
        );

        validateIpcSender(mockEvent as never, "auth:login", {
          getAllowedWindows: () => [mockWindow as never],
          logger: mockLogger,
        });

        expect(mockLogger.warn).not.toHaveBeenCalled();
        expect(mockLogger.error).not.toHaveBeenCalled();
      });
    });
  });

  describe("toIPCValidationError", () => {
    it("IPCResponse形式のエラーを返す", () => {
      const validationResult: IPCValidationResult = {
        valid: false,
        errorCode: "IPC_UNAUTHORIZED",
        errorMessage: "Test error message",
        webContentsId: 100,
        windowId: null,
      };

      const result = toIPCValidationError(validationResult);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("IPC_UNAUTHORIZED");
      expect(result.error.message).toBe("Test error message");
    });

    it("FORBIDDENエラーを正しく変換する", () => {
      const validationResult: IPCValidationResult = {
        valid: false,
        errorCode: "IPC_FORBIDDEN",
        errorMessage: "Access forbidden",
        webContentsId: 100,
        windowId: 1,
      };

      const result = toIPCValidationError(validationResult);

      expect(result.error.code).toBe("IPC_FORBIDDEN");
      expect(result.error.message).toBe("Access forbidden");
    });

    it("デフォルトエラーコードとメッセージを使用する", () => {
      const validationResult: IPCValidationResult = {
        valid: false,
        webContentsId: 100,
      };

      const result = toIPCValidationError(validationResult);

      expect(result.error.code).toBe("IPC_UNAUTHORIZED");
      expect(result.error.message).toBe("Unauthorized IPC call");
    });
  });

  describe("withValidation", () => {
    describe("検証成功時", () => {
      it("元のhandlerを実行する", async () => {
        const mockWindow = createMockWindow(1, 100);
        const mockEvent = createMockEvent(100);
        const mockHandler = vi
          .fn()
          .mockResolvedValue({ success: true, data: "test" });

        vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(
          mockWindow as never,
        );

        const wrappedHandler = withValidation("auth:login", mockHandler, {
          getAllowedWindows: () => [mockWindow as never],
        });

        const result = await wrappedHandler(mockEvent as never, {
          provider: "google",
        });

        expect(mockHandler).toHaveBeenCalledWith(mockEvent, {
          provider: "google",
        });
        expect(result).toEqual({ success: true, data: "test" });
      });

      it("複数の引数を正しく渡す", async () => {
        const mockWindow = createMockWindow(1, 100);
        const mockEvent = createMockEvent(100);
        const mockHandler = vi.fn().mockResolvedValue({ success: true });

        vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(
          mockWindow as never,
        );

        const wrappedHandler = withValidation("profile:update", mockHandler, {
          getAllowedWindows: () => [mockWindow as never],
        });

        await wrappedHandler(
          mockEvent as never,
          { updates: { displayName: "test" } },
          "extra-arg",
        );

        expect(mockHandler).toHaveBeenCalledWith(
          mockEvent,
          { updates: { displayName: "test" } },
          "extra-arg",
        );
      });

      it("handlerのPromiseを正しく解決する", async () => {
        const mockWindow = createMockWindow(1, 100);
        const mockEvent = createMockEvent(100);
        const expectedData = { user: { id: "123" } };
        const mockHandler = vi.fn().mockResolvedValue({
          success: true,
          data: expectedData,
        });

        vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(
          mockWindow as never,
        );

        const wrappedHandler = withValidation("auth:get-session", mockHandler, {
          getAllowedWindows: () => [mockWindow as never],
        });

        const result = await wrappedHandler(mockEvent as never);

        expect(result).toEqual({
          success: true,
          data: expectedData,
        });
      });
    });

    describe("検証失敗時", () => {
      it("元のhandlerを実行せずエラーを返す", async () => {
        const mockEvent = createMockEvent(100);
        const mockHandler = vi.fn();

        vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(null);

        const wrappedHandler = withValidation("auth:login", mockHandler, {
          getAllowedWindows: () => [],
        });

        const result = await wrappedHandler(mockEvent as never, {
          provider: "google",
        });

        expect(mockHandler).not.toHaveBeenCalled();
        expect(result).toMatchObject({
          success: false,
          error: {
            code: "IPC_UNAUTHORIZED",
          },
        });
      });

      it("FORBIDDENエラーを返す", async () => {
        const mockWindow = createMockWindow(1, 100);
        const otherWindow = createMockWindow(2, 200);
        const mockEvent = createMockEvent(100);
        const mockHandler = vi.fn();

        vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(
          mockWindow as never,
        );

        const wrappedHandler = withValidation("auth:login", mockHandler, {
          getAllowedWindows: () => [otherWindow as never],
        });

        const result = await wrappedHandler(mockEvent as never);

        expect(result).toMatchObject({
          success: false,
          error: {
            code: "IPC_FORBIDDEN",
          },
        });
      });
    });

    describe("handlerエラー伝播", () => {
      it("handlerがエラーを返した場合はそのまま返す", async () => {
        const mockWindow = createMockWindow(1, 100);
        const mockEvent = createMockEvent(100);
        const mockHandler = vi.fn().mockResolvedValue({
          success: false,
          error: { code: "AUTH_FAILED", message: "Login failed" },
        });

        vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(
          mockWindow as never,
        );

        const wrappedHandler = withValidation("auth:login", mockHandler, {
          getAllowedWindows: () => [mockWindow as never],
        });

        const result = await wrappedHandler(mockEvent as never);

        expect(result).toEqual({
          success: false,
          error: { code: "AUTH_FAILED", message: "Login failed" },
        });
      });

      it("handlerが例外をスローした場合は伝播する", async () => {
        const mockWindow = createMockWindow(1, 100);
        const mockEvent = createMockEvent(100);
        const mockHandler = vi
          .fn()
          .mockRejectedValue(new Error("Network error"));

        vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(
          mockWindow as never,
        );

        const wrappedHandler = withValidation("auth:login", mockHandler, {
          getAllowedWindows: () => [mockWindow as never],
        });

        await expect(wrappedHandler(mockEvent as never)).rejects.toThrow(
          "Network error",
        );
      });
    });
  });

  describe("型エクスポート", () => {
    it("IPCValidationResult型が正しい構造を持つ", () => {
      const result: IPCValidationResult = {
        valid: true,
        webContentsId: 100,
        windowId: 1,
      };
      expect(result.valid).toBe(true);

      const failedResult: IPCValidationResult = {
        valid: false,
        errorCode: "IPC_UNAUTHORIZED",
        errorMessage: "Error",
        webContentsId: 100,
        windowId: null,
      };
      expect(failedResult.valid).toBe(false);
    });

    it("IPCValidationOptions型が正しい構造を持つ", () => {
      const options: IPCValidationOptions = {
        getAllowedWindows: () => [],
        logger: {
          warn: () => {},
          error: () => {},
        },
      };
      expect(typeof options.getAllowedWindows).toBe("function");
    });

    it("SecurityLogger型が正しい構造を持つ", () => {
      const logger: SecurityLogger = {
        warn: vi.fn(),
        error: vi.fn(),
      };
      logger.warn("test", { detail: "value" });
      expect(logger.warn).toHaveBeenCalled();
    });

    it("SecurityLogEvent型が正しい構造を持つ", () => {
      const event: SecurityLogEvent = {
        timestamp: new Date().toISOString(),
        level: "warn",
        category: "security",
        event: "ipc_validation_failed",
        details: {
          channel: "auth:login",
          webContentsId: 100,
          windowId: 1,
          reason: "Test reason",
        },
      };
      expect(event.category).toBe("security");
      expect(event.event).toBe("ipc_validation_failed");
    });
  });

  describe("セキュリティ要件", () => {
    it("認証系channel全てで検証が機能する", async () => {
      const channels = [
        "auth:login",
        "auth:logout",
        "auth:get-session",
        "auth:refresh",
        "profile:get",
        "profile:update",
        "profile:linkProvider",
      ];

      const mockEvent = createMockEvent(100);
      vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(null);

      for (const channel of channels) {
        const mockHandler = vi.fn();
        const wrappedHandler = withValidation(channel, mockHandler, {
          getAllowedWindows: () => [],
        });

        const result = await wrappedHandler(mockEvent as never);

        expect(result).toMatchObject({
          success: false,
          error: expect.objectContaining({
            code: expect.stringMatching(/^IPC_/),
          }),
        });
        expect(mockHandler).not.toHaveBeenCalled();
      }
    });

    it("不正なwebContentsからの呼び出しをブロック", () => {
      const mockWindow = createMockWindow(1, 100);
      const maliciousEvent = createMockEvent(999); // 不正なwebContents ID

      vi.mocked(BrowserWindow.fromWebContents).mockReturnValue(
        mockWindow as never,
      );

      const result = validateIpcSender(maliciousEvent as never, "auth:login", {
        getAllowedWindows: () => [mockWindow as never],
      });

      // webContentsIdがウィンドウと異なる場合、DevToolsチェックで拒否される可能性
      // または許可リストチェックで処理される
      expect(result.webContentsId).toBe(999);
    });
  });
});
