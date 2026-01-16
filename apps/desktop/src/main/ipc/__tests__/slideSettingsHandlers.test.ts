/**
 * SlideSettingsHandlers Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 *
 * @see docs/30-workflows/slide-directory-settings/outputs/phase-2/ipc-design.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";

// === Type Definitions ===

interface SlideSettings {
  outputDirectory: string;
  autoCreateDirectory: boolean;
  defaultTheme: "kanagawa";
  schemaVersion: number;
}

interface SetDirectoryRequest {
  path: string;
  autoCreate: boolean;
}

interface ValidateDirectoryRequest {
  path: string;
}

interface ValidationResult {
  status: "valid" | "warning" | "error";
  message: string;
  details?: Record<string, unknown>;
}

interface SuccessResult<T> {
  success: true;
  data: T;
}

interface ErrorResult {
  success: false;
  error: string;
}

type Result<T> = SuccessResult<T> | ErrorResult;

// === Mocks (must be hoisted for vi.mock) ===

// Hoisted mocks to be available before vi.mock is processed
const {
  mockDialog,
  mockSlideSettingsStore,
  mockSetSlideDirectory,
  mockValidateDirectoryForSettings,
  mockExpandHomePath,
  mockValidateIpcSender,
  mockToIPCValidationError,
} = vi.hoisted(() => ({
  mockDialog: {
    showOpenDialog: vi.fn(),
  },
  mockSlideSettingsStore: {
    store: {
      outputDirectory: "~/Documents/Slides",
      autoCreateDirectory: true,
      defaultTheme: "kanagawa" as const,
      schemaVersion: 1,
    } as SlideSettings,
    get: vi.fn(),
    set: vi.fn(),
    // Methods used by handlers
    getDirectory: vi.fn(),
    setDirectory: vi.fn(),
    validateDirectory: vi.fn(),
    getAutoCreateDirectory: vi.fn(),
    getSettings: vi.fn(),
  },
  mockSetSlideDirectory: vi.fn(),
  mockValidateDirectoryForSettings: vi.fn(),
  mockExpandHomePath: vi.fn(),
  mockValidateIpcSender: vi.fn(),
  mockToIPCValidationError: vi.fn(),
}));

vi.mock("../../settings/slideSettingsStore", () => ({
  getSlideSettingsStore: () => mockSlideSettingsStore,
  setSlideDirectory: (...args: unknown[]) => mockSetSlideDirectory(...args),
  validateDirectoryForSettings: (...args: unknown[]) =>
    mockValidateDirectoryForSettings(...args),
  expandHomePath: (...args: unknown[]) => mockExpandHomePath(...args),
}));

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
  dialog: mockDialog,
  BrowserWindow: {
    fromWebContents: vi.fn().mockReturnValue({ id: 1 }),
  },
}));

// Mock ipc-validator
vi.mock("../../infrastructure/security/ipc-validator.js", () => ({
  withValidation: vi.fn(
    (
      _channel: string,
      handler: (...args: unknown[]) => Promise<unknown>,
      _options: unknown,
    ) => handler,
  ),
  validateIpcSender: mockValidateIpcSender,
  toIPCValidationError: mockToIPCValidationError,
}));

// Import after mocks
import { ipcMain } from "electron";

// Slide Settings IPC Channels
const SLIDE_SETTINGS_CHANNELS = {
  GET_DIRECTORY: "slideSettings:getDirectory",
  SET_DIRECTORY: "slideSettings:setDirectory",
  SELECT_DIRECTORY: "slideSettings:selectDirectory",
  VALIDATE_DIRECTORY: "slideSettings:validateDirectory",
  GET_ALL: "slideSettings:getAllSettings",
} as const;

// Mock BrowserWindow for validation
const mockMainWindow = {
  webContents: {
    send: vi.fn(),
  },
  isDestroyed: () => false,
  id: 1,
} as unknown as BrowserWindowType;

describe("SlideSettingsHandlers", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    // Capture registered handlers
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    // Default mock responses
    mockSlideSettingsStore.get.mockImplementation(
      (key: keyof SlideSettings) => mockSlideSettingsStore.store[key],
    );
    mockSlideSettingsStore.getDirectory.mockReturnValue(
      mockSlideSettingsStore.store.outputDirectory,
    );
    mockSlideSettingsStore.getSettings.mockReturnValue(
      mockSlideSettingsStore.store,
    );
    mockSlideSettingsStore.validateDirectory.mockReturnValue({
      valid: true,
      exists: true,
      writable: true,
    });
    mockSlideSettingsStore.getAutoCreateDirectory.mockReturnValue(true);
    mockSlideSettingsStore.setDirectory.mockReturnValue(undefined);

    mockSetSlideDirectory.mockResolvedValue({ success: true });
    mockValidateDirectoryForSettings.mockResolvedValue({
      status: "valid",
      message: "有効なディレクトリです",
    });
    mockExpandHomePath.mockImplementation((path: string) =>
      path.replace("~", "/Users/test"),
    );
    mockDialog.showOpenDialog.mockResolvedValue({
      canceled: false,
      filePaths: ["/selected/path"],
    });

    // IPC validator mocks
    mockValidateIpcSender.mockReturnValue({ valid: true });
    mockToIPCValidationError.mockImplementation((_validation: unknown) => ({
      error: { message: "IPC validation failed" },
    }));

    // Try to import and register handlers (will fail in Red phase)
    try {
      const { registerSlideSettingsHandlers } =
        await import("../slideSettingsHandlers");
      registerSlideSettingsHandlers(mockMainWindow);
    } catch {
      // Expected in Red phase - module doesn't exist
    }
  });

  afterEach(() => {
    vi.resetModules();
  });

  // ===========================================================================
  // slideSettings:getDirectory
  // ===========================================================================

  describe("slideSettings:getDirectory", () => {
    it("SSH-GD-01: 現在のディレクトリパスを返す", async () => {
      // Given: 設定が存在する
      mockSlideSettingsStore.store.outputDirectory = "/custom/slides/path";
      mockSlideSettingsStore.getDirectory.mockReturnValueOnce(
        "/custom/slides/path",
      );

      const handler = handlers.get(SLIDE_SETTINGS_CHANNELS.GET_DIRECTORY);
      if (!handler) {
        throw new Error("slideSettings:getDirectory handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler({})) as Result<string>;

      // Then: 現在のパスを返す
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("/custom/slides/path");
      }
    });

    it("SSH-GD-02: Result<string>形式で返す", async () => {
      // Given: デフォルト設定
      mockSlideSettingsStore.store.outputDirectory = "~/Documents/Slides";

      const handler = handlers.get(SLIDE_SETTINGS_CHANNELS.GET_DIRECTORY);
      if (!handler) {
        throw new Error("slideSettings:getDirectory handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler({})) as Result<string>;

      // Then: Result<string>形式
      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data).toBe("string");
      }
    });
  });

  // ===========================================================================
  // slideSettings:setDirectory
  // ===========================================================================

  describe("slideSettings:setDirectory", () => {
    it("SSH-SD-01: 有効なパスで設定を更新する", async () => {
      // Given: 有効なリクエスト
      const request: SetDirectoryRequest = {
        path: "/new/slides/path",
        autoCreate: false,
      };

      const handler = handlers.get(SLIDE_SETTINGS_CHANNELS.SET_DIRECTORY);
      if (!handler) {
        throw new Error("slideSettings:setDirectory handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler({}, request.path)) as Result<void>;

      // Then: 成功を返す
      expect(result.success).toBe(true);
      expect(mockSlideSettingsStore.setDirectory).toHaveBeenCalledWith(
        request.path,
      );
    });

    it("SSH-SD-02: 無効なパスでエラーを返す", async () => {
      // Given: 無効なリクエスト（空パス）
      const request: SetDirectoryRequest = {
        path: "",
        autoCreate: false,
      };
      // Mock store.validateDirectory to return invalid for empty path
      mockSlideSettingsStore.validateDirectory.mockReturnValueOnce({
        valid: false,
        exists: false,
        writable: false,
        error: "Directory path cannot be empty",
      });

      const handler = handlers.get(SLIDE_SETTINGS_CHANNELS.SET_DIRECTORY);
      if (!handler) {
        throw new Error("slideSettings:setDirectory handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler({}, request.path)) as Result<void>;

      // Then: エラーを返す
      expect(result.success).toBe(false);
    });

    it("SSH-SD-03: sender検証に失敗するとエラー", async () => {
      // Given: 不正なsender - mock validateIpcSender to return invalid
      mockValidateIpcSender.mockReturnValueOnce({
        valid: false,
        reason: "Invalid sender",
      });
      mockToIPCValidationError.mockReturnValueOnce({
        error: { message: "Sender validation failed" },
      });
      const invalidEvent = { sender: null };

      const handler = handlers.get(SLIDE_SETTINGS_CHANNELS.SET_DIRECTORY);
      if (!handler) {
        throw new Error("slideSettings:setDirectory handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler(invalidEvent, {
        path: "/valid/path",
        autoCreate: false,
      })) as Result<void>;

      // Then: エラーを返す
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toMatch(/sender|validation|unauthorized|failed/i);
      }
    });

    it("SSH-SD-04: パストラバーサル攻撃を拒否する", async () => {
      // Given: パストラバーサルを含むリクエスト
      const request: SetDirectoryRequest = {
        path: "../../../etc/passwd",
        autoCreate: false,
      };
      // Mock store.validateDirectory to return invalid for path traversal
      mockSlideSettingsStore.validateDirectory.mockReturnValueOnce({
        valid: false,
        exists: false,
        writable: false,
        error: "Path traversal not allowed",
      });

      const handler = handlers.get(SLIDE_SETTINGS_CHANNELS.SET_DIRECTORY);
      if (!handler) {
        throw new Error("slideSettings:setDirectory handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler({}, request)) as Result<void>;

      // Then: エラーを返す
      expect(result.success).toBe(false);
    });
  });

  // ===========================================================================
  // slideSettings:selectDirectory
  // ===========================================================================

  describe("slideSettings:selectDirectory", () => {
    it("SSH-SLD-01: ダイアログで選択されたパスを返す", async () => {
      // Given: ダイアログでパスが選択される
      mockDialog.showOpenDialog.mockResolvedValue({
        canceled: false,
        filePaths: ["/selected/directory"],
      });

      const handler = handlers.get(SLIDE_SETTINGS_CHANNELS.SELECT_DIRECTORY);
      if (!handler) {
        throw new Error("slideSettings:selectDirectory handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler({})) as Result<string | null>;

      // Then: 選択されたパスを返す
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("/selected/directory");
      }
    });

    it("SSH-SLD-02: キャンセル時はnullを返す", async () => {
      // Given: ダイアログがキャンセルされる
      mockDialog.showOpenDialog.mockResolvedValue({
        canceled: true,
        filePaths: [],
      });

      const handler = handlers.get(SLIDE_SETTINGS_CHANNELS.SELECT_DIRECTORY);
      if (!handler) {
        throw new Error("slideSettings:selectDirectory handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler({})) as Result<string | null>;

      // Then: nullを返す
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it("SSH-SLD-03: ダイアログオプションが正しく設定される", async () => {
      // Given: ダイアログモック
      mockDialog.showOpenDialog.mockResolvedValue({
        canceled: false,
        filePaths: ["/test"],
      });

      const handler = handlers.get(SLIDE_SETTINGS_CHANNELS.SELECT_DIRECTORY);
      if (!handler) {
        throw new Error("slideSettings:selectDirectory handler not registered");
      }

      // When: ハンドラーを呼び出す
      await handler({});

      // Then: ダイアログオプションが正しい
      expect(mockDialog.showOpenDialog).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          properties: expect.arrayContaining([
            "openDirectory",
            "createDirectory",
          ]),
        }),
      );
    });
  });

  // ===========================================================================
  // slideSettings:validateDirectory
  // ===========================================================================

  describe("slideSettings:validateDirectory", () => {
    it("SSH-VD-01: 存在するディレクトリでvalid=trueを返す", async () => {
      // Given: 有効なディレクトリ
      const request: ValidateDirectoryRequest = {
        path: "/existing/directory",
      };
      mockValidateDirectoryForSettings.mockResolvedValue({
        status: "valid",
        message: "有効なディレクトリです",
      });

      const handler = handlers.get(SLIDE_SETTINGS_CHANNELS.VALIDATE_DIRECTORY);
      if (!handler) {
        throw new Error(
          "slideSettings:validateDirectory handler not registered",
        );
      }

      // When: ハンドラーを呼び出す
      const result = (await handler({}, request)) as Result<ValidationResult>;

      // Then: valid判定を返す
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("valid");
      }
    });

    it("SSH-VD-02: 存在しないディレクトリでwarning付きを返す", async () => {
      // Given: 存在しないディレクトリ
      const request: ValidateDirectoryRequest = {
        path: "/non/existing/directory",
      };
      mockValidateDirectoryForSettings.mockResolvedValue({
        status: "warning",
        message: "ディレクトリが存在しません。自動作成されます。",
      });

      const handler = handlers.get(SLIDE_SETTINGS_CHANNELS.VALIDATE_DIRECTORY);
      if (!handler) {
        throw new Error(
          "slideSettings:validateDirectory handler not registered",
        );
      }

      // When: ハンドラーを呼び出す
      const result = (await handler({}, request)) as Result<ValidationResult>;

      // Then: warning判定を返す
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("warning");
      }
    });

    it("SSH-VD-03: パストラバーサルでinvalidを返す", async () => {
      // Given: パストラバーサルを含むパス
      const request: ValidateDirectoryRequest = {
        path: "../../../etc/passwd",
      };
      mockValidateDirectoryForSettings.mockResolvedValue({
        status: "error",
        message: "パストラバーサルは許可されていません",
      });

      const handler = handlers.get(SLIDE_SETTINGS_CHANNELS.VALIDATE_DIRECTORY);
      if (!handler) {
        throw new Error(
          "slideSettings:validateDirectory handler not registered",
        );
      }

      // When: ハンドラーを呼び出す
      const result = (await handler({}, request)) as Result<ValidationResult>;

      // Then: error判定を返す
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("error");
        expect(result.data.message).toMatch(/traversal|許可/);
      }
    });
  });

  // ===========================================================================
  // slideSettings:getAllSettings
  // ===========================================================================

  describe("slideSettings:getAllSettings", () => {
    it("SSH-GAS-01: 全設定をSlideSettings型で返す", async () => {
      // Given: 設定が存在する
      const expectedSettings: SlideSettings = {
        outputDirectory: "~/Documents/Slides",
        autoCreateDirectory: true,
        defaultTheme: "kanagawa",
        schemaVersion: 1,
      };
      mockSlideSettingsStore.store = expectedSettings;

      const handler = handlers.get(SLIDE_SETTINGS_CHANNELS.GET_ALL);
      if (!handler) {
        throw new Error("slideSettings:getAllSettings handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler({})) as Result<SlideSettings>;

      // Then: 全設定を返す
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty("outputDirectory");
        expect(result.data).toHaveProperty("autoCreateDirectory");
        expect(result.data).toHaveProperty("defaultTheme");
        expect(result.data).toHaveProperty("schemaVersion");
        expect(result.data.defaultTheme).toBe("kanagawa");
      }
    });
  });

  // ===========================================================================
  // ハンドラー登録確認
  // ===========================================================================

  describe("registerSlideSettingsHandlers", () => {
    it("should register slideSettings:getDirectory handler", () => {
      expect(handlers.has(SLIDE_SETTINGS_CHANNELS.GET_DIRECTORY)).toBe(true);
    });

    it("should register slideSettings:setDirectory handler", () => {
      expect(handlers.has(SLIDE_SETTINGS_CHANNELS.SET_DIRECTORY)).toBe(true);
    });

    it("should register slideSettings:selectDirectory handler", () => {
      expect(handlers.has(SLIDE_SETTINGS_CHANNELS.SELECT_DIRECTORY)).toBe(true);
    });

    it("should register slideSettings:validateDirectory handler", () => {
      expect(handlers.has(SLIDE_SETTINGS_CHANNELS.VALIDATE_DIRECTORY)).toBe(
        true,
      );
    });

    it("should register slideSettings:getAllSettings handler", () => {
      expect(handlers.has(SLIDE_SETTINGS_CHANNELS.GET_ALL)).toBe(true);
    });
  });

  // ===========================================================================
  // エラーハンドリング
  // ===========================================================================

  describe("Error Handling", () => {
    it("SSH-ERR-01: サービスエラー時にResult.errorを返す", async () => {
      // Given: サービスがエラーをthrow - mock store method to throw
      mockSlideSettingsStore.setDirectory.mockImplementationOnce(() => {
        throw new Error("Service error");
      });

      const handler = handlers.get(SLIDE_SETTINGS_CHANNELS.SET_DIRECTORY);
      if (!handler) {
        throw new Error("slideSettings:setDirectory handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler(
        {},
        {
          path: "/valid/path",
          autoCreate: false,
        },
      )) as Result<void>;

      // Then: エラーを返す
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("SSH-ERR-02: ダイアログエラー時にResult.errorを返す", async () => {
      // Given: ダイアログがエラー
      mockDialog.showOpenDialog.mockRejectedValue(new Error("Dialog error"));

      const handler = handlers.get(SLIDE_SETTINGS_CHANNELS.SELECT_DIRECTORY);
      if (!handler) {
        throw new Error("slideSettings:selectDirectory handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = (await handler({})) as Result<string | null>;

      // Then: エラーを返す
      expect(result.success).toBe(false);
    });
  });
});
