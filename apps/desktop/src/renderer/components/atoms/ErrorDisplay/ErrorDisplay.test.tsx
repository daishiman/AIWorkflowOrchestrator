import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorDisplay } from "./index";

describe("ErrorDisplay", () => {
  describe("レンダリング", () => {
    it("エラーメッセージを表示する", () => {
      render(<ErrorDisplay message="テストエラー" />);
      expect(
        screen.getByText(/エラーが発生しました:.*テストエラー/),
      ).toBeInTheDocument();
    });

    it("role=alertを持つ", () => {
      render(<ErrorDisplay message="テストエラー" />);
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      render(<ErrorDisplay message="テストエラー" className="custom-class" />);
      expect(screen.getByRole("alert")).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(ErrorDisplay.displayName).toBe("ErrorDisplay");
    });
  });
});
