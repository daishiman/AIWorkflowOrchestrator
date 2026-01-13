/**
 * sanitizeHTML Utility Tests (TDD Green Phase)
 * @module sanitize.test
 */

import { describe, it, expect } from "vitest";
import { sanitizeHTML } from "../sanitize";

describe("sanitizeHTML", () => {
  describe("危険なタグの除去", () => {
    it("scriptタグを除去する", () => {
      // Given: scriptタグを含むHTML
      const input = '<script>alert("xss")</script><p>Safe content</p>';

      // When: サニタイズ
      const result = sanitizeHTML(input);

      // Then: scriptタグが除去される
      expect(result).not.toContain("<script>");
      expect(result).not.toContain("</script>");
      expect(result).toContain("<p>Safe content</p>");
    });

    it("script srcタグを除去する", () => {
      const input = '<script src="evil.js"></script><p>Safe</p>';
      const result = sanitizeHTML(input);

      expect(result).not.toContain("<script");
      expect(result).toContain("<p>Safe</p>");
    });

    it("iframeタグを除去する", () => {
      const input = '<iframe src="evil.com"></iframe><p>Safe</p>';
      const result = sanitizeHTML(input);

      expect(result).not.toContain("<iframe");
      expect(result).toContain("<p>Safe</p>");
    });

    it("objectタグを除去する", () => {
      const input = '<object data="evil.swf"></object><p>Safe</p>';
      const result = sanitizeHTML(input);

      expect(result).not.toContain("<object");
      expect(result).toContain("<p>Safe</p>");
    });

    it("embedタグを除去する", () => {
      const input = '<embed src="evil.swf"><p>Safe</p>';
      const result = sanitizeHTML(input);

      expect(result).not.toContain("<embed");
      expect(result).toContain("<p>Safe</p>");
    });

    it("formタグを除去する", () => {
      const input =
        '<form action="evil.com"><input type="submit"></form><p>Safe</p>';
      const result = sanitizeHTML(input);

      expect(result).not.toContain("<form");
      expect(result).not.toContain("<input");
      expect(result).toContain("<p>Safe</p>");
    });

    it("inputタグを除去する", () => {
      const input = '<input type="text" value="test"><p>Safe</p>';
      const result = sanitizeHTML(input);

      expect(result).not.toContain("<input");
      expect(result).toContain("<p>Safe</p>");
    });

    it("buttonタグを除去する", () => {
      const input = "<button>Click me</button><p>Safe</p>";
      const result = sanitizeHTML(input);

      expect(result).not.toContain("<button");
      expect(result).toContain("<p>Safe</p>");
    });

    it("selectタグを除去する", () => {
      const input = "<select><option>Option</option></select><p>Safe</p>";
      const result = sanitizeHTML(input);

      expect(result).not.toContain("<select");
      expect(result).toContain("<p>Safe</p>");
    });

    it("textareaタグを除去する", () => {
      const input = "<textarea>Text</textarea><p>Safe</p>";
      const result = sanitizeHTML(input);

      expect(result).not.toContain("<textarea");
      expect(result).toContain("<p>Safe</p>");
    });
  });

  describe("危険な属性の除去", () => {
    it("onerror属性を除去する", () => {
      const input = '<img src="x" onerror="alert(\'xss\')">';
      const result = sanitizeHTML(input);

      expect(result).not.toContain("onerror");
      expect(result).toContain("<img");
    });

    it("onload属性を除去する", () => {
      const input = '<img src="x" onload="alert(\'xss\')">';
      const result = sanitizeHTML(input);

      expect(result).not.toContain("onload");
    });

    it("onclick属性を除去する", () => {
      const input = "<div onclick=\"alert('xss')\">Click</div>";
      const result = sanitizeHTML(input);

      expect(result).not.toContain("onclick");
      expect(result).toContain("<div");
    });

    it("onmouseover属性を除去する", () => {
      const input = "<div onmouseover=\"alert('xss')\">Hover</div>";
      const result = sanitizeHTML(input);

      expect(result).not.toContain("onmouseover");
    });

    it("onmouseout属性を除去する", () => {
      const input = "<div onmouseout=\"alert('xss')\">Leave</div>";
      const result = sanitizeHTML(input);

      expect(result).not.toContain("onmouseout");
    });

    it("onmousedown属性を除去する", () => {
      const input = "<div onmousedown=\"alert('xss')\">Press</div>";
      const result = sanitizeHTML(input);

      expect(result).not.toContain("onmousedown");
    });

    it("onmouseup属性を除去する", () => {
      const input = "<div onmouseup=\"alert('xss')\">Release</div>";
      const result = sanitizeHTML(input);

      expect(result).not.toContain("onmouseup");
    });

    it("onkeydown属性を除去する", () => {
      const input = "<div onkeydown=\"alert('xss')\">Key</div>";
      const result = sanitizeHTML(input);

      expect(result).not.toContain("onkeydown");
    });

    it("onkeyup属性を除去する", () => {
      const input = "<div onkeyup=\"alert('xss')\">Key</div>";
      const result = sanitizeHTML(input);

      expect(result).not.toContain("onkeyup");
    });

    it("onkeypress属性を除去する", () => {
      const input = "<div onkeypress=\"alert('xss')\">Key</div>";
      const result = sanitizeHTML(input);

      expect(result).not.toContain("onkeypress");
    });

    it("onfocus属性を除去する", () => {
      const input = "<div onfocus=\"alert('xss')\">Focus</div>";
      const result = sanitizeHTML(input);

      expect(result).not.toContain("onfocus");
    });

    it("onblur属性を除去する", () => {
      const input = "<div onblur=\"alert('xss')\">Blur</div>";
      const result = sanitizeHTML(input);

      expect(result).not.toContain("onblur");
    });

    it("onchange属性を除去する", () => {
      const input = "<div onchange=\"alert('xss')\">Change</div>";
      const result = sanitizeHTML(input);

      expect(result).not.toContain("onchange");
    });

    it("onsubmit属性を除去する", () => {
      const input = "<div onsubmit=\"alert('xss')\">Submit</div>";
      const result = sanitizeHTML(input);

      expect(result).not.toContain("onsubmit");
    });

    it("onreset属性を除去する", () => {
      const input = "<div onreset=\"alert('xss')\">Reset</div>";
      const result = sanitizeHTML(input);

      expect(result).not.toContain("onreset");
    });

    it("onselect属性を除去する", () => {
      const input = "<div onselect=\"alert('xss')\">Select</div>";
      const result = sanitizeHTML(input);

      expect(result).not.toContain("onselect");
    });
  });

  describe("javascript: URLの除去", () => {
    it("href属性のjavascript:を除去する", () => {
      const input = "<a href=\"javascript:alert('xss')\">Click</a>";
      const result = sanitizeHTML(input);

      expect(result).not.toContain("javascript:");
    });

    it("src属性のjavascript:を除去する", () => {
      const input = "<img src=\"javascript:alert('xss')\">";
      const result = sanitizeHTML(input);

      expect(result).not.toContain("javascript:");
    });

    it("大文字のJAVASCRIPT:も除去する", () => {
      const input = "<a href=\"JAVASCRIPT:alert('xss')\">Click</a>";
      const result = sanitizeHTML(input);

      expect(result.toLowerCase()).not.toContain("javascript:");
    });

    it("空白を含むjavascript:も除去する", () => {
      const input = "<a href=\"java script:alert('xss')\">Click</a>";
      const result = sanitizeHTML(input);

      // 空白を含むjavascript:も除去またはサニタイズされる
      expect(result).not.toContain("alert");
    });
  });

  describe("data: URLの処理", () => {
    it("data:text/htmlを除去する", () => {
      const input = '<a href="data:text/html,<script>alert(1)</script>">X</a>';
      const result = sanitizeHTML(input);

      expect(result).not.toContain("data:text/html");
    });

    it("data:image/pngは許可する", () => {
      const input = '<img src="data:image/png;base64,iVBORw0KGgo=">';
      const result = sanitizeHTML(input);

      expect(result).toContain("data:image/png");
    });
  });

  describe("安全なHTMLの保持", () => {
    it("通常のHTMLタグは保持される", () => {
      const input = "<h1>Title</h1><p>Content</p>";
      const result = sanitizeHTML(input);

      expect(result).toContain("<h1>Title</h1>");
      expect(result).toContain("<p>Content</p>");
    });

    it("divタグは保持される", () => {
      const input = "<div>Content</div>";
      const result = sanitizeHTML(input);

      expect(result).toContain("<div>Content</div>");
    });

    it("spanタグは保持される", () => {
      const input = "<span>Content</span>";
      const result = sanitizeHTML(input);

      expect(result).toContain("<span>Content</span>");
    });

    it("リストタグは保持される", () => {
      const input = "<ul><li>Item</li></ul>";
      const result = sanitizeHTML(input);

      expect(result).toContain("<ul>");
      expect(result).toContain("<li>Item</li>");
    });

    it("tableタグは保持される", () => {
      const input = "<table><tr><td>Cell</td></tr></table>";
      const result = sanitizeHTML(input);

      expect(result).toContain("<table>");
      expect(result).toContain("<td>Cell</td>");
    });

    it("style属性は保持される", () => {
      const input = '<div style="color: red;">Styled</div>';
      const result = sanitizeHTML(input);

      expect(result).toContain("style=");
      expect(result).toContain("color:");
    });

    it("class属性は保持される", () => {
      const input = '<div class="container">Content</div>';
      const result = sanitizeHTML(input);

      expect(result).toContain('class="container"');
    });

    it("id属性は保持される", () => {
      const input = '<div id="main">Content</div>';
      const result = sanitizeHTML(input);

      expect(result).toContain('id="main"');
    });

    it("https: URLは保持される", () => {
      const input = '<a href="https://example.com">Link</a>';
      const result = sanitizeHTML(input);

      expect(result).toContain('href="https://example.com"');
    });

    it("mailto: URLは保持される", () => {
      const input = '<a href="mailto:test@example.com">Email</a>';
      const result = sanitizeHTML(input);

      expect(result).toContain("mailto:");
    });
  });

  describe("エッジケース", () => {
    it("空文字列を処理できる", () => {
      expect(() => sanitizeHTML("")).not.toThrow();
      expect(sanitizeHTML("")).toBe("");
    });

    it("テキストのみの入力を処理できる", () => {
      const input = "Plain text without tags";
      const result = sanitizeHTML(input);

      expect(result).toContain("Plain text without tags");
    });

    it("ネストされた悪意のあるタグを処理できる", () => {
      const input = "<div><script>alert(1)</script><p>Safe</p></div>";
      const result = sanitizeHTML(input);

      expect(result).not.toContain("<script>");
      expect(result).toContain("<p>Safe</p>");
    });

    it("エンコードされた攻撃を処理できる", () => {
      const input = '<img src="x" onerror="&#97;&#108;&#101;&#114;&#116;(1)">';
      const result = sanitizeHTML(input);

      // エンコードされたalertが実行されないこと
      expect(result).not.toContain("onerror");
    });
  });
});
