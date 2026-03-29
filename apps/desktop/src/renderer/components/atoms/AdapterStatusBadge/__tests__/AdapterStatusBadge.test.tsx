import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdapterStatusBadge } from "../index";

describe("AdapterStatusBadge", () => {
  describe("ステータス表示", () => {
    it('status="ready" で "準備完了" テキストと success バリアントを表示する', () => {
      render(<AdapterStatusBadge status="ready" />);
      const badge = screen.getByRole("status");
      expect(badge).toHaveTextContent("準備完了");
      expect(badge).toHaveClass("bg-[var(--status-success)]");
    });

    it('status="initializing" で "初期化中" テキストと warning バリアントを表示する', () => {
      render(<AdapterStatusBadge status="initializing" />);
      const badge = screen.getByRole("status");
      expect(badge).toHaveTextContent("初期化中");
      expect(badge).toHaveClass("bg-[var(--status-warning)]");
    });

    it('status="initializing" で Spinner を表示する', () => {
      render(<AdapterStatusBadge status="initializing" />);
      const badge = screen.getByRole("status");
      // Spinner は badge 内にレンダリングされる
      const spinner = badge.querySelector(
        "[role='progressbar'], .animate-spin",
      );
      expect(spinner).toBeInTheDocument();
    });

    it('status="failed" で "エラー" テキストと error バリアントを表示する', () => {
      render(<AdapterStatusBadge status="failed" />);
      const badge = screen.getByRole("status");
      expect(badge).toHaveTextContent("エラー");
      expect(badge).toHaveClass("bg-[var(--status-error)]");
    });
  });

  describe("failureReason", () => {
    it("failureReason が指定された場合、aria-label に含める", () => {
      render(
        <AdapterStatusBadge
          status="failed"
          failureReason="APIキーが無効です"
        />,
      );
      const badge = screen.getByRole("status");
      expect(badge).toHaveAttribute(
        "aria-label",
        "アダプターエラー: APIキーが無効です",
      );
    });

    it("failureReason が指定された場合、title 属性に設定する", () => {
      render(
        <AdapterStatusBadge status="failed" failureReason="接続タイムアウト" />,
      );
      const badge = screen.getByRole("status");
      expect(badge).toHaveAttribute("title", "接続タイムアウト");
    });

    it("failureReason が未指定の場合、title 属性が設定されない", () => {
      render(<AdapterStatusBadge status="failed" />);
      const badge = screen.getByRole("status");
      expect(badge).not.toHaveAttribute("title");
    });
  });

  describe("アクセシビリティ", () => {
    it('role="status" を持つ（Badge から継承）', () => {
      render(<AdapterStatusBadge status="ready" />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("failureReason なしでデフォルトの aria-label を持つ", () => {
      render(<AdapterStatusBadge status="ready" />);
      const badge = screen.getByRole("status");
      expect(badge).toHaveAttribute("aria-label", "アダプター準備完了");
    });
  });
});
