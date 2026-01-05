/**
 * @file YAMLConverterのテスト
 * @module @repo/shared/services/conversion/converters/__tests__/yaml-converter.test
 * @description TDD Red フェーズ - 実装前のテスト作成
 */

import { describe, it, expect, beforeEach } from "vitest";
import { YAMLConverter } from "../yaml-converter";
import type { ConverterInput } from "../../types";
import { createFileId } from "../../../../types/rag/branded";

describe("YAMLConverter", () => {
  let converter: YAMLConverter;

  beforeEach(() => {
    converter = new YAMLConverter();
  });

  // ========================================
  // プロパティテスト
  // ========================================

  describe("properties", () => {
    it("should have correct id", () => {
      expect(converter.id).toBe("yaml-converter");
    });

    it("should have correct name", () => {
      expect(converter.name).toBe("YAML Converter");
    });

    it("should support application/x-yaml mime type", () => {
      expect(converter.supportedMimeTypes).toContain("application/x-yaml");
    });

    it("should support text/yaml mime type", () => {
      expect(converter.supportedMimeTypes).toContain("text/yaml");
    });

    it("should support text/x-yaml mime type", () => {
      expect(converter.supportedMimeTypes).toContain("text/x-yaml");
    });

    it("should have priority 10", () => {
      expect(converter.priority).toBe(10);
    });

    it("should have a description", () => {
      const metadata = converter.getMetadata();
      expect(metadata.description).toBeDefined();
      expect(typeof metadata.description).toBe("string");
      expect(metadata.description.length).toBeGreaterThan(0);
    });
  });

  // ========================================
  // canConvertテスト
  // ========================================

  describe("canConvert", () => {
    it("should return true for application/x-yaml", () => {
      const input = createTestInput({
        mimeType: "application/x-yaml",
        content: "name: test",
      });
      expect(converter.canConvert(input)).toBe(true);
    });

    it("should return true for text/yaml", () => {
      const input = createTestInput({
        mimeType: "text/yaml",
        content: "name: test",
      });
      expect(converter.canConvert(input)).toBe(true);
    });

    it("should return true for text/x-yaml", () => {
      const input = createTestInput({
        mimeType: "text/x-yaml",
        content: "name: test",
      });
      expect(converter.canConvert(input)).toBe(true);
    });

    it("should return false for text/plain", () => {
      const input = createTestInput({
        mimeType: "text/plain",
        content: "plain text",
      });
      expect(converter.canConvert(input)).toBe(false);
    });

    it("should return false for text/html", () => {
      const input = createTestInput({
        mimeType: "text/html",
        content: "<html></html>",
      });
      expect(converter.canConvert(input)).toBe(false);
    });
  });

  // ========================================
  // 正規化テスト
  // ========================================

  describe("convert - normalization", () => {
    it("should remove BOM from content", async () => {
      const input = createTestInput({
        content: "\uFEFFname: test",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).not.toContain("\uFEFF");
      }
    });

    it("should normalize CRLF to LF", async () => {
      const input = createTestInput({
        content: "key1: value1\r\nkey2: value2",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).not.toContain("\r\n");
      }
    });

    it("should remove trailing whitespace from lines", async () => {
      const input = createTestInput({
        content: "key1: value1   \nkey2: value2\t\t",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // YAML Contentセクション内のYAMLの各行は末尾空白が除去されている
        const yamlContent = result.data.convertedContent
          .split("```yaml")[1]
          ?.split("```")[0];
        if (yamlContent) {
          const lines = yamlContent.split("\n").filter((l) => l.trim());
          for (const line of lines) {
            expect(line).toBe(line.trimEnd());
          }
        }
      }
    });

    it("should limit consecutive blank lines to 2", async () => {
      const input = createTestInput({
        content: "key1: value1\n\n\n\n\nkey2: value2",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // 3行以上の連続空行は2行に削減
        expect(result.data.convertedContent).not.toMatch(/\n{4,}/);
      }
    });
  });

  // ========================================
  // YAML構造抽出テスト - トップレベルキー
  // ========================================

  describe("convert - top-level key extraction", () => {
    it("should extract single top-level key", async () => {
      const input = createTestInput({
        content: "name: test",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.topLevelKeys).toContain(
          "name",
        );
      }
    });

    it("should extract multiple top-level keys", async () => {
      const input = createTestInput({
        content: "name: test\nversion: 1.0\nauthor: John",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.topLevelKeys).toEqual([
          "name",
          "version",
          "author",
        ]);
      }
    });

    it("should not extract nested keys as top-level", async () => {
      const input = createTestInput({
        content: "parent:\n  child: value\n  another: value",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.topLevelKeys).toEqual([
          "parent",
        ]);
        expect(result.data.extractedMetadata.custom.topLevelKeys).not.toContain(
          "child",
        );
        expect(result.data.extractedMetadata.custom.topLevelKeys).not.toContain(
          "another",
        );
      }
    });

    it("should extract keys with underscores and hyphens", async () => {
      const input = createTestInput({
        content: "api_version: 1\nbase-url: http://example.com",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.topLevelKeys).toContain(
          "api_version",
        );
        expect(result.data.extractedMetadata.custom.topLevelKeys).toContain(
          "base-url",
        );
      }
    });
  });

  // ========================================
  // YAML構造抽出テスト - コメント検出
  // ========================================

  describe("convert - comment detection", () => {
    it("should detect comments at line start", async () => {
      const input = createTestInput({
        content: "# This is a comment\nname: test",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.hasComments).toBe(true);
      }
    });

    it("should detect inline comments", async () => {
      const input = createTestInput({
        content: "name: test # inline comment",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.hasComments).toBe(true);
      }
    });

    it("should return false when no comments", async () => {
      const input = createTestInput({
        content: "name: test\nversion: 1.0",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.hasComments).toBe(false);
      }
    });
  });

  // ========================================
  // YAML構造抽出テスト - インデント深さ
  // ========================================

  describe("convert - indent depth detection", () => {
    it("should return 0 for flat YAML", async () => {
      const input = createTestInput({
        content: "name: test\nversion: 1.0",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.maxIndentDepth).toBe(0);
      }
    });

    it("should detect 2-space indent", async () => {
      const input = createTestInput({
        content: "parent:\n  child: value",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.maxIndentDepth).toBe(2);
      }
    });

    it("should detect 4-space indent", async () => {
      const input = createTestInput({
        content: "parent:\n  child:\n    grandchild: value",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.maxIndentDepth).toBe(4);
      }
    });

    it("should detect tab indentation", async () => {
      const input = createTestInput({
        content: "parent:\n\tchild: value",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.maxIndentDepth).toBe(1);
      }
    });

    it("should detect maximum indent in complex structure", async () => {
      const input = createTestInput({
        content: `
root:
  level1:
    level2:
      level3:
        level4: value
  another: value
`,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.maxIndentDepth).toBe(8);
      }
    });
  });

  // ========================================
  // YAML構造抽出テスト - 行数カウント
  // ========================================

  describe("convert - line counting", () => {
    it("should count non-empty lines", async () => {
      const input = createTestInput({
        content: "name: test\nversion: 1.0",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.totalLines).toBe(2);
      }
    });

    it("should exclude empty lines from totalLines count", async () => {
      const input = createTestInput({
        content: "name: test\n\n\nversion: 1.0",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.totalLines).toBe(2);
      }
    });
  });

  // ========================================
  // Markdown形式出力テスト
  // ========================================

  describe("convert - Markdown output format", () => {
    it("should format output with YAML Structure section", async () => {
      const input = createTestInput({
        content: "name: test\nversion: 1.0",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("## YAML Structure");
        expect(result.data.convertedContent).toContain("**Top-level keys**");
        expect(result.data.convertedContent).toContain("name, version");
      }
    });

    it("should show has comments status", async () => {
      const input = createTestInput({
        content: "# Comment\nname: test",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("**Has comments**: Yes");
      }
    });

    it("should show no comments status", async () => {
      const input = createTestInput({
        content: "name: test",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("**Has comments**: No");
      }
    });

    it("should show max indent depth", async () => {
      const input = createTestInput({
        content: "parent:\n  child: value",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain(
          "**Max indent depth**: 2 spaces",
        );
      }
    });

    it("should show total lines", async () => {
      const input = createTestInput({
        content: "name: test\nversion: 1.0",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("**Total lines**: 2");
      }
    });

    it("should format output with YAML Content section", async () => {
      const input = createTestInput({
        content: "name: test",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("## YAML Content");
        expect(result.data.convertedContent).toContain("```yaml");
        expect(result.data.convertedContent).toContain("name: test");
        expect(result.data.convertedContent).toContain("```");
      }
    });

    it("should show None when no top-level keys", async () => {
      const input = createTestInput({
        content: "# Comment only",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain(
          "**Top-level keys**: None",
        );
      }
    });
  });

  // ========================================
  // メタデータテスト
  // ========================================

  describe("convert - metadata", () => {
    it("should set title to null", async () => {
      const input = createTestInput({
        content: "name: test",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.title).toBeNull();
      }
    });

    it("should set author to null", async () => {
      const input = createTestInput({
        content: "name: test",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.author).toBeNull();
      }
    });

    it("should set language to ja by default", async () => {
      const input = createTestInput({
        content: "name: test",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.language).toBe("ja");
      }
    });

    it("should use language option when provided", async () => {
      const input = createTestInput({
        content: "name: test",
      });

      const result = await converter.convert(input, { language: "en" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.language).toBe("en");
      }
    });

    it("should set headers to empty array", async () => {
      const input = createTestInput({
        content: "name: test",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.headers).toEqual([]);
      }
    });

    it("should set codeBlocks to 1", async () => {
      const input = createTestInput({
        content: "name: test",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.codeBlocks).toBe(1);
      }
    });

    it("should set links to empty array", async () => {
      const input = createTestInput({
        content: "name: test",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.links).toEqual([]);
      }
    });

    it("should count words correctly", async () => {
      const input = createTestInput({
        content: "name: test value",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.wordCount).toBeGreaterThan(0);
      }
    });

    it("should count lines correctly", async () => {
      const input = createTestInput({
        content: "line1: value1\nline2: value2\nline3: value3",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.lineCount).toBe(3);
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
  });

  // ========================================
  // maxContentLength テスト
  // ========================================

  describe("convert - maxContentLength", () => {
    it("should trim content to maxContentLength", async () => {
      const input = createTestInput({
        content: "key: " + "x".repeat(1000),
      });

      const result = await converter.convert(input, { maxContentLength: 50 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent.length).toBeLessThanOrEqual(50);
      }
    });

    it("should not trim when content is shorter than maxContentLength", async () => {
      const input = createTestInput({
        content: "name: test",
      });

      const result = await converter.convert(input, { maxContentLength: 1000 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("name: test");
      }
    });
  });

  // ========================================
  // エッジケーステスト
  // ========================================

  describe("convert - edge cases", () => {
    it("should handle empty content", async () => {
      const input = createTestInput({
        content: "",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.topLevelKeys).toEqual([]);
        expect(result.data.extractedMetadata.custom.totalLines).toBe(0);
      }
    });

    it("should handle whitespace-only content", async () => {
      const input = createTestInput({
        content: "   \n\t  \n  ",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.topLevelKeys).toEqual([]);
      }
    });

    it("should handle comment-only content", async () => {
      const input = createTestInput({
        content: "# Comment 1\n# Comment 2",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.hasComments).toBe(true);
        expect(result.data.extractedMetadata.custom.topLevelKeys).toEqual([]);
      }
    });

    it("should handle list structure", async () => {
      const input = createTestInput({
        content: "items:\n  - item1\n  - item2\n  - item3",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.topLevelKeys).toEqual([
          "items",
        ]);
      }
    });

    it("should handle multiline string", async () => {
      const input = createTestInput({
        content: "text: |\n  line1\n  line2\n  line3",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.topLevelKeys).toEqual([
          "text",
        ]);
      }
    });

    it("should handle mixed indent styles", async () => {
      const input = createTestInput({
        content: "parent:\n  child1: value\n\tchild2: value",
      });

      const result = await converter.convert(input);

      // タブとスペース混在でも処理は継続
      expect(result.success).toBe(true);
    });

    it("should handle very long YAML", async () => {
      const lines = Array.from(
        { length: 1000 },
        (_, i) => `key${i}: value${i}`,
      ).join("\n");
      const input = createTestInput({
        content: lines,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.topLevelKeys.length).toBe(
          1000,
        );
      }
    });
  });

  // ========================================
  // 異常系テスト
  // ========================================

  describe("convert - error cases", () => {
    it("should fail with missing fileId", async () => {
      const input = {
        fileId: "" as unknown as ReturnType<typeof createFileId>,
        filePath: "/test.yaml",
        mimeType: "application/x-yaml",
        content: "name: test",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);
    });

    it("should fail with missing filePath", async () => {
      const input = {
        fileId: createFileId("test-id"),
        filePath: "",
        mimeType: "application/x-yaml",
        content: "name: test",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);
    });

    it("should fail with missing mimeType", async () => {
      const input = {
        fileId: createFileId("test-id"),
        filePath: "/test.yaml",
        mimeType: "",
        content: "name: test",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);
    });

    it("should fail with null content", async () => {
      const input = {
        fileId: createFileId("test-id"),
        filePath: "/test.yaml",
        mimeType: "application/x-yaml",
        content: null as unknown as string,
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);
    });
  });

  // ========================================
  // 処理時間テスト
  // ========================================

  describe("convert - processing time", () => {
    it("should return processing time greater than or equal to 0", async () => {
      const input = createTestInput({
        content: "name: test",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.processingTime).toBeGreaterThanOrEqual(0);
      }
    });
  });
});

// ========================================
// ヘルパー関数
// ========================================

/**
 * テスト用のConverterInputを作成
 */
function createTestInput(
  overrides: Partial<ConverterInput> = {},
): ConverterInput {
  return {
    fileId: createFileId("test-file-id"),
    filePath: "/path/to/test.yaml",
    mimeType: "application/x-yaml",
    content: "name: test\nversion: 1.0",
    encoding: "utf-8",
    ...overrides,
  };
}
