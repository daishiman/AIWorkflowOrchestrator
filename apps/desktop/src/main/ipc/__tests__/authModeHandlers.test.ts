/**
 * authModeHandlers テスト
 *
 * Phase 5: TDD Green - 認証方式IPCハンドラーのテスト
 *
 * @see docs/30-workflows/TASK-AUTH-MODE-SELECTION-001/outputs/phase-2/ipc-specification.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../../preload/channels";
import {
  registerAuthModeHandlers,
  unregisterAuthModeHandlers,
} from "../authModeHandlers";
import {
  AuthModeService,
  resetAuthModeStore,
} from "../../services/auth/AuthModeService";
import type {
  IAuthKeyService,
  ISubscriptionAuthProvider,
} from "../../services/auth/types";

// =============================================================================
// モック定義
// =============================================================================

/**
 * AuthKeyService モック
 */
const mockAuthKeyService: IAuthKeyService = {
  setKey: vi.fn(),
  getKey: vi.fn(),
  hasKey: vi.fn(),
  validateKey: vi.fn(),
  deleteKey: vi.fn(),
};

/**
 * SubscriptionAuthProvider モック
 */
const mockSubscriptionAuthProvider: ISubscriptionAuthProvider = {
  getToken: vi.fn(),
  hasToken: vi.fn(),
  validateToken: vi.fn(),
  clearCache: vi.fn(),
};

/**
 * IpcMain モック
 */
const mockIpcMain = {
  handle: vi.fn(),
  removeHandler: vi.fn(),
};

/**
 * BrowserWindow モック
 */
const mockBrowserWindow = {
  isDestroyed: vi.fn().mockReturnValue(false),
  webContents: {
    send: vi.fn(),
  },
};

/**
 * electron-store モック
 */
const mockSettingsStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

/**
 * IPC Event モック
 */
const createMockEvent = (): IpcMainInvokeEvent =>
  ({
    sender: {
      id: 1,
      isDestroyed: () => false,
      getOwnerBrowserWindow: () => mockBrowserWindow,
    },
    senderFrame: {
      url: "file://localhost/app/index.html",
    },
  }) as unknown as IpcMainInvokeEvent;

// =============================================================================
// テストスイート
// =============================================================================

