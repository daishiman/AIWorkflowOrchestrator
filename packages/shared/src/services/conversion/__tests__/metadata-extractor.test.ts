/**
 * MetadataExtractorのテスト
 *
 * @description テキストから適切にメタデータを抽出することを検証する
 */

import { describe, it, expect } from "vitest";
import { MetadataExtractor } from "../metadata-extractor";
import type { ConverterOptions } from "../types";

// =============================================================================
// タイトル抽出のテスト
// =============================================================================

describe("MetadataExtractor", () => {
  describe("extractTitle()", () => {
    it("should extract h1 heading as title", () => {
      const text = `
# Main Title
## Sub Title
### Another Title
`;

      const title = MetadataExtractor.extractTitle(text);

      // 現時点では実装がないため、このテストは失敗する（Red状態）
      expect(title).toBe("Main Title");
    });

    it("should extract first heading if no h1", () => {
      const text = `
## Sub Title
### Smaller Title
`;

      const title = MetadataExtractor.extractTitle(text);

      expect(title).toBe("Sub Title");
    });

    it("should return null if no headings", () => {
      const text = "Just plain text without any headings";

      const title = MetadataExtractor.extractTitle(text);

      expect(title).toBeNull();
    });

    it("should handle empty text", () => {
      const title = MetadataExtractor.extractTitle("");

      expect(title).toBeNull();
    });

    it("should handle Japanese headings", () => {
      const text = "# こんにちは世界\n## サブタイトル";

      const title = MetadataExtractor.extractTitle(text);

      expect(title).toBe("こんにちは世界");
    });
  });

  // ===========================================================================
  // 見出し抽出のテスト
  // ===========================================================================

  describe("extractHeaders()", () => {
    it("should extract all headings with levels", () => {
      const text = `
# H1 Heading
## H2 Heading
### H3 Heading
#### H4 Heading
##### H5 Heading
###### H6 Heading
`;

      const headers = MetadataExtractor.extractHeaders(text);

      expect(headers).toHaveLength(6);
      expect(headers[0]).toEqual({ level: 1, text: "H1 Heading" });
      expect(headers[1]).toEqual({ level: 2, text: "H2 Heading" });
      expect(headers[2]).toEqual({ level: 3, text: "H3 Heading" });
      expect(headers[3]).toEqual({ level: 4, text: "H4 Heading" });
      expect(headers[4]).toEqual({ level: 5, text: "H5 Heading" });
      expect(headers[5]).toEqual({ level: 6, text: "H6 Heading" });
    });

    it("should trim whitespace from heading text", () => {
      const text = "#   Title with spaces   ";

      const headers = MetadataExtractor.extractHeaders(text);

      expect(headers).toHaveLength(1);
      expect(headers[0].text).toBe("Title with spaces");
    });

    it("should ignore non-heading lines", () => {
      const text = `
# Valid Heading
This is not a heading
## Another Valid Heading
#Not a heading (no space after #)
`;

      const headers = MetadataExtractor.extractHeaders(text);

      expect(headers).toHaveLength(2);
      expect(headers[0].text).toBe("Valid Heading");
      expect(headers[1].text).toBe("Another Valid Heading");
    });

    it("should handle empty text", () => {
      const headers = MetadataExtractor.extractHeaders("");

      expect(headers).toHaveLength(0);
      expect(headers).toEqual([]);
    });

    it("should handle multiple headings with same level", () => {
      const text = `
## First H2
## Second H2
## Third H2
`;

      const headers = MetadataExtractor.extractHeaders(text);

      expect(headers).toHaveLength(3);
      expect(headers.every((h) => h.level === 2)).toBe(true);
    });
  });

  // ===========================================================================
  // リンク抽出のテスト
  // ===========================================================================

  describe("extractLinks()", () => {
    it("should extract HTTP URLs", () => {
      const text =
        "Visit https://example.com and http://test.org for more info";

      const links = MetadataExtractor.extractLinks(text);

      expect(links).toContain("https://example.com");
      expect(links).toContain("http://test.org");
    });

    it("should extract Markdown links", () => {
      const text = "[Google](https://google.com) and [Local](./file.md)";

      const links = MetadataExtractor.extractLinks(text);

      expect(links).toContain("https://google.com");
      expect(links).toContain("./file.md");
    });

    it("should remove duplicates", () => {
      const text = `
https://example.com
[Link](https://example.com)
https://example.com
`;

      const links = MetadataExtractor.extractLinks(text);

      expect(links).toHaveLength(1);
      expect(links[0]).toBe("https://example.com");
    });

    it("should sort links", () => {
      const text = `
https://zebra.com
https://apple.com
https://microsoft.com
`;

      const links = MetadataExtractor.extractLinks(text);

      expect(links).toEqual([
        "https://apple.com",
        "https://microsoft.com",
        "https://zebra.com",
      ]);
    });

    it("should handle text without links", () => {
      const text = "No links in this text";

      const links = MetadataExtractor.extractLinks(text);

      expect(links).toHaveLength(0);
      expect(links).toEqual([]);
    });

    it("should handle relative paths", () => {
      const text = "[Relative](./docs/readme.md) and [Absolute](/abs/path.md)";

      const links = MetadataExtractor.extractLinks(text);

      expect(links).toContain("./docs/readme.md");
      expect(links).toContain("/abs/path.md");
    });
  });

  // ===========================================================================
  // コードブロック検出のテスト
  // ===========================================================================

  describe("countCodeBlocks()", () => {
    it("should count code blocks", () => {
      const text = `
Text before

\`\`\`typescript
const x = 42;
\`\`\`

More text

\`\`\`python
print("hello")
\`\`\`
`;

      const count = MetadataExtractor.countCodeBlocks(text);

      expect(count).toBe(2);
    });

    it("should return 0 if no code blocks", () => {
      const text = "Just plain text without code";

      const count = MetadataExtractor.countCodeBlocks(text);

      expect(count).toBe(0);
    });

    it("should handle inline code separately", () => {
      const text = `
This has \`inline code\` but not a code block.
`;

      const count = MetadataExtractor.countCodeBlocks(text);

      expect(count).toBe(0);
    });

    it("should handle nested backticks", () => {
      const text = `
\`\`\`
Code with \`nested\` backticks
\`\`\`
`;

      const count = MetadataExtractor.countCodeBlocks(text);

      expect(count).toBe(1);
    });
  });

  // ===========================================================================
  // 言語検出のテスト
  // ===========================================================================

  describe("detectLanguage()", () => {
    it("should detect Japanese text", () => {
      const text = "これは日本語のテキストです。";

      const language = MetadataExtractor.detectLanguage(text);

      expect(language).toBe("ja");
    });

    it("should detect English text", () => {
      const text = "This is English text.";

      const language = MetadataExtractor.detectLanguage(text);

      expect(language).toBe("en");
    });

    it("should detect Japanese for mixed text", () => {
      const text = "Hello こんにちは World 世界";

      const language = MetadataExtractor.detectLanguage(text);

      expect(language).toBe("ja"); // 日本語文字が含まれればja
    });

    it("should detect hiragana", () => {
      const text = "ひらがなのみ";

      const language = MetadataExtractor.detectLanguage(text);

      expect(language).toBe("ja");
    });

    it("should detect katakana", () => {
      const text = "カタカナノミ";

      const language = MetadataExtractor.detectLanguage(text);

      expect(language).toBe("ja");
    });

    it("should detect kanji", () => {
      const text = "漢字のみ";

      const language = MetadataExtractor.detectLanguage(text);

      expect(language).toBe("ja");
    });

    it("should handle empty text", () => {
      const language = MetadataExtractor.detectLanguage("");

      expect(language).toBe("en"); // デフォルトは英語
    });
  });

  // ===========================================================================
  // 単語数カウントのテスト
  // ===========================================================================

  describe("countWords()", () => {
    it("should count English words", () => {
      const text = "Hello world from TypeScript";

      const count = MetadataExtractor.countWords(text);

      expect(count).toBe(4);
    });

    it("should count Japanese characters", () => {
      const text = "こんにちは世界";

      const count = MetadataExtractor.countWords(text);

      expect(count).toBe(7); // 日本語は文字数
    });

    it("should handle multiple spaces", () => {
      const text = "Hello    world    test";

      const count = MetadataExtractor.countWords(text);

      expect(count).toBe(3);
    });

    it("should handle newlines and tabs", () => {
      const text = "Hello\nworld\tfrom\r\nTypeScript";

      const count = MetadataExtractor.countWords(text);

      expect(count).toBe(4);
    });

    it("should handle empty text", () => {
      const count = MetadataExtractor.countWords("");

      expect(count).toBe(0);
    });

    it("should ignore whitespace in Japanese text", () => {
      const text = "これは  日本語  です";

      const count = MetadataExtractor.countWords(text);

      // 空白を除いた文字数（"これは日本語です" = 8文字）
      expect(count).toBe(8);
    });
  });

  // ===========================================================================
  // 行数カウントのテスト
  // ===========================================================================

  describe("countLines()", () => {
    it("should count lines", () => {
      const text = "Line 1\nLine 2\nLine 3";

      const count = MetadataExtractor.countLines(text);

      expect(count).toBe(3);
    });

    it("should count single line", () => {
      const text = "Single line";

      const count = MetadataExtractor.countLines(text);

      expect(count).toBe(1);
    });

    it("should return 0 for empty text", () => {
      const count = MetadataExtractor.countLines("");

      expect(count).toBe(0);
    });

    it("should handle Windows line endings", () => {
      const text = "Line 1\r\nLine 2\r\nLine 3";

      const count = MetadataExtractor.countLines(text);

      expect(count).toBeGreaterThan(0);
    });

    it("should handle trailing newline", () => {
      const text = "Line 1\nLine 2\n";

      const count = MetadataExtractor.countLines(text);

      expect(count).toBe(3); // 末尾の空行も含む
    });
  });

  // ===========================================================================
  // 統合テスト（extractFromText）
  // ===========================================================================

  describe("extractFromText()", () => {
    it("should extract all metadata", () => {
      const text = `
# Sample Document

This is a [link](https://example.com) to an external site.

Here's some code:

\`\`\`typescript
const x = 42;
\`\`\`

More text here.
`;

      const metadata = MetadataExtractor.extractFromText(text);

      expect(metadata.title).toBe("Sample Document");
      expect(metadata.language).toBe("en");
      expect(metadata.wordCount).toBeGreaterThan(0);
      expect(metadata.lineCount).toBeGreaterThan(0);
      expect(metadata.charCount).toBeGreaterThan(0);
      expect(metadata.headers).toHaveLength(1);
      expect(metadata.codeBlocks).toBe(1);
      expect(metadata.links).toContain("https://example.com");
    });

    it("should extract Japanese metadata", () => {
      const text = `
# こんにちは

これは日本語のサンプルドキュメントです。

## セクション1

本文がここにあります。
`;

      const metadata = MetadataExtractor.extractFromText(text);

      expect(metadata.title).toBe("こんにちは");
      expect(metadata.language).toBe("ja");
      expect(metadata.headers).toHaveLength(2);
      expect(metadata.headers[0]).toEqual({ level: 1, text: "こんにちは" });
      expect(metadata.headers[1]).toEqual({ level: 2, text: "セクション1" }); // h2なのでlevel 2
    });

    it("should respect extractHeaders option", () => {
      const text = "# Title\n## Subtitle";

      const options: ConverterOptions = {
        extractHeaders: false,
      };

      const metadata = MetadataExtractor.extractFromText(text, options);

      expect(metadata.headers).toEqual([]);
    });

    it("should respect extractLinks option", () => {
      const text = "Visit https://example.com for more info";

      const options: ConverterOptions = {
        extractLinks: false,
      };

      const metadata = MetadataExtractor.extractFromText(text, options);

      expect(metadata.links).toEqual([]);
    });

    it("should handle text with no metadata", () => {
      const text = "Plain text";

      const metadata = MetadataExtractor.extractFromText(text);

      expect(metadata.title).toBeNull();
      expect(metadata.author).toBeNull();
      expect(metadata.headers).toHaveLength(0);
      expect(metadata.codeBlocks).toBe(0);
      expect(metadata.links).toHaveLength(0);
      expect(metadata.wordCount).toBe(2);
      expect(metadata.lineCount).toBe(1);
      expect(metadata.charCount).toBe(10);
    });

    it("should set author to null (not extracted from text)", () => {
      const text = "Author: John Doe\n\nContent";

      const metadata = MetadataExtractor.extractFromText(text);

      expect(metadata.author).toBeNull();
    });

    it("should initialize custom as empty object", () => {
      const text = "Test";

      const metadata = MetadataExtractor.extractFromText(text);

      expect(metadata.custom).toEqual({});
    });
  });

  // ===========================================================================
  // ヘルパーメソッドのテスト
  // ===========================================================================

  describe("removeCodeBlocks()", () => {
    it("should remove code blocks", () => {
      const text = `
Text before

\`\`\`
code block
\`\`\`

Text after
`;

      const result = MetadataExtractor.removeCodeBlocks(text);

      expect(result).not.toContain("```");
      expect(result).not.toContain("code block");
      expect(result).toContain("Text before");
      expect(result).toContain("Text after");
    });

    it("should remove multiple code blocks", () => {
      const text = `
\`\`\`
block 1
\`\`\`

\`\`\`
block 2
\`\`\`
`;

      const result = MetadataExtractor.removeCodeBlocks(text);

      expect(result).not.toContain("block 1");
      expect(result).not.toContain("block 2");
    });

    it("should return trimmed result", () => {
      const text = `
\`\`\`
only code block
\`\`\`
`;

      const result = MetadataExtractor.removeCodeBlocks(text);

      expect(result).toBe("");
    });
  });

  describe("removeInlineCode()", () => {
    it("should remove inline code", () => {
      const text = "This has `inline code` in it";

      const result = MetadataExtractor.removeInlineCode(text);

      expect(result).toBe("This has  in it");
    });

    it("should remove multiple inline codes", () => {
      const text = "Use `const` or `let` for variables";

      const result = MetadataExtractor.removeInlineCode(text);

      expect(result).toBe("Use  or  for variables");
    });
  });

  describe("stripHeadingMarkers()", () => {
    it("should remove heading markers", () => {
      const text = `
# Heading 1
## Heading 2
### Heading 3
`;

      const result = MetadataExtractor.stripHeadingMarkers(text);

      expect(result).not.toContain("#");
      expect(result).toContain("Heading 1");
      expect(result).toContain("Heading 2");
      expect(result).toContain("Heading 3");
    });

    it("should preserve non-heading content", () => {
      const text = "Normal text\n# Heading\nMore text";

      const result = MetadataExtractor.stripHeadingMarkers(text);

      expect(result).toContain("Normal text");
      expect(result).toContain("Heading");
      expect(result).toContain("More text");
    });
  });

  // ===========================================================================
  // 境界値テスト
  // ===========================================================================

  describe("境界値テスト", () => {
    it("should handle very long text", () => {
      const text = "word ".repeat(10000); // 10,000単語

      const metadata = MetadataExtractor.extractFromText(text);

      expect(metadata.wordCount).toBe(10000);
      expect(metadata.charCount).toBe(text.length);
    });

    it("should handle text with only whitespace", () => {
      const text = "   \n\n\t\t   ";

      const metadata = MetadataExtractor.extractFromText(text);

      expect(metadata.title).toBeNull();
      expect(metadata.wordCount).toBe(0);
    });

    it("should handle single character", () => {
      const text = "a";

      const metadata = MetadataExtractor.extractFromText(text);

      expect(metadata.charCount).toBe(1);
      expect(metadata.lineCount).toBe(1);
      expect(metadata.wordCount).toBe(1);
    });

    it("should handle text with special Unicode characters", () => {
      const text = "Emoji 🎉 and symbols ☆★";

      const metadata = MetadataExtractor.extractFromText(text);

      expect(metadata.charCount).toBeGreaterThan(0);
      expect(metadata.language).toBe("en");
    });
  });

  // ===========================================================================
  // 実際のMarkdownドキュメントのテスト
  // ===========================================================================

  describe("実際のMarkdownドキュメント", () => {
    it("should extract metadata from typical README", () => {
      const text = `
# Project Name

A brief description of the project.

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

Visit [documentation](https://docs.example.com) for details.

## License

MIT
`;

      const metadata = MetadataExtractor.extractFromText(text);

      expect(metadata.title).toBe("Project Name");
      expect(metadata.language).toBe("en");
      expect(metadata.headers).toHaveLength(4);
      expect(metadata.codeBlocks).toBe(1);
      expect(metadata.links).toContain("https://docs.example.com");
      expect(metadata.wordCount).toBeGreaterThan(0);
    });

    it("should extract metadata from blog post", () => {
      const text = `
# How to Use TypeScript

TypeScript is a superset of JavaScript.

## Type Safety

Types help catch errors at compile time.

\`\`\`typescript
interface User {
  name: string;
  age: number;
}
\`\`\`

Learn more at [TypeScript website](https://www.typescriptlang.org).
`;

      const metadata = MetadataExtractor.extractFromText(text);

      expect(metadata.title).toBe("How to Use TypeScript");
      expect(metadata.headers).toHaveLength(2);
      expect(metadata.codeBlocks).toBe(1);
      expect(metadata.links).toHaveLength(1);
      expect(metadata.links[0]).toBe("https://www.typescriptlang.org");
    });
  });

  // ===========================================================================
  // パフォーマンステスト
  // ===========================================================================

  describe("パフォーマンス", () => {
    it("should handle large text efficiently", () => {
      const text = "word ".repeat(100000); // 100,000単語

      const start = Date.now();
      const metadata = MetadataExtractor.extractFromText(text);
      const elapsed = Date.now() - start;

      expect(metadata).toBeDefined();
      // 1秒以内に完了することを期待
      expect(elapsed).toBeLessThan(1000);
    });

    it("should handle many headings efficiently", () => {
      const headings = Array.from(
        { length: 1000 },
        (_, i) => `## Heading ${i}`,
      ).join("\n\n");

      const start = Date.now();
      const metadata = MetadataExtractor.extractFromText(headings);
      const elapsed = Date.now() - start;

      expect(metadata.headers).toHaveLength(1000);
      expect(elapsed).toBeLessThan(500);
    });
  });
});
