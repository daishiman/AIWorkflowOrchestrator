import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./index";

describe("Badge", () => {
  describe("レンダリング", () => {
    it("子要素を正しくレンダリングする", () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText("New")).toBeInTheDocument();
    });

    it("span要素としてレンダリングする", () => {
      render(<Badge>Status</Badge>);
      expect(screen.getByText("Status").tagName).toBe("SPAN");
    });
  });

  describe("バリアント", () => {
    it("defaultバリアントのスタイルを適用する", () => {
      render(<Badge variant="default">Default</Badge>);
      expect(screen.getByText("Default")).toHaveClass("bg-gray-600");
    });

    it("successバリアントのスタイルを適用する", () => {
      render(<Badge variant="success">Success</Badge>);
      expect(screen.getByText("Success")).toHaveClass("bg-green-500");
    });

    it("warningバリアントのスタイルを適用する", () => {
      render(<Badge variant="warning">Warning</Badge>);
      expect(screen.getByText("Warning")).toHaveClass("bg-orange-400");
    });

    it("errorバリアントのスタイルを適用する", () => {
      render(<Badge variant="error">Error</Badge>);
      expect(screen.getByText("Error")).toHaveClass("bg-red-500");
    });

    it("infoバリアントのスタイルを適用する", () => {
      render(<Badge variant="info">Info</Badge>);
      expect(screen.getByText("Info")).toHaveClass("bg-blue-500");
    });

    it("デフォルトでdefaultバリアントを使用する", () => {
      render(<Badge>Badge</Badge>);
      expect(screen.getByText("Badge")).toHaveClass("bg-gray-600");
    });
  });

  describe("サイズ", () => {
    it("smサイズのスタイルを適用する", () => {
      render(<Badge size="sm">Small</Badge>);
      const badge = screen.getByText("Small");
      expect(badge).toHaveClass("h-5");
      expect(badge).toHaveClass("text-xs");
    });

    it("mdサイズのスタイルを適用する", () => {
      render(<Badge size="md">Medium</Badge>);
      const badge = screen.getByText("Medium");
      expect(badge).toHaveClass("h-6");
      expect(badge).toHaveClass("text-sm");
    });

    it("デフォルトでmdサイズを使用する", () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass("h-6");
    });
  });

  describe("スタイル", () => {
    it("rounded-fullクラスを持つ", () => {
      render(<Badge>Rounded</Badge>);
      expect(screen.getByText("Rounded")).toHaveClass("rounded-full");
    });

    it("inline-flexクラスを持つ", () => {
      render(<Badge>Flex</Badge>);
      expect(screen.getByText("Flex")).toHaveClass("inline-flex");
    });

    it("whitespace-nowrapクラスを持つ", () => {
      render(<Badge>No Wrap</Badge>);
      expect(screen.getByText("No Wrap")).toHaveClass("whitespace-nowrap");
    });
  });

  describe("アクセシビリティ", () => {
    it("role=statusを持つ", () => {
      render(<Badge>Status Badge</Badge>);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      render(<Badge className="custom-class">Custom</Badge>);
      expect(screen.getByText("Custom")).toHaveClass("custom-class");
    });

    it("カスタムclassNameがデフォルトスタイルと共存する", () => {
      render(<Badge className="custom-class">Custom</Badge>);
      const badge = screen.getByText("Custom");
      expect(badge).toHaveClass("custom-class");
      expect(badge).toHaveClass("rounded-full");
    });
  });

  describe("ref", () => {
    it("refを正しく転送する", () => {
      const ref = vi.fn();
      render(<Badge ref={ref}>With Ref</Badge>);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLSpanElement);
    });
  });

  describe("追加のprops", () => {
    it("追加のHTML属性を渡せる", () => {
      render(<Badge data-testid="test-badge">Test</Badge>);
      expect(screen.getByTestId("test-badge")).toBeInTheDocument();
    });

    it("titleを設定できる", () => {
      render(<Badge title="Badge tooltip">Hover</Badge>);
      expect(screen.getByText("Hover")).toHaveAttribute(
        "title",
        "Badge tooltip",
      );
    });
  });
});
