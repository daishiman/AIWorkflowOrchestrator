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
// API キー管理型 (TASK-RT-04)
// ============================================

/**
 * API キーの状態
 */
export type ApiKeyStatus = "not_set" | "validating" | "configured" | "error";

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
// Workflow manifest contract
// ============================================

export const WORKFLOW_MANIFEST_SCHEMA_VERSION = 1 as const;

export type WorkflowManifestResourceKind =
  | "agent"
  | "reference"
  | "schema"
  | "asset";

export interface WorkflowManifestHook {
  id: string;
  command: string;
  description?: string;
}

export interface WorkflowManifestResourceDescriptor {
  id: string;
  kind: WorkflowManifestResourceKind;
  path: string;
  optional?: boolean;
  phaseIds?: string[];
}

export interface WorkflowManifestPhase {
  id: string;
  title: string;
  dependsOn?: string[];
  resourceIds?: string[];
  entryHookId: string;
  exitHookId: string;
}

export interface WorkflowManifest {
  schemaVersion: typeof WORKFLOW_MANIFEST_SCHEMA_VERSION;
  workflowId: string;
  phases: WorkflowManifestPhase[];
  resources: WorkflowManifestResourceDescriptor[];
  entry: WorkflowManifestHook[];
  exit: WorkflowManifestHook[];
}

export interface NormalizedWorkflowManifestResourceDescriptor extends WorkflowManifestResourceDescriptor {
  absolutePath: string;
}

export interface LoadedWorkflowManifest extends WorkflowManifest {
  sourcePath: string;
  manifestDir: string;
  manifestMtimeMs: number;
  manifestContentHash: string;
  resourceDescriptorHash: string;
  cacheKey: string;
  resources: NormalizedWorkflowManifestResourceDescriptor[];
}

// ============================================
// LLM Adapter Status (TASK-RT-01)
// ============================================

/** LLMAdapter の初期化ステータス */
export type LLMAdapterStatus = "ready" | "initializing" | "failed";

/** Skill Creator のエラーコード */
export type SkillCreatorErrorCode =
  | "LLM_ADAPTER_FAILED"
  | "LLM_ADAPTER_INITIALIZING";

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

/**
 * 公開 skill-creator:get-verify-detail リクエスト
 */
export interface SkillCreatorGetVerifyDetailRequest {
  planId: string;
}

/**
 * 公開 skill-creator:reverify-workflow リクエスト
 */
export interface SkillCreatorReverifyWorkflowRequest {
  planId: string;
}

export type SkillCreatorPlanResult = RuntimeSkillCreatorPlanResult;
export type SkillCreatorTerminalHandoffBundle = TerminalHandoffBundle;
export interface SkillCreatorTerminalHandoffResult {
  type: "terminal_handoff";
  bundle: SkillCreatorTerminalHandoffBundle;
}
export type SkillCreatorExecutePlanResult = RuntimeSkillCreatorExecuteResult;
export type SkillCreatorImproveSkillResult = RuntimeSkillCreatorImproveResult;

export type SkillCreatorWorkflowPhase =
  | "plan"
  | "review"
  | "execute"
  | "verify"
  | "improve"
  | "handoff";

export type SkillCreatorUserInputKind =
  | "single_select"
  | "multi_select"
  | "free_text"
  | "secret"
  | "confirm";

export type SkillCreatorAwaitingUserInputReason =
  | "plan_review"
  | "verification_review";

export type SkillCreatorWorkflowFailureReason =
  | "execution_error"
  | "execution_failed"
  | "verification_review";

export interface SkillCreatorUserInputOption {
  id: string;
  label: string;
  description?: string;
}

export interface SkillCreatorUserInputRequest {
  requestId: string;
  reason: SkillCreatorAwaitingUserInputReason;
  title: string;
  prompt: string;
  kind: SkillCreatorUserInputKind;
  options?: SkillCreatorUserInputOption[];
  placeholder?: string;
  allowSkip?: boolean;
  requestedAt: string;
}

