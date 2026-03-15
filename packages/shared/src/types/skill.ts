/**
 * スキル管理UI用の型定義
 * @module skill
 */

import type { EnvironmentType } from "./agent";
import type { HandoffGuidance } from "./handoff";

/**
 * Skill識別子向け Branded Type
 * 文字列互換を維持しつつ、SkillId/SkillName の相互代入を禁止する。
 */
declare const __skillBrand: unique symbol;
export type SkillBrand<B extends string> = string & {
  readonly [__skillBrand]?: B;
};

/** Skill一意識別子（ハッシュ） */
export type SkillId = SkillBrand<"SkillId">;
/** Skill表示名/ディレクトリ名 */
export type SkillName = SkillBrand<"SkillName">;

/** string -> SkillId 変換 */
export const toSkillId = (value: string): SkillId => value as SkillId;
/** string -> SkillName 変換 */
export const toSkillName = (value: string): SkillName => value as SkillName;

/**
 * アンカー（参照文献）情報
 */
export interface Anchor {
  /** 参照元名（source） */
  source: string;
  /** 適用方法 */
  application: string;
  /** 目的 */
  purpose: string;
}

/**
 * スキル環境設定（Skill.environment用）
 * noneは含まない（スキルは必ず環境タイプを持つ）
 */
export type SkillEnvironmentType = Exclude<EnvironmentType, "none">;

/**
 * 環境設定
 */
export interface EnvironmentConfig {
  /** 環境タイプ（none以外） */
  type: SkillEnvironmentType;
  /** 自動更新 */
  autoRefresh?: boolean;
  /** 更新デバウンス（ms） */
  debounce?: number;
}

/**
 * スキルカテゴリ
 */
export type SkillCategory =
  | "testing"
  | "design"
  | "development"
  | "documentation"
  | "security"
  | "performance"
  | "other";

/**
 * スキルカテゴリのラベルとカラー定義
 */
export const SKILL_CATEGORIES: Record<
  SkillCategory,
  { label: string; color: string }
> = {
  testing: { label: "テスト", color: "green" },
  design: { label: "設計", color: "blue" },
  development: { label: "開発", color: "purple" },
  documentation: { label: "ドキュメント", color: "orange" },
  security: { label: "セキュリティ", color: "red" },
  performance: { label: "パフォーマンス", color: "yellow" },
  other: { label: "その他", color: "gray" },
};

/**
 * スキルの基本情報
 */
export interface Skill {
  /** 一意識別子（パスのハッシュ） */
  id: SkillId;
  /** スキル名（SKILL.md解析） */
  name: SkillName;
  /** ディレクトリ名 */
  slug: string;
  /** 概要説明 */
  description: string;
  /** .claude/skills/xxx/SKILL.md */
  path: string;
  /** Triggerキーワード */
  triggers: string[];
  /** Anchor一覧 */
  anchors: Anchor[];
  /** カテゴリ（推論または手動設定） */
  category?: SkillCategory | string;
  /** 環境設定 */
  environment?: EnvironmentConfig;
  /** ライセンス */
  license?: string;
  /** 許可されたツール */
  allowedTools?: string[];
  /** タグ */
  tags?: string[];
  /** 依存関係 */
  dependencies?: string[];
  /** 最終更新日（Date） */
  lastModified: Date;
}

/**
 * スキル詳細情報（拡張）
 */
export interface SkillDetail extends Skill {
  /** ワークフロー定義 */
  workflow?: string;
  /** ベストプラクティス */
  bestPractices?: string[];
  /** 参照リンク */
  references?: string[];
  /** 関連アセット */
  assets?: string[];
  /** SKILL.mdの全文コンテンツ */
  fullContent?: string;
}

/**
 * インポート設定（永続化用）
 */
export interface SkillImportConfig {
  /** インポート済みスキルID */
  importedSkillIds: SkillId[];
  /** 最終更新日時 */
  lastUpdated: string;
}

/**
 * 操作結果
 */
export interface OperationResult<T = void> {
  /** 成功フラグ */
  success: boolean;
  /** 成功時のデータ */
  data?: T;
  /** エラーメッセージ */
  error?: string;
}

/**
 * スキルスキャンエラー
 */
export interface SkillScanError {
  /** エラーが発生したパス */
  path: string;
  /** エラーメッセージ */
  error: string;
  /** エラーコード */
  code: "PARSE_ERROR" | "READ_ERROR" | "INVALID_FORMAT";
}

