/**
 * SkillCreator Type Definitions
 * TASK-9B-G: skill-creator-service
 *
 * スキル作成サービスの型定義
 */

import type { AuthMode } from "./auth-mode";
import type { HandoffGuidance } from "./handoff";

// ============================================
// モード・エンジン型
// ============================================

/**
 * スキル作成モード
 * - collaborative: ユーザー対話型スキル共創（推奨）
 * - orchestrate: 実行エンジン選択モード
 * - create: 新規スキル作成
 * - update: 既存スキル更新
 * - improve-prompt: プロンプト改善
 */
export type SkillCreatorMode =
  | "collaborative"
  | "orchestrate"
  | "create"
  | "update"
  | "improve-prompt";

/**
 * 実行エンジン（orchestrateモード用）
 * - claude: Claude Codeで実行
 * - codex: OpenAI Codexで実行
 * - claude-to-codex: Claudeで設計→Codexで実行
 */
export type ExecutionEngine = "claude" | "codex" | "claude-to-codex";

// ============================================
// スキル作成関連型
// ============================================

/**
 * スキル作成オプション
 */
export interface CreateSkillOptions {
  /** スキル名（ディレクトリ名となる） */
  name: string;
  /** スキルの説明 */
  description: string;
  /** 作成モード */
  mode: SkillCreatorMode;
  /** 実行エンジン（orchestrateモード時） */
  executionEngine?: ExecutionEngine;
  /** タスク仕様書を生成するか */
  generateTasks?: boolean;
  /** インタビュー結果（collaborativeモード時） */
  interviewResult?: InterviewResult;
  /** ドメインモデル（collaborativeモード時） */
  domainModel?: DomainModel;
  /** スキルパス（updateモード時） */
  skillPath?: string;
  /** タスクディレクトリ（createモード時） */
  tasksDir?: string;
}

/**
 * インタビュー結果（collaborativeモード）
 * Phase 0-1〜0-8の結果を格納
 */
export interface InterviewResult {
  /** スキルの目的 */
  purpose: string;
  /** 提供する機能一覧 */
  features: string[];
  /** 入力データ定義 */
  inputs: string[];
  /** 出力データ定義 */
  outputs: string[];
  /** 外部API設定（オプション） */
  externalApis?: ExternalApiConfig[];
  /** 必要なツール一覧 */
  toolsNeeded: string[];
  /** 抽象度レベル（L1: 高, L2: 中, L3: 低） */
  abstractionLevel: "L1" | "L2" | "L3";
}

/**
 * ドメインモデル（DDD設計用）
 * Phase 0.5で作成
 */
export interface DomainModel {
  /** コアドメイン定義 */
  coreDomain: string;
  /** エンティティ一覧 */
  entities: Entity[];
  /** 境界づけられたコンテキスト */
  boundedContexts: BoundedContext[];
  /** ユビキタス言語（用語辞書） */
  ubiquitousLanguage: Record<string, string>;
}

// ============================================
// タスク実行関連型
// ============================================

/**
 * タスク実行オプション
 */
export interface ExecuteTasksOptions {
  /** タスク仕様書のディレクトリパス */
  tasksDir: string;
  /** 並列実行を許可するか（デフォルト: false） */
  parallel?: boolean;
  /** ドライラン（実行せず計画のみ返す） */
  dryRun?: boolean;
  /** 最大実行ターン数 */
  maxTurns?: number;
}

/**
 * 実行レポート
 */
export interface ExecutionReport {
  /** 実行モード */
  mode: "dry-run" | "execution";
  /** 実行順序（ドライラン時） */
  tasks?: string[][];
  /** 実行結果（実行時） */
  results?: TaskResult[];
  /** サマリー（実行時） */
  summary?: ExecutionSummary;
  /** 見積もり時間（分）（ドライラン時） */
  estimatedTime?: number;
}

/**
 * タスク実行結果
 */
export interface TaskResult {
  /** タスクID */
  taskId: string;
  /** 実行ステータス */
  status: "completed" | "failed" | "skipped";
  /** 実行時間（ミリ秒） */
  duration: number;
  /** エラーメッセージ（失敗時） */
  error?: string;
  /** 生成された成果物パス */
  artifacts?: string[];
}

