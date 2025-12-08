import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "./index";

describe("ProgressBar", () => {
  describe("レンダリング", () => {
    it("プログレスバーをレンダリングする", () => {
      render(<ProgressBar value={50} />);
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });

  describe("値", () => {
    it("aria-valuenowを設定する", () => {
      render(<ProgressBar value={75} />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "75",
      );
    });

    it("aria-valueminを0に設定する", () => {
      render(<ProgressBar value={50} />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuemin",
        "0",
      );
    });

    it("デフォルトでaria-valuemaxを100に設定する", () => {
      render(<ProgressBar value={50} />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuemax",
        "100",
      );
    });

    it("カスタムmax値を設定する", () => {
      render(<ProgressBar value={25} max={50} />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuemax",
        "50",
      );
    });

    it("パーセンテージに基づいた幅を設定する", () => {
      const { container } = render(<ProgressBar value={50} />);
      const bar = container.querySelector(".bg-blue-500");
      expect(bar).toHaveStyle({ width: "50%" });
    });

    it("カスタムmax値でパーセンテージを計算する", () => {
      const { container } = render(<ProgressBar value={25} max={50} />);
      const bar = container.querySelector(".bg-blue-500");
      expect(bar).toHaveStyle({ width: "50%" }); // 25/50 = 50%
    });

    it("0%を正しく表示する", () => {
      const { container } = render(<ProgressBar value={0} />);
      const bar = container.querySelector(".bg-blue-500");
      expect(bar).toHaveStyle({ width: "0%" });
    });

    it("100%を正しく表示する", () => {
      const { container } = render(<ProgressBar value={100} />);
      const bar = container.querySelector(".bg-blue-500");
      expect(bar).toHaveStyle({ width: "100%" });
    });

    it("負の値を0%に制限する", () => {
      const { container } = render(<ProgressBar value={-50} />);
      const bar = container.querySelector(".bg-blue-500");
      expect(bar).toHaveStyle({ width: "0%" });
    });

    it("maxを超える値を100%に制限する", () => {
      const { container } = render(<ProgressBar value={150} />);
      const bar = container.querySelector(".bg-blue-500");
      expect(bar).toHaveStyle({ width: "100%" });
    });
  });

  describe("カラー", () => {
    it("デフォルトカラー（blue）を適用する", () => {
      const { container } = render(<ProgressBar value={50} />);
      const bar = container.querySelector(".bg-blue-500");
      expect(bar).toBeInTheDocument();
    });

    it("successカラーを適用する", () => {
      const { container } = render(<ProgressBar value={50} color="success" />);
      const bar = container.querySelector(".bg-green-500");
      expect(bar).toBeInTheDocument();
    });

    it("warningカラーを適用する", () => {
      const { container } = render(<ProgressBar value={50} color="warning" />);
      const bar = container.querySelector(".bg-orange-400");
      expect(bar).toBeInTheDocument();
    });

    it("errorカラーを適用する", () => {
      const { container } = render(<ProgressBar value={50} color="error" />);
      const bar = container.querySelector(".bg-red-500");
      expect(bar).toBeInTheDocument();
    });
  });

  describe("ラベル", () => {
    it("デフォルトでラベルを表示しない", () => {
      render(<ProgressBar value={50} />);
      expect(screen.queryByText("50%")).not.toBeInTheDocument();
    });

    it("showLabelでラベルを表示する", () => {
      render(<ProgressBar value={50} showLabel />);
      expect(screen.getByText("50%")).toBeInTheDocument();
    });

    it("パーセンテージを四捨五入して表示する", () => {
      render(<ProgressBar value={33} showLabel />);
      expect(screen.getByText("33%")).toBeInTheDocument();
    });

    it("小数点以下を丸める", () => {
      render(<ProgressBar value={33.7} showLabel />);
      expect(screen.getByText("34%")).toBeInTheDocument();
    });

    it("ラベルにaria-live属性を持つ", () => {
      render(<ProgressBar value={50} showLabel />);
      const label = screen.getByText("50%");
      expect(label).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      render(<ProgressBar value={50} className="custom-class" />);
      expect(screen.getByRole("progressbar")).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(ProgressBar.displayName).toBe("ProgressBar");
    });
  });
});
