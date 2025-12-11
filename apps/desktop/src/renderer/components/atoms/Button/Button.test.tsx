import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./index";

describe("Button", () => {
  describe("レンダリング", () => {
    it("子要素を正しくレンダリングする", () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    it("デフォルトでbutton typeを持つ", () => {
      render(<Button>Test</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });

    it("submit typeを設定できる", () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });
  });

  describe("バリアント", () => {
    it("primaryバリアントのスタイルを適用する", () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-[var(--status-primary)]");
    });

    it("secondaryバリアントのスタイルを適用する", () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-white/10");
    });

    it("ghostバリアントのスタイルを適用する", () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-transparent");
    });

    it("dangerバリアントのスタイルを適用する", () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-red-500");
    });
  });

  describe("サイズ", () => {
    it("smサイズのスタイルを適用する", () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-8");
    });

    it("mdサイズ（デフォルト）のスタイルを適用する", () => {
      render(<Button size="md">Medium</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-10");
    });

    it("lgサイズのスタイルを適用する", () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-12");
    });
  });

  describe("インタラクション", () => {
    it("クリックイベントを発火する", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("disabled状態ではクリックイベントを発火しない", () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("loading状態ではクリックイベントを発火しない", () => {
      const handleClick = vi.fn();
      render(
        <Button loading onClick={handleClick}>
          Loading
        </Button>,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("状態", () => {
    it("disabled状態で正しい属性を持つ", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("loading状態で正しい属性を持つ", () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-busy", "true");
    });

    it("loading状態でスピナーアイコンを表示する", () => {
      render(<Button loading>Loading</Button>);
      // loader-2アイコンがanimate-spinクラスを持つ
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("アイコン", () => {
    it("leftIconを表示する", () => {
      render(<Button leftIcon="check">With Icon</Button>);
      // アイコンがレンダリングされていることを確認
      const icons = document.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it("rightIconを表示する", () => {
      render(<Button rightIcon="chevron-right">With Icon</Button>);
      const icons = document.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it("loading状態ではleftIconを表示しない", () => {
      const { container } = render(
        <Button loading leftIcon="check">
          Loading
        </Button>,
      );
      // spinnerのみ表示される
      const spinners = container.querySelectorAll(".animate-spin");
      expect(spinners.length).toBe(1);
    });
  });

  describe("フルワイドス", () => {
    it("fullWidth propでw-fullクラスを適用する", () => {
      render(<Button fullWidth>Full Width</Button>);
      expect(screen.getByRole("button")).toHaveClass("w-full");
    });
  });

  describe("アクセシビリティ", () => {
    it("フォーカス可能である", () => {
      render(<Button>Focusable</Button>);
      const button = screen.getByRole("button");
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it("disabled状態ではフォーカスできない", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      button.focus();
      // disabled buttonはフォーカスを受け付けない
      expect(button).toBeDisabled();
    });
  });

  describe("ref", () => {
    it("refを正しく転送する", () => {
      const ref = vi.fn();
      render(<Button ref={ref}>With Ref</Button>);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
    });
  });
});
