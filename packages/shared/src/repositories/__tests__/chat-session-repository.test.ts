import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { ChatSessionRepository } from "../chat-session-repository";
import type { ChatSession } from "../../types/chat-session";

describe("ChatSessionRepository", () => {
  let db: ReturnType<typeof drizzle>;
  let sqlite: Database.Database;
  let repository: ChatSessionRepository;

  beforeEach(() => {
    // In-memory SQLite database for testing
    sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");

    // Create chat_sessions table
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
      CREATE INDEX idx_chat_sessions_is_pinned ON chat_sessions(user_id, is_pinned, pin_order);
      CREATE INDEX idx_chat_sessions_deleted_at ON chat_sessions(deleted_at);

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
    repository = new ChatSessionRepository(db);
  });

  afterEach(() => {
    sqlite.close();
  });

  describe("save", () => {
    it("新しいセッションを保存できる", async () => {
      // Arrange
      const session: ChatSession = {
        id: "session-001",
        userId: "user-001",
        title: "Test Session",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      };

      // Act
      await repository.save(session);
      const found = await repository.findById(session.id);

      // Assert
      expect(found).toEqual(session);
    });

    it("タイトルが空の場合、自動生成される（BR-SESSION-001）", async () => {
      // Arrange
      const session: ChatSession = {
        id: "session-002",
        userId: "user-001",
        title: "",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      };

      // Act
      await repository.save(session);
      const found = await repository.findById(session.id);

      // Assert
      expect(found?.title).toMatch(
        /^新しいチャット \d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
      );
    });

    it("タイトルが100文字を超える場合、エラーになる", async () => {
      // Arrange
      const session: ChatSession = {
        id: "session-003",
        userId: "user-001",
        title: "A".repeat(101),
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      };

      // Act & Assert
      await expect(repository.save(session)).rejects.toThrow();
    });

    it("タイトルが3文字未満の場合、エラーになる", async () => {
      // Arrange
      const session: ChatSession = {
        id: "session-004",
        userId: "user-001",
        title: "AB",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      };

      // Act & Assert
      await expect(repository.save(session)).rejects.toThrow();
    });

    it("ピン留めセッションが10件を超える場合、エラーになる（BR-SESSION-002）", async () => {
      // Arrange - 10件のピン留めセッションを作成
      for (let i = 1; i <= 10; i++) {
        await repository.save({
          id: `session-pin-${i}`,
          userId: "user-001",
          title: `Pinned Session ${i}`,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          messageCount: 0,
          isFavorite: false,
          isPinned: true,
          pinOrder: i,
          lastMessagePreview: null,
          metadata: {},
          deletedAt: null,
        });
      }

      const session11: ChatSession = {
        id: "session-pin-11",
        userId: "user-001",
        title: "11th Pinned Session",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: true,
        pinOrder: 11,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      };

      // Act & Assert
      await expect(repository.save(session11)).rejects.toThrow(
        /ピン留めは最大10件まで/,
      );
    });
  });

  describe("findById", () => {
    it("IDでセッションを取得できる", async () => {
      // Arrange
      const session: ChatSession = {
        id: "session-100",
        userId: "user-001",
        title: "Findable Session",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        messageCount: 5,
        isFavorite: true,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: "Last message...",
        metadata: { key: "value" },
        deletedAt: null,
      };
      await repository.save(session);

      // Act
      const found = await repository.findById("session-100");

      // Assert
      expect(found).toEqual(session);
    });

    it("存在しないIDの場合、nullを返す", async () => {
      // Act
      const found = await repository.findById("non-existent");

      // Assert
      expect(found).toBeNull();
    });

    it("論理削除されたセッションは取得できない", async () => {
      // Arrange
      const session: ChatSession = {
        id: "session-101",
        userId: "user-001",
        title: "Deleted Session",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: "2024-01-02T00:00:00Z",
      };
      await repository.save(session);

      // Act
      const found = await repository.findById("session-101");

      // Assert
      expect(found).toBeNull();
    });
  });

  describe("findByUserId", () => {
    it("ユーザーIDで全セッションを取得できる", async () => {
      // Arrange
      await repository.save({
        id: "session-201",
        userId: "user-001",
        title: "User 1 Session 1",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      });
      await repository.save({
        id: "session-202",
        userId: "user-001",
        title: "User 1 Session 2",
        createdAt: "2024-01-02T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      });
      await repository.save({
        id: "session-203",
        userId: "user-002",
        title: "User 2 Session 1",
        createdAt: "2024-01-03T00:00:00Z",
        updatedAt: "2024-01-03T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      });

      // Act
      const sessions = await repository.findByUserId("user-001");

      // Assert
      expect(sessions).toHaveLength(2);
      expect(sessions.map((s) => s.id)).toEqual(
        expect.arrayContaining(["session-201", "session-202"]),
      );
    });

    it("セッションが作成日時の降順でソートされる", async () => {
      // Arrange
      await repository.save({
        id: "session-301",
        userId: "user-001",
        title: "Oldest",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      });
      await repository.save({
        id: "session-302",
        userId: "user-001",
        title: "Newest",
        createdAt: "2024-01-03T00:00:00Z",
        updatedAt: "2024-01-03T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      });
      await repository.save({
        id: "session-303",
        userId: "user-001",
        title: "Middle",
        createdAt: "2024-01-02T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      });

      // Act
      const sessions = await repository.findByUserId("user-001");

      // Assert
      expect(sessions.map((s) => s.id)).toEqual([
        "session-302",
        "session-303",
        "session-301",
      ]);
    });

    it("論理削除されたセッションは含まれない", async () => {
      // Arrange
      await repository.save({
        id: "session-401",
        userId: "user-001",
        title: "Active Session",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      });
      await repository.save({
        id: "session-402",
        userId: "user-001",
        title: "Deleted Session",
        createdAt: "2024-01-02T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: "2024-01-03T00:00:00Z",
      });

      // Act
      const sessions = await repository.findByUserId("user-001");

      // Assert
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe("session-401");
    });
  });

  describe("findPinned", () => {
    it("ピン留めセッションを取得できる", async () => {
      // Arrange
      await repository.save({
        id: "session-501",
        userId: "user-001",
        title: "Pinned 1",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: true,
        pinOrder: 2,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      });
      await repository.save({
        id: "session-502",
        userId: "user-001",
        title: "Not Pinned",
        createdAt: "2024-01-02T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      });
      await repository.save({
        id: "session-503",
        userId: "user-001",
        title: "Pinned 2",
        createdAt: "2024-01-03T00:00:00Z",
        updatedAt: "2024-01-03T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: true,
        pinOrder: 1,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      });

      // Act
      const pinned = await repository.findPinned("user-001");

      // Assert
      expect(pinned).toHaveLength(2);
      expect(pinned.map((s) => s.id)).toEqual(["session-503", "session-501"]);
    });

    it("ピン留めセッションがpin_orderの昇順でソートされる", async () => {
      // Arrange
      await repository.save({
        id: "session-601",
        userId: "user-001",
        title: "Pin Order 3",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: true,
        pinOrder: 3,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      });
      await repository.save({
        id: "session-602",
        userId: "user-001",
        title: "Pin Order 1",
        createdAt: "2024-01-02T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: true,
        pinOrder: 1,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      });
      await repository.save({
        id: "session-603",
        userId: "user-001",
        title: "Pin Order 2",
        createdAt: "2024-01-03T00:00:00Z",
        updatedAt: "2024-01-03T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: true,
        pinOrder: 2,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      });

      // Act
      const pinned = await repository.findPinned("user-001");

      // Assert
      expect(pinned.map((s) => s.pinOrder)).toEqual([1, 2, 3]);
    });
  });

  describe("update", () => {
    it("セッションを更新できる", async () => {
      // Arrange
      await repository.save({
        id: "session-701",
        userId: "user-001",
        title: "Original Title",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      });

      // Act
      await repository.update("session-701", {
        title: "Updated Title",
        isFavorite: true,
        updatedAt: "2024-01-02T00:00:00Z",
      });
      const updated = await repository.findById("session-701");

      // Assert
      expect(updated?.title).toBe("Updated Title");
      expect(updated?.isFavorite).toBe(true);
      expect(updated?.updatedAt).toBe("2024-01-02T00:00:00Z");
    });

    it("messageCountを更新できる", async () => {
      // Arrange
      await repository.save({
        id: "session-702",
        userId: "user-001",
        title: "Message Count Test",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      });

      // Act
      await repository.update("session-702", { messageCount: 5 });
      const updated = await repository.findById("session-702");

      // Assert
      expect(updated?.messageCount).toBe(5);
    });

    it("lastMessagePreviewを更新できる（BR-SESSION-003）", async () => {
      // Arrange
      await repository.save({
        id: "session-703",
        userId: "user-001",
        title: "Preview Test",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      });

      // Act
      await repository.update("session-703", {
        lastMessagePreview: "This is the last message preview",
      });
      const updated = await repository.findById("session-703");

      // Assert
      expect(updated?.lastMessagePreview).toBe(
        "This is the last message preview",
      );
    });

    it("存在しないセッションの更新はfalseを返す", async () => {
      // Act
      const result = await repository.update("non-existent", {
        title: "New Title",
      });

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("delete", () => {
    it("セッションを論理削除できる", async () => {
      // Arrange
      await repository.save({
        id: "session-801",
        userId: "user-001",
        title: "To Be Deleted",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      });

      // Act
      const result = await repository.delete("session-801");
      const found = await repository.findById("session-801");

      // Assert
      expect(result).toBe(true);
      expect(found).toBeNull();
    });

    it("論理削除後、deleted_atがセットされる", async () => {
      // Arrange
      await repository.save({
        id: "session-802",
        userId: "user-001",
        title: "Delete Test",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      });

      // Act
      await repository.delete("session-802");

      // Assert (直接DBから取得してdeleted_atを確認)
      const raw = sqlite
        .prepare("SELECT * FROM chat_sessions WHERE id = ?")
        .get("session-802") as any;
      expect(raw.deleted_at).not.toBeNull();
    });

    it("存在しないセッションの削除はfalseを返す", async () => {
      // Act
      const result = await repository.delete("non-existent");

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("search", () => {
    beforeEach(async () => {
      // テスト用データ準備
      await repository.save({
        id: "session-901",
        userId: "user-001",
        title: "React hooks tutorial",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        messageCount: 10,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: "useState and useEffect basics",
        metadata: {},
        deletedAt: null,
      });
      await repository.save({
        id: "session-902",
        userId: "user-001",
        title: "TypeScript generics guide",
        createdAt: "2024-01-02T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z",
        messageCount: 5,
        isFavorite: true,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: "Generic constraints and utility types",
        metadata: {},
        deletedAt: null,
      });
      await repository.save({
        id: "session-903",
        userId: "user-001",
        title: "Database optimization techniques",
        createdAt: "2024-01-03T00:00:00Z",
        updatedAt: "2024-01-03T00:00:00Z",
        messageCount: 3,
        isFavorite: false,
        isPinned: true,
        pinOrder: 1,
        lastMessagePreview: "Indexing and query performance",
        metadata: {},
        deletedAt: null,
      });
    });

    it("タイトルで検索できる", async () => {
      // Act
      const results = await repository.search({
        userId: "user-001",
        query: "React",
      });

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("session-901");
    });

    it("プレビューで検索できる", async () => {
      // Act
      const results = await repository.search({
        userId: "user-001",
        query: "performance",
      });

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("session-903");
    });

    it("複数の検索語を含む結果を取得できる", async () => {
      // Act
      const results = await repository.search({
        userId: "user-001",
        query: "TypeScript types",
      });

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("session-902");
    });

    it("isFavoriteでフィルタできる", async () => {
      // Act
      const results = await repository.search({
        userId: "user-001",
        isFavorite: true,
      });

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("session-902");
    });

    it("isPinnedでフィルタできる", async () => {
      // Act
      const results = await repository.search({
        userId: "user-001",
        isPinned: true,
      });

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("session-903");
    });

    it("limitで結果件数を制限できる", async () => {
      // Act
      const results = await repository.search({
        userId: "user-001",
        limit: 2,
      });

      // Assert
      expect(results.length).toBeLessThanOrEqual(2);
    });

    it("offsetでページネーションできる", async () => {
      // Act
      const page1 = await repository.search({
        userId: "user-001",
        limit: 2,
        offset: 0,
      });
      const page2 = await repository.search({
        userId: "user-001",
        limit: 2,
        offset: 2,
      });

      // Assert
      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(1);
      expect(page1.map((s) => s.id)).not.toContain(page2[0]?.id);
    });

    it("論理削除されたセッションは検索結果に含まれない", async () => {
      // Arrange
      await repository.delete("session-901");

      // Act
      const results = await repository.search({
        userId: "user-001",
        query: "React",
      });

      // Assert
      expect(results).toHaveLength(0);
    });
  });

  describe("count", () => {
    it("ユーザーの総セッション数を取得できる", async () => {
      // Arrange
      await repository.save({
        id: "session-1001",
        userId: "user-001",
        title: "Session 1",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      });
      await repository.save({
        id: "session-1002",
        userId: "user-001",
        title: "Session 2",
        createdAt: "2024-01-02T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      });
      await repository.save({
        id: "session-1003",
        userId: "user-002",
        title: "Other User Session",
        createdAt: "2024-01-03T00:00:00Z",
        updatedAt: "2024-01-03T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      });

      // Act
      const count = await repository.count("user-001");

      // Assert
      expect(count).toBe(2);
    });

    it("論理削除されたセッションはカウントされない", async () => {
      // Arrange
      await repository.save({
        id: "session-1101",
        userId: "user-001",
        title: "Active",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      });
      await repository.save({
        id: "session-1102",
        userId: "user-001",
        title: "Deleted",
        createdAt: "2024-01-02T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: "2024-01-03T00:00:00Z",
      });

      // Act
      const count = await repository.count("user-001");

      // Assert
      expect(count).toBe(1);
    });
  });

  describe("exists", () => {
    it("セッションが存在する場合、trueを返す", async () => {
      // Arrange
      await repository.save({
        id: "session-1201",
        userId: "user-001",
        title: "Existing Session",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: null,
      });

      // Act
      const exists = await repository.exists("session-1201");

      // Assert
      expect(exists).toBe(true);
    });

    it("セッションが存在しない場合、falseを返す", async () => {
      // Act
      const exists = await repository.exists("non-existent");

      // Assert
      expect(exists).toBe(false);
    });

    it("論理削除されたセッションはfalseを返す", async () => {
      // Arrange
      await repository.save({
        id: "session-1202",
        userId: "user-001",
        title: "Deleted Session",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        messageCount: 0,
        isFavorite: false,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: null,
        metadata: {},
        deletedAt: "2024-01-02T00:00:00Z",
      });

      // Act
      const exists = await repository.exists("session-1202");

      // Assert
      expect(exists).toBe(false);
    });
  });
});
