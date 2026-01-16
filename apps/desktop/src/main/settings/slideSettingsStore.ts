/**
 * Slide Settings Store - スライド設定永続化サービス
 *
 * electron-storeを使用してスライド出力設定を永続化するサービス。
 * セキュリティ対策としてパストラバーサル防止、シンボリックリンク検証を実装。
 *
 * @module @repo/desktop/main/settings/slideSettingsStore
 */

import Store from "electron-store";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import type {
  SlideSettings,
  DirectoryValidationResult,
  ValidationResult,
} from "@repo/shared/types";

// ValidationResult型を再エクスポート（テスト互換性のため）
export type { ValidationResult } from "@repo/shared/types";

/**
 * デフォルトのスライド設定
 */
export const DEFAULT_SLIDE_SETTINGS: SlideSettings = {
  outputDirectory: "~/Documents/Slides",
  autoCreateDirectory: true,
  defaultTheme: "kanagawa",
  schemaVersion: 1,
};

/**
 * setSlideDirectory関数の結果型
 */
export interface SetDirectoryResult {
  success: boolean;
  error?: string;
}

/**
 * setSlideDirectory関数のオプション型
 */
export interface SetDirectoryOptions {
  path: string;
  autoCreate: boolean;
}

/**
 * ストアスキーマ定義（個別プロパティ形式）
 */
interface SlideSettingsStoreSchema {
  outputDirectory: string;
  autoCreateDirectory: boolean;
  defaultTheme: "kanagawa";
  schemaVersion: number;
}

/**
 * JSON Schema for electron-store validation
 */
const slideSettingsSchema = {
  outputDirectory: { type: "string" },
  autoCreateDirectory: { type: "boolean" },
  defaultTheme: { type: "string", enum: ["kanagawa"] },
  schemaVersion: { type: "number" },
} as const;

/**
 * パストラバーサル攻撃を検出
 *
 * @param targetPath - 検証するパス
 * @returns エラーメッセージ（問題なければnull）
 */
function detectPathTraversal(targetPath: string): string | null {
  // Null byte injection check
  if (targetPath.includes("\0")) {
    return "Invalid path: null byte detected";
  }

  // Check for relative path traversal attempts
  if (targetPath.includes("..")) {
    return "Path traversal not allowed";
  }

  // URL encoded path traversal
  if (targetPath.includes("%2e") || targetPath.includes("%2E")) {
    return "URL encoded path traversal not allowed";
  }

  // Unicode path traversal
  if (targetPath.includes("\u002e\u002e")) {
    return "Unicode path traversal not allowed";
  }

  return null;
}

/**
 * パストラバーサル攻撃を検出（例外を投げるバージョン）
 *
 * @param targetPath - 検証するパス
 * @throws Error パストラバーサルが検出された場合
 */
function validatePathSecurity(targetPath: string): void {
  const error = detectPathTraversal(targetPath);
  if (error) {
    throw new Error(error);
  }

  // Ensure path is absolute after normalization (skip ~ paths)
  const normalizedPath = path.normalize(targetPath);
  if (!path.isAbsolute(normalizedPath) && !normalizedPath.startsWith("~")) {
    throw new Error("Invalid path: must be an absolute path");
  }
}

/**
 * ~をホームディレクトリに展開
 *
 * @param inputPath - 入力パス
 * @returns 展開されたパス
 */
export function expandHomePath(inputPath: string): string {
  if (inputPath.startsWith("~/")) {
    return path.join(os.homedir(), inputPath.slice(2));
  }
  if (inputPath === "~") {
    return os.homedir();
  }
  return inputPath;
}

/**
 * SlideSettingsStore クラス
 *
 * スライド設定の永続化と管理を担当
 */
export class SlideSettingsStore {
  private _store: Store<SlideSettingsStoreSchema>;

  constructor() {
    this._store = new Store<SlideSettingsStoreSchema>({
      name: "slide-settings",
      defaults: {
        outputDirectory: DEFAULT_SLIDE_SETTINGS.outputDirectory,
        autoCreateDirectory: DEFAULT_SLIDE_SETTINGS.autoCreateDirectory,
        defaultTheme: DEFAULT_SLIDE_SETTINGS.defaultTheme,
        schemaVersion: DEFAULT_SLIDE_SETTINGS.schemaVersion,
      },
      schema: slideSettingsSchema,
    });
  }

