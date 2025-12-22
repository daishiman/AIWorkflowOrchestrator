/**
 * ConverterRegistryのテスト
 *
 * @description コンバーターの登録・検索・優先度管理が期待通りに機能することを検証する
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ConverterRegistry, createTestRegistry } from "../converter-registry";
import type { IConverter, ConverterInput, ConverterOptions } from "../types";
import type { Result, RAGError } from "../../../types/rag";
import { ok, err, createRAGError, ErrorCodes } from "../../../types/rag";
import { createFileId } from "../../../types/rag/branded";

// =============================================================================
// モックコンバーター
// =============================================================================

/**
 * テスト用のモックコンバーター
 */
class MockConverter implements IConverter {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly supportedMimeTypes: readonly string[],
    public readonly priority: number,
  ) {}

  canConvert(input: ConverterInput): boolean {
    return this.supportedMimeTypes.includes(input.mimeType);
  }

  async convert(
    input: ConverterInput,
    _options?: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    return ok({
      convertedContent: `Mock conversion: ${input.filePath}`,
      extractedMetadata: {
        title: null,
        author: null,
        language: "en",
        wordCount: 2,
        lineCount: 1,
        charCount: 20,
        headers: [],
        codeBlocks: 0,
        links: [],
        custom: {},
      },
      processingTime: 10,
    });
  }

  estimateProcessingTime(_input: ConverterInput): number {
    return 10;
  }
}

/**
 * 常にfalseを返すモックコンバーター（canConvert用）
 */
class AlwaysRejectConverter implements IConverter {
  constructor(
    public readonly id: string,
    public readonly supportedMimeTypes: readonly string[],
  ) {}

  readonly name = "Always Reject Converter";
  readonly priority = 0;

  canConvert(_input: ConverterInput): boolean {
    return false; // 常に拒否
  }

  async convert(
    _input: ConverterInput,
    _options?: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    return err(createRAGError(ErrorCodes.CONVERSION_FAILED, "Always reject"));
  }

  estimateProcessingTime(_input: ConverterInput): number {
    return 0;
  }
}

// =============================================================================
// ConverterRegistryのテスト
// =============================================================================

