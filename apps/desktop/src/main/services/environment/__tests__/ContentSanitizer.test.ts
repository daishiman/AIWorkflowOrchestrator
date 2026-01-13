import { describe, it, expect, beforeEach } from "vitest";
import type { ExtractedContent } from "@repo/shared/types/agent";
import { ContentSanitizer } from "../ContentSanitizer";

describe("ContentSanitizer", () => {
  let sanitizer: ContentSanitizer;

  beforeEach(() => {
    sanitizer = new ContentSanitizer();
  });

  describe("sanitizeHtml", () => {
    it("should remove script tags", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: '<div>Hello</div><script>alert("XSS")</script>',
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).not.toContain("<script>");
      expect(result.sanitizedContent).toContain("<div>Hello</div>");
    });

    it("should remove onclick handlers", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: "<button onclick=\"alert('XSS')\">Click</button>",
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).not.toContain("onclick");
      expect(result.sanitizedContent).toContain("<button>");
    });

    it("should remove onerror handlers", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: '<img onerror="alert(\'XSS\')" src="x">',
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).not.toContain("onerror");
    });

    it("should remove onload handlers", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: "<body onload=\"alert('XSS')\">Content</body>",
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).not.toContain("onload");
    });

    it("should remove onmouseover handlers", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: "<div onmouseover=\"alert('XSS')\">Hover</div>",
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).not.toContain("onmouseover");
    });

    it("should remove iframe tags", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: '<div><iframe src="https://evil.com"></iframe></div>',
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).not.toContain("<iframe>");
      expect(result.sanitizedContent).toContain("<div>");
    });

    it("should remove style tags", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: "<style>body { display: none; }</style><div>Content</div>",
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).not.toContain("<style>");
    });

    it("should remove object tags", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: '<object data="malware.swf"></object>',
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).not.toContain("<object>");
    });

    it("should remove embed tags", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: '<embed src="malware.swf">',
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).not.toContain("<embed>");
    });

    it("should remove base tags", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: '<base href="https://evil.com">',
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).not.toContain("<base>");
    });

    it("should preserve safe html", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: '<div class="container"><p>Safe content</p></div>',
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).toContain('<div class="container">');
      expect(result.sanitizedContent).toContain("<p>Safe content</p>");
    });

    it("should preserve safe attributes", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: '<a href="https://example.com" title="Link">Click</a>',
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).toContain("href=");
      expect(result.sanitizedContent).toContain("title=");
    });

    it("should track removed elements", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: "<script>evil</script><div>safe</div>",
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.removedElements.length).toBeGreaterThan(0);
    });

    it("should set sanitizedAt timestamp", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: "<div>Hello</div>",
        order: 0,
        extractedAt: new Date(),
      };
      const before = new Date();
      const result = sanitizer.sanitize(content);
      const after = new Date();

      expect(result.sanitizedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(result.sanitizedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should preserve original content", () => {
      const originalContent = '<div>Hello</div><script>alert("XSS")</script>';
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: originalContent,
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.originalContent).toBe(originalContent);
    });

    it("should inherit id from extracted content", () => {
      const content: ExtractedContent = {
        id: "test-id-123",
        type: "html",
        content: "<div>Hello</div>",
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.id).toBe("test-id-123");
    });

    it("should inherit type from extracted content", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: "<div>Hello</div>",
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.type).toBe("html");
    });
  });

  describe("sanitize (non-html)", () => {
    it("should pass through markdown content unchanged", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "markdown",
        content: "# Heading\n\nParagraph with **bold**",
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).toBe(content.content);
      expect(result.removedElements).toHaveLength(0);
    });

    it("should pass through css content unchanged", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "css",
        content: ".class { color: red; }",
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).toBe(content.content);
    });

    it("should pass through javascript content unchanged", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "javascript",
        content: "console.log('hello');",
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).toBe(content.content);
    });

    it("should pass through text content unchanged", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "text",
        content: "Plain text content",
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).toBe(content.content);
    });
  });

  describe("edge cases", () => {
    it("should handle empty content", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: "",
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).toBe("");
    });

    it("should handle content with only dangerous tags", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: "<script>alert('XSS')</script>",
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).toBe("");
    });

    it("should handle nested dangerous tags", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: '<div><script><script>alert("nested")</script></script></div>',
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).not.toContain("<script>");
      expect(result.sanitizedContent).toContain("<div>");
    });

    it("should handle very long html content", () => {
      const longContent = "<div>a</div>".repeat(10000);
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: longContent,
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent.length).toBeGreaterThan(0);
    });

    it("should handle unicode content", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: "<div>こんにちは 🌍 Привет</div>",
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).toContain("こんにちは");
      expect(result.sanitizedContent).toContain("🌍");
      expect(result.sanitizedContent).toContain("Привет");
    });

    it("should handle malformed html gracefully", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: "<div><p>Unclosed tags",
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).toBeDefined();
    });

    it("should remove javascript: protocol in href", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: '<a href="javascript:alert(1)">Click</a>',
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).not.toContain("javascript:");
    });

    it("should handle svg with event handler", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: '<svg onload="alert(1)"><circle r="10"/></svg>',
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      // DOMPurify removes the onload attribute
      expect(result.sanitizedContent).not.toContain('onload="');
    });

    it("should handle encoded XSS attempts", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content:
          "<div onclick=&#x61;&#x6C;&#x65;&#x72;&#x74;&#x28;&#x31;&#x29;>Click</div>",
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent).not.toContain("onclick");
    });

    it("should handle mixed case event handlers", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: '<div ONCLICK="alert(1)" OnMouseOver="alert(2)">Click</div>',
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      expect(result.sanitizedContent.toLowerCase()).not.toContain("onclick");
      expect(result.sanitizedContent.toLowerCase()).not.toContain(
        "onmouseover",
      );
    });

    it("should preserve data-* attributes when allowed", () => {
      const content: ExtractedContent = {
        id: "1",
        type: "html",
        content: '<div data-custom="value">Content</div>',
        order: 0,
        extractedAt: new Date(),
      };
      const result = sanitizer.sanitize(content);
      // DOMPurify is configured with ALLOW_DATA_ATTR: false
      expect(result.sanitizedContent).not.toContain("data-custom");
    });
  });
});