export interface SkillCreatorVerifyResult {
  status: "pending" | "pass" | "fail";
  reason?: SkillCreatorWorkflowFailureReason;
  message?: string;
  nextAction?: "review" | "improve" | "handoff";
  updatedAt: string;
  /** 現在の improve 試行回数（閉ループ内でのカウント、0開始） */
  improveAttemptCount?: number;
  /** 最大 improve 試行回数 */
  maxImproveRetry?: number;
  /** maxRetry 到達によりループが停止したか */
  loopExhausted?: boolean;
  /** 失敗した verify チェックの要約 */
  failedChecksSummary?: string;
}

export interface SkillCreatorWorkflowSourceProvenance {
  resolvedSkillCreatorRoot?: string;
  resourceDescriptorHash?: string;
  manifestPath?: string;
  manifestCacheKey?: string;
  warningNote?: string;
}

export type SkillCreatorSdkEventType =
  | "init"
  | "assistant"
  | "result"
  | "error";

export interface SkillCreatorSdkPermissionDenial {
  toolName?: string;
  toolUseId?: string;
  reason: string;
}

export interface SkillCreatorSdkEvent {
  eventType: SkillCreatorSdkEventType;
  sequence?: number;
  rawType?: string;
  sessionId?: string;
  messageId?: string;
  text?: string;
  resultSubtype?: string;
  stopReason?: string;
  permissionDenials?: SkillCreatorSdkPermissionDenial[];
  errorMessage?: string;
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance;
}

export interface SkillCreatorRouteSnapshot {
  type: "integrated_api" | "terminal_handoff";
  permissionMode?: "default" | "acceptEdits" | "bypassPermissions";
  launcher?: string;
}

export interface SkillCreatorResumeTokenEnvelope {
  version: "task-sdk-02-v1";
  planId: string;
  currentPhase: SkillCreatorWorkflowPhase;
  artifactCount: number;
  routeSnapshot?: SkillCreatorRouteSnapshot;
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance;
  updatedAt: string;
}

export interface SkillCreatorWorkflowUiSnapshot {
  planId: string;
  currentPhase: SkillCreatorWorkflowPhase;
  awaitingUserInput: SkillCreatorUserInputRequest | null;
  verifyResult: SkillCreatorVerifyResult | null;
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance;
  resumeTokenEnvelope: SkillCreatorResumeTokenEnvelope;
  routeSnapshot?: SkillCreatorRouteSnapshot;
  handoffBundle?: TerminalHandoffBundle | null;
}

export interface SkillCreatorUserInputSubmission {
  planId: string;
  requestId: string;
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  selectedValues?: string[];
  textValue?: string;
  secretValue?: string;
  confirmed?: boolean;
}

// ============================================
// Conversational Interview UI 型定義 (TASK-P0-06)
// ============================================

export type InterviewProficiency = "beginner" | "engineer";

export interface InterviewUserAnswer {
  kind: SkillCreatorUserInputKind;
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  selectedValues?: string[];
  textValue?: string;
  secretValue?: string;
  confirmed?: boolean;
}

export interface InterviewMessage {
  id: string;
  role: "assistant" | "user";
  kind: SkillCreatorUserInputKind | "info";
  content: string;
  inputRequest?: SkillCreatorUserInputRequest;
  userAnswer?: InterviewUserAnswer;
  timestamp: string;
}

export interface InterviewState {
  messages: InterviewMessage[];
  currentStepIndex: number;
  totalSteps: number;
  proficiency: InterviewProficiency;
  canUndo: boolean;
}

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
  /** LLMAdapter の現在のステータス (TASK-RT-01) */
  adapterStatus?: LLMAdapterStatus;
}

/**
 * Runtime execute 結果
 */
