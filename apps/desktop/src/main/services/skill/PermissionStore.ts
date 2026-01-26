/**
 * PermissionStore - 権限設定永続化ストア
 *
 * TASK-3-1-E: rememberChoice機能永続化
 *
 * ユーザーが「次回から確認しない」を選択したツールの許可設定を
 * electron-storeで永続化する。インメモリキャッシュにより高速アクセスを提供。
 */

import ElectronStore from "electron-store";
import type {
  AllowedToolEntry,
  IPermissionStore,
  PermissionStoreSchema,
} from "@repo/shared";

/**
 * スキーマのデフォルト値
 */
const DEFAULT_SCHEMA: PermissionStoreSchema = {
  version: 1,
  allowedTools: [],
  updatedAt: new Date().toISOString(),
};

/**
 * PermissionStore - 権限設定永続化ストア
 *
 * ユーザーが「次回から確認しない」を選択したツールの許可設定を
 * electron-storeで永続化する。
 *
 * @example
 * ```typescript
 * const store = new PermissionStore();
 *
 * // ツールの許可チェック
 * if (store.isToolAllowed("Read")) {
 *   // 自動許可
 * }
 *
 * // ツールを許可
 * store.allowTool("Read");
 *
 * // 許可を取り消し
 * store.revokeTool("Read");
 * ```
 */
export class PermissionStore implements IPermissionStore {
  /** electron-store インスタンス */
  private store: ElectronStore<PermissionStoreSchema>;

  /** ツール許可のインメモリキャッシュ（高速アクセス用） */
  private toolCache: Map<string, AllowedToolEntry>;

  /**
   * コンストラクタ
   */
  constructor() {
    this.store = new ElectronStore<PermissionStoreSchema>({
      name: "permission-store",
      defaults: DEFAULT_SCHEMA,
    });

    this.toolCache = new Map();
    this.initializeCache();
  }

  /**
   * ツールが許可済みかどうかを確認（O(1)）
   *
   * @param toolName - ツール名
   * @returns 許可済みの場合 true
   */
  isToolAllowed(toolName: string): boolean {
    if (!toolName || toolName.trim() === "") {
      return false;
    }
    return this.toolCache.has(toolName);
  }

  /**
   * ツールを許可リストに追加
   *
   * 既に許可済みの場合は日時を更新する。
   *
   * @param toolName - ツール名
   */
  allowTool(toolName: string): void {
    const entry: AllowedToolEntry = {
      toolName,
      allowedAt: new Date().toISOString(),
    };

    this.toolCache.set(toolName, entry);
    this.updateStore();

    console.info(`[PermissionStore] Tool permission added: ${toolName}`);
  }

  /**
   * ツールの許可を取り消し
   *
   * 許可リストに存在しない場合は何もしない。
   *
   * @param toolName - ツール名
   */
  revokeTool(toolName: string): void {
    if (!this.toolCache.has(toolName)) {
      return;
    }

    this.toolCache.delete(toolName);
    this.updateStore();

    console.info(`[PermissionStore] Tool permission revoked: ${toolName}`);
  }

  /**
   * 許可済みツール名の一覧を取得
   *
   * @returns 許可済みツール名の配列
   */
  getAllowedTools(): string[] {
    return Array.from(this.toolCache.keys());
  }

  /**
   * 許可済みツールの詳細情報を取得
   *
   * @returns 許可済みツールの詳細情報の配列
   */
  getAllowedToolEntries(): AllowedToolEntry[] {
    return Array.from(this.toolCache.values());
  }

  /**
   * 全ての許可設定をクリア
   */
  clearAll(): void {
    const count = this.toolCache.size;
    this.toolCache.clear();
    this.updateStore();

    console.warn(`[PermissionStore] All permissions cleared (${count} tools)`);
  }

  /**
   * キャッシュを初期化（起動時に呼び出し）
   */
  private initializeCache(): void {
    try {
      const data = this.store.store;

      // スキーマバリデーション
      if (!this.validateSchema(data)) {
        console.warn("[PermissionStore] Invalid schema, resetting to defaults");
        this.store.clear();
        this.store.set(DEFAULT_SCHEMA);
        return;
      }

      // キャッシュを構築
      for (const entry of data.allowedTools) {
        this.toolCache.set(entry.toolName, entry);
      }

      console.info(
        `[PermissionStore] Loaded ${this.toolCache.size} allowed tools`,
      );
    } catch (error) {
      console.warn(
        "[PermissionStore] Failed to load store, using defaults:",
        error,
      );
    }
  }

  /**
   * キャッシュからストアを更新
   */
  private updateStore(): void {
    try {
      const schema: PermissionStoreSchema = {
        version: 1,
        allowedTools: Array.from(this.toolCache.values()),
        updatedAt: new Date().toISOString(),
      };

      this.store.set(schema);
    } catch (error) {
      console.error("[PermissionStore] Failed to save store:", error);
    }
  }

  /**
   * スキーマをバリデーション
   *
   * @param data - バリデーション対象のデータ
   * @returns 有効なスキーマの場合 true
   */
  private validateSchema(data: unknown): data is PermissionStoreSchema {
    if (typeof data !== "object" || data === null) {
      return false;
    }

    const schema = data as PermissionStoreSchema;

    if (typeof schema.version !== "number") {
      return false;
    }

    if (!Array.isArray(schema.allowedTools)) {
      return false;
    }

    for (const entry of schema.allowedTools) {
      if (
        typeof entry.toolName !== "string" ||
        typeof entry.allowedAt !== "string"
      ) {
        return false;
      }
    }

    if (typeof schema.updatedAt !== "string") {
      return false;
    }

    return true;
  }
}

/**
 * PermissionStore インスタンスを作成するファクトリ関数
 *
 * 将来的な拡張（ユーザー別設定等）を考慮した設計。
 *
 * @returns IPermissionStore インスタンス
 */
export function createPermissionStore(): IPermissionStore {
  return new PermissionStore();
}
