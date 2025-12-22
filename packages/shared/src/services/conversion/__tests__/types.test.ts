/**
 * 型定義のテスト
 *
 * @description ConverterInput, ConverterOutput, ConverterOptions等の型定義が
 *              期待通りに機能することを検証する
 */

import { describe, it, expect } from "vitest";
import type {
  ConverterInput,
  ConverterOutput,
  ConverterOptions,
  ConverterMetadata,
  IConverter,
  ExtractedMetadata,
} from "../types";
import {
  isTextContent,
  isBinaryContent,
  mergeConverterOptions,
  DEFAULT_CONVERTER_OPTIONS,
  createConverterInput,
  createConverterOutput,
} from "../types";
import { createFileId } from "../../../types/rag/branded";
import type { Result, RAGError } from "../../../types/rag";

// =============================================================================
// ConverterInput型のテスト
// =============================================================================

describe("ConverterInput", () => {
  describe("型定義の妥当性", () => {
    it("should accept valid input with string content", () => {
      const input: ConverterInput = {
        fileId: createFileId("test-file-123"),
        filePath: "/path/to/file.txt",
        mimeType: "text/plain",
        content: "Hello, World!",
        encoding: "utf-8",
      };

      expect(input).toBeDefined();
      expect(input.fileId).toBe("test-file-123");
      expect(input.content).toBe("Hello, World!");
    });

    it("should accept valid input with ArrayBuffer content", () => {
      const buffer = new ArrayBuffer(10);
      const input: ConverterInput = {
        fileId: createFileId("test-file-456"),
        filePath: "/path/to/file.bin",
        mimeType: "application/octet-stream",
        content: buffer,
        encoding: "utf-8",
      };

      expect(input).toBeDefined();
      expect(input.content).toBeInstanceOf(ArrayBuffer);
    });

    it("should accept optional metadata", () => {
      const input: ConverterInput = {
        fileId: createFileId("test-file-789"),
        filePath: "/path/to/file.md",
        mimeType: "text/markdown",
        content: "# Title",
        encoding: "utf-8",
        metadata: {
          author: "John Doe",
          createdAt: new Date(),
          custom: { foo: "bar" },
        },
      };

      expect(input.metadata).toBeDefined();
      expect(input.metadata?.author).toBe("John Doe");
    });

    // TypeScript型チェックテスト（コンパイル時エラーを確認）
    it("should reject invalid input at compile time", () => {
      // @ts-expect-error - fileIdが欠けている
      const _invalidInput1: ConverterInput = {
        filePath: "/path/to/file.txt",
        mimeType: "text/plain",
        content: "Hello",
        encoding: "utf-8",
      };

      // @ts-expect-error - mimeTypeが欠けている
      const _invalidInput2: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/path/to/file.txt",
        content: "Hello",
        encoding: "utf-8",
      };

      // @ts-expect-error - contentが欠けている
      const _invalidInput3: ConverterInput = {
        fileId: createFileId("test"),
        filePath: "/path/to/file.txt",
        mimeType: "text/plain",
        encoding: "utf-8",
      };

      expect(true).toBe(true); // テストの存在を示すダミーアサーション
    });
  });

  describe("型ガード関数", () => {
    describe("isTextContent()", () => {
      it("should return true for string content", () => {
        const input: ConverterInput = {
          fileId: createFileId("test"),
          filePath: "/test.txt",
          mimeType: "text/plain",
          content: "Hello",
          encoding: "utf-8",
        };

        expect(isTextContent(input)).toBe(true);

        // 型ガード後、contentはstring型として扱われる
        if (isTextContent(input)) {
          const text: string = input.content; // 型エラーなし
          expect(text).toBe("Hello");
        }
      });

      it("should return false for ArrayBuffer content", () => {
        const buffer = new ArrayBuffer(10);
        const input: ConverterInput = {
          fileId: createFileId("test"),
          filePath: "/test.bin",
          mimeType: "application/octet-stream",
          content: buffer,
          encoding: "utf-8",
        };

        expect(isTextContent(input)).toBe(false);
      });
    });

    describe("isBinaryContent()", () => {
      it("should return true for ArrayBuffer content", () => {
        const buffer = new ArrayBuffer(10);
        const input: ConverterInput = {
          fileId: createFileId("test"),
          filePath: "/test.bin",
          mimeType: "application/octet-stream",
          content: buffer,
          encoding: "utf-8",
        };

        expect(isBinaryContent(input)).toBe(true);

        // 型ガード後、contentはArrayBuffer型として扱われる
        if (isBinaryContent(input)) {
          const buffer: ArrayBuffer = input.content; // 型エラーなし
          expect(buffer.byteLength).toBe(10);
        }
      });

      it("should return false for string content", () => {
        const input: ConverterInput = {
          fileId: createFileId("test"),
          filePath: "/test.txt",
          mimeType: "text/plain",
          content: "Hello",
          encoding: "utf-8",
        };

        expect(isBinaryContent(input)).toBe(false);
      });
    });
  });
});

