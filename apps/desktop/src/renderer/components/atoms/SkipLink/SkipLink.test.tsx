import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkipLink } from "./index";

describe("SkipLink", () => {
  describe("レンダリング", () => {
    it("デフォルトのテキストを表示する", () => {
      render(<SkipLink href="#main" />);
      expect(
        screen.getByText("メインコンテンツへスキップ"),
      ).toBeInTheDocument();
    });

    it("カスタムテキストを表示する", () => {
      render(<SkipLink href="#main">コンテンツへ移動</SkipLink>);
      expect(screen.getByText("コンテンツへ移動")).toBeInTheDocument();
    });

    it("正しいhrefを持つ", () => {
      render(<SkipLink href="#main-content" />);
      expect(screen.getByRole("link")).toHaveAttribute("href", "#main-content");
    });
  });

  describe("アクセシビリティ", () => {
    it("sr-onlyクラスを持つ（視覚的に隠れている）", () => {
      render(<SkipLink href="#main" />);
      expect(screen.getByRole("link")).toHaveClass("sr-only");
    });

    it("フォーカス時に表示される", () => {
      render(<SkipLink href="#main" />);
      expect(screen.getByRole("link")).toHaveClass("focus:not-sr-only");
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      render(<SkipLink href="#main" className="custom-class" />);
      expect(screen.getByRole("link")).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(SkipLink.displayName).toBe("SkipLink");
    });
  });
});
