/**
 * Conversation Repository
 *
 * Repository for managing conversation history persistence with SQLite.
 *
 * @module @repo/desktop/main/repositories/conversationRepository
 */
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import type {
  Conversation,
  ConversationSummary,
  Message,
  ListConversationsOptions,
  CreateConversationInput,
  UpdateConversationInput,
  CreateMessageInput,
} from "../../shared/types/conversation";

/**
 * Title validation constants
 */
const TITLE_MIN_LENGTH = 3;
const TITLE_MAX_LENGTH = 100;

/**
 * Validates a title string
 */
function validateTitle(title: string): void {
  if (!title || title.length < TITLE_MIN_LENGTH) {
    throw new Error(
      `Title must be at least ${TITLE_MIN_LENGTH} characters long`,
    );
  }
  if (title.length > TITLE_MAX_LENGTH) {
    throw new Error(
      `Title must be at most ${TITLE_MAX_LENGTH} characters long`,
    );
  }
}

/**
 * ConversationRepository handles conversation history persistence.
 */
export class ConversationRepository {
  constructor(private db: Database.Database) {}

  /**
   * 会話一覧を取得（軽量サマリー）
   * @param userId ユーザーID
   * @param options 取得オプション
   * @returns 会話サマリーの配列
   */
  listConversations(
    userId: string,
    options?: ListConversationsOptions,
  ): ConversationSummary[] {
    const { limit = 50, offset = 0, includeDeleted = false } = options ?? {};

    // Handle limit=0 case
    if (limit === 0) {
      return [];
    }

    const stmt = this.db.prepare(`
      SELECT
        id, title, created_at, updated_at, message_count,
        last_message_preview, is_favorite, is_pinned
      FROM chat_sessions
      WHERE user_id = ? ${includeDeleted ? "" : "AND deleted_at IS NULL"}
      ORDER BY
        is_pinned DESC,
        CASE WHEN pin_order IS NULL THEN 1 ELSE 0 END,
        pin_order ASC,
        updated_at DESC
      LIMIT ? OFFSET ?
    `);

    const rows = stmt.all(userId, limit, offset) as Array<{
      id: string;
      title: string;
      created_at: string;
      updated_at: string;
      message_count: number;
      last_message_preview: string | null;
      is_favorite: number;
      is_pinned: number;
    }>;

    return rows.map((row) => this.mapToConversationSummary(row));
  }

  /**
   * 会話詳細を取得（メッセージ含む）
   * @param id 会話ID
   * @returns 会話詳細（存在しない場合はnull）
   */
  getConversation(id: string): Conversation | null {
    if (!id) {
      return null;
    }

    const sessionStmt = this.db.prepare(`
      SELECT * FROM chat_sessions
      WHERE id = ? AND deleted_at IS NULL
    `);
    const session = sessionStmt.get(id) as
      | {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
          message_count: number;
          is_favorite: number;
          is_pinned: number;
          pin_order: number | null;
          last_message_preview: string | null;
          metadata: string;
        }
      | undefined;

    if (!session) return null;

    const messagesStmt = this.db.prepare(`
      SELECT * FROM chat_messages
      WHERE session_id = ?
      ORDER BY message_index ASC
    `);
    const messages = messagesStmt.all(id) as Array<{
      id: string;
      session_id: string;
      role: string;
      content: string;
      message_index: number;
      timestamp: string;
      llm_provider: string | null;
      llm_model: string | null;
      llm_metadata: string | null;
      attachments: string;
      system_prompt: string | null;
      metadata: string;
    }>;

    return this.mapToConversation(session, messages);
  }

  /**
   * 会話を作成
   * @param input 作成データ
   * @returns 作成された会話
   */
  createConversation(input: CreateConversationInput): Conversation {
    validateTitle(input.title);

    const id = uuidv4();
    const now = new Date().toISOString();

    const transaction = this.db.transaction(() => {
      // セッション作成
      const insertSession = this.db.prepare(`
        INSERT INTO chat_sessions (
          id, user_id, title, created_at, updated_at,
          message_count, is_favorite, is_pinned,
          last_message_preview, metadata
        ) VALUES (?, ?, ?, ?, ?, 0, 0, 0, NULL, '{}')
      `);
      insertSession.run(id, input.userId, input.title, now, now);

      // 最初のメッセージがある場合は追加
      if (input.firstMessage) {
        this.addMessageInternal(id, input.firstMessage, 0, now);
      }

      return this.getConversation(id)!;
    });

    return transaction();
  }

