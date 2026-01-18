/**
 * Agent SDK Module
 * @module @repo/shared/agent
 */

// Types
export type {
  QueryOptions,
  AgentQueryRequest,
  AgentStatusType,
  AgentStatus,
  SessionContext,
  Session,
  ResumeSessionRequest,
  DestroySessionRequest,
  CreateSessionResponse,
  SDKMessageType,
  ToolUseInfo,
  ToolResultInfo,
  SDKMessage,
  AgentAPI,
  AgentClientConfig,
} from "./types";
export { DEFAULT_AGENT_CLIENT_CONFIG } from "./types";

// Errors
export {
  AgentErrorCode,
  AgentError,
  AgentInitializationError,
  AgentQueryError,
  AgentTimeoutError,
  AgentAbortedError,
  AgentSessionError,
  AgentValidationError,
  deserializeAgentError,
} from "./errors";
export type { AgentErrorCodeType, SerializedAgentError } from "./errors";

// Validation
export {
  queryOptionsSchema,
  queryRequestSchema,
  resumeSessionRequestSchema,
  destroySessionRequestSchema,
  // Session Persistence Schemas
  persistedSessionSchema,
  persistedMessageSchema,
  storageMetadataSchema,
  sessionStorageSchemaSchema,
  sessionPersistenceConfigSchema,
} from "./validation";
export type {
  QueryOptionsInput,
  QueryOptionsOutput,
  QueryRequestInput,
  QueryRequestOutput,
  ResumeSessionRequestInput,
  ResumeSessionRequestOutput,
  DestroySessionRequestInput,
  DestroySessionRequestOutput,
  // Session Persistence Types
  PersistedSessionInput,
  PersistedSessionOutput,
  PersistedMessageInput,
  PersistedMessageOutput,
  StorageMetadataInput,
  StorageMetadataOutput,
  SessionStorageSchemaInput,
  SessionStorageSchemaOutput,
  SessionPersistenceConfigInput,
  SessionPersistenceConfigOutput,
} from "./validation";

// Session Manager
export { SessionManager } from "./session-manager";

// Agent Client
export { AgentClient } from "./agent-client";
