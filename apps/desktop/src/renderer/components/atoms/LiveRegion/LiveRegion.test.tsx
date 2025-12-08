import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LiveRegion } from "./index";

describe("LiveRegion", () => {
  describe("レンダリング", () => {
    it("メッセージを表示する", () => {
      render(<LiveRegion message="データを読み込み中" />);
      expect(screen.getByText("データを読み込み中")).toBeInTheDocument();
    });

    it("role=statusを持つ", () => {
      render(<LiveRegion message="テスト" />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  describe("aria属性", () => {
    it("デフォルトでaria-live=politeを持つ", () => {
      render(<LiveRegion message="テスト" />);
      expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    });

    it("aria-live=assertiveを設定できる", () => {
      render(<LiveRegion message="テスト" politeness="assertive" />);
      expect(screen.getByRole("status")).toHaveAttribute(
        "aria-live",
        "assertive",
      );
    });

    it("デフォルトでaria-atomic=trueを持つ", () => {
      render(<LiveRegion message="テスト" />);
      expect(screen.getByRole("status")).toHaveAttribute("aria-atomic", "true");
    });

    it("aria-atomic=falseを設定できる", () => {
      render(<LiveRegion message="テスト" atomic={false} />);
      expect(screen.getByRole("status")).toHaveAttribute(
        "aria-atomic",
        "false",
      );
    });
  });

  describe("アクセシビリティ", () => {
    it("sr-onlyクラスを持つ（視覚的に隠れている）", () => {
      render(<LiveRegion message="テスト" />);
      expect(screen.getByRole("status")).toHaveClass("sr-only");
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      render(<LiveRegion message="テスト" className="custom-class" />);
      expect(screen.getByRole("status")).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(LiveRegion.displayName).toBe("LiveRegion");
    });
  });
});
