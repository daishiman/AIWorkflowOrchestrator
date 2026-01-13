/**
 * iframe sandbox Security Tests (TDD Green Phase)
 * @module iframe-sandbox.test
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HTMLPreviewEnvironment } from "../../components/organisms/HTMLPreviewEnvironment";

describe("iframe sandbox Security", () => {
  describe("sandbox属性の存在", () => {
    it("iframeにsandbox属性が設定されている", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTitle("Preview");
      expect(iframe).toHaveAttribute("sandbox");
    });

    it("sandbox属性が空文字列でない", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTitle("Preview");
      const sandbox = iframe.getAttribute("sandbox");
      expect(sandbox).not.toBe("");
    });
  });

  describe("禁止されるsandbox機能", () => {
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

    it("allow-formsが含まれていない", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTitle("Preview");
      const sandbox = iframe.getAttribute("sandbox");
      expect(sandbox).not.toContain("allow-forms");
    });

    it("allow-modalsが含まれていない", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTitle("Preview");
      const sandbox = iframe.getAttribute("sandbox");
      expect(sandbox).not.toContain("allow-modals");
    });

    it("allow-pointer-lockが含まれていない", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTitle("Preview");
      const sandbox = iframe.getAttribute("sandbox");
      expect(sandbox).not.toContain("allow-pointer-lock");
    });

    it("allow-downloadsが含まれていない", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTitle("Preview");
      const sandbox = iframe.getAttribute("sandbox");
      expect(sandbox).not.toContain("allow-downloads");
    });
  });

  describe("許可されるsandbox機能", () => {
    it("allow-same-originが含まれている", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);

      const iframe = screen.getByTitle("Preview");
      const sandbox = iframe.getAttribute("sandbox");
      expect(sandbox).toContain("allow-same-origin");
    });
  });

  describe("攻撃シナリオの防御", () => {
    it("スクリプト実行が防止される", () => {
      // sandbox属性があればスクリプトは実行されない
      const maliciousContent = `
        <script>
          window.parent.postMessage('attack', '*');
        </script>
        <p>Content</p>
      `;

      render(<HTMLPreviewEnvironment content={maliciousContent} />);

      const iframe = screen.getByTitle("Preview");
      // sandbox属性にallow-scriptsがないことを確認
      const sandbox = iframe.getAttribute("sandbox");
      expect(sandbox).not.toContain("allow-scripts");
    });

    it("ポップアップが防止される", () => {
      const maliciousContent = `
        <a href="javascript:window.open('evil.com')">Click</a>
        <p>Content</p>
      `;

      render(<HTMLPreviewEnvironment content={maliciousContent} />);

      const iframe = screen.getByTitle("Preview");
      const sandbox = iframe.getAttribute("sandbox");
      expect(sandbox).not.toContain("allow-popups");
    });

    it("親ウィンドウへのナビゲーションが防止される", () => {
      const maliciousContent = `
        <a href="evil.com" target="_top">Redirect</a>
        <p>Content</p>
      `;

      render(<HTMLPreviewEnvironment content={maliciousContent} />);

      const iframe = screen.getByTitle("Preview");
      const sandbox = iframe.getAttribute("sandbox");
      expect(sandbox).not.toContain("allow-top-navigation");
    });

    it("フォーム送信が防止される", () => {
      const maliciousContent = `
        <form action="evil.com" method="POST">
          <input type="hidden" name="data" value="stolen">
          <input type="submit">
        </form>
        <p>Content</p>
      `;

      render(<HTMLPreviewEnvironment content={maliciousContent} />);

      const iframe = screen.getByTitle("Preview");
      const sandbox = iframe.getAttribute("sandbox");
      expect(sandbox).not.toContain("allow-forms");
    });

    it("alert/confirm/promptが防止される", () => {
      const maliciousContent = `
        <button onclick="alert('attack')">Alert</button>
        <p>Content</p>
      `;

      render(<HTMLPreviewEnvironment content={maliciousContent} />);

      const iframe = screen.getByTitle("Preview");
      const sandbox = iframe.getAttribute("sandbox");
      expect(sandbox).not.toContain("allow-modals");
    });
  });

  describe("カスタムsandbox設定", () => {
    it("カスタムsandboxFlagsが適用される", () => {
      render(
        <HTMLPreviewEnvironment
          content="<p>Test</p>"
          sandboxFlags={["allow-same-origin"]}
        />,
      );

      const iframe = screen.getByTitle("Preview");
      expect(iframe.getAttribute("sandbox")).toBe("allow-same-origin");
    });

    it("危険なフラグを含むカスタム設定は無視される", () => {
      // セキュリティのため、危険なフラグは無視されるべき
      render(
        <HTMLPreviewEnvironment
          content="<p>Test</p>"
          sandboxFlags={["allow-same-origin", "allow-scripts"]}
        />,
      );

      const iframe = screen.getByTitle("Preview");
      const sandbox = iframe.getAttribute("sandbox");
      // allow-scriptsは許可されないはず
      expect(sandbox).not.toContain("allow-scripts");
    });
  });
});
