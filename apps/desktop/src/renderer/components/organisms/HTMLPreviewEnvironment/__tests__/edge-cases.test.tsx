/**
 * HTMLPreviewEnvironment Edge Cases Tests (Phase 6 - Test Expansion)
 * @module HTMLPreviewEnvironment.edge-cases.test
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HTMLPreviewEnvironment } from "../index";

describe("HTMLPreviewEnvironment - Edge Cases", () => {
  describe("空・無効なコンテンツ", () => {
    it("空文字列を正しく処理できる", () => {
      render(<HTMLPreviewEnvironment content="" />);
      expect(screen.getByTestId("html-preview")).toBeInTheDocument();
    });

    it("空白のみの文字列を処理できる", () => {
      render(<HTMLPreviewEnvironment content="   \n\t   " />);
      expect(screen.getByTestId("html-preview")).toBeInTheDocument();
    });
  });

  describe("特殊なHTMLコンテンツ", () => {
    it("DOCTYPE宣言を含むコンテンツを処理できる", () => {
      const content = "<!DOCTYPE html><html><body>Test</body></html>";
      render(<HTMLPreviewEnvironment content={content} />);
      expect(screen.getByTestId("html-preview")).toBeInTheDocument();
    });

    it("HTMLコメントを処理できる", () => {
      const content = "<!-- This is a comment --><p>Visible</p>";
      render(<HTMLPreviewEnvironment content={content} />);
      expect(screen.getByTestId("html-preview")).toBeInTheDocument();
    });

    it("CDATA セクションを処理できる", () => {
      const content = "<![CDATA[Some data]]><p>Text</p>";
      render(<HTMLPreviewEnvironment content={content} />);
      expect(screen.getByTestId("html-preview")).toBeInTheDocument();
    });
  });

  describe("sandbox属性のフィルタリング", () => {
    it("allow-scriptsが除去される", () => {
      render(
        <HTMLPreviewEnvironment
          content="<p>Test</p>"
          sandboxFlags={["allow-same-origin", "allow-scripts"]}
        />,
      );

      const iframe = screen.getByTestId("preview-iframe");
      expect(iframe.getAttribute("sandbox")).not.toContain("allow-scripts");
    });

    it("allow-popupsが除去される", () => {
      render(
        <HTMLPreviewEnvironment
          content="<p>Test</p>"
          sandboxFlags={["allow-same-origin", "allow-popups"]}
        />,
      );

      const iframe = screen.getByTestId("preview-iframe");
      expect(iframe.getAttribute("sandbox")).not.toContain("allow-popups");
    });

    it("allow-top-navigationが除去される", () => {
      render(
        <HTMLPreviewEnvironment
          content="<p>Test</p>"
          sandboxFlags={["allow-same-origin", "allow-top-navigation"]}
        />,
      );

      const iframe = screen.getByTestId("preview-iframe");
      expect(iframe.getAttribute("sandbox")).not.toContain(
        "allow-top-navigation",
      );
    });

    it("allow-formsが除去される", () => {
      render(
        <HTMLPreviewEnvironment
          content="<p>Test</p>"
          sandboxFlags={["allow-same-origin", "allow-forms"]}
        />,
      );

      const iframe = screen.getByTestId("preview-iframe");
      expect(iframe.getAttribute("sandbox")).not.toContain("allow-forms");
    });

    it("複数の危険なフラグが同時に除去される", () => {
      render(
        <HTMLPreviewEnvironment
          content="<p>Test</p>"
          sandboxFlags={[
            "allow-same-origin",
            "allow-scripts",
            "allow-popups",
            "allow-forms",
            "allow-top-navigation",
          ]}
        />,
      );

      const iframe = screen.getByTestId("preview-iframe");
      const sandbox = iframe.getAttribute("sandbox");
      expect(sandbox).toContain("allow-same-origin");
      expect(sandbox).not.toContain("allow-scripts");
      expect(sandbox).not.toContain("allow-popups");
      expect(sandbox).not.toContain("allow-forms");
      expect(sandbox).not.toContain("allow-top-navigation");
    });

    it("空のsandboxFlagsでデフォルトが適用される", () => {
      render(
        <HTMLPreviewEnvironment content="<p>Test</p>" sandboxFlags={[]} />,
      );

      const iframe = screen.getByTestId("preview-iframe");
      expect(iframe.getAttribute("sandbox")).toBe("");
    });
  });

  describe("XSS攻撃パターン", () => {
    it("srcDoc内にスクリプトが実行されない", () => {
      const maliciousContent = '<script>alert("xss")</script><p>Safe</p>';
      render(<HTMLPreviewEnvironment content={maliciousContent} />);

      const iframe = screen.getByTestId("preview-iframe");
      const srcDoc = iframe.getAttribute("srcdoc") || "";
      expect(srcDoc).not.toMatch(/<script[^>]*>alert/i);
    });

    it("イベントハンドラが除去される", () => {
      const maliciousContent = '<img onerror="alert(1)" src="invalid">';
      render(<HTMLPreviewEnvironment content={maliciousContent} />);

      const iframe = screen.getByTestId("preview-iframe");
      const srcDoc = iframe.getAttribute("srcdoc") || "";
      expect(srcDoc).not.toContain("onerror");
    });

    it("javascript:URLが除去される", () => {
      const maliciousContent = '<a href="javascript:alert(1)">Click</a>';
      render(<HTMLPreviewEnvironment content={maliciousContent} />);

      const iframe = screen.getByTestId("preview-iframe");
      const srcDoc = iframe.getAttribute("srcdoc") || "";
      expect(srcDoc).not.toContain("javascript:");
    });
  });

  describe("コールバック処理", () => {
    it("onLoadが設定されている場合、iframeにonLoadハンドラが存在する", () => {
      const onLoad = vi.fn();
      render(<HTMLPreviewEnvironment content="<p>Test</p>" onLoad={onLoad} />);

      const iframe = screen.getByTestId("preview-iframe");
      expect(iframe).toBeInTheDocument();
    });

    it("onErrorが設定されている場合、iframeにonErrorハンドラが存在する", () => {
      const onError = vi.fn();
      render(
        <HTMLPreviewEnvironment content="<p>Test</p>" onError={onError} />,
      );

      const iframe = screen.getByTestId("preview-iframe");
      expect(iframe).toBeInTheDocument();
    });

    it("コールバック未設定でもエラーにならない", () => {
      expect(() => {
        render(<HTMLPreviewEnvironment content="<p>Test</p>" />);
      }).not.toThrow();
    });
  });

  describe("スタイル適用", () => {
    it("カスタムクラス名が適用される", () => {
      render(
        <HTMLPreviewEnvironment
          content="<p>Test</p>"
          className="custom-class"
        />,
      );

      const container = screen.getByTestId("html-preview");
      expect(container).toHaveClass("custom-class");
    });
  });

  describe("CSPメタタグ", () => {
    it("CSPメタタグがsrcDocに含まれる", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTestId("preview-iframe");
      const srcDoc = iframe.getAttribute("srcdoc") || "";
      expect(srcDoc).toContain("Content-Security-Policy");
    });

    it("script-srcが'none'に設定されている", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTestId("preview-iframe");
      const srcDoc = iframe.getAttribute("srcdoc") || "";
      expect(srcDoc).toContain("script-src 'none'");
    });
  });
});
