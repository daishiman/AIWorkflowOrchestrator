import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SuggestionBubble } from "./index";
import { renderWithAllThemes } from "../../../tests/helpers/renderWithTheme";

describe("SuggestionBubble", () => {
  describe("レンダリング", () => {
    it("ラベルテキストを表示する", () => {
      render(<SuggestionBubble label="提案テキスト" onClick={vi.fn()} />);
      expect(screen.getByText("提案テキスト")).toBeInTheDocument();
    });
  });

  describe("サイズ", () => {
    it('size="sm" で h-9 クラスを持つ', () => {
      render(<SuggestionBubble label="Small" onClick={vi.fn()} size="sm" />);
      expect(screen.getByRole("button")).toHaveClass("h-9");
    });

    it('size="md"(デフォルト) で h-11 クラスを持つ', () => {
      render(<SuggestionBubble label="Medium" onClick={vi.fn()} />);
      expect(screen.getByRole("button")).toHaveClass("h-11");
    });

    it('size="lg" で h-14 クラスを持つ', () => {
      render(<SuggestionBubble label="Large" onClick={vi.fn()} size="lg" />);
      expect(screen.getByRole("button")).toHaveClass("h-14");
    });
  });

  describe("クリック", () => {
    it("クリック時に onClick を呼び出す", () => {
      const handleClick = vi.fn();
      render(<SuggestionBubble label="Click me" onClick={handleClick} />);
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("disabled=true 時に onClick を呼び出さない", () => {
      const handleClick = vi.fn();
      render(
        <SuggestionBubble
          label="Disabled"
          onClick={handleClick}
          disabled={true}
        />,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("disabled 状態", () => {
    it("disabled=true で opacity-50 クラスを持つ", () => {
      render(
        <SuggestionBubble label="Disabled" onClick={vi.fn()} disabled={true} />,
      );
      expect(screen.getByRole("button")).toHaveClass("opacity-50");
    });

    it("disabled=true で cursor-not-allowed クラスを持つ", () => {
      render(
        <SuggestionBubble label="Disabled" onClick={vi.fn()} disabled={true} />,
      );
      expect(screen.getByRole("button")).toHaveClass("cursor-not-allowed");
    });
  });

  describe("アイコン", () => {
    it("icon 指定時にアイコンを表示する", () => {
      const { container } = render(
        <SuggestionBubble
          label="With Icon"
          onClick={vi.fn()}
          icon="sparkles"
        />,
      );
      const svgElements = container.querySelectorAll("svg");
      expect(svgElements.length).toBeGreaterThan(0);
    });

    it("icon 未指定時にアイコンが不在である", () => {
      const { container } = render(
        <SuggestionBubble label="No Icon" onClick={vi.fn()} />,
      );
      const svgElements = container.querySelectorAll("svg");
      expect(svgElements.length).toBe(0);
    });
  });

  describe("キーボード操作", () => {
    it("Enter キーで onClick を呼び出す", () => {
      const handleClick = vi.fn();
      render(<SuggestionBubble label="Enter" onClick={handleClick} />);
      fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("Space キーで onClick を呼び出す", () => {
      const handleClick = vi.fn();
      render(<SuggestionBubble label="Space" onClick={handleClick} />);
      fireEvent.keyDown(screen.getByRole("button"), { key: " " });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("disabled=true 時に Enter キーで onClick を呼び出さない", () => {
      const handleClick = vi.fn();
      render(
        <SuggestionBubble
          label="Disabled Enter"
          onClick={handleClick}
          disabled={true}
        />,
      );
      fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("アクセシビリティ", () => {
    it('role="button" が設定されている', () => {
      render(<SuggestionBubble label="Accessible" onClick={vi.fn()} />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("tabIndex={0} が設定されている", () => {
      render(<SuggestionBubble label="Focusable" onClick={vi.fn()} />);
      expect(screen.getByRole("button")).toHaveAttribute("tabindex", "0");
    });

    it('disabled=true で aria-disabled="true" が設定されている', () => {
      render(
        <SuggestionBubble
          label="Aria Disabled"
          onClick={vi.fn()}
          disabled={true}
        />,
      );
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    });
  });

  describe("スタイル", () => {
    it("背景に bg-[var(--bg-tertiary)] クラスを持つ", () => {
      render(<SuggestionBubble label="Styled" onClick={vi.fn()} />);
      expect(screen.getByRole("button")).toHaveClass("bg-[var(--bg-tertiary)]");
    });

    it("ボーダーに border-[var(--border-subtle)] クラスを持つ", () => {
      render(<SuggestionBubble label="Border" onClick={vi.fn()} />);
      expect(screen.getByRole("button")).toHaveClass(
        "border-[var(--border-subtle)]",
      );
    });
  });

  describe("フォーカス管理", () => {
    it("F-01: フォーカス可能である", () => {
      render(<SuggestionBubble label="Focusable" onClick={vi.fn()} />);
      const el = screen.getByRole("button");
      el.focus();
      expect(document.activeElement).toBe(el);
    });
  });

  describe("マイクロインタラクション", () => {
    it("MI-01: hover時にscale変更クラス hover:scale-[1.02] を持つ", () => {
      render(<SuggestionBubble label="Hover" onClick={vi.fn()} />);
      const el = screen.getByRole("button");
      expect(el).toHaveClass("hover:scale-[1.02]");
    });

    it("MI-02: active時にscale変更クラス active:scale-[0.98] を持つ", () => {
      render(<SuggestionBubble label="Active" onClick={vi.fn()} />);
      const el = screen.getByRole("button");
      expect(el).toHaveClass("active:scale-[0.98]");
    });
  });

  describe("テーマ", () => {
    it("3テーマでレンダリングエラーなし", () => {
      expect(() => {
        renderWithAllThemes(
          <SuggestionBubble label="Theme Test" onClick={vi.fn()} />,
        );
      }).not.toThrow();
    });
  });

  describe("エッジケース", () => {
    it("UE-02: disabled={true} + Spaceキーで onClick が呼ばれない", () => {
      const handleClick = vi.fn();
      render(
        <SuggestionBubble
          label="Disabled Space"
          onClick={handleClick}
          disabled={true}
        />,
      );
      fireEvent.keyDown(screen.getByRole("button"), { key: " " });
      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});
