/**
 * DTO変換ユーティリティ
 *
 * ドメインエンティティからDTOへの変換を一元化する。
 * Clean Architecture準拠: Application層内で完結。
 *
 * @module features/chat-history/application/dto/transformers
 */

import type { ChatSession } from "../../domain/entities/ChatSession.js";
import type { ChatMessage } from "../../domain/entities/ChatMessage.js";
import type { ChatSessionDTO } from "./ChatSessionDTO.js";
import type { ChatMessageDTO } from "./ChatMessageDTO.js";

/**
 * ChatSessionエンティティをDTOに変換する
 *
 * @param session ドメインエンティティ
 * @returns ChatSessionDTO
 *
 * @example
 * const dto = sessionToDTO(session);
 */
export function sessionToDTO(session: ChatSession): ChatSessionDTO {
  return {
    id: session.id.value,
    userId: session.userId.value,
    title: session.title.value,
    lastMessagePreview: session.lastMessagePreview,
    messageCount: session.messageCount,
    isFavorite: session.isFavorite,
    isPinned: session.isPinned,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

/**
 * ChatMessageエンティティをDTOに変換する
 *
 * @param message ドメインエンティティ
 * @returns ChatMessageDTO
 *
 * @example
 * const dto = messageToDTO(message);
 */
export function messageToDTO(message: ChatMessage): ChatMessageDTO {
  return {
    id: message.id.value,
    sessionId: message.sessionId.value,
    role: message.role.value,
    content: message.content.value,
    messageIndex: message.messageIndex,
    llmMetadata: message.llmMetadata
      ? {
          provider: message.llmMetadata.provider,
          model: message.llmMetadata.model,
          // null → undefined変換（DTO型に合わせる）
          tokenUsage: message.llmMetadata.tokenUsage ?? undefined,
          responseTime: message.llmMetadata.responseTime ?? undefined,
          temperature: message.llmMetadata.temperature ?? undefined,
          maxTokens: message.llmMetadata.maxTokens ?? undefined,
        }
      : null,
    createdAt: message.createdAt.toISOString(),
  };
}
