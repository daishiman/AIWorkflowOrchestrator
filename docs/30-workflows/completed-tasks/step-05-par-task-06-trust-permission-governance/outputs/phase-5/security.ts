// packages/shared/src/constants/security.ts への追加内容（正本）
// Task-06 Phase 5 成果物: ToolRiskLevel / ToolRiskConfig / TOOL_RISK_CONFIG 型定義

/**
 * ツール操作のリスクレベル分類。
 *
 * | レベル   | 典型ツール例                      | デフォルト動作           |
 * | -------- | --------------------------------- | ------------------------ |
 * | critical | 保護パスへの書き込み、ネットワーク | 自動拒否（承認不可）     |
 * | high     | 任意パスへのファイル書き込み      | ダイアログ表示（一時のみ）|
 * | medium   | ファイル読み取り、Bash 実行       | ダイアログ表示（恒久可）  |
 * | low      | テキスト変換、計算                | ダイアログ表示（恒久可）  |
 */
export type ToolRiskLevel = "critical" | "high" | "medium" | "low";

/**
 * リスクレベルごとの動作設定。
 * TOOL_RISK_CONFIG オブジェクトの各エントリ型として使用する。
 */
export interface ToolRiskConfig {
  level: ToolRiskLevel;
  /** 「今回のみ許可」ボタンをダイアログに表示するか */
  allowApproveOnce: boolean;
  /** 「常に許可（恒久許可）」ボタンをダイアログに表示するか */
  allowPermanent: boolean;
  /**
   * デフォルトで自動拒否するか。
   * true の場合、PermissionDialog を表示せずに decision: "denied" を返す。
   * ユーザー設定 SKILL_EXECUTOR_AUTO_DENY で上書き可能。
   */
  autoDenyDefault: boolean;
  /** ダイアログヘッダー背景色の CSS 変数トークン名（形式: "--status-xxx"） */
  headerColorToken: string;
  /** ダイアログ幅（px）: Critical=640, High=480, Medium/Low=400 */
  dialogWidth: 400 | 480 | 640;
}

/**
 * リスクレベル別の動作設定マップ。
 *
 * 不変条件（TC-T-001 で検証）:
 * - critical.allowPermanent === false（Critical ツールへの恒久許可を禁止）
 * - critical.allowApproveOnce === false（Critical ツールへの一時許可を禁止）
 * - critical.autoDenyDefault === true（Critical ツールはデフォルト自動拒否）
 *
 * 変更禁止: critical エントリの allowApproveOnce / allowPermanent / autoDenyDefault は
 * セキュリティ要件上変更禁止。変更が必要な場合は Phase 3 設計レビューを再実施すること。
 */
export const TOOL_RISK_CONFIG: Record<ToolRiskLevel, ToolRiskConfig> = {
  critical: {
    level: "critical",
    allowApproveOnce: false, // 不変条件: Critical ツールへの一時許可を禁止
    allowPermanent: false, // 不変条件: Critical ツールへの恒久許可を禁止
    autoDenyDefault: true, // 不変条件: Critical ツールは自動拒否
    headerColorToken: "--status-destructive",
    dialogWidth: 640,
  },
  high: {
    level: "high",
    allowApproveOnce: true, // 今回のみ許可ボタンを表示
    allowPermanent: false, // 恒久許可は禁止（High リスクは毎回確認）
    autoDenyDefault: false, // ダイアログを表示してユーザーに判断させる
    headerColorToken: "--status-warning",
    dialogWidth: 480,
  },
  medium: {
    level: "medium",
    allowApproveOnce: true, // 今回のみ許可ボタンを表示
    allowPermanent: true, // 恒久許可ボタンを表示（Medium 以下は許可）
    autoDenyDefault: false, // ダイアログを表示してユーザーに判断させる
    headerColorToken: "--status-caution",
    dialogWidth: 400,
  },
  low: {
    level: "low",
    allowApproveOnce: true, // 今回のみ許可ボタンを表示
    allowPermanent: true, // 恒久許可ボタンを表示（Low リスクは許可）
    autoDenyDefault: false, // ダイアログを表示してユーザーに判断させる
    headerColorToken: "--status-info",
    dialogWidth: 400,
  },
};
