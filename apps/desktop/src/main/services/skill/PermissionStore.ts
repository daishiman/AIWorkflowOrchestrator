/**
 * PermissionStore - 権限設定永続化ストア
 *
 * TASK-3-1-E: rememberChoice機能永続化
 * UT-06-002: AllowedToolEntryV2 PermissionStore 適用
 *
 * ユーザーが「次回から確認しない」を選択したツールの許可設定を
 * electron-storeで永続化する。インメモリキャッシュにより高速アクセスを提供。
 *
 * V2: 失効ポリシー（session/time_24h/time_7d/permanent）によるスコープ管理、
 * スキル名照合、期限切れ自動削除をサポート。
 */

import ElectronStore from "electron-store";
import log from "electron-log";
import type {
  AllowedToolEntry,
  AllowedToolEntryV2,
  IPermissionStoreV2,
  PermissionStoreSchema,
  PermissionStoreSchemaV2,
  ExpiryPolicy,
} from "@repo/shared";

/**
 * 失効ポリシーに基づき expiresAt を計算する（ローカル実装）
 *
 * @repo/shared の calcExpiresAt と同一ロジック。
 * ESM/CJS モジュール解決の問題を回避するためローカルに配置。
 */
function calcExpiresAtLocal(
  policy: ExpiryPolicy,
  allowedAt: number,
): number | undefined {
  switch (policy) {
    case "session":
      return undefined;
    case "time_24h":
      return allowedAt + 86_400_000;
    case "time_7d":
      return allowedAt + 604_800_000;
    case "permanent":
      return undefined;
  }
}

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
export class PermissionStore implements IPermissionStoreV2 {
  /** electron-store インスタンス */
  private store: ElectronStore<PermissionStoreSchema>;

