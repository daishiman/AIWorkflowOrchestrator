import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TerminalLauncher } from "./TerminalLauncher";

describe("TerminalLauncher", () => {
  describe("コマンド表示", () => {
    it("terminalCommand を code 要素で表示する", () => {
      render(
        <TerminalLauncher
          terminalCommand="pnpm dev"
          onCopy={vi.fn()}
          onLaunch={vi.fn()}
        />,
      );
      const codeEl = screen
        .getByTestId("terminal-launcher")
        .querySelector("code");
      expect(codeEl).toBeInTheDocument();
      expect(codeEl?.textContent).toBe("pnpm dev");
    });
  });

  describe("コピーボタン", () => {
    it("コピーボタンを表示する", () => {
      render(
        <TerminalLauncher
          terminalCommand="pnpm dev"
          onCopy={vi.fn()}
          onLaunch={vi.fn()}
        />,
      );
      expect(screen.getByText("コピー")).toBeInTheDocument();
    });

    it("コピーボタンクリックで onCopy が呼ばれる", () => {
      const onCopy = vi.fn();
      render(
        <TerminalLauncher
          terminalCommand="pnpm dev"
          onCopy={onCopy}
          onLaunch={vi.fn()}
        />,
      );
      fireEvent.click(screen.getByText("コピー"));
      expect(onCopy).toHaveBeenCalledTimes(1);
    });
  });

  describe("起動ボタン", () => {
    it("起動ボタンを表示する", () => {
      render(
        <TerminalLauncher
          terminalCommand="pnpm dev"
          onCopy={vi.fn()}
          onLaunch={vi.fn()}
        />,
      );
      expect(screen.getByText("ターミナルを開く")).toBeInTheDocument();
    });

    it("起動ボタンクリックで onLaunch が呼ばれる", () => {
      const onLaunch = vi.fn();
      render(
        <TerminalLauncher
          terminalCommand="pnpm dev"
          onCopy={vi.fn()}
          onLaunch={onLaunch}
        />,
      );
      fireEvent.click(screen.getByText("ターミナルを開く"));
      expect(onLaunch).toHaveBeenCalledTimes(1);
    });
  });

  describe("terminalCommand undefined で非表示", () => {
    it("terminalCommand が undefined のとき null を返す", () => {
      const { container } = render(
        <TerminalLauncher onCopy={vi.fn()} onLaunch={vi.fn()} />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("terminalCommand が undefined のとき data-testid が存在しない", () => {
      render(<TerminalLauncher onCopy={vi.fn()} onLaunch={vi.fn()} />);
      expect(screen.queryByTestId("terminal-launcher")).not.toBeInTheDocument();
    });
  });

  describe("ARIA 属性", () => {
    it("role=complementary を持つ", () => {
      render(
        <TerminalLauncher
          terminalCommand="pnpm dev"
          onCopy={vi.fn()}
          onLaunch={vi.fn()}
        />,
      );
      expect(screen.getByRole("complementary")).toBeInTheDocument();
    });

    it('aria-label="ターミナルランチャー" を持つ', () => {
      render(
        <TerminalLauncher
          terminalCommand="pnpm dev"
          onCopy={vi.fn()}
          onLaunch={vi.fn()}
        />,
      );
      expect(screen.getByRole("complementary")).toHaveAttribute(
        "aria-label",
        "ターミナルランチャー",
      );
    });

    it("data-testid=terminal-launcher を持つ", () => {
      render(
        <TerminalLauncher
          terminalCommand="pnpm dev"
          onCopy={vi.fn()}
          onLaunch={vi.fn()}
        />,
      );
      expect(screen.getByTestId("terminal-launcher")).toBeInTheDocument();
    });
  });
});
