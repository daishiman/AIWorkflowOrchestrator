/**
 * LogRepository Mock
 *
 * ConversionLoggerのユニットテスト用モック実装
 */

import { vi } from "vitest";
import type { ConversionLog } from "../../types";

/**
 * Result型の定義（実装まではローカル定義）
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * ILogRepository インターフェース定義
 */
export interface ILogRepository {
  bulkInsert(logs: ConversionLog[]): Promise<Result<void>>;
  findByFileId(fileId: string): Promise<Result<ConversionLog[]>>;
  findByLevel(level: string): Promise<Result<ConversionLog[]>>;
  findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Result<ConversionLog[]>>;
}

/**
 * 正常動作するLogRepositoryモックを作成
 *
 * @returns モック化されたILogRepository
 */
export function createMockLogRepository(): ILogRepository {
  return {
    bulkInsert: vi.fn().mockResolvedValue({ success: true, data: undefined }),
    findByFileId: vi.fn().mockResolvedValue({ success: true, data: [] }),
    findByLevel: vi.fn().mockResolvedValue({ success: true, data: [] }),
    findByDateRange: vi.fn().mockResolvedValue({ success: true, data: [] }),
  };
}

/**
 * エラーを返すLogRepositoryモックを作成
 *
 * @returns エラーを返すモック化されたILogRepository
 */
export function createFailingMockLogRepository(): ILogRepository {
  return {
    bulkInsert: vi.fn().mockResolvedValue({
      success: false,
      error: new Error("Database connection failed"),
    }),
    findByFileId: vi.fn().mockResolvedValue({ success: true, data: [] }),
    findByLevel: vi.fn().mockResolvedValue({ success: true, data: [] }),
    findByDateRange: vi.fn().mockResolvedValue({ success: true, data: [] }),
  };
}

/**
 * 呼び出しを記録するSpyモックを作成
 *
 * @returns Spy機能付きモック
 */
export function createSpyMockLogRepository(): ILogRepository & {
  getInsertedLogs: () => ConversionLog[][];
} {
  const insertedLogs: ConversionLog[][] = [];

  return {
    bulkInsert: vi.fn().mockImplementation(async (logs: ConversionLog[]) => {
      insertedLogs.push([...logs]);
      return { success: true, data: undefined };
    }),
    findByFileId: vi.fn().mockResolvedValue({ success: true, data: [] }),
    findByLevel: vi.fn().mockResolvedValue({ success: true, data: [] }),
    findByDateRange: vi.fn().mockResolvedValue({ success: true, data: [] }),
    getInsertedLogs: () => insertedLogs,
  };
}
