/**
 * ChatHistoryService 認可テスト
 *
 * OWASP A01: Broken Access Control 対策の検証テスト。
 * TDD Red Phase: 実装前にテストを作成し、失敗することを確認する。
 *
 * @see outputs/phase-2/design-authorization.md
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { ChatHistoryService } from "../chat-history-service";
import { UnauthorizedError, isUnauthorizedError } from "../errors";
import type { ChatSessionRepository } from "../../../repositories/chat-session-repository";
import type { ChatMessageRepository } from "../../../repositories/chat-message-repository";
import type { ChatSession } from "../../../types/chat-session";

describe("ChatHistoryService - Authorization", () => {
  let service: ChatHistoryService;
  let mockSessionRepository: {
    findById: ReturnType<typeof vi.fn>;
    findByUserId: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    search: ReturnType<typeof vi.fn>;
  };
  let mockMessageRepository: {
    findById: ReturnType<typeof vi.fn>;
    findBySessionId: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
  };

  const createMockSession = (
    overrides: Partial<ChatSession> = {},
  ): ChatSession => ({
    id: "session-456",
    userId: "user-123",
    title: "Test Session",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messageCount: 0,
    isFavorite: false,
    isPinned: false,
    pinOrder: null,
    lastMessagePreview: null,
    metadata: {},
    deletedAt: null,
    ...overrides,
  });

  beforeEach(() => {
    mockSessionRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      search: vi.fn(),
    };
    mockMessageRepository = {
      findById: vi.fn(),
      findBySessionId: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    };
    service = new ChatHistoryService(
      mockSessionRepository as unknown as ChatSessionRepository,
      mockMessageRepository as unknown as ChatMessageRepository,
    );
  });

  describe("getSession", () => {
    it("所有者がセッションにアクセスした場合、セッションを返す", async () => {
      // Arrange
      const ownerId = "user-123";
      const sessionId = "session-456";
      const mockSession = createMockSession({ id: sessionId, userId: ownerId });
      mockSessionRepository.findById.mockResolvedValue(mockSession);

      // Act
      const result = await service.getSession(sessionId, ownerId);

      // Assert
      expect(result).toEqual(mockSession);
    });

    it("非所有者がセッションにアクセスした場合、UnauthorizedErrorを投げる", async () => {
      // Arrange
      const ownerId = "user-123";
      const requesterId = "user-456"; // 別のユーザー
      const sessionId = "session-789";
      const mockSession = createMockSession({ id: sessionId, userId: ownerId });
      mockSessionRepository.findById.mockResolvedValue(mockSession);

      // Act & Assert
      await expect(service.getSession(sessionId, requesterId)).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it("存在しないセッションにアクセスした場合、nullを返す", async () => {
      // Arrange
      mockSessionRepository.findById.mockResolvedValue(null);

      // Act
      const result = await service.getSession("non-existent", "user-123");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("deleteSession", () => {
    it("所有者がセッションを削除した場合、正常に削除される", async () => {
      // Arrange
      const ownerId = "user-123";
      const sessionId = "session-456";
      const mockSession = createMockSession({ id: sessionId, userId: ownerId });
      mockSessionRepository.findById.mockResolvedValue(mockSession);
      mockMessageRepository.findBySessionId.mockResolvedValue([]);
      mockSessionRepository.delete.mockResolvedValue(true);

      // Act
      const result = await service.deleteSession(sessionId, ownerId);

      // Assert
      expect(result).toBe(true);
      expect(mockSessionRepository.delete).toHaveBeenCalledWith(sessionId);
    });

    it("非所有者がセッションを削除しようとした場合、UnauthorizedErrorを投げる", async () => {
      // Arrange
      const ownerId = "user-123";
      const requesterId = "user-456";
      const sessionId = "session-789";
      const mockSession = createMockSession({ id: sessionId, userId: ownerId });
      mockSessionRepository.findById.mockResolvedValue(mockSession);

      // Act & Assert
      await expect(
        service.deleteSession(sessionId, requesterId),
      ).rejects.toThrow(UnauthorizedError);
      expect(mockSessionRepository.delete).not.toHaveBeenCalled();
    });

    it("存在しないセッションを削除しようとした場合、UnauthorizedErrorを投げる", async () => {
      // Arrange
      mockSessionRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.deleteSession("non-existent", "user-123"),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("updateSession", () => {
    it("所有者がセッションを更新した場合、正常に更新される", async () => {
      // Arrange
      const ownerId = "user-123";
      const sessionId = "session-456";
      const mockSession = createMockSession({ id: sessionId, userId: ownerId });
      mockSessionRepository.findById.mockResolvedValue(mockSession);
      mockSessionRepository.update.mockResolvedValue(true);

      // Act
      const result = await service.updateSession(sessionId, ownerId, {
        title: "Updated Title",
      });

      // Assert
      expect(result).toBe(true);
      expect(mockSessionRepository.update).toHaveBeenCalled();
    });

    it("非所有者がセッションを更新しようとした場合、UnauthorizedErrorを投げる", async () => {
      // Arrange
      const ownerId = "user-123";
      const requesterId = "user-456";
      const sessionId = "session-789";
      const mockSession = createMockSession({ id: sessionId, userId: ownerId });
      mockSessionRepository.findById.mockResolvedValue(mockSession);

      // Act & Assert
      await expect(
        service.updateSession(sessionId, requesterId, { title: "Hacked" }),
      ).rejects.toThrow(UnauthorizedError);
      expect(mockSessionRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("exportToMarkdown", () => {
    it("所有者がエクスポートした場合、Markdown文字列を返す", async () => {
      // Arrange
      const ownerId = "user-123";
      const sessionId = "session-456";
      const mockSession = createMockSession({
        id: sessionId,
        userId: ownerId,
        title: "Test",
      });
      mockSessionRepository.findById.mockResolvedValue(mockSession);
      mockMessageRepository.findBySessionId.mockResolvedValue([]);

      // Act
      const result = await service.exportToMarkdown(sessionId, ownerId);

      // Assert
      expect(typeof result).toBe("string");
      expect(result).toContain("# Test");
    });

    it("非所有者がエクスポートしようとした場合、UnauthorizedErrorを投げる", async () => {
      // Arrange
      const ownerId = "user-123";
      const requesterId = "user-456";
      const sessionId = "session-789";
      const mockSession = createMockSession({ id: sessionId, userId: ownerId });
      mockSessionRepository.findById.mockResolvedValue(mockSession);

      // Act & Assert
      await expect(
        service.exportToMarkdown(sessionId, requesterId),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("exportToJson", () => {
    it("所有者がエクスポートした場合、JSON文字列を返す", async () => {
      // Arrange
      const ownerId = "user-123";
      const sessionId = "session-456";
      const mockSession = createMockSession({
        id: sessionId,
        userId: ownerId,
        title: "Test",
      });
      mockSessionRepository.findById.mockResolvedValue(mockSession);
      mockMessageRepository.findBySessionId.mockResolvedValue([]);

      // Act
      const result = await service.exportToJson(sessionId, ownerId);

      // Assert
      const parsed = JSON.parse(result);
      expect(parsed.session.title).toBe("Test");
    });

    it("非所有者がエクスポートしようとした場合、UnauthorizedErrorを投げる", async () => {
      // Arrange
      const ownerId = "user-123";
      const requesterId = "user-456";
      const sessionId = "session-789";
      const mockSession = createMockSession({ id: sessionId, userId: ownerId });
      mockSessionRepository.findById.mockResolvedValue(mockSession);

      // Act & Assert
      await expect(
        service.exportToJson(sessionId, requesterId),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("isUnauthorizedError", () => {
    it("UnauthorizedErrorインスタンスに対してtrueを返す", () => {
      const error = new UnauthorizedError();
      expect(isUnauthorizedError(error)).toBe(true);
    });

    it("カスタムメッセージ付きUnauthorizedErrorに対してtrueを返す", () => {
      const error = new UnauthorizedError("Custom message", "session", "123");
      expect(isUnauthorizedError(error)).toBe(true);
      expect(error.resourceType).toBe("session");
      expect(error.resourceId).toBe("123");
    });

    it("通常のErrorに対してfalseを返す", () => {
      const error = new Error("test");
      expect(isUnauthorizedError(error)).toBe(false);
    });

    it("null/undefinedに対してfalseを返す", () => {
      expect(isUnauthorizedError(null)).toBe(false);
      expect(isUnauthorizedError(undefined)).toBe(false);
    });

    it("プレーンオブジェクトに対してfalseを返す", () => {
      const obj = { name: "UnauthorizedError", code: "UNAUTHORIZED" };
      expect(isUnauthorizedError(obj)).toBe(false);
    });
  });

  describe("UnauthorizedError", () => {
    it("デフォルトメッセージを持つ", () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe(
        "Access denied: You do not have permission to access this resource",
      );
      expect(error.name).toBe("UnauthorizedError");
      expect(error.code).toBe("UNAUTHORIZED");
      expect(error.statusCode).toBe(403);
    });

    it("カスタムメッセージとリソース情報を持つことができる", () => {
      const error = new UnauthorizedError(
        "Custom error message",
        "session",
        "session-123",
      );
      expect(error.message).toBe("Custom error message");
      expect(error.resourceType).toBe("session");
      expect(error.resourceId).toBe("session-123");
    });

    it("Errorを継承している", () => {
      const error = new UnauthorizedError();
      expect(error instanceof Error).toBe(true);
      expect(error instanceof UnauthorizedError).toBe(true);
    });

    it("スタックトレースを持つ", () => {
      const error = new UnauthorizedError();
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("UnauthorizedError");
    });
  });

  // =============================================
  // Phase 6: テスト拡充 - 境界値・異常系テスト
  // =============================================

  describe("Boundary Value Tests", () => {
    it("空文字列のuserIdでアクセスした場合、UnauthorizedErrorを投げる", async () => {
      // Arrange
      const sessionId = "session-123";
      const mockSession = createMockSession({
        id: sessionId,
        userId: "user-123",
      });
      mockSessionRepository.findById.mockResolvedValue(mockSession);

      // Act & Assert
      await expect(service.getSession(sessionId, "")).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it("空白のみのuserIdでアクセスした場合、UnauthorizedErrorを投げる", async () => {
      // Arrange
      const sessionId = "session-123";
      const mockSession = createMockSession({
        id: sessionId,
        userId: "user-123",
      });
      mockSessionRepository.findById.mockResolvedValue(mockSession);

      // Act & Assert
      await expect(service.getSession(sessionId, "   ")).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it("空文字列のsessionIdでdeleteSessionを呼んだ場合、UnauthorizedErrorを投げる", async () => {
      // Arrange
      mockSessionRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteSession("", "user-123")).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it("空文字列のsessionIdでupdateSessionを呼んだ場合、UnauthorizedErrorを投げる", async () => {
      // Arrange
      mockSessionRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateSession("", "user-123", { title: "test" }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("空文字列のsessionIdでexportToMarkdownを呼んだ場合、UnauthorizedErrorを投げる", async () => {
      // Arrange
      mockSessionRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.exportToMarkdown("", "user-123")).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it("空文字列のsessionIdでexportToJsonを呼んだ場合、UnauthorizedErrorを投げる", async () => {
      // Arrange
      mockSessionRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.exportToJson("", "user-123")).rejects.toThrow(
        UnauthorizedError,
      );
    });
  });

  describe("Error Message Security", () => {
    it("存在しないセッションと認可失敗で同じエラーメッセージを返す", async () => {
      // Arrange
      const requesterId = "user-456";

      // 存在しないセッション（deleteSessionを使用、getSessionはnullを返す）
      mockSessionRepository.findById.mockResolvedValue(null);
      let error1: UnauthorizedError | null = null;
      try {
        await service.deleteSession("non-existent", requesterId);
      } catch (e) {
        error1 = e as UnauthorizedError;
      }

      // 認可失敗（他人のセッション）
      const mockSession = createMockSession({
        id: "session-123",
        userId: "user-123",
      });
      mockSessionRepository.findById.mockResolvedValue(mockSession);
      let error2: UnauthorizedError | null = null;
      try {
        await service.deleteSession("session-123", requesterId);
      } catch (e) {
        error2 = e as UnauthorizedError;
      }

      // Assert: 同じエラーメッセージであること
      expect(error1).not.toBeNull();
      expect(error2).not.toBeNull();
      expect(error1?.message).toBe(error2?.message);
      expect(error1?.message).not.toContain("not found");
      expect(error1?.message).not.toContain("does not exist");
    });

    it("エラーメッセージにuserIdが含まれない", async () => {
      // Arrange
      const sessionId = "session-123";
      const ownerId = "user-123";
      const requesterId = "user-456";
      const mockSession = createMockSession({ id: sessionId, userId: ownerId });
      mockSessionRepository.findById.mockResolvedValue(mockSession);

      // Act & Assert
      try {
        await service.getSession(sessionId, requesterId);
      } catch (e) {
        const error = e as UnauthorizedError;
        expect(error.message).not.toContain(ownerId);
        expect(error.message).not.toContain(requesterId);
      }
    });

    it("エラーメッセージにsessionIdが含まれない", async () => {
      // Arrange
      const sessionId = "secret-session-id-12345";
      const ownerId = "user-123";
      const requesterId = "user-456";
      const mockSession = createMockSession({ id: sessionId, userId: ownerId });
      mockSessionRepository.findById.mockResolvedValue(mockSession);

      // Act & Assert
      try {
        await service.getSession(sessionId, requesterId);
      } catch (e) {
        const error = e as UnauthorizedError;
        // エラーメッセージにはsessionIdが含まれないが、resourceIdには含まれる（ログ用）
        expect(error.message).not.toContain("secret-session-id-12345");
        expect(error.resourceId).toBe(sessionId); // ログ用途では保持
      }
    });
  });

  describe("Integration Scenarios", () => {
    it("セッション作成者のみが操作できるシナリオ", async () => {
      // Arrange
      const ownerId = "user-123";
      const otherUserId = "user-456";
      const sessionId = "session-789";
      const mockSession = createMockSession({
        id: sessionId,
        userId: ownerId,
        title: "My Session",
      });

      // セットアップ
      mockSessionRepository.findById.mockResolvedValue(mockSession);
      mockMessageRepository.findBySessionId.mockResolvedValue([]);
      mockSessionRepository.update.mockResolvedValue(true);
      mockSessionRepository.delete.mockResolvedValue(true);

      // Act & Assert: 所有者は操作可能
      await expect(
        service.getSession(sessionId, ownerId),
      ).resolves.toBeDefined();
      await expect(
        service.exportToMarkdown(sessionId, ownerId),
      ).resolves.toBeDefined();
      await expect(
        service.exportToJson(sessionId, ownerId),
      ).resolves.toBeDefined();
      await expect(
        service.updateSession(sessionId, ownerId, { title: "New Title" }),
      ).resolves.toBe(true);

      // Act & Assert: 他ユーザーは操作不可
      await expect(service.getSession(sessionId, otherUserId)).rejects.toThrow(
        UnauthorizedError,
      );
      await expect(
        service.deleteSession(sessionId, otherUserId),
      ).rejects.toThrow(UnauthorizedError);
      await expect(
        service.exportToMarkdown(sessionId, otherUserId),
      ).rejects.toThrow(UnauthorizedError);
      await expect(
        service.exportToJson(sessionId, otherUserId),
      ).rejects.toThrow(UnauthorizedError);
      await expect(
        service.updateSession(sessionId, otherUserId, { title: "Hacked" }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("複数ユーザーが異なるセッションを持つシナリオ", async () => {
      // Arrange
      const user1 = "user-001";
      const user2 = "user-002";
      const session1 = createMockSession({ id: "session-1", userId: user1 });
      const session2 = createMockSession({ id: "session-2", userId: user2 });

      // user1のセッションにアクセス
      mockSessionRepository.findById.mockResolvedValue(session1);

      // user1は自分のセッションにアクセス可能
      await expect(
        service.getSession("session-1", user1),
      ).resolves.toBeDefined();

      // user2はuser1のセッションにアクセス不可
      await expect(service.getSession("session-1", user2)).rejects.toThrow(
        UnauthorizedError,
      );

      // user2のセッションにアクセス
      mockSessionRepository.findById.mockResolvedValue(session2);

      // user2は自分のセッションにアクセス可能
      await expect(
        service.getSession("session-2", user2),
      ).resolves.toBeDefined();

      // user1はuser2のセッションにアクセス不可
      await expect(service.getSession("session-2", user1)).rejects.toThrow(
        UnauthorizedError,
      );
    });
  });

  describe("updateSession extended tests", () => {
    it("存在しないセッションを更新しようとした場合、UnauthorizedErrorを投げる", async () => {
      // Arrange
      mockSessionRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateSession("non-existent", "user-123", { title: "New" }),
      ).rejects.toThrow(UnauthorizedError);
      expect(mockSessionRepository.update).not.toHaveBeenCalled();
    });

    it("所有者が複数フィールドを更新できる", async () => {
      // Arrange
      const ownerId = "user-123";
      const sessionId = "session-456";
      const mockSession = createMockSession({ id: sessionId, userId: ownerId });
      mockSessionRepository.findById.mockResolvedValue(mockSession);
      mockSessionRepository.update.mockResolvedValue(true);

      // Act
      const result = await service.updateSession(sessionId, ownerId, {
        title: "New Title",
        isFavorite: true,
        isPinned: true,
      });

      // Assert
      expect(result).toBe(true);
      expect(mockSessionRepository.update).toHaveBeenCalled();
    });
  });
});
