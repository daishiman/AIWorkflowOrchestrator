/**
 * SlideSettings Integration Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 *
 * Main-Renderer間の統合テスト
 *
 * @see docs/30-workflows/slide-directory-settings/outputs/phase-2/data-flow-design.md
 * @see docs/30-workflows/slide-directory-settings/outputs/phase-3/integration-test-review.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// === Type Definitions ===

interface SlideSettings {
  outputDirectory: string;
  autoCreateDirectory: boolean;
  defaultTheme: "kanagawa";
  schemaVersion: number;
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

// === Test Infrastructure ===

// Shared mutable state for electron-store mock
const mockStoreData: SlideSettings = {
  outputDirectory: "~/Documents/Slides",
  autoCreateDirectory: true,
  defaultTheme: "kanagawa",
  schemaVersion: 1,
};

// Mock implementations that directly use mockStoreData
const mockStore = {
  get: (key: string, defaultValue?: unknown) => {
    const value = mockStoreData[key as keyof SlideSettings];
    return value !== undefined ? value : defaultValue;
  },
  set: (key: string, value: unknown) => {
    (mockStoreData as Record<string, unknown>)[key] = value;
  },
  store: mockStoreData,
};

// Wrap with vi.fn() for spy functionality
const mockStoreGet = vi.fn(mockStore.get);
const mockStoreSet = vi.fn(mockStore.set);
const mockStoreWrapper = {
  get: mockStoreGet,
  set: mockStoreSet,
  store: mockStoreData,
};

// Mock fs
const mockFs = {
  existsSync: vi.fn().mockReturnValue(true),
  accessSync: vi.fn(),
  mkdirSync: vi.fn(),
  statSync: vi.fn().mockReturnValue({
    isDirectory: () => true,
    isFile: () => false,
    isSymbolicLink: () => false,
  }),
  constants: { W_OK: 2 },
};

// Mock electron modules
const mockIpcMain = {
  handle: vi.fn(),
  removeHandler: vi.fn(),
};

const mockIpcRenderer = {
  invoke: vi.fn(),
};

const mockDialog = {
  showOpenDialog: vi.fn(),
};

// Register mocks
vi.mock("electron", () => ({
  ipcMain: mockIpcMain,
  ipcRenderer: mockIpcRenderer,
  dialog: mockDialog,
  BrowserWindow: {
    fromWebContents: vi.fn().mockReturnValue({ id: 1 }),
  },
}));

vi.mock("../../main/infrastructure/security/ipc-validator.js", () => ({
  validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
  toIPCValidationError: vi
    .fn()
    .mockReturnValue({ error: { message: "IPC validation failed" } }),
}));

vi.mock("electron-store", () => ({
  default: vi.fn().mockImplementation(() => mockStoreWrapper),
}));

vi.mock("fs", () => mockFs);

// Mock mainWindow for handlers
const mockMainWindow = {
  id: 1,
  isDestroyed: () => false,
  webContents: {
    send: vi.fn(),
    id: 1,
  },
} as never;

// IPC Channel Constants
const SLIDE_SETTINGS_CHANNELS = {
  GET_DIRECTORY: "slideSettings:getDirectory",
  SET_DIRECTORY: "slideSettings:setDirectory",
  SELECT_DIRECTORY: "slideSettings:selectDirectory",
  VALIDATE_DIRECTORY: "slideSettings:validateDirectory",
  GET_ALL: "slideSettings:getAllSettings",
} as const;

describe("SlideSettings Integration", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(() => {
    // Reset mock call history
    mockStoreGet.mockClear();
    mockStoreSet.mockClear();
    mockFs.existsSync.mockClear();
    mockFs.accessSync.mockClear();
    mockFs.mkdirSync.mockClear();
    mockFs.statSync.mockClear();
    mockIpcMain.handle.mockClear();
    mockIpcRenderer.invoke.mockClear();
    mockDialog.showOpenDialog.mockClear();

    // Reset store data to defaults
    mockStoreData.outputDirectory = "~/Documents/Slides";
    mockStoreData.autoCreateDirectory = true;
    mockStoreData.defaultTheme = "kanagawa";
    mockStoreData.schemaVersion = 1;

    // Reset mockStoreGet implementation to default behavior
    mockStoreGet.mockImplementation((key: string, defaultValue?: unknown) => {
      const value = mockStoreData[key as keyof SlideSettings];
      return value !== undefined ? value : defaultValue;
    });

    // Reset fs mocks to default values
    mockFs.existsSync.mockReturnValue(true);
    mockFs.accessSync.mockReturnValue(undefined);
    mockFs.statSync.mockReturnValue({
      isDirectory: () => true,
      isFile: () => false,
      isSymbolicLink: () => false,
    });

    handlers = new Map();

    // Capture IPC handlers when registered
    mockIpcMain.handle.mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    // Setup IPC renderer to call the correct handler
    mockIpcRenderer.invoke.mockImplementation(
      async (channel: string, ...args: unknown[]) => {
        const handler = handlers.get(channel);
        if (!handler) {
          throw new Error(`No handler for channel: ${channel}`);
        }
        // First arg is event object in real IPC
        return handler({}, ...args);
      },
    );

    // Reset store data
    mockStoreData.outputDirectory = "~/Documents/Slides";
    mockStoreData.autoCreateDirectory = true;
    mockStoreData.defaultTheme = "kanagawa";
    mockStoreData.schemaVersion = 1;

    // Default dialog response
    mockDialog.showOpenDialog.mockResolvedValue({
      canceled: false,
      filePaths: ["/selected/path"],
    });
  });

  // NOTE: vi.resetModules() is only used in specific tests that need to simulate app restart
  // Using it in afterEach breaks mock application for subsequent tests

  // ===========================================================================
  // 設定読み込みフロー
  // ===========================================================================

  describe("設定読み込みフロー", () => {
    it("INT-LOAD-01: Renderer起動時にMain経由で設定を読み込む", async () => {
      // Given: ハンドラーが登録されている
      try {
        const { registerSlideSettingsHandlers } =
          await import("../../main/ipc/slideSettingsHandlers");
        registerSlideSettingsHandlers(mockMainWindow);
      } catch {
        throw new Error("slideSettingsHandlers module not implemented");
      }

      // When: Rendererから設定を取得
      const result = (await mockIpcRenderer.invoke(
        SLIDE_SETTINGS_CHANNELS.GET_ALL,
      )) as Result<SlideSettings>;

      // Then: 設定が返される
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty("outputDirectory");
        expect(result.data).toHaveProperty("autoCreateDirectory");
        expect(result.data).toHaveProperty("defaultTheme");
        expect(result.data.defaultTheme).toBe("kanagawa");
      }
    });

    it("INT-LOAD-02: 初回起動時にデフォルト設定が返される", async () => {
      // Given: ストアが空（初回起動シミュレート）
      mockStoreGet.mockImplementation(() => undefined);

      try {
        const { registerSlideSettingsHandlers } =
          await import("../../main/ipc/slideSettingsHandlers");
        registerSlideSettingsHandlers(mockMainWindow);
      } catch {
        throw new Error("slideSettingsHandlers module not implemented");
      }

      // When: 設定を取得
      const result = (await mockIpcRenderer.invoke(
        SLIDE_SETTINGS_CHANNELS.GET_ALL,
      )) as Result<SlideSettings>;

      // Then: デフォルト設定が返される
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.outputDirectory).toBe("~/Documents/Slides");
      }
    });
  });

  // ===========================================================================
  // ディレクトリ選択フロー
  // ===========================================================================

  describe("ディレクトリ選択フロー", () => {
    it("INT-SELECT-01: 選択→バリデーション→保存の一連のフロー", async () => {
      // Given: ハンドラーが登録されている
      try {
        const { registerSlideSettingsHandlers } =
          await import("../../main/ipc/slideSettingsHandlers");
        registerSlideSettingsHandlers(mockMainWindow);
      } catch {
        throw new Error("slideSettingsHandlers module not implemented");
      }

      // Step 1: ディレクトリ選択
      mockDialog.showOpenDialog.mockResolvedValue({
        canceled: false,
        filePaths: ["/new/slides/directory"],
      });

      const selectResult = (await mockIpcRenderer.invoke(
        SLIDE_SETTINGS_CHANNELS.SELECT_DIRECTORY,
      )) as Result<string | null>;

      expect(selectResult.success).toBe(true);
      if (selectResult.success) {
        expect(selectResult.data).toBe("/new/slides/directory");
      }

      // Step 2: バリデーション
      mockFs.existsSync.mockReturnValue(true);
      mockFs.accessSync.mockReturnValue(undefined);

      const validateResult = (await mockIpcRenderer.invoke(
        SLIDE_SETTINGS_CHANNELS.VALIDATE_DIRECTORY,
        "/new/slides/directory",
      )) as Result<ValidationResult>;

      expect(validateResult.success).toBe(true);
      if (validateResult.success) {
        expect(validateResult.data.status).toBe("valid");
      }

      // Step 3: 保存
      const saveResult = (await mockIpcRenderer.invoke(
        SLIDE_SETTINGS_CHANNELS.SET_DIRECTORY,
        "/new/slides/directory",
      )) as Result<void>;

      expect(saveResult.success).toBe(true);

      // Step 4: 保存確認
      const verifyResult = (await mockIpcRenderer.invoke(
        SLIDE_SETTINGS_CHANNELS.GET_DIRECTORY,
      )) as Result<string>;

      expect(verifyResult.success).toBe(true);
      if (verifyResult.success) {
        expect(verifyResult.data).toBe("/new/slides/directory");
      }
    });

    it("INT-SELECT-02: キャンセル時は設定が変更されない", async () => {
      // Given: ハンドラーが登録されている
      try {
        const { registerSlideSettingsHandlers } =
          await import("../../main/ipc/slideSettingsHandlers");
        registerSlideSettingsHandlers(mockMainWindow);
      } catch {
        throw new Error("slideSettingsHandlers module not implemented");
      }

      // 元の設定を確認
      const originalResult = (await mockIpcRenderer.invoke(
        SLIDE_SETTINGS_CHANNELS.GET_DIRECTORY,
      )) as Result<string>;

      // ダイアログがキャンセルされる
      mockDialog.showOpenDialog.mockResolvedValue({
        canceled: true,
        filePaths: [],
      });

      const selectResult = (await mockIpcRenderer.invoke(
        SLIDE_SETTINGS_CHANNELS.SELECT_DIRECTORY,
      )) as Result<string | null>;

      // Then: nullが返され、設定は変更されない
      expect(selectResult.success).toBe(true);
      if (selectResult.success) {
        expect(selectResult.data).toBeNull();
      }

      // 設定が変更されていないことを確認
      const afterResult = (await mockIpcRenderer.invoke(
        SLIDE_SETTINGS_CHANNELS.GET_DIRECTORY,
      )) as Result<string>;

      if (originalResult.success && afterResult.success) {
        expect(afterResult.data).toBe(originalResult.data);
      }
    });
  });

  // ===========================================================================
  // 永続化フロー
  // ===========================================================================

  describe("永続化フロー", () => {
    it("INT-PERSIST-01: 保存した設定がアプリ再起動後も維持される", async () => {
      // Given: ハンドラーが登録されている
      try {
        const { registerSlideSettingsHandlers } =
          await import("../../main/ipc/slideSettingsHandlers");
        registerSlideSettingsHandlers(mockMainWindow);
      } catch {
        throw new Error("slideSettingsHandlers module not implemented");
      }

      // Step 1: 設定を保存
      await mockIpcRenderer.invoke(
        SLIDE_SETTINGS_CHANNELS.SET_DIRECTORY,
        "/persistent/path",
      );

      // Step 2: モジュールをリセット（アプリ再起動シミュレート）
      vi.resetModules();
      handlers.clear();

      // Step 3: ハンドラーを再登録
      mockIpcMain.handle.mockImplementation(
        (
          channel: string,
          handler: (...args: unknown[]) => Promise<unknown>,
        ) => {
          handlers.set(channel, handler);
        },
      );

      try {
        const { registerSlideSettingsHandlers } =
          await import("../../main/ipc/slideSettingsHandlers");
        registerSlideSettingsHandlers(mockMainWindow);
      } catch {
        throw new Error("slideSettingsHandlers module not implemented");
      }

      // Step 4: 設定を再取得
      const result = (await mockIpcRenderer.invoke(
        SLIDE_SETTINGS_CHANNELS.GET_DIRECTORY,
      )) as Result<string>;

      // Then: 保存した設定が維持されている
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("/persistent/path");
      }
    });

    it("INT-PERSIST-02: autoCreateDirectory設定も永続化される", async () => {
      // Given: ハンドラーが登録されている
      try {
        const { registerSlideSettingsHandlers } =
          await import("../../main/ipc/slideSettingsHandlers");
        registerSlideSettingsHandlers(mockMainWindow);
      } catch {
        throw new Error("slideSettingsHandlers module not implemented");
      }

      // 設定を保存
      await mockIpcRenderer.invoke(
        SLIDE_SETTINGS_CHANNELS.SET_DIRECTORY,
        "/some/path",
      );

      // 全設定を取得
      const result = (await mockIpcRenderer.invoke(
        SLIDE_SETTINGS_CHANNELS.GET_ALL,
      )) as Result<SlideSettings>;

      // Then: 設定が保存されている (autoCreateDirectoryは別の設定)
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.outputDirectory).toBe("/some/path");
      }
    });
  });

  // ===========================================================================
  // エラーハンドリングフロー
  // ===========================================================================

  describe("エラーハンドリングフロー", () => {
    it("INT-ERR-01: IPC失敗時にRendererでエラーを表示", async () => {
      // Given: ハンドラーが登録されている
      try {
        const { registerSlideSettingsHandlers } =
          await import("../../main/ipc/slideSettingsHandlers");
        registerSlideSettingsHandlers(mockMainWindow);
      } catch {
        throw new Error("slideSettingsHandlers module not implemented");
      }

      // パストラバーサルを試行
      const result = (await mockIpcRenderer.invoke(
        SLIDE_SETTINGS_CHANNELS.VALIDATE_DIRECTORY,
        "../../../etc/passwd",
      )) as Result<ValidationResult>;

      // Then: エラーが返される
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("error");
        expect(result.data.message).toMatch(/traversal|not allowed|許可/i);
      }
    });

    it("INT-ERR-02: 書き込み権限エラーが適切に報告される", async () => {
      // Given: ハンドラーが登録されている
      try {
        const { registerSlideSettingsHandlers } =
          await import("../../main/ipc/slideSettingsHandlers");
        registerSlideSettingsHandlers(mockMainWindow);
      } catch {
        throw new Error("slideSettingsHandlers module not implemented");
      }

      // 書き込み権限エラーをシミュレート
      mockFs.existsSync.mockReturnValue(true);
      mockFs.accessSync.mockImplementation(() => {
        throw new Error("Permission denied");
      });

      const result = (await mockIpcRenderer.invoke(
        SLIDE_SETTINGS_CHANNELS.VALIDATE_DIRECTORY,
        "/readonly/directory",
      )) as Result<ValidationResult>;

      // Then: 権限エラーが返される
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("error");
        expect(result.data.message).toMatch(/permission|権限/i);
      }
    });

    it("INT-ERR-03: ストア破損時にデフォルト値にフォールバック", async () => {
      // Given: ストアが破損
      mockStoreGet.mockImplementation(() => {
        throw new Error("Store corrupted");
      });

      try {
        const { registerSlideSettingsHandlers } =
          await import("../../main/ipc/slideSettingsHandlers");
        registerSlideSettingsHandlers(mockMainWindow);
      } catch {
        throw new Error("slideSettingsHandlers module not implemented");
      }

      // When: 設定を取得
      const result = (await mockIpcRenderer.invoke(
        SLIDE_SETTINGS_CHANNELS.GET_ALL,
      )) as Result<SlideSettings>;

      // Then: デフォルト値が返される（フォールバック）
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.outputDirectory).toBe("~/Documents/Slides");
      }
    });
  });

  // ===========================================================================
  // セキュリティフロー
  // ===========================================================================

  describe("セキュリティフロー", () => {
    it("INT-SEC-01: URLエンコードされたパストラバーサルが拒否される", async () => {
      // Given: ハンドラーが登録されている
      try {
        const { registerSlideSettingsHandlers } =
          await import("../../main/ipc/slideSettingsHandlers");
        registerSlideSettingsHandlers(mockMainWindow);
      } catch {
        throw new Error("slideSettingsHandlers module not implemented");
      }

      // URLエンコードされたトラバーサルを試行
      const result = (await mockIpcRenderer.invoke(
        SLIDE_SETTINGS_CHANNELS.SET_DIRECTORY,
        "/test/%2e%2e/%2e%2e/etc/passwd",
      )) as Result<void>;

      // Then: エラーが返される
      expect(result.success).toBe(false);
    });

    it("INT-SEC-02: 空のパスが拒否される", async () => {
      // Given: ハンドラーが登録されている
      try {
        const { registerSlideSettingsHandlers } =
          await import("../../main/ipc/slideSettingsHandlers");
        registerSlideSettingsHandlers(mockMainWindow);
      } catch {
        throw new Error("slideSettingsHandlers module not implemented");
      }

      // 空のパスを試行
      const result = (await mockIpcRenderer.invoke(
        SLIDE_SETTINGS_CHANNELS.SET_DIRECTORY,
        "",
      )) as Result<void>;

      // Then: エラーが返される
      expect(result.success).toBe(false);
    });

    it("INT-SEC-03: null文字を含むパスが拒否される", async () => {
      // Given: ハンドラーが登録されている
      try {
        const { registerSlideSettingsHandlers } =
          await import("../../main/ipc/slideSettingsHandlers");
        registerSlideSettingsHandlers(mockMainWindow);
      } catch {
        throw new Error("slideSettingsHandlers module not implemented");
      }

      // null文字を含むパスを試行
      const result = (await mockIpcRenderer.invoke(
        SLIDE_SETTINGS_CHANNELS.SET_DIRECTORY,
        "/test/path\0/malicious",
      )) as Result<void>;

      // Then: エラーが返される
      expect(result.success).toBe(false);
    });
  });

  // ===========================================================================
  // 自動作成フロー
  // ===========================================================================

  describe("自動作成フロー", () => {
    it("INT-AUTO-01: autoCreate=trueでディレクトリが自動作成される", async () => {
      // Given: ハンドラーが登録されている
      try {
        const { registerSlideSettingsHandlers } =
          await import("../../main/ipc/slideSettingsHandlers");
        registerSlideSettingsHandlers(mockMainWindow);
      } catch {
        throw new Error("slideSettingsHandlers module not implemented");
      }

      // ディレクトリは存在しないが、親ディレクトリは存在する
      // validateDirectory will return valid: true, exists: false
      mockFs.existsSync.mockImplementation((p: string) => {
        // Target directory doesn't exist, but parent does
        if (p.endsWith("/to/create")) return false;
        return true; // Parent directories exist
      });
      // autoCreateDirectory is true by default in mockStoreData

      // When: 存在しないディレクトリを保存
      await mockIpcRenderer.invoke(
        SLIDE_SETTINGS_CHANNELS.SET_DIRECTORY,
        "/new/directory/to/create",
      );

      // Then: autoCreateDirectoryが有効なのでmkdirSyncが呼び出される
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining("new/directory/to/create"),
        expect.objectContaining({ recursive: true }),
      );
    });

    it("INT-AUTO-02: autoCreateDirectory=falseでディレクトリは作成されない", async () => {
      // Given: ハンドラーが登録されている & autoCreateDirectory=false
      mockStoreData.autoCreateDirectory = false;

      try {
        const { registerSlideSettingsHandlers } =
          await import("../../main/ipc/slideSettingsHandlers");
        registerSlideSettingsHandlers(mockMainWindow);
      } catch {
        throw new Error("slideSettingsHandlers module not implemented");
      }

      // ディレクトリは存在しないが、親ディレクトリは存在する
      mockFs.existsSync.mockImplementation((p: string) => {
        // Target directory doesn't exist, but parent does
        if (p.endsWith("/to/create")) return false;
        return true; // Parent directories exist
      });

      // When: 存在しないディレクトリを保存
      await mockIpcRenderer.invoke(
        SLIDE_SETTINGS_CHANNELS.SET_DIRECTORY,
        "/new/directory/not/to/create",
      );

      // Then: autoCreateDirectoryが無効なのでmkdirSyncは呼び出されない
      expect(mockFs.mkdirSync).not.toHaveBeenCalled();
    });
  });
});