/**
 * スキルスキャン結果
 */
export interface SkillScanResult {
  /** 検出されたスキル */
  skills: Skill[];
  /** スキャン中のエラー */
  errors: SkillScanError[];
  /** スキャン日時 */
  scannedAt: Date;
}

/**
 * インポート結果
 */
export interface ImportResult {
  /** 成功フラグ */
  success: boolean;
  /** インポートされた件数 */
  importedCount: number;
  /** エラーメッセージ */
  errors: string[];
}

/**
 * 削除結果
 */
export interface RemoveResult {
  /** 成功フラグ */
  success: boolean;
  /** 実際に削除されたか */
  removed: boolean;
}

/**
 * スキル実行結果
 */
export interface SkillRunResult {
  /** 実行ID（UUID） */
  executionId: string;
  /** 実行ステータス */
  status: "success" | "failed";
  /** 出力内容（成功時） */
  output?: string;
  /** エラーメッセージ（失敗時） */
  error?: string;
  /** 開始日時 */
  startedAt: Date;
  /** 完了日時 */
  completedAt: Date;
}

// ========================================
// Section: スキルメタデータ（§5.1）
// @see specification.md §5.1 Type Definitions
// ========================================

/**
 * スキルディレクトリ直下のその他のファイル
 * @see specification.md §5.1 SkillOtherFile
 */
export interface SkillOtherFile {
  /** ファイル名 */
  filename: string;

  /** ファイルタイプ */
  type: "evals" | "logs" | "package" | "other";

  /** ファイルサイズ（バイト） */
  size: number;
}

/**
 * スキル配下のサブリソース
 * @see specification.md §5.1 SkillSubResource
 */
export interface SkillSubResource {
  /** ファイル名 */
  filename: string;

  /** 相対パス */
  relativePath: string;

  /** 説明（ファイルから抽出、なければファイル名） */
  description?: string;

  /** ファイルサイズ（バイト） */
  size: number;
}

/**
 * スキルメタデータ（SKILL.md frontmatter）
 * 配下の全情報を含む
 * @see specification.md §5.1 SkillMetadata
 */
export interface SkillMetadata {
  /** スキル識別子（ディレクトリ名と一致） */
  name: SkillName;

  /** スキル説明（トリガー条件含む） */
  description: string;

  /** 許可ツール */
  allowedTools?: string[];

  /** スキルディレクトリパス */
  path: string;

  /** 最終更新日時 */
  updatedAt: Date;

  /** agents/ 配下のファイル一覧 */
  agents: SkillSubResource[];

  /** references/ 配下のファイル一覧 */
  references: SkillSubResource[];

  /** scripts/ 配下のファイル一覧 */
  scripts: SkillSubResource[];

  /** assets/ 配下のファイル一覧 */
  assets: SkillSubResource[];

  /** schemas/ 配下のファイル一覧（JSONスキーマ定義） */
  schemas: SkillSubResource[];

  /** indexes/ 配下のファイル一覧（キーワードインデックス） */
  indexes: SkillSubResource[];

  /** その他のファイル一覧（EVALS.json, LOGS.md, package.json等） */
  otherFiles: SkillOtherFile[];
}

/**
 * インポート済みスキル
 */
export interface ImportedSkill extends SkillMetadata {
  /** インポート日時 */
  importedAt: Date;

  /** インポートステータス */
  status: "active" | "disabled";

  /** SKILL.md 本文（キャッシュ） */
  content?: string;
}

// ========================================
// Section: 実行関連（§5.1）
// @see specification.md §5.1 Execution Types
// ========================================

/**
 * スキル実行リクエスト（Renderer → Main）
 * ※ executionIdはMain側で生成
 */
export interface SkillExecutionRequest {
  /** 使用するスキル名 */
  skillName: SkillName;

  /** ユーザープロンプト */
  prompt: string;

  /** 作業ディレクトリ（省略時はデフォルト） */
  workingDirectory?: string;
}

/**
 * スキル実行レスポンス（Main → Renderer）
 */
export interface SkillExecutionResponse {
  /** 実行ID（UUID、Main側で生成） */
  executionId: string;

  /** 開始成功かどうか */
  success: boolean;

  /** エラーメッセージ（失敗時） */
  error?: string;

