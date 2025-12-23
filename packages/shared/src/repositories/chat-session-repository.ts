/**
 * チャットセッションリポジトリ
 *
 * @see docs/30-workflows/chat-history-persistence/metadata-specification.md
 */

import { sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type Database from "better-sqlite3";
import type {
  ChatSession,
  ChatSessionSearchQuery,
  UpdateChatSession,
} from "../types/chat-session.js";

/**
 * チャットセッションリポジトリ
 *
 * チャットセッションのCRUD操作を提供する。
 */
export class ChatSessionRepository {
  private sqlite: Database.Database;

  constructor(private db: BetterSQLite3Database) {
    // Drizzle ORMインスタンスから生のbetter-sqlite3インスタンスを取得
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.sqlite = (db as any).$client as Database.Database;
  }

  /**
   * セッションを保存する
   *
   * @param session 保存するセッション
   * @throws タイトルが空の場合は自動生成
   * @throws ピン留めセッションが10件を超える場合はエラー
   */
  async save(session: ChatSession): Promise<void> {
    // タイトルが空の場合は自動生成（BR-SESSION-001）
    let title = session.title;
    if (!title || title.trim() === "") {
      const now = new Date();
      const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      title = `新しいチャット ${formatted}`;
    }

    // ピン留め上限チェック（BR-SESSION-002）
    if (session.isPinned) {
      const pinnedCount = await this.countPinned(session.userId);
      if (pinnedCount >= 10) {
        throw new Error("ピン留めは最大10件までです");
      }
    }

    this.db.run(
      sql`
      INSERT INTO chat_sessions (
        id, user_id, title, created_at, updated_at,
        message_count, is_favorite, is_pinned, pin_order,
        last_message_preview, metadata, deleted_at
      ) VALUES (
        ${session.id},
        ${session.userId},
        ${title},
        ${session.createdAt},
        ${session.updatedAt},
        ${session.messageCount},
        ${session.isFavorite ? 1 : 0},
        ${session.isPinned ? 1 : 0},
        ${session.pinOrder},
        ${session.lastMessagePreview},
        ${JSON.stringify(session.metadata)},
        ${session.deletedAt}
      )
    `,
    );
  }

  /**
   * IDでセッションを取得する
   *
   * @param id セッションID
   * @returns セッション（存在しない場合はnull）
   */
  async findById(id: string): Promise<ChatSession | null> {
    const row = this.db.get(sql`
      SELECT * FROM chat_sessions
      WHERE id = ${id} AND deleted_at IS NULL
    `) as Record<string, unknown> | undefined;

    if (!row) {
      return null;
    }

    return this.mapRowToSession(row);
  }

  /**
   * ユーザーIDで全セッションを取得する
   *
   * @param userId ユーザーID
   * @returns セッション一覧（作成日時の降順）
   */
  async findByUserId(userId: string): Promise<ChatSession[]> {
    const rows = this.db.all(sql`
      SELECT * FROM chat_sessions
      WHERE user_id = ${userId} AND deleted_at IS NULL
      ORDER BY created_at DESC
    `) as Record<string, unknown>[];

    return rows.map((row) => this.mapRowToSession(row));
  }

  /**
   * ピン留めセッションを取得する
   *
   * @param userId ユーザーID
   * @returns ピン留めセッション一覧（pin_orderの昇順）
   */
  async findPinned(userId: string): Promise<ChatSession[]> {
    const rows = this.db.all(sql`
      SELECT * FROM chat_sessions
      WHERE user_id = ${userId} AND is_pinned = 1 AND deleted_at IS NULL
      ORDER BY pin_order ASC
    `) as Record<string, unknown>[];

    return rows.map((row) => this.mapRowToSession(row));
  }

  /**
   * セッションを更新する
   *
   * @param id セッションID
   * @param data 更新データ
   * @returns 更新成功の場合true
   */
  async update(id: string, data: UpdateChatSession): Promise<boolean> {
    const sets: string[] = [];
    const values: unknown[] = [];

    if (data.title !== undefined) {
      sets.push("title = ?");
      values.push(data.title);
    }
    if (data.updatedAt !== undefined) {
      sets.push("updated_at = ?");
      values.push(data.updatedAt);
    }
    if (data.messageCount !== undefined) {
      sets.push("message_count = ?");
      values.push(data.messageCount);
    }
    if (data.isFavorite !== undefined) {
      sets.push("is_favorite = ?");
      values.push(data.isFavorite ? 1 : 0);
    }
    if (data.isPinned !== undefined) {
      sets.push("is_pinned = ?");
      values.push(data.isPinned ? 1 : 0);
    }
    if (data.pinOrder !== undefined) {
      sets.push("pin_order = ?");
      values.push(data.pinOrder);
    }
    if (data.lastMessagePreview !== undefined) {
      sets.push("last_message_preview = ?");
      values.push(data.lastMessagePreview);
    }
    if (data.metadata !== undefined) {
      sets.push("metadata = ?");
      values.push(JSON.stringify(data.metadata));
    }

    if (sets.length === 0) {
      return false;
    }

    values.push(id);

    const stmt = this.sqlite.prepare(`
      UPDATE chat_sessions
      SET ${sets.join(", ")}
      WHERE id = ? AND deleted_at IS NULL
    `);
    const result = stmt.run(...values);

    return result.changes > 0;
  }

  /**
   * セッションを論理削除する
   *
   * @param id セッションID
   * @returns 削除成功の場合true
   */
  async delete(id: string): Promise<boolean> {
    const deletedAt = new Date().toISOString();
    const result = this.db.run(sql`
      UPDATE chat_sessions
      SET deleted_at = ${deletedAt}
      WHERE id = ${id} AND deleted_at IS NULL
    `);

    return result.changes > 0;
  }

  /**
   * セッションを検索する
   *
   * @param query 検索クエリ
   * @returns 検索結果
   */
  async search(query: ChatSessionSearchQuery): Promise<ChatSession[]> {
    let sqlQuery = `
      SELECT s.* FROM chat_sessions s
    `;

    const conditions: string[] = ["s.deleted_at IS NULL", "s.user_id = ?"];
    const params: unknown[] = [query.userId];

    // FTS5を使用した全文検索
    if (query.query) {
      sqlQuery = `
        SELECT s.* FROM chat_sessions s
        JOIN chat_sessions_fts fts ON s.id = fts.id
      `;
      conditions.push("chat_sessions_fts MATCH ?");
      params.push(query.query);
    }

    if (query.isFavorite !== undefined) {
      conditions.push("s.is_favorite = ?");
      params.push(query.isFavorite ? 1 : 0);
    }

    if (query.isPinned !== undefined) {
      conditions.push("s.is_pinned = ?");
      params.push(query.isPinned ? 1 : 0);
    }

    sqlQuery += ` WHERE ${conditions.join(" AND ")}`;
    sqlQuery += " ORDER BY s.created_at DESC";

    if (query.limit !== undefined) {
      sqlQuery += " LIMIT ?";
      params.push(query.limit);
    }

    if (query.offset !== undefined) {
      sqlQuery += " OFFSET ?";
      params.push(query.offset);
    }

    const stmt = this.sqlite.prepare(sqlQuery);
    const rows = stmt.all(...params) as Record<string, unknown>[];

    return rows.map((row) => this.mapRowToSession(row));
  }

  /**
   * ユーザーのセッション数をカウントする
   *
   * @param userId ユーザーID
   * @returns セッション数
   */
  async count(userId: string): Promise<number> {
    const row = this.db.get(sql`
      SELECT COUNT(*) as count FROM chat_sessions
      WHERE user_id = ${userId} AND deleted_at IS NULL
    `) as { count: number };

    return row.count;
  }

  /**
   * セッションが存在するか確認する
   *
   * @param id セッションID
   * @returns 存在する場合true
   */
  async exists(id: string): Promise<boolean> {
    const row = this.db.get(sql`
      SELECT 1 FROM chat_sessions
      WHERE id = ${id} AND deleted_at IS NULL
      LIMIT 1
    `);

    return row !== undefined;
  }

  /**
   * ピン留めセッション数をカウントする
   */
  private async countPinned(userId: string): Promise<number> {
    const row = this.db.get(sql`
      SELECT COUNT(*) as count FROM chat_sessions
      WHERE user_id = ${userId} AND is_pinned = 1 AND deleted_at IS NULL
    `) as { count: number };

    return row.count;
  }

  /**
   * DBの行をChatSessionオブジェクトにマッピングする
   */
  private mapRowToSession(row: Record<string, unknown>): ChatSession {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      title: row.title as string,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      messageCount: row.message_count as number,
      isFavorite: (row.is_favorite as number) === 1,
      isPinned: (row.is_pinned as number) === 1,
      pinOrder: row.pin_order as number | null,
      lastMessagePreview: row.last_message_preview as string | null,
      metadata: JSON.parse((row.metadata as string) || "{}"),
      deletedAt: row.deleted_at as string | null,
    };
  }
}
