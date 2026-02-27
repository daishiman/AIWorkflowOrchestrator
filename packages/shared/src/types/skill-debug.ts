/**
 * スキルデバッグモード型定義
 *
 * TASK-9H: スキル実行時のデバッグ機能
 *
 * IPC シリアライズ方針:
 * - Main Process 内部: Date オブジェクト使用
 * - IPC 境界: .toISOString() で ISO 8601 文字列変換
 * - Renderer 側: string として受け取り、表示時に new Date() で復元
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// セッション状態型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** セッション状態のリテラル型 */
export type DebugSessionStatus =
  | "idle"
  | "running"
  | "paused"
  | "completed"
  | "error";

/** デバッグセッションのシリアライズ可能な状態表現（IPC転送用） */
export interface DebugSessionState {
  /** セッション一意ID（UUID v4） */
  id: string;
  /** デバッグ対象スキル名 */
  skillName: string;
  /** セッション状態 */
  status: DebugSessionStatus;
  /** 設定済みブレークポイント一覧 */
  breakpoints: Breakpoint[];
  /** 現在実行中/停止中のステップ（未開始時は undefined） */
  currentStep?: DebugStep;
  /** デバッグ中の変数スナップショット */
  variables: Record<string, unknown>;
  /** コールスタック */
  callStack: CallStackEntry[];
  /** セッション開始時刻（ISO 8601） */
  startedAt: string;
  /** セッション完了時刻（ISO 8601） */
  completedAt?: string;
  /** エラーメッセージ（error 状態時のみ） */
  error?: string;
  /** ステップ実行履歴 */
  steps: DebugStep[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ブレークポイント型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** ブレークポイントタイプのリテラル型 */
export type BreakpointType = "tool" | "hook" | "step";

/** フックタイプのリテラル型 */
export type HookType = "PreToolUse" | "PostToolUse";

export interface Breakpoint {
  /** ブレークポイント一意ID（UUID v4） */
  id: string;
  /** ブレークポイントタイプ */
  type: BreakpointType;
  /** 条件式（省略時は無条件停止） */
  condition?: string;
  /** tool タイプ時の対象ツール名 */
  toolName?: string;
  /** hook タイプ時の対象フックタイプ */
  hookType?: HookType;
  /** 有効/無効フラグ */
  enabled: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ステップ型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** ステップタイプのリテラル型 */
export type DebugStepType = "tool_call" | "hook_execution" | "agent_response";

export interface DebugStep {
  /** ステップ番号（1始まり） */
  stepNumber: number;
  /** ステップタイプ */
  type: DebugStepType;
  /** tool_call 時のツール名 */
  toolName?: string;
  /** hook_execution 時のフックタイプ */
  hookType?: string;
  /** ステップの入力データ */
  input?: unknown;
  /** ステップの出力データ */
  output?: unknown;
  /** ステップ実行時刻（ISO 8601） */
  timestamp: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// コールスタック型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** コールスタックエントリタイプのリテラル型 */
export type CallStackEntryType = "skill" | "agent" | "tool";

export interface CallStackEntry {
  /** コールスタックの深さ（0始まり） */
  depth: number;
  /** エントリ名（ツール名、スキル名、エージェント名） */
  name: string;
  /** エントリタイプ */
  type: CallStackEntryType;
  /** エントリ開始時刻（ISO 8601） */
  startTime: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// イベント型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type DebugEvent =
  | DebugStepEvent
  | DebugBreakpointHitEvent
  | DebugVariableChangedEvent
  | DebugSessionEndedEvent;

export interface DebugStepEvent {
  type: "step";
  sessionId: string;
  step: DebugStep;
}

export interface DebugBreakpointHitEvent {
  type: "breakpoint-hit";
  sessionId: string;
  breakpoint: Breakpoint;
  step?: DebugStep;
}

export interface DebugVariableChangedEvent {
  type: "variable-changed";
  sessionId: string;
  path: string;
  value: unknown;
}

export interface DebugSessionEndedEvent {
  type: "session-ended";
  sessionId: string;
  error?: string;
  completedAt?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// コマンド型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type DebugCommand =
  | "continue"
  | "stepOver"
  | "stepInto"
  | "stepOut"
  | "pause"
  | "stop";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IPC リクエスト/レスポンス型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface DebugStartRequest {
  skillName: string;
  prompt: string;
  breakpoints: Omit<Breakpoint, "id">[];
}

export interface DebugCommandRequest {
  sessionId: string;
  command: DebugCommand;
}

export interface DebugBreakpointAddRequest {
  sessionId: string;
  breakpoint: Omit<Breakpoint, "id">;
}

export interface DebugBreakpointRemoveRequest {
  sessionId: string;
  breakpointId: string;
}

export interface DebugInspectRequest {
  sessionId: string;
  path: string;
}

export interface DebugEvaluateRequest {
  sessionId: string;
  expression: string;
}

export interface DebugEvaluateResponse {
  result: unknown;
  type: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 定数
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** 有効な状態遷移テーブル */
export const VALID_DEBUG_TRANSITIONS: Record<
  DebugSessionStatus,
  readonly DebugSessionStatus[]
> = {
  idle: ["running"],
  running: ["paused", "completed", "error"],
  paused: ["running", "completed", "error"],
  completed: [],
  error: [],
} as const;

/** デバッグ機能の制限定数 */
export const DEBUG_CONSTANTS = {
  /** セッション自動タイムアウト（30分） */
  SESSION_TIMEOUT_MS: 30 * 60 * 1000,
  /** 最大ブレークポイント数 */
  MAX_BREAKPOINTS: 100,
  /** 最大コールスタック深度 */
  MAX_CALL_STACK_DEPTH: 100,
  /** 最大ステップ数 */
  MAX_STEPS: 10_000,
  /** 式評価タイムアウト（5秒） */
  EXPRESSION_TIMEOUT_MS: 5_000,
} as const;
