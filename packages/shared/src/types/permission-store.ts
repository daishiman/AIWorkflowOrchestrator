/**
 * Permission Store Types - 権限設定永続化の型定義
 *
 * TASK-3-1-E: rememberChoice機能永続化
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