  /** ツール許可のインメモリキャッシュ（高速アクセス用） */
  private toolCache: Map<string, AllowedToolEntryV2>;

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
   * ツールが許可済みかどうかを確認（6分岐フロー）
   *
   * (1) エントリなし → false
   * (2) expiresAt undefined → skillName チェックへ
   * (3) expiresAt < now → 削除 & false
   * (4) expiresAt >= now → skillName チェックへ
   * (5) skillName 不一致 → false
   * (6) 全条件クリア → true
   *
   * @param toolName - ツール名
   * @param skillName - 呼び出し元スキル名（省略時は全スキルに対する許可を確認）
   * @returns 許可済みの場合 true
   */
  isToolAllowed(toolName: string, skillName?: string): boolean {
    if (!toolName || toolName.trim() === "") {
      return false;
    }

    // (1) エントリ取得
    const entry = this.toolCache.get(toolName);
    if (!entry) {
      return false;
    }

    // (2)(3)(4) 期限チェック
    if (entry.expiresAt !== undefined) {
      if (entry.expiresAt < Date.now()) {
        // (3) 期限切れ → 削除
        this.toolCache.delete(toolName);
        this.updateStore();
        return false;
      }
      // (4) 期限内 → skillName チェックへ
    }
    // (2) expiresAt undefined → skillName チェックへ

    // (5) skillName チェック
    if (
      entry.skillName !== undefined &&
      skillName !== undefined &&
      entry.skillName !== skillName
    ) {
      return false;
    }

    // (6) 全条件クリア
    return true;
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

    log.info(`[PermissionStore] Tool permission added: ${toolName}`);
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

    log.info(`[PermissionStore] Tool permission revoked: ${toolName}`);
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
   * AllowedToolEntryV2 を受け入れてツールを許可
   *
   * expiryPolicy に基づき expiresAt を自動計算。
   * session/permanent は expiresAt を強制 undefined にリセット（整合性保証）。
   */
  allowToolV2(entry: AllowedToolEntryV2): void {
    const policy = entry.expiryPolicy ?? "permanent";

    const allowedAtMs =
      typeof entry.allowedAt === "string"
        ? new Date(entry.allowedAt).getTime()
        : entry.allowedAt;

    // session/permanent は expiresAt を強制 undefined にリセット
    const expiresAt =
      policy === "session" || policy === "permanent"
        ? undefined
        : (entry.expiresAt ?? calcExpiresAtLocal(policy, allowedAtMs));

    const v2Entry: AllowedToolEntryV2 = {
      ...entry,
      expiresAt,
      expiryPolicy: policy,
    };

    this.toolCache.set(entry.toolName, v2Entry);
    this.updateStore();

    log.info(
      `[PermissionStore] Tool permission added (V2): ${entry.toolName} [${policy}]`,
    );
  }

  /**
   * 現在有効な許可エントリを全て返す（期限切れは自動削除）
   */
  getAllowedToolEntriesV2(): AllowedToolEntryV2[] {
    const now = Date.now();
    let hasExpired = false;

    for (const [key, entry] of this.toolCache.entries()) {
      if (entry.expiresAt !== undefined && entry.expiresAt < now) {
        this.toolCache.delete(key);
        hasExpired = true;
      }
    }

    if (hasExpired) {
      this.updateStore();
    }

    return Array.from(this.toolCache.values());
  }

  /**
   * 全ての許可設定をクリア
   */
  clearAll(): void {
    const count = this.toolCache.size;
    this.toolCache.clear();
    this.updateStore();

    log.warn(`[PermissionStore] All permissions cleared (${count} tools)`);
  }

  /**
   * セッションスコープのエントリのみ削除
   *
   * expiryPolicy === "session" のエントリを全て削除する。
   * permanent / time スコープのエントリは残存する。
   *
   * @param sessionId - セッションID
   * @returns 取り消されたエントリ数
   */
  revokeSessionEntries(sessionId: string): number {
    let removedCount = 0;

    for (const [key, entry] of this.toolCache.entries()) {
      if (entry.expiryPolicy === "session") {
        this.toolCache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.updateStore();
      log.info(
        `[PermissionStore] Session entries revoked: ${removedCount} (session: ${sessionId})`,
      );
    }

    return removedCount;
  }

  /**
   * キャッシュを初期化（起動時に呼び出し）
   *
   * V1 データは V2 にマイグレーション（永続・全スキル対象として変換）
   */
  private initializeCache(): void {
    try {
      const data = this.store.store;

      // スキーマバリデーション
      if (!this.validateSchema(data)) {
        log.warn("[PermissionStore] Invalid schema, resetting to defaults");
        this.store.clear();
        this.store.set(DEFAULT_SCHEMA);
        return;
      }

      // V1→V2 マイグレーション
      if (data.version === 1) {
        const migrated = this.migrateV1ToV2(data);
        for (const entry of migrated.allowedTools) {
          this.toolCache.set(entry.toolName, entry);
        }
        this.updateStore();
        log.info(
          `[PermissionStore] Migrated V1→V2: ${this.toolCache.size} tools`,
        );
        return;
      }

      // V2 データのキャッシュ構築
      for (const entry of data.allowedTools) {
        this.toolCache.set(entry.toolName, entry as AllowedToolEntryV2);
      }

      log.info(`[PermissionStore] Loaded ${this.toolCache.size} allowed tools`);
    } catch (error) {
      log.warn(
        "[PermissionStore] Failed to load store, using defaults:",
        error,
      );
    }
  }

  /**
   * V1→V2 マイグレーション
   *
   * V1 エントリは永続・全スキル対象として変換
   */
  private migrateV1ToV2(
    v1Data: PermissionStoreSchema,
  ): PermissionStoreSchemaV2 {
    return {
      version: 2,
      allowedTools: v1Data.allowedTools.map((entry) => ({
        ...entry,
        expiresAt: undefined,
        skillName: undefined,
        expiryPolicy: "permanent" as const,
      })),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * キャッシュからストアを更新（V2 スキーマ）
   */
  private updateStore(): void {
    try {
      const schema: PermissionStoreSchemaV2 = {
        version: 2,
        allowedTools: Array.from(this.toolCache.values()),
        updatedAt: new Date().toISOString(),
      };

      this.store.set(schema as unknown as PermissionStoreSchema);
    } catch (error) {
      log.error("[PermissionStore] Failed to save store:", error);
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
export function createPermissionStore(): IPermissionStoreV2 {
  return new PermissionStore();
}
