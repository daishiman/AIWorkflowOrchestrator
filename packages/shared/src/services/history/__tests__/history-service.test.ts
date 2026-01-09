/**
 * HistoryService ユニットテスト
 *
 * @module @repo/shared/services/history/__tests__
 * @description TDD Red フェーズ - 失敗するテストを先に作成
 */

import { describe, it, expect, beforeEach } from "vitest";
import { HistoryService } from "../history-service";
import {
  createMockConversion,
  createMockConversionRepository,
  createErrorMockConversionRepository,
  createMockLogger,
} from "./mocks";
import type { Conversion, FileRepository } from "../types";

// FileRepository モック
function createMockFileRepository(): FileRepository {
  return {
    async findById() {
      return { success: true, data: null };
    },
  };
}

describe("HistoryService", () => {
  let mockConvRepo: ReturnType<typeof createMockConversionRepository>;
  let mockFileRepo: FileRepository;
  let mockLogger: ReturnType<typeof createMockLogger>;
  let service: HistoryService;

  beforeEach(() => {
    mockConvRepo = createMockConversionRepository();
    mockFileRepo = createMockFileRepository();
    mockLogger = createMockLogger();
    service = new HistoryService(mockConvRepo, mockFileRepo, mockLogger);
  });

  // ==========================================================================
  // AC-001: 履歴一覧取得
  // ==========================================================================

  describe("getFileHistory", () => {
    it("AC-001-01: ファイルの履歴一覧を取得できる", async () => {
      // Given: ファイルID "file-123" に3件のバージョン履歴が存在する
      const conversions: Conversion[] = [
        createMockConversion({
          id: "conv-1",
          fileId: "file-123",
          createdAt: new Date("2026-01-01"),
        }),
        createMockConversion({
          id: "conv-2",
          fileId: "file-123",
          createdAt: new Date("2026-01-02"),
        }),
        createMockConversion({
          id: "conv-3",
          fileId: "file-123",
          createdAt: new Date("2026-01-03"),
        }),
      ];
      mockConvRepo._setConversions(conversions);

      // When: getFileHistory("file-123") を呼び出す
      const result = await service.getFileHistory("file-123");

      // Then: Result.success が true である
      expect(result.success).toBe(true);
      if (result.success) {
        // And: Result.data.items の長さが 3 である
        expect(result.data.items.length).toBe(3);
        // And: Result.data.total が 3 である
        expect(result.data.total).toBe(3);
        // And: Result.data.hasMore が false である
        expect(result.data.hasMore).toBe(false);
      }
    });

    it("AC-001-02: ページネーションが正しく動作する", async () => {
      // Given: ファイルID "file-123" に10件のバージョン履歴が存在する
      const conversions: Conversion[] = Array.from({ length: 10 }, (_, i) =>
        createMockConversion({
          id: `conv-${i + 1}`,
          fileId: "file-123",
          createdAt: new Date(`2026-01-${String(i + 1).padStart(2, "0")}`),
        }),
      );
      mockConvRepo._setConversions(conversions);

      // When: getFileHistory("file-123", { pagination: { limit: 5, offset: 0 } }) を呼び出す
      const result = await service.getFileHistory("file-123", {
        pagination: { limit: 5, offset: 0 },
      });

      // Then: Result.success が true である
      expect(result.success).toBe(true);
      if (result.success) {
        // And: Result.data.items の長さが 5 である
        expect(result.data.items.length).toBe(5);
        // And: Result.data.total が 10 である
        expect(result.data.total).toBe(10);
        // And: Result.data.hasMore が true である
        expect(result.data.hasMore).toBe(true);
      }
    });

    it("AC-001-03: 日付範囲フィルタが動作する", async () => {
      // Given: ファイルID "file-123" に以下の履歴が存在する
      const conversions: Conversion[] = [
        createMockConversion({
          id: "conv-1",
          fileId: "file-123",
          createdAt: new Date("2026-01-01"),
        }),
        createMockConversion({
          id: "conv-2",
          fileId: "file-123",
          createdAt: new Date("2026-01-05"),
        }),
        createMockConversion({
          id: "conv-3",
          fileId: "file-123",
          createdAt: new Date("2026-01-10"),
        }),
      ];
      mockConvRepo._setConversions(conversions);

      // When: getFileHistory with filter を呼び出す
      const result = await service.getFileHistory("file-123", {
        filter: {
          dateFrom: new Date("2026-01-03"),
          dateTo: new Date("2026-01-08"),
        },
      });

      // Then: Result.success が true である
      expect(result.success).toBe(true);
      if (result.success) {
        // And: Result.data.items の長さが 1 である
        expect(result.data.items.length).toBe(1);
      }
    });

    it("AC-001-04: 空の履歴の場合", async () => {
      // Given: ファイルID "file-empty" に履歴が存在しない
      mockConvRepo._setConversions([]);

      // When: getFileHistory("file-empty") を呼び出す
      const result = await service.getFileHistory("file-empty");

      // Then: Result.success が true である
      expect(result.success).toBe(true);
      if (result.success) {
        // And: Result.data.items の長さが 0 である
        expect(result.data.items.length).toBe(0);
        // And: Result.data.total が 0 である
        expect(result.data.total).toBe(0);
        // And: Result.data.hasMore が false である
        expect(result.data.hasMore).toBe(false);
      }
    });

    it("AC-001-05: 履歴は新しい順でソートされる", async () => {
      // Given: ファイルID "file-123" に以下の履歴が存在する（古い順に作成）
      const conversions: Conversion[] = [
        createMockConversion({
          id: "conv-1",
          fileId: "file-123",
          createdAt: new Date("2026-01-01"),
        }),
        createMockConversion({
          id: "conv-2",
          fileId: "file-123",
          createdAt: new Date("2026-01-02"),
        }),
        createMockConversion({
          id: "conv-3",
          fileId: "file-123",
          createdAt: new Date("2026-01-03"),
        }),
      ];
      mockConvRepo._setConversions(conversions);

      // When: getFileHistory("file-123") を呼び出す
      const result = await service.getFileHistory("file-123");

      // Then: 最新が先頭
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items[0].conversionId).toBe("conv-3");
        expect(result.data.items[2].conversionId).toBe("conv-1");
      }
    });
  });

  // ==========================================================================
  // AC-002: バージョン詳細取得
  // ==========================================================================

  describe("getVersionDetail", () => {
    it("AC-002-01: バージョン詳細を取得できる", async () => {
      // Given: 変換ID "conv-123" が存在する
      const conversion = createMockConversion({
        id: "conv-123",
        fileId: "file-123",
        fileName: "test.txt",
        mimeType: "text/plain",
        sizeBytes: 1024,
      });
      mockConvRepo._setConversions([conversion]);

      // When: getVersionDetail("conv-123") を呼び出す
      const result = await service.getVersionDetail("conv-123");

      // Then: Result.success が true である
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.conversionId).toBe("conv-123");
        expect(result.data.fileId).toBe("file-123");
        expect(result.data.fileName).toBe("test.txt");
        expect(result.data.mimeType).toBe("text/plain");
        expect(result.data.sizeBytes).toBe(1024);
      }
    });

    it("AC-002-02: 存在しない変換IDはエラー", async () => {
      // Given: 変換ID "not-found" が存在しない
      mockConvRepo._setConversions([]);

      // When: getVersionDetail("not-found") を呼び出す
      const result = await service.getVersionDetail("not-found");

      // Then: Result.success が false である
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain("Conversion not found");
      }
    });

    it("AC-002-03: 最新バージョンフラグが正しく設定される", async () => {
      // Given: 2つのバージョンが存在する
      const conversions: Conversion[] = [
        createMockConversion({
          id: "conv-1",
          fileId: "file-123",
          createdAt: new Date("2026-01-01"),
        }),
        createMockConversion({
          id: "conv-2",
          fileId: "file-123",
          createdAt: new Date("2026-01-02"),
        }),
      ];
      mockConvRepo._setConversions(conversions);

      // When: 最新バージョンを取得
      const result1 = await service.getVersionDetail("conv-2");
      expect(result1.success).toBe(true);
      if (result1.success) {
        expect(result1.data.isCurrentVersion).toBe(true);
      }

      // When: 古いバージョンを取得
      const result2 = await service.getVersionDetail("conv-1");
      expect(result2.success).toBe(true);
      if (result2.success) {
        expect(result2.data.isCurrentVersion).toBe(false);
      }
    });
  });

  // ==========================================================================
  // AC-003: バージョン差分取得
  // ==========================================================================

  describe("getVersionDiff", () => {
    it("AC-003-01: サイズ変更を検出できる", async () => {
      // Given: 2つの変換が存在する
      const conversions: Conversion[] = [
        createMockConversion({
          id: "conv-1",
          fileId: "file-123",
          sizeBytes: 1000,
        }),
        createMockConversion({
          id: "conv-2",
          fileId: "file-123",
          sizeBytes: 1500,
        }),
      ];
      mockConvRepo._setConversions(conversions);

      // When: getVersionDiff("conv-1", "conv-2") を呼び出す
      const result = await service.getVersionDiff("conv-1", "conv-2");

      // Then: sizeChange が 500 である
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sizeChange).toBe(500);
      }
    });

    it("AC-003-02: コンテンツ変更を検出できる", async () => {
      // Given: 2つの変換が存在する（異なるハッシュ）
      const conversions: Conversion[] = [
        createMockConversion({
          id: "conv-1",
          fileId: "file-123",
          contentHash: "hash-abc",
        }),
        createMockConversion({
          id: "conv-2",
          fileId: "file-123",
          contentHash: "hash-xyz",
        }),
      ];
      mockConvRepo._setConversions(conversions);

      // When: getVersionDiff を呼び出す
      const result = await service.getVersionDiff("conv-1", "conv-2");

      // Then: contentChanged が true である
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contentChanged).toBe(true);
      }
    });

    it("AC-003-03: コンテンツ未変更を検出できる", async () => {
      // Given: 2つの変換が存在する（同一ハッシュ）
      const conversions: Conversion[] = [
        createMockConversion({
          id: "conv-1",
          fileId: "file-123",
          contentHash: "hash-abc",
        }),
        createMockConversion({
          id: "conv-2",
          fileId: "file-123",
          contentHash: "hash-abc",
        }),
      ];
      mockConvRepo._setConversions(conversions);

      // When: getVersionDiff を呼び出す
      const result = await service.getVersionDiff("conv-1", "conv-2");

      // Then: contentChanged が false である
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contentChanged).toBe(false);
      }
    });

    it("AC-003-04: メタデータ変更を検出できる", async () => {
      // Given: 2つの変換が存在する（異なるメタデータ）
      const conversions: Conversion[] = [
        createMockConversion({
          id: "conv-1",
          fileId: "file-123",
          metadata: { author: "Alice" },
        }),
        createMockConversion({
          id: "conv-2",
          fileId: "file-123",
          metadata: { author: "Bob" },
        }),
      ];
      mockConvRepo._setConversions(conversions);

      // When: getVersionDiff を呼び出す
      const result = await service.getVersionDiff("conv-1", "conv-2");

      // Then: メタデータ変更が検出される
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadataChanges.length).toBe(1);
        expect(result.data.metadataChanges[0].key).toBe("author");
        expect(result.data.metadataChanges[0].oldValue).toBe("Alice");
        expect(result.data.metadataChanges[0].newValue).toBe("Bob");
      }
    });

    it("AC-003-05: 変換Aが存在しない場合はエラー", async () => {
      // Given: conv-2 のみ存在
      const conversions: Conversion[] = [
        createMockConversion({ id: "conv-2", fileId: "file-123" }),
      ];
      mockConvRepo._setConversions(conversions);

      // When: getVersionDiff を呼び出す
      const result = await service.getVersionDiff("not-found", "conv-2");

      // Then: エラー
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain("Source conversion not found");
      }
    });

    it("AC-003-06: 変換Bが存在しない場合はエラー", async () => {
      // Given: conv-1 のみ存在
      const conversions: Conversion[] = [
        createMockConversion({ id: "conv-1", fileId: "file-123" }),
      ];
      mockConvRepo._setConversions(conversions);

      // When: getVersionDiff を呼び出す
      const result = await service.getVersionDiff("conv-1", "not-found");

      // Then: エラー
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain("Target conversion not found");
      }
    });
  });

  // ==========================================================================
  // AC-004: バージョン復元
  // ==========================================================================

  describe("restoreToVersion", () => {
    it("AC-004-01: バージョンを復元できる", async () => {
      // Given: 変換ID "conv-old" がファイルID "file-123" に属している
      const conversion = createMockConversion({
        id: "conv-old",
        fileId: "file-123",
        fileName: "test.txt",
        mimeType: "text/plain",
        content: "old content",
      });
      mockConvRepo._setConversions([conversion]);

      // When: restoreToVersion("file-123", "conv-old") を呼び出す
      const result = await service.restoreToVersion("file-123", "conv-old");

      // Then: Result.success が true である
      expect(result.success).toBe(true);
      if (result.success) {
        // And: 新規IDが生成される
        expect(result.data.conversionId).not.toBe("conv-old");
        // And: ファイルIDは同じ
        expect(result.data.fileId).toBe("file-123");
        // And: ファイル名は同じ
        expect(result.data.fileName).toBe("test.txt");
        // And: メタデータに復元情報が含まれる
        expect(result.data.metadata?.restoredFrom).toBe("conv-old");
        expect(result.data.metadata?.restoredAt).toBeDefined();
      }
    });

    it("AC-004-02: 存在しない変換の復元はエラー", async () => {
      // Given: 変換が存在しない
      mockConvRepo._setConversions([]);

      // When: restoreToVersion を呼び出す
      const result = await service.restoreToVersion("file-123", "not-found");

      // Then: エラー
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain("Conversion not found");
      }
    });

    it("AC-004-03: 別ファイルのバージョンを復元はエラー", async () => {
      // Given: 変換が別ファイルに属している
      const conversion = createMockConversion({
        id: "conv-other",
        fileId: "file-other",
      });
      mockConvRepo._setConversions([conversion]);

      // When: restoreToVersion を呼び出す
      const result = await service.restoreToVersion("file-123", "conv-other");

      // Then: エラー
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain("does not belong to file");
      }
    });

    it("AC-004-04: 復元時にログが記録される", async () => {
      // Given: 変換が存在する
      const conversion = createMockConversion({
        id: "conv-old",
        fileId: "file-123",
        fileName: "test.txt",
        content: "content",
      });
      mockConvRepo._setConversions([conversion]);

      // When: restoreToVersion を呼び出す
      await service.restoreToVersion("file-123", "conv-old");

      // Then: ログが記録される
      const logs = mockLogger._getLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].action).toBe("restore");
      expect(logs[0].fileId).toBe("file-123");
    });
  });

  // ==========================================================================
  // AC-005: 最新バージョン取得
  // ==========================================================================

  describe("getLatestVersion", () => {
    it("AC-005-01: 最新バージョンを取得できる", async () => {
      // Given: 3つのバージョンが存在する
      const conversions: Conversion[] = [
        createMockConversion({
          id: "conv-1",
          fileId: "file-123",
          createdAt: new Date("2026-01-01"),
        }),
        createMockConversion({
          id: "conv-2",
          fileId: "file-123",
          createdAt: new Date("2026-01-02"),
        }),
        createMockConversion({
          id: "conv-3",
          fileId: "file-123",
          createdAt: new Date("2026-01-03"),
        }),
      ];
      mockConvRepo._setConversions(conversions);

      // When: getLatestVersion を呼び出す
      const result = await service.getLatestVersion("file-123");

      // Then: 最新バージョンが返される
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toBeNull();
        expect(result.data?.conversionId).toBe("conv-3");
        expect(result.data?.isCurrentVersion).toBe(true);
      }
    });

    it("AC-005-02: 履歴なしの場合はnull", async () => {
      // Given: 履歴が存在しない
      mockConvRepo._setConversions([]);

      // When: getLatestVersion を呼び出す
      const result = await service.getLatestVersion("file-empty");

      // Then: null が返される
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });
  });

  // ==========================================================================
  // AC-006: バージョン数取得
  // ==========================================================================

  describe("getVersionCount", () => {
    it("AC-006-01: バージョン数を取得できる", async () => {
      // Given: 5件のバージョンが存在する
      const conversions: Conversion[] = Array.from({ length: 5 }, (_, i) =>
        createMockConversion({ id: `conv-${i + 1}`, fileId: "file-123" }),
      );
      mockConvRepo._setConversions(conversions);

      // When: getVersionCount を呼び出す
      const result = await service.getVersionCount("file-123");

      // Then: 5 が返される
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(5);
      }
    });

    it("AC-006-02: 履歴なしの場合は0", async () => {
      // Given: 履歴が存在しない
      mockConvRepo._setConversions([]);

      // When: getVersionCount を呼び出す
      const result = await service.getVersionCount("file-empty");

      // Then: 0 が返される
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(0);
      }
    });
  });

  // ==========================================================================
  // エッジケース
  // ==========================================================================

  describe("Edge Cases", () => {
    it("EC-001: ページネーション境界値", async () => {
      // Given: ちょうど20件の履歴
      const conversions: Conversion[] = Array.from({ length: 20 }, (_, i) =>
        createMockConversion({
          id: `conv-${i + 1}`,
          fileId: "file-123",
          createdAt: new Date(`2026-01-${String(i + 1).padStart(2, "0")}`),
        }),
      );
      mockConvRepo._setConversions(conversions);

      // When: limit=20 で取得
      const result = await service.getFileHistory("file-123", {
        pagination: { limit: 20, offset: 0 },
      });

      // Then: hasMore は false
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items.length).toBe(20);
        expect(result.data.hasMore).toBe(false);
      }
    });

    it("EC-002: オフセットが件数を超える場合", async () => {
      // Given: 5件の履歴
      const conversions: Conversion[] = Array.from({ length: 5 }, (_, i) =>
        createMockConversion({ id: `conv-${i + 1}`, fileId: "file-123" }),
      );
      mockConvRepo._setConversions(conversions);

      // When: offset=10 で取得
      const result = await service.getFileHistory("file-123", {
        pagination: { limit: 10, offset: 10 },
      });

      // Then: 空配列
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items.length).toBe(0);
        expect(result.data.total).toBe(5);
        expect(result.data.hasMore).toBe(false);
      }
    });

    it("EC-003: 同一バージョン間の差分", async () => {
      // Given: 1つの変換
      const conversion = createMockConversion({
        id: "conv-1",
        fileId: "file-123",
      });
      mockConvRepo._setConversions([conversion]);

      // When: 同一ID間で差分取得
      const result = await service.getVersionDiff("conv-1", "conv-1");

      // Then: 変更なし
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sizeChange).toBe(0);
        expect(result.data.contentChanged).toBe(false);
        expect(result.data.metadataChanges.length).toBe(0);
      }
    });
  });

  // ==========================================================================
  // リポジトリエラー系
  // ==========================================================================

  describe("Repository Error Handling", () => {
    it("ERR-001: getFileHistory - countByFileIdエラー時", async () => {
      // Given: countByFileIdがエラーを返す
      const errorRepo = createErrorMockConversionRepository(
        new Error("Count failed"),
      );
      const errorService = new HistoryService(
        errorRepo,
        mockFileRepo,
        mockLogger,
      );

      // When: getFileHistory を呼び出す
      const result = await errorService.getFileHistory("file-123");

      // Then: エラー
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("Count failed");
      }
    });

    it("ERR-002: getLatestVersion - リポジトリエラー時", async () => {
      // Given: findByFileIdがエラーを返す
      const errorRepo = createErrorMockConversionRepository(
        new Error("Find failed"),
      );
      const errorService = new HistoryService(
        errorRepo,
        mockFileRepo,
        mockLogger,
      );

      // When: getLatestVersion を呼び出す
      const result = await errorService.getLatestVersion("file-123");

      // Then: エラー
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("Find failed");
      }
    });

    it("ERR-003: getVersionCount - リポジトリエラー時", async () => {
      // Given: countByFileIdがエラーを返す
      const errorRepo = createErrorMockConversionRepository(
        new Error("Count error"),
      );
      const errorService = new HistoryService(
        errorRepo,
        mockFileRepo,
        mockLogger,
      );

      // When: getVersionCount を呼び出す
      const result = await errorService.getVersionCount("file-123");

      // Then: エラー
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("Count error");
      }
    });

    it("ERR-004: getVersionDetail - リポジトリエラー時", async () => {
      // Given: findByIdがエラーを返す
      const errorRepo = createErrorMockConversionRepository(
        new Error("FindById error"),
      );
      const errorService = new HistoryService(
        errorRepo,
        mockFileRepo,
        mockLogger,
      );

      // When: getVersionDetail を呼び出す
      const result = await errorService.getVersionDetail("conv-123");

      // Then: エラー
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("FindById error");
      }
    });

    it("ERR-005: getVersionDiff - 変換A取得エラー時", async () => {
      // Given: findByIdがエラーを返す
      const errorRepo = createErrorMockConversionRepository(
        new Error("FindById error"),
      );
      const errorService = new HistoryService(
        errorRepo,
        mockFileRepo,
        mockLogger,
      );

      // When: getVersionDiff を呼び出す
      const result = await errorService.getVersionDiff("conv-1", "conv-2");

      // Then: エラー
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("FindById error");
      }
    });

    it("ERR-006: restoreToVersion - リポジトリエラー時", async () => {
      // Given: findByIdがエラーを返す
      const errorRepo = createErrorMockConversionRepository(
        new Error("FindById error"),
      );
      const errorService = new HistoryService(
        errorRepo,
        mockFileRepo,
        mockLogger,
      );

      // When: restoreToVersion を呼び出す
      const result = await errorService.restoreToVersion("file-123", "conv-1");

      // Then: エラー
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("FindById error");
      }
    });
  });

  // ==========================================================================
  // メタデータ変更検出の追加テスト
  // ==========================================================================

  describe("Metadata Change Detection", () => {
    it("META-001: 新規キー追加の検出", async () => {
      // Given: 2つの変換（新規キー追加）
      const conversions: Conversion[] = [
        createMockConversion({
          id: "conv-1",
          fileId: "file-123",
          metadata: { author: "Alice" },
        }),
        createMockConversion({
          id: "conv-2",
          fileId: "file-123",
          metadata: { author: "Alice", reviewer: "Bob" },
        }),
      ];
      mockConvRepo._setConversions(conversions);

      // When: getVersionDiff を呼び出す
      const result = await service.getVersionDiff("conv-1", "conv-2");

      // Then: 新規キーが検出される
      expect(result.success).toBe(true);
      if (result.success) {
        const reviewerChange = result.data.metadataChanges.find(
          (c) => c.key === "reviewer",
        );
        expect(reviewerChange).toBeDefined();
        expect(reviewerChange?.oldValue).toBeUndefined();
        expect(reviewerChange?.newValue).toBe("Bob");
      }
    });

    it("META-002: キー削除の検出", async () => {
      // Given: 2つの変換（キー削除）
      const conversions: Conversion[] = [
        createMockConversion({
          id: "conv-1",
          fileId: "file-123",
          metadata: { author: "Alice", reviewer: "Bob" },
        }),
        createMockConversion({
          id: "conv-2",
          fileId: "file-123",
          metadata: { author: "Alice" },
        }),
      ];
      mockConvRepo._setConversions(conversions);

      // When: getVersionDiff を呼び出す
      const result = await service.getVersionDiff("conv-1", "conv-2");

      // Then: キー削除が検出される
      expect(result.success).toBe(true);
      if (result.success) {
        const reviewerChange = result.data.metadataChanges.find(
          (c) => c.key === "reviewer",
        );
        expect(reviewerChange).toBeDefined();
        expect(reviewerChange?.oldValue).toBe("Bob");
        expect(reviewerChange?.newValue).toBeUndefined();
      }
    });

    it("META-003: メタデータなしの場合", async () => {
      // Given: 2つの変換（両方メタデータなし）
      const conversions: Conversion[] = [
        createMockConversion({
          id: "conv-1",
          fileId: "file-123",
          metadata: undefined,
        }),
        createMockConversion({
          id: "conv-2",
          fileId: "file-123",
          metadata: undefined,
        }),
      ];
      mockConvRepo._setConversions(conversions);

      // When: getVersionDiff を呼び出す
      const result = await service.getVersionDiff("conv-1", "conv-2");

      // Then: 変更なし
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadataChanges.length).toBe(0);
      }
    });
  });

  // ==========================================================================
  // MIMEタイプフィルタテスト
  // ==========================================================================

  describe("MIME Type Filter", () => {
    it("MIME-001: MIMEタイプでフィルタリング", async () => {
      // Given: 異なるMIMEタイプの履歴
      const conversions: Conversion[] = [
        createMockConversion({
          id: "conv-1",
          fileId: "file-123",
          mimeType: "text/plain",
        }),
        createMockConversion({
          id: "conv-2",
          fileId: "file-123",
          mimeType: "application/pdf",
        }),
        createMockConversion({
          id: "conv-3",
          fileId: "file-123",
          mimeType: "text/plain",
        }),
      ];
      mockConvRepo._setConversions(conversions);

      // When: mimeTypesフィルタで取得
      const result = await service.getFileHistory("file-123", {
        filter: { mimeTypes: ["text/plain"] },
      });

      // Then: text/plainのみ
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items.length).toBe(2);
        expect(
          result.data.items.every((i) => i.mimeType === "text/plain"),
        ).toBe(true);
      }
    });
  });
});
