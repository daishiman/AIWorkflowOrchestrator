/**
 * authModeHandlers エラーハンドリングテスト
 *
 * Phase 6: テスト拡充 - エラーサニタイズ・セキュリティ・異常系のテスト
 *
 * @see docs/30-workflows/TASK-AUTH-MODE-SELECTION-001/phase-6-test-expansion.md
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

const mockAuthKeyService: IAuthKeyService = {
  setKey: vi.fn(),
  getKey: vi.fn(),
  hasKey: vi.fn(),
  validateKey: vi.fn(),
  deleteKey: vi.fn(),
};

const mockSubscriptionAuthProvider: ISubscriptionAuthProvider = {
  getToken: vi.fn(),
  hasToken: vi.fn(),
  validateToken: vi.fn(),
  clearCache: vi.fn(),
};

const mockIpcMain = {
  handle: vi.fn(),
  removeHandler: vi.fn(),
};

const mockBrowserWindow = {
  isDestroyed: vi.fn().mockReturnValue(false),
  webContents: {
    send: vi.fn(),
  },
};

const mockSettingsStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

// =============================================================================
// ヘルパー関数
// =============================================================================

const createMockEvent = (overrides?: Partial<IpcMainInvokeEvent>) =>
  ({
    sender: {
      id: 1,
      isDestroyed: () => false,
      getOwnerBrowserWindow: () => mockBrowserWindow,
    },
    senderFrame: {
      url: "file://localhost/app/index.html",
    },
    ...overrides,
  }) as unknown as IpcMainInvokeEvent;

// =============================================================================
// テストスイート
// =============================================================================

describe("authModeHandlers エラーハンドリング", () => {
  let authModeService: AuthModeService;

  beforeEach(() => {
    vi.clearAllMocks();
    resetAuthModeStore();

    mockSettingsStore.get.mockReturnValue(undefined);
    (mockAuthKeyService.hasKey as ReturnType<typeof vi.fn>).mockResolvedValue(
      false,
    );
    (
      mockSubscriptionAuthProvider.hasToken as ReturnType<typeof vi.fn>
    ).mockResolvedValue(true);

    authModeService = new AuthModeService({
      authKeyService: mockAuthKeyService,
      subscriptionAuthProvider: mockSubscriptionAuthProvider,
      settingsStore:
        mockSettingsStore as unknown as import("electron-store").default<
          import("../../services/auth/types").AuthModeStoreSchema
        >,
    });

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
  // エラーメッセージサニタイズテスト
  // ===========================================================================
  describe("エラーメッセージサニタイズ", () => {
    it("トークン情報を含むエラーメッセージはマスクされる", async () => {
      // Arrange: auth-mode:status を使用（getStatus は例外を伝播させる）
      (
        mockSubscriptionAuthProvider.hasToken as ReturnType<typeof vi.fn>
      ).mockRejectedValue(
        new Error("Error: token=sk-ant-oat01-secret-token leaked"),
      );

      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_STATUS,
      )?.[1];

      // Act
      const result = await handler(event);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error.message).not.toContain("sk-ant-oat01-secret-token");
      expect(result.error.message).toContain("token=***");
    });

    it("APIキー情報を含むエラーメッセージはマスクされる", async () => {
      // Arrange
      mockSettingsStore.set.mockImplementation(() => {
        throw new Error("Failed with key=sk-ant-api03-secret-key");
      });

      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_SET,
      )?.[1];

      // Act
      const result = await handler(event, { mode: "api-key" });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error.message).not.toContain("sk-ant-api03-secret-key");
    });

    it("sk-ant-で始まるキーはすべてマスクされる", async () => {
      // Arrange
      mockSettingsStore.set.mockImplementation(() => {
        throw new Error("Error with sk-ant-abc123-test");
      });

      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_SET,
      )?.[1];

      // Act
      const result = await handler(event, { mode: "subscription" });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error.message).toContain("sk-***");
    });

    it("Error以外のオブジェクトがスローされた場合は汎用メッセージ", async () => {
      // Arrange
      mockSettingsStore.set.mockImplementation(() => {
        throw "String error"; // 文字列をスロー
      });

      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_SET,
      )?.[1];

      // Act
      const result = await handler(event, { mode: "api-key" });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error.message).toBe("An unknown error occurred");
    });
  });

  // ===========================================================================
  // Sender検証テスト
  // ===========================================================================
  describe("Sender検証", () => {
    it("senderがnullの場合は拒否", async () => {
      // Arrange
      const event = createMockEvent({
        sender: null,
      } as unknown as Partial<IpcMainInvokeEvent>);

      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_GET,
      )?.[1];

      // Act
      const result = await handler(event);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("auth-mode/invalid-sender");
    });

    it("senderが破棄されている場合は拒否", async () => {
      // Arrange
      const event = createMockEvent({
        sender: {
          id: 1,
          isDestroyed: () => true,
        },
      } as unknown as Partial<IpcMainInvokeEvent>);

      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_SET,
      )?.[1];

      // Act
      const result = await handler(event, { mode: "api-key" });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("auth-mode/invalid-sender");
    });

    it("外部ドメインからのリクエストは拒否", async () => {
      // Arrange
      const event = createMockEvent({
        senderFrame: {
          url: "https://malicious-site.com/attack",
        },
      } as unknown as Partial<IpcMainInvokeEvent>);

      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_STATUS,
      )?.[1];

      // Act
      const result = await handler(event);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("auth-mode/invalid-sender");
    });

    it("http://localhost は許可される", async () => {
      // Arrange
      const event = createMockEvent({
        senderFrame: {
          url: "http://localhost:3000/app",
        },
      } as unknown as Partial<IpcMainInvokeEvent>);

      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_GET,
      )?.[1];

      // Act
      const result = await handler(event);

      // Assert
      expect(result.success).toBe(true);
    });

    it("https://localhost は許可される", async () => {
      // Arrange
      const event = createMockEvent({
        senderFrame: {
          url: "https://localhost:3000/app",
        },
      } as unknown as Partial<IpcMainInvokeEvent>);

      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_GET,
      )?.[1];

      // Act
      const result = await handler(event);

      // Assert
      expect(result.success).toBe(true);
    });

    it("senderFrameがundefinedの場合は拒否", async () => {
      // Arrange
      const event = createMockEvent({
        senderFrame: undefined,
      } as unknown as Partial<IpcMainInvokeEvent>);

      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_VALIDATE,
      )?.[1];

      // Act
      const result = await handler(event);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("auth-mode/invalid-sender");
    });
  });

  // ===========================================================================
  // ウィンドウ破棄時のイベント送信テスト
  // ===========================================================================
  describe("ウィンドウ破棄時のイベント送信", () => {
    it("ウィンドウが破棄されている場合はイベントを送信しない", async () => {
      // Arrange
      mockBrowserWindow.isDestroyed.mockReturnValue(true);

      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_SET,
      )?.[1];

      // Act
      const result = await handler(event, { mode: "api-key" });

      // Assert
      expect(result.success).toBe(true);
      expect(mockBrowserWindow.webContents.send).not.toHaveBeenCalled();
    });

    it("ウィンドウが有効な場合はイベントを送信する", async () => {
      // Arrange
      mockBrowserWindow.isDestroyed.mockReturnValue(false);
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
        expect.any(Object),
      );
    });
  });

  // ===========================================================================
  // 入力バリデーションテスト
  // ===========================================================================
  describe("入力バリデーション", () => {
    it("requestがundefinedの場合はエラー", async () => {
      // Arrange
      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_SET,
      )?.[1];

      // Act
      const result = await handler(event, undefined);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("auth-mode/invalid-mode");
    });

    it("requestがnullの場合はエラー", async () => {
      // Arrange
      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_SET,
      )?.[1];

      // Act
      const result = await handler(event, null);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("auth-mode/invalid-mode");
    });

    it("modeが数値の場合はエラー", async () => {
      // Arrange
      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_SET,
      )?.[1];

      // Act
      const result = await handler(event, { mode: 123 });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("auth-mode/invalid-mode");
    });

    it("modeが空文字の場合はエラー", async () => {
      // Arrange
      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_SET,
      )?.[1];

      // Act
      const result = await handler(event, { mode: "" });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("auth-mode/invalid-mode");
    });

    it("modeに余分なスペースがある場合はエラー", async () => {
      // Arrange
      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_SET,
      )?.[1];

      // Act
      const result = await handler(event, { mode: " subscription " });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("auth-mode/invalid-mode");
    });
  });

  // ===========================================================================
  // サービスエラー伝播テスト
  // ===========================================================================
  describe("サービスエラー伝播", () => {
    it("getStatus でサービスエラーが発生した場合", async () => {
      // Arrange
      (
        mockSubscriptionAuthProvider.hasToken as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error("Service unavailable"));

      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_STATUS,
      )?.[1];

      // Act
      const result = await handler(event);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("auth-mode/unknown-error");
    });

    it("validateMode でサービスエラーが発生した場合", async () => {
      // Arrange
      (
        mockSubscriptionAuthProvider.hasToken as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error("Validation failed"));

      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_VALIDATE,
      )?.[1];

      // Act
      const result = await handler(event, { mode: "subscription" });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("auth-mode/unknown-error");
    });
  });

  // ===========================================================================
  // auth-mode:validate のエッジケース
  // ===========================================================================
  describe("auth-mode:validate エッジケース", () => {
    it("requestがundefinedの場合は現在のモードを検証", async () => {
      // Arrange
      (
        mockSubscriptionAuthProvider.hasToken as ReturnType<typeof vi.fn>
      ).mockResolvedValue(true);

      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_VALIDATE,
      )?.[1];

      // Act
      const result = await handler(event, undefined);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.mode).toBe("subscription");
    });

    it("request.modeがundefinedの場合は現在のモードを検証", async () => {
      // Arrange
      (
        mockSubscriptionAuthProvider.hasToken as ReturnType<typeof vi.fn>
      ).mockResolvedValue(true);

      const event = createMockEvent();
      const handler = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === IPC_CHANNELS.AUTH_MODE_VALIDATE,
      )?.[1];

      // Act
      const result = await handler(event, {});

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.mode).toBe("subscription");
    });
  });
});
