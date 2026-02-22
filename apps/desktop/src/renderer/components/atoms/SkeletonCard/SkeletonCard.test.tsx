import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkeletonCard } from "./index";
import { renderWithAllThemes } from "../../../tests/helpers/renderWithTheme";

describe("SkeletonCard", () => {
  describe("バリエーション", () => {
    it("variant='default'でヘッダーライン（幅60%）とボディライン2本（幅80%/100%）を描画する", () => {
      render(<SkeletonCard variant="default" />);
      const container = screen.getByRole("status");

      const header = container.querySelector("[data-testid='skeleton-header']");
      const body1 = container.querySelector("[data-testid='skeleton-body-1']");
      const body2 = container.querySelector("[data-testid='skeleton-body-2']");

      expect(header).toBeInTheDocument();
      expect(body1).toBeInTheDocument();
      expect(body2).toBeInTheDocument();
      expect(header).toHaveClass("w-[60%]");
      expect(body1).toHaveClass("w-[80%]");
      expect(body2).toHaveClass("w-full");
    });

    it("variant='stat'で数値プレースホルダー（幅40%）とラベルライン（幅60%）を描画する", () => {
      render(<SkeletonCard variant="stat" />);
      const container = screen.getByRole("status");

      const number = container.querySelector("[data-testid='skeleton-number']");
      const label = container.querySelector("[data-testid='skeleton-label']");

      expect(number).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(number).toHaveClass("w-[40%]");
      expect(label).toHaveClass("w-[60%]");
    });

    it("variant='list-item'でアイコン円（32px）とテキストライン2本（幅70%/50%）を描画する", () => {
      render(<SkeletonCard variant="list-item" />);
      const container = screen.getByRole("status");

      const icon = container.querySelector("[data-testid='skeleton-icon']");
      const text1 = container.querySelector("[data-testid='skeleton-text-1']");
      const text2 = container.querySelector("[data-testid='skeleton-text-2']");

      expect(icon).toBeInTheDocument();
      expect(text1).toBeInTheDocument();
      expect(text2).toBeInTheDocument();
      expect(icon).toHaveClass("w-8");
      expect(icon).toHaveClass("h-8");
      expect(icon).toHaveClass("rounded-full");
      expect(text1).toHaveClass("w-[70%]");
      expect(text2).toHaveClass("w-[50%]");
    });

    it("デフォルトでvariant='default'を使用する", () => {
      render(<SkeletonCard />);
      const container = screen.getByRole("status");
      const header = container.querySelector("[data-testid='skeleton-header']");
      expect(header).toBeInTheDocument();
    });
  });

  describe("アニメーション", () => {
    it("animate=true（デフォルト）でanimate-pulseクラスを持つ", () => {
      render(<SkeletonCard />);
      const container = screen.getByRole("status");
      expect(container).toHaveClass("animate-pulse");
    });

    it("animate=falseでanimate-pulseクラスを持たない", () => {
      render(<SkeletonCard animate={false} />);
      const container = screen.getByRole("status");
      expect(container).not.toHaveClass("animate-pulse");
    });
  });

  describe("カスタムスタイル", () => {
    it("heightプロパティでカスタム高さを設定する", () => {
      render(<SkeletonCard height="200px" />);
      const container = screen.getByRole("status");
      expect(container.style.height).toBe("200px");
    });

    it("borderRadiusプロパティでカスタム角丸を設定する", () => {
      render(<SkeletonCard borderRadius="16px" />);
      const container = screen.getByRole("status");
      expect(container.style.borderRadius).toBe("16px");
    });
  });

  describe("アクセシビリティ", () => {
    it("role='status'を設定する", () => {
      render(<SkeletonCard />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("aria-label='読み込み中'を設定する", () => {
      render(<SkeletonCard />);
      const container = screen.getByRole("status");
      expect(container).toHaveAttribute("aria-label", "読み込み中");
    });

    it("aria-busy='true'を設定する", () => {
      render(<SkeletonCard />);
      const container = screen.getByRole("status");
      expect(container).toHaveAttribute("aria-busy", "true");
    });
  });

  describe("スタイル", () => {
    it("背景色bg-[var(--bg-tertiary)]を使用する", () => {
      render(<SkeletonCard />);
      const container = screen.getByRole("status");
      expect(container).toHaveClass("bg-[var(--bg-tertiary)]");
    });
  });

  describe("テーマ", () => {
    it("3テーマでレンダリングエラーなし", () => {
      expect(() => {
        renderWithAllThemes(<SkeletonCard />);
      }).not.toThrow();
    });
  });
});