/**
 * 実行サマリー
 */
export interface ExecutionSummary {
  /** 総タスク数 */
  total: number;
  /** 完了タスク数 */
  completed: number;
  /** 失敗タスク数 */
  failed: number;
  /** スキップタスク数 */
  skipped: number;
}

// ============================================
// 補助型
// ============================================

/**
 * エンティティ定義（DDD）
 */
export interface Entity {
  /** エンティティ名 */
  name: string;
  /** 属性一覧 */
  attributes: string[];
}

/**
 * 境界づけられたコンテキスト（DDD）
 */
export interface BoundedContext {
  /** コンテキスト名 */
  name: string;
  /** 含まれるエンティティ名 */
  entities: string[];
}

/**
 * 外部API設定
 */
export interface ExternalApiConfig {
  /** API名 */
  name: string;
  /** エンドポイントURL */
  endpoint: string;
  /** 認証タイプ */
  authType?: "apiKey" | "oauth" | "none";
}

// ============================================
// 内部型（サービス内部使用）
// ============================================

/**
 * スクリプト実行結果
 * ScriptExecutor.execute()の戻り値
 */
export interface ScriptResult {
  /** 実行成功フラグ（exitCode === 0） */
  success: boolean;
  /** 標準出力 */
  stdout: string;
  /** 標準エラー出力 */
  stderr: string;
  /** 終了コード */
  exitCode: number;
}

/**
 * タスク仕様（内部型）
 * タスク仕様書から抽出した情報
 */
export interface TaskSpec {
  /** タスクID */
  id: string;
  /** タスク内容 */
  content: string;
  /** 許可されたツール */
  allowedTools?: string[];
  /** 依存タスクID */
  depends_on?: string[];
}

/**
 * 依存関係グラフ（内部型）
 * タスクIDをキーに、依存するタスク配列を値とするMap
 */
export type DependencyGraph = Map<string, TaskSpec[]>;

// ============================================
// Phase 5: 新規メソッド用型定義 (TASK-9B)
// ============================================

/** スキル改善オプション */
export interface ImproveOptions {
  autoApply?: boolean;
  targetAreas?: string[];
}

/** 改善提案 */
export interface ImproveSuggestion {
  category: string;
  description: string;
  severity: "low" | "medium" | "high";
  autoFixable: boolean;
}

/** スキル改善結果 */
export interface ImproveResult {
  suggestions: ImproveSuggestion[];
  applied: boolean;
}

// ============================================
// Runtime Skill Creator IPC contract
// ============================================

/**
 * 公開 skill-creator:plan リクエスト
 */
export interface SkillCreatorPlanRequest {
  prompt: string;
  authMode?: AuthMode;
  apiKey?: string | null;
}

/**
 * 公開 skill-creator:execute-plan リクエスト
 */
export interface SkillCreatorExecutePlanRequest {
  planId: string;
  skillSpec: string;
  authMode?: AuthMode;
  apiKey?: string | null;
}

/**
 * 公開 skill-creator:improve-skill リクエスト
 */
export interface SkillCreatorImproveSkillRequest {
  skillName: string;
  feedback: string;
  authMode?: AuthMode;
  apiKey?: string | null;
}

export type SkillCreatorPlanResult = RuntimeSkillCreatorPlanResult;
export type SkillCreatorTerminalHandoffBundle = TerminalHandoffBundle;
export interface SkillCreatorTerminalHandoffResult {
  type: "terminal_handoff";
  bundle: SkillCreatorTerminalHandoffBundle;
}
export type SkillCreatorExecutePlanResult = RuntimeSkillCreatorExecuteResult;
export type SkillCreatorImproveSkillResult = RuntimeSkillCreatorImproveResult;

// ============================================
// Runtime Skill Creator IPC 型定義
// ============================================

/**
 * Terminal handoff で renderer に返す操作バンドル
 */
export interface TerminalHandoffBundle {
  launcher: string;
  promptBundle: string;
  cwd: string;
  suggestedCommand: string;
  manualRetryRule: string;
  runbook?: string;
}

/**
 * Runtime plan 結果
 */
