import { describe, it, expect, beforeEach, vi } from "vitest";
import { SearchSessionsUseCase } from "../SearchSessionsUseCase.js";
import type { IChatSessionRepository } from "../../../domain/repositories/IChatSessionRepository.js";
import { ChatSession } from "../../../domain/entities/ChatSession.js";

describe("SearchSessionsUseCase", () => {
  let useCase: SearchSessionsUseCase;
  let mockSessionRepository: IChatSessionRepository;

  function createMockSession(
    overrides: {
      title?: string;
      isFavorite?: boolean;
      isPinned?: boolean;
    } = {},
  ): ChatSession {
    const result = ChatSession.create({
      userId: "user-123",
      title: overrides.title ?? "テストセッション",
    });
    if (!result.ok) throw new Error("Failed to create mock session");

    const session = result.value;
    if (overrides.isFavorite) session.toggleFavorite();
    if (overrides.isPinned) session.togglePinned();
    return session;
  }

  beforeEach(() => {
    mockSessionRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findPinned: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      search: vi.fn().mockResolvedValue([]),
      countPinned: vi.fn(),
      exists: vi.fn(),
    };
    useCase = new SearchSessionsUseCase(mockSessionRepository);
  });

  it("キーワードでセッションを検索できる", async () => {
    // Arrange
    const input = {
      userId: "user-123",
      keyword: "テスト",
    };
    mockSessionRepository.search = vi
      .fn()
      .mockResolvedValue([
        createMockSession({ title: "テストセッション1" }),
        createMockSession({ title: "テストセッション2" }),
      ]);

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.sessions.length).toBe(2);
    }
  });

  it("お気に入りフィルターで検索できる", async () => {
    // Arrange
    const input = {
      userId: "user-123",
      isFavorite: true,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(true);
    expect(mockSessionRepository.search).toHaveBeenCalledWith(
      expect.objectContaining({ isFavorite: true }),
    );
  });

  it("ピン留めフィルターで検索できる", async () => {
    // Arrange
    const input = {
      userId: "user-123",
      isPinned: true,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(true);
    expect(mockSessionRepository.search).toHaveBeenCalledWith(
      expect.objectContaining({ isPinned: true }),
    );
  });

  it("ページネーションを適用できる", async () => {
    // Arrange
    const input = {
      userId: "user-123",
      limit: 10,
      offset: 20,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(true);
    expect(mockSessionRepository.search).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10, offset: 20 }),
    );
  });

  it("検索結果がない場合は空配列を返す", async () => {
    // Arrange
    const input = {
      userId: "user-123",
      keyword: "存在しないキーワード",
    };
    mockSessionRepository.search = vi.fn().mockResolvedValue([]);

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.sessions).toEqual([]);
    }
  });
});
