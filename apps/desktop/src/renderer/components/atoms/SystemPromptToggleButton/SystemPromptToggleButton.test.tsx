import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SystemPromptToggleButton } from "./index";

describe("SystemPromptToggleButton", () => {
  const defaultProps = {
    isExpanded: false,
    onClick: vi.fn(),
    hasContent: false,
  };

  describe("レンダリング", () => {
    it("ボタンをレンダリングする", () => {
      render(<SystemPromptToggleButton {...defaultProps} />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("折りたたみ時のaria-labelを設定する", () => {
      render(<SystemPromptToggleButton {...defaultProps} />);
      expect(
        screen.getByLabelText("システムプロンプトを開く"),
      ).toBeInTheDocument();
    });

    it("展開時のaria-labelを設定する", () => {
      render(<SystemPromptToggleButton {...defaultProps} isExpanded />);
      expect(
        screen.getByLabelText("システムプロンプトを閉じる"),
      ).toBeInTheDocument();
    });

    it("aria-expandedを設定する", () => {
      const { rerender } = render(
        <SystemPromptToggleButton {...defaultProps} />,
      );
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-expanded",
        "false",
      );

      rerender(<SystemPromptToggleButton {...defaultProps} isExpanded />);
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    });

    it("aria-controlsを設定する", () => {
      render(<SystemPromptToggleButton {...defaultProps} />);
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-controls",
        "system-prompt-panel",
      );
    });
  });

  describe("インタラクション", () => {
    it("クリック時にonClickを呼び出す", () => {
      const handleClick = vi.fn();
      render(
        <SystemPromptToggleButton {...defaultProps} onClick={handleClick} />,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("disabled状態ではクリックイベントを発火しない", () => {
      const handleClick = vi.fn();
      render(
        <SystemPromptToggleButton
          {...defaultProps}
          onClick={handleClick}
          disabled
        />,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("状態", () => {
    it("disabled状態でクリックできない", () => {
      render(<SystemPromptToggleButton {...defaultProps} disabled />);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("通常状態でクリックできる", () => {
      render(<SystemPromptToggleButton {...defaultProps} />);
      expect(screen.getByRole("button")).not.toBeDisabled();
    });
  });

  describe("スタイリング", () => {
    it("折りたたみ時のスタイルを適用する", () => {
      render(<SystemPromptToggleButton {...defaultProps} />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-transparent");
    });

    it("内容あり時にプライマリカラーを適用する", () => {
      render(<SystemPromptToggleButton {...defaultProps} hasContent />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("text-[var(--status-primary)]");
    });

    it("カスタムclassNameを適用する", () => {
      render(
        <SystemPromptToggleButton {...defaultProps} className="custom-class" />,
      );
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });
  });

  describe("アイコン", () => {
    it("展開時にアイコンを回転する", () => {
      const { rerender } = render(
        <SystemPromptToggleButton {...defaultProps} />,
      );
      const icon = screen.getByRole("button").querySelector("svg");
      expect(icon).not.toHaveClass("rotate-180");

      rerender(<SystemPromptToggleButton {...defaultProps} isExpanded />);
      const iconExpanded = screen.getByRole("button").querySelector("svg");
      expect(iconExpanded).toHaveClass("rotate-180");
    });
  });
});
