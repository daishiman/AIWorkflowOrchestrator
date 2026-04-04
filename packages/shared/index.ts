// Types
export * from "./types";

// Skill types (src/types/skillから明示的エクスポート)
export type {
  // 既存型
  Anchor,
  SkillBrand,
  SkillId,
  SkillName,
  SkillEnvironmentType,
  EnvironmentConfig,
  SkillCategory,
  Skill,
  SkillDetail,
  SkillImportConfig,
  OperationResult,
  SkillScanError,
  SkillScanResult,
  ImportResult,
  RemoveResult,
  SkillRunResult,
  // スキルメタデータ（§5.1）
  SkillOtherFile,
  SkillSubResource,
  SkillMetadata,
  ImportedSkill,
  // 実行関連（§5.1）
  SkillExecutionRequest,
  SkillExecutionResponse,
  SkillExecutionStatus,
  // ストリーミングメッセージ（§5.1）
  SkillStreamMessageType,
  AssistantMessageContent,
  ToolUseMessageContent,
  ToolResultMessageContent,
  StatusMessageContent,
  ErrorMessageContent,
  SkillStreamMessage,
  // 権限確認（§5.1）
  SkillPermissionRequest,
  SkillPermissionResponse,
} from "./src/types/skill";

export { SKILL_CATEGORIES, toSkillId, toSkillName } from "./src/types/skill";
export type { HandoffGuidance } from "./src/types/handoff";

// Claude CLI types
export * from "./src/claude-cli";

// Agent Execution types (AGENT-005)
export * from "./src/types/agent-execution";

// Permission Store types (TASK-3-1-E, UT-06-002)
export type {
  AllowedToolEntry,
  PermissionStoreSchema,
  IPermissionStore,
  ExpiryPolicy,
  AllowedToolEntryV2,
  IPermissionStoreV2,
  PermissionStoreSchemaV2,
  ClearSessionResponse,
} from "./src/types/permission-store";

export {
  calcExpiresAt,
  PERMISSION_HISTORY_MAX_ENTRIES,
} from "./src/types/permission-store";

// Safety Gate types (UT-06-003)
export type {
  ToolRiskLevel,
  ToolRiskConfig,
  SafetyGrade,
  SafetyCheckId,
  SafetyCheckDetail,
  SafetyGateResult,
  SafetyGatePort,
} from "./src/types/safety-gate";

export { TOOL_RISK_CONFIG } from "./src/types/safety-gate";

// Skill Improver types (TASK-9C)
export type {
  SuggestionType,
  SuggestionPriority,
  Suggestion,
  Risk,
  AnalysisCategory,
  SkillAnalysis,
  ImprovementOptions,
  AppliedImprovement,
  ImprovementResult,
  OptimizationMetrics,
  OptimizationResult,
  EvaluationBreakdown,
  PromptEvaluation,
  SkillAnalyzeRequest,
  SkillImproveRequest,
  SkillOptimizeRequest,
  SkillOptimizeVariantsRequest,
  SkillOptimizeEvaluateRequest,
} from "./src/types/skill-improver";

// Skill Debug types and constants (TASK-9H)
export type {
  DebugSessionStatus,
  DebugSessionState,
  Breakpoint,
  BreakpointType,
  HookType,
  DebugStep,
  DebugStepType,
  CallStackEntry,
  CallStackEntryType,
  DebugEvent,
  DebugStepEvent,
  DebugBreakpointHitEvent,
  DebugVariableChangedEvent,
  DebugSessionEndedEvent,
  DebugCommand,
  DebugStartRequest,
  DebugCommandRequest,
  DebugBreakpointAddRequest,
  DebugBreakpointRemoveRequest,
  DebugInspectRequest,
  DebugEvaluateRequest,
  DebugEvaluateResponse,
} from "./src/types/skill-debug";

export {
  VALID_DEBUG_TRANSITIONS,
  DEBUG_CONSTANTS,
} from "./src/types/skill-debug";

// Skill Share types (TASK-9F)
export type {
  ShareSourceType,
  ShareDestinationType,
  ShareTarget,
  ShareDestination,
  ShareImportResult,
  ShareExportResult,
  ShareValidateSourceResult,
  ShareErrorCategory,
  ShareError,
  ShareResult,
} from "./src/types/skill-share";

// Skill Schedule types (TASK-9G)
export type {
  ScheduledSkill,
  SkillSchedule,
  NotificationSettings,
  ScheduledRunResult,
} from "./src/types/skill-schedule";

// Skill Analytics types (TASK-9I)
export type {
  SkillUsageEvent,
  ToolUsageStat,
  SkillStatistics,
  AnalyticsPeriod,
  TrendDataPoint,
  UsageTrend,
  SkillUsageSummary,
  AnalyticsSummary,
} from "./src/types/skill-analytics";

// Skill Docs types (TASK-9J)
export type {
  DocGenerationRequest,
  GeneratedDoc,
  DocSection,
  DocTemplate,
  TemplateSection,
} from "./src/types/skill-docs";

// Skill Docs Runtime Integration types (TASK-04)
export type {
  DocErrorGuidance,
  DocErrorCategory,
  DocError,
  DocOperationResult,
  SkillDocsCapability,
  SkillDocsCapabilityResult,
} from "./src/types/skill-docs";

