/**
 * Claude Agent SDK モック
 * TASK-9C テスト用
 *
 * @see docs/30-workflows/TASK-9C-skill-improver/phase-06-test-expansion.md
 */
import { vi } from "vitest";

export const mockQuery = vi.fn();

export const query = mockQuery;

/**
 * テスト用ヘルパー: 正常応答をモック
 */
export const mockQueryResponse = (response: { content: string }) => {
  mockQuery.mockResolvedValueOnce(response);
};

/**
 * テスト用ヘルパー: エラー応答をモック
 */
export const mockQueryError = (error: Error) => {
  mockQuery.mockRejectedValueOnce(error);
};

/**
 * テスト用ヘルパー: タイムアウトをシミュレート
 */
export const mockQueryTimeout = (delayMs: number = 30000) => {
  mockQuery.mockImplementationOnce(
    () =>
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), delayMs),
      ),
  );
};

/**
 * テスト用ヘルパー: レート制限エラーをシミュレート
 */
export const mockQueryRateLimited = () => {
  mockQuery.mockRejectedValueOnce(new Error("Rate limit exceeded"));
};

/**
 * モックをリセット
 */
export const resetMockQuery = () => {
  mockQuery.mockReset();
};