describe("authModeHandlers", () => {
  let authModeService: AuthModeService;

  beforeEach(() => {
    vi.clearAllMocks();
    resetAuthModeStore();

    // デフォルトのモック動作を設定
    mockSettingsStore.get.mockReturnValue(undefined);
    (mockAuthKeyService.hasKey as ReturnType<typeof vi.fn>).mockResolvedValue(
      false,
    );
    (
      mockSubscriptionAuthProvider.hasToken as ReturnType<typeof vi.fn>
    ).mockResolvedValue(true);

    // AuthModeServiceを作成（モックストアを明示的に渡す）
    authModeService = new AuthModeService({
      authKeyService: mockAuthKeyService,
      subscriptionAuthProvider: mockSubscriptionAuthProvider,
      settingsStore:
        mockSettingsStore as unknown as import("electron-store").default<
          import("../../services/auth/types").AuthModeStoreSchema
        >,
    });

    // ハンドラを登録
    registerAuthModeHandlers(
      mockBrowserWindow as unknown as Electron.BrowserWindow,
      authModeService,
      { ipcMain: mockIpcMain as unknown as Electron.IpcMain },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    unregisterAuthModeHandlers({
      ipcMain: mockIpcMain as unknown as Electron.IpcMain,
    });
  });

  // ===========================================================================
  // auth-mode:get ハンドラーテスト
  // ===========================================================================
  describe("auth-mode:get", () => {
    it("現在の認証方式を取得して返す", async () => {
      // Arrange
      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_GET,
      )?.[1];

      // Act
      const result = await handler(event);

      // Assert
      expect(result).toEqual({
        success: true,
        data: "subscription", // デフォルト値
      });
    });

    it("api-keyモードを正しく返す", async () => {
      // Arrange: api-keyモードに設定されている状態をシミュレート
      mockSettingsStore.get.mockReturnValue("api-key");
      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_GET,
      )?.[1];

      // Act
      const result = await handler(event);

      // Assert
      expect(result).toEqual({
        success: true,
        data: "api-key",
      });
    });

    it("無効な送信元からのリクエストを拒否する", async () => {
      // Arrange: 無効な sender
      const invalidEvent = {
        sender: null,
        senderFrame: { url: "https://malicious-site.com" },
      } as unknown as IpcMainInvokeEvent;

      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_GET,
      )?.[1];

      // Act
      const result = await handler(invalidEvent);

      // Assert
      expect(result).toEqual({
        success: false,
        error: {
          code: "auth-mode/invalid-sender",
          message: "Invalid request sender",
        },
      });
    });
  });

  // ===========================================================================
  // auth-mode:set ハンドラーテスト
  // ===========================================================================
  describe("auth-mode:set", () => {
    it("認証方式をsubscriptionに設定できる", async () => {
      // Arrange
      await authModeService.setMode("api-key"); // まずapi-keyに設定
      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_SET,
      )?.[1];

      // Act
      const result = await handler(event, { mode: "subscription" });

      // Assert
      expect(result).toEqual({ success: true });
      expect(authModeService.getMode()).toBe("subscription");
    });

    it("認証方式をapi-keyに設定できる", async () => {
      // Arrange
      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_SET,
      )?.[1];

      // Act
      const result = await handler(event, { mode: "api-key" });

      // Assert
      expect(result).toEqual({ success: true });
      expect(mockSettingsStore.set).toHaveBeenCalledWith("authMode", "api-key");
    });

    it("無効なモード値でエラーを返す", async () => {
      // Arrange
      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_SET,
      )?.[1];

      // Act
      const result = await handler(event, { mode: "invalid-mode" });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("auth-mode/invalid-mode");
    });

    it("mode パラメータがない場合はエラーを返す", async () => {
      // Arrange
      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_SET,
      )?.[1];

      // Act
      const result = await handler(event, {});

      // Assert
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("auth-mode/invalid-mode");
    });

    it("設定成功時に変更イベントを送信する", async () => {
      // Arrange
      (mockAuthKeyService.hasKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        true,
      );
      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_SET,
      )?.[1];

      // Act
      await handler(event, { mode: "api-key" });

      // Assert
      expect(mockBrowserWindow.webContents.send).toHaveBeenCalledWith(
        IPC_CHANNELS.AUTH_MODE_CHANGED,
        expect.objectContaining({
          currentMode: "api-key",
          isAuthenticated: true,
        }),
      );
    });
  });

  // ===========================================================================
  // auth-mode:status ハンドラーテスト
  // ===========================================================================
  describe("auth-mode:status", () => {
    it("認証済みの状態を返す", async () => {
      // Arrange
      (
        mockSubscriptionAuthProvider.hasToken as ReturnType<typeof vi.fn>
      ).mockResolvedValue(true);
      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_STATUS,
      )?.[1];

      // Act
      const result = await handler(event);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.mode).toBe("subscription");
      expect(result.data.isAuthenticated).toBe(true);
      expect(result.data.details?.hasSubscriptionToken).toBe(true);
    });

    it("未認証の状態をエラー付きで返す", async () => {
      // Arrange
      (
        mockSubscriptionAuthProvider.hasToken as ReturnType<typeof vi.fn>
      ).mockResolvedValue(false);
      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_STATUS,
      )?.[1];

      // Act
      const result = await handler(event);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.isAuthenticated).toBe(false);
      expect(result.data.error).toBeDefined();
      expect(result.data.error.code).toBe("auth-mode/no-subscription-token");
    });

    it("api-keyモードの認証済み状態を返す", async () => {
      // Arrange: api-keyモードに設定されている状態をシミュレート
      mockSettingsStore.get.mockReturnValue("api-key");
      (mockAuthKeyService.hasKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        true,
      );
      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_STATUS,
      )?.[1];

      // Act
      const result = await handler(event);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.mode).toBe("api-key");
      expect(result.data.isAuthenticated).toBe(true);
      expect(result.data.details?.hasApiKey).toBe(true);
    });
  });

  // ===========================================================================
  // auth-mode:validate ハンドラーテスト
  // ===========================================================================
  describe("auth-mode:validate", () => {
    it("有効なsubscriptionモードの検証結果を返す", async () => {
      // Arrange
      (
        mockSubscriptionAuthProvider.hasToken as ReturnType<typeof vi.fn>
      ).mockResolvedValue(true);
      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_VALIDATE,
      )?.[1];

      // Act
      const result = await handler(event, { mode: "subscription" });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.isValid).toBe(true);
      expect(result.data.mode).toBe("subscription");
      expect(result.data.hasCredentials).toBe(true);
    });

    it("無効なsubscriptionモードの検証結果を返す", async () => {
      // Arrange
      (
        mockSubscriptionAuthProvider.hasToken as ReturnType<typeof vi.fn>
      ).mockResolvedValue(false);
      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_VALIDATE,
      )?.[1];

      // Act
      const result = await handler(event, { mode: "subscription" });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.isValid).toBe(false);
      expect(result.data.error).toBeDefined();
    });

    it("有効なapi-keyモードの検証結果を返す", async () => {
      // Arrange
      (mockAuthKeyService.hasKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        true,
      );
      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_VALIDATE,
      )?.[1];

      // Act
      const result = await handler(event, { mode: "api-key" });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.isValid).toBe(true);
      expect(result.data.mode).toBe("api-key");
    });

    it("無効なモード値でエラーを返す", async () => {
      // Arrange
      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_VALIDATE,
      )?.[1];

      // Act
      const result = await handler(event, { mode: "invalid-mode" });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("auth-mode/invalid-mode");
    });

    it("modeが指定されていない場合は現在のモードを検証する", async () => {
      // Arrange
      (
        mockSubscriptionAuthProvider.hasToken as ReturnType<typeof vi.fn>
      ).mockResolvedValue(true);
      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_VALIDATE,
      )?.[1];

      // Act
      const result = await handler(event);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.mode).toBe("subscription"); // デフォルト値
    });
  });

  // ===========================================================================
  // セキュリティテスト
  // ===========================================================================
  describe("Security", () => {
    it("無効な送信元からのリクエストを拒否する", async () => {
      // Arrange: 無効な sender
      const invalidEvent = {
        sender: null,
        senderFrame: { url: "https://malicious-site.com" },
      } as unknown as IpcMainInvokeEvent;

      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_GET,
      )?.[1];

      // Act
      const result = await handler(invalidEvent);

      // Assert
      expect(result).toEqual({
        success: false,
        error: {
          code: expect.any(String),
          message: expect.any(String),
        },
      });
    });
  });

  // ===========================================================================
  // ハンドラー登録テスト
  // ===========================================================================
  describe("Handler Registration", () => {
    it("すべての必要なチャンネルがハンドラー登録される", () => {
      // Assert
      const registeredChannels = mockIpcMain.handle.mock.calls.map(
        (call) => call[0],
      );
      expect(registeredChannels).toContain(IPC_CHANNELS.AUTH_MODE_GET);
      expect(registeredChannels).toContain(IPC_CHANNELS.AUTH_MODE_SET);
      expect(registeredChannels).toContain(IPC_CHANNELS.AUTH_MODE_STATUS);
      expect(registeredChannels).toContain(IPC_CHANNELS.AUTH_MODE_VALIDATE);
    });

    it("ハンドラーを解除できる", () => {
      // Act
      unregisterAuthModeHandlers({
        ipcMain: mockIpcMain as unknown as Electron.IpcMain,
      });

      // Assert
      expect(mockIpcMain.removeHandler).toHaveBeenCalledWith(
        IPC_CHANNELS.AUTH_MODE_GET,
      );
      expect(mockIpcMain.removeHandler).toHaveBeenCalledWith(
        IPC_CHANNELS.AUTH_MODE_SET,
      );
      expect(mockIpcMain.removeHandler).toHaveBeenCalledWith(
        IPC_CHANNELS.AUTH_MODE_STATUS,
      );
      expect(mockIpcMain.removeHandler).toHaveBeenCalledWith(
        IPC_CHANNELS.AUTH_MODE_VALIDATE,
      );
    });
  });
});
