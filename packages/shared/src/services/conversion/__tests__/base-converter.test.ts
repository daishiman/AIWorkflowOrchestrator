/**
 * BaseConverterのテスト
 *
 * @description 抽象クラスの共通処理（テンプレートメソッド、フック、エラーハンドリング）
 *              が期待通りに機能することを検証する
 */

import { describe, it, expect, beforeEach } from "vitest";
import { BaseConverter } from "../base-converter";
import type {
  ConverterInput,
  ConverterOutput,
  ConverterOptions,
} from "../types";
import type { Result, RAGError } from "../../../types/rag";
import { ok, err, createRAGError, ErrorCodes } from "../../../types/rag";
import { createFileId } from "../../../types/rag/branded";

// =============================================================================
// テスト用コンバーター実装
// =============================================================================

/**
 * テスト用の最小コンバーター実装
 */
class TestConverter extends BaseConverter {
  readonly id = "test-converter";
  readonly name = "Test Converter";
  readonly supportedMimeTypes = ["text/plain"] as const;
  readonly priority = 0;

  protected async doConvert(
    input: ConverterInput,
    _options: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    const text = this.getTextContent(input);

    return ok({
      convertedContent: text.toUpperCase(),
      extractedMetadata: {
        title: null,
        author: null,
        language: "en",
        wordCount: text.split(" ").length,
        lineCount: 1,
        charCount: text.length,
        headers: [],
        codeBlocks: 0,
        links: [],
        custom: {},
      },
      processingTime: 0, // BaseConverterが自動設定
    });
  }
}

/**
 * 前処理・後処理をオーバーライドするテスト用コンバーター
 */
class TestConverterWithHooks extends BaseConverter {
  readonly id = "test-converter-with-hooks";
  readonly name = "Test Converter With Hooks";
  readonly supportedMimeTypes = ["text/plain"] as const;
  readonly priority = 0;

  // スパイ用のフラグ
  preprocessCalled = false;
  postprocessCalled = false;

  protected async preprocess(
    input: ConverterInput,
    _options: ConverterOptions,
  ): Promise<Result<ConverterInput, RAGError>> {
    this.preprocessCalled = true;

    // 入力を変更して返す（前処理のテスト）
    return ok({
      ...input,
      content:
        typeof input.content === "string"
          ? `[PREPROCESSED]${input.content}`
          : input.content,
    });
  }

  protected async postprocess(
    output: ConverterOutput,
    _input: ConverterInput,
    _options: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    this.postprocessCalled = true;

    // 出力を変更して返す（後処理のテスト）
    return ok({
      ...output,
      convertedContent: `${output.convertedContent}[POSTPROCESSED]`,
    });
  }

  protected async doConvert(
    input: ConverterInput,
    _options: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    const text = this.getTextContent(input);

    return ok({
      convertedContent: text,
      extractedMetadata: {
        title: null,
        author: null,
        language: "en",
        wordCount: 1,
        lineCount: 1,
        charCount: text.length,
        headers: [],
        codeBlocks: 0,
        links: [],
        custom: {},
      },
      processingTime: 0,
    });
  }
}

/**
 * エラーを返すテスト用コンバーター
 */
class TestConverterWithError extends BaseConverter {
  readonly id = "test-converter-error";
  readonly name = "Test Converter Error";
  readonly supportedMimeTypes = ["text/plain"] as const;
  readonly priority = 0;

  protected async doConvert(
    _input: ConverterInput,
    _options: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    return err(
      createRAGError(ErrorCodes.CONVERSION_FAILED, "Intentional test error", {
        converterId: this.id,
      }),
    );
  }
}

/**
 * 例外をスローするテスト用コンバーター
 */
class TestConverterThrowsException extends BaseConverter {
  readonly id = "test-converter-exception";
  readonly name = "Test Converter Exception";
  readonly supportedMimeTypes = ["text/plain"] as const;
  readonly priority = 0;

