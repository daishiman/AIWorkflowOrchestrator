/**
 * Drizzle ORMを使用したチャットセッションリポジトリ実装
 *
 * IChatSessionRepositoryインターフェースの具体実装。
 * SQLiteデータベースへのCRUD操作をDrizzle ORMで実行する。
 *
 * @module features/chat-history/infrastructure/persistence/DrizzleChatSessionRepository
 */

import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type {
  IChatSessionRepository,
  ChatSessionSearchCriteria,
} from "../../domain/repositories/IChatSessionRepository.js";
import type { ChatSession } from "../../domain/entities/ChatSession.js";
import type { ChatSessionId } from "../../domain/value-objects/ChatSessionId.js";
import type { UserId } from "../../domain/value-objects/UserId.js";
import {
  chatSessions,
  chatSessionsRelations,
} from "../../../../db/schema/chat-history.js";
import { ChatSessionMapper } from "./mappers/ChatSessionMapper.js";
import { eq, and, like, desc, asc, count, isNull } from "drizzle-orm";
import { DatabaseError } from "../../../../core/errors/InfrastructureError.js";

/**
 * Drizzle DB型 - better-sqlite3とlibsql両対応
 */
type DrizzleDB = BetterSQLite3Database<{
  chatSessions: typeof chatSessions;
  chatSessionsRelations: typeof chatSessionsRelations;
}>;

/**
 * Drizzle ORMを使用したチャットセッションリポジトリ実装
 */
export class DrizzleChatSessionRepository implements IChatSessionRepository {
  constructor(private readonly db: DrizzleDB) {}

  /**
   * IDでセッションを取得する
   *
   * @param id セッションID
   * @returns セッション（存在しない場合はnull）
   */
  async findById(id: ChatSessionId): Promise<ChatSession | null> {
    try {
      const record = await this.db.query.chatSessions.findFirst({
        where: and(
          eq(chatSessions.id, id.value),
          isNull(chatSessions.deletedAt),
        ),
      });

      if (!record) {
        return null;
      }

      const result = ChatSessionMapper.toDomain(record);
      if (!result.ok) {
        throw new DatabaseError(`マッピングエラー: ${result.error.message}`);
      }
      return result.value;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError("セッションの取得に失敗しました", error as Error);
    }
  }

  /**
   * ユーザーIDでセッション一覧を取得する
   *
   * @param userId ユーザーID
   * @param limit 取得件数
   * @param offset オフセット
   * @returns セッション一覧
   */
  async findByUserId(
    userId: UserId,
    limit: number = 20,
    offset: number = 0,
  ): Promise<ChatSession[]> {
    try {
      // limit=0の場合は空配列を返す
      if (limit === 0) {
        return [];
      }

      const records = await this.db.query.chatSessions.findMany({
        where: and(
          eq(chatSessions.userId, userId.value),
          isNull(chatSessions.deletedAt),
        ),
        limit,
        offset,
        orderBy: [desc(chatSessions.updatedAt)],
      });

      return records
        .map((record) => ChatSessionMapper.toDomain(record))
        .filter((result) => result.ok)
        .map((result) => result.value);
    } catch (error) {
      throw new DatabaseError(
        "セッション一覧の取得に失敗しました",
        error as Error,
      );
    }
  }

  /**
   * ピン留めセッション一覧を取得する
   *
   * @param userId ユーザーID
   * @returns ピン留めセッション一覧（pinOrder順）
   */
  async findPinned(userId: UserId): Promise<ChatSession[]> {
    try {
      const records = await this.db.query.chatSessions.findMany({
        where: and(
          eq(chatSessions.userId, userId.value),
          eq(chatSessions.isPinned, 1),
          isNull(chatSessions.deletedAt),
        ),
        orderBy: [asc(chatSessions.pinOrder)],
      });

      return records
        .map((record) => ChatSessionMapper.toDomain(record))
        .filter((result) => result.ok)
        .map((result) => result.value);
    } catch (error) {
      throw new DatabaseError(
        "ピン留めセッションの取得に失敗しました",
        error as Error,
      );
    }
  }

