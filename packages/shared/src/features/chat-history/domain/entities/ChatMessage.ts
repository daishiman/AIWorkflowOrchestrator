/**
 * チャットメッセージ エンティティ
 *
 * セッション内の個別メッセージを表すドメインエンティティ。
 * ユーザーメッセージとアシスタントメッセージを区別する。
 *
 * @module features/chat-history/domain/entities/ChatMessage
 */

import { ChatMessageId } from "../value-objects/ChatMessageId.js";
import { ChatSessionId } from "../value-objects/ChatSessionId.js";
import { MessageContent } from "../value-objects/MessageContent.js";
import { MessageRole } from "../value-objects/MessageRole.js";
import { LLMMetadata } from "../value-objects/LLMMetadata.js";
import { type Result, ok, err } from "../../../../core/Result.js";
import { ChatMessageError } from "../errors/ChatMessageErrors.js";

/**
 * ユーザーメッセージ作成パラメータ
 */
export interface CreateUserMessageParams {
  sessionId: string;
  content: string;
  messageIndex: number;
}

/**
 * アシスタントメッセージ作成パラメータ
 */
export interface CreateAssistantMessageParams {
  sessionId: string;
  content: string;
  messageIndex: number;
  llmProvider: string;
  llmModel: string;
  llmMetadata?: {
    tokenUsage?: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
    };
    responseTime?: number;
    temperature?: number;
    maxTokens?: number;
  };
}

/**
 * メッセージ再構築パラメータ
 */
export interface ReconstituteMessageParams {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  messageIndex: number;
  timestamp: Date;
  llmProvider: string | null;
  llmModel: string | null;
  llmMetadata: Record<string, unknown> | null;
}

/**
 * チャットメッセージ エンティティ
 */
export class ChatMessage {
  private constructor(
    private readonly _id: ChatMessageId,
    private readonly _sessionId: ChatSessionId,
    private readonly _role: MessageRole,
    private readonly _content: MessageContent,
    private readonly _messageIndex: number,
    private readonly _timestamp: Date,
    private readonly _llmMetadata: LLMMetadata | null,
  ) {}

  // ========================================
  // Factory Methods
  // ========================================

  /**
   * ユーザーメッセージを作成する
   *
   * @param params 作成パラメータ
   * @returns 成功時: ChatMessage, 失敗時: ChatMessageError
   */
  static createUserMessage(
    params: CreateUserMessageParams,
  ): Result<ChatMessage, ChatMessageError> {
    const sessionIdResult = ChatSessionId.create(params.sessionId);
    if (!sessionIdResult.ok) {
      return err(
        new ChatMessageError(
          "INVALID_SESSION_ID",
          sessionIdResult.error.message,
        ),
      );
    }

    const contentResult = MessageContent.create(params.content);
    if (!contentResult.ok) {
      return err(
        new ChatMessageError("INVALID_CONTENT", contentResult.error.message),
      );
    }

    return ok(
      new ChatMessage(
        ChatMessageId.generate(),
        sessionIdResult.value,
        MessageRole.User,
        contentResult.value,
        params.messageIndex,
        new Date(),
        null, // ユーザーメッセージにはLLMメタデータなし
      ),
    );
  }

  /**
   * アシスタントメッセージを作成する
   *
   * @param params 作成パラメータ
   * @returns 成功時: ChatMessage, 失敗時: ChatMessageError
   */
  static createAssistantMessage(
    params: CreateAssistantMessageParams,
  ): Result<ChatMessage, ChatMessageError> {
    const sessionIdResult = ChatSessionId.create(params.sessionId);
    if (!sessionIdResult.ok) {
      return err(
        new ChatMessageError(
          "INVALID_SESSION_ID",
          sessionIdResult.error.message,
        ),
      );
    }

    const contentResult = MessageContent.create(params.content);
    if (!contentResult.ok) {
      return err(
        new ChatMessageError("INVALID_CONTENT", contentResult.error.message),
      );
    }

    // アシスタントメッセージにはLLMメタデータを含める
    const llmMetadataResult = LLMMetadata.create({
      provider: params.llmProvider,
      model: params.llmModel,
      tokenUsage: params.llmMetadata?.tokenUsage,
      responseTime: params.llmMetadata?.responseTime,
      temperature: params.llmMetadata?.temperature,
      maxTokens: params.llmMetadata?.maxTokens,
    });

    if (!llmMetadataResult.ok) {
      return err(
        new ChatMessageError(
          "INVALID_LLM_METADATA",
          llmMetadataResult.error.message,
        ),
      );
    }

    return ok(
      new ChatMessage(
        ChatMessageId.generate(),
        sessionIdResult.value,
        MessageRole.Assistant,
        contentResult.value,
        params.messageIndex,
        new Date(),
        llmMetadataResult.value,
      ),
    );
  }

  /**
   * 永続化されたデータからメッセージを再構築する
   *
   * @param params 再構築パラメータ
   * @returns ChatMessage
   */
  static reconstitute(params: ReconstituteMessageParams): ChatMessage {
    return new ChatMessage(
      ChatMessageId.fromString(params.id),
      ChatSessionId.fromString(params.sessionId),
      params.role === "user" ? MessageRole.User : MessageRole.Assistant,
      MessageContent.fromString(params.content),
      params.messageIndex,
      params.timestamp,
      params.llmMetadata && params.llmProvider && params.llmModel
        ? LLMMetadata.reconstitute(
            params.llmProvider,
            params.llmModel,
            params.llmMetadata,
          )
        : null,
    );
  }

  // ========================================
  // Getters
  // ========================================

  get id(): ChatMessageId {
    return this._id;
  }

  get sessionId(): ChatSessionId {
    return this._sessionId;
  }

  get role(): MessageRole {
    return this._role;
  }

  get content(): MessageContent {
    return this._content;
  }

  get messageIndex(): number {
    return this._messageIndex;
  }

  get timestamp(): Date {
    return this._timestamp;
  }

  /**
   * 作成日時 (timestampのエイリアス)
   */
  get createdAt(): Date {
    return this._timestamp;
  }

  get llmMetadata(): LLMMetadata | null {
    return this._llmMetadata;
  }

  /**
   * ユーザーメッセージかどうか
   */
  get isUserMessage(): boolean {
    return this._role.isUser;
  }

  /**
   * アシスタントメッセージかどうか
   */
  get isAssistantMessage(): boolean {
    return this._role.isAssistant;
  }
}
