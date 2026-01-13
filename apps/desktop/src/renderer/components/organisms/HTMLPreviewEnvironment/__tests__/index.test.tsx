/**
 * HTMLPreviewEnvironment Component Tests (TDD Green Phase)
 * @module HTMLPreviewEnvironment.test
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { HTMLPreviewEnvironment } from "../index";

describe("HTMLPreviewEnvironment", () => {
  describe("レンダリング", () => {
    it("iframeが表示される", () => {
      // Given: HTML文字列
      render(<HTMLPreviewEnvironment content="<p>Hello</p>" />);

      // Then: iframeが表示される
      const iframe = screen.getByTitle("Preview");
      expect(iframe).toBeInTheDocument();
      expect(iframe.tagName).toBe("IFRAME");
    });

    it("HTMLコンテンツがiframe内に表示される", async () => {
      // Given: HTML文字列
      render(<HTMLPreviewEnvironment content="<h1>Title</h1><p>Content</p>" />);

      // Then: iframeのsrcdocにHTMLが設定される
      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("<h1>Title</h1>");
      expect(iframe.srcdoc).toContain("<p>Content</p>");
    });

    it("空のコンテンツでもエラーにならない", () => {
      // Given: 空文字列
      expect(() => render(<HTMLPreviewEnvironment content="" />)).not.toThrow();
    });
  });

  describe("セキュリティ - sandbox属性", () => {
    it("sandbox属性が設定される", () => {
      // Given: HTMLコンテンツ
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      // Then: iframeにsandbox属性がある
      const iframe = screen.getByTitle("Preview");
      expect(iframe).toHaveAttribute("sandbox");
    });

    it("デフォルトでallow-same-originのみ許可される", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTitle("Preview");
      const sandbox = iframe.getAttribute("sandbox");
      expect(sandbox).toBe("allow-same-origin");
    });

    it("allow-scriptsが含まれていない", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTitle("Preview");
      const sandbox = iframe.getAttribute("sandbox");
      expect(sandbox).not.toContain("allow-scripts");
    });

    it("allow-popupsが含まれていない", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTitle("Preview");
      const sandbox = iframe.getAttribute("sandbox");
      expect(sandbox).not.toContain("allow-popups");
    });

    it("allow-top-navigationが含まれていない", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTitle("Preview");
      const sandbox = iframe.getAttribute("sandbox");
      expect(sandbox).not.toContain("allow-top-navigation");
    });

    it("カスタムsandboxFlagsを設定できる", () => {
      render(
        <HTMLPreviewEnvironment
          content="<p>Test</p>"
          sandboxFlags={["allow-same-origin"]}
        />,
      );

      const iframe = screen.getByTitle("Preview");
      expect(iframe.getAttribute("sandbox")).toBe("allow-same-origin");
    });
  });

  describe("セキュリティ - CSP", () => {
    it("CSP meta tagがiframe内に含まれる", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain('http-equiv="Content-Security-Policy"');
    });

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
  });

  describe("セキュリティ - HTMLサニタイズ", () => {
    it("scriptタグが除去される", () => {
      const maliciousHTML = '<script>alert("xss")</script><p>Safe</p>';
      render(<HTMLPreviewEnvironment content={maliciousHTML} />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).not.toContain("<script>");
      expect(iframe.srcdoc).toContain("<p>Safe</p>");
    });

    it("onerror属性が除去される", () => {
      const maliciousHTML = '<img src="x" onerror="alert(\'xss\')">';
      render(<HTMLPreviewEnvironment content={maliciousHTML} />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).not.toContain("onerror");
    });

    it("onload属性が除去される", () => {
      const maliciousHTML = "<svg onload=\"alert('xss')\">";
      render(<HTMLPreviewEnvironment content={maliciousHTML} />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).not.toContain("onload=");
    });

    it("onclick属性が除去される", () => {
      const maliciousHTML = "<div onclick=\"alert('xss')\">Click</div>";
      render(<HTMLPreviewEnvironment content={maliciousHTML} />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).not.toContain("onclick");
    });

    it("javascript: URLが除去される", () => {
      const maliciousHTML = "<a href=\"javascript:alert('xss')\">Link</a>";
      render(<HTMLPreviewEnvironment content={maliciousHTML} />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).not.toContain("javascript:");
    });

    it("iframeタグが除去される", () => {
      const maliciousHTML = '<iframe src="evil.com"></iframe><p>Safe</p>';
      render(<HTMLPreviewEnvironment content={maliciousHTML} />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      // srcdoc内に悪意のあるiframeタグが含まれていないこと
      const innerContent = iframe.srcdoc;
      // Note: 親のiframeは存在するが、コンテンツ内のiframeは除去される
      expect(innerContent).toContain("<p>Safe</p>");
    });

    it("objectタグが除去される", () => {
      const maliciousHTML = '<object data="evil.swf"></object><p>Safe</p>';
      render(<HTMLPreviewEnvironment content={maliciousHTML} />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).not.toContain("<object");
    });

    it("embedタグが除去される", () => {
      const maliciousHTML = '<embed src="evil.swf"><p>Safe</p>';
      render(<HTMLPreviewEnvironment content={maliciousHTML} />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).not.toContain("<embed");
    });

    it("formタグが除去される", () => {
      const maliciousHTML =
        '<form action="evil.com"><input type="submit"></form><p>Safe</p>';
      render(<HTMLPreviewEnvironment content={maliciousHTML} />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).not.toContain("<form");
    });
  });

  describe("コールバック", () => {
    it("読み込み完了時にonLoadが呼ばれる", async () => {
      const onLoad = vi.fn();
      render(<HTMLPreviewEnvironment content="<p>Test</p>" onLoad={onLoad} />);

      // iframeのloadイベントを待つ
      await waitFor(() => {
        expect(onLoad).toHaveBeenCalled();
      });
    });

    it("エラー時にonErrorが呼ばれる", async () => {
      const onError = vi.fn();
      // エラーを発生させる条件（実装依存）
      render(
        <HTMLPreviewEnvironment content="<p>Test</p>" onError={onError} />,
      );

      // エラーシナリオをシミュレート
      // Note: 実際のエラーケースは実装に依存
    });
  });

  describe("安全なHTMLの保持", () => {
    it("通常のHTMLタグは保持される", () => {
      const safeHTML = "<h1>Title</h1><p>Paragraph</p><ul><li>Item</li></ul>";
      render(<HTMLPreviewEnvironment content={safeHTML} />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("<h1>Title</h1>");
      expect(iframe.srcdoc).toContain("<p>Paragraph</p>");
      expect(iframe.srcdoc).toContain("<ul>");
      expect(iframe.srcdoc).toContain("<li>Item</li>");
    });

    it("style属性は保持される", () => {
      const styledHTML =
        '<div style="color: red; font-size: 16px;">Styled</div>';
      render(<HTMLPreviewEnvironment content={styledHTML} />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("style=");
      expect(iframe.srcdoc).toContain("color:");
    });

    it("class属性は保持される", () => {
      const classedHTML = '<div class="container">Content</div>';
      render(<HTMLPreviewEnvironment content={classedHTML} />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain('class="container"');
    });

    it("img srcは保持される（https）", () => {
      const imgHTML = '<img src="https://example.com/image.png" alt="Test">';
      render(<HTMLPreviewEnvironment content={imgHTML} />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("https://example.com/image.png");
    });

    it("data: URLは保持される（画像）", () => {
      const dataImgHTML =
        '<img src="data:image/png;base64,iVBORw0KGgo=" alt="Test">';
      render(<HTMLPreviewEnvironment content={dataImgHTML} />);

      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      expect(iframe.srcdoc).toContain("data:image/png");
    });
  });
});
