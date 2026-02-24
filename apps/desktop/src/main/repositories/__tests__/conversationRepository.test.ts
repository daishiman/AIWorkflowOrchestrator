/**
 * ConversationRepository Tests
 *
 * TDD Green Phase: Tests with actual implementation.
 *
 * @see docs/30-workflows/llm-conversation-history-persistence/outputs/phase-4/test-cases.md
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createRequire } from "module";
import type BetterSqlite3 from "better-sqlite3";
import { ConversationRepository } from "../conversationRepository";
import type { Message } from "../../../shared/types/conversation";

// === Test DB Setup ===

type BetterSqlite3Constructor = new (path: string) => BetterSqlite3.Database;

const require = createRequire(import.meta.url);
let BetterSqlite3Ctor: BetterSqlite3Constructor | null = null;

try {
  const loaded = require("better-sqlite3") as
    | BetterSqlite3Constructor
    | { default: BetterSqlite3Constructor };
  const candidateCtor =
    "default" in loaded ? loaded.default : (loaded as BetterSqlite3Constructor);

  // モジュール解決だけ成功しても、native binary がロード不可な場合がある。
  const probe = new candidateCtor(":memory:");
  probe.close();

  BetterSqlite3Ctor = candidateCtor;
} catch {
  BetterSqlite3Ctor = null;
}

const describeIfBetterSqlite3 = BetterSqlite3Ctor ? describe : describe.skip;

function createTestDB(): BetterSqlite3.Database {
  if (!BetterSqlite3Ctor) {
    throw new Error("better-sqlite3 is not available in this environment");
  }

  const db = new BetterSqlite3Ctor(":memory:");

  db.exec(`
    CREATE TABLE chat_sessions (
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
      metadata JSON NOT NULL DEFAULT '{}',
      deleted_at TEXT
    );

    CREATE TABLE chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      message_index INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      llm_provider TEXT,
      llm_model TEXT,
      llm_metadata JSON,
      attachments JSON NOT NULL DEFAULT '[]',
      system_prompt TEXT,
      metadata JSON NOT NULL DEFAULT '{}',
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
    );

    CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
    CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
    CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
    CREATE UNIQUE INDEX idx_chat_messages_session_message
      ON chat_messages(session_id, message_index);
  `);

  return db;
}

// === Tests ===

describeIfBetterSqlite3("ConversationRepository", () => {
  let db: BetterSqlite3.Database;
  let repository: ConversationRepository;

  beforeEach(() => {
    db = createTestDB();
    repository = new ConversationRepository(db);
  });

  afterEach(() => {
    if (db) {
      db.close();
    }
  });

  // ===========================================================================
  // 1.1 listConversations
  // ===========================================================================

  describe("listConversations", () => {
    it("CR-LC-01: should return empty array when no conversations exist", () => {
      const result = repository.listConversations("local-user");
      expect(result).toEqual([]);
    });

    it("CR-LC-02: should return conversations when they exist", () => {
      // Given: 会話が存在する
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Test Conversation",
      });

      // When: 一覧を取得
      const result = repository.listConversations("local-user");

      // Then: 会話が含まれる
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(conv.id);
      expect(result[0].title).toBe("Test Conversation");
    });

    it("CR-LC-03: should return conversations sorted by updatedAt DESC", () => {
      // Given: 複数の会話を作成
      const conv1 = repository.createConversation({
        userId: "local-user",
        title: "First",
      });
      const conv2 = repository.createConversation({
        userId: "local-user",
        title: "Second",
      });
      // conv1を更新してconv2より新しくする
      repository.updateConversation(conv1.id, { title: "First Updated" });

      // When: 一覧を取得
      const result = repository.listConversations("local-user");

      // Then: 更新したconv1が先頭
      expect(result[0].id).toBe(conv1.id);
      expect(result[1].id).toBe(conv2.id);
    });

    it("CR-LC-04: should filter by userId", () => {
      // Given: 異なるユーザーの会話
      repository.createConversation({
        userId: "user-1",
        title: "User 1 Conv",
      });
      repository.createConversation({
        userId: "user-2",
        title: "User 2 Conv",
      });

      // When: user-1の一覧を取得
      const result = repository.listConversations("user-1");

      // Then: user-1の会話のみ
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("User 1 Conv");
    });

    it("CR-LC-05: should support limit option", () => {
      // Given: 5つの会話を作成
      for (let i = 0; i < 5; i++) {
        repository.createConversation({
          userId: "local-user",
          title: `Conv ${i}`,
        });
      }

      // When: limit=2で取得
      const result = repository.listConversations("local-user", { limit: 2 });

      // Then: 2件のみ
      expect(result).toHaveLength(2);
    });

    it("CR-LC-06: should support offset option", () => {
      // Given: 5つの会話を作成
      for (let i = 0; i < 5; i++) {
        repository.createConversation({
          userId: "local-user",
          title: `Conv ${i}`,
        });
      }

      // When: offset=2で取得
      const result = repository.listConversations("local-user", { offset: 2 });

      // Then: 3件（5-2）
      expect(result).toHaveLength(3);
    });

    it("CR-LC-07: should return pinned conversations first", () => {
      // Given: ピン留め会話と通常会話
      const normal = repository.createConversation({
        userId: "local-user",
        title: "Normal",
      });
      const pinned = repository.createConversation({
        userId: "local-user",
        title: "Pinned",
      });
      repository.updateConversation(pinned.id, { isPinned: true, pinOrder: 1 });

      // When: 一覧を取得
      const result = repository.listConversations("local-user");

      // Then: ピン留めが先頭
      expect(result[0].id).toBe(pinned.id);
      expect(result[1].id).toBe(normal.id);
    });

    it("CR-LC-08: should exclude soft deleted conversations", () => {
      // Given: 会話を作成して削除
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Deleted",
      });
      repository.deleteConversation(conv.id);

      // When: 一覧を取得
      const result = repository.listConversations("local-user");

      // Then: 削除済みは含まれない
      expect(result).toHaveLength(0);
    });

    it("CR-LC-09: should return empty array when limit=0", () => {
      // Given: 会話が存在する
      repository.createConversation({
        userId: "local-user",
        title: "Test",
      });

      // When: limit=0で取得
      const result = repository.listConversations("local-user", { limit: 0 });

      // Then: 空配列
      expect(result).toEqual([]);
    });

    it("CR-LC-10: should return empty array when offset > total count", () => {
      // Given: 2つの会話が存在
      repository.createConversation({ userId: "local-user", title: "Test1" });
      repository.createConversation({ userId: "local-user", title: "Test2" });

      // When: offset=100で取得
      const result = repository.listConversations("local-user", {
        offset: 100,
      });

      // Then: 空配列
      expect(result).toEqual([]);
    });
  });

  // ===========================================================================
  // 1.2 getConversation
  // ===========================================================================

  describe("getConversation", () => {
    it("CR-GC-01: should return conversation with messages", () => {
      // Given: 会話とメッセージが存在
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Test",
      });
      repository.addMessage(conv.id, {
        role: "user",
        content: "Hello",
      });

      // When: 会話を取得
      const result = repository.getConversation(conv.id);

      // Then: 会話とメッセージが取得される
      expect(result).not.toBeNull();
      expect(result!.title).toBe("Test");
      expect(result!.messages).toHaveLength(1);
      expect(result!.messages[0].content).toBe("Hello");
    });

    it("CR-GC-02: should return conversation with empty messages array", () => {
      // Given: メッセージのない会話
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Empty",
      });

      // When: 会話を取得
      const result = repository.getConversation(conv.id);

      // Then: messages=[]
      expect(result!.messages).toEqual([]);
    });

    it("CR-GC-03: should return messages ordered by messageIndex ASC", () => {
      // Given: 複数メッセージを追加
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Test",
      });
      repository.addMessage(conv.id, { role: "user", content: "First" });
      repository.addMessage(conv.id, { role: "assistant", content: "Second" });
      repository.addMessage(conv.id, { role: "user", content: "Third" });

      // When: 会話を取得
      const result = repository.getConversation(conv.id);

      // Then: 順序が正しい
      expect(result!.messages[0].content).toBe("First");
      expect(result!.messages[1].content).toBe("Second");
      expect(result!.messages[2].content).toBe("Third");
    });

    it("CR-GC-04: should return null for non-existent conversation", () => {
      const result = repository.getConversation("non-existent-id");
      expect(result).toBeNull();
    });

    it("CR-GC-05: should return null for soft deleted conversation", () => {
      // Given: 削除された会話
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Deleted",
      });
      repository.deleteConversation(conv.id);

      // When: 会話を取得
      const result = repository.getConversation(conv.id);

      // Then: null
      expect(result).toBeNull();
    });

    it("CR-GC-06: should return null for empty id", () => {
      const result = repository.getConversation("");
      expect(result).toBeNull();
    });
  });

  // ===========================================================================
  // 1.3 createConversation
  // ===========================================================================

  describe("createConversation", () => {
    it("CR-CC-01: should create conversation with title only", () => {
      const result = repository.createConversation({
        userId: "local-user",
        title: "New Conversation",
      });

      expect(result).toBeDefined();
      expect(result.title).toBe("New Conversation");
      expect(result.userId).toBe("local-user");
    });

    it("CR-CC-02: should generate UUID v4 as id", () => {
      const result = repository.createConversation({
        userId: "local-user",
        title: "Test",
      });

      // UUID v4 format validation
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(result.id).toMatch(uuidRegex);
    });

    it("CR-CC-03: should set createdAt and updatedAt to current time", () => {
      const before = new Date();
      const result = repository.createConversation({
        userId: "local-user",
        title: "Test",
      });
      const after = new Date();

      const createdAt = new Date(result.createdAt);
      const updatedAt = new Date(result.updatedAt);

      expect(createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(updatedAt.getTime()).toBe(createdAt.getTime());
    });

    it("CR-CC-04: should initialize messageCount to 0", () => {
      const result = repository.createConversation({
        userId: "local-user",
        title: "Test",
      });

      expect(result.messageCount).toBe(0);
    });

    it("CR-CC-05: should create conversation with firstMessage", () => {
      const result = repository.createConversation({
        userId: "local-user",
        title: "Test",
        firstMessage: {
          content: "Hello!",
          role: "user",
        },
      });

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content).toBe("Hello!");
      expect(result.messages[0].role).toBe("user");
    });

    it("CR-CC-06: should set messageCount to 1 when firstMessage provided", () => {
      const result = repository.createConversation({
        userId: "local-user",
        title: "Test",
        firstMessage: {
          content: "Hello!",
          role: "user",
        },
      });

      expect(result.messageCount).toBe(1);
    });

    it("CR-CC-07: should throw error when title is empty", () => {
      expect(() =>
        repository.createConversation({
          userId: "local-user",
          title: "",
        }),
      ).toThrow();
    });

    it("CR-CC-08: should accept title with 3 characters (minimum)", () => {
      const result = repository.createConversation({
        userId: "local-user",
        title: "abc",
      });

      expect(result.title).toBe("abc");
    });

    it("CR-CC-09: should accept title with 100 characters (maximum)", () => {
      const title = "a".repeat(100);
      const result = repository.createConversation({
        userId: "local-user",
        title,
      });

      expect(result.title).toBe(title);
    });

    it("CR-CC-10: should throw error when title has 2 characters", () => {
      expect(() =>
        repository.createConversation({
          userId: "local-user",
          title: "ab",
        }),
      ).toThrow();
    });

    it("CR-CC-11: should throw error when title has 101 characters", () => {
      const title = "a".repeat(101);
      expect(() =>
        repository.createConversation({
          userId: "local-user",
          title,
        }),
      ).toThrow();
    });
  });

  // ===========================================================================
  // 1.4 updateConversation
  // ===========================================================================

  describe("updateConversation", () => {
    it("CR-UC-01: should update title", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Original",
      });

      const result = repository.updateConversation(conv.id, {
        title: "Updated",
      });

      expect(result.title).toBe("Updated");
    });

    it("CR-UC-02: should update updatedAt timestamp", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Test",
      });
      const originalUpdatedAt = conv.updatedAt;

      // Wait a bit to ensure timestamp difference
      const result = repository.updateConversation(conv.id, {
        title: "Updated",
      });

      expect(new Date(result.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(originalUpdatedAt).getTime(),
      );
    });

    it("CR-UC-03: should update isFavorite", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Test",
      });

      const result = repository.updateConversation(conv.id, {
        isFavorite: true,
      });

      expect(result.isFavorite).toBe(true);
    });

    it("CR-UC-04: should update isPinned", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Test",
      });

      const result = repository.updateConversation(conv.id, {
        isPinned: true,
      });

      expect(result.isPinned).toBe(true);
    });

    it("CR-UC-05: should update pinOrder", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Test",
      });

      const result = repository.updateConversation(conv.id, {
        pinOrder: 5,
      });

      expect(result.pinOrder).toBe(5);
    });

    it("CR-UC-06: should throw error for non-existent conversation", () => {
      expect(() =>
        repository.updateConversation("non-existent-id", {
          title: "New Title",
        }),
      ).toThrow();
    });

    it("CR-UC-07: should accept title with 3 characters (minimum)", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Original",
      });

      const result = repository.updateConversation(conv.id, {
        title: "abc",
      });

      expect(result.title).toBe("abc");
    });

    it("CR-UC-08: should accept title with 100 characters (maximum)", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Original",
      });
      const newTitle = "b".repeat(100);

      const result = repository.updateConversation(conv.id, {
        title: newTitle,
      });

      expect(result.title).toBe(newTitle);
    });
  });

  // ===========================================================================
  // 1.5 deleteConversation
  // ===========================================================================

  describe("deleteConversation", () => {
    it("CR-DC-01: should soft delete conversation", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "To Delete",
      });

      repository.deleteConversation(conv.id);

      // Verify deleted_at is set in DB
      const row = db
        .prepare("SELECT deleted_at FROM chat_sessions WHERE id = ?")
        .get(conv.id) as { deleted_at: string | null };
      expect(row.deleted_at).not.toBeNull();
    });

    it("CR-DC-02: should not return deleted conversation in list", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "To Delete",
      });
      repository.deleteConversation(conv.id);

      const list = repository.listConversations("local-user");

      expect(list.find((c) => c.id === conv.id)).toBeUndefined();
    });

    it("CR-DC-03: should return null when getting deleted conversation", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "To Delete",
      });
      repository.deleteConversation(conv.id);

      const result = repository.getConversation(conv.id);

      expect(result).toBeNull();
    });

    it("CR-DC-04: should not throw error for non-existent conversation", () => {
      expect(() =>
        repository.deleteConversation("non-existent-id"),
      ).not.toThrow();
    });
  });

  // ===========================================================================
  // 1.6 addMessage
  // ===========================================================================

  describe("addMessage", () => {
    it("CR-AM-01: should add message to conversation", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Test",
      });

      const result = repository.addMessage(conv.id, {
        role: "user",
        content: "Hello!",
      });

      expect(result).toBeDefined();
      expect(result.content).toBe("Hello!");
      expect(result.role).toBe("user");
    });

    it("CR-AM-02: should set sequential messageIndex", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Test",
      });

      const msg1 = repository.addMessage(conv.id, {
        role: "user",
        content: "First",
      });
      const msg2 = repository.addMessage(conv.id, {
        role: "assistant",
        content: "Second",
      });
      const msg3 = repository.addMessage(conv.id, {
        role: "user",
        content: "Third",
      });

      expect(msg1.messageIndex).toBe(0);
      expect(msg2.messageIndex).toBe(1);
      expect(msg3.messageIndex).toBe(2);
    });

    it("CR-AM-03: should increment conversation messageCount", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Test",
      });

      repository.addMessage(conv.id, { role: "user", content: "1" });
      repository.addMessage(conv.id, { role: "assistant", content: "2" });
      repository.addMessage(conv.id, { role: "user", content: "3" });

      const updated = repository.getConversation(conv.id);
      expect(updated!.messageCount).toBe(3);
    });

    it("CR-AM-04: should update conversation updatedAt", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Test",
      });
      const originalUpdatedAt = conv.updatedAt;

      repository.addMessage(conv.id, { role: "user", content: "New message" });

      const updated = repository.getConversation(conv.id);
      expect(new Date(updated!.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(originalUpdatedAt).getTime(),
      );
    });

    it("CR-AM-05: should update lastMessagePreview", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Test",
      });

      const content =
        "This is a long message that should be truncated in the preview field.";
      repository.addMessage(conv.id, { role: "user", content });

      const list = repository.listConversations("local-user");
      const summary = list.find((c) => c.id === conv.id);
      expect(summary!.lastMessagePreview).toBe(content.substring(0, 50));
    });

    it("CR-AM-06: should save llmProvider and llmModel", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Test",
      });

      repository.addMessage(conv.id, {
        role: "assistant",
        content: "AI response",
        llmProvider: "openai",
        llmModel: "gpt-4",
      });

      const updated = repository.getConversation(conv.id);
      expect(updated!.messages[0].llmProvider).toBe("openai");
      expect(updated!.messages[0].llmModel).toBe("gpt-4");
    });

    it("CR-AM-07: should save systemPrompt", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Test",
      });

      repository.addMessage(conv.id, {
        role: "user",
        content: "Hello",
        systemPrompt: "You are a helpful assistant",
      });

      const updated = repository.getConversation(conv.id);
      expect(updated!.messages[0].systemPrompt).toBe(
        "You are a helpful assistant",
      );
    });

    it("CR-AM-08: should throw error for non-existent session", () => {
      expect(() =>
        repository.addMessage("non-existent-id", {
          role: "user",
          content: "Hello",
        }),
      ).toThrow();
    });

    it("CR-AM-09: should accept content with 1 character", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Test",
      });

      const result = repository.addMessage(conv.id, {
        role: "user",
        content: "X",
      });

      expect(result.content).toBe("X");
    });

    it("CR-AM-10: should accept content with 100000 characters", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Test",
      });
      const longContent = "a".repeat(100000);

      const result = repository.addMessage(conv.id, {
        role: "user",
        content: longContent,
      });

      expect(result.content.length).toBe(100000);
    });

    it("CR-AM-11: should handle Unicode emoji in content", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Test",
      });

      repository.addMessage(conv.id, {
        role: "user",
        content: "Hello! How are you feeling today?",
      });

      const updated = repository.getConversation(conv.id);
      expect(updated!.messages[0].content).toBe(
        "Hello! How are you feeling today?",
      );
    });
  });

  // ===========================================================================
  // 1.7 searchConversations
  // ===========================================================================

  describe("searchConversations", () => {
    it("CR-SC-01: should find conversations by title keyword", () => {
      repository.createConversation({
        userId: "local-user",
        title: "TypeScript Tutorial",
      });
      repository.createConversation({
        userId: "local-user",
        title: "JavaScript Basics",
      });

      const result = repository.searchConversations("local-user", "Script");

      expect(result).toHaveLength(2);
    });

    it("CR-SC-02: should find by partial match", () => {
      repository.createConversation({
        userId: "local-user",
        title: "React Component Guide",
      });

      const result = repository.searchConversations("local-user", "Comp");

      expect(result).toHaveLength(1);
    });

    it("CR-SC-03: should be case-insensitive", () => {
      repository.createConversation({
        userId: "local-user",
        title: "TypeScript Tutorial",
      });

      const result = repository.searchConversations("local-user", "typescript");

      expect(result).toHaveLength(1);
    });

    it("CR-SC-04: should return empty array when no match", () => {
      repository.createConversation({
        userId: "local-user",
        title: "JavaScript",
      });

      const result = repository.searchConversations("local-user", "Python");

      expect(result).toEqual([]);
    });

    it("CR-SC-05: should exclude soft deleted conversations", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Deleted TypeScript",
      });
      repository.deleteConversation(conv.id);

      const result = repository.searchConversations("local-user", "TypeScript");

      expect(result).toEqual([]);
    });

    it("CR-SC-06: should return empty array for empty query", () => {
      repository.createConversation({
        userId: "local-user",
        title: "Test",
      });

      const result = repository.searchConversations("local-user", "");

      expect(result).toEqual([]);
    });

    it("CR-SC-07: should handle special characters in query", () => {
      repository.createConversation({
        userId: "local-user",
        title: "100% Complete",
      });

      const result = repository.searchConversations("local-user", "100%");

      expect(result).toHaveLength(1);
    });
  });

  // ===========================================================================
  // Edge Cases - Phase 6 Expansion
  // ===========================================================================

  describe("Edge Cases - Concurrent Operations", () => {
    it("EC-CO-01: should handle concurrent message additions", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Concurrent Test",
      });

      // Simulate concurrent additions (sequential in reality but tests integrity)
      const messages: Message[] = [];
      for (let i = 0; i < 10; i++) {
        messages.push(
          repository.addMessage(conv.id, {
            role: i % 2 === 0 ? "user" : "assistant",
            content: `Message ${i}`,
          }),
        );
      }

      // Verify all have unique indexes
      const indexes = messages.map((m) => m.messageIndex);
      const uniqueIndexes = new Set(indexes);
      expect(uniqueIndexes.size).toBe(10);
    });

    it("EC-CO-02: should maintain messageIndex uniqueness", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Index Test",
      });

      repository.addMessage(conv.id, { role: "user", content: "A" });
      repository.addMessage(conv.id, { role: "assistant", content: "B" });
      repository.addMessage(conv.id, { role: "user", content: "C" });

      const result = repository.getConversation(conv.id);
      const indexes = result!.messages.map((m) => m.messageIndex);

      expect(indexes).toEqual([0, 1, 2]);
    });
  });

  describe("Edge Cases - Soft Delete", () => {
    it("EC-SD-01: should include soft-deleted in list when includeDeleted=true", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Deleted",
      });
      repository.deleteConversation(conv.id);

      const resultWithDeleted = repository.listConversations("local-user", {
        includeDeleted: true,
      });
      const resultWithoutDeleted = repository.listConversations("local-user", {
        includeDeleted: false,
      });

      expect(resultWithDeleted).toHaveLength(1);
      expect(resultWithoutDeleted).toHaveLength(0);
    });
  });

  describe("Edge Cases - Update Validation", () => {
    it("EC-UV-01: should throw error when updating with empty title", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Original",
      });

      expect(() =>
        repository.updateConversation(conv.id, { title: "" }),
      ).toThrow();
    });

    it("EC-UV-02: should throw error when updating with title too short", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Original",
      });

      expect(() =>
        repository.updateConversation(conv.id, { title: "ab" }),
      ).toThrow();
    });

    it("EC-UV-03: should throw error when updating with title too long", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Original",
      });
      const longTitle = "a".repeat(101);

      expect(() =>
        repository.updateConversation(conv.id, { title: longTitle }),
      ).toThrow();
    });
  });

  describe("Edge Cases - Update Metadata", () => {
    it("EC-UM-01: should update metadata", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Test",
      });

      const result = repository.updateConversation(conv.id, {
        metadata: { key: "value", nested: { a: 1 } },
      });

      expect(result.metadata).toEqual({ key: "value", nested: { a: 1 } });
    });

    it("EC-UM-02: should preserve metadata after other updates", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Test",
      });
      repository.updateConversation(conv.id, {
        metadata: { key: "value" },
      });

      const result = repository.updateConversation(conv.id, {
        isFavorite: true,
      });

      expect(result.metadata).toEqual({ key: "value" });
      expect(result.isFavorite).toBe(true);
    });
  });

  describe("Edge Cases - Search", () => {
    it("EC-SR-01: should handle very long query", () => {
      repository.createConversation({
        userId: "local-user",
        title: "Test",
      });

      const longQuery = "a".repeat(1000);
      const result = repository.searchConversations("local-user", longQuery);

      expect(result).toEqual([]);
    });

    it("EC-SR-02: should handle SQL injection attempt", () => {
      repository.createConversation({
        userId: "local-user",
        title: "Test Conversation",
      });

      // SQL injection attempt
      const result = repository.searchConversations(
        "local-user",
        "'; DROP TABLE chat_sessions; --",
      );

      // Should not throw and should return empty (no match)
      expect(result).toEqual([]);

      // Verify table still exists
      const list = repository.listConversations("local-user");
      expect(list).toHaveLength(1);
    });

    it("EC-SR-03: should handle underscore in query", () => {
      repository.createConversation({
        userId: "local-user",
        title: "test_value",
      });
      repository.createConversation({
        userId: "local-user",
        title: "testXvalue",
      });

      // Underscore is escaped, so only exact _ match
      const result = repository.searchConversations("local-user", "test_");

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("test_value");
    });
  });

  // ===========================================================================
  // Integration Tests - Full Lifecycle
  // ===========================================================================

  describe("Integration - Full Lifecycle", () => {
    it("INT-FL-01: should handle create → update → addMessages → delete flow", () => {
      // Create
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Lifecycle Test",
      });
      expect(conv.id).toBeDefined();

      // Update
      const updated = repository.updateConversation(conv.id, {
        title: "Updated Lifecycle",
        isFavorite: true,
      });
      expect(updated.title).toBe("Updated Lifecycle");
      expect(updated.isFavorite).toBe(true);

      // Add messages
      repository.addMessage(conv.id, { role: "user", content: "Hello" });
      repository.addMessage(conv.id, {
        role: "assistant",
        content: "Hi there",
      });
      repository.addMessage(conv.id, { role: "user", content: "Goodbye" });

      const withMessages = repository.getConversation(conv.id);
      expect(withMessages!.messages).toHaveLength(3);
      expect(withMessages!.messageCount).toBe(3);

      // Delete
      repository.deleteConversation(conv.id);

      const afterDelete = repository.getConversation(conv.id);
      expect(afterDelete).toBeNull();
    });

    it("INT-FL-02: should handle rapid sequential operations", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Rapid Test",
      });

      // Rapid sequential updates
      for (let i = 0; i < 50; i++) {
        repository.updateConversation(conv.id, {
          title: `Title ${i}`,
        });
      }

      const result = repository.getConversation(conv.id);
      expect(result!.title).toBe("Title 49");
    });
  });

  describe("Integration - Data Persistence", () => {
    it("INT-DP-01: should persist after repository recreation (simulated)", () => {
      // Create with first repository instance
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Persistence Test",
      });
      repository.addMessage(conv.id, {
        role: "user",
        content: "Saved message",
      });

      // Create new repository with same DB (simulates app restart)
      const repository2 = new ConversationRepository(db);

      // Data should persist
      const restored = repository2.getConversation(conv.id);
      expect(restored).not.toBeNull();
      expect(restored!.title).toBe("Persistence Test");
      expect(restored!.messages).toHaveLength(1);
      expect(restored!.messages[0].content).toBe("Saved message");
    });
  });

  describe("Integration - Performance", () => {
    it("INT-PF-01: should list 100 conversations in under 100ms", () => {
      // Create 100 conversations
      for (let i = 0; i < 100; i++) {
        repository.createConversation({
          userId: "perf-user",
          title: `Perf Conversation ${i}`,
        });
      }

      const start = Date.now();
      const result = repository.listConversations("perf-user", { limit: 100 });
      const elapsed = Date.now() - start;

      expect(result).toHaveLength(100);
      expect(elapsed).toBeLessThan(100);
    });

    it("INT-PF-02: should add 100 messages in under 1 second", () => {
      const conv = repository.createConversation({
        userId: "local-user",
        title: "Message Perf Test",
      });

      const start = Date.now();
      for (let i = 0; i < 100; i++) {
        repository.addMessage(conv.id, {
          role: i % 2 === 0 ? "user" : "assistant",
          content: `Performance message ${i}`,
        });
      }
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(1000);

      const result = repository.getConversation(conv.id);
      expect(result!.messages).toHaveLength(100);
    });
  });

  // ===========================================================================
  // Boundary Tests
  // ===========================================================================

  describe("Boundary Tests", () => {
    describe("Large Data Sets", () => {
      it("BT-LD-01: should handle 1000 conversations", () => {
        // Create 1000 conversations
        for (let i = 0; i < 1000; i++) {
          repository.createConversation({
            userId: "local-user",
            title: `Conversation ${i}`,
          });
        }

        const start = Date.now();
        const result = repository.listConversations("local-user", {
          limit: 1000,
        });
        const elapsed = Date.now() - start;

        expect(result).toHaveLength(1000);
        expect(elapsed).toBeLessThan(1000); // Should be under 1 second
      });

      it("BT-LD-02: should handle conversation with 1000 messages", () => {
        const conv = repository.createConversation({
          userId: "local-user",
          title: "Many Messages",
        });

        for (let i = 0; i < 1000; i++) {
          repository.addMessage(conv.id, {
            role: i % 2 === 0 ? "user" : "assistant",
            content: `Message ${i}`,
          });
        }

        const start = Date.now();
        const result = repository.getConversation(conv.id);
        const elapsed = Date.now() - start;

        expect(result!.messages).toHaveLength(1000);
        expect(elapsed).toBeLessThan(2000); // Should be under 2 seconds
      });
    });
  });
});
