import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Spinner } from "./index";

describe("Spinner", () => {
  describe("レンダリング", () => {
    it("スピナーをレンダリングする", () => {
      const { container } = render(<Spinner />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("animate-spinクラスを持つ", () => {
      const { container } = render(<Spinner />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("animate-spin");
    });
  });

  describe("サイズ", () => {
    it("smサイズ（16px）を適用する", () => {
      const { container } = render(<Spinner size="sm" />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "16");
      expect(svg).toHaveAttribute("height", "16");
    });

    it("mdサイズ（24px）をデフォルトで適用する", () => {
      const { container } = render(<Spinner />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "24");
      expect(svg).toHaveAttribute("height", "24");
    });

    it("lgサイズ（32px）を適用する", () => {
      const { container } = render(<Spinner size="lg" />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "32");
      expect(svg).toHaveAttribute("height", "32");
    });
  });

  describe("カラー", () => {
    it("デフォルトカラー（currentColor）を適用する", () => {
      const { container } = render(<Spinner />);
      const svg = container.querySelector("svg");
      // Lucide Reactはstroke属性でカラーを適用する
      expect(svg).toHaveAttribute("stroke", "currentColor");
    });

    it("カスタムカラーを適用する", () => {
      const { container } = render(<Spinner color="blue" />);
      const svg = container.querySelector("svg");
      // Lucide Reactはstroke属性でカラーを適用する
      expect(svg).toHaveAttribute("stroke", "blue");
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      const { container } = render(<Spinner className="custom-class" />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("custom-class");
    });

    it("animate-spinとカスタムclassNameを併用する", () => {
      const { container } = render(<Spinner className="custom-class" />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("animate-spin", "custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(Spinner.displayName).toBe("Spinner");
    });
  });
});
