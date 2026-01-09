/**
 * @file LLMスキーマエクスポート
 * @description 全LLM関連Zodスキーマと型のエクスポート
 * @feature chat-multi-llm-switching
 */

// プロバイダー
export {
  LLMProviderIdSchema,
  LLMModelSchema,
  LLMProviderSchema,
  LLMConfigSchema,
  type LLMProviderId,
  type LLMModel,
  type LLMProvider,
  type LLMConfig,
} from "./provider";

// メッセージ
export {
  MessageRoleSchema,
  LLMMessageSchema,
  type MessageRole,
  type LLMMessage,
} from "./message";

// リクエスト
export {
  LLMChatRequestSchema,
  type LLMChatRequest,
  type LLMChatRequestInput,
} from "./request";

// レスポンス
export {
  TokenUsageSchema,
  FinishReasonSchema,
  LLMResponseDataSchema,
  LLMChatResponseSchema,
  LLMStreamChunkSchema,
  type TokenUsage,
  type FinishReason,
  type LLMResponseData,
  type LLMChatResponse,
  type LLMStreamChunk,
  // Alias for StreamChunk (backward compatibility)
  type LLMStreamChunk as StreamChunk,
} from "./response";

// エラー
export {
  LLMErrorCodeSchema,
  LLMErrorSchema,
  type LLMErrorCode,
  type LLMError,
} from "./error";

// ヘルスチェック
export {
  ConnectionStatusSchema,
  HealthCheckResultSchema,
  type ConnectionStatus,
  type HealthCheckResult,
} from "./health";

// IPC
export { IPCChatRequestSchema, type IPCChatRequest } from "./ipc";

// バリデーター
export {
  validateChatRequest,
  validateChatResponse,
  validateIPCRequest,
  validateError,
  safeParseChatResponse,
} from "./validators";
