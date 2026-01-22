/**
 * Chat History テストユーティリティ
 *
 * テストで共通使用するモックリポジトリ生成関数と
 * Provider wrapperを提供する。
 *
 * @module features/chat-history/__tests__/test-utils
 */

import { vi } from "vitest";
import type {
  IChatSessionRepository,
  IChatMessageRepository,
} from "@repo/shared";

/**
 * モックSessionRepositoryを生成する
 *
 * @param overrides - 個別メソッドのオーバーライド
 * @returns モックリポジトリ
 */
export function createMockSessionRepository(
  overrides: Partial<IChatSessionRepository> = {},
): IChatSessionRepository {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findPinned: vi.fn(),
    search: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn(),
    exists: vi.fn(),
    countPinned: vi.fn().mockResolvedValue(0),
    ...overrides,
  };
}

/**
 * モックMessageRepositoryを生成する
 *
 * @param overrides - 個別メソッドのオーバーライド
 * @returns モックリポジトリ
 */
export function createMockMessageRepository(
  overrides: Partial<IChatMessageRepository> = {},
): IChatMessageRepository {
  return {
    findById: vi.fn(),
    findBySessionId: vi.fn(),
    findLatestBySessionId: vi.fn(),
    countBySessionId: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
    saveMany: vi.fn(),
    delete: vi.fn(),
    deleteBySessionId: vi.fn(),
    ...overrides,
  };
}

/**
 * モックリポジトリのペアを生成する
 *
 * @returns sessionRepository と messageRepository のペア
 */
export function createMockRepositories(): {
  sessionRepository: IChatSessionRepository;
  messageRepository: IChatMessageRepository;
} {
  return {
    sessionRepository: createMockSessionRepository(),
    messageRepository: createMockMessageRepository(),
  };
}