// =============================================================================
// ConverterOutput型のテスト
// =============================================================================

describe("ConverterOutput", () => {
  it("should accept valid output", () => {
    const output: ConverterOutput = {
      convertedContent: "Converted text",
      extractedMetadata: {
        title: "Test Document",
        author: null,
        language: "en",
        wordCount: 2,
        lineCount: 1,
        charCount: 14,
        headers: [],
        codeBlocks: 0,
        links: [],
        custom: {},
      },
      processingTime: 12.5,
    };

    expect(output).toBeDefined();
    expect(output.convertedContent).toBe("Converted text");
    expect(output.processingTime).toBe(12.5);
  });

  it("should accept empty convertedContent", () => {
    const output: ConverterOutput = {
      convertedContent: "",
      extractedMetadata: {
        title: null,
        author: null,
        language: "en",
        wordCount: 0,
        lineCount: 0,
        charCount: 0,
        headers: [],
        codeBlocks: 0,
        links: [],
        custom: {},
      },
      processingTime: 0,
    };

    expect(output.convertedContent).toBe("");
  });

  it("should reject invalid output at compile time", () => {
    // @ts-expect-error - convertedContentが欠けている
    const _invalidOutput1: ConverterOutput = {
      extractedMetadata: {} as ExtractedMetadata,
      processingTime: 0,
    };

    // @ts-expect-error - extractedMetadataが欠けている
    const _invalidOutput2: ConverterOutput = {
      convertedContent: "text",
      processingTime: 0,
    };

    expect(true).toBe(true);
  });
});

// =============================================================================
// ConverterOptions型のテスト
// =============================================================================

describe("ConverterOptions", () => {
  it("should accept all optional fields", () => {
    const options: ConverterOptions = {
      preserveFormatting: true,
      extractLinks: false,
      extractHeaders: true,
      maxContentLength: 10000,
      language: "ja",
      timeout: 30000,
      custom: {
        foo: "bar",
        nested: { key: "value" },
      },
    };

    expect(options.preserveFormatting).toBe(true);
    expect(options.extractLinks).toBe(false);
    expect(options.language).toBe("ja");
  });

  it("should accept empty options", () => {
    const options: ConverterOptions = {};

    expect(options).toEqual({});
  });

  it("should accept partial options", () => {
    const options: ConverterOptions = {
      preserveFormatting: true,
    };

    expect(options.preserveFormatting).toBe(true);
    expect(options.extractLinks).toBeUndefined();
  });

  describe("DEFAULT_CONVERTER_OPTIONS", () => {
    it("should have default values", () => {
      expect(DEFAULT_CONVERTER_OPTIONS.preserveFormatting).toBe(false);
      expect(DEFAULT_CONVERTER_OPTIONS.extractLinks).toBe(true);
      expect(DEFAULT_CONVERTER_OPTIONS.extractHeaders).toBe(true);
      expect(DEFAULT_CONVERTER_OPTIONS.custom).toEqual({});
    });
  });

  describe("mergeConverterOptions()", () => {
    it("should merge with default options", () => {
      const options: ConverterOptions = {
        preserveFormatting: true,
      };

      const merged = mergeConverterOptions(options);

      expect(merged.preserveFormatting).toBe(true); // カスタム値
      expect(merged.extractLinks).toBe(true); // デフォルト値
      expect(merged.extractHeaders).toBe(true); // デフォルト値
    });

    it("should handle undefined options", () => {
      const merged = mergeConverterOptions(undefined);

      expect(merged).toEqual(DEFAULT_CONVERTER_OPTIONS);
    });

    it("should deep merge custom options", () => {
      const options: ConverterOptions = {
        custom: { foo: "bar" },
      };

      const merged = mergeConverterOptions(options);

      expect(merged.custom).toEqual({ foo: "bar" });
    });

    it("should override default values", () => {
      const options: ConverterOptions = {
        extractLinks: false,
        extractHeaders: false,
      };

      const merged = mergeConverterOptions(options);

      expect(merged.extractLinks).toBe(false);
      expect(merged.extractHeaders).toBe(false);
    });
  });
});

