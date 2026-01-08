/**
 * ConversionLogger ユニットテスト
 *
 * TDD Green Phase: 実装を使用したテスト実行
 *
 * @see docs/30-workflows/logging-service/outputs/phase-4/test-cases.md
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createMockLogRepository,
  createFailingMockLogRepository,
  type ILogRepository,
} from "./mocks/log-repository.mock";
import { ConversionLogger } from "../conversion-logger";
import type { ConversionLogInput } from "../types";

// ============================================================================
// テストスイート
// ============================================================================

describe("ConversionLogger", () => {
  let mockRepo: ILogRepository;

  beforeEach(() => {
    mockRepo = createMockLogRepository();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // ==========================================================================
  // 1. INFOログ記録 (AC-001)
  // ==========================================================================
  describe("info()", () => {
    it("TC-001: INFOログを正常に記録できる", async () => {
      // Arrange
      const logger = new ConversionLogger(mockRepo, { bufferSize: 100 });
      const input: ConversionLogInput = {
        fileId: "file-123",
        fileName: "test.md",
        action: "convert",
        message: "変換開始",
      };

      // Act
      const result = await logger.info(input);

      // Assert
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        const data = result.data as {
          level: string;
          fileId: string;
          id: string;
          timestamp: Date;
        };
        expect(data.level).toBe("info");
        expect(data.fileId).toBe("file-123");
        expect(data.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        );
        expect(data.timestamp).toBeInstanceOf(Date);
      }
    });
  });

  // ==========================================================================
  // 2. WARNログ記録 (AC-002)
  // ==========================================================================
  describe("warn()", () => {
    it("TC-002: WARNログを正常に記録できる", async () => {
      // Arrange
      const logger = new ConversionLogger(mockRepo);
      const input: ConversionLogInput = {
        fileId: "file-456",
        fileName: "large.pdf",
        action: "convert",
        message: "ファイルサイズが大きい",
      };

      // Act
      const result = await logger.warn(input);

      // Assert
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        const data = result.data as { level: string };
        expect(data.level).toBe("warn");
      }
    });
  });

  // ==========================================================================
  // 3. ERRORログ記録 (AC-003, AC-004)
  // ==========================================================================
  describe("error()", () => {
    it("TC-003: ERRORログにスタックトレースを含められる", async () => {
      // Arrange
      const logger = new ConversionLogger(mockRepo);
      const input: ConversionLogInput = {
        fileId: "file-789",
        fileName: "corrupt.doc",
        action: "convert",
        message: "変換失敗",
      };
      const error = new Error("変換に失敗しました");

      // Act
      const result = await logger.error(input, error);

      // Assert
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        const data = result.data as { level: string; errorStack?: string };
        expect(data.level).toBe("error");
        expect(data.errorStack).toBeDefined();
        expect(data.errorStack).toContain("Error: 変換に失敗しました");
      }
    });

    it("TC-004: ERRORログをErrorオブジェクトなしで記録できる", async () => {
      // Arrange
      const logger = new ConversionLogger(mockRepo);
      const input: ConversionLogInput = {
        fileId: "file-999",
        fileName: "unknown.txt",
        action: "convert",
        message: "不明なエラー",
      };

      // Act
      const result = await logger.error(input);

      // Assert
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        const data = result.data as { level: string; errorStack?: string };
        expect(data.level).toBe("error");
        expect(data.errorStack).toBeUndefined();
      }
    });
  });

  // ==========================================================================
  // 4. バッファリング動作 (AC-005, AC-006)
  // ==========================================================================
  describe("バッファリング", () => {
    it("TC-005: ログがバッファに蓄積される", async () => {
      // Arrange
      const logger = new ConversionLogger(mockRepo, { bufferSize: 100 });
      const input: ConversionLogInput = {
        fileId: "file-001",
        fileName: "test.md",
        action: "convert",
        message: "テスト",
      };

      // Act
      await logger.info(input);
      await logger.info(input);
      await logger.info(input);

      // Assert
      expect(mockRepo.bulkInsert).not.toHaveBeenCalled();
    });

    it("TC-006: バッファが満杯になると自動フラッシュされる", async () => {
      // Arrange
      const logger = new ConversionLogger(mockRepo, {
        bufferSize: 2,
        flushIntervalMs: 0,
      });
      const input: ConversionLogInput = {
        fileId: "file-001",
        fileName: "test.md",
        action: "convert",
        message: "テスト",
      };

      // Act
      await logger.info(input);
      await logger.info(input);

      // Assert
      expect(mockRepo.bulkInsert).toHaveBeenCalledTimes(1);
      expect(mockRepo.bulkInsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ level: "info" }),
          expect.objectContaining({ level: "info" }),
        ]),
      );
    });
  });

  // ==========================================================================
  // 5. 時間ベース自動フラッシュ (AC-007)
  // ==========================================================================
  describe("自動フラッシュタイマー", () => {
    it("TC-007: 自動フラッシュタイマーが動作する", async () => {
      // Arrange
      const logger = new ConversionLogger(mockRepo, {
        bufferSize: 100,
        flushIntervalMs: 100,
      });
      const input: ConversionLogInput = {
        fileId: "file-001",
        fileName: "test.md",
        action: "convert",
        message: "テスト",
      };

      // Act
      await logger.info(input);
      expect(mockRepo.bulkInsert).not.toHaveBeenCalled();

      // 100ms経過
      await vi.advanceTimersByTimeAsync(100);

      // Assert
      expect(mockRepo.bulkInsert).toHaveBeenCalledTimes(1);

      // Cleanup
      logger.dispose();
    });
  });

  // ==========================================================================
  // 6. バッチログ記録 (AC-008)
  // ==========================================================================
  describe("batch()", () => {
    it("TC-008: バッチログ記録が動作する", async () => {
      // Arrange
      const logger = new ConversionLogger(mockRepo, { bufferSize: 100 });
      const logs = [
        {
          level: "info" as const,
          input: {
            fileId: "1",
            fileName: "a.md",
            action: "convert" as const,
            message: "開始",
          },
        },
        {
          level: "warn" as const,
          input: {
            fileId: "2",
            fileName: "b.md",
            action: "convert" as const,
            message: "警告",
          },
        },
        {
          level: "error" as const,
          input: {
            fileId: "3",
            fileName: "c.md",
            action: "convert" as const,
            message: "失敗",
          },
        },
      ];

      // Act
      const result = await logger.batch(logs);

      // Assert
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data).toHaveLength(3);
        const data = result.data as Array<{ level: string }>;
        expect(data[0].level).toBe("info");
        expect(data[1].level).toBe("warn");
        expect(data[2].level).toBe("error");
      }
    });
  });

  // ==========================================================================
  // 7. 手動フラッシュ (AC-009, AC-010)
  // ==========================================================================
  describe("flush()", () => {
    it("TC-009: 手動フラッシュが動作する", async () => {
      // Arrange
      const logger = new ConversionLogger(mockRepo, { bufferSize: 100 });
      const input: ConversionLogInput = {
        fileId: "file-001",
        fileName: "test.md",
        action: "convert",
        message: "テスト",
      };

      await logger.info(input);
      await logger.info(input);
      await logger.info(input);

      // Act
      const result = await logger.flush();

      // Assert
      expect(result.success).toBe(true);
      expect(mockRepo.bulkInsert).toHaveBeenCalledTimes(1);
      expect(mockRepo.bulkInsert).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ level: "info" })]),
      );
    });

    it("TC-010: 空バッファのフラッシュでもエラーにならない", async () => {
      // Arrange
      const logger = new ConversionLogger(mockRepo);

      // Act
      const result = await logger.flush();

      // Assert
      expect(result.success).toBe(true);
      expect(mockRepo.bulkInsert).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // 8. リソース解放 (AC-011)
  // ==========================================================================
  describe("dispose()", () => {
    it("TC-011: dispose時にフラッシュされる", async () => {
      // Arrange
      const logger = new ConversionLogger(mockRepo, {
        bufferSize: 100,
        flushIntervalMs: 1000,
      });
      const input: ConversionLogInput = {
        fileId: "file-001",
        fileName: "test.md",
        action: "convert",
        message: "テスト",
      };

      await logger.info(input);
      await logger.info(input);

      // Act
      logger.dispose();

      // Assert
      expect(mockRepo.bulkInsert).toHaveBeenCalledTimes(1);
      expect(mockRepo.bulkInsert).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ level: "info" })]),
      );
    });
  });

  // ==========================================================================
  // 9. Repository障害時 (AC-012)
  // ==========================================================================
  describe("エラーハンドリング", () => {
    it("TC-012: Repository障害時にエラーが伝播する", async () => {
      // Arrange
      const failingRepo = createFailingMockLogRepository();
      const logger = new ConversionLogger(failingRepo, { bufferSize: 1 });
      const input: ConversionLogInput = {
        fileId: "file-001",
        fileName: "test.md",
        action: "convert",
        message: "テスト",
      };

      // Act
      const result = await logger.info(input);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(Error);
      }
    });
  });

  // ==========================================================================
  // 10. 境界値テスト
  // ==========================================================================
  describe("境界値テスト", () => {
    describe("bufferSize境界値", () => {
      it("BV-001: bufferSize=0で即時フラッシュされる", async () => {
        // Arrange
        const logger = new ConversionLogger(mockRepo, { bufferSize: 0 });
        const input: ConversionLogInput = {
          fileId: "file-001",
          fileName: "test.md",
          action: "convert",
          message: "テスト",
        };

        // Act
        await logger.info(input);

        // Assert
        expect(mockRepo.bulkInsert).toHaveBeenCalledTimes(1);
      });

      it("BV-002: bufferSize=1で毎回フラッシュされる", async () => {
        // Arrange
        const logger = new ConversionLogger(mockRepo, { bufferSize: 1 });
        const input: ConversionLogInput = {
          fileId: "file-001",
          fileName: "test.md",
          action: "convert",
          message: "テスト",
        };

        // Act
        await logger.info(input);
        await logger.info(input);
        await logger.info(input);

        // Assert
        expect(mockRepo.bulkInsert).toHaveBeenCalledTimes(3);
      });

      it("BV-003: bufferSize=100でバッファリングされる", async () => {
        // Arrange
        const logger = new ConversionLogger(mockRepo, { bufferSize: 100 });
        const input: ConversionLogInput = {
          fileId: "file-001",
          fileName: "test.md",
          action: "convert",
          message: "テスト",
        };

        // Act: 99件追加
        for (let i = 0; i < 99; i++) {
          await logger.info(input);
        }

        // Assert: まだフラッシュされていない
        expect(mockRepo.bulkInsert).not.toHaveBeenCalled();

        // Act: 100件目
        await logger.info(input);

        // Assert: フラッシュされる
        expect(mockRepo.bulkInsert).toHaveBeenCalledTimes(1);
      });
    });

    describe("flushIntervalMs境界値", () => {
      it("BV-005: flushIntervalMs=0でタイマーが無効になる", async () => {
        // Arrange
        const logger = new ConversionLogger(mockRepo, {
          bufferSize: 100,
          flushIntervalMs: 0,
        });
        const input: ConversionLogInput = {
          fileId: "file-001",
          fileName: "test.md",
          action: "convert",
          message: "テスト",
        };

        // Act
        await logger.info(input);
        await vi.advanceTimersByTimeAsync(10000);

        // Assert
        expect(mockRepo.bulkInsert).not.toHaveBeenCalled();

        // Cleanup
        logger.dispose();
      });
    });

    describe("バッチサイズ境界値", () => {
      it("BV-008: 空のバッチを処理できる", async () => {
        // Arrange
        const logger = new ConversionLogger(mockRepo);

        // Act
        const result = await logger.batch([]);

        // Assert
        expect(result.success).toBe(true);
        if (result.success && result.data) {
          expect(result.data).toHaveLength(0);
        }
      });

      it("BV-009: 大量のバッチログを処理できる", async () => {
        // Arrange
        const logger = new ConversionLogger(mockRepo, { bufferSize: 1000 });
        const logs = Array.from({ length: 1000 }, (_, i) => ({
          level: "info" as const,
          input: {
            fileId: `file-${i}`,
            fileName: `test-${i}.md`,
            action: "convert" as const,
            message: `メッセージ${i}`,
          },
        }));

        // Act
        const result = await logger.batch(logs);

        // Assert
        expect(result.success).toBe(true);
        if (result.success && result.data) {
          expect(result.data).toHaveLength(1000);
        }
      });
    });
  });

  // ==========================================================================
  // 11. バリデーションエラーテスト (カバレッジ拡充)
  // ==========================================================================
  describe("バリデーションエラー", () => {
    it("TC-013: 空のfileIdでバリデーションエラーになる", async () => {
      // Arrange
      const logger = new ConversionLogger(mockRepo);
      const invalidInput = {
        fileId: "", // 空文字は無効
        fileName: "test.md",
        action: "convert" as const,
        message: "テスト",
      };

      // Act
      const result = await logger.info(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain("Validation error");
      }
    });

    it("TC-014: 空のfileNameでバリデーションエラーになる", async () => {
      // Arrange
      const logger = new ConversionLogger(mockRepo);
      const invalidInput = {
        fileId: "file-001",
        fileName: "", // 空文字は無効
        action: "convert" as const,
        message: "テスト",
      };

      // Act
      const result = await logger.info(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain("Validation error");
      }
    });

    it("TC-015: 空のmessageでバリデーションエラーになる", async () => {
      // Arrange
      const logger = new ConversionLogger(mockRepo);
      const invalidInput = {
        fileId: "file-001",
        fileName: "test.md",
        action: "convert" as const,
        message: "", // 空文字は無効
      };

      // Act
      const result = await logger.info(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain("Validation error");
      }
    });
  });

  // ==========================================================================
  // 12. bufferSize=0でのエラー伝播テスト (カバレッジ拡充)
  // ==========================================================================
  describe("bufferSize=0でのエラー伝播", () => {
    it("TC-016: bufferSize=0でRepository障害時にエラーが伝播する", async () => {
      // Arrange
      const failingRepo = createFailingMockLogRepository();
      const logger = new ConversionLogger(failingRepo, { bufferSize: 0 });
      const input: ConversionLogInput = {
        fileId: "file-001",
        fileName: "test.md",
        action: "convert",
        message: "テスト",
      };

      // Act
      const result = await logger.info(input);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.message).toContain("Database connection failed");
      }
    });
  });
});