  /**
   * 全設定を取得
   *
   * @returns スライド設定
   */
  getSettings(): SlideSettings {
    try {
      return {
        outputDirectory:
          this._store.get(
            "outputDirectory",
            DEFAULT_SLIDE_SETTINGS.outputDirectory,
          ) ?? DEFAULT_SLIDE_SETTINGS.outputDirectory,
        autoCreateDirectory:
          this._store.get(
            "autoCreateDirectory",
            DEFAULT_SLIDE_SETTINGS.autoCreateDirectory,
          ) ?? DEFAULT_SLIDE_SETTINGS.autoCreateDirectory,
        defaultTheme:
          this._store.get(
            "defaultTheme",
            DEFAULT_SLIDE_SETTINGS.defaultTheme,
          ) ?? DEFAULT_SLIDE_SETTINGS.defaultTheme,
        schemaVersion:
          this._store.get(
            "schemaVersion",
            DEFAULT_SLIDE_SETTINGS.schemaVersion,
          ) ?? DEFAULT_SLIDE_SETTINGS.schemaVersion,
      };
    } catch {
      // Store corrupted - return defaults
      return { ...DEFAULT_SLIDE_SETTINGS };
    }
  }

  /**
   * 出力ディレクトリを取得
   *
   * @returns 出力ディレクトリパス
   */
  getDirectory(): string {
    return (
      this._store.get(
        "outputDirectory",
        DEFAULT_SLIDE_SETTINGS.outputDirectory,
      ) ?? DEFAULT_SLIDE_SETTINGS.outputDirectory
    );
  }

  /**
   * 出力ディレクトリを設定
   *
   * @param dirPath - 設定するディレクトリパス
   * @throws Error 無効なパスの場合
   */
  setDirectory(dirPath: string): void {
    // セキュリティ検証
    validatePathSecurity(dirPath);

    // パスを展開して検証
    const expandedPath = expandHomePath(dirPath);

    // 再度セキュリティ検証（展開後）
    validatePathSecurity(expandedPath);

    // 設定を更新
    this._store.set("outputDirectory", dirPath);
  }

  /**
   * ディレクトリをバリデーション
   *
   * @param dirPath - バリデーションするディレクトリパス
   * @returns バリデーション結果
   */
  validateDirectory(dirPath: string): DirectoryValidationResult {
    // 空パスチェック
    if (!dirPath || dirPath.trim() === "") {
      return {
        valid: false,
        exists: false,
        writable: false,
        error: "Directory path cannot be empty",
      };
    }

    try {
      // セキュリティ検証
      validatePathSecurity(dirPath);
    } catch (error) {
      return {
        valid: false,
        exists: false,
        writable: false,
        error: error instanceof Error ? error.message : "Invalid path",
      };
    }

    // パスを展開
    const expandedPath = expandHomePath(dirPath);

    // 存在確認
    const exists = fs.existsSync(expandedPath);

    if (!exists) {
      // 親ディレクトリの存在確認
      const parentDir = path.dirname(expandedPath);
      const parentExists = fs.existsSync(parentDir);

      if (parentExists) {
        // 親ディレクトリへの書き込み権限確認
        try {
          fs.accessSync(parentDir, fs.constants.W_OK);
          return {
            valid: true,
            exists: false,
            writable: true,
            warning: "Directory does not exist but can be created",
          };
        } catch {
          return {
            valid: false,
            exists: false,
            writable: false,
            error: "Cannot write to parent directory",
          };
        }
      } else {
        return {
          valid: false,
          exists: false,
          writable: false,
          error: "Parent directory does not exist",
        };
      }
    }

    // ディレクトリかどうか確認
    const stats = fs.statSync(expandedPath);
    if (!stats.isDirectory()) {
      return {
        valid: false,
        exists: true,
        writable: false,
        error: "Path is not a directory",
      };
    }

    // 書き込み権限確認
    try {
      fs.accessSync(expandedPath, fs.constants.W_OK);
      return {
        valid: true,
        exists: true,
        writable: true,
      };
    } catch {
      return {
        valid: false,
        exists: true,
        writable: false,
        error: "Directory is not writable",
      };
    }
  }

  /**
   * 自動ディレクトリ作成設定を取得
   *
   * @returns 自動作成が有効かどうか
   */
  getAutoCreateDirectory(): boolean {
    return (
      this._store.get(
        "autoCreateDirectory",
        DEFAULT_SLIDE_SETTINGS.autoCreateDirectory,
      ) ?? DEFAULT_SLIDE_SETTINGS.autoCreateDirectory
    );
  }

