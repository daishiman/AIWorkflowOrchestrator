/**
 * ChatHistoryService テスト
 *
 * @see docs/30-workflows/chat-history-persistence/requirements-functional.md
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { ChatHistoryService } from "../chat-history-service";
import { ChatSessionRepository } from "../../../repositories/chat-session-repository";
import { ChatMessageRepository } from "../../../repositories/chat-message-repository";
import type { LlmMetadata } from "../../../types/llm-metadata";

describe("ChatHistoryService", () => {
  let db: ReturnType<typeof drizzle>;
  let sqlite: Database.Database;
  let service: ChatHistoryService;
  let sessionRepository: ChatSessionRepository;
  let messageRepository: ChatMessageRepository;

  beforeEach(() => {
    // In-memory SQLite database for testing
    sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");

    // Create tables
    sqlite.exec(`
      CREATE TABLE chat_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL CHECK(length(title) BETWEEN 3 AND 100),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        message_count INTEGER NOT NULL DEFAULT 0 CHECK(message_count >= 0),
        is_favorite INTEGER NOT NULL DEFAULT 0 CHECK(is_favorite IN (0, 1)),
        is_pinned INTEGER NOT NULL DEFAULT 0 CHECK(is_pinned IN (0, 1)),
        pin_order INTEGER CHECK(pin_order BETWEEN 1 AND 10),
        last_message_preview TEXT CHECK(length(last_message_preview) <= 50),
        metadata TEXT NOT NULL DEFAULT '{}',
        deleted_at TEXT
      );

      CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
      CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at DESC);

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

      -- FTS5全文検索テーブル（キーワード検索用）
      -- 通常モード(独自のコンテンツコピーを持つ)で作成
      CREATE VIRTUAL TABLE chat_sessions_fts USING fts5(
        id UNINDEXED,
        title,
        last_message_preview
      );

      CREATE TRIGGER chat_sessions_fts_insert AFTER INSERT ON chat_sessions BEGIN
        INSERT INTO chat_sessions_fts(id, title, last_message_preview)
        VALUES (new.id, new.title, new.last_message_preview);
      END;

      CREATE TRIGGER chat_sessions_fts_update AFTER UPDATE ON chat_sessions BEGIN
        DELETE FROM chat_sessions_fts WHERE id = old.id;
        INSERT INTO chat_sessions_fts(id, title, last_message_preview)
        VALUES (new.id, new.title, new.last_message_preview);
      END;

      CREATE TRIGGER chat_sessions_fts_delete AFTER DELETE ON chat_sessions BEGIN
        DELETE FROM chat_sessions_fts WHERE id = old.id;
      END;
    `);

    db = drizzle(sqlite);
    sessionRepository = new ChatSessionRepository(db);
    messageRepository = new ChatMessageRepository(db);
    service = new ChatHistoryService(sessionRepository, messageRepository);
  });

  afterEach(() => {
    sqlite.close();
  });

  describe("createSession", () => {
    it("新しいセッションを作成できる（FR-001）", async () => {
      // Act
      const session = await service.createSession("user-001");

      // Assert
      expect(session.id).toBeDefined();
      expect(session.userId).toBe("user-001");
      expect(session.title).toMatch(/^新しいチャット/);
      expect(session.messageCount).toBe(0);
      expect(session.isFavorite).toBe(false);
      expect(session.isPinned).toBe(false);
    });

    it("カスタムタイトルでセッションを作成できる", async () => {
      // Act
      const session = await service.createSession("user-001", {
        title: "React開発の質問",
      });

      // Assert
      expect(session.title).toBe("React開発の質問");
    });
  });

  describe("getSession", () => {
    it("IDでセッションを取得できる", async () => {
      // Arrange
      const created = await service.createSession("user-001", {
        title: "テストセッション",
      });

      // Act
      const session = await service.getSession(created.id);

      // Assert
      expect(session).toBeDefined();
      expect(session?.id).toBe(created.id);
      expect(session?.title).toBe("テストセッション");
    });

    it("存在しないセッションはnullを返す", async () => {
      // Act
      const session = await service.getSession("non-existent");

      // Assert
      expect(session).toBeNull();
    });
  });

  describe("listSessions", () => {
    it("ユーザーのセッション一覧を取得できる（FR-002）", async () => {
      // Arrange
      await service.createSession("user-001", { title: "Session 1" });
      await service.createSession("user-001", { title: "Session 2" });
      await service.createSession("user-002", { title: "Other User" });

      // Act
      const sessions = await service.listSessions("user-001");

      // Assert
      expect(sessions).toHaveLength(2);
      expect(sessions.every((s) => s.userId === "user-001")).toBe(true);
    });

    it("セッションは作成日時の降順でソートされる", async () => {
      // Arrange
      await service.createSession("user-001", { title: "First" });
      await new Promise((r) => setTimeout(r, 10));
      await service.createSession("user-001", { title: "Second" });

      // Act
      const sessions = await service.listSessions("user-001");

      // Assert
      expect(sessions[0].title).toBe("Second");
      expect(sessions[1].title).toBe("First");
    });
  });

  describe("deleteSession", () => {
    it("セッションを削除できる（FR-003）", async () => {
      // Arrange
      const session = await service.createSession("user-001");

      // Act
      const result = await service.deleteSession(session.id);

      // Assert
      expect(result).toBe(true);
      const found = await service.getSession(session.id);
      expect(found).toBeNull();
    });

    it("セッション削除時にメッセージも削除される（カスケード削除）", async () => {
      // Arrange
      const session = await service.createSession("user-001");
      await service.addUserMessage(session.id, "テストメッセージ");

      // Act
      await service.deleteSession(session.id);

      // Assert
      const messages = await messageRepository.findBySessionId(session.id);
      expect(messages).toHaveLength(0);
    });
  });

  describe("addUserMessage", () => {
    it("ユーザーメッセージを保存できる（FR-004）", async () => {
      // Arrange
      const session = await service.createSession("user-001");

      // Act
      const message = await service.addUserMessage(session.id, "こんにちは！");

      // Assert
      expect(message.id).toBeDefined();
      expect(message.sessionId).toBe(session.id);
      expect(message.role).toBe("user");
      expect(message.content).toBe("こんにちは！");
      expect(message.messageIndex).toBe(0);
    });

    it("メッセージ追加時にセッションのmessageCountが更新される", async () => {
      // Arrange
      const session = await service.createSession("user-001");

      // Act
      await service.addUserMessage(session.id, "メッセージ1");
      await service.addUserMessage(session.id, "メッセージ2");

      // Assert
      const updated = await service.getSession(session.id);
      expect(updated?.messageCount).toBe(2);
    });

    it("メッセージ追加時にlastMessagePreviewが更新される", async () => {
      // Arrange
      const session = await service.createSession("user-001");

      // Act
      await service.addUserMessage(session.id, "これは最後のメッセージです");

      // Assert
      const updated = await service.getSession(session.id);
      expect(updated?.lastMessagePreview).toBe("これは最後のメッセージです");
    });
  });

  describe("addAssistantMessage", () => {
    it("アシスタントメッセージをLLMメタデータ付きで保存できる（FR-005, FR-006）", async () => {
      // Arrange
      const session = await service.createSession("user-001");
      const llmMetadata: LlmMetadata = {
        provider: "anthropic",
        model: "claude-3-5-sonnet-20241022",
        tokenUsage: {
          inputTokens: 100,
          outputTokens: 200,
          totalTokens: 300,
        },
        responseTimeMs: 1500,
      };

      // Act
      const message = await service.addAssistantMessage(
        session.id,
        "こんにちは！お手伝いします。",
        llmMetadata,
      );

      // Assert
      expect(message.role).toBe("assistant");
      expect(message.llmProvider).toBe("anthropic");
      expect(message.llmModel).toBe("claude-3-5-sonnet-20241022");
      expect(message.llmMetadata).toEqual(llmMetadata);
    });
  });

  describe("getMessages", () => {
    it("セッションのメッセージ一覧を取得できる", async () => {
      // Arrange
      const session = await service.createSession("user-001");
      await service.addUserMessage(session.id, "質問です");
      await service.addAssistantMessage(session.id, "回答です", {
        provider: "anthropic",
        model: "claude-3-5-sonnet-20241022",
      });

      // Act
      const messages = await service.getMessages(session.id);

      // Assert
      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe("user");
      expect(messages[1].role).toBe("assistant");
    });

    it("メッセージはmessage_indexの昇順でソートされる", async () => {
      // Arrange
      const session = await service.createSession("user-001");
      await service.addUserMessage(session.id, "最初");
      await service.addUserMessage(session.id, "2番目");
      await service.addUserMessage(session.id, "3番目");

      // Act
      const messages = await service.getMessages(session.id);

      // Assert
      expect(messages[0].content).toBe("最初");
      expect(messages[1].content).toBe("2番目");
      expect(messages[2].content).toBe("3番目");
    });
  });

  describe("searchSessions", () => {
    it("キーワードでセッションを検索できる（FR-007）", async () => {
      // Arrange
      await service.createSession("user-001", { title: "React Hooks入門" });
      await service.createSession("user-001", { title: "Vue.js基礎" });
      await service.createSession("user-001", { title: "React Router" });

      // Act
      const results = await service.searchSessions("user-001", {
        query: "React",
      });

      // Assert
      expect(results).toHaveLength(2);
    });

    it("お気に入りでフィルタできる（FR-014）", async () => {
      // Arrange
      const session1 = await service.createSession("user-001", {
        title: "Session 1",
      });
      await service.createSession("user-001", { title: "Session 2" });
      await service.updateSession(session1.id, { isFavorite: true });

      // Act
      const results = await service.searchSessions("user-001", {
        isFavorite: true,
      });

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(session1.id);
    });
  });

  describe("updateSession", () => {
    it("セッションタイトルを更新できる（FR-013）", async () => {
      // Arrange
      const session = await service.createSession("user-001");

      // Act
      await service.updateSession(session.id, { title: "更新後のタイトル" });

      // Assert
      const updated = await service.getSession(session.id);
      expect(updated?.title).toBe("更新後のタイトル");
    });

    it("お気に入りフラグを更新できる", async () => {
      // Arrange
      const session = await service.createSession("user-001");

      // Act
      await service.updateSession(session.id, { isFavorite: true });

      // Assert
      const updated = await service.getSession(session.id);
      expect(updated?.isFavorite).toBe(true);
    });
  });

  describe("exportToMarkdown", () => {
    it("セッションをMarkdown形式でエクスポートできる（FR-010）", async () => {
      // Arrange
      const session = await service.createSession("user-001", {
        title: "React開発の質問",
      });
      await service.addUserMessage(session.id, "useEffectについて教えて");
      await service.addAssistantMessage(
        session.id,
        "useEffectは副作用を扱うHookです",
        {
          provider: "anthropic",
          model: "claude-3-5-sonnet-20241022",
        },
      );

      // Act
      const markdown = await service.exportToMarkdown(session.id);

      // Assert
      expect(markdown).toContain("# React開発の質問");
      expect(markdown).toContain("## ユーザー");
      expect(markdown).toContain("useEffectについて教えて");
      expect(markdown).toContain("## アシスタント");
      expect(markdown).toContain("useEffectは副作用を扱うHookです");
    });

    it("メタデータを含めてエクスポートできる", async () => {
      // Arrange
      const session = await service.createSession("user-001", {
        title: "テスト",
      });
      await service.addAssistantMessage(session.id, "回答", {
        provider: "anthropic",
        model: "claude-3-5-sonnet-20241022",
        tokenUsage: { inputTokens: 50, outputTokens: 100 },
      });

      // Act
      const markdown = await service.exportToMarkdown(session.id, {
        includeMetadata: true,
      });

      // Assert
      expect(markdown).toContain("claude-3-5-sonnet-20241022");
      expect(markdown).toContain("トークン");
    });
  });

  describe("exportToJson", () => {
    it("セッションをJSON形式でエクスポートできる（FR-011）", async () => {
      // Arrange
      const session = await service.createSession("user-001", {
        title: "JSONエクスポートテスト",
      });
      await service.addUserMessage(session.id, "テストメッセージ");

      // Act
      const json = await service.exportToJson(session.id);
      const parsed = JSON.parse(json);

      // Assert
      expect(parsed.session.title).toBe("JSONエクスポートテスト");
      expect(parsed.messages).toHaveLength(1);
      expect(parsed.messages[0].content).toBe("テストメッセージ");
      expect(parsed.exportedAt).toBeDefined();
      expect(parsed.version).toBe("1.0.0");
    });
  });
});