export interface RuntimeSkillCreatorExecuteResult {
  executeId: string;
  skillName: string;
  success: boolean;
  error?: string;
  sessionId?: string;
  resultSubtype?: string;
  stopReason?: string;
  permissionDenials?: SkillCreatorSdkPermissionDenial[];
  sdkEvents?: SkillCreatorSdkEvent[];
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance;
  /** SkillFileWriter.persist() の結果。persist 未実行またはスキップ時は null */
  persistResult?: { skillPath: string; files: string[] } | null;
  /** persist 失敗時のエラーメッセージ。成功またはスキップ時は null */
  persistError?: string | null;
}

export type RuntimeSkillCreatorVerifyCheckSeverity =
  | "info"
  | "warning"
  | "error";

export interface RuntimeSkillCreatorVerifyCheck {
  id: string;
  layer: "layer1" | "layer2" | "layer3" | "layer4";
  severity: RuntimeSkillCreatorVerifyCheckSeverity;
  summary: string;
  evidenceSummary?: string;
}

export interface RuntimeSkillCreatorVerifyDetailRoute {
  type: "integrated_api" | "terminal_handoff";
  permissionMode?: "default" | "acceptEdits" | "bypassPermissions";
  launcher?: string;
  summary: string;
}

export interface RuntimeSkillCreatorVerifyDetail {
  planId: string;
  currentPhase:
    | "plan"
    | "review"
    | "execute"
    | "verify"
    | "improve"
    | "handoff";
  status: "pending" | "pass" | "fail";
  message?: string;
  nextAction?: "review" | "improve" | "handoff";
  checks: RuntimeSkillCreatorVerifyCheck[];
  evidenceCount: number;
  resolvedSkillCreatorRoot?: string;
  manifestPath?: string;
  resourceDescriptorHash?: string;
  manifestCacheKey?: string;
  route: RuntimeSkillCreatorVerifyDetailRoute;
  reverifyEligible: boolean;
  disabledReason?: string;
  delegatedGovernanceNote: string;
  delegatedSessionNote: string;
}

export interface RuntimeSkillCreatorReverifyResult {
  accepted: boolean;
  disabledReason?: string;
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
 * verify→improve→re-verify 閉ループの最終結果
 * TASK-P0-02
 */
export interface RuntimeSkillCreatorVerifyAndImproveResult {
  /** 最終的な verify 結果 */
  finalStatus: "pass" | "fail" | "error";
  /** 実行した improve の回数 */
  totalAttempts: number;
  /** 最終的な verify チェック結果 */
  finalChecks: RuntimeSkillCreatorVerifyCheck[];
  /** ループが maxRetry で停止したか */
  loopExhausted: boolean;
  /** エラーが発生した場合のメッセージ */
  errorMessage?: string;
  /** ワークフロー状態スナップショット */
  workflowSnapshot: SkillCreatorWorkflowUiSnapshot;
}

/**
 * Degraded reason code（llmAdapter / resourceLoader 不足時）
 * TASK-RT-02
 */
export type RuntimeSkillCreatorDegradedReason =
  | "llm_adapter_unavailable"
  | "resource_loader_unavailable";

/**
 * plan() エラーレスポンス（logical error union、TASK-RT-02）
 */
export interface RuntimeSkillCreatorPlanErrorResponse {
  success: false;
  error: {
    code: RuntimeSkillCreatorDegradedReason | "VALIDATION_ERROR";
    message: string;
  };
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
 * TASK-RT-02: error union を追加
 */
export type RuntimeSkillCreatorPlanResponse =
  | RuntimeSkillCreatorPlanResult
  | RuntimeSkillCreatorPlanErrorResponse
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
 * Runtime verify detail IPC の戻り値
 */
export type RuntimeSkillCreatorVerifyDetailResponse =
  RuntimeSkillCreatorVerifyDetail;

/**
 * Runtime reverify IPC の戻り値
 */
export type RuntimeSkillCreatorReverifyResponse =
  RuntimeSkillCreatorReverifyResult;

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

// ============================================
// Session Persistence Contract (TASK-SDK-08)
// ============================================

/**
 * Checkpoint 種別。phase boundary 単位のみ許可。
 * mid-stream checkpoint は scope 外。
 */
export type SkillCreatorCheckpointType =
  | "review-ready"
  | "execute-complete"
  | "verify-fail"
  | "handoff-ready";

/**
 * Compatibility evaluator の判定結果ステータス。
 * - compatible: そのまま restore してよい
 * - compatible_with_warning: restore 許可だが UI に warning を出す
 * - incompatible: restore 不可（version/route/hash mismatch）
 * - conflict: 現在の writer と競合（revision/lease mismatch）
 */
export type ResumeCompatibilityStatus =
  | "compatible"
  | "compatible_with_warning"
  | "incompatible"
  | "conflict";

/**
 * Incompatibility / conflict の理由コード
 */
export type ResumeIncompatibilityReason =
  | "version_mismatch"
  | "route_type_mismatch"
  | "manifest_cache_key_mismatch"
  | "resource_descriptor_hash_mismatch"
  | "root_relocation_warning"
  | "revision_mismatch"
  | "active_lease_conflict"
  | "checkpoint_not_found"
  | "missing_workflow_payload";

/**
 * Compatibility evaluator の戻り値
 */
export interface ResumeCompatibilityResult {
  status: ResumeCompatibilityStatus;
  reasons: ResumeIncompatibilityReason[];
  warnings: string[];
}

/**
 * Checkpoint の lease 情報。stale write guard に使う。
 */
export interface WorkflowCheckpointLease {
  ownerInstanceId: string;
  leaseExpiresAt: number;
  acquiredAt: number;
}

/**
 * Compatibility snapshot。resume 可否判定に使う比較データ。
 */
export interface SkillCreatorCompatibilitySnapshot {
  routeSnapshot?: SkillCreatorRouteSnapshot;
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance;
  manifestCacheKey?: string;
  resourceDescriptorHash?: string;
  engineVersion: string;
}

/**
 * Workflow state の永続化単位。phase boundary で生成される。
 * generic PersistedSession とは別 contract として分離する。
 */
export interface SkillCreatorPersistedWorkflowCheckpoint {
  /** checkpoint の一意 ID */
  checkpointId: string;
  /** 関連する planId */
  planId: string;
  /** checkpoint の種別 */
  checkpointType: SkillCreatorCheckpointType;