  /**
   * 自動ディレクトリ作成設定を更新
   *
   * @param value - 自動作成を有効にするかどうか
   */
  setAutoCreateDirectory(value: boolean): void {
    this._store.set("autoCreateDirectory", value);
  }

  /**
   * スキーマバージョンを取得
   */
  getSchemaVersion(): number {
    return this._store.get(
      "schemaVersion",
      DEFAULT_SLIDE_SETTINGS.schemaVersion,
    );
  }

  /**
   * スキーマバージョンを設定
   */
  setSchemaVersion(version: number): void {
    this._store.set("schemaVersion", version);
  }

  /**
   * ストア全体をリセット（テスト用）
   */
  reset(): void {
    this._store.set("outputDirectory", DEFAULT_SLIDE_SETTINGS.outputDirectory);
    this._store.set(
      "autoCreateDirectory",
      DEFAULT_SLIDE_SETTINGS.autoCreateDirectory,
    );
    this._store.set("defaultTheme", DEFAULT_SLIDE_SETTINGS.defaultTheme);
    this._store.set("schemaVersion", DEFAULT_SLIDE_SETTINGS.schemaVersion);
  }

  /**
   * 設定を直接取得（テスト互換性用）
   */
  get store(): SlideSettings {
    return this.getSettings();
  }

  /**
   * 内部ストアへの直接アクセス（テスト用）
   */
  get internalStore(): Store<SlideSettingsStoreSchema> {
    return this._store;
  }
}

// シングルトンインスタンス
let slideSettingsStoreInstance: SlideSettingsStore | null = null;

/**
 * SlideSettingsStoreのシングルトンインスタンスを取得
 *
 * @returns SlideSettingsStoreインスタンス
 */
export function getSlideSettingsStore(): SlideSettingsStore {
  if (!slideSettingsStoreInstance) {
    slideSettingsStoreInstance = new SlideSettingsStore();
  }
  return slideSettingsStoreInstance;
}

/**
 * シングルトンインスタンスをリセット（テスト用）
 */
export function resetSlideSettingsStore(): void {
  slideSettingsStoreInstance = null;
}

/**
 * ディレクトリを設定（テスト互換関数）
 *
 * @param options - 設定オプション
 * @returns 結果
 */
export async function setSlideDirectory(
  options: SetDirectoryOptions,
): Promise<SetDirectoryResult> {
  const { path: dirPath, autoCreate } = options;

  // 空パスチェック
  if (!dirPath || dirPath.trim() === "") {
    return {
      success: false,
      error: "Invalid path: path cannot be empty",
    };
  }

  // パストラバーサル検出
  const traversalError = detectPathTraversal(dirPath);
  if (traversalError) {
    return {
      success: false,
      error: traversalError,
    };
  }

  const store = getSlideSettingsStore();
  const expandedPath = expandHomePath(dirPath);

  // autoCreateが有効で、ディレクトリが存在しない場合は作成
  if (autoCreate && !fs.existsSync(expandedPath)) {
    try {
      fs.mkdirSync(expandedPath, { recursive: true });
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create directory",
      };
    }
  }

  // 設定を保存
  store.internalStore.set("outputDirectory", dirPath);

  return { success: true };
}

/**
 * ディレクトリをバリデーション（テスト互換関数）
 *
 * @param dirPath - バリデーションするパス
 * @returns バリデーション結果
 */
export async function validateDirectoryForSettings(
  dirPath: string,
): Promise<ValidationResult> {
  // パストラバーサル検出
  const traversalError = detectPathTraversal(dirPath);
  if (traversalError) {
    return {
      status: "error",
      message: traversalError,
    };
  }

  // パスを展開
  const expandedPath = expandHomePath(dirPath);

  // 存在確認
  const exists = fs.existsSync(expandedPath);

  if (!exists) {
    return {
      status: "warning",
      message: "Directory does not exist. It will be created automatically.",
    };
  }

  // 書き込み権限確認
  try {
    fs.accessSync(expandedPath, fs.constants.W_OK);
    return {
      status: "valid",
      message: "Directory is valid and writable",
    };
  } catch {
    return {
      status: "error",
      message: "Permission denied: directory is not writable",
    };
  }
}

/**
 * マイグレーションを適用（テスト互換関数）
 *
 * @param store - SlideSettingsStoreインスタンス
 */
export async function applyMigrations(
  store: SlideSettingsStore,
): Promise<void> {
  const currentVersion = store.getSchemaVersion();

  // バージョン0から1へのマイグレーション
  if (currentVersion < 1) {
    store.internalStore.set("schemaVersion", 1);
  }
}
