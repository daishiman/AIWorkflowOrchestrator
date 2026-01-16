/**
 * SlideSettings Extended Integration Tests
 *
 * End-to-End統合テストの拡充
 *
 * @module @repo/desktop/__tests__/integration/slideSettings.extended.integration.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  getSlideSettingsStore,
  resetSlideSettingsStore,
  setSlideDirectory,
  validateDirectoryForSettings,
  applyMigrations,
  expandHomePath,
  DEFAULT_SLIDE_SETTINGS,
} from "../../main/settings/slideSettingsStore";

// モックの設定
const mockStore: Record<string, unknown> = {};

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

describe("SlideSettings Integration - 拡充", () => {
  let testDir: string;

  beforeEach(() => {
    // モックストアをリセット
    Object.keys(mockStore).forEach((key) => delete mockStore[key]);
    resetSlideSettingsStore();
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), "slide-int-ext-test-"));
  });

  afterEach(() => {
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  describe("設定のライフサイクル", () => {
    it("SDS-INT-01: 初期設定 → 変更 → 保存の完全フロー", async () => {
      const store = getSlideSettingsStore();

      // 1. 初期設定を確認
      const initialSettings = store.getSettings();
      expect(initialSettings.outputDirectory).toBe(
        DEFAULT_SLIDE_SETTINGS.outputDirectory,
      );

      // 2. 新しいディレクトリを作成
      const newDir = path.join(testDir, "new-slides");
      fs.mkdirSync(newDir);

      // 3. 設定を変更
      const result = await setSlideDirectory({
        path: newDir,
        autoCreate: false,
      });
      expect(result.success).toBe(true);

      // 4. 変更が反映されていることを確認
      const updatedSettings = store.getSettings();
      expect(updatedSettings.outputDirectory).toBe(newDir);
    });

    it("SDS-INT-02: 設定変更 → 元に戻すフロー", async () => {
      const store = getSlideSettingsStore();
      const originalDir = store.getDirectory();

      // 1. 新しいディレクトリに変更
      const newDir = path.join(testDir, "temp-slides");
      fs.mkdirSync(newDir);
      await setSlideDirectory({
        path: newDir,
        autoCreate: false,
      });
      expect(store.getDirectory()).toBe(newDir);

      // 2. 元に戻す
      await setSlideDirectory({
        path: originalDir,
        autoCreate: false,
      });
      expect(store.getDirectory()).toBe(originalDir);
    });

    it("SDS-INT-03: autoCreate=trueで非存在ディレクトリ作成フロー", async () => {
      const store = getSlideSettingsStore();

      // 1. 存在しないネストされたディレクトリ
      const newDir = path.join(testDir, "nested", "slides", "output");

      // 2. autoCreate=trueで設定
      const result = await setSlideDirectory({
        path: newDir,
        autoCreate: true,
      });

      // 3. 成功とディレクトリ作成を確認
      expect(result.success).toBe(true);
      expect(fs.existsSync(newDir)).toBe(true);
      expect(store.getDirectory()).toBe(newDir);
    });
  });

  describe("バリデーションフロー", () => {
    it("SDS-INT-04: 有効なディレクトリのバリデーション → 設定の完全フロー", async () => {
      const validDir = path.join(testDir, "valid");
      fs.mkdirSync(validDir);

      // 1. バリデーション
      const validation = await validateDirectoryForSettings(validDir);
      expect(validation.status).toBe("valid");

      // 2. バリデーション成功後に設定
      const result = await setSlideDirectory({
        path: validDir,
        autoCreate: false,
      });
      expect(result.success).toBe(true);

      // 3. 設定が反映されていることを確認
      const store = getSlideSettingsStore();
      expect(store.getDirectory()).toBe(validDir);
    });

    it("SDS-INT-05: 無効なパスのバリデーション → 設定拒否フロー", async () => {
      const store = getSlideSettingsStore();
      const originalDir = store.getDirectory();

      // 1. パストラバーサルを含むパス
      const invalidPath = "../../../etc/passwd";
      const result = await setSlideDirectory({
        path: invalidPath,
        autoCreate: false,
      });

      // 2. 設定が拒否されること
      expect(result.success).toBe(false);
      expect(result.error).toContain("traversal");

      // 3. 元の設定が維持されること
      expect(store.getDirectory()).toBe(originalDir);
    });

    it("SDS-INT-06: 警告付きバリデーション → 設定成功フロー", async () => {
      // 1. 存在しない新しいディレクトリ
      const newDir = path.join(testDir, "will-be-created");

      // 2. バリデーション（警告が出る）
      const validation = await validateDirectoryForSettings(newDir);
      expect(validation.status).toBe("warning");

      // 3. autoCreate=trueで設定成功
      const result = await setSlideDirectory({
        path: newDir,
        autoCreate: true,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("エラーリカバリー", () => {
    it("SDS-INT-07: 設定失敗 → リトライ → 成功のフロー", async () => {
      // 1. 無効なパスで失敗
      const result1 = await setSlideDirectory({
        path: "../invalid",
        autoCreate: false,
      });
      expect(result1.success).toBe(false);

      // 2. 有効なパスで再試行
      const validDir = path.join(testDir, "retry-success");
      fs.mkdirSync(validDir);
      const result2 = await setSlideDirectory({
        path: validDir,
        autoCreate: false,
      });
      expect(result2.success).toBe(true);
    });

    it("SDS-INT-08: 複数回の連続設定変更", async () => {
      const store = getSlideSettingsStore();

      // 複数のディレクトリを作成
      const dirs = Array.from({ length: 5 }, (_, i) => {
        const dir = path.join(testDir, `dir-${i}`);
        fs.mkdirSync(dir);
        return dir;
      });

      // 連続して設定変更
      for (const dir of dirs) {
        const result = await setSlideDirectory({
          path: dir,
          autoCreate: false,
        });
        expect(result.success).toBe(true);
        expect(store.getDirectory()).toBe(dir);
      }
    });
  });

  describe("マイグレーション", () => {
    it("SDS-INT-09: schemaVersion=0からのマイグレーション", async () => {
      // 1. 古いバージョンをシミュレート
      mockStore["schemaVersion"] = 0;
      resetSlideSettingsStore();

      const store = getSlideSettingsStore();

      // 2. マイグレーションを適用
      await applyMigrations(store);

      // 3. バージョンが更新されていること
      expect(store.getSchemaVersion()).toBe(1);
    });

    it("SDS-INT-10: 最新バージョンではマイグレーション不要", async () => {
      // 1. 最新バージョンを設定
      mockStore["schemaVersion"] = 1;
      resetSlideSettingsStore();

      const store = getSlideSettingsStore();
      const initialVersion = store.getSchemaVersion();

      // 2. マイグレーションを適用（何も変わらない）
      await applyMigrations(store);

      // 3. バージョンが維持されること
      expect(store.getSchemaVersion()).toBe(initialVersion);
    });
  });

  describe("パス展開", () => {
    it("SDS-INT-11: ホームディレクトリ展開 → 設定 → バリデーションの完全フロー", async () => {
      // 1. ~/Documents/TestSlidesを展開
      const tildeBasedPath = "~/Documents/TestSlides";
      const expandedPath = expandHomePath(tildeBasedPath);

      expect(expandedPath).toBe(
        path.join(os.homedir(), "Documents", "TestSlides"),
      );

      // 2. 展開されたパスでバリデーション（存在しない場合は警告）
      const validation = await validateDirectoryForSettings(tildeBasedPath);
      expect(["valid", "warning"]).toContain(validation.status);
    });

    it("SDS-INT-12: 絶対パスは展開なしで処理", async () => {
      // 1. 絶対パス
      const absolutePath = testDir;

      // 2. 展開（変化なし）
      const expandedPath = expandHomePath(absolutePath);
      expect(expandedPath).toBe(absolutePath);

      // 3. バリデーション
      const validation = await validateDirectoryForSettings(absolutePath);
      expect(validation.status).toBe("valid");
    });
  });

  describe("autoCreateDirectory設定", () => {
    it("SDS-INT-13: autoCreateDirectory=trueの動作確認", async () => {
      const store = getSlideSettingsStore();

      // 1. 初期値確認
      expect(store.getAutoCreateDirectory()).toBe(true);

      // 2. 存在しないディレクトリを設定
      const newDir = path.join(testDir, "auto-created");
      await setSlideDirectory({
        path: newDir,
        autoCreate: true,
      });

      // 3. ディレクトリが作成されている
      expect(fs.existsSync(newDir)).toBe(true);
    });

    it("SDS-INT-14: autoCreateDirectory=falseの動作確認", async () => {
      const store = getSlideSettingsStore();

      // 1. autoCreateを無効化
      store.setAutoCreateDirectory(false);
      expect(store.getAutoCreateDirectory()).toBe(false);

      // 2. 存在しないディレクトリを設定（作成されない）
      const newDir = path.join(testDir, "not-auto-created");
      await setSlideDirectory({
        path: newDir,
        autoCreate: false,
      });

      // 3. ディレクトリは作成されていない
      expect(fs.existsSync(newDir)).toBe(false);
    });

    it("SDS-INT-15: autoCreateDirectory設定の永続化", () => {
      const store = getSlideSettingsStore();

      // 1. 設定を変更
      store.setAutoCreateDirectory(false);
      expect(store.getAutoCreateDirectory()).toBe(false);

      // 2. 再度有効化
      store.setAutoCreateDirectory(true);
      expect(store.getAutoCreateDirectory()).toBe(true);
    });
  });

  describe("リセット機能", () => {
    it("SDS-INT-16: reset()で全設定がデフォルトに戻る", async () => {
      const store = getSlideSettingsStore();

      // 1. 設定を変更
      const newDir = path.join(testDir, "modified");
      fs.mkdirSync(newDir);
      await setSlideDirectory({
        path: newDir,
        autoCreate: false,
      });
      store.setAutoCreateDirectory(false);
      store.setSchemaVersion(99);

      // 2. 変更を確認
      expect(store.getDirectory()).toBe(newDir);
      expect(store.getAutoCreateDirectory()).toBe(false);
      expect(store.getSchemaVersion()).toBe(99);

      // 3. リセット
      store.reset();

      // 4. デフォルト値に戻っていることを確認
      expect(store.getDirectory()).toBe(DEFAULT_SLIDE_SETTINGS.outputDirectory);
      expect(store.getAutoCreateDirectory()).toBe(
        DEFAULT_SLIDE_SETTINGS.autoCreateDirectory,
      );
      expect(store.getSchemaVersion()).toBe(
        DEFAULT_SLIDE_SETTINGS.schemaVersion,
      );
    });
  });
});
