import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GlassPanel } from "./index";

describe("GlassPanel", () => {
  describe("レンダリング", () => {
    it("子要素をレンダリングする", () => {
      render(<GlassPanel>Content</GlassPanel>);
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("div要素としてレンダリングする", () => {
      const { container } = render(<GlassPanel>Content</GlassPanel>);
      expect(container.firstChild?.nodeName).toBe("DIV");
    });
  });

  describe("radius", () => {
    it("radius=noneでrounded-noneを適用する", () => {
      const { container } = render(
        <GlassPanel radius="none">Content</GlassPanel>,
      );
      expect(container.firstChild).toHaveClass("rounded-none");
    });

    it("radius=smでrounded-[8px]を適用する", () => {
      const { container } = render(
        <GlassPanel radius="sm">Content</GlassPanel>,
      );
      expect(container.firstChild).toHaveClass("rounded-[8px]");
    });

    it("radius=md（デフォルト）でrounded-[16px]を適用する", () => {
      const { container } = render(<GlassPanel>Content</GlassPanel>);
      expect(container.firstChild).toHaveClass("rounded-[16px]");
    });

    it("radius=lgでrounded-[24px]を適用する", () => {
      const { container } = render(
        <GlassPanel radius="lg">Content</GlassPanel>,
      );
      expect(container.firstChild).toHaveClass("rounded-[24px]");
    });
  });

  describe("blur", () => {
    it("blur=noneでbackdrop-blur-noneを適用する", () => {
      const { container } = render(
        <GlassPanel blur="none">Content</GlassPanel>,
      );
      expect(container.firstChild).toHaveClass("backdrop-blur-none");
    });

    it("blur=smでbackdrop-blur-[10px]を適用する", () => {
      const { container } = render(<GlassPanel blur="sm">Content</GlassPanel>);
      expect(container.firstChild).toHaveClass("backdrop-blur-[10px]");
    });

    it("blur=md（デフォルト）でbackdrop-blur-[20px]を適用する", () => {
      const { container } = render(<GlassPanel>Content</GlassPanel>);
      expect(container.firstChild).toHaveClass("backdrop-blur-[20px]");
    });

    it("blur=lgでbackdrop-blur-[40px]を適用する", () => {
      const { container } = render(<GlassPanel blur="lg">Content</GlassPanel>);
      expect(container.firstChild).toHaveClass("backdrop-blur-[40px]");
    });
  });

  describe("スタイル", () => {
    it("relativeクラスを持つ", () => {
      const { container } = render(<GlassPanel>Content</GlassPanel>);
      expect(container.firstChild).toHaveClass("relative");
    });

    it("glass背景スタイルを持つ", () => {
      const { container } = render(<GlassPanel>Content</GlassPanel>);
      expect(container.firstChild).toHaveClass("bg-[rgba(30,30,30,0.6)]");
    });

    it("borderスタイルを持つ", () => {
      const { container } = render(<GlassPanel>Content</GlassPanel>);
      expect(container.firstChild).toHaveClass("border");
      expect(container.firstChild).toHaveClass("border-white/10");
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      const { container } = render(
        <GlassPanel className="custom-class">Content</GlassPanel>,
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("カスタムclassNameがデフォルトスタイルと共存する", () => {
      const { container } = render(
        <GlassPanel className="custom-class">Content</GlassPanel>,
      );
      expect(container.firstChild).toHaveClass("custom-class");
      expect(container.firstChild).toHaveClass("relative");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(GlassPanel.displayName).toBe("GlassPanel");
    });
  });
});
