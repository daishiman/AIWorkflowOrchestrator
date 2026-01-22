/**
 * テスト用データベースヘルパー
 *
 * インメモリSQLiteを使用したテスト環境のセットアップを提供する。
 *
 * @module features/chat-history/infrastructure/persistence/__tests__/helpers/test-db
 */

import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../../../../../../db/schema/chat-history.js";
import { ChatSession } from "../../../../domain/entities/ChatSession.js";
import { ChatMessage } from "../../../../domain/entities/ChatMessage.js";

/**
 * テストデータベースインスタンス
 */
export interface TestDatabase {
  db: ReturnType<typeof drizzle<typeof schema>>;
  sqlite: Database.Database;
  close: () => void;
}

/**
 * テスト用インメモリSQLiteデータベースを作成する
 *
 * @returns テストデータベースインスタンス
 */
export function createTestDatabase(): TestDatabase {
  const sqlite = new Database(":memory:");
  const db = drizzle(sqlite, { schema });

  // スキーマ作成
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      message_count INTEGER NOT NULL DEFAULT 0,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      is_pinned INTEGER NOT NULL DEFAULT 0,
      pin_order INTEGER,
      last_message_preview TEXT,
      metadata TEXT NOT NULL DEFAULT '{}',
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      message_index INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      llm_provider TEXT,
      llm_model TEXT,
      llm_metadata TEXT,
      attachments TEXT NOT NULL DEFAULT '[]',
      system_prompt TEXT,
      metadata TEXT NOT NULL DEFAULT '{}'
    );

    CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
    CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
    CREATE UNIQUE INDEX idx_chat_messages_session_message ON chat_messages(session_id, message_index);
  `);

  return {
    db,
    sqlite,
    close: () => sqlite.close(),
  };
}

/**
 * テストデータファクトリ
 */
export const TestDataFactory = {
  /**
   * テスト用セッションを作成する
   *
   * @param overrides 上書きパラメータ
   * @returns ChatSession
   */
  createSession(
    overrides: Partial<{
      id: string;
      userId: string;
      title: string;
      messageCount: number;
      isFavorite: boolean;
      isPinned: boolean;
      pinOrder: number | null;
      lastMessagePreview: string | null;
      createdAt: Date;
      updatedAt: Date;
    }> = {},
  ): ChatSession {
    const now = new Date();
    return ChatSession.reconstitute({
      id:
        overrides.id ??
        `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      userId: overrides.userId ?? "test-user",
      title: overrides.title ?? "テストセッション",
      messageCount: overrides.messageCount ?? 0,
      isFavorite: overrides.isFavorite ?? false,
      isPinned: overrides.isPinned ?? false,
      pinOrder: overrides.pinOrder ?? null,
      lastMessagePreview: overrides.lastMessagePreview ?? null,
      createdAt: overrides.createdAt ?? now,
      updatedAt: overrides.updatedAt ?? now,
    });
  },

  /**
   * テスト用メッセージを作成する
   *
   * @param sessionId セッションID
   * @param overrides 上書きパラメータ
   * @returns ChatMessage
   */
  createMessage(
    sessionId: string,
    overrides: Partial<{
      id: string;
      role: "user" | "assistant";
      content: string;
      messageIndex: number;
      timestamp: Date;
      llmProvider: string | null;
      llmModel: string | null;
      llmMetadata: Record<string, unknown> | null;
    }> = {},
  ): ChatMessage {
    return ChatMessage.reconstitute({
      id:
        overrides.id ??
        `message-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      sessionId,
      role: overrides.role ?? "user",
      content: overrides.content ?? "テストメッセージ",
      messageIndex: overrides.messageIndex ?? 0,
      timestamp: overrides.timestamp ?? new Date(),
      llmProvider: overrides.llmProvider ?? null,
      llmModel: overrides.llmModel ?? null,
      llmMetadata: overrides.llmMetadata ?? null,
    });
  },

  /**
   * 複数のテストセッションを作成する
   *
   * @param count 作成数
   * @param overrides 上書きパラメータ
   * @returns ChatSession[]
   */
  createSessions(
    count: number,
    overrides: Partial<{
      userId: string;
    }> = {},
  ): ChatSession[] {
    return Array.from({ length: count }, (_, i) =>
      TestDataFactory.createSession({
        ...overrides,
        title: `テストセッション ${i + 1}`,
        createdAt: new Date(Date.now() - i * 60000), // 1分ずつ古く
        updatedAt: new Date(Date.now() - i * 60000),
      }),
    );
  },

  /**
   * 複数のテストメッセージを作成する
   *
   * @param sessionId セッションID
   * @param count 作成数
   * @returns ChatMessage[]
   */
  createMessages(sessionId: string, count: number): ChatMessage[] {
    return Array.from({ length: count }, (_, i) =>
      TestDataFactory.createMessage(sessionId, {
        messageIndex: i,
        role: i % 2 === 0 ? "user" : "assistant",
        content: `テストメッセージ ${i + 1}`,
        timestamp: new Date(Date.now() + i * 1000), // 1秒ずつ新しく
      }),
    );
  },
};
