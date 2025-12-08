import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { NavIcon } from "./index";

describe("NavIcon", () => {
  const defaultProps = {
    icon: "layout-grid" as const,
    tooltip: "Dashboard",
    onClick: vi.fn(),
  };

  describe("レンダリング", () => {
    it("ボタンをレンダリングする", () => {
      render(<NavIcon {...defaultProps} />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("アイコンをレンダリングする", () => {
      const { container } = render(<NavIcon {...defaultProps} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("aria-labelにtooltipを設定する", () => {
      render(<NavIcon {...defaultProps} />);
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "Dashboard",
      );
    });
  });

  describe("インタラクション", () => {
    it("クリック時にonClickを呼び出す", () => {
      const handleClick = vi.fn();
      render(<NavIcon {...defaultProps} onClick={handleClick} />);
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("状態", () => {
    it("active状態でaria-pressed=trueを設定する", () => {
      render(<NavIcon {...defaultProps} active />);
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    it("非active状態でaria-pressed=falseを設定する", () => {
      render(<NavIcon {...defaultProps} active={false} />);
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });

    it("active状態でアクティブスタイルを適用する", () => {
      render(<NavIcon {...defaultProps} active />);
      expect(screen.getByRole("button")).toHaveClass("bg-white/10");
    });
  });

  describe("ツールチップ", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("ホバー時にツールチップを表示する", async () => {
      render(<NavIcon {...defaultProps} />);
      const button = screen.getByRole("button");
      fireEvent.mouseEnter(button.parentElement!);

      // delay(500ms) + αを待つ
      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    it("shortcutがある場合、ツールチップに含める", async () => {
      render(<NavIcon {...defaultProps} shortcut="⌘1" />);
      const button = screen.getByRole("button");
      fireEvent.mouseEnter(button.parentElement!);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByRole("tooltip")).toHaveTextContent("Dashboard (⌘1)");
    });
  });

  describe("アクセシビリティ", () => {
    it("フォーカス可能である", () => {
      render(<NavIcon {...defaultProps} />);
      const button = screen.getByRole("button");
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(NavIcon.displayName).toBe("NavIcon");
    });
  });
});