// =============================================================================
// ConverterMetadata型のテスト
// =============================================================================

describe("ConverterMetadata", () => {
  it("should accept valid metadata", () => {
    const metadata: ConverterMetadata = {
      id: "plain-text-converter",
      name: "Plain Text Converter",
      description: "Converts plain text files",
      version: "1.0.0",
      supportedMimeTypes: ["text/plain"],
      priority: 0,
    };

    expect(metadata).toBeDefined();
    expect(metadata.id).toBe("plain-text-converter");
    expect(metadata.supportedMimeTypes).toHaveLength(1);
  });

  it("should accept multiple MIME types", () => {
    const metadata: ConverterMetadata = {
      id: "markdown-converter",
      name: "Markdown Converter",
      description: "Converts Markdown files",
      version: "1.1.0",
      supportedMimeTypes: ["text/markdown", "text/x-markdown"],
      priority: 10,
    };

    expect(metadata.supportedMimeTypes).toHaveLength(2);
    expect(metadata.supportedMimeTypes).toContain("text/markdown");
    expect(metadata.supportedMimeTypes).toContain("text/x-markdown");
  });

  it("should reject invalid metadata at compile time", () => {
    // @ts-expect-error - idが欠けている
    const _invalidMetadata1: ConverterMetadata = {
      name: "Test",
      description: "Test",
      version: "1.0.0",
      supportedMimeTypes: ["text/plain"],
      priority: 0,
    };

    // @ts-expect-error - supportedMimeTypesが空配列（制約違反）
    const _invalidMetadata2: ConverterMetadata = {
      id: "test",
      name: "Test",
      description: "Test",
      version: "1.0.0",
      supportedMimeTypes: [],
      priority: 0,
    };

    expect(true).toBe(true);
  });
});

// =============================================================================
// IConverter インターフェースのテスト
// =============================================================================

describe("IConverter interface", () => {
  // モックコンバーターを使用して、インターフェースの契約をテスト

  class MockConverter implements IConverter {
    readonly id = "mock-converter";
    readonly name = "Mock Converter";
    readonly supportedMimeTypes = ["text/plain"] as const;
    readonly priority = 0;

    canConvert(input: ConverterInput): boolean {
      return this.supportedMimeTypes.includes(input.mimeType as any);
    }

    async convert(
      _input: ConverterInput,
      _options?: ConverterOptions,
    ): Promise<Result<ConverterOutput, RAGError>> {
      // この時点では実装がないため、モック実装
      throw new Error("Not implemented - test should fail (Red state)");
    }

    estimateProcessingTime(_input: ConverterInput): number {
      return 10;
    }
  }

  it("should implement all required properties", () => {
    const converter = new MockConverter();

    expect(converter.id).toBeDefined();
    expect(converter.name).toBeDefined();
    expect(converter.supportedMimeTypes).toBeDefined();
    expect(converter.priority).toBeDefined();
  });

  it("should implement all required methods", () => {
    const converter = new MockConverter();

    expect(typeof converter.canConvert).toBe("function");
    expect(typeof converter.convert).toBe("function");
    expect(typeof converter.estimateProcessingTime).toBe("function");
  });

  it("should have correct method signatures", async () => {
    const converter = new MockConverter();

    const input: ConverterInput = {
      fileId: createFileId("test"),
      filePath: "/test.txt",
      mimeType: "text/plain",
      content: "Hello",
      encoding: "utf-8",
    };

    // canConvert はbooleanを返す
    const canConvert: boolean = converter.canConvert(input);
    expect(typeof canConvert).toBe("boolean");

    // estimateProcessingTime はnumberを返す
    const estimatedTime: number = converter.estimateProcessingTime(input);
    expect(typeof estimatedTime).toBe("number");

    // convert はPromise<Result<ConverterOutput, RAGError>>を返す
    // （実装がないため、このテストは失敗する - Red状態）
    await expect(converter.convert(input)).rejects.toThrow(
      "Not implemented - test should fail (Red state)",
    );
  });
});

// =============================================================================
// ExtractedMetadata型のテスト
// =============================================================================

