/**
 * Drizzle ORMを使用したチャットメッセージリポジトリ実装
 *
 * IChatMessageRepositoryインターフェースの具体実装。
 * SQLiteデータベースへのCRUD操作をDrizzle ORMで実行する。
 *
 * @module features/chat-history/infrastructure/persistence/DrizzleChatMessageRepository
 */

import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { IChatMessageRepository } from "../../domain/repositories/IChatMessageRepository.js";
import type { ChatMessage } from "../../domain/entities/ChatMessage.js";
import type { ChatMessageId } from "../../domain/value-objects/ChatMessageId.js";
import type { ChatSessionId } from "../../domain/value-objects/ChatSessionId.js";
import {
  chatMessages,
  chatMessagesRelations,
} from "../../../../db/schema/chat-history.js";
import { ChatMessageMapper } from "./mappers/ChatMessageMapper.js";
import { eq, desc, asc, count } from "drizzle-orm";
import { DatabaseError } from "../../../../core/errors/InfrastructureError.js";

/**
 * Drizzle DB型 - better-sqlite3とlibsql両対応
 */
type DrizzleDB = BetterSQLite3Database<{
  chatMessages: typeof chatMessages;
  chatMessagesRelations: typeof chatMessagesRelations;
}>;

/**
 * Drizzle ORMを使用したチャットメッセージリポジトリ実装
 */
export class DrizzleChatMessageRepository implements IChatMessageRepository {
  constructor(private readonly db: DrizzleDB) {}

  /**
   * IDでメッセージを取得する
   *
   * @param id メッセージID
   * @returns メッセージ（存在しない場合はnull）
   */
  async findById(id: ChatMessageId): Promise<ChatMessage | null> {
    try {
      const record = await this.db.query.chatMessages.findFirst({
        where: eq(chatMessages.id, id.value),
      });

      if (!record) {
        return null;
      }

      const result = ChatMessageMapper.toDomain(record);
      if (!result.ok) {
        throw new DatabaseError(`マッピングエラー: ${result.error.message}`);
      }
      return result.value;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError("メッセージの取得に失敗しました", error as Error);
    }
  }

  /**
   * セッションIDでメッセージ一覧を取得する
   *
   * @param sessionId セッションID
   * @param limit 取得件数
   * @param offset オフセット
   * @returns メッセージ一覧（messageIndex順）
   */
  async findBySessionId(
    sessionId: ChatSessionId,
    limit?: number,
    offset?: number,
  ): Promise<ChatMessage[]> {
    try {
      // limit=0の場合は空配列を返す
      if (limit === 0) {
        return [];
      }

      const records = await this.db.query.chatMessages.findMany({
        where: eq(chatMessages.sessionId, sessionId.value),
        limit,
        offset,
        orderBy: [asc(chatMessages.messageIndex)],
      });

      return records
        .map((record) => ChatMessageMapper.toDomain(record))
        .filter((result) => result.ok)
        .map((result) => result.value);
    } catch (error) {
      throw new DatabaseError(
        "メッセージ一覧の取得に失敗しました",
        error as Error,
      );
    }
  }

  /**
   * セッション内の最新メッセージを取得する
   *
   * @param sessionId セッションID
   * @returns 最新メッセージ（存在しない場合はnull）
   */
  async findLatestBySessionId(
    sessionId: ChatSessionId,
  ): Promise<ChatMessage | null> {
    try {
      const record = await this.db.query.chatMessages.findFirst({
        where: eq(chatMessages.sessionId, sessionId.value),
        orderBy: [desc(chatMessages.messageIndex)],
      });

      if (!record) {
        return null;
      }

      const result = ChatMessageMapper.toDomain(record);
      if (!result.ok) {
        throw new DatabaseError(`マッピングエラー: ${result.error.message}`);
      }
      return result.value;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError(
        "最新メッセージの取得に失敗しました",
        error as Error,
      );
    }
  }

  /**
   * セッション内のメッセージ数を取得する
   *
   * @param sessionId セッションID
   * @returns メッセージ数
   */
  async countBySessionId(sessionId: ChatSessionId): Promise<number> {
    try {
      const result = await this.db
        .select({ count: count() })
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId.value));

      return result[0]?.count ?? 0;
    } catch (error) {
      throw new DatabaseError(
        "メッセージ数のカウントに失敗しました",
        error as Error,
      );
    }
  }

  /**
   * メッセージを保存する（作成または更新）
   *
   * @param message メッセージ
   */
  async save(message: ChatMessage): Promise<void> {
    try {
      const record = ChatMessageMapper.toPersistence(message);

      await this.db
        .insert(chatMessages)
        .values({
          id: record.id,
          sessionId: record.sessionId,
          role: record.role,
          content: record.content,
          messageIndex: record.messageIndex,
          timestamp: record.timestamp,
          llmProvider: record.llmProvider,
          llmModel: record.llmModel,
          llmMetadata: record.llmMetadata,
        })
        .onConflictDoUpdate({
          target: chatMessages.id,
          set: {
            sessionId: record.sessionId,
            role: record.role,
            content: record.content,
            messageIndex: record.messageIndex,
            timestamp: record.timestamp,
            llmProvider: record.llmProvider,
            llmModel: record.llmModel,
            llmMetadata: record.llmMetadata,
          },
        });
    } catch (error) {
      throw new DatabaseError("メッセージの保存に失敗しました", error as Error);
    }
  }

  /**
   * 複数のメッセージを一括保存する
   *
   * @param messages メッセージ配列
   */
  async saveMany(messages: ChatMessage[]): Promise<void> {
    if (messages.length === 0) {
      return;
    }

    try {
      const records = messages.map((message) =>
        ChatMessageMapper.toPersistence(message),
      );

      // 順次挿入（better-sqlite3は同期ドライバーのため、各操作は即座に実行される）
      for (const record of records) {
        await this.db
          .insert(chatMessages)
          .values({
            id: record.id,
            sessionId: record.sessionId,
            role: record.role,
            content: record.content,
            messageIndex: record.messageIndex,
            timestamp: record.timestamp,
            llmProvider: record.llmProvider,
            llmModel: record.llmModel,
            llmMetadata: record.llmMetadata,
          })
          .onConflictDoUpdate({
            target: chatMessages.id,
            set: {
              sessionId: record.sessionId,
              role: record.role,
              content: record.content,
              messageIndex: record.messageIndex,
              timestamp: record.timestamp,
              llmProvider: record.llmProvider,
              llmModel: record.llmModel,
              llmMetadata: record.llmMetadata,
            },
          });
      }
    } catch (error) {
      throw new DatabaseError(
        "メッセージの一括保存に失敗しました",
        error as Error,
      );
    }
  }

  /**
   * メッセージを削除する
   *
   * @param id メッセージID
   */
  async delete(id: ChatMessageId): Promise<void> {
    try {
      await this.db.delete(chatMessages).where(eq(chatMessages.id, id.value));
    } catch (error) {
      throw new DatabaseError("メッセージの削除に失敗しました", error as Error);
    }
  }

  /**
   * セッションの全メッセージを削除する
   *
   * @param sessionId セッションID
   */
  async deleteBySessionId(sessionId: ChatSessionId): Promise<void> {
    try {
      await this.db
        .delete(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId.value));
    } catch (error) {
      throw new DatabaseError(
        "セッションメッセージの削除に失敗しました",
        error as Error,
      );
    }
  }
}
