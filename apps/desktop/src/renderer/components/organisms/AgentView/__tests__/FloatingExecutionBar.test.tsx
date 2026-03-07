/**
 * FloatingExecutionBar コンポーネントテスト（TASK-UI-03 Phase 4 - TDD Red）
 *
 * P39対策: happy-dom環境では userEvent 使用禁止。fireEvent のみ使用。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
// P39対策: userEvent は使用しない

// Red状態: コンポーネントはまだ実装されていない
import { FloatingExecutionBar } from "../FloatingExecutionBar";

describe("FloatingExecutionBar", () => {
  const defaultProps = {
    skillName: "テストスキル",
    status: "executing" as const,
    startedAt: new Date("2026-03-07T10:00:00Z"),
    onStop: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("executing状態で表示", () => {
    render(<FloatingExecutionBar {...defaultProps} />);

    expect(screen.getByText("テストスキル")).toBeInTheDocument();
    expect(screen.getByTestId("floating-execution-bar")).toBeInTheDocument();
  });

  it("停止ボタンクリックで onStop 発火", async () => {
    const onStop = vi.fn();
    render(<FloatingExecutionBar {...defaultProps} onStop={onStop} />);

    const stopButton = screen.getByRole("button", { name: /停止/i });
    await act(async () => {
      fireEvent.click(stopButton);
    });

    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it("経過時間の表示（mm:ss形式）", () => {
    // startedAt を2分30秒前に設定
    const startedAt = new Date(Date.now() - 150_000);
    render(<FloatingExecutionBar {...defaultProps} startedAt={startedAt} />);

    // mm:ss形式の経過時間テキストが存在すること
    const timeDisplay = screen.getByTestId("elapsed-time");
    expect(timeDisplay).toBeInTheDocument();
    // "02:30" のような形式を検証
    expect(timeDisplay.textContent).toMatch(/^\d{2}:\d{2}$/);
  });

  it("プログレスバー表示（progress=40 -> 40%）", () => {
    render(<FloatingExecutionBar {...defaultProps} progress={40} />);

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "40");
  });

  it("completed状態の表示（「完了!」テキスト）", () => {
    render(<FloatingExecutionBar {...defaultProps} status="completed" />);

    expect(screen.getByText(/完了/)).toBeInTheDocument();
  });

  // === Phase 6: テスト拡充 ===

  describe("境界値テスト", () => {
    it("idle状態で非表示（DOMに不在）", () => {
      const { container } = render(
        <FloatingExecutionBar {...defaultProps} status="idle" />,
      );

      expect(
        screen.queryByTestId("floating-execution-bar"),
      ).not.toBeInTheDocument();
      expect(container.innerHTML).toBe("");
    });

    it("progress=0 のプログレスバー表示", () => {
      render(<FloatingExecutionBar {...defaultProps} progress={0} />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-valuenow", "0");
    });

    it("progress=100 のプログレスバー表示", () => {
      render(<FloatingExecutionBar {...defaultProps} progress={100} />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-valuenow", "100");
    });

    it("progress未指定時はプログレスバー非表示", () => {
      render(<FloatingExecutionBar {...defaultProps} />);

      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    it("startedAt=null の場合の経過時間表示（00:00）", () => {
      render(<FloatingExecutionBar {...defaultProps} startedAt={null} />);

      const timeDisplay = screen.getByTestId("elapsed-time");
      expect(timeDisplay.textContent).toBe("00:00");
    });
  });

  describe("エラー系テスト", () => {
    it("failed状態でエラー表示（スキル名+失敗テキスト）", () => {
      render(<FloatingExecutionBar {...defaultProps} status="failed" />);

      expect(screen.getByTestId("floating-execution-bar")).toBeInTheDocument();
      expect(screen.getByText("失敗")).toBeInTheDocument();
    });

    it("idle状態で非表示", () => {
      const { container } = render(
        <FloatingExecutionBar {...defaultProps} status="idle" />,
      );

      expect(
        screen.queryByTestId("floating-execution-bar"),
      ).not.toBeInTheDocument();
      expect(container.innerHTML).toBe("");
    });
  });
});