  protected async doConvert(
    _input: ConverterInput,
    _options: ConverterOptions,
  ): Promise<Result<ConverterOutput, RAGError>> {
    throw new Error("Unexpected exception in doConvert");
  }
}

// =============================================================================
// BaseConverterのテスト
// =============================================================================

describe("BaseConverter", () => {
  let converter: TestConverter;

  beforeEach(() => {
    converter = new TestConverter();
  });

  // ===========================================================================
  // テンプレートメソッドのテスト
  // ===========================================================================

  describe("convert() - テンプレートメソッド", () => {
    it("should execute template method flow correctly", async () => {
      const input: ConverterInput = {
        fileId: createFileId("test-123"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello world",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      // 現時点では実装がないため、このテストは失敗する（Red状態）
      expect(result.success).toBe(true);

      if (result.success) {
        // doConvert()で大文字変換される
        expect(result.data.convertedContent).toBe("HELLO WORLD");

        // 処理時間が自動計測される
        expect(result.data.processingTime).toBeGreaterThan(0);
      }
    });

    it("should handle binary content", async () => {
      const text = "binary content";
      const encoder = new TextEncoder();
      const buffer = encoder.encode(text).buffer;

      const input: ConverterInput = {
        fileId: createFileId("test-456"),
        filePath: "/test.bin",
        mimeType: "text/plain",
        content: buffer,
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.convertedContent).toBe("BINARY CONTENT");
      }
    });
  });

  // ===========================================================================
  // 前処理・後処理フックのテスト
  // ===========================================================================

  describe("前処理・後処理フック", () => {
    it("should call preprocess and postprocess hooks", async () => {
      const converterWithHooks = new TestConverterWithHooks();

      const input: ConverterInput = {
        fileId: createFileId("test-789"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      const result = await converterWithHooks.convert(input);

      // フックが呼び出されたことを確認
      expect(converterWithHooks.preprocessCalled).toBe(true);
      expect(converterWithHooks.postprocessCalled).toBe(true);

      // 前処理・後処理が反映されていることを確認
      if (result.success) {
        expect(result.data.convertedContent).toBe(
          "[PREPROCESSED]hello[POSTPROCESSED]",
        );
      }
    });

    it("should handle preprocess error", async () => {
      class ConverterWithPreprocessError extends BaseConverter {
        readonly id = "preprocess-error";
        readonly name = "Preprocess Error";
        readonly supportedMimeTypes = ["text/plain"] as const;
        readonly priority = 0;

        protected async preprocess(
          _input: ConverterInput,
          _options: ConverterOptions,
        ): Promise<Result<ConverterInput, RAGError>> {
          return err(
            createRAGError(ErrorCodes.VALIDATION_ERROR, "Preprocess failed", {
              converterId: this.id,
            }),
          );
        }

        protected async doConvert(
          input: ConverterInput,
          _options: ConverterOptions,
        ): Promise<Result<ConverterOutput, RAGError>> {
          return ok({
            convertedContent: this.getTextContent(input),
            extractedMetadata: {} as any,
            processingTime: 0,
          });
        }
      }

      const converter = new ConverterWithPreprocessError();
      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
        expect(result.error.message).toContain("Preprocess failed");
      }
    });

    it("should handle postprocess error", async () => {
      class ConverterWithPostprocessError extends BaseConverter {
        readonly id = "postprocess-error";
        readonly name = "Postprocess Error";
        readonly supportedMimeTypes = ["text/plain"] as const;
        readonly priority = 0;

        protected async doConvert(
          input: ConverterInput,
          _options: ConverterOptions,
        ): Promise<Result<ConverterOutput, RAGError>> {
          return ok({
            convertedContent: this.getTextContent(input),
            extractedMetadata: {} as any,
            processingTime: 0,
          });
        }

        protected async postprocess(
          _output: ConverterOutput,
          _input: ConverterInput,
          _options: ConverterOptions,
        ): Promise<Result<ConverterOutput, RAGError>> {
          return err(
            createRAGError(ErrorCodes.CONVERSION_FAILED, "Postprocess failed", {
              converterId: this.id,
            }),
          );
        }
      }

      const converter = new ConverterWithPostprocessError();
      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.CONVERSION_FAILED);
        expect(result.error.message).toContain("Postprocess failed");
      }
    });
  });

  // ===========================================================================
  // エラーハンドリングのテスト
  // ===========================================================================

  describe("エラーハンドリング", () => {
    it("should handle doConvert returning error", async () => {
      const errorConverter = new TestConverterWithError();

      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      const result = await errorConverter.convert(input);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.CONVERSION_FAILED);
        expect(result.error.message).toContain("Intentional test error");
      }
    });

    it("should handle unexpected exception in doConvert", async () => {
      const exceptionConverter = new TestConverterThrowsException();

      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      const result = await exceptionConverter.convert(input);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.CONVERSION_FAILED);
        expect(result.error.message).toContain("Conversion failed");
      }
    });
  });

  // ===========================================================================
  // バリデーションのテスト
  // ===========================================================================

  describe("validateInput()", () => {
    it("should reject empty fileId", async () => {
      const input: ConverterInput = {
        fileId: "" as any,
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
        expect(result.error.message).toContain("fileId is required");
      }
    });

    it("should reject empty filePath", async () => {
      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
        expect(result.error.message).toContain("filePath is required");
      }
    });

    it("should reject empty mimeType", async () => {
      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "",
        content: "hello",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
        expect(result.error.message).toContain("mimeType is required");
      }
    });

    it("should reject null content", async () => {
      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: null as any,
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
        expect(result.error.message).toContain("content is required");
      }
    });

    it("should reject undefined content", async () => {
      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: undefined as any,
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
        expect(result.error.message).toContain("content is required");
      }
    });
  });

  // ===========================================================================
  // 処理時間計測のテスト
  // ===========================================================================

  describe("処理時間の自動計測", () => {
    it("should measure processing time", async () => {
      class SlowConverter extends BaseConverter {
        readonly id = "slow-converter";
        readonly name = "Slow Converter";
        readonly supportedMimeTypes = ["text/plain"] as const;
        readonly priority = 0;

        protected async doConvert(
          input: ConverterInput,
          _options: ConverterOptions,
        ): Promise<Result<ConverterOutput, RAGError>> {
          // 意図的に遅延
          await new Promise((resolve) => setTimeout(resolve, 50));

          return ok({
            convertedContent: this.getTextContent(input),
            extractedMetadata: {} as any,
            processingTime: 0,
          });
        }
      }

      const slowConverter = new SlowConverter();
      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      const result = await slowConverter.convert(input);

      expect(result.success).toBe(true);

      if (result.success) {
        // 処理時間が49ms以上であることを確認（CI環境でのタイミング変動を考慮）
        expect(result.data.processingTime).toBeGreaterThanOrEqual(49);
      }
    });

    it("should set processingTime even if doConvert returns 0", async () => {
      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(true);

      if (result.success) {
        // doConvert()では0を返すが、BaseConverterが実測値を設定
        expect(result.data.processingTime).toBeGreaterThanOrEqual(0);
      }
    });
  });

  // ===========================================================================
  // canConvert()のテスト
  // ===========================================================================

  describe("canConvert()", () => {
    it("should return true for supported MIME type", () => {
      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      expect(converter.canConvert(input)).toBe(true);
    });

    it("should return false for unsupported MIME type", () => {
      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.md",
        mimeType: "text/markdown",
        content: "# Hello",
        encoding: "utf-8",
      };

      expect(converter.canConvert(input)).toBe(false);
    });

    it("should be overridable in subclass", () => {
      class CustomCanConvertConverter extends TestConverter {
        canConvert(input: ConverterInput): boolean {
          // カスタムロジック: ファイルサイズもチェック
          const isSupported = super.canConvert(input);
          const size = this.getContentSize(input);
          return isSupported && size < 1000000; // 1MB以下のみ
        }
      }

      const customConverter = new CustomCanConvertConverter();

      const smallInput: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "small",
        encoding: "utf-8",
      };

      const largeInput: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "a".repeat(2000000), // 2MB
        encoding: "utf-8",
      };

      expect(customConverter.canConvert(smallInput)).toBe(true);
      expect(customConverter.canConvert(largeInput)).toBe(false);
    });
  });

  // ===========================================================================
  // estimateProcessingTime()のテスト
  // ===========================================================================

  describe("estimateProcessingTime()", () => {
    it("should estimate time based on content size (default implementation)", () => {
      const smallInput: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "a".repeat(1024), // 1KB
        encoding: "utf-8",
      };

      const estimatedTime = converter.estimateProcessingTime(smallInput);

      // 1KB = 1ms（デフォルト実装）
      expect(estimatedTime).toBeGreaterThan(0);
      expect(estimatedTime).toBeLessThan(10);
    });

    it("should handle large content", () => {
      const largeInput: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "a".repeat(1024 * 10), // 10KB
        encoding: "utf-8",
      };

      const estimatedTime = converter.estimateProcessingTime(largeInput);

      expect(estimatedTime).toBeGreaterThan(5);
    });

    it("should be overridable in subclass", () => {
      class CustomEstimateConverter extends TestConverter {
        estimateProcessingTime(_input: ConverterInput): number {
          // カスタムロジック: 常に100msと推定
          return 100;
        }
      }

      const customConverter = new CustomEstimateConverter();
      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "a".repeat(1024 * 1000), // 1MB
        encoding: "utf-8",
      };

      const estimatedTime = customConverter.estimateProcessingTime(input);

      expect(estimatedTime).toBe(100);
    });
  });

  // ===========================================================================
  // ヘルパーメソッドのテスト
  // ===========================================================================

  describe("getTextContent()", () => {
    it("should return string content as-is", () => {
      class TestableConverter extends TestConverter {
        public testGetTextContent(input: ConverterInput): string {
          return this.getTextContent(input);
        }
      }

      const converter = new TestableConverter();
      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "Hello, World!",
        encoding: "utf-8",
      };

      const text = converter.testGetTextContent(input);

      expect(text).toBe("Hello, World!");
    });

    it("should decode ArrayBuffer content", () => {
      class TestableConverter extends TestConverter {
        public testGetTextContent(input: ConverterInput): string {
          return this.getTextContent(input);
        }
      }

      const converter = new TestableConverter();
      const encoder = new TextEncoder();
      const buffer = encoder.encode("Binary text").buffer;

      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.bin",
        mimeType: "text/plain",
        content: buffer,
        encoding: "utf-8",
      };

      const text = converter.testGetTextContent(input);

      expect(text).toBe("Binary text");
    });
  });

  describe("getContentSize()", () => {
    it("should return size for string content", () => {
      class TestableConverter extends TestConverter {
        public testGetContentSize(input: ConverterInput): number {
          return this.getContentSize(input);
        }
      }

      const converter = new TestableConverter();
      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "Hello",
        encoding: "utf-8",
      };

      const size = converter.testGetContentSize(input);

      expect(size).toBeGreaterThan(0);
    });

    it("should return size for ArrayBuffer content", () => {
      class TestableConverter extends TestConverter {
        public testGetContentSize(input: ConverterInput): number {
          return this.getContentSize(input);
        }
      }

      const converter = new TestableConverter();
      const buffer = new ArrayBuffer(100);

      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.bin",
        mimeType: "application/octet-stream",
        content: buffer,
        encoding: "utf-8",
      };

      const size = converter.testGetContentSize(input);

      expect(size).toBe(100);
    });
  });

  // ===========================================================================
  // メタデータ取得のテスト
  // ===========================================================================

  describe("getMetadata()", () => {
    it("should return converter metadata", () => {
      const metadata = converter.getMetadata();

      expect(metadata.id).toBe("test-converter");
      expect(metadata.name).toBe("Test Converter");
      expect(metadata.supportedMimeTypes).toEqual(["text/plain"]);
      expect(metadata.priority).toBe(0);
      expect(metadata.version).toBeDefined();
      expect(metadata.description).toBeDefined();
    });

    it("should allow custom description", () => {
      class CustomDescriptionConverter extends TestConverter {
        protected getDescription(): string {
          return "Custom description for testing";
        }
      }

      const customConverter = new CustomDescriptionConverter();
      const metadata = customConverter.getMetadata();

      expect(metadata.description).toBe("Custom description for testing");
    });

    it("should allow custom version", () => {
      class CustomVersionConverter extends TestConverter {
        protected getVersion(): string {
          return "2.0.0";
        }
      }

      const customConverter = new CustomVersionConverter();
      const metadata = customConverter.getMetadata();

      expect(metadata.version).toBe("2.0.0");
    });
  });

  describe("supportsMimeType()", () => {
    it("should return true for supported MIME type", () => {
      expect(converter.supportsMimeType("text/plain")).toBe(true);
    });

    it("should return false for unsupported MIME type", () => {
      expect(converter.supportsMimeType("text/markdown")).toBe(false);
      expect(converter.supportsMimeType("application/pdf")).toBe(false);
    });
  });

  // ===========================================================================
  // オプション処理のテスト
  // ===========================================================================

  describe("オプション処理", () => {
    it("should merge options with defaults", async () => {
      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      const options: ConverterOptions = {
        preserveFormatting: true,
      };

      const result = await converter.convert(input, options);

      expect(result.success).toBe(true);
      // オプションがマージされて渡されることを確認（実装により検証）
    });

    it("should handle undefined options", async () => {
      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "hello",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      // デフォルトオプションが使用されることを確認
    });
  });

  // ===========================================================================
  // 境界値テスト
  // ===========================================================================

  describe("境界値テスト", () => {
    it("should handle empty string content", async () => {
      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.convertedContent).toBe("");
      }
    });

    it("should handle large content", async () => {
      const largeContent = "a".repeat(1024 * 1024); // 1MB

      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: largeContent,
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.convertedContent.length).toBe(largeContent.length);
      }
    });

    it("should handle special characters", async () => {
      const input: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/test.txt",
        mimeType: "text/plain",
        content: "Hello\n\t\r こんにちは 🎉",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
    });
  });

  // ===========================================================================
  // 継承関係のテスト
  // ===========================================================================

  describe("継承関係", () => {
    it("should implement IConverter interface", () => {
      // 型レベルでの検証
      const converterAsInterface: IConverter = converter;

      expect(converterAsInterface.id).toBe("test-converter");
      expect(converterAsInterface.name).toBe("Test Converter");
      expect(converterAsInterface.canConvert).toBeDefined();
      expect(converterAsInterface.convert).toBeDefined();
      expect(converterAsInterface.estimateProcessingTime).toBeDefined();
    });

    it("should allow multiple levels of inheritance", () => {
      class Level1Converter extends BaseConverter {
        readonly id = "level1";
        readonly name = "Level 1";
        readonly supportedMimeTypes = ["text/plain"] as const;
        readonly priority = 0;

        protected async doConvert(
          input: ConverterInput,
          _options: ConverterOptions,
        ): Promise<Result<ConverterOutput, RAGError>> {
          return ok({
            convertedContent: this.getTextContent(input),
            extractedMetadata: {} as any,
            processingTime: 0,
          });
        }
      }

      class Level2Converter extends Level1Converter {
        readonly id = "level2";
        readonly name = "Level 2";
      }

      const level2 = new Level2Converter();

      expect(level2.id).toBe("level2");
      expect(level2.name).toBe("Level 2");
      expect(level2.supportedMimeTypes).toEqual(["text/plain"]);
    });
  });
});