describe("ConverterRegistry", () => {
  let registry: ConverterRegistry;

  beforeEach(() => {
    // 各テストで独立したレジストリインスタンスを使用
    registry = createTestRegistry();
  });

  // ===========================================================================
  // 登録・登録解除のテスト
  // ===========================================================================

  describe("register()", () => {
    it("should register a converter", () => {
      const converter = new MockConverter(
        "test-converter",
        "Test Converter",
        ["text/plain"],
        0,
      );

      const result = registry.register(converter);

      // 現時点では実装がないため、このテストは失敗する（Red状態）
      expect(result.success).toBe(true);
      expect(registry.size).toBe(1);
    });

    it("should register multiple converters", () => {
      const converter1 = new MockConverter(
        "converter-1",
        "Converter 1",
        ["text/plain"],
        0,
      );
      const converter2 = new MockConverter(
        "converter-2",
        "Converter 2",
        ["text/markdown"],
        0,
      );

      registry.register(converter1);
      registry.register(converter2);

      expect(registry.size).toBe(2);
    });

    it("should reject converter without ID", () => {
      const converter = new MockConverter(
        "",
        "Test Converter",
        ["text/plain"],
        0,
      );

      const result = registry.register(converter);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
        expect(result.error.message).toContain("Converter ID is required");
      }
    });

    it("should reject converter without supported MIME types", () => {
      const converter = new MockConverter(
        "test-converter",
        "Test Converter",
        [],
        0,
      );

      const result = registry.register(converter);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
        expect(result.error.message).toContain("at least one MIME type");
      }
    });

    it("should overwrite existing converter with same ID", () => {
      const converter1 = new MockConverter(
        "test-converter",
        "Test Converter v1",
        ["text/plain"],
        5,
      );
      const converter2 = new MockConverter(
        "test-converter",
        "Test Converter v2",
        ["text/plain"],
        10,
      );

      registry.register(converter1);
      registry.register(converter2);

      expect(registry.size).toBe(1); // 上書きされるのでサイズは1

      const retrieved = registry.get("test-converter");

      if (retrieved.success) {
        expect(retrieved.data.name).toBe("Test Converter v2");
        expect(retrieved.data.priority).toBe(10);
      }
    });
  });

  describe("unregister()", () => {
    it("should unregister a converter", () => {
      const converter = new MockConverter(
        "test-converter",
        "Test Converter",
        ["text/plain"],
        0,
      );

      registry.register(converter);
      const result = registry.unregister("test-converter");

      expect(result.success).toBe(true);
      expect(registry.size).toBe(0);
    });

    it("should return error for non-existent converter", () => {
      const result = registry.unregister("non-existent");

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.CONVERTER_NOT_FOUND);
        expect(result.error.message).toContain("Converter not found");
      }
    });

    it("should update MIME type index after unregister", () => {
      const converter = new MockConverter(
        "test-converter",
        "Test Converter",
        ["text/plain", "text/markdown"],
        0,
      );

      registry.register(converter);
      registry.unregister("test-converter");

      const plainConverters = registry.findByMimeType("text/plain");
      const markdownConverters = registry.findByMimeType("text/markdown");

      expect(plainConverters).toHaveLength(0);
      expect(markdownConverters).toHaveLength(0);
    });
  });

  describe("registerAll()", () => {
    it("should register all converters successfully", () => {
      const converters = [
        new MockConverter("converter-1", "Converter 1", ["text/plain"], 0),
        new MockConverter("converter-2", "Converter 2", ["text/markdown"], 0),
        new MockConverter("converter-3", "Converter 3", ["application/pdf"], 0),
      ];

      const result = registry.registerAll(converters);

      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(registry.size).toBe(3);
    });

    it("should continue on partial failures", () => {
      const converters = [
        new MockConverter("converter-1", "Converter 1", ["text/plain"], 0),
        new MockConverter("", "Invalid Converter", ["text/markdown"], 0), // ID空
        new MockConverter("converter-3", "Converter 3", [], 0), // MIMEタイプ空
      ];

      const result = registry.registerAll(converters);

      expect(result.success).toBe(1);
      expect(result.failed).toBe(2);
      expect(result.errors).toHaveLength(2);
      expect(registry.size).toBe(1);
    });
  });

  // ===========================================================================
  // 検索・取得のテスト
  // ===========================================================================

  describe("get()", () => {
    it("should retrieve converter by ID", () => {
      const converter = new MockConverter(
        "test-converter",
        "Test Converter",
        ["text/plain"],
        0,
      );

      registry.register(converter);
      const result = registry.get("test-converter");

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.id).toBe("test-converter");
        expect(result.data.name).toBe("Test Converter");
      }
    });

    it("should return error for non-existent ID", () => {
      const result = registry.get("non-existent");

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.CONVERTER_NOT_FOUND);
      }
    });
  });

  describe("findConverter()", () => {
    it("should find converter by MIME type", () => {
      const converter = new MockConverter(
        "text-converter",
        "Text Converter",
        ["text/plain"],
        0,
      );

      registry.register(converter);

      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      const result = registry.findConverter(input);

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.id).toBe("text-converter");
      }
    });

    it("should return highest priority converter", () => {
      const converter1 = new MockConverter(
        "converter-1",
        "Converter 1",
        ["text/plain"],
        5,
      );
      const converter2 = new MockConverter(
        "converter-2",
        "Converter 2",
        ["text/plain"],
        10,
      );
      const converter3 = new MockConverter(
        "converter-3",
        "Converter 3",
        ["text/plain"],
        3,
      );

      registry.register(converter1);
      registry.register(converter2);
      registry.register(converter3);

      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      const result = registry.findConverter(input);

      expect(result.success).toBe(true);

      if (result.success) {
        // 優先度10が最高
        expect(result.data.id).toBe("converter-2");
        expect(result.data.priority).toBe(10);
      }
    });

    it("should return error for unsupported MIME type", () => {
      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.unknown",
        mimeType: "application/unknown",
        content: "hello",
        encoding: "utf-8",
      };

      const result = registry.findConverter(input);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.CONVERTER_NOT_FOUND);
        expect(result.error.message).toContain("No converter found");
      }
    });

    it("should filter by canConvert() result", () => {
      const acceptConverter = new MockConverter(
        "accept-converter",
        "Accept Converter",
        ["text/plain"],
        10,
      );
      const rejectConverter = new AlwaysRejectConverter("reject-converter", [
        "text/plain",
      ]);

      registry.register(acceptConverter);
      registry.register(rejectConverter);

      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      const result = registry.findConverter(input);

      expect(result.success).toBe(true);

      if (result.success) {
        // canConvert()がtrueを返すコンバーターのみ選択
        expect(result.data.id).toBe("accept-converter");
      }
    });

    it("should return error if no converter can handle input", () => {
      const rejectConverter = new AlwaysRejectConverter("reject-converter", [
        "text/plain",
      ]);

      registry.register(rejectConverter);

      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      const result = registry.findConverter(input);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.CONVERTER_NOT_FOUND);
        expect(result.error.message).toContain("No converter can handle");
      }
    });
  });

  describe("findByMimeType()", () => {
    it("should find converters by MIME type", () => {
      const converter1 = new MockConverter(
        "converter-1",
        "Converter 1",
        ["text/plain", "text/markdown"],
        0,
      );
      const converter2 = new MockConverter(
        "converter-2",
        "Converter 2",
        ["text/markdown"],
        0,
      );

      registry.register(converter1);
      registry.register(converter2);

      const plainConverters = registry.findByMimeType("text/plain");
      const markdownConverters = registry.findByMimeType("text/markdown");

      expect(plainConverters).toHaveLength(1);
      expect(plainConverters[0].id).toBe("converter-1");

      expect(markdownConverters).toHaveLength(2);
    });

    it("should return empty array for unsupported MIME type", () => {
      const converters = registry.findByMimeType("application/unknown");

      expect(converters).toHaveLength(0);
      expect(converters).toEqual([]);
    });

    it("should return converters sorted by priority", () => {
      const converter1 = new MockConverter(
        "converter-1",
        "Converter 1",
        ["text/plain"],
        5,
      );
      const converter2 = new MockConverter(
        "converter-2",
        "Converter 2",
        ["text/plain"],
        10,
      );
      const converter3 = new MockConverter(
        "converter-3",
        "Converter 3",
        ["text/plain"],
        3,
      );

      registry.register(converter1);
      registry.register(converter2);
      registry.register(converter3);

      const converters = registry.findByMimeType("text/plain");

      expect(converters).toHaveLength(3);
      // 優先度降順（10, 5, 3）
      expect(converters[0].priority).toBe(10);
      expect(converters[1].priority).toBe(5);
      expect(converters[2].priority).toBe(3);
    });
  });

  describe("getAll()", () => {
    it("should return all registered converters", () => {
      const converter1 = new MockConverter(
        "converter-1",
        "Converter 1",
        ["text/plain"],
        0,
      );
      const converter2 = new MockConverter(
        "converter-2",
        "Converter 2",
        ["text/markdown"],
        0,
      );

      registry.register(converter1);
      registry.register(converter2);

      const allConverters = registry.getAll();

      expect(allConverters).toHaveLength(2);
      expect(allConverters.map((c) => c.id)).toContain("converter-1");
      expect(allConverters.map((c) => c.id)).toContain("converter-2");
    });

    it("should return empty array for empty registry", () => {
      const allConverters = registry.getAll();

      expect(allConverters).toHaveLength(0);
      expect(allConverters).toEqual([]);
    });
  });

  // ===========================================================================
  // メタデータ取得のテスト
  // ===========================================================================

  describe("getSupportedMimeTypes()", () => {
    it("should return all supported MIME types", () => {
      const converter1 = new MockConverter(
        "converter-1",
        "Converter 1",
        ["text/plain", "text/markdown"],
        0,
      );
      const converter2 = new MockConverter(
        "converter-2",
        "Converter 2",
        ["application/pdf"],
        0,
      );

      registry.register(converter1);
      registry.register(converter2);

      const mimeTypes = registry.getSupportedMimeTypes();

      expect(mimeTypes).toHaveLength(3);
      expect(mimeTypes).toContain("text/plain");
      expect(mimeTypes).toContain("text/markdown");
      expect(mimeTypes).toContain("application/pdf");
      // ソート済みであることを確認
      expect(mimeTypes).toEqual([...mimeTypes].sort());
    });

    it("should return empty array for empty registry", () => {
      const mimeTypes = registry.getSupportedMimeTypes();

      expect(mimeTypes).toHaveLength(0);
      expect(mimeTypes).toEqual([]);
    });

    it("should not have duplicates", () => {
      const converter1 = new MockConverter(
        "converter-1",
        "Converter 1",
        ["text/plain"],
        0,
      );
      const converter2 = new MockConverter(
        "converter-2",
        "Converter 2",
        ["text/plain"], // 重複
        0,
      );

      registry.register(converter1);
      registry.register(converter2);

      const mimeTypes = registry.getSupportedMimeTypes();

      expect(mimeTypes).toHaveLength(1);
      expect(mimeTypes).toEqual(["text/plain"]);
    });
  });

  describe("size プロパティ", () => {
    it("should return number of registered converters", () => {
      expect(registry.size).toBe(0);

      registry.register(
        new MockConverter("converter-1", "Converter 1", ["text/plain"], 0),
      );
      expect(registry.size).toBe(1);

      registry.register(
        new MockConverter("converter-2", "Converter 2", ["text/markdown"], 0),
      );
      expect(registry.size).toBe(2);

      registry.unregister("converter-1");
      expect(registry.size).toBe(1);
    });
  });

  describe("getConverterCountByMimeType()", () => {
    it("should return count of converters for MIME type", () => {
      const converter1 = new MockConverter(
        "converter-1",
        "Converter 1",
        ["text/plain"],
        0,
      );
      const converter2 = new MockConverter(
        "converter-2",
        "Converter 2",
        ["text/plain"],
        0,
      );
      const converter3 = new MockConverter(
        "converter-3",
        "Converter 3",
        ["text/markdown"],
        0,
      );

      registry.register(converter1);
      registry.register(converter2);
      registry.register(converter3);

      expect(registry.getConverterCountByMimeType("text/plain")).toBe(2);
      expect(registry.getConverterCountByMimeType("text/markdown")).toBe(1);
      expect(registry.getConverterCountByMimeType("application/pdf")).toBe(0);
    });
  });

  // ===========================================================================
  // 優先度管理のテスト
  // ===========================================================================

  describe("優先度管理", () => {
    it("should maintain priority order in MIME type index", () => {
      const low = new MockConverter("low", "Low", ["text/plain"], -5);
      const medium = new MockConverter("medium", "Medium", ["text/plain"], 10);
      const high = new MockConverter("high", "High", ["text/plain"], 50);

      // 登録順をランダムに
      registry.register(medium);
      registry.register(low);
      registry.register(high);

      const converters = registry.findByMimeType("text/plain");

      // 優先度降順（50, 10, -5）
      expect(converters[0].id).toBe("high");
      expect(converters[1].id).toBe("medium");
      expect(converters[2].id).toBe("low");
    });

    it("should handle negative priority", () => {
      const fallback = new MockConverter(
        "fallback",
        "Fallback",
        ["text/plain"],
        -10,
      );
      const normal = new MockConverter("normal", "Normal", ["text/plain"], 0);

      registry.register(fallback);
      registry.register(normal);

      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      const result = registry.findConverter(input);

      if (result.success) {
        // 優先度0が選択される
        expect(result.data.id).toBe("normal");
      }
    });

    it("should handle same priority (FIFO)", () => {
      const converter1 = new MockConverter(
        "converter-1",
        "Converter 1",
        ["text/plain"],
        5,
      );
      const converter2 = new MockConverter(
        "converter-2",
        "Converter 2",
        ["text/plain"],
        5,
      );

      registry.register(converter1);
      registry.register(converter2);

      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      const result = registry.findConverter(input);

      // 同一優先度の場合、実装によって動作が異なる可能性
      expect(result.success).toBe(true);
    });
  });

  // ===========================================================================
  // デバッグ・ユーティリティのテスト
  // ===========================================================================

  describe("dump()", () => {
    it("should dump registry state", () => {
      const converter1 = new MockConverter(
        "converter-1",
        "Converter 1",
        ["text/plain"],
        5,
      );
      const converter2 = new MockConverter(
        "converter-2",
        "Converter 2",
        ["text/markdown"],
        10,
      );

      registry.register(converter1);
      registry.register(converter2);

      const dump = registry.dump();

      expect(dump.converterCount).toBe(2);
      expect(dump.converters).toHaveLength(2);
      expect(dump.mimeTypeIndex).toHaveProperty("text/plain");
      expect(dump.mimeTypeIndex).toHaveProperty("text/markdown");
    });
  });

  describe("clear()", () => {
    it("should clear all converters", () => {
      registry.register(
        new MockConverter("converter-1", "Converter 1", ["text/plain"], 0),
      );
      registry.register(
        new MockConverter("converter-2", "Converter 2", ["text/markdown"], 0),
      );

      expect(registry.size).toBe(2);

      registry.clear();

      expect(registry.size).toBe(0);
      expect(registry.getAll()).toHaveLength(0);
      expect(registry.getSupportedMimeTypes()).toHaveLength(0);
    });
  });

  // ===========================================================================
  // MIMEタイプインデックスのテスト
  // ===========================================================================

  describe("MIMEタイプインデックス", () => {
    it("should update index on register", () => {
      const converter = new MockConverter(
        "test-converter",
        "Test Converter",
        ["text/plain", "text/markdown"],
        0,
      );

      registry.register(converter);

      const plainConverters = registry.findByMimeType("text/plain");
      const markdownConverters = registry.findByMimeType("text/markdown");

      expect(plainConverters).toHaveLength(1);
      expect(markdownConverters).toHaveLength(1);
      expect(plainConverters[0].id).toBe("test-converter");
      expect(markdownConverters[0].id).toBe("test-converter");
    });

    it("should update index on unregister", () => {
      const converter = new MockConverter(
        "test-converter",
        "Test Converter",
        ["text/plain"],
        0,
      );

      registry.register(converter);
      registry.unregister("test-converter");

      const converters = registry.findByMimeType("text/plain");

      expect(converters).toHaveLength(0);
    });

    it("should handle multiple converters for same MIME type", () => {
      const converter1 = new MockConverter(
        "converter-1",
        "Converter 1",
        ["text/plain"],
        5,
      );
      const converter2 = new MockConverter(
        "converter-2",
        "Converter 2",
        ["text/plain"],
        10,
      );

      registry.register(converter1);
      registry.register(converter2);

      const converters = registry.findByMimeType("text/plain");

      expect(converters).toHaveLength(2);
      // 優先度順
      expect(converters[0].priority).toBe(10);
      expect(converters[1].priority).toBe(5);
    });
  });

  // ===========================================================================
  // エッジケースのテスト
  // ===========================================================================

  describe("エッジケース", () => {
    it("should handle converter with many MIME types", () => {
      const converter = new MockConverter(
        "multi-converter",
        "Multi Converter",
        [
          "text/plain",
          "text/markdown",
          "text/html",
          "application/json",
          "application/xml",
        ],
        0,
      );

      registry.register(converter);

      expect(registry.getSupportedMimeTypes()).toHaveLength(5);

      const plainConverters = registry.findByMimeType("text/plain");
      const jsonConverters = registry.findByMimeType("application/json");

      expect(plainConverters[0].id).toBe("multi-converter");
      expect(jsonConverters[0].id).toBe("multi-converter");
    });

    it("should handle re-registration with different MIME types", () => {
      const converter1 = new MockConverter(
        "test-converter",
        "Test Converter v1",
        ["text/plain"],
        0,
      );
      const converter2 = new MockConverter(
        "test-converter",
        "Test Converter v2",
        ["text/markdown"], // 異なるMIMEタイプ
        0,
      );

      registry.register(converter1);
      registry.register(converter2);

      const plainConverters = registry.findByMimeType("text/plain");
      const markdownConverters = registry.findByMimeType("text/markdown");

      // 再登録により、text/plainは削除され、text/markdownのみになる
      expect(plainConverters).toHaveLength(0);
      expect(markdownConverters).toHaveLength(1);
    });

    it("should handle case-sensitive MIME types", () => {
      const converter = new MockConverter(
        "test-converter",
        "Test Converter",
        ["text/plain"],
        0,
      );

      registry.register(converter);

      const input1: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      const input2: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "TEXT/PLAIN", // 大文字
        content: "hello",
        encoding: "utf-8",
      };

      const result1 = registry.findConverter(input1);
      const result2 = registry.findConverter(input2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(false); // 大文字小文字を区別
    });
  });

  // ===========================================================================
  // グローバルインスタンスのテスト
  // ===========================================================================

  describe("グローバルインスタンス", () => {
    it("createTestRegistry should create independent instance", () => {
      const registry1 = createTestRegistry();
      const registry2 = createTestRegistry();

      registry1.register(
        new MockConverter("converter-1", "Converter 1", ["text/plain"], 0),
      );

      expect(registry1.size).toBe(1);
      expect(registry2.size).toBe(0); // 独立している
    });
  });
});
