import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LLMAdapterErrorBanner } from "../LLMAdapterErrorBanner";

describe("LLMAdapterErrorBanner", () => {
  // T-BAN-01
  it("status が 'failed' のとき role='alert' バナーが表示される", () => {
    render(
      <LLMAdapterErrorBanner status="failed" failureReason="some error" />,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByTestId("llm-adapter-error-banner")).toBeInTheDocument();
  });

  // T-BAN-02
  it("status が 'ready' のとき何も表示されない", () => {
    const { container } = render(
      <LLMAdapterErrorBanner status="ready" failureReason={null} />,
    );
    expect(container.firstChild).toBeNull();
  });

  // T-BAN-03
  it("status が 'initializing' のとき何も表示されない", () => {
    const { container } = render(
      <LLMAdapterErrorBanner status="initializing" failureReason={null} />,
    );
    expect(container.firstChild).toBeNull();
  });

  // T-BAN-04
  it("failureReason に 'API key' が含まれるとき APIキー向けメッセージが表示される", () => {
    render(
      <LLMAdapterErrorBanner
        status="failed"
        failureReason="API key is invalid"
      />,
    );
    expect(screen.getByText(/APIキーが設定されていないか/)).toBeInTheDocument();
  });

  // T-BAN-05
  it("failureReason に 'API key' が含まれないとき汎用メッセージが表示される", () => {
    render(
      <LLMAdapterErrorBanner status="failed" failureReason="network timeout" />,
    );
    expect(
      screen.getByText(/LLMアダプターの初期化に失敗しました/),
    ).toBeInTheDocument();
    expect(screen.getByText(/network timeout/)).toBeInTheDocument();
  });

  // T-BAN-06
  it("failureReason が null のとき '不明なエラー' が含まれるメッセージが表示される", () => {
    render(<LLMAdapterErrorBanner status="failed" failureReason={null} />);
    expect(screen.getByText(/不明なエラー/)).toBeInTheDocument();
  });

  // T-BAN-07
  it("onOpenSettings が渡されると '設定を開く' ボタンが表示され、クリックで呼ばれる", () => {
    const onOpenSettings = vi.fn();
    render(
      <LLMAdapterErrorBanner
        status="failed"
        failureReason="API key is invalid"
        onOpenSettings={onOpenSettings}
      />,
    );

    const button = screen.getByRole("button", { name: /設定を開く/ });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  // T-BAN-08
  it("onOpenSettings が未設定のとき '設定を開く' ボタンが表示されない", () => {
    render(
      <LLMAdapterErrorBanner status="failed" failureReason="some error" />,
    );
    expect(
      screen.queryByRole("button", { name: /設定を開く/ }),
    ).not.toBeInTheDocument();
  });

  // T-BAN-09
  it("data-testid='llm-adapter-error-banner' が設定されている", () => {
    render(
      <LLMAdapterErrorBanner status="failed" failureReason="some error" />,
    );
    expect(screen.getByTestId("llm-adapter-error-banner")).toBeInTheDocument();
  });

  // T-BAN-10
  it("failureReason に 'API Key'（大文字混在）が含まれるとき APIキーメッセージが表示される", () => {
    render(
      <LLMAdapterErrorBanner
        status="failed"
        failureReason="Invalid API Key provided"
      />,
    );
    expect(screen.getByText(/APIキーが設定されていないか/)).toBeInTheDocument();
  });

  // T-BAN-11
  it("1000文字の failureReason でもレンダリングが成功する", () => {
    const longReason = "x".repeat(1000);
    expect(() => {
      render(
        <LLMAdapterErrorBanner status="failed" failureReason={longReason} />,
      );
    }).not.toThrow();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  // T-BAN-12
  it("status が 'failed' から 'ready' に変わったときバナーが消える", () => {
    const { rerender } = render(
      <LLMAdapterErrorBanner status="failed" failureReason="error" />,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();

    rerender(<LLMAdapterErrorBanner status="ready" failureReason={null} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // T-BAN-13
  it("バナーに role='alert' がある（アクセシビリティ）", () => {
    render(<LLMAdapterErrorBanner status="failed" failureReason="error" />);
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
  });
});
