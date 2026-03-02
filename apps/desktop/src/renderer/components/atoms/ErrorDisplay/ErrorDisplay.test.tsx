import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

  describe("onRetry", () => {
    it("onRetry未指定時はリトライボタンを表示しない", () => {
      render(<ErrorDisplay message="テストエラー" />);
      expect(
        screen.queryByTestId("error-retry-button"),
      ).not.toBeInTheDocument();
    });

    it("onRetry指定時にリトライボタンを表示する", () => {
      const handleRetry = vi.fn();
      render(<ErrorDisplay message="テストエラー" onRetry={handleRetry} />);
      const button = screen.getByTestId("error-retry-button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("再試行");
    });

    it("リトライボタンクリック時にonRetryが呼ばれる", () => {
      const handleRetry = vi.fn();
      render(<ErrorDisplay message="テストエラー" onRetry={handleRetry} />);
      fireEvent.click(screen.getByTestId("error-retry-button"));
      expect(handleRetry).toHaveBeenCalledOnce();
    });

    it("カスタムretryLabelが表示される", () => {
      render(
        <ErrorDisplay
          message="テストエラー"
          onRetry={() => {}}
          retryLabel="もう一度"
        />,
      );
      expect(screen.getByTestId("error-retry-button")).toHaveTextContent(
        "もう一度",
      );
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(ErrorDisplay.displayName).toBe("ErrorDisplay");
    });
  });
});