  /** workflow state snapshot */
  workflowStateSnapshot: {
    currentPhase: SkillCreatorWorkflowPhase;
    awaitingUserInput: SkillCreatorUserInputRequest | null;
    verifyResult: SkillCreatorVerifyResult | null;
    phaseArtifacts: SkillCreatorWorkflowArtifactEntry[];
    resumeTokenEnvelope: SkillCreatorResumeTokenEnvelope;
    handoffBundle?: TerminalHandoffBundle | null;
  };

  /** 互換性判定用 snapshot */
  compatibilitySnapshot: SkillCreatorCompatibilitySnapshot;

  /** stale write guard */
  revision: number;
  lease?: WorkflowCheckpointLease;

  /** metadata */
  createdAt: number;
  updatedAt: number;
  invalidatedAt?: number;
}

/**
 * phaseArtifacts の永続化用エントリ。
 * engine 内部の SkillCreatorWorkflowArtifact をシリアライズ可能にする。
 */
export interface SkillCreatorWorkflowArtifactEntry {
  phase: SkillCreatorWorkflowPhase;
  type: string;
  timestamp: string;
  data: unknown;
}

/**
 * Workflow session store のスキーマ。
 * generic SessionStorageSchema とは別 store に配置する。
 */
export interface WorkflowSessionStorageSchema {
  checkpoints: Record<string, SkillCreatorPersistedWorkflowCheckpoint>;
  metadata: {
    version: string;
    lastUpdated: number;
  };
}

/**
 * engine version。persisted checkpoint の compatibility に使う。
 */
export const SKILL_CREATOR_ENGINE_VERSION = "task-sdk-08-v1" as const;

// SkillCreatorSdkEventType, SkillCreatorSdkPermissionDenial, SkillCreatorSdkEvent は
// 上部（line ~437）で定義済み（TASK-RT-06）
