import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { ChatMessageRepository } from "../chat-message-repository";
import type { ChatMessage } from "../../types/chat-message";
import type { LlmMetadata } from "../../types/llm-metadata";

describe("ChatMessageRepository", () => {
  let db: ReturnType<typeof drizzle>;
  let sqlite: Database.Database;
  let repository: ChatMessageRepository;

  beforeEach(() => {
    // In-memory SQLite database for testing
    sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");

    // Create chat_sessions table (parent table)
    sqlite.exec(`
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
        metadata TEXT NOT NULL DEFAULT '{}',
        deleted_at TEXT
      );

      CREATE TABLE chat_messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
        content TEXT NOT NULL CHECK(length(content) BETWEEN 1 AND 100000),
        message_index INTEGER NOT NULL CHECK(message_index >= 0),
        timestamp TEXT NOT NULL,
        llm_provider TEXT,
        llm_model TEXT,
        llm_metadata TEXT,
        attachments TEXT NOT NULL DEFAULT '[]',
        system_prompt TEXT,
        metadata TEXT NOT NULL DEFAULT '{}',
        FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
        UNIQUE(session_id, message_index)
      );

      CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
      CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp);
      CREATE INDEX idx_chat_messages_role ON chat_messages(role);
    `);

    // Insert test session
    sqlite
      .prepare(
        `
      INSERT INTO chat_sessions (id, user_id, title, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `,
      )
      .run(
        "session-test",
        "user-001",
        "Test Session",
        "2024-01-01T00:00:00Z",
        "2024-01-01T00:00:00Z",
      );

    db = drizzle(sqlite);
    repository = new ChatMessageRepository(db);
  });

  afterEach(() => {
    sqlite.close();
  });

  describe("save", () => {
    it("新しいメッセージを保存できる", async () => {
      // Arrange
      const message: ChatMessage = {
        id: "msg-001",
        sessionId: "session-test",
        role: "user",
        content: "Hello, world!",
        messageIndex: 0,
        timestamp: "2024-01-01T00:00:00Z",
        llmProvider: null,
        llmModel: null,
        llmMetadata: null,
        attachments: [],
        systemPrompt: null,
        metadata: {},
      };

      // Act
      await repository.save(message);
      const found = await repository.findById(message.id);

      // Assert
      expect(found).toEqual(message);
    });

    it("messageIndexが自動採番される（BR-MESSAGE-001）", async () => {
      // Arrange
      const message1: ChatMessage = {
        id: "msg-101",
        sessionId: "session-test",
        role: "user",
        content: "First message",
        messageIndex: -1, // 自動採番を期待
        timestamp: "2024-01-01T00:00:00Z",
        llmProvider: null,
        llmModel: null,
        llmMetadata: null,
        attachments: [],
        systemPrompt: null,
        metadata: {},
      };

      // Act
      await repository.save(message1);
      const found1 = await repository.findById("msg-101");

      // Assert - 初回メッセージは index 0
      expect(found1?.messageIndex).toBe(0);

      // Arrange - 2番目のメッセージ
      const message2: ChatMessage = {
        id: "msg-102",
        sessionId: "session-test",
        role: "assistant",
        content: "Second message",
        messageIndex: -1, // 自動採番を期待
        timestamp: "2024-01-01T00:01:00Z",
        llmProvider: "anthropic",
        llmModel: "claude-3-5-sonnet-20241022",
        llmMetadata: {
          provider: "anthropic",
          model: "claude-3-5-sonnet-20241022",
        },
        attachments: [],
        systemPrompt: null,
        metadata: {},
      };

      await repository.save(message2);
      const found2 = await repository.findById("msg-102");

      // Assert - 2番目のメッセージは index 1
      expect(found2?.messageIndex).toBe(1);
    });

    it("role=assistantの場合、LLMメタデータが必須（BR-MESSAGE-002）", async () => {
      // Arrange
      const message: ChatMessage = {
        id: "msg-201",
        sessionId: "session-test",
        role: "assistant",
        content: "Assistant response",
        messageIndex: 0,
        timestamp: "2024-01-01T00:00:00Z",
        llmProvider: null, // 必須なのでエラーになるはず
        llmModel: null,
        llmMetadata: null,
        attachments: [],
        systemPrompt: null,
        metadata: {},
      };

      // Act & Assert
      await expect(repository.save(message)).rejects.toThrow(
        /LLMメタデータが必須/,
      );
    });

    it("role=assistantの場合、LLMメタデータを含む正常なメッセージを保存できる", async () => {
      // Arrange
      const llmMetadata: LlmMetadata = {
        provider: "anthropic",
        model: "claude-3-5-sonnet-20241022",
        version: "20241022",
        temperature: 0.7,
        maxTokens: 4096,
        tokenUsage: {
          inputTokens: 100,
          outputTokens: 200,
          totalTokens: 300,
        },
      };

      const message: ChatMessage = {
        id: "msg-202",
        sessionId: "session-test",
        role: "assistant",
        content: "Here is my response",
        messageIndex: 0,
        timestamp: "2024-01-01T00:00:00Z",
        llmProvider: "anthropic",
        llmModel: "claude-3-5-sonnet-20241022",
        llmMetadata,
        attachments: [],
        systemPrompt: null,
        metadata: {},
      };

      // Act
      await repository.save(message);
      const found = await repository.findById("msg-202");

      // Assert
      expect(found).toEqual(message);
      expect(found?.llmMetadata).toEqual(llmMetadata);
    });

    it("contentが1文字未満の場合、エラーになる", async () => {
      // Arrange
      const message: ChatMessage = {
        id: "msg-301",
        sessionId: "session-test",
        role: "user",
        content: "",
        messageIndex: 0,
        timestamp: "2024-01-01T00:00:00Z",
        llmProvider: null,
        llmModel: null,
        llmMetadata: null,
        attachments: [],
        systemPrompt: null,
        metadata: {},
      };

      // Act & Assert
      await expect(repository.save(message)).rejects.toThrow();
    });

    it("contentが100,000文字を超える場合、エラーになる", async () => {
      // Arrange
      const message: ChatMessage = {
        id: "msg-302",
        sessionId: "session-test",
        role: "user",
        content: "A".repeat(100001),
        messageIndex: 0,
        timestamp: "2024-01-01T00:00:00Z",
        llmProvider: null,
        llmModel: null,
        llmMetadata: null,
        attachments: [],
        systemPrompt: null,
        metadata: {},
      };

      // Act & Assert
      await expect(repository.save(message)).rejects.toThrow();
    });

    it("存在しないsession_idの場合、外部キー制約エラーになる", async () => {
      // Arrange
      const message: ChatMessage = {
        id: "msg-401",
        sessionId: "non-existent-session",
        role: "user",
        content: "Hello",
        messageIndex: 0,
        timestamp: "2024-01-01T00:00:00Z",
        llmProvider: null,
        llmModel: null,
        llmMetadata: null,
        attachments: [],
        systemPrompt: null,
        metadata: {},
      };

      // Act & Assert
      await expect(repository.save(message)).rejects.toThrow();
    });

    it("同じsession_idとmessage_indexの組み合わせは一意制約エラーになる", async () => {
      // Arrange
      const message1: ChatMessage = {
        id: "msg-501",
        sessionId: "session-test",
        role: "user",
        content: "First",
        messageIndex: 0,
        timestamp: "2024-01-01T00:00:00Z",
        llmProvider: null,
        llmModel: null,
        llmMetadata: null,
        attachments: [],
        systemPrompt: null,
        metadata: {},
      };
      await repository.save(message1);

      const message2: ChatMessage = {
        id: "msg-502",
        sessionId: "session-test",
        role: "user",
        content: "Second",
        messageIndex: 0, // 同じindex
        timestamp: "2024-01-01T00:01:00Z",
        llmProvider: null,
        llmModel: null,
        llmMetadata: null,
        attachments: [],
        systemPrompt: null,
        metadata: {},
      };

      // Act & Assert
      await expect(repository.save(message2)).rejects.toThrow();
    });
  });

  describe("findById", () => {
    it("IDでメッセージを取得できる", async () => {
      // Arrange
      const message: ChatMessage = {
        id: "msg-601",
        sessionId: "session-test",
        role: "user",
        content: "Findable message",
        messageIndex: 0,
        timestamp: "2024-01-01T00:00:00Z",
        llmProvider: null,
        llmModel: null,
        llmMetadata: null,
        attachments: [],
        systemPrompt: null,
        metadata: { custom: "data" },
      };
      await repository.save(message);

      // Act
      const found = await repository.findById("msg-601");

      // Assert
      expect(found).toEqual(message);
    });

    it("存在しないIDの場合、nullを返す", async () => {
      // Act
      const found = await repository.findById("non-existent");

      // Assert
      expect(found).toBeNull();
    });
  });

  describe("findBySessionId", () => {
    beforeEach(async () => {
      // テスト用メッセージを準備
      await repository.save({
        id: "msg-701",
        sessionId: "session-test",
        role: "user",
        content: "Message 1",
        messageIndex: 0,
        timestamp: "2024-01-01T00:00:00Z",
        llmProvider: null,
        llmModel: null,
        llmMetadata: null,
        attachments: [],
        systemPrompt: null,
        metadata: {},
      });
      await repository.save({
        id: "msg-702",
        sessionId: "session-test",
        role: "assistant",
        content: "Message 2",
        messageIndex: 1,
        timestamp: "2024-01-01T00:01:00Z",
        llmProvider: "anthropic",
        llmModel: "claude-3-5-sonnet-20241022",
        llmMetadata: {
          provider: "anthropic",
          model: "claude-3-5-sonnet-20241022",
        },
        attachments: [],
        systemPrompt: null,
        metadata: {},
      });
      await repository.save({
        id: "msg-703",
        sessionId: "session-test",
        role: "user",
        content: "Message 3",
        messageIndex: 2,
        timestamp: "2024-01-01T00:02:00Z",
        llmProvider: null,
        llmModel: null,
        llmMetadata: null,
        attachments: [],
        systemPrompt: null,
        metadata: {},
      });
    });

    it("セッションIDで全メッセージを取得できる", async () => {
      // Act
      const messages = await repository.findBySessionId("session-test");

      // Assert
      expect(messages).toHaveLength(3);
      expect(messages.map((m) => m.id)).toEqual([
        "msg-701",
        "msg-702",
        "msg-703",
      ]);
    });

    it("メッセージがmessageIndexの昇順でソートされる", async () => {
      // Act
      const messages = await repository.findBySessionId("session-test");

      // Assert
      expect(messages.map((m) => m.messageIndex)).toEqual([0, 1, 2]);
    });

    it("存在しないセッションIDの場合、空配列を返す", async () => {
      // Act
      const messages = await repository.findBySessionId("non-existent");

      // Assert
      expect(messages).toEqual([]);
    });

    it("limitで結果件数を制限できる", async () => {
      // Act
      const messages = await repository.findBySessionId("session-test", {
        limit: 2,
      });

      // Assert
      expect(messages).toHaveLength(2);
      expect(messages.map((m) => m.id)).toEqual(["msg-701", "msg-702"]);
    });

    it("offsetでページネーションできる", async () => {
      // Act
      const page1 = await repository.findBySessionId("session-test", {
        limit: 2,
        offset: 0,
      });
      const page2 = await repository.findBySessionId("session-test", {
        limit: 2,
        offset: 2,
      });

      // Assert
      expect(page1).toHaveLength(2);
      expect(page1.map((m) => m.id)).toEqual(["msg-701", "msg-702"]);
      expect(page2).toHaveLength(1);
      expect(page2.map((m) => m.id)).toEqual(["msg-703"]);
    });
  });

  describe("findByRole", () => {
    beforeEach(async () => {
      await repository.save({
        id: "msg-801",
        sessionId: "session-test",
        role: "user",
        content: "User message 1",
        messageIndex: 0,
        timestamp: "2024-01-01T00:00:00Z",
        llmProvider: null,
        llmModel: null,
        llmMetadata: null,
        attachments: [],
        systemPrompt: null,
        metadata: {},
      });
      await repository.save({
        id: "msg-802",
        sessionId: "session-test",
        role: "assistant",
        content: "Assistant message 1",
        messageIndex: 1,
        timestamp: "2024-01-01T00:01:00Z",
        llmProvider: "anthropic",
        llmModel: "claude-3-5-sonnet-20241022",
        llmMetadata: {
          provider: "anthropic",
          model: "claude-3-5-sonnet-20241022",
        },
        attachments: [],
        systemPrompt: null,
        metadata: {},
      });
      await repository.save({
        id: "msg-803",
        sessionId: "session-test",
        role: "user",
        content: "User message 2",
        messageIndex: 2,
        timestamp: "2024-01-01T00:02:00Z",
        llmProvider: null,
        llmModel: null,
        llmMetadata: null,
        attachments: [],
        systemPrompt: null,
        metadata: {},
      });
    });

    it("role=userでフィルタできる", async () => {
      // Act
      const userMessages = await repository.findByRole("session-test", "user");

      // Assert
      expect(userMessages).toHaveLength(2);
      expect(userMessages.map((m) => m.id)).toEqual(["msg-801", "msg-803"]);
      expect(userMessages.every((m) => m.role === "user")).toBe(true);
    });

    it("role=assistantでフィルタできる", async () => {
      // Act
      const assistantMessages = await repository.findByRole(
        "session-test",
        "assistant",
      );

      // Assert
      expect(assistantMessages).toHaveLength(1);
      expect(assistantMessages[0].id).toBe("msg-802");
      expect(assistantMessages[0].role).toBe("assistant");
    });
  });

  describe("update", () => {
    it("メッセージを更新できる", async () => {
      // Arrange
      await repository.save({
        id: "msg-901",
        sessionId: "session-test",
        role: "user",
        content: "Original content",
        messageIndex: 0,
        timestamp: "2024-01-01T00:00:00Z",
        llmProvider: null,
        llmModel: null,
        llmMetadata: null,
        attachments: [],
        systemPrompt: null,
        metadata: {},
      });

      // Act
      await repository.update("msg-901", {
        content: "Updated content",
      });
      const updated = await repository.findById("msg-901");

      // Assert
      expect(updated?.content).toBe("Updated content");
    });

    it("メタデータを更新できる", async () => {
      // Arrange
      await repository.save({
        id: "msg-902",
        sessionId: "session-test",
        role: "user",
        content: "Test",
        messageIndex: 0,
        timestamp: "2024-01-01T00:00:00Z",
        llmProvider: null,
        llmModel: null,
        llmMetadata: null,
        attachments: [],
        systemPrompt: null,
        metadata: { key: "value" },
      });

      // Act
      await repository.update("msg-902", {
        metadata: { key: "updated", new: "field" },
      });
      const updated = await repository.findById("msg-902");

      // Assert
      expect(updated?.metadata).toEqual({ key: "updated", new: "field" });
    });

    it("存在しないメッセージの更新はfalseを返す", async () => {
      // Act
      const result = await repository.update("non-existent", {
        content: "New content",
      });

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("delete", () => {
    it("メッセージを削除できる", async () => {
      // Arrange
      await repository.save({
        id: "msg-1001",
        sessionId: "session-test",
        role: "user",
        content: "To be deleted",
        messageIndex: 0,
        timestamp: "2024-01-01T00:00:00Z",
        llmProvider: null,
        llmModel: null,
        llmMetadata: null,
        attachments: [],
        systemPrompt: null,
        metadata: {},
      });

      // Act
      const result = await repository.delete("msg-1001");
      const found = await repository.findById("msg-1001");

      // Assert
      expect(result).toBe(true);
      expect(found).toBeNull();
    });

    it("存在しないメッセージの削除はfalseを返す", async () => {
      // Act
      const result = await repository.delete("non-existent");

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("カスケード削除（BR-MESSAGE-003）", () => {
    it("セッションが削除されると、関連するメッセージも削除される", async () => {
      // Arrange - メッセージを追加
      await repository.save({
        id: "msg-1101",
        sessionId: "session-test",
        role: "user",
        content: "Message in session",
        messageIndex: 0,
        timestamp: "2024-01-01T00:00:00Z",
        llmProvider: null,
        llmModel: null,
        llmMetadata: null,
        attachments: [],
        systemPrompt: null,
        metadata: {},
      });

      // Act - セッションを削除
      sqlite
        .prepare("DELETE FROM chat_sessions WHERE id = ?")
        .run("session-test");

      // Assert - メッセージも削除されている
      const found = await repository.findById("msg-1101");
      expect(found).toBeNull();

      const messages = await repository.findBySessionId("session-test");
      expect(messages).toHaveLength(0);
    });
  });

  describe("count", () => {
    it("セッション内のメッセージ数を取得できる", async () => {
      // Arrange
      await repository.save({
        id: "msg-1201",
        sessionId: "session-test",
        role: "user",
        content: "Message 1",
        messageIndex: 0,
        timestamp: "2024-01-01T00:00:00Z",
        llmProvider: null,
        llmModel: null,
        llmMetadata: null,
        attachments: [],
        systemPrompt: null,
        metadata: {},
      });
      await repository.save({
        id: "msg-1202",
        sessionId: "session-test",
        role: "assistant",
        content: "Message 2",
        messageIndex: 1,
        timestamp: "2024-01-01T00:01:00Z",
        llmProvider: "anthropic",
        llmModel: "claude-3-5-sonnet-20241022",
        llmMetadata: {
          provider: "anthropic",
          model: "claude-3-5-sonnet-20241022",
        },
        attachments: [],
        systemPrompt: null,
        metadata: {},
      });

      // Act
      const count = await repository.count("session-test");

      // Assert
      expect(count).toBe(2);
    });

    it("メッセージがない場合、0を返す", async () => {
      // Act
      const count = await repository.count("session-test");

      // Assert
      expect(count).toBe(0);
    });
  });

  describe("exists", () => {
    it("メッセージが存在する場合、trueを返す", async () => {
      // Arrange
      await repository.save({
        id: "msg-1301",
        sessionId: "session-test",
        role: "user",
        content: "Existing message",
        messageIndex: 0,
        timestamp: "2024-01-01T00:00:00Z",
        llmProvider: null,
        llmModel: null,
        llmMetadata: null,
        attachments: [],
        systemPrompt: null,
        metadata: {},
      });

      // Act
      const exists = await repository.exists("msg-1301");

      // Assert
      expect(exists).toBe(true);
    });

    it("メッセージが存在しない場合、falseを返す", async () => {
      // Act
      const exists = await repository.exists("non-existent");

      // Assert
      expect(exists).toBe(false);
    });
  });
});
