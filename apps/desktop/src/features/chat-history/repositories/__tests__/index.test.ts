/**
 * リポジトリファクトリーテスト
 *
 * Phase 4: タスク1 - TDD Red Phase
 * リポジトリファクトリーの動作を検証する
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// 注意: このインポートは実装前なのでエラーになる（Red状態）
// Phase 5で実装後にパスする
import {
  createChatHistoryRepositories,
  getChatHistoryRepositories,
  isRepositoriesInitialized,
  resetRepositories,
} from "../index";

// モックDB
function createMockDb() {
  return {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
  };
}

describe("Repository Factory", () => {
  beforeEach(() => {
    // テスト間でシングルトン状態をリセット
    resetRepositories();
  });

  describe("createChatHistoryRepositories", () => {
    it("should create session repository", () => {
      const mockDb = createMockDb();

      const repos = createChatHistoryRepositories(mockDb);

      expect(repos.sessionRepository).toBeDefined();
    });

    it("should create message repository", () => {
      const mockDb = createMockDb();

      const repos = createChatHistoryRepositories(mockDb);

      expect(repos.messageRepository).toBeDefined();
    });

    it("should return same instance when called multiple times (singleton)", () => {
      const mockDb = createMockDb();

      const repos1 = createChatHistoryRepositories(mockDb);
      const repos2 = createChatHistoryRepositories(mockDb);

      expect(repos1.sessionRepository).toBe(repos2.sessionRepository);
      expect(repos1.messageRepository).toBe(repos2.messageRepository);
    });
  });

  describe("getChatHistoryRepositories", () => {
    it("should return repositories after initialization", () => {
      const mockDb = createMockDb();
      createChatHistoryRepositories(mockDb);

      const repos = getChatHistoryRepositories();

      expect(repos.sessionRepository).toBeDefined();
      expect(repos.messageRepository).toBeDefined();
    });

    it("should throw error when not initialized", () => {
      expect(() => getChatHistoryRepositories()).toThrow(
        "Chat history repositories not initialized",
      );
    });
  });

  describe("isRepositoriesInitialized", () => {
    it("should return false before initialization", () => {
      expect(isRepositoriesInitialized()).toBe(false);
    });

    it("should return true after initialization", () => {
      const mockDb = createMockDb();
      createChatHistoryRepositories(mockDb);

      expect(isRepositoriesInitialized()).toBe(true);
    });
  });

  describe("resetRepositories", () => {
    it("should reset initialization state", () => {
      const mockDb = createMockDb();
      createChatHistoryRepositories(mockDb);
      expect(isRepositoriesInitialized()).toBe(true);

      resetRepositories();

      expect(isRepositoriesInitialized()).toBe(false);
    });
  });
});