// Skill Chain types (TASK-9D)
export type {
  SkillChainDefinition,
  SkillChainResult,
  StepResult,
  InputMapping,
  OutputMapping,
  SkillChainCondition,
} from "./src/types/skill-chain";

// Skill Fork types (TASK-9E)
export type {
  SkillForkOptions,
  SkillForkResult,
  SkillForkMetadata,
} from "./src/types/skill-fork";

// Skill Creator types (TASK-9B-G)
export type {
  SkillCreatorMode,
  ExecutionEngine,
  CreateSkillOptions,
  InterviewResult,
  DomainModel,
  ExecuteTasksOptions,
  ExecutionReport,
  TaskResult,
  ExecutionSummary,
  Entity,
  BoundedContext,
  ExternalApiConfig,
  ScriptResult,
  TaskSpec,
  DependencyGraph,
  RuntimeSkillCreatorVerifyCheck,
  RuntimeSkillCreatorVerifyCheckSeverity,
} from "./src/types/skillCreator";

// External API Support (TASK-SDK-SC-03)
export {
  type ExternalApiAuthType,
  type ExternalApiConnectionConfig,
  type SkillExternalApiContext,
  type IExternalApiAdapter,
  ExternalApiTimeoutError,
  ExternalApiHttpError,
} from "./src/types/skillCreatorExternalApi";

// Core
export * from "./core";

// Infrastructure
export * from "./infrastructure";

// =============================================================================
// Services
// =============================================================================

/**
 * Graph Service - Community関連型
 * Knowledge Graphサービスから提供される型定義。
 * Entity、Relation、Community、Graph関連の型を含む。
 *
 * @see packages/shared/src/services/graph/index.ts
 */
export type {
  // Entity関連
  StoredEntity,
  ExtractedEntity,
  EntityMention,
  // Relation関連
  StoredRelation,
  ExtractedRelation,
  RelationEvidence,
  // Graph関連
  GraphNode,
  GraphEdge,
  GraphPath,
  GraphTraversalResult,
  GraphStats,
  // Community関連
  Community,
  CommunitySummary,
  CommunityStructure,
  CommunityDetectionOptions,
  CommunityDetectionResult,
  CommunityDetectionStats,
  CommunitySummarizationOptions,
  CommunitySummarizationResult,
  // Query関連
  EntityQuery,
  TraversalOptions,
  RelationQueryOptions,
} from "./src/services/graph";

/**
 * Graph Service - 値（enum, class, function）
 * エラーコード、エラークラス、ユーティリティ関数を含む。
 */
export {
  CommunityErrorCode,
  CommunityDetectionError,
  CommunitySummarizationErrorCode,
  CommunitySummarizationError,
  normalizeEntityName,
} from "./src/services/graph";

// =============================================================================
// RAG Types (Branded IDs)
// =============================================================================

/**
 * Branded ID型
 * 異なるIDの誤用をコンパイル時に検出可能にする型システム。
 *
 * @see packages/shared/src/types/rag/branded.ts
 */
export type {
  Brand,
  FileId,
  ChunkId,
  ConversionId,
  EntityId,
  RelationId,
  CommunityId,
  EmbeddingId,
} from "./src/types/rag/branded";

/**
 * Branded ID - 型キャスト関数
 */
export {
  createFileId,
  createChunkId,
  createConversionId,
  createEntityId,
  createRelationId,
  createCommunityId,
  createEmbeddingId,
} from "./src/types/rag/branded";

/**
 * Branded ID - UUID生成関数
 */
export {
  generateUUID,
  generateFileId,
  generateChunkId,
  generateConversionId,
  generateEntityId,
  generateRelationId,
  generateCommunityId,
  generateEmbeddingId,
} from "./src/types/rag/branded";

// Utils
export * from "./utils";

// Slide
export * from "./src/slide";

// =============================================================================
// Chat History Feature
// =============================================================================

/**
 * Chat History - Use Cases
 * チャット履歴機能のユースケースクラス
 */
export {
  CreateChatSessionUseCase,
  AddUserMessageUseCase,
  AddAssistantMessageUseCase,
  SearchSessionsUseCase,
  TogglePinnedUseCase,
} from "./src/features/chat-history";

/**
 * Chat History - Repository Interfaces
 * DI用リポジトリインターフェース
 */
export type {
  IChatSessionRepository,
  IChatMessageRepository,
  ChatSessionSearchCriteria,
} from "./src/features/chat-history";

// Note: DrizzleChatSessionRepository, DrizzleChatMessageRepository はNode.js専用のため
// Renderer側でのビルドエラーを避けるため、ここからはエクスポートしない。
// Main Process側では packages/shared/src/features/chat-history から直接インポートすること。

// =============================================================================
// IPC Channels
// =============================================================================

/**
 * IPC チャネル定数
 * Electron IPC通信に使用するチャネル名の定数定義。
 *
 * @see packages/shared/src/ipc/channels.ts
 */
export {
  CHAT_EXPORT_CHANNELS,
  FILE_SYSTEM_CHANNELS,
  SKILL_CHANNELS,
  IPC_CHANNELS,
} from "./src/ipc/channels";

export type { IpcChannel, SkillChannel } from "./src/ipc/channels";
