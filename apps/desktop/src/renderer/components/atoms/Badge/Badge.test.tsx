import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./index";
import { renderWithAllThemes } from "../../../tests/helpers/renderWithTheme";

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
      expect(screen.getByText("Default")).toHaveClass(
        "bg-[var(--bg-tertiary)]",
      );
    });

    it("successバリアントのスタイルを適用する", () => {
      render(<Badge variant="success">Success</Badge>);
      expect(screen.getByText("Success")).toHaveClass(
        "bg-[var(--status-success)]",
      );
    });

    it("warningバリアントのスタイルを適用する", () => {
      render(<Badge variant="warning">Warning</Badge>);
      expect(screen.getByText("Warning")).toHaveClass(
        "bg-[var(--status-warning)]",
      );
    });

    it("errorバリアントのスタイルを適用する", () => {
      render(<Badge variant="error">Error</Badge>);
      expect(screen.getByText("Error")).toHaveClass("bg-[var(--status-error)]");
    });

    it("infoバリアントのスタイルを適用する", () => {
      render(<Badge variant="info">Info</Badge>);
      expect(screen.getByText("Info")).toHaveClass("bg-[var(--status-info)]");
    });

    it("デフォルトでdefaultバリアントを使用する", () => {
      render(<Badge>Badge</Badge>);
      expect(screen.getByText("Badge")).toHaveClass("bg-[var(--bg-tertiary)]");
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

  describe("Badge拡張", () => {
    it("variant='primary'でプライマリスタイルを適用する", () => {
      render(<Badge variant="primary">Primary</Badge>);
      const badge = screen.getByText("Primary");
      expect(badge).toHaveClass("bg-[var(--status-primary)]");
      expect(badge).toHaveClass("text-[var(--text-inverse)]");
    });

    it("content='テスト'で文字列コンテンツを表示する", () => {
      render(<Badge content="テスト" />);
      expect(screen.getByText("テスト")).toBeInTheDocument();
    });

    it("content={42}で数値コンテンツを表示する", () => {
      render(<Badge content={42} />);
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("contentがnumber型でaria-label='{content}件'を自動設定する", () => {
      render(<Badge content={42} />);
      const badge = screen.getByRole("status");
      expect(badge).toHaveAttribute("aria-label", "42件");
    });

    it("明示的aria-labelが自動付与より優先する", () => {
      render(<Badge content={42} aria-label="カスタムラベル" />);
      const badge = screen.getByRole("status");
      expect(badge).toHaveAttribute("aria-label", "カスタムラベル");
    });

    it("contentとchildren両方指定時にchildrenを優先する", () => {
      render(<Badge content={42}>カスタム</Badge>);
      expect(screen.getByText("カスタム")).toBeInTheDocument();
      expect(screen.queryByText("42")).not.toBeInTheDocument();
    });

    it("contentのみ指定（childrenなし）でcontentを表示する", () => {
      render(<Badge content="バッジ内容" />);
      expect(screen.getByText("バッジ内容")).toBeInTheDocument();
    });

    it("3テーマでレンダリングエラーなし", () => {
      expect(() => {
        renderWithAllThemes(<Badge content={5} />);
      }).not.toThrow();
    });
  });

  describe("エッジケース", () => {
    it('BE-01: content={0} で "0" が表示され、aria-label="0件" が設定される', () => {
      render(<Badge content={0} />);
      expect(screen.getByText("0")).toBeInTheDocument();
      const badge = screen.getByRole("status");
      expect(badge).toHaveAttribute("aria-label", "0件");
    });

    it('BE-02: content="" で空のBadgeがレンダリングされる', () => {
      render(<Badge content="" />);
      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
      expect(badge.textContent).toBe("");
    });

    it("BE-04: content={99999} で数値がそのまま表示される", () => {
      render(<Badge content={99999} />);
      expect(screen.getByText("99999")).toBeInTheDocument();
      const badge = screen.getByRole("status");
      expect(badge).toHaveAttribute("aria-label", "99999件");
    });
  });
});
