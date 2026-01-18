/**
 * エージェント実行UI用の型定義
 * @module agent
 */

import type { Skill } from "./skill";

/**
 * 実行環境タイプ
 */
export type EnvironmentType =
  | "none" // プレビューなし
  | "html" // HTMLプレビュー
  | "markdown" // Markdownプレビュー
  | "terminal" // ターミナル（将来）
  | "code"; // コード実行（将来）

/**
 * プレビュー環境設定
 */
export interface PreviewEnvironmentConfig {
  /** 環境タイプ */
  type: EnvironmentType;
  /** 自動更新 */
  autoRefresh: boolean;
  /** 更新デバウンス（ms） */
  refreshDebounce: number;
  /** sandboxフラグ */
  sandboxFlags?: string[];
}

/**
 * プレビューコンテンツ
 */
export interface PreviewContent {
  /** コンテンツタイプ */
  type: EnvironmentType;
  /** コンテンツ本体 */
  content: string;
  /** タイムスタンプ */
  timestamp: Date;
}

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

// ============================================
// Environment Backend Types
// ============================================

/**
 * コンテンツタイプ
 */
export type ContentType = "html" | "markdown" | "css" | "javascript" | "text";

/**
 * 抽出されたコンテンツ
 */
export interface ExtractedContent {
  /** コンテンツID */
  id: string;
  /** コンテンツタイプ */
  type: ContentType;
  /** コンテンツ本体 */
  content: string;
  /** 言語（コードブロックの言語指定） */
  language?: string;
  /** 抽出順序 */
  order: number;
  /** 抽出日時 */
  extractedAt: Date;
}

/**
 * サニタイズされたコンテンツ
 */
export interface SanitizedContent {
  /** コンテンツID */
  id: string;
  /** コンテンツタイプ */
  type: ContentType;
  /** オリジナルコンテンツ */
  originalContent: string;
  /** サニタイズ済みコンテンツ */
  sanitizedContent: string;
  /** 除去された要素 */
  removedElements: string[];
  /** サニタイズ日時 */
  sanitizedAt: Date;
}

/**
 * 環境バックエンドプレビューコンテンツ (AGENT-007)
 */
export interface EnvironmentPreviewContent {
  /** 実行ID */
  executionId: string;
  /** サニタイズ済みコンテンツ配列 */
  contents: SanitizedContent[];
  /** 一時ファイルパス（存在する場合） */
  tempFilePath?: string;
  /** 作成日時 */
  createdAt: Date;
}

// ============================================
// Session Persistence Types
// ============================================

/**
 * 永続化されたセッション情報
 */
export interface PersistedSession {
  /** セッションID（UUID） */
  id: string;

  /** 作成日時（Unix timestamp in ms） */
  createdAt: number;

  /** 最終アクセス日時（Unix timestamp in ms） */
  lastAccessedAt: number;

  /** アクティブ状態（最後に使用していたセッション） */
  isActive: boolean;

  /** メッセージ数（サマリー表示用） */
  messageCount: number;

  /** セッションタイトル（最初のメッセージから自動生成） */
  title?: string;
}

/**
 * 永続化されたメッセージ情報
 */
export interface PersistedMessage {
  /** メッセージID（UUID） */
  id: string;

  /** 所属セッションID */
  sessionId: string;

  /** メッセージの送信者 */
  role: "user" | "assistant";

  /** メッセージ内容 */
  content: string;

  /** 送信日時（Unix timestamp in ms） */
  timestamp: number;
}

/**
 * ストレージメタデータ
 */
export interface StorageMetadata {
  /** スキーマバージョン */
  version: string;

  /** 最終更新日時（Unix timestamp in ms） */
  lastUpdated: number;

  /** 概算サイズ（bytes） */
  totalSize: number;
}

/**
 * electron-storeのストレージスキーマ
 */
export interface SessionStorageSchema {
  /** 永続化されたセッション一覧 */
  sessions: PersistedSession[];

