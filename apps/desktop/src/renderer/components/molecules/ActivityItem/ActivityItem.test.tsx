import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivityItem } from "./index";

describe("ActivityItem", () => {
  const defaultProps = {
    message: "User logged in",
    time: "2024-01-15T10:30:00",
    type: "info" as const,
  };

  describe("レンダリング", () => {
    it("アイテムをレンダリングする", () => {
      render(<ActivityItem {...defaultProps} />);
      expect(screen.getByRole("listitem")).toBeInTheDocument();
    });

    it("メッセージを表示する", () => {
      render(<ActivityItem {...defaultProps} />);
      expect(screen.getByText("User logged in")).toBeInTheDocument();
    });

    it("時刻を表示する", () => {
      render(<ActivityItem {...defaultProps} />);
      expect(screen.getByText("2024-01-15T10:30:00")).toBeInTheDocument();
    });
  });

  describe("タイプ別インジケーター", () => {
    it("infoタイプでblueインジケーターを表示する", () => {
      const { container } = render(
        <ActivityItem {...defaultProps} type="info" />,
      );
      const dot = container.querySelector(".bg-blue-400");
      expect(dot).toBeInTheDocument();
    });

    it("successタイプでgreenインジケーターを表示する", () => {
      const { container } = render(
        <ActivityItem {...defaultProps} type="success" />,
      );
      const dot = container.querySelector(".bg-green-400");
      expect(dot).toBeInTheDocument();
    });

    it("warningタイプでorangeインジケーターを表示する", () => {
      const { container } = render(
        <ActivityItem {...defaultProps} type="warning" />,
      );
      const dot = container.querySelector(".bg-orange-400");
      expect(dot).toBeInTheDocument();
    });

    it("errorタイプでredインジケーターを表示する", () => {
      const { container } = render(
        <ActivityItem {...defaultProps} type="error" />,
      );
      const dot = container.querySelector(".bg-red-400");
      expect(dot).toBeInTheDocument();
    });

    it("インジケーターにaria-labelを設定する", () => {
      render(<ActivityItem {...defaultProps} type="info" />);
      expect(screen.getByLabelText("info indicator")).toBeInTheDocument();
    });
  });

  describe("時刻要素", () => {
    it("time要素を使用する", () => {
      render(<ActivityItem {...defaultProps} />);
      const timeElement = screen.getByText("2024-01-15T10:30:00");
      expect(timeElement.tagName).toBe("TIME");
    });

    it("dateTime属性を設定する", () => {
      render(<ActivityItem {...defaultProps} />);
      const timeElement = screen.getByText("2024-01-15T10:30:00");
      expect(timeElement).toHaveAttribute("dateTime", "2024-01-15T10:30:00");
    });

    it("title属性を設定する", () => {
      render(<ActivityItem {...defaultProps} />);
      const timeElement = screen.getByText("2024-01-15T10:30:00");
      expect(timeElement).toHaveAttribute("title", "2024-01-15T10:30:00");
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      render(<ActivityItem {...defaultProps} className="custom-class" />);
      expect(screen.getByRole("listitem")).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(ActivityItem.displayName).toBe("ActivityItem");
    });
  });
});
