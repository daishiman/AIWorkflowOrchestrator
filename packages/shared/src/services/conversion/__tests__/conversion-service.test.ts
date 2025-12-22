/**
 * ConversionServiceのテスト
 *
 * @description タイムアウト・同時実行制御・バッチ変換が期待通りに機能することを検証する
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  ConversionService,
  summarizeBatchResults,
} from "../conversion-service";
import { createTestRegistry } from "../converter-registry";
import type { ConverterRegistry } from "../converter-registry";
import type {
  IConverter,
  ConverterInput,
  ConverterOutput,
  ConverterOptions,
  BatchConversionResult,
} from "../types";
import type { Result, RAGError } from "../../../types/rag";
import { ok, err, createRAGError, ErrorCodes } from "../../../types/rag";
import { createFileId } from "../../../types/rag/branded";

// =============================================================================
// モックコンバーター
// =============================================================================

/**
 * 遅延可能なモックコンバーター
 */
class MockConverter implements IConverter {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly supportedMimeTypes: readonly string[],
    public readonly priority: number,
    private readonly delay: number = 0, // 遅延時間（ms）
  ) {}

  canConvert(input: ConverterInput): boolean {
    return this.supportedMimeTypes.includes(input.mimeType);
  }

  async convert(
    input: ConverterInput,
    _options?: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    // 遅延をシミュレート
    if (this.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delay));
    }

    const content =
      typeof input.content === "string"
        ? input.content
        : new TextDecoder().decode(input.content);

    return ok({
      convertedContent: `Converted: ${content}`,
      extractedMetadata: {
        title: null,
        author: null,
        language: "en",
        wordCount: 2,
        lineCount: 1,
        charCount: content.length + 11,
        headers: [],
        codeBlocks: 0,
        links: [],
        custom: {},
      },
      processingTime: this.delay,
    });
  }

  estimateProcessingTime(_input: ConverterInput): number {
    return this.delay;
  }
}

// =============================================================================
// ConversionServiceのテスト
// =============================================================================

