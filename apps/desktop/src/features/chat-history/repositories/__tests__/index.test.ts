/**
 * リポジトリファクトリーテスト
 *
 * setChatHistoryRepositories / getChatHistoryRepositories の動作を検証する
 *
 * Note: DrizzleリポジトリはNode.js専用のため、Renderer側では使用できない。
 * このテストはRenderer側のリポジトリ管理API（set/get/reset）のみをテストする。
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type {
  IChatSessionRepository,
  IChatMessageRepository,
} from "@repo/shared";

import {
  setChatHistoryRepositories,
  getChatHistoryRepositories,
  isRepositoriesInitialized,
  resetRepositories,
} from "../index";

// モックリポジトリの作成
function createMockSessionRepository(): IChatSessionRepository {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findPinned: vi.fn(),
    search: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn(),
    exists: vi.fn(),
    countPinned: vi.fn().mockResolvedValue(0),
  };
}

function createMockMessageRepository(): IChatMessageRepository {
  return {
    findById: vi.fn(),
    findBySessionId: vi.fn(),
    findLatestBySessionId: vi.fn(),
    countBySessionId: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
    saveMany: vi.fn(),
    delete: vi.fn(),
    deleteBySessionId: vi.fn(),
  };
}

describe("Repository Factory", () => {
  beforeEach(() => {
    // テスト間でシングルトン状態をリセット
    resetRepositories();
  });

  describe("setChatHistoryRepositories", () => {
    it("should set session repository", () => {
      const mockRepos = {
        sessionRepository: createMockSessionRepository(),
        messageRepository: createMockMessageRepository(),
      };

      setChatHistoryRepositories(mockRepos);
      const repos = getChatHistoryRepositories();

      expect(repos.sessionRepository).toBe(mockRepos.sessionRepository);
    });

    it("should set message repository", () => {
      const mockRepos = {
        sessionRepository: createMockSessionRepository(),
        messageRepository: createMockMessageRepository(),
      };

      setChatHistoryRepositories(mockRepos);
      const repos = getChatHistoryRepositories();

      expect(repos.messageRepository).toBe(mockRepos.messageRepository);
    });

    it("should overwrite repositories when called multiple times", () => {
      const mockRepos1 = {
        sessionRepository: createMockSessionRepository(),
        messageRepository: createMockMessageRepository(),
      };
      const mockRepos2 = {
        sessionRepository: createMockSessionRepository(),
        messageRepository: createMockMessageRepository(),
      };

      setChatHistoryRepositories(mockRepos1);
      setChatHistoryRepositories(mockRepos2);
      const repos = getChatHistoryRepositories();

      expect(repos.sessionRepository).toBe(mockRepos2.sessionRepository);
      expect(repos.messageRepository).toBe(mockRepos2.messageRepository);
    });
  });

  describe("getChatHistoryRepositories", () => {
    it("should return repositories after initialization", () => {
      const mockRepos = {
        sessionRepository: createMockSessionRepository(),
        messageRepository: createMockMessageRepository(),
      };
      setChatHistoryRepositories(mockRepos);

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
      const mockRepos = {
        sessionRepository: createMockSessionRepository(),
        messageRepository: createMockMessageRepository(),
      };
      setChatHistoryRepositories(mockRepos);

      expect(isRepositoriesInitialized()).toBe(true);
    });
  });

  describe("resetRepositories", () => {
    it("should reset initialization state", () => {
      const mockRepos = {
        sessionRepository: createMockSessionRepository(),
        messageRepository: createMockMessageRepository(),
      };
      setChatHistoryRepositories(mockRepos);
      expect(isRepositoriesInitialized()).toBe(true);

      resetRepositories();

      expect(isRepositoriesInitialized()).toBe(false);
    });
  });
});
