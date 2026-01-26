// Types
export * from "./types";

// Skill types (src/types/skillから明示的エクスポート)
export type {
  // 既存型
  Anchor,
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

export { SKILL_CATEGORIES } from "./src/types/skill";

// Claude CLI types
export * from "./src/claude-cli";

// Agent Execution types (AGENT-005)
export * from "./src/types/agent-execution";

// Permission Store types (TASK-3-1-E)
export type {
  AllowedToolEntry,
  PermissionStoreSchema,
  IPermissionStore,
} from "./src/types/permission-store";

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
