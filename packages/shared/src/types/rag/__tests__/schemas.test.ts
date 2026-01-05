/**
 * @file Zodスキーマのテスト
 * @description TDD Red Phase - 実装前にテストを作成
 * @taskId CONV-03-01
 * @subtask T-04-5
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  uuidSchema,
  timestampedSchema,
  metadataSchema,
  paginationParamsSchema,
  asyncStatusSchema,
  errorCodeSchema,
  ragErrorSchema,
  // 型エクスポート
  type UUID,
  type TimestampedSchema,
  type MetadataSchema,
  type PaginationParamsSchema,
  type AsyncStatusSchema,
  type ErrorCodeSchema,
  type RAGErrorSchema,
} from "../schemas";
import { ErrorCodes } from "../errors";

// =============================================================================
// 1. uuidSchema のテスト
// =============================================================================

describe("uuidSchema", () => {
  describe("有効なUUID", () => {
    it("UUID v4を受け入れること", () => {
      const validUUID = "550e8400-e29b-41d4-a716-446655440000";
      const result = uuidSchema.safeParse(validUUID);
      expect(result.success).toBe(true);
    });

    it("小文字のUUIDを受け入れること", () => {
      const lowerUUID = "550e8400-e29b-41d4-a716-446655440000";
      const result = uuidSchema.safeParse(lowerUUID);
      expect(result.success).toBe(true);
    });

    it("大文字のUUIDを受け入れること", () => {
      const upperUUID = "550E8400-E29B-41D4-A716-446655440000";
      const result = uuidSchema.safeParse(upperUUID);
      expect(result.success).toBe(true);
    });
  });

  describe("無効なUUID", () => {
    it("空文字列を拒否すること", () => {
      const result = uuidSchema.safeParse("");
      expect(result.success).toBe(false);
    });

    it("不正なフォーマットを拒否すること", () => {
      const result = uuidSchema.safeParse("not-a-uuid");
      expect(result.success).toBe(false);
    });

    it("ハイフンなしのUUIDを拒否すること", () => {
      const result = uuidSchema.safeParse("550e8400e29b41d4a716446655440000");
      expect(result.success).toBe(false);
    });

    it("短すぎるUUIDを拒否すること", () => {
      const result = uuidSchema.safeParse("550e8400-e29b-41d4-a716");
      expect(result.success).toBe(false);
    });
  });

  describe("型推論", () => {
    it("推論された型がUUIDであること", () => {
      const validUUID = "550e8400-e29b-41d4-a716-446655440000";
      const parsed = uuidSchema.parse(validUUID);
      // 型チェック: parsed は UUID 型
      const _typeCheck: UUID = parsed;
      expect(typeof _typeCheck).toBe("string");
    });
  });
});

// =============================================================================
// 2. timestampedSchema のテスト
// =============================================================================

describe("timestampedSchema", () => {
  describe("有効なタイムスタンプ", () => {
    it("Dateオブジェクトを受け入れること", () => {
      const input = {
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = timestampedSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("ISO文字列を受け入れてDateに変換すること", () => {
      const input = {
        createdAt: "2025-12-16T12:00:00.000Z",
        updatedAt: "2025-12-16T13:00:00.000Z",
      };
      const result = timestampedSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.createdAt).toBeInstanceOf(Date);
        expect(result.data.updatedAt).toBeInstanceOf(Date);
      }
    });

    it("createdAtがupdatedAt以前でも受け入れること", () => {
      const input = {
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-12-16"),
      };
      const result = timestampedSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("無効なタイムスタンプ", () => {
    it("createdAtがない場合に拒否すること", () => {
      const input = { updatedAt: new Date() };
      const result = timestampedSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("updatedAtがない場合に拒否すること", () => {
      const input = { createdAt: new Date() };
      const result = timestampedSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("無効な日付文字列を拒否すること", () => {
      const input = {
        createdAt: "not-a-date",
        updatedAt: new Date(),
      };
      const result = timestampedSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("型推論", () => {
    it("推論された型がTimestampedSchemaであること", () => {
      const input = {
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const parsed = timestampedSchema.parse(input);
      const _typeCheck: TimestampedSchema = parsed;
      expect(_typeCheck.createdAt).toBeInstanceOf(Date);
    });
  });
});

// =============================================================================
// 3. metadataSchema のテスト
// =============================================================================

describe("metadataSchema", () => {
  describe("有効なメタデータ", () => {
    it("空のオブジェクトを受け入れること", () => {
      const result = metadataSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("任意のキー・値のペアを受け入れること", () => {
      const input = {
        key1: "value1",
        key2: 42,
        key3: true,
        key4: null,
      };
      const result = metadataSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("ネストしたオブジェクトを受け入れること", () => {
      const input = {
        nested: {
          inner: "value",
        },
      };
      const result = metadataSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("配列を値として受け入れること", () => {
      const input = {
        tags: ["tag1", "tag2", "tag3"],
      };
      const result = metadataSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("型推論", () => {
    it("推論された型がMetadataSchemaであること", () => {
      const input = { key: "value" };
      const parsed = metadataSchema.parse(input);
      const _typeCheck: MetadataSchema = parsed;
      expect(_typeCheck).toEqual(input);
    });
  });
});

// =============================================================================
// 4. paginationParamsSchema のテスト
// =============================================================================

describe("paginationParamsSchema", () => {
  describe("有効なパラメータ", () => {
    it("limitとoffsetを受け入れること", () => {
      const input = { limit: 20, offset: 0 };
      const result = paginationParamsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("最小値（limit: 1, offset: 0）を受け入れること", () => {
      const input = { limit: 1, offset: 0 };
      const result = paginationParamsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("大きな値を受け入れること", () => {
      const input = { limit: 100, offset: 10000 };
      const result = paginationParamsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("無効なパラメータ", () => {
    it("limit: 0 を拒否すること", () => {
      const input = { limit: 0, offset: 0 };
      const result = paginationParamsSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("負のlimitを拒否すること", () => {
      const input = { limit: -1, offset: 0 };
      const result = paginationParamsSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("負のoffsetを拒否すること", () => {
      const input = { limit: 20, offset: -1 };
      const result = paginationParamsSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("小数点のあるlimitを拒否すること", () => {
      const input = { limit: 20.5, offset: 0 };
      const result = paginationParamsSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("文字列のlimitを拒否すること", () => {
      const input = { limit: "20", offset: 0 };
      const result = paginationParamsSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("デフォルト値", () => {
    it("limitがない場合にデフォルト値20を使用すること", () => {
      const input = { offset: 0 };
      const result = paginationParamsSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
      }
    });

    it("offsetがない場合にデフォルト値0を使用すること", () => {
      const input = { limit: 10 };
      const result = paginationParamsSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.offset).toBe(0);
      }
    });

    it("両方ない場合にデフォルト値を使用すること", () => {
      const result = paginationParamsSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
        expect(result.data.offset).toBe(0);
      }
    });
  });

  describe("型推論", () => {
    it("推論された型がPaginationParamsSchemaであること", () => {
      const input = { limit: 20, offset: 0 };
      const parsed = paginationParamsSchema.parse(input);
      const _typeCheck: PaginationParamsSchema = parsed;
      expect(_typeCheck.limit).toBe(20);
    });
  });
});

// =============================================================================
// 5. asyncStatusSchema のテスト
// =============================================================================

describe("asyncStatusSchema", () => {
  describe("有効なステータス", () => {
    it("pendingを受け入れること", () => {
      const result = asyncStatusSchema.safeParse("pending");
      expect(result.success).toBe(true);
    });

    it("processingを受け入れること", () => {
      const result = asyncStatusSchema.safeParse("processing");
      expect(result.success).toBe(true);
    });

    it("completedを受け入れること", () => {
      const result = asyncStatusSchema.safeParse("completed");
      expect(result.success).toBe(true);
    });

    it("failedを受け入れること", () => {
      const result = asyncStatusSchema.safeParse("failed");
      expect(result.success).toBe(true);
    });
  });

  describe("無効なステータス", () => {
    it("未定義のステータスを拒否すること", () => {
      const result = asyncStatusSchema.safeParse("unknown");
      expect(result.success).toBe(false);
    });

    it("空文字列を拒否すること", () => {
      const result = asyncStatusSchema.safeParse("");
      expect(result.success).toBe(false);
    });

    it("大文字のステータスを拒否すること", () => {
      const result = asyncStatusSchema.safeParse("PENDING");
      expect(result.success).toBe(false);
    });
  });

  describe("型推論", () => {
    it("推論された型がAsyncStatusSchemaであること", () => {
      const parsed = asyncStatusSchema.parse("pending");
      const _typeCheck: AsyncStatusSchema = parsed;
      expect(_typeCheck).toBe("pending");
    });
  });
});

// =============================================================================
// 6. errorCodeSchema のテスト
// =============================================================================

describe("errorCodeSchema", () => {
  describe("有効なエラーコード", () => {
    it("FILE_NOT_FOUNDを受け入れること", () => {
      const result = errorCodeSchema.safeParse("FILE_NOT_FOUND");
      expect(result.success).toBe(true);
    });

    it("すべてのErrorCodesの値を受け入れること", () => {
      Object.values(ErrorCodes).forEach((code) => {
        const result = errorCodeSchema.safeParse(code);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("無効なエラーコード", () => {
    it("未定義のエラーコードを拒否すること", () => {
      const result = errorCodeSchema.safeParse("UNKNOWN_ERROR");
      expect(result.success).toBe(false);
    });

    it("空文字列を拒否すること", () => {
      const result = errorCodeSchema.safeParse("");
      expect(result.success).toBe(false);
    });

    it("小文字のエラーコードを拒否すること", () => {
      const result = errorCodeSchema.safeParse("file_not_found");
      expect(result.success).toBe(false);
    });
  });

  describe("型推論", () => {
    it("推論された型がErrorCodeSchemaであること", () => {
      const parsed = errorCodeSchema.parse("FILE_NOT_FOUND");
      const _typeCheck: ErrorCodeSchema = parsed;
      expect(_typeCheck).toBe("FILE_NOT_FOUND");
    });
  });
});

// =============================================================================
// 7. ragErrorSchema のテスト
// =============================================================================

describe("ragErrorSchema", () => {
  describe("有効なRAGエラー", () => {
    it("必須フィールドのみで作成できること", () => {
      const input = {
        code: "FILE_NOT_FOUND",
        message: "File not found: test.txt",
        timestamp: new Date(),
      };
      const result = ragErrorSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("contextを含めて作成できること", () => {
      const input = {
        code: "FILE_READ_ERROR",
        message: "Failed to read file",
        timestamp: new Date(),
        context: { filePath: "/path/to/file.txt" },
      };
      const result = ragErrorSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("ISO文字列のtimestampを受け入れること", () => {
      const input = {
        code: "DB_QUERY_ERROR",
        message: "Query failed",
        timestamp: "2025-12-16T12:00:00.000Z",
      };
      const result = ragErrorSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.timestamp).toBeInstanceOf(Date);
      }
    });
  });

  describe("無効なRAGエラー", () => {
    it("codeがない場合に拒否すること", () => {
      const input = {
        message: "Error message",
        timestamp: new Date(),
      };
      const result = ragErrorSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("messageがない場合に拒否すること", () => {
      const input = {
        code: "FILE_NOT_FOUND",
        timestamp: new Date(),
      };
      const result = ragErrorSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("timestampがない場合に拒否すること", () => {
      const input = {
        code: "FILE_NOT_FOUND",
        message: "Error message",
      };
      const result = ragErrorSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("無効なcodeを拒否すること", () => {
      const input = {
        code: "INVALID_ERROR_CODE",
        message: "Error message",
        timestamp: new Date(),
      };
      const result = ragErrorSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("型推論", () => {
    it("推論された型がRAGErrorSchemaであること", () => {
      const input = {
        code: "INTERNAL_ERROR" as const,
        message: "Internal error",
        timestamp: new Date(),
      };
      const parsed = ragErrorSchema.parse(input);
      const _typeCheck: RAGErrorSchema = parsed;
      expect(_typeCheck.code).toBe("INTERNAL_ERROR");
    });
  });
});

// =============================================================================
// 8. スキーマの合成テスト
// =============================================================================

describe("スキーマの合成", () => {
  it("timestampedSchemaを他のスキーマと合成できること", () => {
    const entitySchema = z
      .object({
        id: uuidSchema,
        name: z.string(),
      })
      .merge(timestampedSchema);

    const input = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test Entity",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = entitySchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("metadataSchemaを他のスキーマと合成できること", () => {
    const entityWithMetadataSchema = z.object({
      id: uuidSchema,
      metadata: metadataSchema,
    });

    const input = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      metadata: { key: "value" },
    };

    const result = entityWithMetadataSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
});

// =============================================================================
// 9. エラーメッセージのテスト
// =============================================================================

describe("エラーメッセージ", () => {
  it("uuidSchemaが適切なエラーメッセージを返すこと", () => {
    const result = uuidSchema.safeParse("invalid");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });

  it("paginationParamsSchemaが適切なエラーメッセージを返すこと", () => {
    const result = paginationParamsSchema.safeParse({ limit: -1 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });
});
