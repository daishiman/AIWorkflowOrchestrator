/**
 * Agent SDK Type Definitions
 * @module @repo/shared/agent/types
 */

/**
 * クエリオプション
 */
export interface QueryOptions {
  /**
   * タイムアウト時間（ミリ秒）
   * @minimum 1000
   * @maximum 300000
   * @default 30000
   */
  timeout?: number;

  /**
   * セッションID（UUID v4形式）
   * 指定すると既存セッションのコンテキストを使用
   */
  sessionId?: string;

  /**
   * システムプロンプト
   * @maxLength 5000
   */
  systemPrompt?: string;
}

/**
 * クエリリクエスト（IPC経由）
 */
export interface AgentQueryRequest {
  /**
   * ユーザープロンプト
   * @minLength 1
   * @maxLength 10000
   */
  prompt: string;

  /**
   * オプション設定
   */
  options?: QueryOptions;
}

/**
 * エージェントステータスタイプ
 */
export type AgentStatusType =
  | "not_initialized"
  | "initializing"
  | "initialized"
  | "error";

/**
 * エージェントステータス
 */
export interface AgentStatus {
  /**
   * 現在のステータス
   */
  status: AgentStatusType;

  /**
   * エラーメッセージ（status === 'error' 時のみ）
   */
  error?: string;

  /**
   * ステータス更新時刻（Unix timestamp）
   */
  timestamp: number;
}

/**
 * セッションコンテキスト
 */
export interface SessionContext {
  /**
   * 会話履歴のメッセージID配列
   */
  messageIds: string[];

  /**
   * カスタムメタデータ
   */
  metadata?: Record<string, unknown>;
}

/**
 * セッション情報
 */
export interface Session {
  /**
   * セッションID（UUID v4）
   */
  id: string;

  /**
   * 作成時刻（Unix timestamp）
   */
  createdAt: number;

  /**
   * 最終アクセス時刻（Unix timestamp）
   */
  lastAccessedAt: number;

  /**
   * セッションコンテキスト
   */
  context: SessionContext;
}

/**
 * セッション再開リクエスト
 */
export interface ResumeSessionRequest {
  sessionId: string;
}

/**
 * セッション破棄リクエスト
 */
export interface DestroySessionRequest {
  sessionId: string;
}

/**
 * セッション作成レスポンス
 */
export interface CreateSessionResponse {
  sessionId: string;
}

/**
 * メッセージタイプ
 */
export type SDKMessageType =
  | "text"
  | "tool_use"
  | "tool_result"
  | "error"
  | "complete";

/**
 * ツール使用情報
 */
export interface ToolUseInfo {
  /**
   * ツール名
   */
  toolName: string;

  /**
   * ツール入力パラメータ
   */
  input: Record<string, unknown>;
}

/**
 * ツール結果情報
 */
export interface ToolResultInfo {
  /**
   * 対応するツール使用ID
   */
  toolUseId: string;

  /**
   * 実行結果
   */
  output: string;

  /**
   * エラーフラグ
   */
  isError: boolean;
}

/**
 * SDKメッセージ
 */
export interface SDKMessage {
  /**
   * メッセージID（UUID v4）
   */
  id: string;

  /**
   * メッセージタイプ
   */
  type: SDKMessageType;

  /**
   * メッセージ内容
   */
  content: string;

  /**
   * 受信時刻（Unix timestamp）
   */
  timestamp: number;

  /**
   * 完了フラグ
   * trueの場合、これ以上のメッセージは配信されない
   */
  isComplete: boolean;

  /**
   * ツール使用情報（type === 'tool_use' 時のみ）
   */
  toolUse?: ToolUseInfo;

  /**
   * ツール結果情報（type === 'tool_result' 時のみ）
   */
  toolResult?: ToolResultInfo;
}

/**
 * Preload経由で公開されるAgent API
 */
export interface AgentAPI {
  /**
   * クエリを実行する
   */
  query(prompt: string, options?: QueryOptions): Promise<void>;

  /**
   * 実行中のクエリを中断する
   * @returns 中断処理完了時にresolveするPromise
   */
  abort(): Promise<void>;

  /**
   * エージェントのステータスを取得する
   */
  getStatus(): Promise<AgentStatus>;

  /**
   * 新しいセッションを作成する
   */
  createSession(): Promise<string>;

  /**
   * 既存のセッションを再開する
   */
  resumeSession(sessionId: string): Promise<void>;

  /**
   * セッションを破棄する
   */
  destroySession(sessionId: string): Promise<void>;

  /**
   * メッセージ受信リスナーを登録する
   * @returns アンサブスクライブ関数
   */
  onMessage(callback: (message: SDKMessage) => void): () => void;
}

/**
 * AgentClient設定
 */
export interface AgentClientConfig {
  /**
   * Anthropic API Key
   * Main Processでのみ設定
   */
  apiKey: string;

  /**
   * デフォルトタイムアウト（ミリ秒）
   * @default 30000
   */
  defaultTimeout?: number;

  /**
   * 最大リトライ回数
   * @default 3
   */
  maxRetries?: number;

  /**
   * 初期リトライ待機時間（ミリ秒）
   * @default 1000
   */
  initialRetryDelay?: number;

  /**
   * 最大リトライ待機時間（ミリ秒）
   * @default 4000
   */
  maxRetryDelay?: number;
}

/**
 * デフォルト設定
 */
export const DEFAULT_AGENT_CLIENT_CONFIG: Omit<
  Required<AgentClientConfig>,
  "apiKey"
> = {
  defaultTimeout: 30000,
  maxRetries: 3,
  initialRetryDelay: 1000,
  maxRetryDelay: 4000,
};