  /** セッションIDをキーとするメッセージマップ */
  messages: Record<string, PersistedMessage[]>;

  /** ストレージメタデータ */
  metadata: StorageMetadata;
}

/**
 * セッション永続化の設定
 */
export interface SessionPersistenceConfig {
  /** 最大セッション数（デフォルト: 100） */
  maxSessions: number;

  /** 最大ストレージサイズ（bytes、デフォルト: 50MB） */
  maxStorageSize: number;

  /** 1セッションあたりの最大メッセージ数（デフォルト: 1000） */
  maxMessagesPerSession: number;

  /** 自動バックアップ有効フラグ（デフォルト: true） */
  enableAutoBackup: boolean;

  /** バックアップ保持数（デフォルト: 3） */
  backupRetentionCount: number;

  /** LRU警告閾値（デフォルト: 0.9 = 90%） */
  lruWarningThreshold: number;
}

/**
 * デフォルト永続化設定
 */
export const DEFAULT_PERSISTENCE_CONFIG: SessionPersistenceConfig = {
  maxSessions: 100,
  maxStorageSize: 50 * 1024 * 1024, // 50MB
  maxMessagesPerSession: 1000,
  enableAutoBackup: true,
  backupRetentionCount: 3,
  lruWarningThreshold: 0.9,
};

/**
 * ストレージ統計情報
 */
export interface StorageStats {
  /** 総セッション数 */
  totalSessions: number;

  /** 総メッセージ数 */
  totalMessages: number;

  /** 使用容量（bytes） */
  usedSize: number;

  /** 最大容量（bytes） */
  maxSize: number;

  /** 使用率（0-1） */
  usageRatio: number;

  /** 最終更新日時 */
  lastUpdated: number;
}

/**
 * LRU削除の結果
 */
export interface CleanupResult {
  /** 削除されたセッション数 */
  deletedSessions: number;

  /** 削除されたメッセージ数 */
  deletedMessages: number;

  /** 解放された容量（bytes） */
  freedSize: number;

  /** 削除されたセッションID一覧 */
  deletedSessionIds: string[];
}

/**
 * バックアップ情報
 */
export interface BackupInfo {
  /** バックアップファイル名 */
  filename: string;

  /** 作成日時 */
  createdAt: number;

  /** ファイルサイズ（bytes） */
  size: number;

  /** ファイルパス */
  path: string;
}

/**
 * 永続化エラーコード
 */
export type SessionPersistenceErrorCode =
  | "STORAGE_READ_ERROR"
  | "STORAGE_WRITE_ERROR"
  | "VALIDATION_ERROR"
  | "SESSION_NOT_FOUND"
  | "STORAGE_LIMIT_EXCEEDED"
  | "BACKUP_ERROR"
  | "MIGRATION_ERROR"
  | "INTERNAL_ERROR";

/**
 * セッション永続化エラー
 */
export class SessionPersistenceError extends Error {
  constructor(
    message: string,
    public readonly code: SessionPersistenceErrorCode,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "SessionPersistenceError";
  }
}

/**
 * セッションサマリー（一覧表示用）
 */
export interface SessionSummary {
  id: string;
  title: string;
  messageCount: number;
  lastAccessedAt: Date;
  isActive: boolean;
}

/**
 * IPCエラーレスポンス
 */
export interface IPCErrorResponse {
  success: false;
  error: {
    code: SessionPersistenceErrorCode;
    message: string;
    details?: unknown;
  };
}

/**
 * IPC成功レスポンス
 */
export interface IPCSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * IPCレスポンス型
 */
export type IPCResponse<T> = IPCSuccessResponse<T> | IPCErrorResponse;

/**
 * PersistedSession → SessionSummary 変換
 */
export function toSessionSummary(session: PersistedSession): SessionSummary {
  return {
    id: session.id,
    title: session.title || `Session ${session.id.slice(0, 8)}`,
    messageCount: session.messageCount,
    lastAccessedAt: new Date(session.lastAccessedAt),
    isActive: session.isActive,
  };
}
