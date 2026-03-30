import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ErrorBanner, type PanelError } from "../ErrorBanner";

describe("ErrorBanner", () => {
  const baseError: PanelError = {
    code: "LLM_ADAPTER_FAILED",
    message: "LLM adapter が利用できません",
  };

  // T-ERR-01: errorCode + errorMessage を渡す
  it("エラーコードとメッセージが赤系背景で表示される", () => {
    render(<ErrorBanner error={baseError} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("LLM_ADAPTER_FAILED")).toBeInTheDocument();
    expect(
      screen.getByText("LLM adapter が利用できません"),
    ).toBeInTheDocument();
  });

  // T-ERR-01b: errorCode なしの場合
  it("errorCode なしの場合はメッセージのみ表示される", () => {
    render(<ErrorBanner error={{ message: "エラーが発生しました" }} />);

    expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    expect(screen.queryByText("LLM_ADAPTER_FAILED")).not.toBeInTheDocument();
  });

  // T-ERR-02: onRetry が渡される
  it("onRetry が渡されると再試行ボタンが表示される", () => {
    const onRetry = vi.fn();
    render(<ErrorBanner error={baseError} onRetry={onRetry} />);

    const retryButton = screen.getByRole("button", { name: "再試行" });
    expect(retryButton).toBeInTheDocument();
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  // T-ERR-03: onRetry が未設定
  it("onRetry が未設定の場合は再試行ボタンが表示されない", () => {
    render(<ErrorBanner error={baseError} />);

    expect(
      screen.queryByRole("button", { name: "再試行" }),
    ).not.toBeInTheDocument();
  });

  // T-ERR-04: 長いエラーメッセージ
  it("長いエラーメッセージがレイアウトを崩さず表示される", () => {
    const longMessage = "エラー ".repeat(100).trim();
    render(<ErrorBanner error={{ message: longMessage }} />);

    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  // T-ERR-05: retryable が false
  it("retryable が false の場合は再試行ボタンが表示されない", () => {
    const onRetry = vi.fn();
    render(
      <ErrorBanner
        error={{ ...baseError, retryable: false }}
        onRetry={onRetry}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "再試行" }),
    ).not.toBeInTheDocument();
  });
});