  /**
   * 検索条件でセッションを検索する
   *
   * @param criteria 検索条件
   * @returns マッチしたセッション一覧
   */
  async search(criteria: ChatSessionSearchCriteria): Promise<ChatSession[]> {
    try {
      const conditions: ReturnType<typeof eq>[] = [
        eq(chatSessions.userId, criteria.userId.value),
      ];

      // キーワード検索
      if (criteria.keyword) {
        conditions.push(like(chatSessions.title, `%${criteria.keyword}%`));
      }

      // お気に入りフィルター
      if (criteria.isFavorite !== undefined) {
        conditions.push(
          eq(chatSessions.isFavorite, criteria.isFavorite ? 1 : 0),
        );
      }

      // ピン留めフィルター
      if (criteria.isPinned !== undefined) {
        conditions.push(eq(chatSessions.isPinned, criteria.isPinned ? 1 : 0));
      }

      const records = await this.db.query.chatSessions.findMany({
        where: and(...conditions, isNull(chatSessions.deletedAt)),
        limit: criteria.limit ?? 20,
        offset: criteria.offset ?? 0,
        orderBy: [desc(chatSessions.updatedAt)],
      });

      return records
        .map((record) => ChatSessionMapper.toDomain(record))
        .filter((result) => result.ok)
        .map((result) => result.value);
    } catch (error) {
      throw new DatabaseError("セッション検索に失敗しました", error as Error);
    }
  }

  /**
   * セッションを保存する（作成または更新）
   *
   * @param session セッション
   */
  async save(session: ChatSession): Promise<void> {
    try {
      const record = ChatSessionMapper.toPersistence(session);

      await this.db
        .insert(chatSessions)
        .values({
          id: record.id,
          userId: record.userId,
          title: record.title,
          messageCount: record.messageCount,
          isFavorite: record.isFavorite,
          isPinned: record.isPinned,
          pinOrder: record.pinOrder,
          lastMessagePreview: record.lastMessagePreview,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        })
        .onConflictDoUpdate({
          target: chatSessions.id,
          set: {
            userId: record.userId,
            title: record.title,
            messageCount: record.messageCount,
            isFavorite: record.isFavorite,
            isPinned: record.isPinned,
            pinOrder: record.pinOrder,
            lastMessagePreview: record.lastMessagePreview,
            updatedAt: record.updatedAt,
          },
        });
    } catch (error) {
      throw new DatabaseError("セッションの保存に失敗しました", error as Error);
    }
  }

  /**
   * セッションを削除する
   *
   * @param id セッションID
   */
  async delete(id: ChatSessionId): Promise<void> {
    try {
      await this.db.delete(chatSessions).where(eq(chatSessions.id, id.value));
    } catch (error) {
      throw new DatabaseError("セッションの削除に失敗しました", error as Error);
    }
  }

  /**
   * セッションが存在するか確認する
   *
   * @param id セッションID
   * @returns 存在する場合true
   */
  async exists(id: ChatSessionId): Promise<boolean> {
    try {
      const record = await this.db.query.chatSessions.findFirst({
        where: and(
          eq(chatSessions.id, id.value),
          isNull(chatSessions.deletedAt),
        ),
        columns: { id: true },
      });

      return record !== undefined;
    } catch (error) {
      throw new DatabaseError(
        "セッション存在確認に失敗しました",
        error as Error,
      );
    }
  }

  /**
   * ピン留めセッション数をカウントする
   *
   * @param userId ユーザーID
   * @returns ピン留めセッション数
   */
  async countPinned(userId: UserId): Promise<number> {
    try {
      const result = await this.db
        .select({ count: count() })
        .from(chatSessions)
        .where(
          and(
            eq(chatSessions.userId, userId.value),
            eq(chatSessions.isPinned, 1),
            isNull(chatSessions.deletedAt),
          ),
        );

      return result[0]?.count ?? 0;
    } catch (error) {
      throw new DatabaseError(
        "ピン留め数のカウントに失敗しました",
        error as Error,
      );
    }
  }
}
