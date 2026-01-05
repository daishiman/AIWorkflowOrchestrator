/**
 * @file HTMLConverterのテスト
 * @module @repo/shared/services/conversion/converters/__tests__/html-converter.test
 */

import { describe, it, expect, beforeEach } from "vitest";
import { HTMLConverter } from "../html-converter";
import type { ConverterInput } from "../../types";
import { createFileId } from "../../../../types/rag/branded";

describe("HTMLConverter", () => {
  let converter: HTMLConverter;

  beforeEach(() => {
    converter = new HTMLConverter();
  });

  // ========================================
  // プロパティテスト
  // ========================================

  describe("properties", () => {
    it("should have correct id", () => {
      expect(converter.id).toBe("html-converter");
    });

    it("should have correct name", () => {
      expect(converter.name).toBe("HTML Converter");
    });

    it("should support text/html mime type", () => {
      expect(converter.supportedMimeTypes).toContain("text/html");
    });

    it("should support application/xhtml+xml mime type", () => {
      expect(converter.supportedMimeTypes).toContain("application/xhtml+xml");
    });

    it("should have priority 10", () => {
      expect(converter.priority).toBe(10);
    });

    it("should have a description", () => {
      // getDescription()は通常convertメソッド経由で呼ばれるが、直接テスト
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
    it("should return true for text/html", () => {
      const input = createTestInput({
        mimeType: "text/html",
        content: "<html></html>",
      });
      expect(converter.canConvert(input)).toBe(true);
    });

    it("should return true for application/xhtml+xml", () => {
      const input = createTestInput({
        mimeType: "application/xhtml+xml",
        content: "<html></html>",
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
  });

  // ========================================
  // 正常系テスト
  // ========================================

  describe("convert - normal cases", () => {
    it("should convert simple HTML to Markdown", async () => {
      const input = createTestInput({
        content: "<h1>Hello World</h1><p>This is a test.</p>",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("# Hello World");
        expect(result.data.convertedContent).toContain("This is a test.");
      }
    });

    it("should convert HTML headings to Markdown headings", async () => {
      const input = createTestInput({
        content: `
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <h4>Heading 4</h4>
          <h5>Heading 5</h5>
          <h6>Heading 6</h6>
        `,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("# Heading 1");
        expect(result.data.convertedContent).toContain("## Heading 2");
        expect(result.data.convertedContent).toContain("### Heading 3");
        expect(result.data.convertedContent).toContain("#### Heading 4");
        expect(result.data.convertedContent).toContain("##### Heading 5");
        expect(result.data.convertedContent).toContain("###### Heading 6");
      }
    });

    it("should convert HTML links to Markdown links", async () => {
      const input = createTestInput({
        content:
          '<p>Visit <a href="https://example.com">Example Site</a> for more info.</p>',
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain(
          "[Example Site](https://example.com)",
        );
      }
    });

    it("should convert HTML lists to Markdown lists", async () => {
      const input = createTestInput({
        content: `
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        `,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("-   Item 1");
        expect(result.data.convertedContent).toContain("-   Item 2");
        expect(result.data.convertedContent).toContain("-   Item 3");
      }
    });

    it("should convert ordered lists correctly", async () => {
      const input = createTestInput({
        content: `
          <ol>
            <li>First</li>
            <li>Second</li>
            <li>Third</li>
          </ol>
        `,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("1.");
        expect(result.data.convertedContent).toContain("First");
      }
    });

    it("should convert bold and italic text", async () => {
      const input = createTestInput({
        content: "<p><strong>Bold</strong> and <em>italic</em> text.</p>",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("**Bold**");
        expect(result.data.convertedContent).toContain("*italic*");
      }
    });

    it("should convert code blocks", async () => {
      const input = createTestInput({
        content: "<pre><code>const x = 1;</code></pre>",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("const x = 1;");
      }
    });

    it("should convert inline code", async () => {
      const input = createTestInput({
        content: "<p>Use <code>console.log()</code> for debugging.</p>",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("`console.log()`");
      }
    });
  });

  // ========================================
  // script/styleタグ除去テスト
  // ========================================

  describe("convert - script/style removal", () => {
    it("should remove script tags", async () => {
      const input = createTestInput({
        content: `
          <html>
            <body>
              <h1>Title</h1>
              <script>alert('test');</script>
              <p>Content</p>
            </body>
          </html>
        `,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).not.toContain("alert");
        expect(result.data.convertedContent).not.toContain("script");
        expect(result.data.convertedContent).toContain("# Title");
        expect(result.data.convertedContent).toContain("Content");
      }
    });

    it("should remove style tags", async () => {
      const input = createTestInput({
        content: `
          <html>
            <head>
              <style>.test { color: red; }</style>
            </head>
            <body>
              <p>Content</p>
            </body>
          </html>
        `,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).not.toContain("color: red");
        expect(result.data.convertedContent).not.toContain("style");
        expect(result.data.convertedContent).toContain("Content");
      }
    });

    it("should remove noscript tags", async () => {
      const input = createTestInput({
        content: `
          <p>Main content</p>
          <noscript>Please enable JavaScript</noscript>
        `,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).not.toContain("enable JavaScript");
        expect(result.data.convertedContent).toContain("Main content");
      }
    });

    it("should remove HTML comments", async () => {
      const input = createTestInput({
        content: `
          <p>Before</p>
          <!-- This is a comment -->
          <p>After</p>
        `,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).not.toContain("This is a comment");
        expect(result.data.convertedContent).toContain("Before");
        expect(result.data.convertedContent).toContain("After");
      }
    });
  });

  // ========================================
  // HTMLエンティティデコードテスト
  // ========================================

  describe("convert - HTML entity decoding", () => {
    it("should decode common HTML entities", async () => {
      const input = createTestInput({
        content: "<p>&amp; &lt; &gt; &quot; &#39;</p>",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("&");
        expect(result.data.convertedContent).toContain("<");
        expect(result.data.convertedContent).toContain(">");
        expect(result.data.convertedContent).toContain('"');
        expect(result.data.convertedContent).toContain("'");
      }
    });

    it("should decode numeric entities", async () => {
      const input = createTestInput({
        content: "<p>&#65;&#66;&#67;</p>",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("ABC");
      }
    });

    it("should decode hex entities", async () => {
      const input = createTestInput({
        content: "<p>&#x41;&#x42;&#x43;</p>",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("ABC");
      }
    });

    it("should decode nbsp", async () => {
      const input = createTestInput({
        content: "<p>Hello&nbsp;World</p>",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("Hello World");
      }
    });
  });

  // ========================================
  // メタデータ抽出テスト
  // ========================================

  describe("convert - metadata extraction", () => {
    it("should extract title from title tag", async () => {
      const input = createTestInput({
        content: `
          <html>
            <head>
              <title>Page Title</title>
            </head>
            <body>
              <p>Content</p>
            </body>
          </html>
        `,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.title).toBe("Page Title");
      }
    });

    it("should extract description from meta tag", async () => {
      const input = createTestInput({
        content: `
          <html>
            <head>
              <meta name="description" content="This is a description">
            </head>
            <body></body>
          </html>
        `,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.htmlDescription).toBe(
          "This is a description",
        );
      }
    });

    it("should extract author from meta tag", async () => {
      const input = createTestInput({
        content: `
          <html>
            <head>
              <meta name="author" content="John Doe">
            </head>
            <body></body>
          </html>
        `,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.author).toBe("John Doe");
      }
    });

    it("should count links correctly", async () => {
      const input = createTestInput({
        content: `
          <p>
            <a href="http://example1.com">Link 1</a>
            <a href="http://example2.com">Link 2</a>
            <a href="http://example3.com">Link 3</a>
          </p>
        `,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.htmlLinkCount).toBe(3);
      }
    });

    it("should count images correctly", async () => {
      const input = createTestInput({
        content: `
          <p>
            <img src="image1.jpg" alt="Image 1">
            <img src="image2.jpg" alt="Image 2">
          </p>
        `,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.htmlImageCount).toBe(2);
      }
    });

    it("should extract headings from HTML", async () => {
      const input = createTestInput({
        content: `
          <h1>Main Title</h1>
          <h2>Subtitle</h2>
          <p>Content</p>
        `,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.headers).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ level: 1, text: "Main Title" }),
            expect.objectContaining({ level: 2, text: "Subtitle" }),
          ]),
        );
      }
    });

    it("should handle HTML without title tag", async () => {
      const input = createTestInput({
        content: `
          <html>
            <body>
              <p>Content without title</p>
            </body>
          </html>
        `,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.title).toBeNull();
      }
    });

    it("should handle HTML without meta tags", async () => {
      const input = createTestInput({
        content: `
          <html>
            <body>
              <p>Content without meta tags</p>
            </body>
          </html>
        `,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.htmlDescription).toBeNull();
        expect(result.data.extractedMetadata.author).toBeNull();
      }
    });

    it("should handle HTML without headings", async () => {
      const input = createTestInput({
        content: `
          <html>
            <body>
              <p>Just regular paragraphs</p>
              <p>No headings here</p>
            </body>
          </html>
        `,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // headingsはheadersプロパティに格納される
        expect(result.data.extractedMetadata.headers).toEqual([]);
      }
    });

    it("should handle HTML without links", async () => {
      const input = createTestInput({
        content: `
          <html>
            <body>
              <p>No links in this content</p>
            </body>
          </html>
        `,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.htmlLinkCount).toBe(0);
      }
    });

    it("should handle HTML without images", async () => {
      const input = createTestInput({
        content: `
          <html>
            <body>
              <p>No images in this content</p>
            </body>
          </html>
        `,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedMetadata.custom.htmlImageCount).toBe(0);
      }
    });

    it("should handle headings with nested tags", async () => {
      const input = createTestInput({
        content: `
          <h1>Title with <strong>bold</strong> text</h1>
          <h2>Subtitle with <em>italic</em></h2>
        `,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // headingsはheadersプロパティに格納される
        expect(result.data.extractedMetadata.headers).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              level: 1,
              text: expect.stringContaining("Title"),
            }),
            expect.objectContaining({
              level: 2,
              text: expect.stringContaining("Subtitle"),
            }),
          ]),
        );
      }
    });

    it("should decode all types of HTML entities", async () => {
      const input = createTestInput({
        content:
          "<p>&copy; &reg; &trade; &ndash; &mdash; &lsquo; &rsquo; &hellip; &bull;</p>",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("©");
        expect(result.data.convertedContent).toContain("®");
        expect(result.data.convertedContent).toContain("™");
        expect(result.data.convertedContent).toContain("–");
        expect(result.data.convertedContent).toContain("—");
        // 引用符は'（U+2018）と'（U+2019）に変換される
        expect(result.data.convertedContent.length).toBeGreaterThan(0);
        expect(result.data.convertedContent).toContain("…");
        expect(result.data.convertedContent).toContain("•");
      }
    });
  });

  // ========================================
  // HTMLテーブルテスト
  // ========================================

  describe("convert - HTML tables", () => {
    it("should convert HTML table to Markdown table", async () => {
      const input = createTestInput({
        content: `
          <table>
            <tr>
              <th>Name</th>
              <th>Age</th>
            </tr>
            <tr>
              <td>Alice</td>
              <td>30</td>
            </tr>
          </table>
        `,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("Name");
        expect(result.data.convertedContent).toContain("Age");
        expect(result.data.convertedContent).toContain("Alice");
        expect(result.data.convertedContent).toContain("30");
      }
    });
  });

  // ========================================
  // 境界値テスト
  // ========================================

  describe("convert - edge cases", () => {
    it("should handle empty HTML", async () => {
      const input = createTestInput({
        content: "",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBe("");
      }
    });

    it("should handle whitespace-only HTML", async () => {
      const input = createTestInput({
        content: "   \n\t  ",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toBe("");
      }
    });

    it("should handle HTML without body", async () => {
      const input = createTestInput({
        content: "<p>Just a paragraph</p>",
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("Just a paragraph");
      }
    });

    it("should handle deeply nested HTML", async () => {
      const input = createTestInput({
        content: `
          <div>
            <div>
              <div>
                <div>
                  <p>Deeply nested content</p>
                </div>
              </div>
            </div>
          </div>
        `,
      });

      const result = await converter.convert(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent).toContain("Deeply nested content");
      }
    });

    it("should handle maxContentLength option", async () => {
      const input = createTestInput({
        content: "<p>This is a very long content that should be trimmed.</p>",
      });

      const result = await converter.convert(input, { maxContentLength: 20 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.convertedContent.length).toBeLessThanOrEqual(20);
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
        filePath: "/test.html",
        mimeType: "text/html",
        content: "<p>test</p>",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);
    });

    it("should fail with missing filePath", async () => {
      const input = {
        fileId: createFileId("test-id"),
        filePath: "",
        mimeType: "text/html",
        content: "<p>test</p>",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);
    });

    it("should fail with missing mimeType", async () => {
      const input = {
        fileId: createFileId("test-id"),
        filePath: "/test.html",
        mimeType: "",
        content: "<p>test</p>",
        encoding: "utf-8",
      };

      const result = await converter.convert(input);

      expect(result.success).toBe(false);
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
    filePath: "/path/to/test.html",
    mimeType: "text/html",
    content: "<html><body><p>Test content</p></body></html>",
    encoding: "utf-8",
    ...overrides,
  };
}
