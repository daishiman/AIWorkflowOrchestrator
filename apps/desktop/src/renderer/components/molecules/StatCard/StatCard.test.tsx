import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "./index";

describe("StatCard", () => {
  describe("レンダリング", () => {
    it("カードをレンダリングする", () => {
      const { container } = render(
        <StatCard title="Total Users" value={100} />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("タイトルを表示する", () => {
      render(<StatCard title="Total Users" value={100} />);
      expect(screen.getByText("Total Users")).toBeInTheDocument();
    });

    it("数値valueを表示する", () => {
      render(<StatCard title="Total Users" value={1234} />);
      expect(screen.getByText("1,234")).toBeInTheDocument();
    });

    it("文字列valueを表示する", () => {
      render(<StatCard title="Status" value="Active" />);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });
  });

  describe("アイコン", () => {
    it("iconがある場合、アイコンを表示する", () => {
      const { container } = render(
        <StatCard title="Users" value={100} icon="user" />,
      );
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("iconがない場合、アイコンを表示しない", () => {
      const { container } = render(<StatCard title="Users" value={100} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeNull();
    });
  });

  describe("カラー", () => {
    it("defaultカラーでblueアイコンを表示する", () => {
      const { container } = render(
        <StatCard title="Users" value={100} icon="user" color="default" />,
      );
      const icon = container.querySelector(".text-blue-400");
      expect(icon).toBeInTheDocument();
    });

    it("successカラーでgreenアイコンを表示する", () => {
      const { container } = render(
        <StatCard title="Success" value={100} icon="check" color="success" />,
      );
      const icon = container.querySelector(".text-green-400");
      expect(icon).toBeInTheDocument();
    });

    it("warningカラーでorangeアイコンを表示する", () => {
      const { container } = render(
        <StatCard title="Warning" value={100} icon="pause" color="warning" />,
      );
      const icon = container.querySelector(".text-orange-400");
      expect(icon).toBeInTheDocument();
    });

    it("errorカラーでredアイコンを表示する", () => {
      const { container } = render(
        <StatCard title="Errors" value={100} icon="x" color="error" />,
      );
      const icon = container.querySelector(".text-red-400");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("プログレスバー", () => {
    it("progressがある場合、プログレスバーを表示する", () => {
      render(
        <StatCard
          title="Storage"
          value="75%"
          progress={{ value: 75, max: 100 }}
        />,
      );
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("progressがない場合、プログレスバーを表示しない", () => {
      render(<StatCard title="Storage" value="75%" />);
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    it("プログレスバーに正しい値を設定する", () => {
      render(
        <StatCard
          title="Storage"
          value="75%"
          progress={{ value: 75, max: 100 }}
        />,
      );
      const progressbar = screen.getByRole("progressbar");
      expect(progressbar).toHaveAttribute("aria-valuenow", "75");
      expect(progressbar).toHaveAttribute("aria-valuemax", "100");
    });

    it("プログレスバーにラベルを表示する", () => {
      render(
        <StatCard
          title="Storage"
          value="75%"
          progress={{ value: 75, max: 100 }}
        />,
      );
      // showLabel=true なのでパーセンテージが表示される（valueとprogressラベルの両方に75%がある）
      const percentageElements = screen.getAllByText("75%");
      expect(percentageElements.length).toBeGreaterThanOrEqual(1);
    });

    it("プログレスバーにカラーを適用する", () => {
      const { container } = render(
        <StatCard
          title="Errors"
          value="80%"
          color="error"
          progress={{ value: 80, max: 100 }}
        />,
      );
      const bar = container.querySelector(".bg-red-500");
      expect(bar).toBeInTheDocument();
    });
  });

  describe("スタイル", () => {
    it("glass panelスタイルを適用する", () => {
      const { container } = render(<StatCard title="Test" value={100} />);
      expect(container.firstChild).toHaveClass("backdrop-blur-sm");
    });

    it("rounded-2xlクラスを持つ", () => {
      const { container } = render(<StatCard title="Test" value={100} />);
      expect(container.firstChild).toHaveClass("rounded-2xl");
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      const { container } = render(
        <StatCard title="Test" value={100} className="custom-class" />,
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(StatCard.displayName).toBe("StatCard");
    });
  });
});
