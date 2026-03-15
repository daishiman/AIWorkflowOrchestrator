/**
 * Agent Execution Types (AGENT-005)
 * Claude Agent SDK統合のための型定義
 *
 * @see docs/30-workflows/claude-code-integration/outputs/phase-2/type-definitions.md
 */

import type { HandoffGuidance } from "./handoff";

// ========================================
// Permission Mode
// ========================================

/**
 * 権限制御のモード
 */
export type PermissionMode = "auto" | "ask" | "deny" | "default";

// ========================================
// Agent Execution Request
// ========================================

/**
 * SDK実行リクエスト
 */
export interface AgentExecutionRequest {
  /** 実行ID（UUID形式、省略時は自動生成） */
  executionId?: string;

  /** スキルID（スキルを使用する場合） */
  skillId?: string;

  /** スキルファイルのパス */
  skillPath?: string;

  /** ユーザーからのプロンプト */
  prompt: string;

  /** 作業ディレクトリ（省略時はprocess.cwd()） */
  workingDirectory?: string;

  /** 許可するツール一覧 */
  tools?: string[];

  /** 権限モード */
  permissionMode?: PermissionMode;
}

// ========================================
// Streaming Message Types
// ========================================

/**
 * ストリーミングメッセージの種別
 */
export type AgentStreamMessageType =
  | "assistant"
  | "user"
  | "result"
  | "tool_use"
  | "status"
  | "error";

/**
 * SDKメッセージ型（ストリーミング用）
 */
export interface AgentStreamMessage {
  /** 実行ID */
  executionId: string;

  /** メッセージ種別 */
  type: AgentStreamMessageType;

  /** メッセージ内容（種別により構造が異なる） */
  content: unknown;

  /** タイムスタンプ（ミリ秒） */
  timestamp: number;
}

// ========================================
// Execution Status Types
// ========================================

/**
 * 実行ステータスの種別
 */
export type ExecutionStatusType =
  | "running"
  | "completed"
  | "cancelled"
  | "error";

/**
 * 実行状態
 */
export interface AgentExecutionStatus {
  /** 実行ID */
  executionId: string;

  /** 現在のステータス */
  status: ExecutionStatusType;

  /** 開始時刻（ミリ秒） */
  startedAt: number;

  /** 完了時刻（ミリ秒、完了時のみ） */
  completedAt?: number;

  /** エラーメッセージ（エラー時のみ） */
  error?: string;
}

// ========================================
// Permission Types
// ========================================

/**
 * Permission Request（UIダイアログ用）
 */
export interface PermissionRequest {
  /** 実行ID */
  executionId: string;

  /** リクエストID（応答のマッチング用） */
  requestId: string;

  /** ツール名 */
  toolName: string;

  /** ツール引数 */
  args: Record<string, unknown>;

  /** 確認を求める理由（オプション） */
  reason?: string;
}

/**
 * Permission Response（UIからの応答）
 */
export interface PermissionResponse {
  /** リクエストID（リクエストとのマッチング用） */
  requestId: string;

  /** 承認されたかどうか */
  approved: boolean;

  /** この選択を記憶するか（オプション） */
  rememberChoice?: boolean;

  /** 拒否理由（オプション） */
  rejectReason?: string;
}

// ========================================
// Permission Rules Types
// ========================================

/**
 * 単一の権限ルール
 */
export interface PermissionRule {
  /** 対象ツール（単一または複数） */
  tool: string | string[];

  /** 対象パス（glob形式、オプション） */
  paths?: string[];

  /** 対象コマンド（Bash用、オプション） */
  commands?: string[];
}

/**
 * 権限ルールセット
 */
export interface PermissionRules {
  /** 自動許可ルール */
  allow?: PermissionRule[];

  /** 拒否ルール */
  deny?: PermissionRule[];

  /** 確認要求ルール */
  ask?: PermissionRule[];
}

// ========================================
// IPC Request/Response Types
// ========================================

/**
 * agent:start の戻り値
 */
export interface AgentStartResult {
  /** 実行ID */
  executionId?: string;

  /** 開始成功かどうか */
  success?: boolean;

  /** エラーメッセージ（失敗時） */
  error?: string;

  /** true の場合は統合実行せず terminal handoff を案内する */
  handoff?: boolean;

  /** handoff=true の場合のターミナル実行案内 */
  guidance?: HandoffGuidance;
}

/**
 * agent:stop のリクエスト
 */
export interface AgentStopRequest {
  /** 停止対象の実行ID */
  executionId: string;
}

/**
 * agent:permission:res のリクエスト
 */
export interface AgentPermissionResRequest {
  /** 実行ID */
  executionId: string;

  /** 権限応答 */
  response: PermissionResponse;
}

// ========================================
// Hook Types
// ========================================

/**
 * Hookコールバックへの入力
 */
export interface HookInput {
  /** ツール名 */
  toolName: string;

  /** ツール引数 */
  args: Record<string, unknown>;

  /** セッションID（オプション） */
  sessionId?: string;
}

/**
 * Hookコールバックからの出力
 */
export interface HookOutput {
  /** 処理を続行するか */
  proceed?: boolean;

  /** フィードバックメッセージ */
  message?: string;

  /** エラーメッセージ */
  error?: string;

  /** 追加データ */
  data?: Record<string, unknown>;
}

// ========================================
// Constants
// ========================================

/**
 * デフォルト設定
 */
export const AGENT_DEFAULTS = {
  /** デフォルトの許可ツール */
  DEFAULT_TOOLS: ["Read", "Edit", "Write", "Bash", "Glob", "Grep"] as const,

  /** デフォルトの権限モード */
  DEFAULT_PERMISSION_MODE: "default" as PermissionMode,

  /** Permission応答のタイムアウト（ミリ秒） */
  PERMISSION_TIMEOUT_MS: 30000,

  /** 最大同時実行数 */
  MAX_CONCURRENT_EXECUTIONS: 5,
} as const;

/**
 * 危険パターン
 */
export const DANGEROUS_PATTERNS = {
  /** 危険なBashコマンドパターン */
  BASH_COMMANDS: [
    "rm -rf",
    "sudo",
    "chmod 777",
    "dd if=",
    "mkfs",
    "> /dev/",
    ":(){ :|:& };:",
  ] as const,

  /** 保護対象パス */
  PROTECTED_PATHS: [
    "/etc/**",
    "/usr/**",
    "/var/**",
    "**/.bashrc",
    "**/.zshrc",
    "**/.profile",
  ] as const,
} as const;
