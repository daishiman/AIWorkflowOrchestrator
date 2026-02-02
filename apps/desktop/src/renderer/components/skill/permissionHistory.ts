/**
 * @file Permission履歴データモデル・ユーティリティ
 * @description 権限要求履歴の型定義と安全化ユーティリティ
 * @feature task-imp-permission-history-001
 */

// ==========================================================================
// 型定義
// ==========================================================================

/** 権限判断結果 */
export type PermissionDecision = "approved" | "denied" | "approved_once";

/** 権限履歴エントリ */
export interface PermissionHistoryEntry {
  /** 一意識別子（crypto.randomUUID()） */
  id: string;
  /** 記録時刻（ISO8601形式） */
  timestamp: string;
  /** ツール名（Bash, Read, Write等） */
  toolName: string;
  /** 安全化済み引数要約（200文字制限） */
  argsSnapshot: string;
  /** 判断結果 */
  decision: PermissionDecision;
  /** セッションID（任意） */
  sessionId?: string;
}

/** 期間プリセット */
export type DatePreset = "all" | "today" | "week" | "month" | "custom";

/** 期間フィルタ条件 */
export interface DateRangeFilter {
  /** プリセット選択値 */
  preset: DatePreset;
  /** カスタム範囲の開始日（YYYY-MM-DD形式） */
  start?: string;
  /** カスタム範囲の終了日（YYYY-MM-DD形式） */
  end?: string;
}

/** フィルタ条件 */
export interface PermissionHistoryFilter {
  /** ツール名フィルタ（undefinedで全件） */
  toolName?: string;
  /** 判断結果フィルタ（undefinedで全件） */
  decision?: PermissionDecision;
  /** 期間フィルタ（undefinedで全件） */
  dateRange?: DateRangeFilter;
}

// ==========================================================================
// 定数
// ==========================================================================

/** 履歴エントリの最大保持件数 */
export const PERMISSION_HISTORY_MAX_ENTRIES = 1000;

/** 引数スナップショットの最大文字数 */
export const ARGS_SNAPSHOT_MAX_LENGTH = 200;

// ==========================================================================
// ユーティリティ関数
// ==========================================================================

/**
 * 引数オブジェクトを安全な要約テキストに変換する
 *
 * - JSON.stringifyで文字列化
 * - HTMLタグを除去（XSS防止）
 * - 制御文字を除去
 * - 200文字に切り詰め
 */
export function safeArgsSnapshot(args: Record<string, unknown>): string {
  let text: string;
  try {
    text = JSON.stringify(args);
  } catch {
    text = "{}";
  }

  // HTMLタグを除去
  text = text.replace(/<[^>]*>/g, "");

  // 制御文字を除去（タブ・改行は保持しない）
  // eslint-disable-next-line no-control-regex
  text = text.replace(/[\x00-\x1f\x7f]/g, "");

  // 200文字に切り詰め
  if (text.length > ARGS_SNAPSHOT_MAX_LENGTH) {
    text = text.slice(0, ARGS_SNAPSHOT_MAX_LENGTH) + "...";
  }

  return text;
}

/**
 * 権限履歴エントリを作成する
 */
export function createHistoryEntry(params: {
  toolName: string;
  args: Record<string, unknown>;
  decision: PermissionDecision;
  sessionId?: string;
}): PermissionHistoryEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    toolName: params.toolName,
    argsSnapshot: safeArgsSnapshot(params.args),
    decision: params.decision,
    sessionId: params.sessionId,
  };
}
