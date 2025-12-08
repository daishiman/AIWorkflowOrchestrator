import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { Icon, type IconName } from "./index";

describe("Icon", () => {
  describe("レンダリング", () => {
    it("SVGアイコンをレンダリングする", () => {
      const { container } = render(<Icon name="check" />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("デフォルトサイズ（20）を適用する", () => {
      const { container } = render(<Icon name="check" />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "20");
      expect(svg).toHaveAttribute("height", "20");
    });

    it("カスタムサイズを適用する", () => {
      const { container } = render(<Icon name="check" size={32} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "32");
      expect(svg).toHaveAttribute("height", "32");
    });

    it("デフォルトカラー（currentColor）を適用する", () => {
      const { container } = render(<Icon name="check" />);
      const svg = container.querySelector("svg");
      // Lucide Reactはstroke属性でカラーを適用する
      expect(svg).toHaveAttribute("stroke", "currentColor");
    });

    it("カスタムカラーを適用する", () => {
      const { container } = render(<Icon name="check" color="red" />);
      const svg = container.querySelector("svg");
      // Lucide Reactはstroke属性でカラーを適用する
      expect(svg).toHaveAttribute("stroke", "red");
    });
  });

  describe("アイコンマップ", () => {
    const iconNames: IconName[] = [
      "layout-grid",
      "folder-tree",
      "message-circle",
      "network",
      "aperture",
      "user",
      "folder",
      "folder-open",
      "file-text",
      "sparkles",
      "menu",
      "x",
      "check",
      "loader-2",
      "send",
      "refresh-cw",
      "settings",
      "chevron-right",
      "chevron-down",
      "play",
      "pause",
    ];

    it.each(iconNames)("'%s' アイコンをレンダリングする", (name) => {
      const { container } = render(<Icon name={name} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("存在しないアイコン名でnullを返す", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { container } = render(<Icon name={"nonexistent" as IconName} />);
      expect(container.firstChild).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Icon "nonexistent" not found in icon map',
      );
      consoleSpy.mockRestore();
    });
  });

  describe("spin", () => {
    it("spin propでanimate-spinクラスを適用する", () => {
      const { container } = render(<Icon name="loader-2" spin />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("animate-spin");
    });

    it("spin propがない場合、animate-spinクラスを適用しない", () => {
      const { container } = render(<Icon name="check" />);
      const svg = container.querySelector("svg");
      expect(svg).not.toHaveClass("animate-spin");
    });
  });

  describe("アクセシビリティ", () => {
    it("aria-hidden属性を持つ", () => {
      const { container } = render(<Icon name="check" />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      const { container } = render(
        <Icon name="check" className="custom-class" />,
      );
      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("custom-class");
    });

    it("spinとclassNameを組み合わせる", () => {
      const { container } = render(
        <Icon name="loader-2" spin className="custom-class" />,
      );
      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("animate-spin", "custom-class");
    });
  });

  describe("ref", () => {
    it("refを正しく転送する", () => {
      const ref = vi.fn();
      render(<Icon name="check" ref={ref} />);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(SVGSVGElement);
    });
  });

  describe("追加のprops", () => {
    it("追加のSVG属性を渡せる", () => {
      const { container } = render(
        <Icon name="check" data-testid="test-icon" />,
      );
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("data-testid", "test-icon");
    });
  });
});
