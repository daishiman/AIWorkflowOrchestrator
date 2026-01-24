/**
 * Conversation Types
 *
 * Type definitions for conversation history persistence.
 *
 * @module @repo/desktop/shared/types/conversation
 */

/**
 * 会話サマリー（一覧表示用の軽量データ）
 */
export interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessagePreview: string | null;
  isFavorite: boolean;
  isPinned: boolean;
}

/**
 * 会話詳細（メッセージ含む完全データ）
 */
export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  isFavorite: boolean;
  isPinned: boolean;
  pinOrder: number | null;
  lastMessagePreview: string | null;
  metadata: Record<string, unknown>;
  messages: Message[];
}

/**
 * メッセージ
 */
export interface Message {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  messageIndex: number;
  timestamp: string;
  llmProvider?: string;
  llmModel?: string;
  llmMetadata?: Record<string, unknown>;
  systemPrompt?: string;
  attachments: unknown[];
  metadata: Record<string, unknown>;
}

/**
 * 会話一覧取得オプション
 */
export interface ListConversationsOptions {
  limit?: number; // デフォルト: 50
  offset?: number; // デフォルト: 0
  includeDeleted?: boolean; // デフォルト: false
}

/**
 * 会話作成入力
 */
export interface CreateConversationInput {
  userId: string;
  title: string;
  firstMessage?: {
    content: string;
    role: "user";
    systemPrompt?: string;
    llmProvider?: string;
    llmModel?: string;
  };
}

/**
 * 会話更新入力
 */
export interface UpdateConversationInput {
  title?: string;
  isFavorite?: boolean;
  isPinned?: boolean;
  pinOrder?: number | null;
  metadata?: Record<string, unknown>;
}

/**
 * メッセージ作成入力
 */
export interface CreateMessageInput {
  role: "user" | "assistant";
  content: string;
  llmProvider?: string;
  llmModel?: string;
  llmMetadata?: Record<string, unknown>;
  systemPrompt?: string;
}

// ===== IPC Types =====

/**
 * IPC成功レスポンス
 */
export interface ConversationIPCSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * IPCエラーレスポンス
 */
export interface ConversationIPCErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/**
 * IPCレスポンス（Union型）
 */
export type ConversationIPCResponse<T> =
  | ConversationIPCSuccessResponse<T>
  | ConversationIPCErrorResponse;

/**
 * conversation:list リクエスト
 */
export interface ConversationListRequest {
  userId: string;
  limit?: number;
  offset?: number;
  includeDeleted?: boolean;
}

/**
 * conversation:get リクエスト
 */
export interface ConversationGetRequest {
  id: string;
}

/**
 * conversation:create リクエスト
 */
export interface ConversationCreateRequest {
  userId: string;
  title: string;
  firstMessage?: {
    content: string;
    role: "user";
    systemPrompt?: string;
    llmProvider?: string;
    llmModel?: string;
  };
}

/**
 * conversation:update リクエスト
 */
export interface ConversationUpdateRequest {
  id: string;
  data: UpdateConversationInput;
}

/**
 * conversation:delete リクエスト
 */
export interface ConversationDeleteRequest {
  id: string;
}

/**
 * conversation:addMessage リクエスト
 */
export interface ConversationAddMessageRequest {
  sessionId: string;
  message: CreateMessageInput;
}

/**
 * conversation:search リクエスト
 */
export interface ConversationSearchRequest {
  userId: string;
  query: string;
}

// Response types
export type ConversationListResponse = ConversationIPCResponse<
  ConversationSummary[]
>;
export type ConversationGetResponse =
  ConversationIPCResponse<Conversation | null>;
export type ConversationCreateResponse = ConversationIPCResponse<Conversation>;
export type ConversationUpdateResponse = ConversationIPCResponse<Conversation>;
export type ConversationDeleteResponse = ConversationIPCResponse<{
  deleted: boolean;
}>;
export type ConversationAddMessageResponse = ConversationIPCResponse<Message>;
export type ConversationSearchResponse = ConversationIPCResponse<
  ConversationSummary[]
>;

/**
 * Conversation API for preload
 */
export interface ConversationAPI {
  list: (request: ConversationListRequest) => Promise<ConversationListResponse>;
  get: (request: ConversationGetRequest) => Promise<ConversationGetResponse>;
  create: (
    request: ConversationCreateRequest,
  ) => Promise<ConversationCreateResponse>;
  update: (
    request: ConversationUpdateRequest,
  ) => Promise<ConversationUpdateResponse>;
  delete: (
    request: ConversationDeleteRequest,
  ) => Promise<ConversationDeleteResponse>;
  addMessage: (
    request: ConversationAddMessageRequest,
  ) => Promise<ConversationAddMessageResponse>;
  search: (
    request: ConversationSearchRequest,
  ) => Promise<ConversationSearchResponse>;
}
