import { describe, it, expect, beforeEach, vi } from "vitest";
import { AddUserMessageUseCase } from "../AddUserMessageUseCase.js";
import type { IChatSessionRepository } from "../../../domain/repositories/IChatSessionRepository.js";
import type { IChatMessageRepository } from "../../../domain/repositories/IChatMessageRepository.js";
import { ChatSession } from "../../../domain/entities/ChatSession.js";

describe("AddUserMessageUseCase", () => {
  let useCase: AddUserMessageUseCase;
  let mockSessionRepository: IChatSessionRepository;
  let mockMessageRepository: IChatMessageRepository;

  function createMockSession(): ChatSession {
    const result = ChatSession.create({
      userId: "user-123",
      title: "テストセッション",
    });
    if (!result.ok) throw new Error("Failed to create mock session");
    return result.value;
  }

  beforeEach(() => {
    const mockSession = createMockSession();

    mockSessionRepository = {
      findById: vi.fn().mockResolvedValue(mockSession),
      findByUserId: vi.fn(),
      findPinned: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn(),
      search: vi.fn(),
      countPinned: vi.fn(),
      exists: vi.fn(),
    };
    mockMessageRepository = {
      findById: vi.fn(),
      findBySessionId: vi.fn(),
      findLatestBySessionId: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
      saveMany: vi.fn(),
      delete: vi.fn(),
      deleteBySessionId: vi.fn(),
      countBySessionId: vi.fn().mockResolvedValue(0),
    };
    useCase = new AddUserMessageUseCase(
      mockSessionRepository,
      mockMessageRepository,
    );
  });

  it("ユーザーメッセージを追加できる", async () => {
    // Arrange
    const mockSession = createMockSession();
    mockSessionRepository.findById = vi.fn().mockResolvedValue(mockSession);
    const input = {
      sessionId: mockSession.id.value,
      content: "こんにちは",
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.message.content).toBe(input.content);
      expect(result.value.message.role).toBe("user");
      expect(mockMessageRepository.save).toHaveBeenCalled();
    }
  });

  it("セッションのプレビューが更新される", async () => {
    // Arrange
    const mockSession = createMockSession();
    mockSessionRepository.findById = vi.fn().mockResolvedValue(mockSession);
    const input = {
      sessionId: mockSession.id.value,
      content: "これは最初のメッセージです",
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.updatedSession.lastMessagePreview).toBe(
        input.content,
      );
      expect(mockSessionRepository.save).toHaveBeenCalled();
    }
  });

  it("セッションのupdatedAtが更新される", async () => {
    // Arrange
    const mockSession = createMockSession();
    const originalUpdatedAt = mockSession.updatedAt;
    mockSessionRepository.findById = vi.fn().mockResolvedValue(mockSession);
    const input = {
      sessionId: mockSession.id.value,
      content: "こんにちは",
    };

    // Wait a bit to ensure time difference
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      const updatedAtTime = new Date(
        result.value.updatedSession.updatedAt,
      ).getTime();
      expect(updatedAtTime).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    }
  });

  it("存在しないセッションでエラーを返す", async () => {
    // Arrange
    mockSessionRepository.findById = vi.fn().mockResolvedValue(null);
    const input = {
      sessionId: "550e8400-e29b-41d4-a716-446655440000", // Valid UUID but non-existent
      content: "こんにちは",
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("SESSION_NOT_FOUND");
    }
  });

  it("空のコンテンツでエラーを返す", async () => {
    // Arrange
    const mockSession = createMockSession();
    mockSessionRepository.findById = vi.fn().mockResolvedValue(mockSession);
    const input = {
      sessionId: mockSession.id.value,
      content: "",
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("INVALID_CONTENT");
    }
  });

  it("メッセージインデックスが正しく設定される", async () => {
    // Arrange
    const mockSession = createMockSession();
    mockSessionRepository.findById = vi.fn().mockResolvedValue(mockSession);
    mockMessageRepository.countBySessionId = vi.fn().mockResolvedValue(5);
    const input = {
      sessionId: mockSession.id.value,
      content: "こんにちは",
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.message.messageIndex).toBe(5);
    }
  });
});
