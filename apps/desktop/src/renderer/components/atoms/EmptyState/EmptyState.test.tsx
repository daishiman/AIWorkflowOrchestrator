import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./index";

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
      render(<EmptyState title="データがありません" icon="file" />);
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
});
