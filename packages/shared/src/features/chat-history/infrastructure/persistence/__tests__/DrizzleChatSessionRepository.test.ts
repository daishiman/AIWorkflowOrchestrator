/**
 * DrizzleChatSessionRepository テスト
 *
 * TDD Red Phase: 実装前の失敗するテストケース
 *
 * @module features/chat-history/infrastructure/persistence/__tests__/DrizzleChatSessionRepository
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createTestDatabase,
  TestDataFactory,
  type TestDatabase,
} from "./helpers/test-db.js";
import { DrizzleChatSessionRepository } from "../DrizzleChatSessionRepository.js";
import { ChatSession } from "../../../domain/entities/ChatSession.js";
import { ChatSessionId } from "../../../domain/value-objects/ChatSessionId.js";
import { UserId } from "../../../domain/value-objects/UserId.js";
import type { ChatSessionSearchCriteria } from "../../../domain/repositories/IChatSessionRepository.js";

describe("DrizzleChatSessionRepository", () => {
  let testDb: TestDatabase;
  let repository: DrizzleChatSessionRepository;

  beforeEach(() => {
    testDb = createTestDatabase();
    repository = new DrizzleChatSessionRepository(testDb.db);
  });

  afterEach(() => {
    testDb.close();
  });

  // ============================================================
  // findById テスト
  // ============================================================
  describe("findById", () => {
    it("存在するセッションを取得できる", async () => {
      // Arrange
      const session = TestDataFactory.createSession({
        id: "550e8400-e29b-41d4-a716-446655440001",
        userId: "user-1",
        title: "テストセッション",
      });
      await repository.save(session);

      // Act
      const result = await repository.findById(
        ChatSessionId.fromString(session.id.value),
      );

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id.value).toBe(session.id.value);
      expect(result?.title.value).toBe("テストセッション");
    });

    it("存在しないIDの場合nullを返す", async () => {
      // Arrange
      const nonExistentId = ChatSessionId.fromString(
        "550e8400-e29b-41d4-a716-446655440999",
      );

      // Act
      const result = await repository.findById(nonExistentId);

      // Assert
      expect(result).toBeNull();
    });

    it("削除済みセッションは取得できない", async () => {
      // Arrange: ソフトデリートされたセッションを直接DBに挿入
      const sessionId = "550e8400-e29b-41d4-a716-446655440002";
      testDb.sqlite.exec(`
        INSERT INTO chat_sessions (id, user_id, title, created_at, updated_at, deleted_at)
        VALUES ('${sessionId}', 'user-1', 'Deleted Session', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', '2026-01-02T00:00:00.000Z')
      `);

      // Act
      const result = await repository.findById(
        ChatSessionId.fromString(sessionId),
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  // ============================================================
  // findByUserId テスト
  // ============================================================
  describe("findByUserId", () => {
    it("ユーザーのセッション一覧を取得できる", async () => {
      // Arrange
      const userId = UserId.fromString("user-1");
      const sessions = TestDataFactory.createSessions(3, { userId: "user-1" });
      for (const session of sessions) {
        await repository.save(session);
      }

      // Act
      const result = await repository.findByUserId(userId);

      // Assert
      expect(result).toHaveLength(3);
    });

    it("ページネーション（limit）が正しく動作する", async () => {
      // Arrange
      const userId = UserId.fromString("user-1");
      const sessions = TestDataFactory.createSessions(5, { userId: "user-1" });
      for (const session of sessions) {
        await repository.save(session);
      }

      // Act
      const result = await repository.findByUserId(userId, 2);

      // Assert
      expect(result).toHaveLength(2);
    });

    it("ページネーション（limit + offset）が正しく動作する", async () => {
      // Arrange
      const userId = UserId.fromString("user-1");
      const sessions = TestDataFactory.createSessions(5, { userId: "user-1" });
      for (const session of sessions) {
        await repository.save(session);
      }

      // Act
      const result = await repository.findByUserId(userId, 2, 2);

      // Assert
      expect(result).toHaveLength(2);
    });

    it("updatedAt降順でソートされる", async () => {
      // Arrange
      const userId = UserId.fromString("user-1");
      const oldSession = TestDataFactory.createSession({
        userId: "user-1",
        title: "古いセッション",
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      });
      const newSession = TestDataFactory.createSession({
        userId: "user-1",
        title: "新しいセッション",
        updatedAt: new Date("2026-01-02T00:00:00.000Z"),
      });
      await repository.save(oldSession);
      await repository.save(newSession);

      // Act
      const result = await repository.findByUserId(userId);

      // Assert
      expect(result[0].title.value).toBe("新しいセッション");
      expect(result[1].title.value).toBe("古いセッション");
    });

    it("セッションがない場合空配列を返す", async () => {
      // Arrange
      const userId = UserId.fromString("user-no-sessions");

      // Act
      const result = await repository.findByUserId(userId);

      // Assert
      expect(result).toEqual([]);
    });

    it("他ユーザーのセッションは取得されない", async () => {
      // Arrange
      const userId1 = UserId.fromString("user-1");
      const _userId2 = UserId.fromString("user-2");
      await repository.save(
        TestDataFactory.createSession({ userId: "user-1" }),
      );
      await repository.save(
        TestDataFactory.createSession({ userId: "user-2" }),
      );

      // Act
      const result = await repository.findByUserId(userId1);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].userId.value).toBe("user-1");
    });
  });

  // ============================================================
  // findPinned テスト
  // ============================================================
  describe("findPinned", () => {
    it("ピン留めセッション一覧をpinOrder順で取得できる", async () => {
      // Arrange
      const userId = UserId.fromString("user-1");
      const pinnedSession1 = TestDataFactory.createSession({
        userId: "user-1",
        title: "Pinned 1",
        isPinned: true,
        pinOrder: 2,
      });
      const pinnedSession2 = TestDataFactory.createSession({
        userId: "user-1",
        title: "Pinned 2",
        isPinned: true,
        pinOrder: 1,
      });
      const unpinnedSession = TestDataFactory.createSession({
        userId: "user-1",
        title: "Not Pinned",
        isPinned: false,
      });
      await repository.save(pinnedSession1);
      await repository.save(pinnedSession2);
      await repository.save(unpinnedSession);

      // Act
      const result = await repository.findPinned(userId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].title.value).toBe("Pinned 2"); // pinOrder: 1
      expect(result[1].title.value).toBe("Pinned 1"); // pinOrder: 2
    });

    it("ピン留めセッションがない場合空配列を返す", async () => {
      // Arrange
      const userId = UserId.fromString("user-1");
      await repository.save(
        TestDataFactory.createSession({ userId: "user-1", isPinned: false }),
      );

      // Act
      const result = await repository.findPinned(userId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  // ============================================================
  // search テスト
  // ============================================================
  describe("search", () => {
    it("キーワードでタイトル検索できる", async () => {
      // Arrange
      const userId = UserId.fromString("user-1");
      await repository.save(
        TestDataFactory.createSession({
          userId: "user-1",
          title: "React Tutorial",
        }),
      );
      await repository.save(
        TestDataFactory.createSession({ userId: "user-1", title: "Vue Guide" }),
      );
      await repository.save(
        TestDataFactory.createSession({
          userId: "user-1",
          title: "React Advanced",
        }),
      );

      const criteria: ChatSessionSearchCriteria = {
        userId,
        keyword: "React",
      };

      // Act
      const result = await repository.search(criteria);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every((s) => s.title.value.includes("React"))).toBe(true);
    });

    it("お気に入りフィルターが動作する", async () => {
      // Arrange
      const userId = UserId.fromString("user-1");
      await repository.save(
        TestDataFactory.createSession({
          userId: "user-1",
          title: "Favorite",
          isFavorite: true,
        }),
      );
      await repository.save(
        TestDataFactory.createSession({
          userId: "user-1",
          title: "Normal",
          isFavorite: false,
        }),
      );

      const criteria: ChatSessionSearchCriteria = {
        userId,
        isFavorite: true,
      };

      // Act
      const result = await repository.search(criteria);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].title.value).toBe("Favorite");
    });

    it("ピン留めフィルターが動作する", async () => {
      // Arrange
      const userId = UserId.fromString("user-1");
      await repository.save(
        TestDataFactory.createSession({
          userId: "user-1",
          title: "Pinned",
          isPinned: true,
          pinOrder: 1,
        }),
      );
      await repository.save(
        TestDataFactory.createSession({
          userId: "user-1",
          title: "Normal",
          isPinned: false,
        }),
      );

      const criteria: ChatSessionSearchCriteria = {
        userId,
        isPinned: true,
      };

      // Act
      const result = await repository.search(criteria);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].title.value).toBe("Pinned");
    });

    it("複合条件で検索できる", async () => {
      // Arrange
      const userId = UserId.fromString("user-1");
      await repository.save(
        TestDataFactory.createSession({
          userId: "user-1",
          title: "React Favorite",
          isFavorite: true,
        }),
      );
      await repository.save(
        TestDataFactory.createSession({
          userId: "user-1",
          title: "React Normal",
          isFavorite: false,
        }),
      );
      await repository.save(
        TestDataFactory.createSession({
          userId: "user-1",
          title: "Vue Favorite",
          isFavorite: true,
        }),
      );

      const criteria: ChatSessionSearchCriteria = {
        userId,
        keyword: "React",
        isFavorite: true,
      };

      // Act
      const result = await repository.search(criteria);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].title.value).toBe("React Favorite");
    });

    it("検索結果なしの場合空配列を返す", async () => {
      // Arrange
      const userId = UserId.fromString("user-1");
      await repository.save(
        TestDataFactory.createSession({
          userId: "user-1",
          title: "JavaScript",
        }),
      );

      const criteria: ChatSessionSearchCriteria = {
        userId,
        keyword: "Python",
      };

      // Act
      const result = await repository.search(criteria);

      // Assert
      expect(result).toEqual([]);
    });

    it("検索結果にページネーションが適用される", async () => {
      // Arrange
      const userId = UserId.fromString("user-1");
      for (let i = 0; i < 10; i++) {
        await repository.save(
          TestDataFactory.createSession({
            userId: "user-1",
            title: `React ${i}`,
          }),
        );
      }

      const criteria: ChatSessionSearchCriteria = {
        userId,
        keyword: "React",
        limit: 3,
        offset: 0,
      };

      // Act
      const result = await repository.search(criteria);

      // Assert
      expect(result).toHaveLength(3);
    });
  });

  // ============================================================
  // save テスト
  // ============================================================
  describe("save", () => {
    it("新規セッションを作成できる", async () => {
      // Arrange
      const session = TestDataFactory.createSession({
        id: "550e8400-e29b-41d4-a716-446655440010",
        userId: "user-1",
        title: "New Session",
      });

      // Act
      await repository.save(session);

      // Assert
      const saved = await repository.findById(
        ChatSessionId.fromString(session.id.value),
      );
      expect(saved).not.toBeNull();
      expect(saved?.title.value).toBe("New Session");
    });

    it("既存セッションを更新できる（Upsert）", async () => {
      // Arrange
      const session = TestDataFactory.createSession({
        id: "550e8400-e29b-41d4-a716-446655440011",
        userId: "user-1",
        title: "Original Title",
      });
      await repository.save(session);

      // 再構築して更新
      const updatedSession = ChatSession.reconstitute({
        id: session.id.value,
        userId: session.userId.value,
        title: "Updated Title",
        messageCount: 5,
        isFavorite: true,
        isPinned: false,
        pinOrder: null,
        lastMessagePreview: "Last message",
        createdAt: session.createdAt,
        updatedAt: new Date(),
      });

      // Act
      await repository.save(updatedSession);

      // Assert
      const saved = await repository.findById(
        ChatSessionId.fromString(session.id.value),
      );
      expect(saved?.title.value).toBe("Updated Title");
      expect(saved?.messageCount).toBe(5);
      expect(saved?.isFavorite).toBe(true);
    });

    it("全フィールドが正しく保存される", async () => {
      // Arrange
      const now = new Date();
      const session = ChatSession.reconstitute({
        id: "550e8400-e29b-41d4-a716-446655440012",
        userId: "user-123",
        title: "Complete Session",
        messageCount: 10,
        isFavorite: true,
        isPinned: true,
        pinOrder: 3,
        lastMessagePreview: "Last preview text",
        createdAt: now,
        updatedAt: now,
      });

      // Act
      await repository.save(session);

      // Assert
      const saved = await repository.findById(
        ChatSessionId.fromString(session.id.value),
      );
      expect(saved).not.toBeNull();
      expect(saved?.userId.value).toBe("user-123");
      expect(saved?.title.value).toBe("Complete Session");
      expect(saved?.messageCount).toBe(10);
      expect(saved?.isFavorite).toBe(true);
      expect(saved?.isPinned).toBe(true);
      expect(saved?.pinOrder).toBe(3);
      expect(saved?.lastMessagePreview).toBe("Last preview text");
    });
  });

  // ============================================================
  // delete テスト
  // ============================================================
  describe("delete", () => {
    it("セッションを削除できる", async () => {
      // Arrange
      const session = TestDataFactory.createSession({
        id: "550e8400-e29b-41d4-a716-446655440020",
        userId: "user-1",
      });
      await repository.save(session);

      // Act
      await repository.delete(ChatSessionId.fromString(session.id.value));

      // Assert
      const result = await repository.findById(
        ChatSessionId.fromString(session.id.value),
      );
      expect(result).toBeNull();
    });

    it("存在しないIDでもエラーにならない", async () => {
      // Arrange
      const nonExistentId = ChatSessionId.fromString(
        "550e8400-e29b-41d4-a716-446655440999",
      );

      // Act & Assert
      await expect(repository.delete(nonExistentId)).resolves.not.toThrow();
    });
  });

  // ============================================================
  // exists テスト
  // ============================================================
  describe("exists", () => {
    it("存在するセッションでtrueを返す", async () => {
      // Arrange
      const session = TestDataFactory.createSession({
        id: "550e8400-e29b-41d4-a716-446655440030",
        userId: "user-1",
      });
      await repository.save(session);

      // Act
      const result = await repository.exists(
        ChatSessionId.fromString(session.id.value),
      );

      // Assert
      expect(result).toBe(true);
    });

    it("存在しないセッションでfalseを返す", async () => {
      // Arrange
      const nonExistentId = ChatSessionId.fromString(
        "550e8400-e29b-41d4-a716-446655440999",
      );

      // Act
      const result = await repository.exists(nonExistentId);

      // Assert
      expect(result).toBe(false);
    });

    it("削除済みセッションでfalseを返す", async () => {
      // Arrange: ソフトデリートされたセッションを直接DBに挿入
      const sessionId = "550e8400-e29b-41d4-a716-446655440031";
      testDb.sqlite.exec(`
        INSERT INTO chat_sessions (id, user_id, title, created_at, updated_at, deleted_at)
        VALUES ('${sessionId}', 'user-1', 'Deleted Session', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', '2026-01-02T00:00:00.000Z')
      `);

      // Act
      const result = await repository.exists(
        ChatSessionId.fromString(sessionId),
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  // ============================================================
  // countPinned テスト
  // ============================================================
  describe("countPinned", () => {
    it("ピン留め数を正しくカウントする", async () => {
      // Arrange
      const userId = UserId.fromString("user-1");
      await repository.save(
        TestDataFactory.createSession({
          userId: "user-1",
          isPinned: true,
          pinOrder: 1,
        }),
      );
      await repository.save(
        TestDataFactory.createSession({
          userId: "user-1",
          isPinned: true,
          pinOrder: 2,
        }),
      );
      await repository.save(
        TestDataFactory.createSession({ userId: "user-1", isPinned: false }),
      );

      // Act
      const result = await repository.countPinned(userId);

      // Assert
      expect(result).toBe(2);
    });

    it("ピン留めなしの場合0を返す", async () => {
      // Arrange
      const userId = UserId.fromString("user-1");
      await repository.save(
        TestDataFactory.createSession({ userId: "user-1", isPinned: false }),
      );

      // Act
      const result = await repository.countPinned(userId);

      // Assert
      expect(result).toBe(0);
    });

    it("他ユーザーのピン留めはカウントされない", async () => {
      // Arrange
      const userId1 = UserId.fromString("user-1");
      await repository.save(
        TestDataFactory.createSession({
          userId: "user-1",
          isPinned: true,
          pinOrder: 1,
        }),
      );
      await repository.save(
        TestDataFactory.createSession({
          userId: "user-2",
          isPinned: true,
          pinOrder: 1,
        }),
      );

      // Act
      const result = await repository.countPinned(userId1);

      // Assert
      expect(result).toBe(1);
    });
  });

  // ============================================================
  // エラーケーステスト
  // ============================================================
  describe("エラーハンドリング", () => {
    it("不正なDBインスタンスでエラーがスローされる", async () => {
      // Arrange

      const brokenDb = {} as any;
      const brokenRepository = new DrizzleChatSessionRepository(brokenDb);

      // Act & Assert
      await expect(
        brokenRepository.findById(
          ChatSessionId.fromString("550e8400-e29b-41d4-a716-446655440000"),
        ),
      ).rejects.toThrow();
    });
  });

  // ============================================================
  // 境界値テスト
  // ============================================================
  describe("境界値テスト", () => {
    it("limit=0の場合空配列を返す", async () => {
      // Arrange
      const userId = UserId.fromString("user-1");
      await repository.save(
        TestDataFactory.createSession({ userId: "user-1" }),
      );

      // Act
      const result = await repository.findByUserId(userId, 0);

      // Assert
      expect(result).toEqual([]);
    });

    it("長いタイトルのセッションを保存できる", async () => {
      // Arrange
      const longTitle = "A".repeat(100); // 最大100文字
      const session = TestDataFactory.createSession({
        id: "550e8400-e29b-41d4-a716-446655440040",
        userId: "user-1",
        title: longTitle,
      });

      // Act
      await repository.save(session);

      // Assert
      const saved = await repository.findById(
        ChatSessionId.fromString(session.id.value),
      );
      expect(saved?.title.value).toBe(longTitle);
    });

    it("特殊文字を含むタイトルを保存できる", async () => {
      // Arrange
      const specialTitle = "テスト🎉<script>alert('xss')</script>";
      const session = TestDataFactory.createSession({
        id: "550e8400-e29b-41d4-a716-446655440041",
        userId: "user-1",
        title: specialTitle,
      });

      // Act
      await repository.save(session);

      // Assert
      const saved = await repository.findById(
        ChatSessionId.fromString(session.id.value),
      );
      expect(saved?.title.value).toBe(specialTitle);
    });

    it("大量データ（100件）を処理できる", async () => {
      // Arrange
      const userId = UserId.fromString("user-bulk");
      const sessions = TestDataFactory.createSessions(100, {
        userId: "user-bulk",
      });
      for (const session of sessions) {
        await repository.save(session);
      }

      // Act
      const result = await repository.findByUserId(userId, 100);

      // Assert
      expect(result).toHaveLength(100);
    });

    it("日本語タイトルの検索ができる", async () => {
      // Arrange
      const userId = UserId.fromString("user-jp");
      await repository.save(
        TestDataFactory.createSession({
          userId: "user-jp",
          title: "ひらがなテスト",
        }),
      );
      await repository.save(
        TestDataFactory.createSession({
          userId: "user-jp",
          title: "カタカナテスト",
        }),
      );
      await repository.save(
        TestDataFactory.createSession({
          userId: "user-jp",
          title: "漢字検索テスト",
        }),
      );

      // Act
      const criteria: ChatSessionSearchCriteria = {
        userId,
        keyword: "テスト",
      };
      const result = await repository.search(criteria);

      // Assert
      expect(result).toHaveLength(3);
    });

    it("同一秒に作成された複数セッションを正しくソートする", async () => {
      // Arrange
      const userId = UserId.fromString("user-same-time");
      const now = new Date();
      for (let i = 0; i < 5; i++) {
        await repository.save(
          TestDataFactory.createSession({
            userId: "user-same-time",
            title: `Session ${i}`,
            createdAt: now,
            updatedAt: new Date(now.getTime() + i), // ミリ秒で差をつける
          }),
        );
      }

      // Act
      const result = await repository.findByUserId(userId);

      // Assert
      expect(result).toHaveLength(5);
      // updatedAt降順なので、最後に作成されたものが最初
      expect(result[0].title.value).toBe("Session 4");
    });
  });

  // ============================================================
  // 追加エラーハンドリングテスト
  // ============================================================
  describe("追加エラーハンドリング", () => {
    it("findByUserIdでエラーが発生した場合DatabaseErrorをスロー", async () => {
      // Arrange
      const brokenDb = {} as any;
      const brokenRepository = new DrizzleChatSessionRepository(brokenDb);

      // Act & Assert
      await expect(
        brokenRepository.findByUserId(UserId.fromString("user-1")),
      ).rejects.toThrow();
    });

    it("searchでエラーが発生した場合DatabaseErrorをスロー", async () => {
      // Arrange
      const brokenDb = {} as any;
      const brokenRepository = new DrizzleChatSessionRepository(brokenDb);

      // Act & Assert
      await expect(
        brokenRepository.search({
          userId: UserId.fromString("user-1"),
          keyword: "test",
        }),
      ).rejects.toThrow();
    });

    it("saveでエラーが発生した場合DatabaseErrorをスロー", async () => {
      // Arrange
      const brokenDb = {} as any;
      const brokenRepository = new DrizzleChatSessionRepository(brokenDb);
      const session = TestDataFactory.createSession();

      // Act & Assert
      await expect(brokenRepository.save(session)).rejects.toThrow();
    });

    it("existsでエラーが発生した場合DatabaseErrorをスロー", async () => {
      // Arrange
      const brokenDb = {} as any;
      const brokenRepository = new DrizzleChatSessionRepository(brokenDb);

      // Act & Assert
      await expect(
        brokenRepository.exists(
          ChatSessionId.fromString("550e8400-e29b-41d4-a716-446655440000"),
        ),
      ).rejects.toThrow();
    });

    it("countPinnedでエラーが発生した場合DatabaseErrorをスロー", async () => {
      // Arrange
      const brokenDb = {} as any;
      const brokenRepository = new DrizzleChatSessionRepository(brokenDb);

      // Act & Assert
      await expect(
        brokenRepository.countPinned(UserId.fromString("user-1")),
      ).rejects.toThrow();
    });

    it("deleteでエラーが発生した場合DatabaseErrorをスロー", async () => {
      // Arrange
      const brokenDb = {} as any;
      const brokenRepository = new DrizzleChatSessionRepository(brokenDb);

      // Act & Assert
      await expect(
        brokenRepository.delete(
          ChatSessionId.fromString("550e8400-e29b-41d4-a716-446655440000"),
        ),
      ).rejects.toThrow();
    });

    it("findPinnedでエラーが発生した場合DatabaseErrorをスロー", async () => {
      // Arrange
      const brokenDb = {} as any;
      const brokenRepository = new DrizzleChatSessionRepository(brokenDb);

      // Act & Assert
      await expect(
        brokenRepository.findPinned(UserId.fromString("user-1")),
      ).rejects.toThrow();
    });
  });
});
