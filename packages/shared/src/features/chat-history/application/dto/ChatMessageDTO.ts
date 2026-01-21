/**
 * LLMメタデータDTO
 */
export interface LLMMetadataDTO {
  /** LLMプロバイダー */
  provider: string;
  /** LLMモデル */
  model: string;
  /** トークン使用量 */
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  /** レスポンス時間 (ms) */
  responseTime?: number;
  /** Temperature設定 */
  temperature?: number;
  /** 最大トークン数 */
  maxTokens?: number;
  /** 終了理由 */
  finishReason?: string;
}

/**
 * チャットメッセージDTO
 * Application層とPresentation層間のデータ転送用
 */
export interface ChatMessageDTO {
  /** メッセージID (UUID) */
  id: string;
  /** セッションID */
  sessionId: string;
  /** メッセージロール */
  role: "user" | "assistant";
  /** メッセージ内容 */
  content: string;
  /** メッセージインデックス */
  messageIndex: number;
  /** LLMメタデータ (assistantの場合のみ) */
  llmMetadata: LLMMetadataDTO | null;
  /** 作成日時 (ISO 8601) */
  createdAt: string;
}

/**
 * ユーザーメッセージ追加入力DTO
 */
export interface AddUserMessageInput {
  sessionId: string;
  content: string;
}

/**
 * ユーザーメッセージ追加出力DTO
 */
export interface AddUserMessageOutput {
  message: ChatMessageDTO;
  updatedSession: {
    lastMessagePreview: string;
    messageCount: number;
    updatedAt: string;
  };
}

/**
 * アシスタントメッセージ追加入力DTO
 */
export interface AddAssistantMessageInput {
  sessionId: string;
  content: string;
  llmModel: string;
  llmProvider: string;
  llmMetadata?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    responseTime?: number;
    temperature?: number;
    maxTokens?: number;
    finishReason?: string;
  };
}

/**
 * アシスタントメッセージ追加出力DTO
 */
export interface AddAssistantMessageOutput {
  message: ChatMessageDTO;
  updatedSession: {
    lastMessagePreview: string;
    messageCount: number;
    updatedAt: string;
  };
}

/**
 * メッセージ取得入力DTO
 */
export interface GetMessagesInput {
  sessionId: string;
  limit?: number;
  offset?: number;
}

/**
 * メッセージ取得出力DTO
 */
export interface GetMessagesOutput {
  messages: ChatMessageDTO[];
  total: number;
}
