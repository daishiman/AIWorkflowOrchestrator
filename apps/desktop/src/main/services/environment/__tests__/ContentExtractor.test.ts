import { describe, it, expect, beforeEach } from "vitest";
import { ContentExtractor } from "../ContentExtractor";

describe("ContentExtractor", () => {
  let extractor: ContentExtractor;

  beforeEach(() => {
    extractor = new ContentExtractor();
  });

  describe("extractCodeBlocks", () => {
    it("should extract html code block", () => {
      const text = `
Some text
\`\`\`html
<div>Hello World</div>
\`\`\`
More text
`;
      const result = extractor.extractCodeBlocks(text);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("html");
      expect(result[0].content).toBe("<div>Hello World</div>");
      expect(result[0].language).toBe("html");
      expect(result[0].order).toBe(0);
    });

    it("should extract markdown code block", () => {
      const text = `
\`\`\`markdown
# Heading
\`\`\`
`;
      const result = extractor.extractCodeBlocks(text);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("markdown");
    });

    it("should extract multiple code blocks with order", () => {
      const text = `
\`\`\`html
<div>First</div>
\`\`\`
\`\`\`css
.class { color: red; }
\`\`\`
\`\`\`html
<div>Second</div>
\`\`\`
`;
      const result = extractor.extractCodeBlocks(text);
      expect(result).toHaveLength(3);
      expect(result[0].order).toBe(0);
      expect(result[1].order).toBe(1);
      expect(result[2].order).toBe(2);
    });

    it("should handle code blocks without language", () => {
      const text = `
\`\`\`
plain text
\`\`\`
`;
      const result = extractor.extractCodeBlocks(text);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("text");
    });

    it("should return empty array for text without code blocks", () => {
      const text = "No code blocks here";
      const result = extractor.extractCodeBlocks(text);
      expect(result).toHaveLength(0);
    });

    it("should detect content type correctly", () => {
      const text = `
\`\`\`js
console.log('hello');
\`\`\`
`;
      const result = extractor.extractCodeBlocks(text);
      expect(result[0].type).toBe("javascript");
    });

    it("should detect css content type", () => {
      const text = `
\`\`\`css
.class { color: red; }
\`\`\`
`;
      const result = extractor.extractCodeBlocks(text);
      expect(result[0].type).toBe("css");
    });

    it("should handle htm as html", () => {
      const text = `
\`\`\`htm
<div>Hello</div>
\`\`\`
`;
      const result = extractor.extractCodeBlocks(text);
      expect(result[0].type).toBe("html");
    });

    it("should handle md as markdown", () => {
      const text = `
\`\`\`md
# Heading
\`\`\`
`;
      const result = extractor.extractCodeBlocks(text);
      expect(result[0].type).toBe("markdown");
    });

    it("should generate unique ids for each content", () => {
      const text = `
\`\`\`html
<div>First</div>
\`\`\`
\`\`\`html
<div>Second</div>
\`\`\`
`;
      const result = extractor.extractCodeBlocks(text);
      expect(result[0].id).not.toBe(result[1].id);
    });

    it("should set extractedAt timestamp", () => {
      const text = `
\`\`\`html
<div>Hello</div>
\`\`\`
`;
      const before = new Date();
      const result = extractor.extractCodeBlocks(text);
      const after = new Date();

      expect(result[0].extractedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(result[0].extractedAt.getTime()).toBeLessThanOrEqual(
        after.getTime(),
      );
    });
  });

  describe("getPreviewableContent", () => {
    it("should return last html/markdown block", () => {
      const contents = [
        {
          id: "1",
          type: "css" as const,
          content: "",
          order: 0,
          extractedAt: new Date(),
        },
        {
          id: "2",
          type: "html" as const,
          content: "",
          order: 1,
          extractedAt: new Date(),
        },
        {
          id: "3",
          type: "javascript" as const,
          content: "",
          order: 2,
          extractedAt: new Date(),
        },
        {
          id: "4",
          type: "html" as const,
          content: "",
          order: 3,
          extractedAt: new Date(),
        },
      ];
      const result = extractor.getPreviewableContent(contents);
      expect(result?.id).toBe("4");
    });

    it("should return null if no previewable content", () => {
      const contents = [
        {
          id: "1",
          type: "css" as const,
          content: "",
          order: 0,
          extractedAt: new Date(),
        },
      ];
      const result = extractor.getPreviewableContent(contents);
      expect(result).toBeNull();
    });

    it("should return markdown as previewable", () => {
      const contents = [
        {
          id: "1",
          type: "markdown" as const,
          content: "# Heading",
          order: 0,
          extractedAt: new Date(),
        },
      ];
      const result = extractor.getPreviewableContent(contents);
      expect(result?.id).toBe("1");
    });

    it("should return null for empty array", () => {
      const result = extractor.getPreviewableContent([]);
      expect(result).toBeNull();
    });
  });

  describe("edge cases", () => {
    it("should handle nested code blocks (triple backticks inside)", () => {
      const text = `
\`\`\`html
<pre>\`\`\`code\`\`\`</pre>
\`\`\`
`;
      const result = extractor.extractCodeBlocks(text);
      expect(result).toHaveLength(1);
      expect(result[0].content).toContain("<pre>");
    });

    it("should handle very long code blocks", () => {
      const longContent = "a".repeat(100000);
      const text = `\`\`\`html\n${longContent}\n\`\`\``;
      const result = extractor.extractCodeBlocks(text);
      expect(result).toHaveLength(1);
      expect(result[0].content.length).toBe(100000);
    });

    it("should handle empty code blocks", () => {
      const text = `\`\`\`html\n\n\`\`\``;
      const result = extractor.extractCodeBlocks(text);
      expect(result).toHaveLength(1);
      expect(result[0].content).toBe("");
    });

    it("should handle code blocks with only whitespace", () => {
      const text = `\`\`\`html\n   \n\`\`\``;
      const result = extractor.extractCodeBlocks(text);
      expect(result).toHaveLength(1);
      expect(result[0].content).toBe("");
    });

    it("should handle unicode content in code blocks", () => {
      const text = `\`\`\`html\n<div>こんにちは世界 🌍</div>\n\`\`\``;
      const result = extractor.extractCodeBlocks(text);
      expect(result).toHaveLength(1);
      expect(result[0].content).toContain("こんにちは世界");
      expect(result[0].content).toContain("🌍");
    });

    it("should handle special characters in code blocks", () => {
      const text = `\`\`\`html\n<div data-attr="test&amp;value">Content</div>\n\`\`\``;
      const result = extractor.extractCodeBlocks(text);
      expect(result).toHaveLength(1);
      expect(result[0].content).toContain("&amp;");
    });

    it("should handle unknown language as text type", () => {
      const text = `\`\`\`unknownlang\nsome content\n\`\`\``;
      const result = extractor.extractCodeBlocks(text);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("text");
      expect(result[0].language).toBe("unknownlang");
    });

    it("should handle case-insensitive language detection", () => {
      const text = `\`\`\`HTML\n<div>Test</div>\n\`\`\``;
      const result = extractor.extractCodeBlocks(text);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("html");
    });

    it("should handle javascript alias", () => {
      const text = `\`\`\`javascript\nconsole.log();\n\`\`\``;
      const result = extractor.extractCodeBlocks(text);
      expect(result[0].type).toBe("javascript");
    });

    it("should handle multiple consecutive code blocks", () => {
      const text = `\`\`\`html\n<div>1</div>\n\`\`\`\`\`\`html\n<div>2</div>\n\`\`\``;
      const result = extractor.extractCodeBlocks(text);
      expect(result).toHaveLength(2);
    });
  });
});