  /**
   * 会話を更新
   * @param id 会話ID
   * @param input 更新データ
   * @returns 更新された会話
   */
  updateConversation(id: string, input: UpdateConversationInput): Conversation {
    // Check if conversation exists first
    const existing = this.getConversation(id);
    if (!existing) {
      throw new Error(`Conversation not found: ${id}`);
    }

    if (input.title !== undefined) {
      validateTitle(input.title);
    }

    const now = new Date().toISOString();
    const sets: string[] = ["updated_at = ?"];
    const values: unknown[] = [now];

    if (input.title !== undefined) {
      sets.push("title = ?");
      values.push(input.title);
    }
    if (input.isFavorite !== undefined) {
      sets.push("is_favorite = ?");
      values.push(input.isFavorite ? 1 : 0);
    }
    if (input.isPinned !== undefined) {
      sets.push("is_pinned = ?");
      values.push(input.isPinned ? 1 : 0);
    }
    if (input.pinOrder !== undefined) {
      sets.push("pin_order = ?");
      values.push(input.pinOrder);
    }
    if (input.metadata !== undefined) {
      sets.push("metadata = ?");
      values.push(JSON.stringify(input.metadata));
    }

    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE chat_sessions SET ${sets.join(", ")} WHERE id = ?
    `);
    stmt.run(...values);

    const result = this.getConversation(id);
    if (!result) throw new Error("Conversation not found after update");
    return result;
  }

  /**
   * 会話を削除（ソフトデリート）
   * @param id 会話ID
   */
  deleteConversation(id: string): void {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      UPDATE chat_sessions SET deleted_at = ? WHERE id = ?
    `);
    stmt.run(now, id);
  }

  /**
   * メッセージを追加
   * @param sessionId 会話ID
   * @param input メッセージデータ
   * @returns 作成されたメッセージ
   */
  addMessage(sessionId: string, input: CreateMessageInput): Message {
    const now = new Date().toISOString();

    const transaction = this.db.transaction(() => {
      // 現在のメッセージ数を取得
      const countStmt = this.db.prepare(`
        SELECT message_count FROM chat_sessions WHERE id = ?
      `);
      const session = countStmt.get(sessionId) as
        | { message_count: number }
        | undefined;

      if (!session) throw new Error("Session not found");

      const messageIndex = session.message_count;
      const message = this.addMessageInternal(
        sessionId,
        input,
        messageIndex,
        now,
      );

      return message;
    });

    return transaction();
  }

  /**
   * 会話を検索
   * @param userId ユーザーID
   * @param query 検索クエリ
   * @returns マッチした会話サマリー
   */
  searchConversations(userId: string, query: string): ConversationSummary[] {
    // Empty query returns empty results
    if (!query || query.trim() === "") {
      return [];
    }

    // Escape special LIKE characters
    const escapedQuery = query.replace(/[%_]/g, "\\$&");

    const stmt = this.db.prepare(`
      SELECT
        id, title, created_at, updated_at, message_count,
        last_message_preview, is_favorite, is_pinned
      FROM chat_sessions
      WHERE user_id = ? AND deleted_at IS NULL AND title LIKE ? ESCAPE '\\'
      ORDER BY updated_at DESC
      LIMIT 50
    `);

    const rows = stmt.all(userId, `%${escapedQuery}%`) as Array<{
      id: string;
      title: string;
      created_at: string;
      updated_at: string;
      message_count: number;
      last_message_preview: string | null;
      is_favorite: number;
      is_pinned: number;
    }>;

    return rows.map((row) => this.mapToConversationSummary(row));
  }

  // Private methods

  private addMessageInternal(
    sessionId: string,
    input: CreateMessageInput,
    messageIndex: number,
    timestamp: string,
  ): Message {
    const id = uuidv4();

    const insertMessage = this.db.prepare(`
      INSERT INTO chat_messages (
        id, session_id, role, content, message_index,
        timestamp, llm_provider, llm_model, llm_metadata,
        attachments, system_prompt, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, '{}')
    `);
    insertMessage.run(
      id,
      sessionId,
      input.role,
      input.content,
      messageIndex,
      timestamp,
      input.llmProvider ?? null,
      input.llmModel ?? null,
      input.llmMetadata ? JSON.stringify(input.llmMetadata) : null,
      input.systemPrompt ?? null,
    );

    // セッション更新
    const preview = input.content.substring(0, 50);
    const updateSession = this.db.prepare(`
      UPDATE chat_sessions SET
        message_count = message_count + 1,
        updated_at = ?,
        last_message_preview = ?
      WHERE id = ?
    `);
    updateSession.run(timestamp, preview, sessionId);

    return {
      id,
      sessionId,
      role: input.role,
      content: input.content,
      messageIndex,
      timestamp,
      llmProvider: input.llmProvider,
      llmModel: input.llmModel,
      llmMetadata: input.llmMetadata,
      systemPrompt: input.systemPrompt,
      attachments: [],
      metadata: {},
    };
  }

  private mapToConversationSummary(row: {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
    message_count: number;
    last_message_preview: string | null;
    is_favorite: number;
    is_pinned: number;
  }): ConversationSummary {
    return {
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      messageCount: row.message_count,
      lastMessagePreview: row.last_message_preview,
      isFavorite: Boolean(row.is_favorite),
      isPinned: Boolean(row.is_pinned),
    };
  }

  private mapToConversation(
    session: {
      id: string;
      user_id: string;
      title: string;
      created_at: string;
      updated_at: string;
      message_count: number;
      is_favorite: number;
      is_pinned: number;
      pin_order: number | null;
      last_message_preview: string | null;
      metadata: string;
    },
    messages: Array<{
      id: string;
      session_id: string;
      role: string;
      content: string;
      message_index: number;
      timestamp: string;
      llm_provider: string | null;
      llm_model: string | null;
      llm_metadata: string | null;
      attachments: string;
      system_prompt: string | null;
      metadata: string;
    }>,
  ): Conversation {
    return {
      id: session.id,
      userId: session.user_id,
      title: session.title,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      messageCount: session.message_count,
      isFavorite: Boolean(session.is_favorite),
      isPinned: Boolean(session.is_pinned),
      pinOrder: session.pin_order,
      lastMessagePreview: session.last_message_preview,
      metadata: JSON.parse(session.metadata || "{}"),
      messages: messages.map((m) => ({
        id: m.id,
        sessionId: m.session_id,
        role: m.role as "user" | "assistant",
        content: m.content,
        messageIndex: m.message_index,
        timestamp: m.timestamp,
        llmProvider: m.llm_provider ?? undefined,
        llmModel: m.llm_model ?? undefined,
        llmMetadata: m.llm_metadata ? JSON.parse(m.llm_metadata) : undefined,
        systemPrompt: m.system_prompt ?? undefined,
        attachments: JSON.parse(m.attachments || "[]"),
        metadata: JSON.parse(m.metadata || "{}"),
      })),
    };
  }
}
