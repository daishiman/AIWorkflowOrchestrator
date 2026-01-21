import { describe, it, expect, beforeEach, vi } from "vitest";
import { CreateChatSessionUseCase } from "../CreateChatSessionUseCase.js";
import type { IChatSessionRepository } from "../../../domain/repositories/IChatSessionRepository.js";

describe("CreateChatSessionUseCase", () => {
  let useCase: CreateChatSessionUseCase;
  let mockSessionRepository: IChatSessionRepository;

  beforeEach(() => {
    mockSessionRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findPinned: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn(),
      search: vi.fn(),
      countPinned: vi.fn(),
      exists: vi.fn(),
    };
    useCase = new CreateChatSessionUseCase(mockSessionRepository);
  });

  it("新しいセッションを作成できる", async () => {
    // Arrange
    const input = {
      userId: "user-123",
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.session.userId).toBe(input.userId);
      expect(result.value.session.title).toMatch(/^新しいチャット/);
      expect(mockSessionRepository.save).toHaveBeenCalled();
    }
  });

  it("タイトル指定でセッションを作成できる", async () => {
    // Arrange
    const input = {
      userId: "user-123",
      title: "カスタムタイトル",
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.session.title).toBe("カスタムタイトル");
    }
  });

  it("無効なユーザーIDでエラーを返す", async () => {
    // Arrange
    const input = {
      userId: "",
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("INVALID_USER_ID");
    }
  });

  it("タイトル1文字は有効（境界値テスト）", async () => {
    // Arrange - ChatSessionTitleはMIN_LENGTH=1
    const input = {
      userId: "user-123",
      title: "a",
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.session.title).toBe("a");
    }
  });

  it("リポジトリエラー時にエラーを返す", async () => {
    // Arrange
    mockSessionRepository.save = vi
      .fn()
      .mockRejectedValue(new Error("DB Error"));
    const input = {
      userId: "user-123",
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("REPOSITORY_ERROR");
    }
  });
});
