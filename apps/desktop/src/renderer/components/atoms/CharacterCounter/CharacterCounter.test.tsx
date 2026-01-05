import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CharacterCounter } from "./index";

describe("CharacterCounter", () => {
  const defaultProps = {
    current: 0,
    max: 4000,
  };

  describe("レンダリング", () => {
    it("文字数を表示する", () => {
      render(<CharacterCounter {...defaultProps} />);
      expect(screen.getByText("0 / 4,000 文字")).toBeInTheDocument();
    });

    it("現在の文字数を表示する", () => {
      render(<CharacterCounter {...defaultProps} current={100} />);
      expect(screen.getByText("100 / 4,000 文字")).toBeInTheDocument();
    });

    it("最大文字数を表示する", () => {
      render(<CharacterCounter {...defaultProps} max={5000} />);
      expect(screen.getByText("0 / 5,000 文字")).toBeInTheDocument();
    });

    it("カンマ区切りでフォーマットする", () => {
      render(<CharacterCounter {...defaultProps} current={1234} max={10000} />);
      expect(screen.getByText("1,234 / 10,000 文字")).toBeInTheDocument();
    });
  });

  describe("スタイリング", () => {
    it("通常状態では白色テキストを表示する", () => {
      render(<CharacterCounter {...defaultProps} current={100} />);
      const counter = screen.getByText("100 / 4,000 文字");
      expect(counter).toHaveClass("text-white/40");
    });

    it("警告閾値(80%)を超えると黄色テキストを表示する", () => {
      render(<CharacterCounter {...defaultProps} current={3200} />); // 80%
      const counter = screen.getByText("3,200 / 4,000 文字");
      expect(counter).toHaveClass("text-yellow-400");
    });

    it("エラー閾値(95%)を超えると赤色テキストを表示する", () => {
      render(<CharacterCounter {...defaultProps} current={3800} />); // 95%
      const counter = screen.getByText("3,800 / 4,000 文字");
      expect(counter).toHaveClass("text-red-400");
    });

    it("カスタムclassNameを適用する", () => {
      render(<CharacterCounter {...defaultProps} className="custom-class" />);
      const counter = screen.getByText("0 / 4,000 文字");
      expect(counter).toHaveClass("custom-class");
    });
  });

  describe("エッジケース", () => {
    it("最大文字数に達した場合を表示する", () => {
      render(<CharacterCounter {...defaultProps} current={4000} />);
      expect(screen.getByText("4,000 / 4,000 文字")).toBeInTheDocument();
      const counter = screen.getByText("4,000 / 4,000 文字");
      expect(counter).toHaveClass("text-red-400");
    });

    it("0文字の場合を表示する", () => {
      render(<CharacterCounter {...defaultProps} current={0} />);
      expect(screen.getByText("0 / 4,000 文字")).toBeInTheDocument();
    });

    it("負の値を処理する", () => {
      render(<CharacterCounter {...defaultProps} current={-1} />);
      expect(screen.getByText("-1 / 4,000 文字")).toBeInTheDocument();
    });

    it("最大値を超える値を処理する", () => {
      render(<CharacterCounter {...defaultProps} current={5000} />);
      expect(screen.getByText("5,000 / 4,000 文字")).toBeInTheDocument();
      const counter = screen.getByText("5,000 / 4,000 文字");
      expect(counter).toHaveClass("text-red-400");
    });
  });

  describe("アクセシビリティ", () => {
    it("aria-liveでライブ通知を提供する", () => {
      render(<CharacterCounter {...defaultProps} />);
      const counter = screen.getByText("0 / 4,000 文字");
      expect(counter).toHaveAttribute("aria-live", "polite");
    });

    it("警告閾値でaria-liveをassertiveにする", () => {
      render(<CharacterCounter {...defaultProps} current={3200} />);
      const counter = screen.getByText("3,200 / 4,000 文字");
      expect(counter).toHaveAttribute("aria-live", "assertive");
    });

    it("役割を設定する", () => {
      render(<CharacterCounter {...defaultProps} />);
      const counter = screen.getByText("0 / 4,000 文字");
      expect(counter).toHaveAttribute("role", "status");
    });
  });
});