  /** true の場合は統合実行せず terminal handoff を案内する */
  handoff?: boolean;

  /** handoff=true の場合のターミナル実行案内 */
  guidance?: HandoffGuidance;
}

/**
 * スキル実行ステータス
 */
export type SkillExecutionStatus =
  | "idle"
  | "running"
  | "permission_pending"
  | "completed"
  | "cancelled"
  | "error";

// ========================================
// Section: ストリーミングメッセージ（§5.1）
// @see specification.md §5.1 Streaming Message Types
// ========================================

/**
 * ストリーミングメッセージ種別
 */
export type SkillStreamMessageType =
  | "assistant"
  | "tool_use"
  | "tool_result"
  | "status"
  | "error";

/**
 * アシスタントメッセージ内容
 */
export interface AssistantMessageContent {
  /** テキスト内容 */
  text: string;

  /** 部分メッセージかどうか */
  isPartial?: boolean;
}

/**
 * ツール使用メッセージ内容
 */
export interface ToolUseMessageContent {
  /** ツール名 */
  toolName: string;

  /** ツール引数 */
  args: Record<string, unknown>;

  /** ツール使用ID */
  toolUseId: string;
}

/**
 * ツール結果メッセージ内容
 */
export interface ToolResultMessageContent {
  /** ツール使用ID */
  toolUseId: string;

  /** 成功したかどうか */
  success: boolean;

  /** 結果内容 */
  result?: unknown;

  /** エラーメッセージ */
  error?: string;
}

/**
 * ステータスメッセージ内容
 */
export interface StatusMessageContent {
  /** ステータス種別 */
  status: "started" | "tool_executing" | "tool_completed" | "completed";

  /** 追加情報 */
  detail?: string;
}

/**
 * エラーメッセージ内容
 */
export interface ErrorMessageContent {
  /** エラーコード */
  code: "sdk_error" | "permission_denied" | "timeout" | "network" | "unknown";

  /** エラーメッセージ */
  message: string;

  /** リトライ可能かどうか */
  retryable: boolean;
}

/**
 * ストリーミングメッセージ基底型
 * 全てのSkillStreamMessageに共通するプロパティを定義
 * @see specification.md §5.1 SkillStreamMessage
 */
interface BaseStreamMessage {
  /** 実行ID（UUID） */
  executionId: string;
  /** タイムスタンプ（UNIXタイムスタンプ） */
  timestamp: number;
}

/**
 * ストリーミングメッセージ（型安全版 - Discriminated Union）
 * typeプロパティで型を判別可能
 * BaseStreamMessageを継承し、type毎に異なるcontentを持つ
 * @see specification.md §5.1 SkillStreamMessage
 */
export type SkillStreamMessage =
  | (BaseStreamMessage & {
      type: "assistant";
      content: AssistantMessageContent;
    })
  | (BaseStreamMessage & {
      type: "tool_use";
      content: ToolUseMessageContent;
    })
  | (BaseStreamMessage & {
      type: "tool_result";
      content: ToolResultMessageContent;
    })
  | (BaseStreamMessage & {
      type: "status";
      content: StatusMessageContent;
    })
  | (BaseStreamMessage & {
      type: "error";
      content: ErrorMessageContent;
    });

// ========================================
// Section: 権限確認（§5.1）
// @see specification.md §5.1 Permission Types
// ========================================

/**
 * スキル実行時の権限確認リクエスト（Main → Renderer）
 */
export interface SkillPermissionRequest {
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
 * スキル実行時の権限確認レスポンス（Renderer → Main）
 */
export interface SkillPermissionResponse {
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
// Section: 実行状態・コンテキスト（移行元: skill-execution.ts）
// TASK-FIX-1-1-TYPE-ALIGNMENT: 型統合
// ========================================

/**
 * 実行状態
 * @see specification.md §5.1 ExecutionState
 */
export type ExecutionState =
  | "pending"
  | "running"
  | "completed"
  | "aborted"
  | "error";

/**
 * 実行情報
 */
export interface ExecutionInfo {
  /** 実行ID */
  id: string;

  /** スキルID */
  skillId: SkillId;

  /** 実行状態 */
  state: ExecutionState;

  /** 実行開始時刻（UNIXタイムスタンプ） */
  startedAt: number;

  /** 実行完了時刻（UNIXタイムスタンプ、オプション） */
  completedAt?: number;
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
  skillId: SkillId;

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
