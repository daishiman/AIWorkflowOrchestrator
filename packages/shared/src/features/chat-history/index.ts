/**
 * Chat History Feature - Barrel Export
 *
 * React Context DI pattern用のUse CasesとRepository Interfacesをエクスポート
 *
 * @module features/chat-history
 */

// =============================================================================
// Application Layer - Use Cases
// =============================================================================
export {
  CreateChatSessionUseCase,
  AddUserMessageUseCase,
  AddAssistantMessageUseCase,
  SearchSessionsUseCase,
  TogglePinnedUseCase,
} from "./application/use-cases/index.js";

// =============================================================================
// Domain Layer - Repository Interfaces
// =============================================================================
export type {
  IChatSessionRepository,
  ChatSessionSearchCriteria,
} from "./domain/repositories/index.js";

export type { IChatMessageRepository } from "./domain/repositories/index.js";

// =============================================================================
// Domain Layer - Entities
// =============================================================================
export {
  ChatSession,
  type CreateChatSessionParams,
  type ReconstituteChatSessionParams,
} from "./domain/entities/index.js";

export {
  ChatMessage,
  type CreateUserMessageParams,
  type CreateAssistantMessageParams,
  type ReconstituteMessageParams,
} from "./domain/entities/index.js";

// =============================================================================
// Domain Layer - Value Objects
// =============================================================================
export {
  ChatSessionId,
  ChatMessageId,
  UserId,
  ChatSessionTitle,
  MessageContent,
  MessageRole,
  LLMMetadata,
  type TokenUsage,
  type CreateLLMMetadataParams,
} from "./domain/value-objects/index.js";

// =============================================================================
// Domain Layer - Errors
// =============================================================================
export {
  InvalidIdError,
  InvalidTitleError,
  InvalidContentError,
  InvalidLLMMetadataError,
} from "./domain/errors/index.js";

export {
  ChatSessionError,
  InvalidSessionTitleError,
  MaxPinnedSessionsError,
  SessionArchivedError,
} from "./domain/errors/index.js";

export {
  ChatMessageError,
  InvalidMessageContentError,
  MissingLLMMetadataError,
} from "./domain/errors/index.js";

// =============================================================================
// Application Layer - DTOs
// =============================================================================
export type {
  ChatSessionDTO,
  CreateChatSessionInput,
  CreateChatSessionOutput,
  SearchSessionsInput,
  SearchSessionsOutput,
  UpdateSessionInput,
  UpdateSessionOutput,
  TogglePinnedInput,
  TogglePinnedOutput,
  ToggleFavoriteInput,
  ToggleFavoriteOutput,
  DeleteSessionInput,
} from "./application/dto/index.js";

export type {
  ChatMessageDTO,
  LLMMetadataDTO,
  AddUserMessageInput,
  AddUserMessageOutput,
  AddAssistantMessageInput,
  AddAssistantMessageOutput,
  GetMessagesInput,
  GetMessagesOutput,
} from "./application/dto/index.js";

export { sessionToDTO, messageToDTO } from "./application/dto/index.js";

// =============================================================================
// Application Layer - Errors
// =============================================================================
export {
  SessionNotFoundError,
  MessageNotFoundError,
  MaxPinnedSessionsError as AppMaxPinnedSessionsError,
  RepositoryError,
  InvalidSessionIdError,
  InvalidUserIdError,
  InvalidTitleError as AppInvalidTitleError,
  InvalidContentError as AppInvalidContentError,
} from "./application/errors/index.js";

export type { ChatHistoryUseCaseError } from "./application/errors/index.js";

// =============================================================================
// Infrastructure Layer - Mappers
// =============================================================================
export {
  ChatSessionMapper,
  ChatMessageMapper,
} from "./infrastructure/persistence/mappers/index.js";
export type {
  ChatSessionRecord,
  ChatMessageRecord,
} from "./infrastructure/persistence/mappers/index.js";
