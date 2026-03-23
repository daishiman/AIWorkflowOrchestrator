/**
 * Permission Store Types - 権限設定永続化の型定義
 *
 * TASK-3-1-E: rememberChoice機能永続化
 * UT-06-002: AllowedToolEntryV2 PermissionStore 適用
 *
 * @module permission-store
 */

/**
 * 許可済みツールのエントリ
 */
export interface AllowedToolEntry {
  /** ツール名 */
  toolName: string;

  /** 許可日時（ISO8601形式） */
  allowedAt: string;
}

/**
 * Permission Store のスキーマ（electron-store用）
 */
export interface PermissionStoreSchema {
  /** スキーマバージョン */
  version: number;

  /** 許可済みツールの配列 */
  allowedTools: AllowedToolEntry[];

  /** 最終更新日時（ISO8601形式） */
  updatedAt: string;
}

/**
 * 権限設定永続化ストアのインターフェース
 *
 * ユーザーが「次回から確認しない」を選択したツールの許可設定を
 * 永続化・取得・削除するためのAPI。
 */
export interface IPermissionStore {
  /**
   * ツールが許可済みかどうかを確認
   *
   * @param toolName - ツール名（例: "Read", "Write", "Bash"）
   * @returns 許可済みの場合 true
   *
   * @example
   * ```typescript
   * if (permissionStore.isToolAllowed("Read")) {
   *   // 自動許可
   * }
   * ```
   */
  isToolAllowed(toolName: string): boolean;

  /**
   * ツールを許可リストに追加
   *
   * @param toolName - ツール名
   *
   * @example
   * ```typescript
   * if (response.rememberChoice && response.approved) {
   *   permissionStore.allowTool(response.toolName);
   * }
   * ```
   */
  allowTool(toolName: string): void;

  /**
   * ツールの許可を取り消し
   *
   * @param toolName - ツール名
   *
   * @example
   * ```typescript
   * // 設定画面から削除
   * permissionStore.revokeTool("Bash");
   * ```
   */
  revokeTool(toolName: string): void;

  /**
   * 許可済みツール名の一覧を取得
   *
   * @returns 許可済みツール名の配列
   *
   * @example
   * ```typescript
   * const tools = permissionStore.getAllowedTools();
   * // => ["Read", "Glob", "Grep"]
   * ```
   */
  getAllowedTools(): string[];

  /**
   * 許可済みツールの詳細情報を取得
   *
   * @returns 許可済みツールの詳細情報の配列
   *
   * @example
   * ```typescript
   * const entries = permissionStore.getAllowedToolEntries();
   * // => [{ toolName: "Read", allowedAt: "2026-01-25T12:00:00.000Z" }]
   * ```
   */
  getAllowedToolEntries(): AllowedToolEntry[];

  /**
   * 全ての許可設定をクリア
   *
   * @example
   * ```typescript
   * // 設定画面から全クリア
   * permissionStore.clearAll();
   * ```
   */
  clearAll(): void;

  /**
   * セッション内の一時許可エントリを一括取り消し
   *
   * UT-06-005: abort フロー Step 2 で使用。
   *
   * @param sessionId - セッションID
   * @returns 取り消されたエントリ数
   */
  revokeSessionEntries?(sessionId: string): number;
}

// ============================================================
// V2 型定義 (UT-06-002)
// ============================================================

/** 失効ポリシー種別 */
export type ExpiryPolicy = "session" | "time_24h" | "time_7d" | "permanent";

/**
 * V2: 失効情報・スキル名を持つ拡張エントリ
 *
 * 後方互換性: V1 の AllowedToolEntry（expiresAt/skillName/expiryPolicy 未定義）は
 * 「無期限有効・全スキル対象・permanent」として動作する
 */
export interface AllowedToolEntryV2 extends AllowedToolEntry {
  /** 失効タイムスタンプ（Unix ms）。undefined = 無期限 */
  expiresAt?: number;
  /** 適用対象スキル名。undefined = 全スキルに適用 */
  skillName?: string;
  /** 失効ポリシー種別 */
  expiryPolicy?: ExpiryPolicy;
}

/**
 * 失効ポリシーに基づき expiresAt を計算する
 *
 * | ポリシー   | expiresAt              | 備考             |
 * | ---------- | ---------------------- | ---------------- |
 * | session    | undefined              | セッション終了時 |
 * | time_24h   | allowedAt + 86400000   | 24時間後         |
 * | time_7d    | allowedAt + 604800000  | 7日後            |
 * | permanent  | undefined              | 明示取り消しまで |
 */
export function calcExpiresAt(
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

export const PERMISSION_HISTORY_MAX_ENTRIES = 1000;

/**
 * V2 PermissionStore インターフェース
 */
export interface IPermissionStoreV2 extends IPermissionStore {
  isToolAllowed(toolName: string, skillName?: string): boolean;
  allowToolV2(entry: AllowedToolEntryV2): void;
  revokeSessionEntries(sessionId: string): number;
  getAllowedToolEntriesV2(): AllowedToolEntryV2[];
}

/**
 * V2 electron-store スキーマ
 */
export interface PermissionStoreSchemaV2 {
  version: 2;
  allowedTools: AllowedToolEntryV2[];
  updatedAt: string;
}

/**
 * permission:clear-session レスポンス型
 */
export interface ClearSessionResponse {
  success: boolean;
  removedCount?: number;
  error?: { code: string; message: string };
}
