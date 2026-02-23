import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterChip } from "./index";
import { renderWithAllThemes } from "../../../tests/helpers/renderWithTheme";

describe("FilterChip", () => {
  const defaultProps = {
    label: "テストラベル",
    isSelected: false,
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("レンダリング", () => {
    it("ラベルテキストを表示する", () => {
      render(<FilterChip {...defaultProps} />);
      expect(screen.getByText("テストラベル")).toBeInTheDocument();
    });
  });

  describe("選択状態スタイル", () => {
    it("isSelected=false で非選択スタイルが適用される", () => {
      render(<FilterChip {...defaultProps} isSelected={false} />);
      const el = screen.getByRole("checkbox");
      expect(el).toHaveClass("bg-[var(--bg-tertiary)]");
      expect(el).toHaveClass("text-[var(--text-secondary)]");
    });

    it("isSelected=true で選択スタイルが適用される", () => {
      render(<FilterChip {...defaultProps} isSelected={true} />);
      const el = screen.getByRole("checkbox");
      expect(el).toHaveClass("bg-[var(--status-primary)]");
      expect(el).toHaveClass("text-[var(--text-inverse)]");
    });
  });

  describe("インタラクション", () => {
    it("クリック時に onClick が呼び出される", () => {
      const handleClick = vi.fn();
      render(<FilterChip {...defaultProps} onClick={handleClick} />);
      fireEvent.click(screen.getByRole("checkbox"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("disabled=true 時に onClick が呼び出されない", () => {
      const handleClick = vi.fn();
      render(
        <FilterChip {...defaultProps} onClick={handleClick} disabled={true} />,
      );
      fireEvent.click(screen.getByRole("checkbox"));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("追加プロパティ", () => {
    it("count を表示する", () => {
      render(<FilterChip {...defaultProps} count={42} />);
      expect(screen.getByText("(42)")).toBeInTheDocument();
    });

    it("icon を表示する", () => {
      const { container } = render(
        <FilterChip {...defaultProps} icon="check" />,
      );
      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe("アクセシビリティ", () => {
    it('role="checkbox" 属性を持つ', () => {
      render(<FilterChip {...defaultProps} />);
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it('isSelected=true で aria-checked="true" が設定される', () => {
      render(<FilterChip {...defaultProps} isSelected={true} />);
      const el = screen.getByRole("checkbox");
      expect(el).toHaveAttribute("aria-checked", "true");
    });

    it('isSelected=false で aria-checked="false" が設定される', () => {
      render(<FilterChip {...defaultProps} isSelected={false} />);
      const el = screen.getByRole("checkbox");
      expect(el).toHaveAttribute("aria-checked", "false");
    });

    it('disabled=true で aria-disabled="true" が設定される', () => {
      render(<FilterChip {...defaultProps} disabled={true} />);
      const el = screen.getByRole("checkbox");
      expect(el).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("タッチターゲット", () => {
    it("最小タッチターゲット min-h-[36px] が設定される", () => {
      render(<FilterChip {...defaultProps} />);
      const el = screen.getByRole("checkbox");
      expect(el).toHaveClass("min-h-[36px]");
    });
  });

  describe("フォーカス管理", () => {
    it("F-02: フォーカス可能である", () => {
      render(<FilterChip {...defaultProps} />);
      const el = screen.getByRole("checkbox");
      el.focus();
      expect(document.activeElement).toBe(el);
    });
  });

  describe("マイクロインタラクション", () => {
    it("MI-07: transition-allクラスが設定されている", () => {
      render(<FilterChip {...defaultProps} />);
      const el = screen.getByRole("checkbox");
      expect(el).toHaveClass("transition-all");
    });
  });

  describe("テーマ対応", () => {
    it("3テーマでレンダリングエラーが発生しない", () => {
      const results = renderWithAllThemes(<FilterChip {...defaultProps} />);
      expect(results["kanagawa-dragon"]).toBeDefined();
      expect(results["light"]).toBeDefined();
      expect(results["dark"]).toBeDefined();
    });
  });

  describe("エッジケース", () => {
    it('FE-02: label=""（空文字列）でレンダリングされるがラベルテキストが空', () => {
      render(<FilterChip {...defaultProps} label="" />);
      const el = screen.getByRole("checkbox");
      expect(el).toBeInTheDocument();
      // ラベル用のspan要素のテキストが空であること
      const spans = el.querySelectorAll("span");
      const labelSpan = spans[spans.length - 1];
      expect(labelSpan).toBeDefined();
      expect(labelSpan?.textContent).toBe("");
    });

    it("FE-03: count={0} で (0) が表示される", () => {
      render(<FilterChip {...defaultProps} count={0} />);
      expect(screen.getByText("(0)")).toBeInTheDocument();
    });

    it("FE-05: icon と count の同時指定でアイコンとcountが両方表示される", () => {
      const { container } = render(
        <FilterChip {...defaultProps} icon="check" count={5} />,
      );
      // countが表示される
      expect(screen.getByText("(5)")).toBeInTheDocument();
      // アイコンが表示される
      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });
});
