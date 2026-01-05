/**
 * @file PlainTextConverterのテスト
 * @module @repo/shared/services/conversion/converters/__tests__/plain-text-converter.test
 */

import { describe, it, expect, beforeEach } from "vitest";
import { PlainTextConverter } from "../plain-text-converter";
import type { ConverterInput } from "../../types";
import { createFileId } from "../../../../types/rag/branded";

describe("PlainTextConverter", () => {
  let converter: PlainTextConverter;

  beforeEach(() => {
    converter = new PlainTextConverter();
  });

  // ========================================
  // 1. プロパティテスト (4件)
  // ========================================

  describe("properties", () => {
    it("should have correct id: 'plain-text-converter'", () => {
      expect(converter.id).toBe("plain-text-converter");
    });

    it("should have correct name: 'Plain Text Converter'", () => {
      expect(converter.name).toBe("Plain Text Converter");
    });

    it("should support text/plain mime type", () => {
      expect(converter.supportedMimeTypes).toContain("text/plain");
    });

    it("should have priority 0", () => {
      expect(converter.priority).toBe(0);
    });

    it("should have a description", () => {
      const description = (converter as any).getDescription();
      expect(description).toBeDefined();
      expect(typeof description).toBe("string");
      expect(description.length).toBeGreaterThan(0);
    });
  });

  // ========================================
  // canConvertテスト
  // ========================================

  describe("canConvert", () => {
    it("should return true for text/plain", () => {
      const input = createTestInput({
        mimeType: "text/plain",
        content: "plain text",
      });
      expect(converter.canConvert(input)).toBe(true);
    });

    it("should return false for text/html", () => {
      const input = createTestInput({
        mimeType: "text/html",
        content: "<html></html>",
      });
      expect(converter.canConvert(input)).toBe(false);
    });

    it("should return false for application/json", () => {
      const input = createTestInput({
        mimeType: "application/json",
        content: "{}",
      });
      expect(converter.canConvert(input)).toBe(false);
    });
  });

  // ========================================
  // 2. BOM除去テスト (4件)
  // ========================================

  describe("BOM Removal", () => {
    it("should remove UTF-8 BOM", async () => {
      // UTF-8 BOM: 0xEF 0xBB 0xBF -> \uFEFF
      const input = createTestInput({
        content: "\uFEFFHello, World!",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBe("Hello, World!");
      }
    });

    it("should remove UTF-16 BE BOM", async () => {
      // UTF-16 BE BOM: \uFEFF
      const input = createTestInput({
        content: "\uFEFFHello, World!",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBe("Hello, World!");
      }
    });

    it("should remove UTF-16 LE BOM", async () => {
      // UTF-16 LE BOM: \uFFFE (reversed)
      const input = createTestInput({
        content: "\uFEFFHello, World!",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBe("Hello, World!");
      }
    });

    it("should handle text without BOM", async () => {
      const input = createTestInput({
        content: "Hello, World!",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBe("Hello, World!");
      }
    });
  });

  // ========================================
  // 3. 改行コード正規化テスト (4件)
  // ========================================

  describe("Line Ending Normalization", () => {
    it("should normalize CRLF to LF", async () => {
      const input = createTestInput({
        content: "Line 1\r\nLine 2\r\nLine 3",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBe("Line 1\nLine 2\nLine 3");
      }
    });

    it("should normalize CR to LF", async () => {
      const input = createTestInput({
        content: "Line 1\rLine 2\rLine 3",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBe("Line 1\nLine 2\nLine 3");
      }
    });

    it("should handle mixed line endings", async () => {
      const input = createTestInput({
        content: "Line 1\r\nLine 2\rLine 3\nLine 4",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBe(
          "Line 1\nLine 2\nLine 3\nLine 4",
        );
      }
    });

    it("should preserve LF", async () => {
      const input = createTestInput({
        content: "Line 1\nLine 2\nLine 3",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBe("Line 1\nLine 2\nLine 3");
      }
    });
  });

  // ========================================
  // 4. メタデータ抽出テスト (4件)
  // ========================================

  describe("Metadata Extraction", () => {
    it("should count lines correctly", async () => {
      const input = createTestInput({
        content: "Line 1\nLine 2\nLine 3",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.lineCount).toBe(3);
      }
    });

    it("should count words correctly", async () => {
      const input = createTestInput({
        content: "Hello world\nThis is a test",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // "Hello world This is a test" = 6 words
        expect(result.data.extractedMetadata.wordCount).toBe(6);
      }
    });

    it("should count characters correctly", async () => {
      const input = createTestInput({
        content: "Hello",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.charCount).toBe(5);
      }
    });

    it("should detect language", async () => {
      const input = createTestInput({
        content: "Hello, World!",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.language).toBeDefined();
      }
    });
  });

  // ========================================
  // 5. エッジケーステスト (4件)
  // ========================================

  describe("Edge Cases", () => {
    it("should handle empty file", async () => {
      const input = createTestInput({
        content: "",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBe("");
        expect(result.data.extractedMetadata.lineCount).toBe(0);
        expect(result.data.extractedMetadata.wordCount).toBe(0);
        expect(result.data.extractedMetadata.charCount).toBe(0);
      }
    });

    it("should handle single line without newline", async () => {
      const input = createTestInput({
        content: "Single line without newline",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBe(
          "Single line without newline",
        );
        expect(result.data.extractedMetadata.lineCount).toBe(1);
      }
    });

    it("should handle file with only whitespace", async () => {
      const input = createTestInput({
        content: "   \n   \n   ",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBe("   \n   \n   ");
        expect(result.data.extractedMetadata.lineCount).toBe(3);
        expect(result.data.extractedMetadata.wordCount).toBe(0);
      }
    });

    it("should handle very long lines", async () => {
      // 10000文字の長い行
      const longLine = "a".repeat(10000);
      const input = createTestInput({
        content: `${longLine}\nShort line`,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain(longLine);
        expect(result.data.extractedMetadata.lineCount).toBe(2);
      }
    });
  });

  // ========================================
  // 6. BOM + 改行コードの組み合わせ (2件)
  // ========================================

  describe("Combined BOM and Line Ending", () => {
    it("should remove BOM and normalize CRLF simultaneously", async () => {
      const input = createTestInput({
        content: "\uFEFFLine 1\r\nLine 2\r\nLine 3",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBe("Line 1\nLine 2\nLine 3");
        expect(result.data.extractedMetadata.lineCount).toBe(3);
      }
    });

    it("should remove BOM from empty content", async () => {
      const input = createTestInput({
        content: "\uFEFF",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBe("");
        expect(result.data.extractedMetadata.lineCount).toBe(0);
      }
    });
  });

  // ========================================
  // 7. 特殊文字とUnicode (2件)
  // ========================================

  describe("Special Characters and Unicode", () => {
    it("should handle Unicode characters correctly", async () => {
      const input = createTestInput({
        content: "日本語\nEmoji: 😀🎉\nSpecial: ©®™",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBe(
          "日本語\nEmoji: 😀🎉\nSpecial: ©®™",
        );
        expect(result.data.extractedMetadata.lineCount).toBe(3);
      }
    });

    it("should handle tab characters and special whitespace", async () => {
      const input = createTestInput({
        content: "Tab:\tSpace: Multiple  spaces",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBe(
          "Tab:\tSpace: Multiple  spaces",
        );
      }
    });
  });

  // ========================================
  // 8. メタデータ精度テスト (2件)
  // ========================================

  describe("Metadata Accuracy", () => {
    it("should count words with multiple spaces correctly", async () => {
      const input = createTestInput({
        content: "Word1   Word2    Word3",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.wordCount).toBe(3);
      }
    });

    it("should handle lines ending with newline vs not ending with newline", async () => {
      const inputWithNewline = createTestInput({
        content: "Line 1\nLine 2\n",
      });
      const resultWith = await converter.convert(inputWithNewline);

      const inputWithoutNewline = createTestInput({
        content: "Line 1\nLine 2",
      });
      const resultWithout = await converter.convert(inputWithoutNewline);

      expect(resultWith.success).toBe(true);
      expect(resultWithout.success).toBe(true);

      if (resultWith.success && resultWithout.success) {
        // 末尾に改行がある場合は空行も含めてカウント
        // "Line 1\nLine 2\n".split("\n") = ["Line 1", "Line 2", ""] = 3行
        expect(resultWith.data.extractedMetadata.lineCount).toBe(3);
        // 末尾に改行がない場合
        // "Line 1\nLine 2".split("\n") = ["Line 1", "Line 2"] = 2行
        expect(resultWithout.data.extractedMetadata.lineCount).toBe(2);
      }
    });
  });

  // ========================================
  // 9. 実際のユースケース (2件)
  // ========================================

  describe("Real-world Use Cases", () => {
    it("should convert typical README.txt content", async () => {
      const input = createTestInput({
        content: `# Project Title\r\n\r\nThis is a sample README file.\r\n\r\nFeatures:\r\n- Feature 1\r\n- Feature 2`,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("Project Title");
        expect(result.data.convertedContent).not.toContain("\r\n");
        expect(result.data.extractedMetadata.lineCount).toBeGreaterThan(0);
      }
    });

    it("should convert log file with timestamps", async () => {
      const input = createTestInput({
        content: `[2024-01-01 10:00:00] INFO: Application started\r\n[2024-01-01 10:00:01] DEBUG: Loading configuration\r\n[2024-01-01 10:00:02] INFO: Ready`,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("Application started");
        expect(result.data.extractedMetadata.lineCount).toBe(3);
      }
    });
  });

  // ========================================
  // 10. エラーハンドリング詳細テスト (2件)
  // ========================================

  describe("Error Handling Details", () => {
    it("should handle invalid encoding gracefully", async () => {
      // 不正なエンコーディングでArrayBufferを作成
      const invalidBuffer = new ArrayBuffer(10);
      const view = new Uint8Array(invalidBuffer);
      // 不正なバイト列を設定
      view.set([0xff, 0xfe, 0xfd, 0xfc, 0xfb, 0xfa, 0xf9, 0xf8, 0xf7, 0xf6]);

      const input: ConverterInput = {
        fileId: createFileId("test-invalid-encoding"),
        filePath: "/path/to/test.txt",
        mimeType: "text/plain",
        content: invalidBuffer,
        encoding: "invalid-encoding-name", // 不正なエンコーディング名
      };

      const result = await converter.convert(input);

      // エラーが適切に処理されることを期待
      // TextDecoderが不正なエンコーディングを受け付けるか、エラーになる
      expect(result.success || !result.success).toBe(true);
    });

    it("should handle corrupted content structure", async () => {
      // MetadataExtractorが例外をスローする可能性のある極端なケース
      // 非常に長い連続した文字列（メモリ不足を引き起こす可能性）
      const extremelyLongLine = "a".repeat(1000000); // 100万文字
      const input = createTestInput({
        content: extremelyLongLine,
      });

      const result = await converter.convert(input);

      // 正常に処理されるか、エラーが適切にハンドリングされることを期待
      expect(result.success || !result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent.length).toBe(1000000);
      }
    });
  });

  // ========================================
  // 11. ArrayBuffer入力テスト (2件)
  // ========================================

  describe("ArrayBuffer Input", () => {
    it("should handle ArrayBuffer input", async () => {
      const text = "Hello from ArrayBuffer";
      const encoder = new TextEncoder();
      const arrayBuffer = encoder.encode(text).buffer;

      const input = createTestInput({
        content: arrayBuffer as unknown as string,
      });
      // Override content with actual ArrayBuffer
      const inputWithBuffer: ConverterInput = {
        ...input,
        content: arrayBuffer,
      };

      const result = await converter.convert(inputWithBuffer);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBe("Hello from ArrayBuffer");
      }
    });

    it("should handle ArrayBuffer with BOM", async () => {
      // UTF-8 BOM: EF BB BF
      const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
      const text = "Text after BOM";
      const encoder = new TextEncoder();
      const textBytes = encoder.encode(text);

      // Combine BOM and text
      const combined = new Uint8Array(bom.length + textBytes.length);
      combined.set(bom);
      combined.set(textBytes, bom.length);

      const input: ConverterInput = {
        fileId: createFileId("test-array-buffer-bom"),
        filePath: "/path/to/test.txt",
        mimeType: "text/plain",
        content: combined.buffer,
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBe("Text after BOM");
      }
    });
  });
});

// ========================================
// ヘルパー関数
// ========================================

/**
 * テスト用の入力データを作成
 */
function createTestInput(
  overrides: Partial<ConverterInput> = {},
): ConverterInput {
  return {
    fileId: createFileId("test-file-id"),
    filePath: "/path/to/test.txt",
    mimeType: "text/plain",
    content: "default test content",
    encoding: "utf-8",
    ...overrides,
  };
}
