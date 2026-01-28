/**
 * Skill Execution Types - スキル実行関連の型定義
 *
 * TASK-3-1-A: SDK query() 基本実装
 */

/**
 * 実行状態
 */
export type ExecutionState =
  | "pending"
  | "running"
  | "completed"
  | "aborted"
  | "error";

/**
 * スキル実行リクエスト
 */
export interface SkillExecutionRequest {
  /** ユーザーの入力プロンプト */
  prompt: string;
  /** 実行対象のスキルID */
  skillId?: string;
  /** 実行対象のスキル名（TASK-6-1互換性のため） */
  skillName?: string;
  /** タイムアウト（ミリ秒、オプション） */
  timeout?: number;
  /** セッションID（会話継続用、オプション） */
  sessionId?: string;
}

/**
 * スキル実行レスポンス
 */
export interface SkillExecutionResponse {
  /** 実行ID（UUID v4） */
  executionId: string;
  /** 成功/失敗 */
  success: boolean;
  /** エラー情報（失敗時） */
  error?: SkillExecutionError;
}

/**
 * 実行情報
 */
export interface ExecutionInfo {
  /** 実行ID */
  id: string;
  /** スキルID */
  skillId: string;
  /** 実行状態 */
  state: ExecutionState;
  /** 実行開始時刻（UNIXタイムスタンプ） */
  startedAt: number;
  /** 実行完了時刻（UNIXタイムスタンプ、オプション） */
  completedAt?: number;
}

/**
 * ストリームメッセージタイプ
 */
export type SkillStreamMessageType = "text" | "tool_use" | "error" | "complete";

/**
 * スキルストリームメッセージ
 */
export interface SkillStreamMessage {
  /** 実行ID */
  executionId: string;
  /** メッセージID */
  id: string;
  /** メッセージタイプ */
  type: SkillStreamMessageType;
  /** メッセージ内容 */
  content: string;
  /** タイムスタンプ（UNIXミリ秒） */
  timestamp: number;
  /** 完了フラグ */
  isComplete: boolean;
}

/**
 * スキル実行エラーコード
 */
export type SkillExecutionErrorCode =
  | "EXECUTION_FAILED"
  | "TIMEOUT"
  | "ABORTED"
  | "MAX_CONCURRENT_EXCEEDED"
  | "SKILL_NOT_FOUND"
  | "VALIDATION_FAILED"
  | "SDK_ERROR"
  | "NETWORK_ERROR"
  | "AUTHENTICATION_ERROR";

/**
 * スキル実行エラー
 */
export interface SkillExecutionError {
  /** エラーコード */
  code: SkillExecutionErrorCode;
  /** エラーメッセージ */
  message: string;
  /** 追加情報（オプション） */
  details?: unknown;
}

/**
 * 実行コンテキスト（内部用）
 */
export interface ExecutionContext {
  /** 実行ID */
  id: string;
  /** スキルID */
  skillId: string;
  /** 中断コントローラー */
  abortController: AbortController;
  /** 実行状態 */
  state: ExecutionState;
  /** 実行開始時刻 */
  startedAt: number;
  /** 実行完了時刻 */
  completedAt?: number;
}

/**
 * スキル実行設定定数
 */
export const SKILL_EXECUTION_DEFAULTS = {
  /** デフォルトタイムアウト（ミリ秒） */
  DEFAULT_TIMEOUT: 30000,
  /** 最大同時実行数 */
  MAX_CONCURRENT_EXECUTIONS: 5,
  /** 最大リトライ回数 */
  MAX_RETRIES: 3,
  /** 初回リトライ待機時間（ミリ秒） */
  INITIAL_RETRY_DELAY: 1000,
  /** 最大リトライ待機時間（ミリ秒） */
  MAX_RETRY_DELAY: 4000,
} as const;
