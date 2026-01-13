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
