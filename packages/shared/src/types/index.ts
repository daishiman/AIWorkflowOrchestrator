/**
 * Shared Types - 共有型定義のエクスポート
 */

export * from "./replace";

// RAG型定義
export * from "./rag";

// Chat履歴型定義
export * from "./chat-session";
export * from "./chat-message";
export * from "./llm-metadata";

// スキル管理型定義
export * from "./skill";

// スキル改善型定義 (TASK-9C)
export * from "./skill-improver";

// エージェント実行型定義 (AGENT-004)
export type {
  AgentMessage,
  AgentExecutionState,
  AgentStartRequest,
  AgentStreamPayload,
  AgentStatusPayload,
} from "./agent";

// Environment Backend型定義 (AGENT-007)
export type {
  ContentType,
  ExtractedContent,
  SanitizedContent,
  EnvironmentPreviewContent,
} from "./agent";

// プレビュー環境型定義 (AGENT-006)
export type {
  EnvironmentType,
  PreviewEnvironmentConfig,
  PreviewContent,
} from "./agent";

// Agent Execution型定義 (AGENT-005)
export type {
  PermissionMode,
  AgentExecutionRequest,
  AgentStreamMessageType,
  AgentStreamMessage,
  ExecutionStatusType,
  AgentExecutionStatus,
  PermissionRequest,
  PermissionResponse,
  PermissionRule,
  PermissionRules,
  AgentStartResult,
  AgentStopRequest,
  AgentPermissionResRequest,
  HookInput,
  HookOutput,
} from "./agent-execution";

export { AGENT_DEFAULTS, DANGEROUS_PATTERNS } from "./agent-execution";

// スキル実行型定義 (TASK-FIX-1-1-TYPE-ALIGNMENT: skill.tsに統合)
// 以下の型はskill.tsからexport *で自動エクスポートされます:
// - ExecutionState, ExecutionInfo, ExecutionContext
// - SkillExecutionRequest, SkillExecutionResponse
// - SkillStreamMessageType, SkillStreamMessage
// - SkillExecutionErrorCode, SkillExecutionError
// - SKILL_EXECUTION_DEFAULTS

// スライド設定型定義
export type {
  SlideSettings,
  DirectoryValidationResult,
  ValidationResult,
  SlideSettingsAPI,
  SlideSettingsGetResponse,
  SlideSettingsGetDirectoryResponse,
  SlideSettingsSetDirectoryResponse,
  SlideSettingsSelectDirectoryResponse,
  SlideSettingsValidateDirectoryResponse,
} from "./slideSettings";

export { DEFAULT_SLIDE_SETTINGS } from "./slideSettings";

// Permission Store型定義 (TASK-3-1-E)
export type {
  AllowedToolEntry,
  PermissionStoreSchema,
  IPermissionStore,
} from "./permission-store";

// SkillCreator型定義 (TASK-9B-G)
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
  // Phase 5: 新規メソッド用型定義 (TASK-9B)
  ImproveOptions,
  ImproveSuggestion,
  ImproveResult,
  ForkOptions,
  ExportFormat,
  ScheduleConfig,
  DebugOptions,
  DebugStep,
  DebugResult,
  UsageStats,
} from "./skillCreator";

// ファイル選択型定義
export type {
  FileExtension,
  FilePath,
  MimeType,
  FileFilterCategory,
  DialogFileFilter,
  SelectedFile,
  OpenFileDialogRequest,
  OpenFileDialogResponse,
  GetFileMetadataRequest,
  GetFileMetadataResponse,
  GetMultipleFileMetadataRequest,
  GetMultipleFileMetadataResponse,
  ValidateFilePathRequest,
  ValidateFilePathResponse,
  FileSelectionState,
} from "../../schemas/index.js";

// 認証モード型定義 (TASK-AUTH-MODE-SELECTION-001)
export * from "./auth-mode";