describe("ConversionService", () => {
  let registry: ConverterRegistry;
  let service: ConversionService;

  beforeEach(() => {
    registry = createTestRegistry();
    service = new ConversionService(registry, {
      defaultTimeout: 5000,
      maxConcurrentConversions: 2,
    });
  });

  // ===========================================================================
  // 単一ファイル変換のテスト
  // ===========================================================================

  describe("convert()", () => {
    it("should convert file successfully", async () => {
      const converter = new MockConverter(
        "test-converter",
        "Test Converter",
        ["text/plain"],
        0,
        10,
      );
      registry.register(converter);

      const input: ConverterInput = {
        fileId: createFileId("test-123"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "Hello, World!",
        encoding: "utf-8",
      };

      const result = await service.convert(input);

      // 現時点では実装がないため、このテストは失敗する（Red状態）
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.convertedContent).toContain("Converted");
        expect(result.data.processingTime).toBeGreaterThan(0);
      }
    });

    it("should return error for unsupported MIME type", async () => {
      const input: ConverterInput = {
        fileId: createFileId("test-456"),
        filePath: "/test.unknown",
        mimeType: "application/unknown",
        content: "Unknown content",
        encoding: "utf-8",
      };

      const result = await service.convert(input);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.CONVERTER_NOT_FOUND);
      }
    });

    it("should pass options to converter", async () => {
      const converter = new MockConverter(
        "test-converter",
        "Test Converter",
        ["text/plain"],
        0,
        10,
      );
      registry.register(converter);

      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      const options: ConverterOptions = {
        preserveFormatting: true,
        extractHeaders: false,
      };

      const result = await service.convert(input, options);

      expect(result.success).toBe(true);
      // オプションが渡されることを確認（実装により検証）
    });
  });

  // ===========================================================================
  // タイムアウトのテスト
  // ===========================================================================

  describe("タイムアウト", () => {
    it("should timeout if conversion takes too long", async () => {
      // 10秒かかるコンバーター
      const slowConverter = new MockConverter(
        "slow-converter",
        "Slow Converter",
        ["text/plain"],
        0,
        10000,
      );
      registry.register(slowConverter);

      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      // 100msでタイムアウト
      const result = await service.convert(input, { timeout: 100 });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.TIMEOUT);
        expect(result.error.message).toContain("timeout");
      }
    }, 10000); // テスト自体のタイムアウトは10秒

    it("should use default timeout if not specified", async () => {
      // 6秒かかるコンバーター（デフォルトタイムアウト5秒を超える）
      const slowConverter = new MockConverter(
        "slow-converter",
        "Slow Converter",
        ["text/plain"],
        0,
        6000,
      );
      registry.register(slowConverter);

      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      const result = await service.convert(input);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.TIMEOUT);
      }
    }, 10000);

    it("should complete before timeout", async () => {
      // 50msで完了するコンバーター
      const fastConverter = new MockConverter(
        "fast-converter",
        "Fast Converter",
        ["text/plain"],
        0,
        50,
      );
      registry.register(fastConverter);

      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      // 1000msのタイムアウト（十分余裕がある）
      const result = await service.convert(input, { timeout: 1000 });

      expect(result.success).toBe(true);
    });
  });

  // ===========================================================================
  // 同時実行制御のテスト
  // ===========================================================================

  describe("同時実行制御", () => {
    it("should reject when max concurrent conversions reached", async () => {
      // 1秒かかるコンバーター
      const converter = new MockConverter(
        "test-converter",
        "Test Converter",
        ["text/plain"],
        0,
        1000,
      );
      registry.register(converter);

      const input1: ConverterInput = {
        fileId: createFileId("file-1"),
        filePath: "/test1.txt",
        mimeType: "text/plain",
        content: "Hello 1",
        encoding: "utf-8",
      };
      const input2: ConverterInput = {
        fileId: createFileId("file-2"),
        filePath: "/test2.txt",
        mimeType: "text/plain",
        content: "Hello 2",
        encoding: "utf-8",
      };
      const input3: ConverterInput = {
        fileId: createFileId("file-3"),
        filePath: "/test3.txt",
        mimeType: "text/plain",
        content: "Hello 3",
        encoding: "utf-8",
      };

      // maxConcurrentConversions=2なので、3件目はエラー
      const promise1 = service.convert(input1);
      const promise2 = service.convert(input2);

      // 少し待ってから3件目を実行（1, 2件目がまだ実行中）
      await new Promise((resolve) => setTimeout(resolve, 10));
      const promise3 = service.convert(input3);

      const result3 = await promise3;

      expect(result3.success).toBe(false);

      if (!result3.success) {
        expect(result3.error.code).toBe(ErrorCodes.RESOURCE_EXHAUSTED);
        expect(result3.error.message).toContain("Maximum concurrent");
      }

      // 1件目と2件目は成功を待つ
      await promise1;
      await promise2;
    }, 5000);

    it("should allow new conversion after previous completes", async () => {
      const converter = new MockConverter(
        "test-converter",
        "Test Converter",
        ["text/plain"],
        0,
        100,
      );
      registry.register(converter);

      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      // 1件目を実行して完了を待つ
      await service.convert(input);

      // 2件目を実行（1件目は完了済みなので成功するはず）
      const result2 = await service.convert(input);

      expect(result2.success).toBe(true);
    });

    it("should decrement counter even on error", async () => {
      class ErrorConverter implements IConverter {
        readonly id = "error-converter";
        readonly name = "Error Converter";
        readonly supportedMimeTypes = ["text/plain"] as const;
        readonly priority = 0;

        canConvert(_input: ConverterInput): boolean {
          return true;
        }

        async convert(
          _input: ConverterInput,
          _options?: ConverterOptions,
        ): Promise<Result<ConverterOutput, RAGError>> {
          await new Promise((resolve) => setTimeout(resolve, 50));
          return err(
            createRAGError(ErrorCodes.CONVERSION_FAILED, "Intentional error"),
          );
        }

        estimateProcessingTime(_input: ConverterInput): number {
          return 50;
        }
      }

      registry.register(new ErrorConverter());

      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      const result1 = await service.convert(input); // エラーで完了
      expect(result1.success).toBe(false);

      // カウンターがデクリメントされ、2件目が実行可能
      const result2 = await service.convert(input);
      expect(result2.success).toBe(false);
    });
  });

  // ===========================================================================
  // バッチ変換のテスト
  // ===========================================================================

  describe("convertBatch()", () => {
    it("should convert multiple files", async () => {
      const converter = new MockConverter(
        "test-converter",
        "Test Converter",
        ["text/plain"],
        0,
        10,
      );
      registry.register(converter);

      const inputs: ConverterInput[] = [
        {
          fileId: createFileId("file-1"),
          filePath: "/file1.txt",
          mimeType: "text/plain",
          content: "Hello 1",
          encoding: "utf-8",
        },
        {
          fileId: createFileId("file-2"),
          filePath: "/file2.txt",
          mimeType: "text/plain",
          content: "Hello 2",
          encoding: "utf-8",
        },
        {
          fileId: createFileId("file-3"),
          filePath: "/file3.txt",
          mimeType: "text/plain",
          content: "Hello 3",
          encoding: "utf-8",
        },
      ];

      const results = await service.convertBatch(inputs);

      expect(results).toHaveLength(3);
      expect(results.filter((r) => r.status === "success")).toHaveLength(3);
    });

    it("should continue on partial failures", async () => {
      const converter = new MockConverter(
        "test-converter",
        "Test Converter",
        ["text/plain"],
        0,
        10,
      );
      registry.register(converter);

      const inputs: ConverterInput[] = [
        {
          fileId: createFileId("file-1"),
          filePath: "/file1.txt",
          mimeType: "text/plain",
          content: "Hello 1",
          encoding: "utf-8",
        },
        {
          fileId: createFileId("file-2"),
          filePath: "/file2.unknown",
          mimeType: "application/unknown", // サポートされていない
          content: "Hello 2",
          encoding: "utf-8",
        },
        {
          fileId: createFileId("file-3"),
          filePath: "/file3.txt",
          mimeType: "text/plain",
          content: "Hello 3",
          encoding: "utf-8",
        },
      ];

      const results = await service.convertBatch(inputs);

      expect(results).toHaveLength(3);
      expect(results.filter((r) => r.status === "success")).toHaveLength(2);
      expect(results.filter((r) => r.status === "error")).toHaveLength(1);

      // エラーの詳細を確認
      const errorResult = results.find((r) => r.status === "error");
      expect(errorResult).toBeDefined();

      if (errorResult && errorResult.status === "error") {
        expect(errorResult.error.code).toBe(ErrorCodes.CONVERTER_NOT_FOUND);
      }
    });

    it("should process in chunks", async () => {
      const converter = new MockConverter(
        "test-converter",
        "Test Converter",
        ["text/plain"],
        0,
        100,
      );
      registry.register(converter);

      // 5件の入力（maxConcurrentConversions=2なので、3チャンクに分かれる）
      const inputs: ConverterInput[] = Array.from({ length: 5 }, (_, i) => ({
        fileId: createFileId(`file-${i}`),
        filePath: `/file${i}.txt`,
        mimeType: "text/plain",
        content: `Hello ${i}`,
        encoding: "utf-8",
      }));

      const results = await service.convertBatch(inputs);

      expect(results).toHaveLength(5);
      expect(results.filter((r) => r.status === "success")).toHaveLength(5);
    });

    it("should handle empty input array", async () => {
      const results = await service.convertBatch([]);

      expect(results).toHaveLength(0);
      expect(results).toEqual([]);
    });
  });

  // ===========================================================================
  // バッチ結果集計のテスト
  // ===========================================================================

  describe("summarizeBatchResults()", () => {
    it("should summarize all successful results", () => {
      const results: BatchConversionResult[] = [
        {
          input: {} as ConverterInput,
          status: "success",
          output: {
            convertedContent: "text",
            extractedMetadata: {} as any,
            processingTime: 10,
          },
        },
        {
          input: {} as ConverterInput,
          status: "success",
          output: {
            convertedContent: "text",
            extractedMetadata: {} as any,
            processingTime: 20,
          },
        },
      ];

      const summary = summarizeBatchResults(results);

      expect(summary.total).toBe(2);
      expect(summary.success).toBe(2);
      expect(summary.failed).toBe(0);
      expect(summary.totalProcessingTime).toBe(30);
      expect(summary.errors).toHaveLength(0);
    });

    it("should summarize mixed results", () => {
      const results: BatchConversionResult[] = [
        {
          input: { fileId: createFileId("file-1") } as ConverterInput,
          status: "success",
          output: {
            convertedContent: "text",
            extractedMetadata: {} as any,
            processingTime: 15,
          },
        },
        {
          input: { fileId: createFileId("file-2") } as ConverterInput,
          status: "error",
          error: createRAGError(ErrorCodes.CONVERSION_FAILED, "Failed"),
        },
        {
          input: { fileId: createFileId("file-3") } as ConverterInput,
          status: "success",
          output: {
            convertedContent: "text",
            extractedMetadata: {} as any,
            processingTime: 25,
          },
        },
      ];

      const summary = summarizeBatchResults(results);

      expect(summary.total).toBe(3);
      expect(summary.success).toBe(2);
      expect(summary.failed).toBe(1);
      expect(summary.totalProcessingTime).toBe(40);
      expect(summary.errors).toHaveLength(1);
      expect(summary.errors[0].fileId).toBe(createFileId("file-2"));
    });
  });

  // ===========================================================================
  // ユーティリティメソッドのテスト
  // ===========================================================================

  describe("canConvert()", () => {
    it("should return true for supported MIME type", () => {
      const converter = new MockConverter(
        "test-converter",
        "Test Converter",
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

      expect(service.canConvert(input)).toBe(true);
    });

    it("should return false for unsupported MIME type", () => {
      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.unknown",
        mimeType: "application/unknown",
        content: "hello",
        encoding: "utf-8",
      };

      expect(service.canConvert(input)).toBe(false);
    });
  });

  describe("estimateProcessingTime()", () => {
    it("should return estimated time from converter", () => {
      const converter = new MockConverter(
        "test-converter",
        "Test Converter",
        ["text/plain"],
        0,
        100,
      );
      registry.register(converter);

      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      const time = service.estimateProcessingTime(input);

      expect(time).toBe(100);
    });

    it("should return null for unsupported MIME type", () => {
      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.unknown",
        mimeType: "application/unknown",
        content: "hello",
        encoding: "utf-8",
      };

      const time = service.estimateProcessingTime(input);

      expect(time).toBeNull();
    });
  });

  describe("getSupportedMimeTypes()", () => {
    it("should delegate to registry", () => {
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

      const mimeTypes = service.getSupportedMimeTypes();

      expect(mimeTypes).toHaveLength(2);
      expect(mimeTypes).toContain("text/plain");
      expect(mimeTypes).toContain("text/markdown");
    });
  });

  describe("getCurrentConversions()", () => {
    it("should return 0 initially", () => {
      expect(service.getCurrentConversions()).toBe(0);
    });

    it("should increment during conversion", async () => {
      const converter = new MockConverter(
        "test-converter",
        "Test Converter",
        ["text/plain"],
        0,
        500,
      );
      registry.register(converter);

      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      const promise = service.convert(input);

      // 変換中は1になるはず
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(service.getCurrentConversions()).toBe(1);

      await promise;

      // 完了後は0に戻る
      expect(service.getCurrentConversions()).toBe(0);
    });
  });

  describe("getSettings()", () => {
    it("should return service settings", () => {
      const settings = service.getSettings();

      expect(settings.defaultTimeout).toBe(5000);
      expect(settings.maxConcurrentConversions).toBe(2);
      expect(settings.currentConversions).toBe(0);
    });
  });

  // ===========================================================================
  // エッジケースのテスト
  // ===========================================================================

  describe("エッジケース", () => {
    it("should handle concurrent conversions with different MIME types", async () => {
      const textConverter = new MockConverter(
        "text-converter",
        "Text Converter",
        ["text/plain"],
        0,
        100,
      );
      const markdownConverter = new MockConverter(
        "markdown-converter",
        "Markdown Converter",
        ["text/markdown"],
        0,
        100,
      );

      registry.register(textConverter);
      registry.register(markdownConverter);

      const input1: ConverterInput = {
        fileId: createFileId("file-1"),
        filePath: "/file1.txt",
        mimeType: "text/plain",
        content: "text",
        encoding: "utf-8",
      };

      const input2: ConverterInput = {
        fileId: createFileId("file-2"),
        filePath: "/file2.md",
        mimeType: "text/markdown",
        content: "# markdown",
        encoding: "utf-8",
      };

      const [result1, result2] = await Promise.all([
        service.convert(input1),
        service.convert(input2),
      ]);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });

    it("should handle very large batch", async () => {
      const converter = new MockConverter(
        "test-converter",
        "Test Converter",
        ["text/plain"],
        0,
        10,
      );
      registry.register(converter);

      // 100件の入力
      const inputs: ConverterInput[] = Array.from({ length: 100 }, (_, i) => ({
        fileId: createFileId(`file-${i}`),
        filePath: `/file${i}.txt`,
        mimeType: "text/plain",
        content: `Content ${i}`,
        encoding: "utf-8",
      }));

      const results = await service.convertBatch(inputs);

      expect(results).toHaveLength(100);
      expect(results.filter((r) => r.status === "success")).toHaveLength(100);
    }, 30000); // 大量のファイルなのでタイムアウトを長めに
  });
});
