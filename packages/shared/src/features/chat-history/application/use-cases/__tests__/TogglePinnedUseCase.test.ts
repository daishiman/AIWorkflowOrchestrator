import { describe, it, expect, beforeEach, vi } from "vitest";
import { TogglePinnedUseCase } from "../TogglePinnedUseCase.js";
import type { IChatSessionRepository } from "../../../domain/repositories/IChatSessionRepository.js";
import { ChatSession } from "../../../domain/entities/ChatSession.js";

describe("TogglePinnedUseCase", () => {
  let useCase: TogglePinnedUseCase;
  let mockSessionRepository: IChatSessionRepository;

  function createMockSession(isPinned: boolean = false): ChatSession {
    const result = ChatSession.create({
      userId: "user-123",
      title: "テストセッション",
    });
    if (!result.ok) throw new Error("Failed to create mock session");

    const session = result.value;
    if (isPinned) session.togglePinned();
    return session;
  }

  beforeEach(() => {
    mockSessionRepository = {
      findById: vi.fn().mockResolvedValue(createMockSession(false)),
      findByUserId: vi.fn(),
      findPinned: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn(),
      search: vi.fn(),
      countPinned: vi.fn().mockResolvedValue(0),
      exists: vi.fn(),
    };
    useCase = new TogglePinnedUseCase(mockSessionRepository);
  });

  it("ピン留め状態をtrueに切り替えられる", async () => {
    // Arrange
    const unpinnedSession = createMockSession(false);
    mockSessionRepository.findById = vi.fn().mockResolvedValue(unpinnedSession);
    const input = { sessionId: unpinnedSession.id.value };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.isPinned).toBe(true);
    }
  });

  it("ピン留め状態をfalseに切り替えられる", async () => {
    // Arrange
    const pinnedSession = createMockSession(true);
    mockSessionRepository.findById = vi.fn().mockResolvedValue(pinnedSession);
    const input = { sessionId: pinnedSession.id.value };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.isPinned).toBe(false);
    }
  });

  it("ピン留め上限（10件）に達している場合はエラーを返す（BR-SESSION-002）", async () => {
    // Arrange
    const unpinnedSession = createMockSession(false);
    mockSessionRepository.findById = vi.fn().mockResolvedValue(unpinnedSession);
    mockSessionRepository.countPinned = vi.fn().mockResolvedValue(10);
    const input = { sessionId: unpinnedSession.id.value };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("MAX_PINNED_SESSIONS");
    }
  });

  it("ピン留め解除時は上限チェックをスキップする", async () => {
    // Arrange
    const pinnedSession = createMockSession(true);
    mockSessionRepository.findById = vi.fn().mockResolvedValue(pinnedSession);
    mockSessionRepository.countPinned = vi.fn().mockResolvedValue(10);
    const input = { sessionId: pinnedSession.id.value };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(true); // 解除なので成功
    if (result.ok) {
      expect(result.value.isPinned).toBe(false);
    }
  });

  it("存在しないセッションでエラーを返す", async () => {
    // Arrange
    mockSessionRepository.findById = vi.fn().mockResolvedValue(null);
    const input = { sessionId: "550e8400-e29b-41d4-a716-446655440000" };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("SESSION_NOT_FOUND");
    }
  });
});