describe("ExtractedMetadata", () => {
  it("should accept valid metadata", () => {
    const metadata: ExtractedMetadata = {
      title: "Document Title",
      author: "John Doe",
      language: "en",
      wordCount: 100,
      lineCount: 10,
      charCount: 500,
      headers: [
        { level: 1, text: "Main Title" },
        { level: 2, text: "Subtitle" },
      ],
      codeBlocks: 2,
      links: ["https://example.com", "https://test.org"],
      custom: {
        readingTime: 5,
        difficulty: "intermediate",
      },
    };

    expect(metadata).toBeDefined();
    expect(metadata.title).toBe("Document Title");
    expect(metadata.headers).toHaveLength(2);
    expect(metadata.links).toHaveLength(2);
  });

  it("should accept null title and author", () => {
    const metadata: ExtractedMetadata = {
      title: null,
      author: null,
      language: "ja",
      wordCount: 50,
      lineCount: 5,
      charCount: 250,
      headers: [],
      codeBlocks: 0,
      links: [],
      custom: {},
    };

    expect(metadata.title).toBeNull();
    expect(metadata.author).toBeNull();
  });

  it("should accept Japanese language", () => {
    const metadata: ExtractedMetadata = {
      title: "タイトル",
      author: null,
      language: "ja",
      wordCount: 100,
      lineCount: 10,
      charCount: 100,
      headers: [],
      codeBlocks: 0,
      links: [],
      custom: {},
    };

    expect(metadata.language).toBe("ja");
  });

  it("should reject invalid metadata at compile time", () => {
    // @ts-expect-error - languageが"ja"または"en"でない
    const _invalidMetadata: ExtractedMetadata = {
      title: "Test",
      author: null,
      language: "fr", // フランス語は未サポート
      wordCount: 0,
      lineCount: 0,
      charCount: 0,
      headers: [],
      codeBlocks: 0,
      links: [],
      custom: {},
    };

    expect(true).toBe(true);
  });
});

// =============================================================================
// ファクトリ関数のテスト
// =============================================================================

describe("createConverterInput()", () => {
  it("should create valid ConverterInput", () => {
    const result = createConverterInput({
      fileId: createFileId("test-123"),
      filePath: "/path/to/file.txt",
      mimeType: "text/plain",
      content: "Hello, World!",
      encoding: "utf-8",
    });

    // 現時点では実装がないため、このテストは失敗する（Red状態）
    expect(result).toBeDefined();
  });

  it("should create ConverterInput with metadata", () => {
    const result = createConverterInput({
      fileId: createFileId("test-456"),
      filePath: "/path/to/file.md",
      mimeType: "text/markdown",
      content: "# Title",
      encoding: "utf-8",
      metadata: { author: "Jane Doe" },
    });

    // 現時点では実装がないため、このテストは失敗する（Red状態）
    expect(result).toBeDefined();
  });
});

describe("createConverterOutput()", () => {
  it("should create valid ConverterOutput", () => {
    const metadata: ExtractedMetadata = {
      title: "Test",
      author: null,
      language: "en",
      wordCount: 1,
      lineCount: 1,
      charCount: 4,
      headers: [],
      codeBlocks: 0,
      links: [],
      custom: {},
    };

    const output = createConverterOutput("Test", metadata, 10.5);

    // 現時点では実装がないため、このテストは失敗する（Red状態）
    expect(output).toBeDefined();
    expect(output.convertedContent).toBe("Test");
    expect(output.processingTime).toBe(10.5);
  });
});

// =============================================================================
// イミュータビリティのテスト
// =============================================================================

describe("Immutability", () => {
  it("ConverterInput properties should be readonly", () => {
    const input: ConverterInput = {
      fileId: createFileId("test"),
      filePath: "/test.txt",
      mimeType: "text/plain",
      content: "Hello",
      encoding: "utf-8",
    };

    // @ts-expect-error - readonlyプロパティに代入できない
    input.fileId = createFileId("modified");

    // @ts-expect-error - readonlyプロパティに代入できない
    input.mimeType = "text/html";

    expect(true).toBe(true);
  });

  it("ConverterMetadata.supportedMimeTypes should be readonly array", () => {
    const metadata: ConverterMetadata = {
      id: "test",
      name: "Test",
      description: "Test",
      version: "1.0.0",
      supportedMimeTypes: ["text/plain"],
      priority: 0,
    };

    // @ts-expect-error - readonly配列に要素追加できない
    metadata.supportedMimeTypes.push("text/html");

    expect(true).toBe(true);
  });
});
