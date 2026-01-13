/**
 * Sanitize Edge Cases Tests (Phase 6 - Test Expansion)
 * @module sanitize.edge-cases.test
 */

import { describe, it, expect } from "vitest";
import { sanitizeHTML, buildCSPString, buildCSPMetaTag } from "../sanitize";

describe("sanitizeHTML - Edge Cases", () => {
  describe("空・無効な入力", () => {
    it("空文字列を処理できる", () => {
      expect(sanitizeHTML("")).toBe("");
    });

    it("空白のみの文字列を処理できる", () => {
      const result = sanitizeHTML("   \n\t   ");
      expect(typeof result).toBe("string");
    });

    it("nullish値を安全に処理できる", () => {
      // @ts-expect-error - Testing runtime behavior with invalid input
      expect(sanitizeHTML(null)).toBe("");
      // @ts-expect-error - Testing runtime behavior with invalid input
      expect(sanitizeHTML(undefined)).toBe("");
    });
  });

  describe("特殊文字の処理", () => {
    it("HTMLエンティティを保持する", () => {
      const result = sanitizeHTML("&amp; &lt; &gt;");
      expect(result).toContain("&");
    });

    it("日本語文字を正しく処理する", () => {
      const result = sanitizeHTML("<p>日本語テスト</p>");
      expect(result).toContain("日本語テスト");
    });

    it("絵文字を処理できる", () => {
      const result = sanitizeHTML("<p>Hello 🌸 World 🎉</p>");
      expect(result).toContain("🌸");
      expect(result).toContain("🎉");
    });

    it("Unicode文字を処理できる", () => {
      const result = sanitizeHTML("<p>αβγδ ∀∃∈∉</p>");
      expect(result).toContain("αβγδ");
    });
  });

  describe("大きなコンテンツの処理", () => {
    it("長いテキストを処理できる", () => {
      const longText = "a".repeat(100000);
      const result = sanitizeHTML(`<p>${longText}</p>`);
      expect(result).toContain(longText);
    });

    it("深くネストされたHTMLを処理できる", () => {
      let nested = "content";
      for (let i = 0; i < 50; i++) {
        nested = `<div>${nested}</div>`;
      }
      const result = sanitizeHTML(nested);
      expect(result).toContain("content");
    });
  });

  describe("複合的なXSS攻撃パターン", () => {
    it("SVGベースのXSSを防ぐ", () => {
      const svg = `<svg onload="alert('xss')"><script>alert('xss')</script></svg>`;
      const result = sanitizeHTML(svg);
      expect(result).not.toContain("onload");
      expect(result).not.toContain("<script");
    });

    it("データURIのスクリプトを防ぐ", () => {
      const dataUri = `<a href="data:text/html,<script>alert('xss')</script>">Click</a>`;
      const result = sanitizeHTML(dataUri);
      expect(result).not.toContain("data:text/html");
    });

    it("BASE64エンコードされたスクリプトを防ぐ", () => {
      const base64 = `<img src="data:text/html;base64,PHNjcmlwdD5hbGVydCgneHNzJyk8L3NjcmlwdD4=">`;
      const result = sanitizeHTML(base64);
      expect(result).not.toContain("text/html");
    });

    it("イベントハンドラのバリエーションを防ぐ", () => {
      const handlers = [
        `<img onerror="alert('xss')">`,
        `<img onError="alert('xss')">`,
        `<img ONERROR="alert('xss')">`,
        `<body onload="alert('xss')">`,
        `<input onfocus="alert('xss')">`,
        `<div onmouseover="alert('xss')">`,
      ];

      handlers.forEach((handler) => {
        const result = sanitizeHTML(handler);
        expect(result).not.toMatch(/on\w+=/i);
      });
    });

    it("StyleシートインジェクションPHPリを防ぐ", () => {
      const styleInjection = `<style>@import url("javascript:alert('xss')")</style>`;
      const result = sanitizeHTML(styleInjection);
      expect(result).not.toContain("javascript:");
    });
  });

  describe("有効なコンテンツの保持", () => {
    it("有効なスタイル属性を保持する", () => {
      const result = sanitizeHTML('<p style="color: red;">Text</p>');
      expect(result).toContain("color");
    });

    it("有効なクラス属性を保持する", () => {
      const result = sanitizeHTML('<p class="highlight">Text</p>');
      expect(result).toContain('class="highlight"');
    });

    it("有効なIDを保持する", () => {
      const result = sanitizeHTML('<p id="unique">Text</p>');
      expect(result).toContain('id="unique"');
    });

    it("data-*属性はセキュリティのため除去される", () => {
      // セキュリティのため、data-*属性は許可していない
      const result = sanitizeHTML('<p data-value="123">Text</p>');
      expect(result).not.toContain("data-value");
      // ただし要素とテキストは保持される
      expect(result).toContain("<p>");
      expect(result).toContain("Text");
    });
  });
});

describe("buildCSPString - Edge Cases", () => {
  it("複数回呼び出しても一貫した結果を返す", () => {
    const result1 = buildCSPString();
    const result2 = buildCSPString();
    expect(result1).toBe(result2);
  });

  it("CSP文字列が正しいフォーマットである", () => {
    const csp = buildCSPString();
    // 各ディレクティブはセミコロンで区切られる
    const directives = csp.split(";");
    expect(directives.length).toBeGreaterThan(1);

    // 各ディレクティブは key value の形式
    directives.forEach((directive) => {
      const trimmed = directive.trim();
      if (trimmed) {
        const parts = trimmed.split(" ");
        expect(parts.length).toBeGreaterThanOrEqual(2);
      }
    });
  });
});

describe("buildCSPMetaTag - Edge Cases", () => {
  it("有効なHTMLメタタグを返す", () => {
    const meta = buildCSPMetaTag();
    expect(meta).toMatch(/^<meta/);
    expect(meta).toMatch(/http-equiv="Content-Security-Policy"/);
    expect(meta).toMatch(/content="[^"]+"/);
    expect(meta).toMatch(/>$/);
  });

  it("エスケープが必要な文字を含まない", () => {
    const meta = buildCSPMetaTag();
    // CSPメタタグ内にXSSに悪用される文字がない
    expect(meta).not.toContain("&");
    expect(meta).not.toContain("<script");
  });
});