export interface RuntimeSkillCreatorPlanResult {
  planId: string;
  skillSpec: string;
  estimatedSteps: number;
  skillName: string;
  description: string;
  agents: Array<{ name: string; role: string }>;
  scripts: Array<{ name: string; purpose: string }>;
  triggers: string[];
  anchors: string[];
}

/**
 * Runtime execute 結果
 */
export interface RuntimeSkillCreatorExecuteResult {
  executeId: string;
  skillName: string;
  success: boolean;
  error?: string;
}

/**
 * 構造化された改善提案（section/before/after/reason）
 * TASK-SC-05-IMPROVE-LLM
 */
export interface RuntimeSkillCreatorImproveSuggestion {
  section: string;
  before: string;
  after: string;
  reason: string;
}

/**
 * Runtime improve 結果
 */
export interface RuntimeSkillCreatorImproveResult {
  improveId: string;
  suggestions: RuntimeSkillCreatorImproveSuggestion[];
  revisedSpec?: string;
}

/**
 * improve() の applyImprovement 戻り値
 */
export interface ApplyImprovementResult {
  applied: number;
  skipped: number;
  skippedDetails: Array<{ section: string; reason: string }>;
  errors: string[];
}

/**
 * improve() エラーレスポンス（IPC wrapper 形式、P60 対策）
 */
export interface RuntimeSkillCreatorImproveErrorResponse {
  success: false;
  error: { code: string; message: string };
}

/**
 * LLM が生成したスキルコンテンツを保持する中間データ型。
 * RuntimeSkillCreatorExecuteResult（成功/失敗のみ）とは別に、
 * execute() 内部でキャプチャされ SkillFileWriter.persist() に渡される。
 *
 * TASK-SC-04-OUTPUT-PERSISTENCE
 */
export interface SkillGeneratedContent {
  /** SKILL.md の全内容（必須、空文字列不可） */
  skillMd: string;
  /** agents/ 配下に配置するエージェント定義 */
  agents: Array<{ name: string; content: string }>;
  /** scripts/ 配下に配置するスクリプトファイル */
  scripts: Array<{ name: string; content: string }>;
  /** references/ 配下に配置する参照ドキュメント */
  references: Array<{ name: string; content: string }>;
}

/**
 * Runtime plan IPC の戻り値
 */
export type RuntimeSkillCreatorPlanResponse =
  | RuntimeSkillCreatorPlanResult
  | {
      type: "terminal_handoff";
      guidance: HandoffGuidance;
    };

/**
 * Runtime execute IPC の戻り値
 */
export type RuntimeSkillCreatorExecuteResponse =
  | RuntimeSkillCreatorExecuteResult
  | {
      type: "terminal_handoff";
      bundle: TerminalHandoffBundle;
    };

/**
 * Runtime improve IPC の戻り値
 */
export type RuntimeSkillCreatorImproveResponse =
  | RuntimeSkillCreatorImproveResult
  | {
      type: "terminal_handoff";
      guidance: HandoffGuidance;
    }
  | RuntimeSkillCreatorImproveErrorResponse;

/** フォークオプション */
export interface ForkOptions {
  copyAgents?: boolean;
  copyReferences?: boolean;
  copyScripts?: boolean;
  modifyTools?: boolean;
}

/** エクスポート形式 */
export type ExportFormat = "zip" | "tar" | "directory" | "gist";

/** スケジュール設定 */
export interface ScheduleConfig {
  skillName: string;
  scheduleType: "cron" | "interval" | "once";
  value: string;
  isEnabled: boolean;
  timezone?: string;
}

/** デバッグオプション */
export interface DebugOptions {
  verbose?: boolean;
  breakpoints?: string[];
}

/** デバッグステップ */
export interface DebugStep {
  stepNumber: number;
  toolName: string;
  input: unknown;
  output: unknown;
  duration: number;
  hitBreakpoint: boolean;
}

/** デバッグ結果 */
export interface DebugResult {
  steps: DebugStep[];
  exitCode?: number;
  duration?: number;
}

/** 使用統計 */
export interface UsageStats {
  skillName: string;
  period: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  averageDuration: number;
  topTools: Array<{ tool: string; count: number }>;
  hourlyDistribution: Record<string, number>;
  errorTrends: Array<{ date: string; count: number }>;
}
