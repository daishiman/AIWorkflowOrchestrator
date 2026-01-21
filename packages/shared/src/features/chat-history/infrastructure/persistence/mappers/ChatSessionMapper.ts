/**
 * チャットセッションマッパー
 *
 * DBレコード ⇔ ドメインエンティティ ⇔ DTO の変換を行う。
 *
 * @module features/chat-history/infrastructure/persistence/mappers/ChatSessionMapper
 */

import { type Result, ok, err } from "../../../../../core/Result.js";
import { ChatSession } from "../../../domain/entities/ChatSession.js";
import type { ChatSessionDTO } from "../../../application/dto/ChatSessionDTO.js";
import { sessionToDTO } from "../../../application/dto/transformers.js";
import {
  DomainError,
  BusinessRuleError,
} from "../../../../../core/errors/DomainError.js";

/**
 * DBレコード型（Drizzle推論型相当）
 * NOTE: 日付はISO 8601文字列形式（DB schemaに合わせる）
 */
export interface ChatSessionRecord {
  id: string;
  userId: string;
  title: string;
  lastMessagePreview: string | null;
  messageCount: number;
  isFavorite: number; // SQLiteではboolean→integer
  isPinned: number;
  pinOrder: number | null;
  createdAt: string; // ISO 8601 string
  updatedAt: string;
}

/**
 * チャットセッションマッパー
 */
export class ChatSessionMapper {
  /**
   * DBレコードからドメインエンティティに変換
   *
   * @param record DBレコード
   * @returns 成功時: ChatSession, 失敗時: DomainError
   */
  static toDomain(record: ChatSessionRecord): Result<ChatSession, DomainError> {
    try {
      const session = ChatSession.reconstitute({
        id: record.id,
        userId: record.userId,
        title: record.title,
        lastMessagePreview: record.lastMessagePreview,
        messageCount: record.messageCount,
        isFavorite: record.isFavorite === 1,
        isPinned: record.isPinned === 1,
        pinOrder: record.pinOrder,
        createdAt: new Date(record.createdAt), // ISO 8601 string → Date
        updatedAt: new Date(record.updatedAt),
      });

      return ok(session);
    } catch (error) {
      return err(
        new BusinessRuleError(
          "MAPPING_ERROR",
          `セッションのマッピングに失敗しました: ${error instanceof Error ? error.message : "Unknown error"}`,
        ),
      );
    }
  }

  /**
   * ドメインエンティティからDBレコードに変換
   *
   * @param session ドメインエンティティ
   * @returns DBレコード
   */
  static toPersistence(session: ChatSession): ChatSessionRecord {
    return {
      id: session.id.value,
      userId: session.userId.value,
      title: session.title.value,
      lastMessagePreview: session.lastMessagePreview,
      messageCount: session.messageCount,
      isFavorite: session.isFavorite ? 1 : 0,
      isPinned: session.isPinned ? 1 : 0,
      pinOrder: session.pinOrder,
      createdAt: session.createdAt.toISOString(), // Date → ISO 8601 string
      updatedAt: session.updatedAt.toISOString(),
    };
  }

  /**
   * ドメインエンティティからDTOに変換
   *
   * @param session ドメインエンティティ
   * @returns ChatSessionDTO
   */
  static toDTO(session: ChatSession): ChatSessionDTO {
    return sessionToDTO(session);
  }
}
