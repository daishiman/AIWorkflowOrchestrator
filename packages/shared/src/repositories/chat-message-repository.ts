/**
 * チャットメッセージリポジトリ
 *
 * @see docs/30-workflows/chat-history-persistence/metadata-specification.md
 */

import { sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type Database from "better-sqlite3";
import type {
  ChatMessage,
  MessageRole,
  UpdateChatMessage,
  FindMessagesOptions,
} from "../types/chat-message.js";

/**
 * チャットメッセージリポジトリ
 *
 * チャットメッセージのCRUD操作を提供する。
 */
export class ChatMessageRepository {
  private sqlite: Database.Database;

  constructor(private db: BetterSQLite3Database) {
    // Drizzle ORMインスタンスから生のbetter-sqlite3インスタンスを取得
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.sqlite = (db as any).$client as Database.Database;
  }

  /**
   * メッセージを保存する
   *
   * @param message 保存するメッセージ
   * @throws role=assistantの場合、LLMメタデータが必須
   */
  async save(message: ChatMessage): Promise<void> {
    // role=assistantの場合、LLMメタデータ必須チェック（BR-MESSAGE-002）
    if (message.role === "assistant") {
      if (!message.llmProvider || !message.llmModel || !message.llmMetadata) {
        throw new Error("role=assistantの場合、LLMメタデータが必須です");
      }
    }

    // messageIndexが-1の場合は自動採番（BR-MESSAGE-001）
    let messageIndex = message.messageIndex;
    if (messageIndex < 0) {
      const maxIndex = await this.getMaxMessageIndex(message.sessionId);
      messageIndex = maxIndex + 1;
    }

    this.db.run(sql`
      INSERT INTO chat_messages (
        id, session_id, role, content, message_index, timestamp,
        llm_provider, llm_model, llm_metadata, attachments,
        system_prompt, metadata
      ) VALUES (
        ${message.id},
        ${message.sessionId},
        ${message.role},
        ${message.content},
        ${messageIndex},
        ${message.timestamp},
        ${message.llmProvider},
        ${message.llmModel},
        ${message.llmMetadata ? JSON.stringify(message.llmMetadata) : null},
        ${JSON.stringify(message.attachments)},
        ${message.systemPrompt},
        ${JSON.stringify(message.metadata)}
      )
    `);
  }

  /**
   * IDでメッセージを取得する
   *
   * @param id メッセージID
   * @returns メッセージ（存在しない場合はnull）
   */
  async findById(id: string): Promise<ChatMessage | null> {
    const row = this.db.get(sql`
      SELECT * FROM chat_messages WHERE id = ${id}
    `) as Record<string, unknown> | undefined;

    if (!row) {
      return null;
    }

    return this.mapRowToMessage(row);
  }

  /**
   * セッションIDで全メッセージを取得する
   *
   * @param sessionId セッションID
   * @param options 取得オプション
   * @returns メッセージ一覧（message_indexの昇順）
   */
  async findBySessionId(
    sessionId: string,
    options?: FindMessagesOptions,
  ): Promise<ChatMessage[]> {
    let sqlQuery = `
      SELECT * FROM chat_messages
      WHERE session_id = ?
      ORDER BY message_index ASC
    `;
    const params: unknown[] = [sessionId];

    if (options?.limit !== undefined) {
      sqlQuery += " LIMIT ?";
      params.push(options.limit);
    }

    if (options?.offset !== undefined) {
      sqlQuery += " OFFSET ?";
      params.push(options.offset);
    }

    const stmt = this.sqlite.prepare(sqlQuery);
    const rows = stmt.all(...params) as Record<string, unknown>[];

    return rows.map((row) => this.mapRowToMessage(row));
  }

  /**
   * ロールでフィルタしてメッセージを取得する
   *
   * @param sessionId セッションID
   * @param role ロール
   * @returns メッセージ一覧（message_indexの昇順）
   */
  async findByRole(
    sessionId: string,
    role: MessageRole,
  ): Promise<ChatMessage[]> {
    const rows = this.db.all(sql`
      SELECT * FROM chat_messages
      WHERE session_id = ${sessionId} AND role = ${role}
      ORDER BY message_index ASC
    `) as Record<string, unknown>[];

    return rows.map((row) => this.mapRowToMessage(row));
  }

  /**
   * メッセージを更新する
   *
   * @param id メッセージID
   * @param data 更新データ
   * @returns 更新成功の場合true
   */
  async update(id: string, data: UpdateChatMessage): Promise<boolean> {
    const sets: string[] = [];
    const values: unknown[] = [];

    if (data.content !== undefined) {
      sets.push("content = ?");
      values.push(data.content);
    }
    if (data.llmProvider !== undefined) {
      sets.push("llm_provider = ?");
      values.push(data.llmProvider);
    }
    if (data.llmModel !== undefined) {
      sets.push("llm_model = ?");
      values.push(data.llmModel);
    }
    if (data.llmMetadata !== undefined) {
      sets.push("llm_metadata = ?");
      values.push(data.llmMetadata ? JSON.stringify(data.llmMetadata) : null);
    }
    if (data.attachments !== undefined) {
      sets.push("attachments = ?");
      values.push(JSON.stringify(data.attachments));
    }
    if (data.systemPrompt !== undefined) {
      sets.push("system_prompt = ?");
      values.push(data.systemPrompt);
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
      UPDATE chat_messages
      SET ${sets.join(", ")}
      WHERE id = ?
    `);
    const result = stmt.run(...values);

    return result.changes > 0;
  }

  /**
   * メッセージを削除する
   *
   * @param id メッセージID
   * @returns 削除成功の場合true
   */
  async delete(id: string): Promise<boolean> {
    const result = this.db.run(sql`
      DELETE FROM chat_messages WHERE id = ${id}
    `);

    return result.changes > 0;
  }

  /**
   * セッション内のメッセージ数をカウントする
   *
   * @param sessionId セッションID
   * @returns メッセージ数
   */
  async count(sessionId: string): Promise<number> {
    const row = this.db.get(sql`
      SELECT COUNT(*) as count FROM chat_messages
      WHERE session_id = ${sessionId}
    `) as { count: number };

    return row.count;
  }

  /**
   * メッセージが存在するか確認する
   *
   * @param id メッセージID
   * @returns 存在する場合true
   */
  async exists(id: string): Promise<boolean> {
    const row = this.db.get(sql`
      SELECT 1 FROM chat_messages WHERE id = ${id} LIMIT 1
    `);

    return row !== undefined;
  }

  /**
   * セッション内の最大メッセージインデックスを取得する
   */
  private async getMaxMessageIndex(sessionId: string): Promise<number> {
    const row = this.db.get(sql`
      SELECT MAX(message_index) as max_index
      FROM chat_messages
      WHERE session_id = ${sessionId}
    `) as { max_index: number | null };

    return row.max_index ?? -1;
  }

  /**
   * DBの行をChatMessageオブジェクトにマッピングする
   */
  private mapRowToMessage(row: Record<string, unknown>): ChatMessage {
    return {
      id: row.id as string,
      sessionId: row.session_id as string,
      role: row.role as MessageRole,
      content: row.content as string,
      messageIndex: row.message_index as number,
      timestamp: row.timestamp as string,
      llmProvider: row.llm_provider as string | null,
      llmModel: row.llm_model as string | null,
      llmMetadata: row.llm_metadata
        ? JSON.parse(row.llm_metadata as string)
        : null,
      attachments: JSON.parse((row.attachments as string) || "[]"),
      systemPrompt: row.system_prompt as string | null,
      metadata: JSON.parse((row.metadata as string) || "{}"),
    };
  }
}
