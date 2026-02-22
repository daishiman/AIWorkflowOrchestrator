import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "./index";
import { renderWithAllThemes } from "../../../tests/helpers/renderWithTheme";

describe("EmptyState", () => {
  describe("レンダリング", () => {
    it("タイトルを表示する", () => {
      render(<EmptyState title="データがありません" />);
      expect(screen.getByText("データがありません")).toBeInTheDocument();
    });

    it("説明文を表示する", () => {
      render(
        <EmptyState
          title="データがありません"
          description="新しいデータを追加してください"
        />,
      );
      expect(
        screen.getByText("新しいデータを追加してください"),
      ).toBeInTheDocument();
    });

    it("説明文なしでもレンダリングできる", () => {
      render(<EmptyState title="データがありません" />);
      expect(screen.getByText("データがありません")).toBeInTheDocument();
    });
  });

  describe("アイコン", () => {
    it("アイコンを表示する", () => {
      render(<EmptyState title="データがありません" icon="file-text" />);
      expect(screen.getByText("データがありません")).toBeInTheDocument();
    });
  });

  describe("アクション", () => {
    it("アクションを表示する", () => {
      render(
        <EmptyState
          title="データがありません"
          action={<button>追加する</button>}
        />,
      );
      expect(
        screen.getByRole("button", { name: "追加する" }),
      ).toBeInTheDocument();
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      const { container } = render(
        <EmptyState title="データがありません" className="custom-class" />,
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(EmptyState.displayName).toBe("EmptyState");
    });
  });

  describe("EmptyState拡張", () => {
    describe("suggestions", () => {
      it("suggestions 配列から role='button' 要素が正しい個数レンダリングされる", () => {
        const suggestions = [
          { label: "提案1", onClick: vi.fn() },
          { label: "提案2", onClick: vi.fn() },
          { label: "提案3", onClick: vi.fn() },
        ];
        render(<EmptyState title="空です" suggestions={suggestions} />);
        const buttons = screen.getAllByRole("button");
        expect(buttons).toHaveLength(3);
      });

      it("suggestions の各 onClick がクリック時に呼ばれる", () => {
        const onClick1 = vi.fn();
        const onClick2 = vi.fn();
        const suggestions = [
          { label: "提案A", onClick: onClick1 },
          { label: "提案B", onClick: onClick2 },
        ];
        render(<EmptyState title="空です" suggestions={suggestions} />);
        fireEvent.click(screen.getByText("提案A"));
        fireEvent.click(screen.getByText("提案B"));
        expect(onClick1).toHaveBeenCalledTimes(1);
        expect(onClick2).toHaveBeenCalledTimes(1);
      });

      it("suggestions が flex-wrap + justify-center レイアウトを持つ", () => {
        const suggestions = [{ label: "テスト", onClick: vi.fn() }];
        const { container } = render(
          <EmptyState title="空です" suggestions={suggestions} />,
        );
        const suggestionsContainer = container.querySelector(
          "[data-testid='suggestions-container']",
        );
        expect(suggestionsContainer).toHaveClass("flex-wrap");
        expect(suggestionsContainer).toHaveClass("justify-center");
      });
    });

    describe("compact", () => {
      it("compact=true でアイコンサイズ 32px", () => {
        const { container } = render(
          <EmptyState title="コンパクト" icon="sparkles" compact={true} />,
        );
        const svg = container.querySelector("svg");
        expect(svg).toHaveAttribute("width", "32");
        expect(svg).toHaveAttribute("height", "32");
      });

      it("compact=true で見出しフォント text-base", () => {
        render(<EmptyState title="コンパクト" compact={true} />);
        const title = screen.getByText("コンパクト");
        expect(title).toHaveClass("text-base");
      });

      it("compact=true でパディング縮小 (p-5)", () => {
        const { container } = render(
          <EmptyState title="コンパクト" compact={true} />,
        );
        const innerDiv = container.querySelector(
          "[data-testid='empty-state-inner']",
        );
        expect(innerDiv).toHaveClass("p-5");
      });

      it("compact=false(デフォルト) でアイコンサイズ 48px", () => {
        const { container } = render(
          <EmptyState title="通常" icon="sparkles" />,
        );
        const svg = container.querySelector("svg");
        expect(svg).toHaveAttribute("width", "48");
        expect(svg).toHaveAttribute("height", "48");
      });
    });

    describe("mood", () => {
      it('mood="welcoming" でアイコンに text-[var(--status-primary)] クラスを持つ', () => {
        const { container } = render(
          <EmptyState title="ようこそ" icon="sparkles" mood="welcoming" />,
        );
        const iconWrapper = container.querySelector(
          "[data-testid='icon-wrapper']",
        );
        expect(iconWrapper).toHaveClass("text-[var(--status-primary)]");
      });

      it('mood="encouraging" でアイコンに text-[var(--status-info)] クラスを持つ', () => {
        const { container } = render(
          <EmptyState title="がんばろう" icon="sparkles" mood="encouraging" />,
        );
        const iconWrapper = container.querySelector(
          "[data-testid='icon-wrapper']",
        );
        expect(iconWrapper).toHaveClass("text-[var(--status-info)]");
      });

      it('mood="celebrating" でアイコンに text-[var(--status-success)] クラスを持つ', () => {
        const { container } = render(
          <EmptyState title="おめでとう" icon="sparkles" mood="celebrating" />,
        );
        const iconWrapper = container.querySelector(
          "[data-testid='icon-wrapper']",
        );
        expect(iconWrapper).toHaveClass("text-[var(--status-success)]");
      });

      it("mood 未指定でアイコンに text-[var(--text-muted)] クラスを持つ", () => {
        const { container } = render(
          <EmptyState title="デフォルト" icon="sparkles" />,
        );
        const iconWrapper = container.querySelector(
          "[data-testid='icon-wrapper']",
        );
        expect(iconWrapper).toHaveClass("text-[var(--text-muted)]");
      });
    });

    describe("action オブジェクト形式", () => {
      it("action に { label, onClick } を渡すと button がレンダリングされる", () => {
        const handleClick = vi.fn();
        render(
          <EmptyState
            title="アクション"
            action={{ label: "実行する", onClick: handleClick }}
          />,
        );
        expect(
          screen.getByRole("button", { name: "実行する" }),
        ).toBeInTheDocument();
      });

      it("action オブジェクトの onClick がクリック時に呼ばれる", () => {
        const handleClick = vi.fn();
        render(
          <EmptyState
            title="アクション"
            action={{ label: "クリック", onClick: handleClick }}
          />,
        );
        fireEvent.click(screen.getByRole("button", { name: "クリック" }));
        expect(handleClick).toHaveBeenCalledTimes(1);
      });

      it('action オブジェクト variant="primary" が Button に反映される', () => {
        render(
          <EmptyState
            title="アクション"
            action={{
              label: "プライマリ",
              onClick: vi.fn(),
              variant: "primary",
            }}
          />,
        );
        const button = screen.getByRole("button", { name: "プライマリ" });
        expect(button).toHaveClass("bg-[var(--status-primary)]");
      });

      it("action に ReactNode を渡すと既存動作を維持する（後方互換性）", () => {
        render(
          <EmptyState
            title="アクション"
            action={<button>カスタムボタン</button>}
          />,
        );
        expect(
          screen.getByRole("button", { name: "カスタムボタン" }),
        ).toBeInTheDocument();
      });
    });

    describe("テーマ", () => {
      it("3テーマでレンダリングエラーなし", () => {
        expect(() => {
          renderWithAllThemes(
            <EmptyState
              title="テーマテスト"
              description="テーマ確認"
              icon="sparkles"
              suggestions={[{ label: "提案", onClick: vi.fn() }]}
              mood="welcoming"
            />,
          );
        }).not.toThrow();
      });
    });
  });

  describe("エッジケース", () => {
    it("EE-01: suggestions={[]} で SuggestionBubble が描画されない（suggestions-containerがない）", () => {
      const { container } = render(
        <EmptyState title="空の提案" suggestions={[]} />,
      );
      const suggestionsContainer = container.querySelector(
        "[data-testid='suggestions-container']",
      );
      expect(suggestionsContainer).not.toBeInTheDocument();
    });

    it("EE-02: mood未指定のデフォルトで animate-bounce クラスなし", () => {
      const { container } = render(
        <EmptyState title="デフォルトmood" icon="sparkles" />,
      );
      const iconWrapper = container.querySelector(
        "[data-testid='icon-wrapper']",
      );
      expect(iconWrapper).toHaveClass("text-[var(--text-muted)]");
      expect(iconWrapper).not.toHaveClass("animate-bounce");
    });

    it("EE-04: compact={true} + mood='welcoming' で p-5 + status-primary が適用される", () => {
      const { container } = render(
        <EmptyState
          title="コンパクトウェルカム"
          icon="sparkles"
          compact={true}
          mood="welcoming"
        />,
      );
      const innerDiv = container.querySelector(
        "[data-testid='empty-state-inner']",
      );
      expect(innerDiv).toHaveClass("p-5");
      const iconWrapper = container.querySelector(
        "[data-testid='icon-wrapper']",
      );
      expect(iconWrapper).toHaveClass("text-[var(--status-primary)]");
    });
  });
});
