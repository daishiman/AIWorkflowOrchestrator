/**
 * StreamingErrorDisplay コンポーネントテスト (C-01 〜 C-10)
 *
 * Phase 4: TDD テストファースト
 * P39 準拠: happy-dom 環境では fireEvent を使用（userEvent 使用禁止）
 * P63 準拠: 既存テストのインポートパスを参照
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { StreamingErrorDisplay } from "../StreamingErrorDisplay";
import type { StreamingErrorState } from "../../types";

const baseError: StreamingErrorState = {
  code: "NETWORK_ERROR",
  message: "ネットワークエラーが発生しました。",
  retryable: true,
  action: "RETRY",
};

const mockProps = {
  error: baseError,
  onDismiss: vi.fn(),
  onRetry: vi.fn().mockResolvedValue(undefined),
  onOpenSettings: vi.fn(),
};

describe("StreamingErrorDisplay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("C-01: エラーメッセージが表示される", () => {
    render(<StreamingErrorDisplay {...mockProps} />);
    expect(screen.getByText(baseError.message)).toBeInTheDocument();
  });

  it("C-02: action=SETTINGS 時に設定ボタンが表示される", () => {
    const settingsError: StreamingErrorState = {
      ...baseError,
      code: "API_KEY_MISSING",
      message: "APIキーが設定されていません。",
      action: "SETTINGS",
      retryable: false,
    };
    render(<StreamingErrorDisplay {...mockProps} error={settingsError} />);
    expect(
      screen.getByRole("button", { name: /設定を開く/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /再試行/ })).toBeNull();
  });

  it("C-03: action=RETRY 時に再試行ボタンが表示される", () => {
    render(<StreamingErrorDisplay {...mockProps} />);
    expect(screen.getByRole("button", { name: /再試行/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /設定を開く/ })).toBeNull();
  });

  it("C-04: action=null 時にアクションボタンが表示されない", () => {
    const noActionError: StreamingErrorState = {
      ...baseError,
      code: "VALIDATION_ERROR",
      message: "バリデーションエラー",
      action: null,
      retryable: false,
    };
    render(<StreamingErrorDisplay {...mockProps} error={noActionError} />);
    expect(screen.queryByRole("button", { name: /再試行/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /設定を開く/ })).toBeNull();
  });

  it("C-05: hint がある時にヒントテキストが表示される", () => {
    const hintError: StreamingErrorState = {
      ...baseError,
      code: "RATE_LIMIT",
      hint: "しばらく待ってから再試行してください。",
    };
    render(<StreamingErrorDisplay {...mockProps} error={hintError} />);
    expect(
      screen.getByText("しばらく待ってから再試行してください。"),
    ).toBeInTheDocument();
  });

  it("C-06: dismissボタンクリックで onDismiss が呼ばれる", () => {
    render(<StreamingErrorDisplay {...mockProps} />);
    const dismissBtn = screen.getByRole("button", { name: /エラーを閉じる/ });
    fireEvent.click(dismissBtn);
    expect(mockProps.onDismiss).toHaveBeenCalledTimes(1);
  });

  it("C-07: 設定ボタンクリックで onOpenSettings が呼ばれる", () => {
    const settingsError: StreamingErrorState = {
      ...baseError,
      code: "API_KEY_MISSING",
      message: "APIキーが設定されていません。",
      action: "SETTINGS",
      retryable: false,
    };
    render(<StreamingErrorDisplay {...mockProps} error={settingsError} />);
    const settingsBtn = screen.getByRole("button", { name: /設定を開く/ });
    fireEvent.click(settingsBtn);
    expect(mockProps.onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it("C-08: 再試行ボタンクリックで onRetry が呼ばれる", async () => {
    render(<StreamingErrorDisplay {...mockProps} />);
    const retryBtn = screen.getByRole("button", { name: /再試行/ });
    await act(async () => {
      fireEvent.click(retryBtn);
    });
    expect(mockProps.onRetry).toHaveBeenCalledTimes(1);
  });

  it("C-09: isRetrying=true 時に再試行ボタンがdisabledになる", () => {
    render(<StreamingErrorDisplay {...mockProps} isRetrying={true} />);
    const retryBtn = screen.getByRole("button", { name: /再試行中/ });
    expect(retryBtn).toBeDisabled();
  });

  it("C-10: role=alert が付与されている", () => {
    render(<StreamingErrorDisplay {...mockProps} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
