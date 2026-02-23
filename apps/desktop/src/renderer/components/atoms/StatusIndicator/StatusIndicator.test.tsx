import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusIndicator } from "./index";
import { renderWithAllThemes } from "../../../tests/helpers/renderWithTheme";

describe("StatusIndicator", () => {
  describe("ステータスカラー", () => {
    it('status="running" で bg-[var(--status-primary)] クラスが適用される', () => {
      render(<StatusIndicator status="running" />);
      const el = screen.getByRole("status");
      expect(el).toHaveClass("bg-[var(--status-primary)]");
    });

    it('status="success" で bg-[var(--status-success)] クラスが適用される', () => {
      render(<StatusIndicator status="success" />);
      const el = screen.getByRole("status");
      expect(el).toHaveClass("bg-[var(--status-success)]");
    });

    it('status="error" で bg-[var(--status-error)] クラスが適用される', () => {
      render(<StatusIndicator status="error" />);
      const el = screen.getByRole("status");
      expect(el).toHaveClass("bg-[var(--status-error)]");
    });

    it('status="warning" で bg-[var(--status-warning)] クラスが適用される', () => {
      render(<StatusIndicator status="warning" />);
      const el = screen.getByRole("status");
      expect(el).toHaveClass("bg-[var(--status-warning)]");
    });

    it('status="idle" で bg-[var(--text-muted)] クラスが適用される', () => {
      render(<StatusIndicator status="idle" />);
      const el = screen.getByRole("status");
      expect(el).toHaveClass("bg-[var(--text-muted)]");
    });

    it('status="offline" で bg-[var(--text-muted)] クラスが適用される', () => {
      render(<StatusIndicator status="offline" />);
      const el = screen.getByRole("status");
      expect(el).toHaveClass("bg-[var(--text-muted)]");
    });

    it('status="offline" で border-dashed クラスが適用される', () => {
      render(<StatusIndicator status="offline" />);
      const el = screen.getByRole("status");
      expect(el).toHaveClass("border-dashed");
    });
  });

  describe("パルスアニメーション", () => {
    it('status="running" でデフォルトの pulse アニメーション（animate-pulse）が適用される', () => {
      render(<StatusIndicator status="running" />);
      const el = screen.getByRole("status");
      expect(el).toHaveClass("animate-pulse");
    });

    it("pulse=false でアニメーションが無効になる", () => {
      render(<StatusIndicator status="running" pulse={false} />);
      const el = screen.getByRole("status");
      expect(el).not.toHaveClass("animate-pulse");
    });

    it('status="idle" + pulse=true でアニメーションが有効になる', () => {
      render(<StatusIndicator status="idle" pulse={true} />);
      const el = screen.getByRole("status");
      expect(el).toHaveClass("animate-pulse");
    });
  });

  describe("サイズ", () => {
    it('size="sm" で w-2 h-2 クラスが適用される', () => {
      render(<StatusIndicator status="running" size="sm" />);
      const el = screen.getByRole("status");
      expect(el).toHaveClass("w-2");
      expect(el).toHaveClass("h-2");
    });

    it('size="md"（デフォルト）で w-[10px] h-[10px] クラスが適用される', () => {
      render(<StatusIndicator status="running" />);
      const el = screen.getByRole("status");
      expect(el).toHaveClass("w-[10px]");
      expect(el).toHaveClass("h-[10px]");
    });

    it('size="lg" で w-[14px] h-[14px] クラスが適用される', () => {
      render(<StatusIndicator status="running" size="lg" />);
      const el = screen.getByRole("status");
      expect(el).toHaveClass("w-[14px]");
      expect(el).toHaveClass("h-[14px]");
    });
  });

  describe("アクセシビリティ", () => {
    it('role="status" 属性を持つ', () => {
      render(<StatusIndicator status="running" />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it('デフォルトで aria-label="ステータス: {status}" が設定される', () => {
      render(<StatusIndicator status="running" />);
      const el = screen.getByRole("status");
      expect(el).toHaveAttribute("aria-label", "ステータス: running");
    });

    it("label props で aria-label が上書きされる", () => {
      render(<StatusIndicator status="running" label="カスタムラベル" />);
      const el = screen.getByRole("status");
      expect(el).toHaveAttribute("aria-label", "カスタムラベル");
    });
  });

  describe("テーマ対応", () => {
    it("3テーマでレンダリングエラーが発生しない", () => {
      const results = renderWithAllThemes(<StatusIndicator status="running" />);
      expect(results["kanagawa-dragon"]).toBeDefined();
      expect(results["light"]).toBeDefined();
      expect(results["dark"]).toBeDefined();
    });
  });

  describe("マイクロインタラクション", () => {
    it("MI-04: status='idle' でデフォルト時 animate-pulse クラスを持たない", () => {
      render(<StatusIndicator status="idle" />);
      const el = screen.getByRole("status");
      expect(el).not.toHaveClass("animate-pulse");
    });
  });

  describe("エッジケース", () => {
    it("SE-03: pulse={true} + status='success' で animate-pulse クラスが付与される", () => {
      render(<StatusIndicator status="success" pulse={true} />);
      const el = screen.getByRole("status");
      expect(el).toHaveClass("animate-pulse");
    });
  });
});
