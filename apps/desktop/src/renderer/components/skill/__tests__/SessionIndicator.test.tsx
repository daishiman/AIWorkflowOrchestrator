import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SessionIndicator } from "../SessionIndicator";

describe("SessionIndicator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-30T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultProps = {
    planId: "plan-abc-12345678",
    currentPhase: "execute" as const,
    startedAt: new Date("2026-03-30T11:30:00Z").getTime(), // 30分前
  };

  // AC-4: アクティブセッション ID 表示
  it("planId の先頭8文字が表示される", () => {
    render(<SessionIndicator {...defaultProps} />);

    expect(screen.getByText(/plan-abc/)).toBeInTheDocument();
  });

  // AC-4: 経過時間表示
  it("経過時間が表示される", () => {
    render(<SessionIndicator {...defaultProps} />);

    expect(screen.getByText(/30分/)).toBeInTheDocument();
  });

  // AC-4: 現在フェーズの表示
  it("現在のフェーズが表示される", () => {
    render(<SessionIndicator {...defaultProps} />);

    expect(screen.getByText(/実行/)).toBeInTheDocument();
  });

  // 時間フォーマット: 1時間以上
  it("1時間以上の場合は時間+分で表示される", () => {
    render(
      <SessionIndicator
        {...defaultProps}
        startedAt={new Date("2026-03-30T10:15:00Z").getTime()} // 1時間45分前
      />,
    );

    expect(screen.getByText(/1時間45分/)).toBeInTheDocument();
  });

  // data-testid
  it("data-testid が設定されている", () => {
    render(<SessionIndicator {...defaultProps} />);

    expect(screen.getByTestId("session-indicator")).toBeInTheDocument();
  });

  // アクセシビリティ
  it("status ロールとラベルが設定されている", () => {
    render(<SessionIndicator {...defaultProps} />);

    expect(
      screen.getByRole("status", { name: "アクティブセッション" }),
    ).toBeInTheDocument();
  });

  // パルスアニメーション
  it("パルスインジケーターが表示される", () => {
    render(<SessionIndicator {...defaultProps} />);

    const indicator = screen.getByTestId("session-indicator");
    const pulse = indicator.querySelector(".animate-pulse");
    expect(pulse).toBeInTheDocument();
  });
});
