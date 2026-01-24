# Repository設計書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| タスクID   | UT-LLM-HISTORY-001                   |
| 機能名     | llm-conversation-history-persistence |
| バージョン | 1.0.0                                |
| 作成日     | 2026-01-24                           |

---

## 概要

`ConversationRepository`は、会話履歴の永続化を担当するRepositoryクラス。Main Processで動作し、SQLite（better-sqlite3）を使用してデータアクセスを行う。

---

## 型定義

### エンティティ型

```typescript
// apps/desktop/src/main/repositories/types/conversation.ts

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
```

### 入力型

```typescript
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
```

---

## クラス設計

```typescript
// apps/desktop/src/main/repositories/conversationRepository.ts

import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";

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

    const stmt = this.db.prepare(`
      SELECT
        id, title, created_at, updated_at, message_count,
        last_message_preview, is_favorite, is_pinned
      FROM chat_sessions
      WHERE user_id = ? ${includeDeleted ? "" : "AND deleted_at IS NULL"}
      ORDER BY
        is_pinned DESC,
        pin_order ASC NULLS LAST,
        updated_at DESC
      LIMIT ? OFFSET ?
    `);

    const rows = stmt.all(userId, limit, offset);
    return rows.map(this.mapToConversationSummary);
  }

  /**
   * 会話詳細を取得（メッセージ含む）
   * @param id 会話ID
   * @returns 会話詳細（存在しない場合はnull）
   */
  getConversation(id: string): Conversation | null {
    const sessionStmt = this.db.prepare(`
      SELECT * FROM chat_sessions
      WHERE id = ? AND deleted_at IS NULL
    `);
    const session = sessionStmt.get(id);

    if (!session) return null;

    const messagesStmt = this.db.prepare(`
      SELECT * FROM chat_messages
      WHERE session_id = ?
      ORDER BY message_index ASC
    `);
    const messages = messagesStmt.all(id);

    return this.mapToConversation(session, messages);
  }

  /**
   * 会話を作成
   * @param input 作成データ
   * @returns 作成された会話
   */
  createConversation(input: CreateConversationInput): Conversation {
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
    const stmt = this.db.prepare(`
      SELECT
        id, title, created_at, updated_at, message_count,
        last_message_preview, is_favorite, is_pinned
      FROM chat_sessions
      WHERE user_id = ? AND deleted_at IS NULL AND title LIKE ?
      ORDER BY updated_at DESC
      LIMIT 50
    `);

    const rows = stmt.all(userId, `%${query}%`);
    return rows.map(this.mapToConversationSummary);
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

  private mapToConversationSummary(row: any): ConversationSummary {
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

  private mapToConversation(session: any, messages: any[]): Conversation {
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
        llmProvider: m.llm_provider,
        llmModel: m.llm_model,
        llmMetadata: m.llm_metadata ? JSON.parse(m.llm_metadata) : undefined,
        systemPrompt: m.system_prompt,
        attachments: JSON.parse(m.attachments || "[]"),
        metadata: JSON.parse(m.metadata || "{}"),
      })),
    };
  }
}
```

---

## エラーハンドリング

```typescript
// apps/desktop/src/main/repositories/errors.ts

export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}

export class NotFoundError extends RepositoryError {
  constructor(entityType: string, id: string) {
    super(`${entityType} not found: ${id}`, "NOT_FOUND");
  }
}

export class ValidationError extends RepositoryError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
  }
}
```

---

## テスト観点

| テスト観点         | 説明                               |
| ------------------ | ---------------------------------- |
| CRUD操作           | 各メソッドが正しく動作するか       |
| トランザクション   | 複数操作がアトミックに実行されるか |
| インデックス       | 検索・ソートが正しく動作するか     |
| エラーハンドリング | 存在しないIDへのアクセス時の動作   |
| 境界値             | 空文字、最大長、nullのハンドリング |
| ソフトデリート     | 削除後に一覧から除外されるか       |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |
