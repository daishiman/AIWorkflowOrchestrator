/**
 * @file MarkdownConverterのテスト
 * @module @repo/shared/services/conversion/converters/__tests__/markdown-converter.test
 * @description TDD Red フェーズ - 実装前のテスト作成
 */

import { describe, it, expect, beforeEach } from "vitest";
import { MarkdownConverter } from "../markdown-converter";
import type { ConverterInput } from "../../types";
import { createFileId } from "../../../../types/rag/branded";

describe("MarkdownConverter", () => {
  let converter: MarkdownConverter;

  beforeEach(() => {
    converter = new MarkdownConverter();
  });

  // ========================================
  // プロパティテスト
  // ========================================

  describe("properties", () => {
    it("should have correct id", () => {
      expect(converter.id).toBe("markdown-converter");
    });

    it("should have correct name", () => {
      expect(converter.name).toBe("Markdown Converter");
    });

    it("should support text/markdown mime type", () => {
      expect(converter.supportedMimeTypes).toContain("text/markdown");
    });

    it("should support text/x-markdown mime type", () => {
      expect(converter.supportedMimeTypes).toContain("text/x-markdown");
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
    it("should return true for text/markdown", () => {
      const input = createTestInput({
        mimeType: "text/markdown",
        content: "# Hello",
      });
      expect(converter.canConvert(input)).toBe(true);
    });

    it("should return true for text/x-markdown", () => {
      const input = createTestInput({
        mimeType: "text/x-markdown",
        content: "# Hello",
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
        content: "\uFEFF# Hello World",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).not.toContain("\uFEFF");
        expect(result.data.convertedContent).toContain("# Hello World");
      }
    });

    it("should normalize CRLF to LF", async () => {
      const input = createTestInput({
        content: "Line 1\r\nLine 2\r\nLine 3",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).not.toContain("\r\n");
        expect(result.data.convertedContent).toContain(
          "Line 1\nLine 2\nLine 3",
        );
      }
    });

    it("should normalize CR to LF", async () => {
      const input = createTestInput({
        content: "Line 1\rLine 2\rLine 3",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).not.toContain("\r");
        expect(result.data.convertedContent).toContain(
          "Line 1\nLine 2\nLine 3",
        );
      }
    });

    it("should limit consecutive blank lines to 2", async () => {
      const input = createTestInput({
        content: "Paragraph 1\n\n\n\n\nParagraph 2",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // 3行以上の連続空行は2行に削減
        expect(result.data.convertedContent).not.toMatch(/\n{3,}/);
        expect(result.data.convertedContent).toContain("Paragraph 1");
        expect(result.data.convertedContent).toContain("Paragraph 2");
      }
    });

    it("should remove trailing whitespace from lines", async () => {
      const input = createTestInput({
        content: "Line with trailing spaces   \nAnother line\t\t",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        const lines = result.data.convertedContent.split("\n");
        for (const line of lines) {
          expect(line).toBe(line.trimEnd());
        }
      }
    });

    it("should preserve code block content without modification", async () => {
      const codeContent =
        "  indented code\n    more indent\n\n\n\nmultiple blanks";
      const input = createTestInput({
        content: `# Title\n\n\`\`\`\n${codeContent}\n\`\`\`\n\nText after`,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // コードブロック内の内容は保持される
        expect(result.data.convertedContent).toContain("```");
        expect(result.data.convertedContent).toContain("indented code");
      }
    });
  });

  // ========================================
  // フロントマターテスト
  // ========================================

  describe("convert - frontmatter", () => {
    it("should remove YAML frontmatter", async () => {
      const input = createTestInput({
        content: "---\ntitle: Test\nauthor: John\n---\n# Actual Content",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).not.toContain("title: Test");
        expect(result.data.convertedContent).not.toContain("author: John");
        expect(result.data.convertedContent).toContain("# Actual Content");
      }
    });

    it("should set hasFrontmatter custom field when frontmatter exists", async () => {
      const input = createTestInput({
        content: "---\ntitle: Test\n---\n# Content",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.hasFrontmatter).toBe(true);
      }
    });

    it("should set hasFrontmatter to false when no frontmatter", async () => {
      const input = createTestInput({
        content: "# Content without frontmatter",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.hasFrontmatter).toBe(false);
      }
    });

    it("should not treat --- in middle of document as frontmatter", async () => {
      const input = createTestInput({
        content: "# Title\n\n---\n\nHorizontal rule above",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("# Title");
        expect(result.data.convertedContent).toContain("---");
        expect(result.data.extractedMetadata.custom.hasFrontmatter).toBe(false);
      }
    });
  });

  // ========================================
  // 見出し抽出テスト
  // ========================================

  describe("convert - header extraction", () => {
    it("should extract all header levels", async () => {
      const input = createTestInput({
        content: `# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6`,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.headers).toHaveLength(6);
        expect(result.data.extractedMetadata.headers).toEqual([
          { level: 1, text: "H1" },
          { level: 2, text: "H2" },
          { level: 3, text: "H3" },
          { level: 4, text: "H4" },
          { level: 5, text: "H5" },
          { level: 6, text: "H6" },
        ]);
      }
    });

    it("should extract headers with inline formatting", async () => {
      const input = createTestInput({
        content: "# **Bold** Header\n## *Italic* Header",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.headers).toEqual([
          { level: 1, text: "**Bold** Header" },
          { level: 2, text: "*Italic* Header" },
        ]);
      }
    });

    it("should not extract headers from code blocks", async () => {
      const input = createTestInput({
        content: "# Real Header\n\n```\n# Comment in code\n```",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // コードブロック内の # はヘッダーとして抽出されない
        expect(result.data.extractedMetadata.headers).toHaveLength(1);
        expect(result.data.extractedMetadata.headers[0]).toEqual({
          level: 1,
          text: "Real Header",
        });
      }
    });

    it("should set headerCount in custom field", async () => {
      const input = createTestInput({
        content: "# H1\n## H2\n## H2 again",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.headerCount).toBe(3);
      }
    });
  });

  // ========================================
  // タイトル抽出テスト
  // ========================================

  describe("convert - title extraction", () => {
    it("should extract first h1 as title", async () => {
      const input = createTestInput({
        content: "# Main Title\n## Subtitle\n# Another H1",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.title).toBe("Main Title");
      }
    });

    it("should return null title when no h1 exists", async () => {
      const input = createTestInput({
        content: "## Only H2\n### And H3",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.title).toBeNull();
      }
    });
  });

  // ========================================
  // リンク抽出テスト
  // ========================================

  describe("convert - link extraction", () => {
    it("should extract external URLs", async () => {
      const input = createTestInput({
        content: `
# Links
[Example](https://example.com)
[Google](http://google.com)
`,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.links).toContain(
          "https://example.com",
        );
        expect(result.data.extractedMetadata.links).toContain(
          "http://google.com",
        );
      }
    });

    it("should not extract relative URLs", async () => {
      const input = createTestInput({
        content: `
[Relative](./relative.md)
[Parent](../parent.md)
[Root](/root.md)
`,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.links).not.toContain(
          "./relative.md",
        );
        expect(result.data.extractedMetadata.links).not.toContain(
          "../parent.md",
        );
        expect(result.data.extractedMetadata.links).not.toContain("/root.md");
      }
    });

    it("should remove duplicate URLs", async () => {
      const input = createTestInput({
        content: `
[Link 1](https://example.com)
[Link 2](https://example.com)
[Link 3](https://example.com)
`,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        const count = result.data.extractedMetadata.links.filter(
          (link) => link === "https://example.com",
        ).length;
        expect(count).toBe(1);
      }
    });

    it("should handle no links", async () => {
      const input = createTestInput({
        content: "# No links here\n\nJust plain text.",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.links).toEqual([]);
      }
    });
  });

  // ========================================
  // コードブロックカウントテスト
  // ========================================

  describe("convert - code block counting", () => {
    it("should count code blocks correctly", async () => {
      const input = createTestInput({
        content: `
# Code Examples

\`\`\`javascript
const x = 1;
\`\`\`

Some text.

\`\`\`python
print("hello")
\`\`\`
`,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.codeBlocks).toBe(2);
      }
    });

    it("should return 0 for no code blocks", async () => {
      const input = createTestInput({
        content: "# No code\n\nJust text.",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.codeBlocks).toBe(0);
      }
    });

    it("should set hasCodeBlocks custom field", async () => {
      const input = createTestInput({
        content: "```\ncode\n```",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.hasCodeBlocks).toBe(true);
      }
    });
  });

  // ========================================
  // 言語検出テスト
  // ========================================

  describe("convert - language detection", () => {
    it("should detect Japanese when many Japanese characters exist", async () => {
      const input = createTestInput({
        content:
          "# 日本語のタイトル\n\nこれは日本語のテキストです。日本語の文章がたくさん含まれています。日本語の文字が100文字以上あると日本語として検出されます。日本語テキスト日本語テキスト。" +
          "さらに追加の日本語テキストを含めて、合計で100文字を超えるようにします。これで日本語として正しく検出されるはずです。",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.language).toBe("ja");
      }
    });

    it("should detect English when few Japanese characters exist", async () => {
      const input = createTestInput({
        content:
          "# English Title\n\nThis is an English document. It contains mostly English text with very few Japanese characters.",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.language).toBe("en");
      }
    });

    it("should use language hint from options", async () => {
      const input = createTestInput({
        content: "# Some content",
      });

      const result = await converter.convert(input, { language: "ja" });

      expect(result.success).toBe(true);
      if (result.success) {
        // オプションで指定された言語が使用される
        expect(result.data.extractedMetadata.language).toBe("ja");
      }
    });
  });

  // ========================================
  // ワードカウントテスト
  // ========================================

  describe("convert - word count", () => {
    it("should count words correctly", async () => {
      const input = createTestInput({
        content: "One two three four five",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.wordCount).toBe(5);
      }
    });

    it("should exclude code blocks from word count", async () => {
      const input = createTestInput({
        content: "One two three\n\n```\ncode block words\n```\n\nfour five",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // コードブロック内の words はカウントされない
        expect(result.data.extractedMetadata.wordCount).toBe(5);
      }
    });
  });

  // ========================================
  // 行数・文字数カウントテスト
  // ========================================

  describe("convert - line and character count", () => {
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
        content: "This is a very long content that should be trimmed.",
      });

      const result = await converter.convert(input, { maxContentLength: 20 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent.length).toBeLessThanOrEqual(20);
      }
    });

    it("should not trim when content is shorter than maxContentLength", async () => {
      const input = createTestInput({
        content: "Short",
      });

      const result = await converter.convert(input, { maxContentLength: 100 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBe("Short");
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
        expect(result.data.convertedContent).toBe("");
        expect(result.data.extractedMetadata.headers).toEqual([]);
        expect(result.data.extractedMetadata.title).toBeNull();
      }
    });

    it("should handle whitespace-only content", async () => {
      const input = createTestInput({
        content: "   \n\t  \n  ",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent.trim()).toBe("");
      }
    });

    it("should handle content with only headers", async () => {
      const input = createTestInput({
        content: "# H1\n## H2\n### H3",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.headers).toHaveLength(3);
      }
    });

    it("should handle very long content", async () => {
      const longContent = "# Title\n\n" + "Lorem ipsum. ".repeat(10000);
      const input = createTestInput({
        content: longContent,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent.length).toBeGreaterThan(0);
      }
    });

    it("should handle content with special characters", async () => {
      const input = createTestInput({
        content: "# Special chars: <>&\"'`",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("<>&\"'`");
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
        filePath: "/test.md",
        mimeType: "text/markdown",
        content: "# Test",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);
    });

    it("should fail with missing filePath", async () => {
      const input = {
        fileId: createFileId("test-id"),
        filePath: "",
        mimeType: "text/markdown",
        content: "# Test",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);
    });

    it("should fail with missing mimeType", async () => {
      const input = {
        fileId: createFileId("test-id"),
        filePath: "/test.md",
        mimeType: "",
        content: "# Test",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);
    });

    it("should fail with null content", async () => {
      const input = {
        fileId: createFileId("test-id"),
        filePath: "/test.md",
        mimeType: "text/markdown",
        content: null as unknown as string,
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);
    });
  });

  // ========================================
  // オプションテスト
  // ========================================

  describe("convert - options", () => {
    it("should respect extractHeaders option", async () => {
      const input = createTestInput({
        content: "# H1\n## H2",
      });

      const result = await converter.convert(input, { extractHeaders: false });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.headers).toEqual([]);
      }
    });

    it("should respect extractLinks option", async () => {
      const input = createTestInput({
        content: "[Link](https://example.com)",
      });

      const result = await converter.convert(input, { extractLinks: false });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.links).toEqual([]);
      }
    });
  });

  // ========================================
  // 処理時間テスト
  // ========================================

  describe("convert - processing time", () => {
    it("should return processing time greater than or equal to 0", async () => {
      const input = createTestInput({
        content: "# Test",
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
    filePath: "/path/to/test.md",
    mimeType: "text/markdown",
    content: "# Test Content\n\nThis is test content.",
    encoding: "utf-8",
    ...overrides,
  };
}
