/**
 * エージェント実行UI用の型定義
 * @module agent
 */

import type { Skill } from "./skill";

/**
 * エージェント実行ステータス
 */
export type AgentExecutionStatus =
  | "idle"
  | "executing"
  | "streaming"
  | "awaiting_permission"
  | "completed"
  | "cancelled"
  | "error";

/**
 * エージェントメッセージ
 */
export interface AgentMessage {
  /** メッセージID */
  id: string;
  /** メッセージロール */
  role: "user" | "assistant" | "system";
  /** メッセージ内容 */
  content: string;
  /** タイムスタンプ */
  timestamp: Date;
  /** ストリーミング中フラグ */
  isStreaming?: boolean;
  /** メッセージタイプ */
  type?: "text" | "tool_use" | "tool_result" | "error";
}

/**
 * 権限確認リクエスト
 */
export interface PermissionRequest {
  /** 実行ID */
  executionId: string;
  /** リクエストID */
  requestId: string;
  /** ツール名 */
  toolName: string;
  /** ツール引数 */
  args: Record<string, unknown>;
  /** 理由 */
  reason?: string;
}

/**
 * 権限確認レスポンス
 */
export interface PermissionResponse {
  /** リクエストID */
  requestId: string;
  /** 承認フラグ */
  approved: boolean;
  /** 選択を記憶するフラグ */
  rememberChoice?: boolean;
}

/**
 * エージェント実行状態
 */
export interface AgentExecutionState {
  /** 実行ステータス */
  status: AgentExecutionStatus;
  /** 現在実行中のスキル */
  currentSkill: Skill | null;
  /** メッセージ履歴 */
  messages: AgentMessage[];
  /** 現在のストリーミングコンテンツ */
  currentStreamingContent: string;
  /** エラーメッセージ */
  error: string | null;
  /** 実行開始時刻 */
  startedAt: Date | null;
  /** 実行完了時刻 */
  completedAt: Date | null;
  /** 保留中の権限確認リクエスト */
  pendingPermission: PermissionRequest | null;
  /** 記憶された権限選択 */
  rememberedChoices: Record<string, boolean>;
}

/**
 * エージェント開始リクエスト
 */
export interface AgentStartRequest {
  /** スキルID */
  skillId: string;
  /** プロンプト */
  prompt: string;
}

/**
 * エージェントストリームペイロード
 */
export interface AgentStreamPayload {
  /** 実行ID */
  executionId: string;
  /** チャンクデータ */
  chunk: string;
  /** 完了フラグ */
  isComplete: boolean;
}

/**
 * エージェントステータスペイロード
 */
export interface AgentStatusPayload {
  /** 実行ID */
  executionId: string;
  /** ステータス */
  status: AgentExecutionStatus;
  /** エラーメッセージ（エラー時のみ） */
  error?: string;
}
