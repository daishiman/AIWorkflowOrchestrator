/**
 * SlideSettingsStore Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 *
 * @see docs/30-workflows/slide-directory-settings/outputs/phase-2/store-schema-design.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as os from "node:os";

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

// === Mocks ===

// Mock electron-store
const mockStore = {
  get: vi.fn(),
  set: vi.fn(),
  has: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  store: {} as SlideSettings,
};

vi.mock("electron-store", () => ({
  default: vi.fn().mockImplementation(() => mockStore),
}));

// Mock fs module
const mockFs = {
  existsSync: vi.fn(),
  accessSync: vi.fn(),
  mkdirSync: vi.fn(),
  constants: {
    W_OK: 2,
  },
};

vi.mock("node:fs", () => mockFs);

// Mock path module (use actual implementation for most functions)
vi.mock("node:path", async () => {
  const actual = await vi.importActual<typeof import("node:path")>("node:path");
  return {
    ...actual,
  };
});

// Default slide settings
const DEFAULT_SLIDE_SETTINGS: SlideSettings = {
  outputDirectory: "~/Documents/Slides",
  autoCreateDirectory: true,
  defaultTheme: "kanagawa",
  schemaVersion: 1,
};

describe("SlideSettingsStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockStore.store = { ...DEFAULT_SLIDE_SETTINGS };
    mockStore.get.mockImplementation(
      (key: keyof SlideSettings) => mockStore.store[key],
    );
    mockStore.has.mockReturnValue(true);
    mockFs.existsSync.mockReturnValue(true);
    mockFs.accessSync.mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.resetModules();
  });

  // ===========================================================================
  // getSettings
  // ===========================================================================

  describe("getSettings", () => {
    it("SSS-GS-01: デフォルト設定を返す（初回起動時）", async () => {
      // Given: ストアが空（初回起動）
      mockStore.has.mockReturnValue(false);
      mockStore.store = { ...DEFAULT_SLIDE_SETTINGS };

      // When: getSettingsを呼び出す
      let settings: SlideSettings;
      try {
        const { getSlideSettingsStore } = await import("../slideSettingsStore");
        const store = getSlideSettingsStore();
        settings = store.store;
      } catch {
        // Expected in Red phase - module doesn't exist
        throw new Error("slideSettingsStore module not implemented");
      }

      // Then: デフォルト設定を返す
      expect(settings.outputDirectory).toBe("~/Documents/Slides");
      expect(settings.autoCreateDirectory).toBe(true);
      expect(settings.defaultTheme).toBe("kanagawa");
      expect(settings.schemaVersion).toBe(1);
    });

    it("SSS-GS-02: 保存された設定を返す", async () => {
      // Given: ストアに保存された設定がある
      const savedSettings: SlideSettings = {
        outputDirectory: "/custom/path/slides",
        autoCreateDirectory: false,
        defaultTheme: "kanagawa",
        schemaVersion: 1,
      };
      mockStore.store = savedSettings;

      // When: getSettingsを呼び出す
      let settings: SlideSettings;
      try {
        const { getSlideSettingsStore } = await import("../slideSettingsStore");
        const store = getSlideSettingsStore();
        settings = store.store;
      } catch {
        throw new Error("slideSettingsStore module not implemented");
      }

      // Then: 保存された設定を返す
      expect(settings.outputDirectory).toBe("/custom/path/slides");
      expect(settings.autoCreateDirectory).toBe(false);
    });

    it("SSS-GS-03: 破損時はデフォルト値にフォールバックする", async () => {
      // Given: ストアが破損している
      mockStore.get.mockImplementation(() => {
        throw new Error("Store corrupted");
      });

      // When: getSettingsを呼び出す（clearInvalidConfigが有効の場合）
      let settings: SlideSettings;
      try {
        const { getSlideSettingsStore } = await import("../slideSettingsStore");
        const store = getSlideSettingsStore();
        settings = store.store;
      } catch {
        throw new Error("slideSettingsStore module not implemented");
      }

      // Then: デフォルト値にフォールバック
      expect(settings.outputDirectory).toBe(
        DEFAULT_SLIDE_SETTINGS.outputDirectory,
      );
    });
  });

  // ===========================================================================
  // setDirectory
  // ===========================================================================

  describe("setDirectory", () => {
    it("SSS-SD-01: 有効なディレクトリパスを保存する", async () => {
      // Given: 有効なパス
      const validPath = "/Users/test/Documents/Slides";
      mockFs.existsSync.mockReturnValue(true);
      mockFs.accessSync.mockReturnValue(undefined);

      // When: setDirectoryを呼び出す
      try {
        const { setSlideDirectory } = await import("../slideSettingsStore");
        await setSlideDirectory({ path: validPath, autoCreate: false });
      } catch {
        throw new Error("slideSettingsStore module not implemented");
      }

      // Then: 設定が保存される
      expect(mockStore.set).toHaveBeenCalledWith("outputDirectory", validPath);
    });

    it("SSS-SD-02: 無効なパスでエラーを返す", async () => {
      // Given: 無効なパス（空文字）
      const invalidPath = "";

      // When/Then: エラーが返される
      try {
        const { setSlideDirectory } = await import("../slideSettingsStore");
        const result = await setSlideDirectory({
          path: invalidPath,
          autoCreate: false,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toMatch(/invalid|empty|path/i);
        }
      } catch {
        throw new Error("slideSettingsStore module not implemented");
      }
    });

    it("SSS-SD-03: パストラバーサル攻撃を拒否する", async () => {
      // Given: パストラバーサルを含むパス
      const maliciousPath = "/Users/test/../../../etc/passwd";

      // When/Then: エラーが返される
      try {
        const { setSlideDirectory } = await import("../slideSettingsStore");
        const result = await setSlideDirectory({
          path: maliciousPath,
          autoCreate: false,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toMatch(/traversal|not allowed/i);
        }
      } catch {
        throw new Error("slideSettingsStore module not implemented");
      }
    });

    it("SSS-SD-04: URLエンコードされたトラバーサルを拒否する", async () => {
      // Given: URLエンコードされたパストラバーサル
      const encodedPath = "/Users/test/%2e%2e/%2e%2e/etc/passwd";

      // When/Then: エラーが返される
      try {
        const { setSlideDirectory } = await import("../slideSettingsStore");
        const result = await setSlideDirectory({
          path: encodedPath,
          autoCreate: false,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toMatch(/traversal|encoded|not allowed/i);
        }
      } catch {
        throw new Error("slideSettingsStore module not implemented");
      }
    });

    it("SSS-SD-05: autoCreate=trueでディレクトリを自動作成する", async () => {
      // Given: 存在しないディレクトリ
      const newPath = "/Users/test/NewSlides";
      mockFs.existsSync.mockReturnValue(false);

      // When: setDirectoryをautoCreate=trueで呼び出す
      try {
        const { setSlideDirectory } = await import("../slideSettingsStore");
        await setSlideDirectory({ path: newPath, autoCreate: true });
      } catch {
        throw new Error("slideSettingsStore module not implemented");
      }

      // Then: mkdirSyncが呼び出される
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining(newPath.replace("~", "")),
        { recursive: true },
      );
    });
  });

  // ===========================================================================
  // validateDirectory
  // ===========================================================================

  describe("validateDirectory", () => {
    it("SSS-VD-01: 存在するディレクトリは有効と判定", async () => {
      // Given: 存在するディレクトリ
      const existingPath = "/Users/test/Documents";
      mockFs.existsSync.mockReturnValue(true);
      mockFs.accessSync.mockReturnValue(undefined);

      // When: validateDirectoryを呼び出す
      let result: ValidationResult;
      try {
        const { validateDirectoryForSettings } =
          await import("../slideSettingsStore");
        result = await validateDirectoryForSettings(existingPath);
      } catch {
        throw new Error("slideSettingsStore module not implemented");
      }

      // Then: valid判定
      expect(result.status).toBe("valid");
    });

    it("SSS-VD-02: 存在しないディレクトリは警告を返す", async () => {
      // Given: 存在しないディレクトリ
      const nonExistentPath = "/Users/test/NonExistent";
      mockFs.existsSync.mockReturnValue(false);

      // When: validateDirectoryを呼び出す
      let result: ValidationResult;
      try {
        const { validateDirectoryForSettings } =
          await import("../slideSettingsStore");
        result = await validateDirectoryForSettings(nonExistentPath);
      } catch {
        throw new Error("slideSettingsStore module not implemented");
      }

      // Then: warning判定
      expect(result.status).toBe("warning");
      expect(result.message).toMatch(/exist|作成/i);
    });

    it("SSS-VD-03: 書き込み権限がないディレクトリはエラー", async () => {
      // Given: 書き込み権限がないディレクトリ
      const readOnlyPath = "/Users/test/ReadOnly";
      mockFs.existsSync.mockReturnValue(true);
      mockFs.accessSync.mockImplementation(() => {
        throw new Error("Permission denied");
      });

      // When: validateDirectoryを呼び出す
      let result: ValidationResult;
      try {
        const { validateDirectoryForSettings } =
          await import("../slideSettingsStore");
        result = await validateDirectoryForSettings(readOnlyPath);
      } catch {
        throw new Error("slideSettingsStore module not implemented");
      }

      // Then: error判定
      expect(result.status).toBe("error");
      expect(result.message).toMatch(/permission|権限/i);
    });

    it("SSS-VD-04: 相対パス（../）を拒否する", async () => {
      // Given: 相対パス
      const relativePath = "../../../etc";

      // When: validateDirectoryを呼び出す
      let result: ValidationResult;
      try {
        const { validateDirectoryForSettings } =
          await import("../slideSettingsStore");
        result = await validateDirectoryForSettings(relativePath);
      } catch {
        throw new Error("slideSettingsStore module not implemented");
      }

      // Then: error判定
      expect(result.status).toBe("error");
      expect(result.message).toMatch(/traversal|not allowed/i);
    });

    it("SSS-VD-05: ホームディレクトリ（~）を展開する", async () => {
      // Given: ホームディレクトリを含むパス
      const homePath = "~/Documents/Slides";
      const expandedPath = `${os.homedir()}/Documents/Slides`;
      mockFs.existsSync.mockReturnValue(true);
      mockFs.accessSync.mockReturnValue(undefined);

      // When: validateDirectoryを呼び出す
      let result: ValidationResult;
      try {
        const { validateDirectoryForSettings } =
          await import("../slideSettingsStore");
        result = await validateDirectoryForSettings(homePath);
      } catch {
        throw new Error("slideSettingsStore module not implemented");
      }

      // Then: valid判定（展開されたパスで検証）
      expect(result.status).toBe("valid");
      expect(mockFs.existsSync).toHaveBeenCalledWith(expandedPath);
    });
  });

  // ===========================================================================
  // migration
  // ===========================================================================

  describe("migration", () => {
    it("SSS-MG-01: 古いschemaVersionから自動マイグレーション", async () => {
      // Given: 古いスキーマバージョン
      const oldSettings = {
        outputDirectory: "/old/path",
        autoCreateDirectory: true,
        defaultTheme: "kanagawa" as const,
        schemaVersion: 0,
      };
      mockStore.store = oldSettings;
      mockStore.get.mockImplementation(
        (key: keyof SlideSettings) => oldSettings[key],
      );

      // When: Storeを初期化
      try {
        const { getSlideSettingsStore, applyMigrations } =
          await import("../slideSettingsStore");
        const store = getSlideSettingsStore();
        await applyMigrations(store);
      } catch {
        throw new Error("slideSettingsStore module not implemented");
      }

      // Then: schemaVersionが更新される
      expect(mockStore.set).toHaveBeenCalledWith("schemaVersion", 1);
    });
  });

  // ===========================================================================
  // ホームディレクトリ展開
  // ===========================================================================

  describe("expandHomePath", () => {
    it("SSS-EH-01: ~をホームディレクトリに展開する", async () => {
      // Given: ~で始まるパス
      const tilePath = "~/Documents/Slides";

      // When: expandHomePathを呼び出す
      let expandedPath: string;
      try {
        const { expandHomePath } = await import("../slideSettingsStore");
        expandedPath = expandHomePath(tilePath);
      } catch {
        throw new Error("slideSettingsStore module not implemented");
      }

      // Then: ホームディレクトリに展開される
      expect(expandedPath).toBe(`${os.homedir()}/Documents/Slides`);
      expect(expandedPath).not.toContain("~");
    });

    it("SSS-EH-02: ~を含まないパスはそのまま返す", async () => {
      // Given: 絶対パス
      const absolutePath = "/absolute/path/to/slides";

      // When: expandHomePathを呼び出す
      let expandedPath: string;
      try {
        const { expandHomePath } = await import("../slideSettingsStore");
        expandedPath = expandHomePath(absolutePath);
      } catch {
        throw new Error("slideSettingsStore module not implemented");
      }

      // Then: そのまま返される
      expect(expandedPath).toBe(absolutePath);
    });
  });
});
