import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Avatar } from "./index";

describe("Avatar", () => {
  describe("レンダリング", () => {
    it("アバターをレンダリングする", () => {
      render(<Avatar alt="User avatar" />);
      expect(screen.getByRole("img")).toBeInTheDocument();
    });

    it("alt属性をaria-labelとして設定する", () => {
      render(<Avatar alt="John Doe" />);
      expect(screen.getByRole("img")).toHaveAttribute("aria-label", "John Doe");
    });
  });

  describe("画像表示", () => {
    it("src propがある場合、画像を表示する", () => {
      const { container } = render(
        <Avatar src="https://example.com/avatar.jpg" alt="User" />,
      );
      const img = container.querySelector("img");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
    });

    it("画像のalt属性を設定する", () => {
      const { container } = render(
        <Avatar src="https://example.com/avatar.jpg" alt="User avatar" />,
      );
      const img = container.querySelector("img");
      expect(img).toHaveAttribute("alt", "User avatar");
    });

    it("画像エラー時にフォールバックを表示する", () => {
      const { container } = render(
        <Avatar src="invalid-url.jpg" alt="John Doe" />,
      );
      const img = container.querySelector("img");
      fireEvent.error(img!);
      expect(screen.getByText("JO")).toBeInTheDocument();
    });
  });

  describe("フォールバック", () => {
    it("srcがない場合、フォールバックを表示する", () => {
      render(<Avatar alt="John Doe" />);
      expect(screen.getByText("JO")).toBeInTheDocument();
    });

    it("fallback propが優先される", () => {
      render(<Avatar alt="John Doe" fallback="AB" />);
      expect(screen.getByText("AB")).toBeInTheDocument();
    });

    it("フォールバックを大文字に変換する", () => {
      render(<Avatar alt="john doe" />);
      expect(screen.getByText("JO")).toBeInTheDocument();
    });

    it("フォールバックは2文字に制限される", () => {
      render(<Avatar alt="Very Long Name" fallback="Test" />);
      expect(screen.getByText("TE")).toBeInTheDocument();
    });

    it("alt も fallback もない場合、? を表示する", () => {
      render(<Avatar alt="" />);
      expect(screen.getByText("?")).toBeInTheDocument();
    });

    it("フォールバックテキストはaria-hidden", () => {
      render(<Avatar alt="John" />);
      const fallbackText = screen.getByText("JO");
      expect(fallbackText).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("サイズ", () => {
    it("smサイズのスタイルを適用する", () => {
      render(<Avatar alt="User" size="sm" />);
      expect(screen.getByRole("img")).toHaveClass("w-6", "h-6");
    });

    it("mdサイズ（デフォルト）のスタイルを適用する", () => {
      render(<Avatar alt="User" size="md" />);
      expect(screen.getByRole("img")).toHaveClass("w-8", "h-8");
    });

    it("lgサイズのスタイルを適用する", () => {
      render(<Avatar alt="User" size="lg" />);
      expect(screen.getByRole("img")).toHaveClass("w-10", "h-10");
    });

    it("xlサイズのスタイルを適用する", () => {
      render(<Avatar alt="User" size="xl" />);
      expect(screen.getByRole("img")).toHaveClass("w-16", "h-16");
    });
  });

  describe("スタイル", () => {
    it("rounded-fullクラスを持つ", () => {
      render(<Avatar alt="User" />);
      expect(screen.getByRole("img")).toHaveClass("rounded-full");
    });

    it("overflow-hiddenクラスを持つ", () => {
      render(<Avatar alt="User" />);
      expect(screen.getByRole("img")).toHaveClass("overflow-hidden");
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      render(<Avatar alt="User" className="custom-class" />);
      expect(screen.getByRole("img")).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(Avatar.displayName).toBe("Avatar");
    });
  });
});
