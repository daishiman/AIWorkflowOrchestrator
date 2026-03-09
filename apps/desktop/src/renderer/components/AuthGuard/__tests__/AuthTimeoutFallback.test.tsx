/**
 * @file AuthTimeoutFallback.test.tsx
 * @description AuthTimeoutFallback コンポーネントのユニットテスト
 *
 * P39準拠: happy-dom環境では fireEvent を使用（userEvent 禁止）
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthTimeoutFallback } from "../AuthTimeoutFallback";

describe("AuthTimeoutFallback", () => {
  const defaultProps = {
    onRetry: vi.fn(),
    onNavigateSettings: vi.fn(),
  };

  it("エラーメッセージが表示される", () => {
    render(<AuthTimeoutFallback {...defaultProps} />);

    expect(
      screen.getByText("認証の確認に時間がかかっています"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "ネットワーク接続を確認するか、以下のオプションをお試しください",
      ),
    ).toBeInTheDocument();
  });

  it("リトライボタンが表示される", () => {
    render(<AuthTimeoutFallback {...defaultProps} />);

    const retryButton = screen.getByRole("button", { name: "リトライ" });
    expect(retryButton).toBeInTheDocument();
  });

  it("Settings遷移ボタンが表示される", () => {
    render(<AuthTimeoutFallback {...defaultProps} />);

    const settingsButton = screen.getByRole("button", { name: "設定画面へ" });
    expect(settingsButton).toBeInTheDocument();
  });

  it("リトライボタンクリックで onRetry が呼ばれる", () => {
    const onRetry = vi.fn();
    render(<AuthTimeoutFallback {...defaultProps} onRetry={onRetry} />);

    fireEvent.click(screen.getByRole("button", { name: "リトライ" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("Settings遷移ボタンクリックで onNavigateSettings が呼ばれる", () => {
    const onNavigateSettings = vi.fn();
    render(
      <AuthTimeoutFallback
        {...defaultProps}
        onNavigateSettings={onNavigateSettings}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "設定画面へ" }));
    expect(onNavigateSettings).toHaveBeenCalledTimes(1);
  });

  it("role='alert' が設定されている", () => {
    render(<AuthTimeoutFallback {...defaultProps} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("aria-label='認証タイムアウト' が設定されている", () => {
    render(<AuthTimeoutFallback {...defaultProps} />);

    const alertElement = screen.getByRole("alert");
    expect(alertElement).toHaveAttribute("aria-label", "認証タイムアウト");
  });

  // ============================================================
  // Phase 6: アクセシビリティ属性追加テスト
  // ============================================================

  it("リトライボタンに type='button' が設定されている", () => {
    render(<AuthTimeoutFallback {...defaultProps} />);

    const retryButton = screen.getByRole("button", { name: "リトライ" });
    expect(retryButton).toHaveAttribute("type", "button");
  });

  it("設定画面へボタンに type='button' が設定されている", () => {
    render(<AuthTimeoutFallback {...defaultProps} />);

    const settingsButton = screen.getByRole("button", { name: "設定画面へ" });
    expect(settingsButton).toHaveAttribute("type", "button");
  });

  it("リトライボタンに aria-label='リトライ' が設定されている", () => {
    render(<AuthTimeoutFallback {...defaultProps} />);

    const retryButton = screen.getByRole("button", { name: "リトライ" });
    expect(retryButton).toHaveAttribute("aria-label", "リトライ");
  });

  it("設定画面へボタンに aria-label='設定画面へ' が設定されている", () => {
    render(<AuthTimeoutFallback {...defaultProps} />);

    const settingsButton = screen.getByRole("button", { name: "設定画面へ" });
    expect(settingsButton).toHaveAttribute("aria-label", "設定画面へ");
  });
});
