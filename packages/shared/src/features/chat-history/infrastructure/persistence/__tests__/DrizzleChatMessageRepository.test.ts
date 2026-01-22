/**
 * DrizzleChatMessageRepository テスト
 *
 * TDD Red Phase: 実装前の失敗するテストケース
 *
 * @module features/chat-history/infrastructure/persistence/__tests__/DrizzleChatMessageRepository
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createTestDatabase,
  TestDataFactory,
  type TestDatabase,
} from "./helpers/test-db.js";
import { DrizzleChatMessageRepository } from "../DrizzleChatMessageRepository.js";
import { DrizzleChatSessionRepository } from "../DrizzleChatSessionRepository.js";
import { ChatMessage } from "../../../domain/entities/ChatMessage.js";
import { ChatMessageId } from "../../../domain/value-objects/ChatMessageId.js";
import { ChatSessionId } from "../../../domain/value-objects/ChatSessionId.js";

describe("DrizzleChatMessageRepository", () => {
  let testDb: TestDatabase;
  let messageRepository: DrizzleChatMessageRepository;
  let sessionRepository: DrizzleChatSessionRepository;

  // テスト用セッションID
  const testSessionId = "550e8400-e29b-41d4-a716-446655440100";

  beforeEach(async () => {
    testDb = createTestDatabase();
    messageRepository = new DrizzleChatMessageRepository(testDb.db);
    sessionRepository = new DrizzleChatSessionRepository(testDb.db);

    // テスト用セッションを作成
    const session = TestDataFactory.createSession({
      id: testSessionId,
      userId: "test-user",
      title: "Test Session",
    });
    await sessionRepository.save(session);
  });

  afterEach(() => {
    testDb.close();
  });

  // ============================================================
  // findById テスト
  // ============================================================
  describe("findById", () => {
    it("存在するメッセージを取得できる", async () => {
      // Arrange
      const message = TestDataFactory.createMessage(testSessionId, {
        id: "550e8400-e29b-41d4-a716-446655440201",
        content: "テストメッセージ",
        messageIndex: 0,
      });
      await messageRepository.save(message);

      // Act
      const result = await messageRepository.findById(
        ChatMessageId.fromString(message.id.value),
      );

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id.value).toBe(message.id.value);
      expect(result?.content.value).toBe("テストメッセージ");
    });

    it("存在しないIDの場合nullを返す", async () => {
      // Arrange
      const nonExistentId = ChatMessageId.fromString(
        "550e8400-e29b-41d4-a716-446655440999",
      );

      // Act
      const result = await messageRepository.findById(nonExistentId);

      // Assert
      expect(result).toBeNull();
    });
  });

  // ============================================================
  // findBySessionId テスト
  // ============================================================
  describe("findBySessionId", () => {
    it("セッション内の全メッセージを取得できる", async () => {
      // Arrange
      const messages = TestDataFactory.createMessages(testSessionId, 5);
      for (const message of messages) {
        await messageRepository.save(message);
      }

      // Act
      const result = await messageRepository.findBySessionId(
        ChatSessionId.fromString(testSessionId),
      );

      // Assert
      expect(result).toHaveLength(5);
    });

    it("messageIndex順でソートされる", async () => {
      // Arrange
      await messageRepository.save(
        TestDataFactory.createMessage(testSessionId, {
          id: "550e8400-e29b-41d4-a716-446655440211",
          messageIndex: 2,
          content: "Message 2",
        }),
      );
      await messageRepository.save(
        TestDataFactory.createMessage(testSessionId, {
          id: "550e8400-e29b-41d4-a716-446655440212",
          messageIndex: 0,
          content: "Message 0",
        }),
      );
      await messageRepository.save(
        TestDataFactory.createMessage(testSessionId, {
          id: "550e8400-e29b-41d4-a716-446655440213",
          messageIndex: 1,
          content: "Message 1",
        }),
      );

      // Act
      const result = await messageRepository.findBySessionId(
        ChatSessionId.fromString(testSessionId),
      );

      // Assert
      expect(result[0].messageIndex).toBe(0);
      expect(result[1].messageIndex).toBe(1);
      expect(result[2].messageIndex).toBe(2);
    });

    it("ページネーション（limit）が正しく動作する", async () => {
      // Arrange
      const messages = TestDataFactory.createMessages(testSessionId, 10);
      for (const message of messages) {
        await messageRepository.save(message);
      }

      // Act
      const result = await messageRepository.findBySessionId(
        ChatSessionId.fromString(testSessionId),
        3,
      );

      // Assert
      expect(result).toHaveLength(3);
    });

    it("ページネーション（limit + offset）が正しく動作する", async () => {
      // Arrange
      const messages = TestDataFactory.createMessages(testSessionId, 10);
      for (const message of messages) {
        await messageRepository.save(message);
      }

      // Act
      const result = await messageRepository.findBySessionId(
        ChatSessionId.fromString(testSessionId),
        3,
        5,
      );

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].messageIndex).toBe(5); // offset後の最初のメッセージ
    });

    it("メッセージがない場合空配列を返す", async () => {
      // Arrange: セッションはあるがメッセージがない状態

      // Act
      const result = await messageRepository.findBySessionId(
        ChatSessionId.fromString(testSessionId),
      );

      // Assert
      expect(result).toEqual([]);
    });
  });

  // ============================================================
  // findLatestBySessionId テスト
  // ============================================================
  describe("findLatestBySessionId", () => {
    it("最新メッセージを取得できる", async () => {
      // Arrange
      await messageRepository.save(
        TestDataFactory.createMessage(testSessionId, {
          id: "550e8400-e29b-41d4-a716-446655440221",
          messageIndex: 0,
          content: "First",
        }),
      );
      await messageRepository.save(
        TestDataFactory.createMessage(testSessionId, {
          id: "550e8400-e29b-41d4-a716-446655440222",
          messageIndex: 1,
          content: "Second",
        }),
      );
      await messageRepository.save(
        TestDataFactory.createMessage(testSessionId, {
          id: "550e8400-e29b-41d4-a716-446655440223",
          messageIndex: 2,
          content: "Latest",
        }),
      );

      // Act
      const result = await messageRepository.findLatestBySessionId(
        ChatSessionId.fromString(testSessionId),
      );

      // Assert
      expect(result).not.toBeNull();
      expect(result?.content.value).toBe("Latest");
      expect(result?.messageIndex).toBe(2);
    });

    it("メッセージがない場合nullを返す", async () => {
      // Arrange: メッセージなしのセッション

      // Act
      const result = await messageRepository.findLatestBySessionId(
        ChatSessionId.fromString(testSessionId),
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  // ============================================================
  // countBySessionId テスト
  // ============================================================
  describe("countBySessionId", () => {
    it("メッセージ数を正しくカウントする", async () => {
      // Arrange
      const messages = TestDataFactory.createMessages(testSessionId, 7);
      for (const message of messages) {
        await messageRepository.save(message);
      }

      // Act
      const result = await messageRepository.countBySessionId(
        ChatSessionId.fromString(testSessionId),
      );

      // Assert
      expect(result).toBe(7);
    });

    it("メッセージがない場合0を返す", async () => {
      // Arrange: メッセージなしのセッション

      // Act
      const result = await messageRepository.countBySessionId(
        ChatSessionId.fromString(testSessionId),
      );

      // Assert
      expect(result).toBe(0);
    });
  });

  // ============================================================
  // save テスト
  // ============================================================
  describe("save", () => {
    it("新規メッセージを作成できる", async () => {
      // Arrange
      const message = TestDataFactory.createMessage(testSessionId, {
        id: "550e8400-e29b-41d4-a716-446655440231",
        content: "New Message",
        messageIndex: 0,
      });

      // Act
      await messageRepository.save(message);

      // Assert
      const saved = await messageRepository.findById(
        ChatMessageId.fromString(message.id.value),
      );
      expect(saved).not.toBeNull();
      expect(saved?.content.value).toBe("New Message");
    });

    it("既存メッセージを更新できる（Upsert）", async () => {
      // Arrange
      const message = TestDataFactory.createMessage(testSessionId, {
        id: "550e8400-e29b-41d4-a716-446655440232",
        content: "Original Content",
        messageIndex: 0,
      });
      await messageRepository.save(message);

      // 同じIDで異なるコンテンツのメッセージを作成
      const updatedMessage = ChatMessage.reconstitute({
        id: message.id.value,
        sessionId: testSessionId,
        role: "user",
        content: "Updated Content",
        messageIndex: 0,
        timestamp: new Date(),
        llmProvider: null,
        llmModel: null,
        llmMetadata: null,
      });

      // Act
      await messageRepository.save(updatedMessage);

      // Assert
      const saved = await messageRepository.findById(
        ChatMessageId.fromString(message.id.value),
      );
      expect(saved?.content.value).toBe("Updated Content");
    });

    it("ユーザーメッセージを正しく保存できる", async () => {
      // Arrange
      const message = TestDataFactory.createMessage(testSessionId, {
        id: "550e8400-e29b-41d4-a716-446655440233",
        role: "user",
        content: "User says hello",
        messageIndex: 0,
      });

      // Act
      await messageRepository.save(message);

      // Assert
      const saved = await messageRepository.findById(
        ChatMessageId.fromString(message.id.value),
      );
      expect(saved?.isUserMessage).toBe(true);
    });

    it("アシスタントメッセージをLLMメタデータ付きで保存できる", async () => {
      // Arrange
      const message = TestDataFactory.createMessage(testSessionId, {
        id: "550e8400-e29b-41d4-a716-446655440234",
        role: "assistant",
        content: "AI response",
        messageIndex: 1,
        llmProvider: "openai",
        llmModel: "gpt-4",
        llmMetadata: {
          tokenUsage: {
            inputTokens: 100,
            outputTokens: 50,
            totalTokens: 150,
          },
          responseTime: 1500,
        },
      });

      // Act
      await messageRepository.save(message);

      // Assert
      const saved = await messageRepository.findById(
        ChatMessageId.fromString(message.id.value),
      );
      expect(saved?.isAssistantMessage).toBe(true);
      expect(saved?.llmMetadata).not.toBeNull();
      expect(saved?.llmMetadata?.provider).toBe("openai");
      expect(saved?.llmMetadata?.model).toBe("gpt-4");
    });
  });

  // ============================================================
  // saveMany テスト
  // ============================================================
  describe("saveMany", () => {
    it("複数メッセージを一括保存できる", async () => {
      // Arrange
      const messages = TestDataFactory.createMessages(testSessionId, 5);

      // Act
      await messageRepository.saveMany(messages);

      // Assert
      const result = await messageRepository.findBySessionId(
        ChatSessionId.fromString(testSessionId),
      );
      expect(result).toHaveLength(5);
    });

    it("空配列の場合何もしない", async () => {
      // Arrange & Act
      await messageRepository.saveMany([]);

      // Assert: エラーにならないことを確認
      const count = await messageRepository.countBySessionId(
        ChatSessionId.fromString(testSessionId),
      );
      expect(count).toBe(0);
    });

    it("トランザクションが正しく動作する（途中でエラー時はロールバック）", async () => {
      // Arrange
      const validMessage1 = TestDataFactory.createMessage(testSessionId, {
        id: "550e8400-e29b-41d4-a716-446655440241",
        messageIndex: 0,
        content: "Valid 1",
      });
      const validMessage2 = TestDataFactory.createMessage(testSessionId, {
        id: "550e8400-e29b-41d4-a716-446655440242",
        messageIndex: 1,
        content: "Valid 2",
      });

      // まず有効なメッセージを保存
      await messageRepository.saveMany([validMessage1, validMessage2]);

      // 同じIDのメッセージを含むバッチ（Upsert動作を確認）
      const updatedMessage1 = ChatMessage.reconstitute({
        id: "550e8400-e29b-41d4-a716-446655440241",
        sessionId: testSessionId,
        role: "user",
        content: "Updated Valid 1",
        messageIndex: 0,
        timestamp: new Date(),
        llmProvider: null,
        llmModel: null,
        llmMetadata: null,
      });

      // Act
      await messageRepository.saveMany([updatedMessage1]);

      // Assert
      const saved = await messageRepository.findById(
        ChatMessageId.fromString("550e8400-e29b-41d4-a716-446655440241"),
      );
      expect(saved?.content.value).toBe("Updated Valid 1");
    });

    it("大量メッセージを保存できる", async () => {
      // Arrange
      const messages = TestDataFactory.createMessages(testSessionId, 100);

      // Act
      await messageRepository.saveMany(messages);

      // Assert
      const count = await messageRepository.countBySessionId(
        ChatSessionId.fromString(testSessionId),
      );
      expect(count).toBe(100);
    });
  });

  // ============================================================
  // delete テスト
  // ============================================================
  describe("delete", () => {
    it("メッセージを削除できる", async () => {
      // Arrange
      const message = TestDataFactory.createMessage(testSessionId, {
        id: "550e8400-e29b-41d4-a716-446655440251",
        messageIndex: 0,
      });
      await messageRepository.save(message);

      // Act
      await messageRepository.delete(
        ChatMessageId.fromString(message.id.value),
      );

      // Assert
      const result = await messageRepository.findById(
        ChatMessageId.fromString(message.id.value),
      );
      expect(result).toBeNull();
    });

    it("存在しないIDでもエラーにならない", async () => {
      // Arrange
      const nonExistentId = ChatMessageId.fromString(
        "550e8400-e29b-41d4-a716-446655440999",
      );

      // Act & Assert
      await expect(
        messageRepository.delete(nonExistentId),
      ).resolves.not.toThrow();
    });
  });

  // ============================================================
  // deleteBySessionId テスト
  // ============================================================
  describe("deleteBySessionId", () => {
    it("セッションの全メッセージを削除できる", async () => {
      // Arrange
      const messages = TestDataFactory.createMessages(testSessionId, 5);
      for (const message of messages) {
        await messageRepository.save(message);
      }

      // Act
      await messageRepository.deleteBySessionId(
        ChatSessionId.fromString(testSessionId),
      );

      // Assert
      const result = await messageRepository.findBySessionId(
        ChatSessionId.fromString(testSessionId),
      );
      expect(result).toEqual([]);
    });

    it("メッセージがないセッションでもエラーにならない", async () => {
      // Arrange: メッセージなし

      // Act & Assert
      await expect(
        messageRepository.deleteBySessionId(
          ChatSessionId.fromString(testSessionId),
        ),
      ).resolves.not.toThrow();
    });
  });

  // ============================================================
  // エラーケーステスト
  // ============================================================
  describe("エラーハンドリング", () => {
    it("findByIdでエラーが発生した場合DatabaseErrorをスロー", async () => {
      // Arrange
      const brokenDb = {} as any;
      const brokenRepository = new DrizzleChatMessageRepository(brokenDb);

      // Act & Assert
      await expect(
        brokenRepository.findById(
          ChatMessageId.fromString("550e8400-e29b-41d4-a716-446655440000"),
        ),
      ).rejects.toThrow();
    });

    it("findBySessionIdでエラーが発生した場合DatabaseErrorをスロー", async () => {
      // Arrange
      const brokenDb = {} as any;
      const brokenRepository = new DrizzleChatMessageRepository(brokenDb);

      // Act & Assert
      await expect(
        brokenRepository.findBySessionId(
          ChatSessionId.fromString(testSessionId),
        ),
      ).rejects.toThrow();
    });

    it("findLatestBySessionIdでエラーが発生した場合DatabaseErrorをスロー", async () => {
      // Arrange
      const brokenDb = {} as any;
      const brokenRepository = new DrizzleChatMessageRepository(brokenDb);

      // Act & Assert
      await expect(
        brokenRepository.findLatestBySessionId(
          ChatSessionId.fromString(testSessionId),
        ),
      ).rejects.toThrow();
    });

    it("countBySessionIdでエラーが発生した場合DatabaseErrorをスロー", async () => {
      // Arrange
      const brokenDb = {} as any;
      const brokenRepository = new DrizzleChatMessageRepository(brokenDb);

      // Act & Assert
      await expect(
        brokenRepository.countBySessionId(
          ChatSessionId.fromString(testSessionId),
        ),
      ).rejects.toThrow();
    });

    it("saveでエラーが発生した場合DatabaseErrorをスロー", async () => {
      // Arrange
      const brokenDb = {} as any;
      const brokenRepository = new DrizzleChatMessageRepository(brokenDb);
      const message = TestDataFactory.createMessage(testSessionId);

      // Act & Assert
      await expect(brokenRepository.save(message)).rejects.toThrow();
    });

    it("saveManyでエラーが発生した場合DatabaseErrorをスロー", async () => {
      // Arrange
      const brokenDb = {} as any;
      const brokenRepository = new DrizzleChatMessageRepository(brokenDb);
      const messages = TestDataFactory.createMessages(testSessionId, 3);

      // Act & Assert
      await expect(brokenRepository.saveMany(messages)).rejects.toThrow();
    });

    it("deleteでエラーが発生した場合DatabaseErrorをスロー", async () => {
      // Arrange
      const brokenDb = {} as any;
      const brokenRepository = new DrizzleChatMessageRepository(brokenDb);

      // Act & Assert
      await expect(
        brokenRepository.delete(
          ChatMessageId.fromString("550e8400-e29b-41d4-a716-446655440000"),
        ),
      ).rejects.toThrow();
    });

    it("deleteBySessionIdでエラーが発生した場合DatabaseErrorをスロー", async () => {
      // Arrange
      const brokenDb = {} as any;
      const brokenRepository = new DrizzleChatMessageRepository(brokenDb);

      // Act & Assert
      await expect(
        brokenRepository.deleteBySessionId(
          ChatSessionId.fromString(testSessionId),
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
      const messages = TestDataFactory.createMessages(testSessionId, 5);
      for (const message of messages) {
        await messageRepository.save(message);
      }

      // Act
      const result = await messageRepository.findBySessionId(
        ChatSessionId.fromString(testSessionId),
        0,
      );

      // Assert
      expect(result).toEqual([]);
    });

    it("長いコンテンツのメッセージを保存できる", async () => {
      // Arrange
      const longContent = "A".repeat(100000); // 最大100,000文字
      const message = TestDataFactory.createMessage(testSessionId, {
        id: "550e8400-e29b-41d4-a716-446655440261",
        content: longContent,
        messageIndex: 0,
      });

      // Act
      await messageRepository.save(message);

      // Assert
      const saved = await messageRepository.findById(
        ChatMessageId.fromString(message.id.value),
      );
      expect(saved?.content.value).toBe(longContent);
    });

    it("特殊文字を含むコンテンツを保存できる", async () => {
      // Arrange
      const specialContent =
        "テスト🎉<script>alert('xss')</script>\n\t日本語テスト";
      const message = TestDataFactory.createMessage(testSessionId, {
        id: "550e8400-e29b-41d4-a716-446655440262",
        content: specialContent,
        messageIndex: 0,
      });

      // Act
      await messageRepository.save(message);

      // Assert
      const saved = await messageRepository.findById(
        ChatMessageId.fromString(message.id.value),
      );
      expect(saved?.content.value).toBe(specialContent);
    });

    it("大量メッセージ（100件）の取得が正しく動作する", async () => {
      // Arrange
      const messages = TestDataFactory.createMessages(testSessionId, 100);
      for (const message of messages) {
        await messageRepository.save(message);
      }

      // Act
      const result = await messageRepository.findBySessionId(
        ChatSessionId.fromString(testSessionId),
      );

      // Assert
      expect(result).toHaveLength(100);
      // messageIndex順でソートされていることを確認
      expect(result[0].messageIndex).toBe(0);
      expect(result[99].messageIndex).toBe(99);
    });

    it("大量メッセージの一括保存が正しく動作する", async () => {
      // Arrange
      const messages = TestDataFactory.createMessages(testSessionId, 50);

      // Act
      await messageRepository.saveMany(messages);

      // Assert
      const count = await messageRepository.countBySessionId(
        ChatSessionId.fromString(testSessionId),
      );
      expect(count).toBe(50);
    });

    it("ページネーションでオフセット指定が正しく動作する", async () => {
      // Arrange
      const messages = TestDataFactory.createMessages(testSessionId, 20);
      for (const message of messages) {
        await messageRepository.save(message);
      }

      // Act: offset=5, limit=10
      const result = await messageRepository.findBySessionId(
        ChatSessionId.fromString(testSessionId),
        10,
        5,
      );

      // Assert
      expect(result).toHaveLength(10);
      expect(result[0].messageIndex).toBe(5);
      expect(result[9].messageIndex).toBe(14);
    });
  });

  // ============================================================
  // 統合テスト
  // ============================================================
  describe("統合テスト", () => {
    it("セッション削除時にメッセージもCASCADE削除される", async () => {
      // Arrange
      const messages = TestDataFactory.createMessages(testSessionId, 3);
      for (const message of messages) {
        await messageRepository.save(message);
      }

      // メッセージが存在することを確認
      const beforeDelete = await messageRepository.findBySessionId(
        ChatSessionId.fromString(testSessionId),
      );
      expect(beforeDelete).toHaveLength(3);

      // Act: セッションを削除
      await sessionRepository.delete(ChatSessionId.fromString(testSessionId));

      // Assert: メッセージもCASCADE削除されている
      const afterDelete = await messageRepository.findBySessionId(
        ChatSessionId.fromString(testSessionId),
      );
      expect(afterDelete).toEqual([]);
    });

    it("セッション作成→メッセージ追加→取得シナリオ", async () => {
      // Arrange: 新しいセッションを作成
      const newSessionId = "550e8400-e29b-41d4-a716-446655440300";
      const newSession = TestDataFactory.createSession({
        id: newSessionId,
        userId: "user-integration",
        title: "Integration Test Session",
      });
      await sessionRepository.save(newSession);

      // メッセージを追加
      const userMessage = TestDataFactory.createMessage(newSessionId, {
        id: "550e8400-e29b-41d4-a716-446655440301",
        role: "user",
        content: "Hello, AI!",
        messageIndex: 0,
      });
      const assistantMessage = TestDataFactory.createMessage(newSessionId, {
        id: "550e8400-e29b-41d4-a716-446655440302",
        role: "assistant",
        content: "Hello! How can I help you?",
        messageIndex: 1,
        llmProvider: "anthropic",
        llmModel: "claude-3",
      });

      await messageRepository.saveMany([userMessage, assistantMessage]);

      // Act: メッセージを取得
      const messages = await messageRepository.findBySessionId(
        ChatSessionId.fromString(newSessionId),
      );
      const latestMessage = await messageRepository.findLatestBySessionId(
        ChatSessionId.fromString(newSessionId),
      );
      const count = await messageRepository.countBySessionId(
        ChatSessionId.fromString(newSessionId),
      );

      // Assert
      expect(messages).toHaveLength(2);
      expect(messages[0].isUserMessage).toBe(true);
      expect(messages[1].isAssistantMessage).toBe(true);
      expect(latestMessage?.content.value).toBe("Hello! How can I help you?");
      expect(count).toBe(2);
    });
  });
});
