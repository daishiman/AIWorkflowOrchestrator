import { describe, it, expect, beforeEach, vi } from "vitest";
import { AddAssistantMessageUseCase } from "../AddAssistantMessageUseCase.js";
import type { IChatSessionRepository } from "../../../domain/repositories/IChatSessionRepository.js";
import type { IChatMessageRepository } from "../../../domain/repositories/IChatMessageRepository.js";
import { ChatSession } from "../../../domain/entities/ChatSession.js";

describe("AddAssistantMessageUseCase", () => {
  let useCase: AddAssistantMessageUseCase;
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
    useCase = new AddAssistantMessageUseCase(
      mockSessionRepository,
      mockMessageRepository,
    );
  });

  it("アシスタントメッセージを追加できる", async () => {
    // Arrange
    const mockSession = createMockSession();
    mockSessionRepository.findById = vi.fn().mockResolvedValue(mockSession);
    const input = {
      sessionId: mockSession.id.value,
      content: "こんにちは、お手伝いします",
      llmModel: "gpt-4o",
      llmProvider: "openai",
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.message.content).toBe(input.content);
      expect(result.value.message.role).toBe("assistant");
      expect(result.value.message.llmMetadata?.model).toBe("gpt-4o");
      expect(result.value.message.llmMetadata?.provider).toBe("openai");
    }
  });

  it("LLMメタデータを含めてメッセージを追加できる", async () => {
    // Arrange
    const mockSession = createMockSession();
    mockSessionRepository.findById = vi.fn().mockResolvedValue(mockSession);
    const input = {
      sessionId: mockSession.id.value,
      content: "こんにちは",
      llmModel: "gpt-4o",
      llmProvider: "openai",
      llmMetadata: {
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
        finishReason: "stop",
        responseTime: 1500,
      },
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.message.llmMetadata).not.toBeNull();
      expect(result.value.message.llmMetadata?.tokenUsage?.inputTokens).toBe(
        100,
      );
    }
  });

  it("セッションのupdatedAtが更新される（BR-MESSAGE-003）", async () => {
    // Arrange
    const mockSession = createMockSession();
    mockSessionRepository.findById = vi.fn().mockResolvedValue(mockSession);
    const input = {
      sessionId: mockSession.id.value,
      content: "こんにちは",
      llmModel: "gpt-4o",
      llmProvider: "openai",
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(true);
    expect(mockSessionRepository.save).toHaveBeenCalled();
  });

  it("存在しないセッションでエラーを返す", async () => {
    // Arrange
    mockSessionRepository.findById = vi.fn().mockResolvedValue(null);
    const input = {
      sessionId: "550e8400-e29b-41d4-a716-446655440000",
      content: "こんにちは",
      llmModel: "gpt-4o",
      llmProvider: "openai",
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("SESSION_NOT_FOUND");
    }
  });
});
