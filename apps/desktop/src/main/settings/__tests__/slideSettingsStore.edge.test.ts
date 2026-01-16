/**
 * SlideSettingsStore Edge Case Tests
 *
 * エッジケース、境界条件、異常系のテスト
 *
 * @module @repo/desktop/main/settings/__tests__/slideSettingsStore.edge.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  expandHomePath,
  getSlideSettingsStore,
  resetSlideSettingsStore,
  setSlideDirectory,
  validateDirectoryForSettings,
  DEFAULT_SLIDE_SETTINGS,
} from "../slideSettingsStore";

// グローバルモックストア（テストごとにリセット）
const mockStore: Record<string, unknown> = {};

// モックの設定
vi.mock("electron-store", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      get: vi.fn((key: string, defaultValue?: unknown) => {
        return mockStore[key] !== undefined ? mockStore[key] : defaultValue;
      }),
      set: vi.fn((key: string, value: unknown) => {
        mockStore[key] = value;
      }),
      delete: vi.fn((key: string) => {
        delete mockStore[key];
      }),
      clear: vi.fn(() => {
        Object.keys(mockStore).forEach((key) => delete mockStore[key]);
      }),
      store: mockStore,
    })),
  };
});

describe("SlideSettingsStore - エッジケース", () => {
  let testDir: string;

  beforeEach(() => {
    // モックストアをリセット
    Object.keys(mockStore).forEach((key) => delete mockStore[key]);
    resetSlideSettingsStore();
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), "slide-edge-test-"));
  });

  afterEach(() => {
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  describe("パス処理", () => {
    it("SSS-EDGE-01: 空文字列のパスを拒否する", async () => {
      const result = await setSlideDirectory({
        path: "",
        autoCreate: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("empty");
    });

    it("SSS-EDGE-02: 空白のみのパスを拒否する", async () => {
      const result = await setSlideDirectory({
        path: "   ",
        autoCreate: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("empty");
    });

    it("SSS-EDGE-03: 非常に長いパス（1000文字以上）を処理する", async () => {
      // 実際にはOSの制限に依存するが、バリデーションエラーは発生しない
      const longPath = "/valid" + "/subdir".repeat(200);
      const result = await validateDirectoryForSettings(longPath);

      // 存在しないディレクトリなのでwarningが出る
      expect(result.status).toBe("warning");
    });

    it("SSS-EDGE-04: 特殊文字を含むパス（日本語）を正しく処理", async () => {
      const japaneseDir = path.join(testDir, "日本語フォルダ");
      fs.mkdirSync(japaneseDir);

      const result = await validateDirectoryForSettings(japaneseDir);

      expect(result.status).toBe("valid");
      expect(result.message).toContain("valid");
    });

    it("SSS-EDGE-05: 特殊文字を含むパス（スペース）を正しく処理", async () => {
      const spaceDir = path.join(testDir, "folder with spaces");
      fs.mkdirSync(spaceDir);

      const result = await validateDirectoryForSettings(spaceDir);

      expect(result.status).toBe("valid");
    });

    it("SSS-EDGE-06: 末尾のスラッシュを正規化する", async () => {
      const dirWithSlash = testDir + "/";
      const result = await validateDirectoryForSettings(dirWithSlash);

      expect(result.status).toBe("valid");
    });
  });

  describe("ホームディレクトリ展開", () => {
    it("SSS-EDGE-07: ~/ を正しく展開する", () => {
      const expanded = expandHomePath("~/Documents");
      expect(expanded).toBe(path.join(os.homedir(), "Documents"));
    });

    it("SSS-EDGE-08: ~ 単独を正しく展開する", () => {
      const expanded = expandHomePath("~");
      expect(expanded).toBe(os.homedir());
    });

    it("SSS-EDGE-09: ~で始まらないパスはそのまま返す", () => {
      const testPath = "/usr/local/bin";
      const expanded = expandHomePath(testPath);
      expect(expanded).toBe(testPath);
    });

    it("SSS-EDGE-10: 中間の~は展開しない", () => {
      const testPath = "/some/~path/here";
      const expanded = expandHomePath(testPath);
      expect(expanded).toBe(testPath);
    });

    it("SSS-EDGE-11: ~/パスのバリデーションが成功する", async () => {
      // ~/Documents が存在すると仮定
      const result = await validateDirectoryForSettings("~/Documents");
      // 存在確認は実際のファイルシステムに依存
      expect(["valid", "warning"]).toContain(result.status);
    });
  });

  describe("パストラバーサル防止", () => {
    it("SSS-EDGE-12: ../を含むパスを拒否", async () => {
      const result = await setSlideDirectory({
        path: "/valid/../etc/passwd",
        autoCreate: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("traversal");
    });

    it("SSS-EDGE-13: 複数の../を含むパスを拒否", async () => {
      const result = await setSlideDirectory({
        path: "/valid/../../etc/passwd",
        autoCreate: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("traversal");
    });

    it("SSS-EDGE-14: SlideSettingsStore.setDirectoryは相対パスを拒否", () => {
      const store = getSlideSettingsStore();

      // SlideSettingsStore.setDirectoryは絶対パスのみ受け入れる
      expect(() => {
        store.setDirectory("relative/path/to/dir");
      }).toThrow("must be an absolute path");
    });

    it("SSS-EDGE-15: null文字を含むパスを拒否", async () => {
      const result = await setSlideDirectory({
        path: "/valid/path\0/etc/passwd",
        autoCreate: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("null");
    });

    it("SSS-EDGE-16: URLエンコードされた../(%2e%2e%2f)を拒否", async () => {
      const result = await setSlideDirectory({
        path: "/valid/%2e%2e/etc/passwd",
        autoCreate: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("URL encoded");
    });

    it("SSS-EDGE-17: 大文字URLエンコード(%2E)も拒否", async () => {
      const result = await setSlideDirectory({
        path: "/valid/%2E%2E/etc",
        autoCreate: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("URL encoded");
    });
  });

  describe("バリデーション境界条件", () => {
    it("SSS-EDGE-18: ファイルパスをディレクトリとして設定しようとするとエラー", async () => {
      // 一時ファイルを作成
      const filePath = path.join(testDir, "testfile.txt");
      fs.writeFileSync(filePath, "test");

      const store = getSlideSettingsStore();
      const result = store.validateDirectory(filePath);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("not a directory");
    });

    it("SSS-EDGE-19: 読み取り専用ディレクトリのバリデーション", async () => {
      // Unixシステムでのみ有効なテスト
      if (process.platform === "win32") {
        return;
      }

      const readOnlyDir = path.join(testDir, "readonly");
      fs.mkdirSync(readOnlyDir);
      fs.chmodSync(readOnlyDir, 0o444);

      try {
        const store = getSlideSettingsStore();
        const result = store.validateDirectory(readOnlyDir);

        expect(result.valid).toBe(false);
        expect(result.writable).toBe(false);
        expect(result.error).toContain("not writable");
      } finally {
        fs.chmodSync(readOnlyDir, 0o755);
      }
    });

    it("SSS-EDGE-20: 親ディレクトリが存在しない場合のバリデーション", () => {
      const store = getSlideSettingsStore();
      const result = store.validateDirectory("/nonexistent/parent/child");

      expect(result.valid).toBe(false);
      expect(result.exists).toBe(false);
      expect(result.error).toContain("Parent directory does not exist");
    });

    it("SSS-EDGE-21: 親ディレクトリが存在する場合、作成可能と判定", async () => {
      const store = getSlideSettingsStore();
      const newDir = path.join(testDir, "newsubdir");

      const result = store.validateDirectory(newDir);

      expect(result.valid).toBe(true);
      expect(result.exists).toBe(false);
      expect(result.writable).toBe(true);
      expect(result.warning).toContain("can be created");
    });
  });

  describe("設定ストアの境界条件", () => {
    it("SSS-EDGE-22: デフォルト設定を正しく返す", () => {
      const store = getSlideSettingsStore();
      const settings = store.getSettings();

      expect(settings.outputDirectory).toBe(
        DEFAULT_SLIDE_SETTINGS.outputDirectory,
      );
      expect(settings.autoCreateDirectory).toBe(
        DEFAULT_SLIDE_SETTINGS.autoCreateDirectory,
      );
      expect(settings.defaultTheme).toBe(DEFAULT_SLIDE_SETTINGS.defaultTheme);
      expect(settings.schemaVersion).toBe(DEFAULT_SLIDE_SETTINGS.schemaVersion);
    });

    it("SSS-EDGE-23: autoCreateDirectoryフラグを正しく取得・設定", () => {
      const store = getSlideSettingsStore();

      // デフォルト値を確認
      expect(store.getAutoCreateDirectory()).toBe(true);

      // 値を変更
      store.setAutoCreateDirectory(false);
      expect(store.getAutoCreateDirectory()).toBe(false);

      // 元に戻す
      store.setAutoCreateDirectory(true);
      expect(store.getAutoCreateDirectory()).toBe(true);
    });

    it("SSS-EDGE-24: リセットで全設定がデフォルトに戻る", () => {
      const store = getSlideSettingsStore();

      // 値を変更
      store.setAutoCreateDirectory(false);
      store.setSchemaVersion(99);

      // リセット
      store.reset();

      // デフォルト値を確認
      expect(store.getAutoCreateDirectory()).toBe(
        DEFAULT_SLIDE_SETTINGS.autoCreateDirectory,
      );
      expect(store.getSchemaVersion()).toBe(
        DEFAULT_SLIDE_SETTINGS.schemaVersion,
      );
    });
  });

  describe("自動ディレクトリ作成", () => {
    it("SSS-EDGE-25: autoCreate=trueで存在しないディレクトリを作成", async () => {
      const newDir = path.join(testDir, "autocreate-test");

      const result = await setSlideDirectory({
        path: newDir,
        autoCreate: true,
      });

      expect(result.success).toBe(true);
      expect(fs.existsSync(newDir)).toBe(true);
    });

    it("SSS-EDGE-26: autoCreate=falseで存在しないディレクトリは作成しない", async () => {
      const newDir = path.join(testDir, "no-autocreate-test");

      const result = await setSlideDirectory({
        path: newDir,
        autoCreate: false,
      });

      // 設定自体は成功（パスの保存のみ）
      expect(result.success).toBe(true);
      expect(fs.existsSync(newDir)).toBe(false);
    });

    it("SSS-EDGE-27: ネストされたディレクトリを再帰的に作成", async () => {
      const nestedDir = path.join(testDir, "level1", "level2", "level3");

      const result = await setSlideDirectory({
        path: nestedDir,
        autoCreate: true,
      });

      expect(result.success).toBe(true);
      expect(fs.existsSync(nestedDir)).toBe(true);
    });
  });
});
