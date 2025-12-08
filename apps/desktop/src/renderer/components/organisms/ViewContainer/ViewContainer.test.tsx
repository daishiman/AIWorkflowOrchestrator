import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ViewContainer } from "./index";

describe("ViewContainer", () => {
  describe("レンダリング", () => {
    it("子要素をレンダリングする", () => {
      render(<ViewContainer>Content</ViewContainer>);
      expect(screen.getByText("Content")).toBeInTheDocument();
    });
  });

  describe("パディング", () => {
    it("padding=noneでp-0を適用する", () => {
      const { container } = render(
        <ViewContainer padding="none">Content</ViewContainer>,
      );
      expect(container.firstChild).toHaveClass("p-0");
    });

    it("padding=smでp-[16px]を適用する", () => {
      const { container } = render(
        <ViewContainer padding="sm">Content</ViewContainer>,
      );
      expect(container.firstChild).toHaveClass("p-[16px]");
    });

    it("padding=md（デフォルト）でp-[24px]を適用する", () => {
      const { container } = render(<ViewContainer>Content</ViewContainer>);
      expect(container.firstChild).toHaveClass("p-[24px]");
    });

    it("padding=lgでp-[32px]を適用する", () => {
      const { container } = render(
        <ViewContainer padding="lg">Content</ViewContainer>,
      );
      expect(container.firstChild).toHaveClass("p-[32px]");
    });
  });

  describe("スクロール", () => {
    it("scroll=noneでoverflow-hiddenを適用する", () => {
      const { container } = render(
        <ViewContainer scroll="none">Content</ViewContainer>,
      );
      expect(container.firstChild).toHaveClass("overflow-hidden");
    });

    it("scroll=vertical（デフォルト）でoverflow-y-autoを適用する", () => {
      const { container } = render(<ViewContainer>Content</ViewContainer>);
      expect(container.firstChild).toHaveClass("overflow-y-auto");
      expect(container.firstChild).toHaveClass("overflow-x-hidden");
    });

    it("scroll=horizontalでoverflow-x-autoを適用する", () => {
      const { container } = render(
        <ViewContainer scroll="horizontal">Content</ViewContainer>,
      );
      expect(container.firstChild).toHaveClass("overflow-x-auto");
      expect(container.firstChild).toHaveClass("overflow-y-hidden");
    });

    it("scroll=bothでoverflow-autoを適用する", () => {
      const { container } = render(
        <ViewContainer scroll="both">Content</ViewContainer>,
      );
      expect(container.firstChild).toHaveClass("overflow-auto");
    });
  });

  describe("スタイル", () => {
    it("h-fullクラスを持つ", () => {
      const { container } = render(<ViewContainer>Content</ViewContainer>);
      expect(container.firstChild).toHaveClass("h-full");
    });

    it("GlassPanelのスタイルを継承する", () => {
      const { container } = render(<ViewContainer>Content</ViewContainer>);
      // GlassPanelのデフォルトスタイル
      expect(container.firstChild).toHaveClass("rounded-[24px]"); // radius=lg
      expect(container.firstChild).toHaveClass("backdrop-blur-[20px]"); // blur=md
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      const { container } = render(
        <ViewContainer className="custom-class">Content</ViewContainer>,
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(ViewContainer.displayName).toBe("ViewContainer");
    });
  });
});
