/**
 * @file InterviewProgressBar.test.tsx
 * @description InterviewProgressBar ユニットテスト
 * @task UT-SKILL-WIZARD-W1-par-02b Phase 6
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InterviewProgressBar } from "../InterviewProgressBar";

describe("InterviewProgressBar", () => {
  it("質問番号とトータルが表示される", () => {
    render(<InterviewProgressBar currentQuestion={1} />);
    expect(screen.getByText(/質問 1\/6/)).toBeInTheDocument();
  });

  it("totalQuestions を変更すると表示が変わる", () => {
    render(<InterviewProgressBar currentQuestion={3} totalQuestions={8} />);
    expect(screen.getByText(/質問 3\/8/)).toBeInTheDocument();
  });

  it("currentQuestion=1 のとき進捗バー幅が 17% になる", () => {
    render(<InterviewProgressBar currentQuestion={1} totalQuestions={6} />);
    // Math.round(1/6 * 100) = 17
    const bar = document.querySelector(
      ".bg-\\[var\\(--status-primary\\)\\]",
    ) as HTMLElement;
    expect(bar.style.width).toBe("17%");
  });

  it("currentQuestion=6 のとき進捗バー幅が 100% になる", () => {
    render(<InterviewProgressBar currentQuestion={6} totalQuestions={6} />);
    const bar = document.querySelector(
      ".bg-\\[var\\(--status-primary\\)\\]",
    ) as HTMLElement;
    expect(bar.style.width).toBe("100%");
  });

  it("currentQuestion=4 のとき進捗バー幅が 67% になる", () => {
    render(<InterviewProgressBar currentQuestion={4} totalQuestions={6} />);
    // Math.round(4/6 * 100) = 67
    const bar = document.querySelector(
      ".bg-\\[var\\(--status-primary\\)\\]",
    ) as HTMLElement;
    expect(bar.style.width).toBe("67%");
  });
});

// TASK-SW-UI-POLISH-001: アニメーション・エッジケーステスト（TC-07〜TC-09, TC-14〜TC-16）
describe("TASK-SW-UI-POLISH-001 ProgressBar アニメーション・エッジケース", () => {
  it("TC-07: ProgressBar の幅制御要素に transition-all / duration-300 クラスが含まれる", () => {
    render(<InterviewProgressBar currentQuestion={1} />);
    const bar = document.querySelector(
      ".bg-\\[var\\(--status-primary\\)\\]",
    ) as HTMLElement;
    expect(bar.className).toContain("transition-all");
    expect(bar.className).toContain("duration-300");
  });

  it("TC-08: currentQuestion=1/6 のとき width が 17% であり transition クラスが存在する", () => {
    render(<InterviewProgressBar currentQuestion={1} totalQuestions={6} />);
    const bar = document.querySelector(
      ".bg-\\[var\\(--status-primary\\)\\]",
    ) as HTMLElement;
    expect(bar.style.width).toBe("17%");
    expect(bar.className).toContain("transition-all");
  });

  it("TC-09: currentQuestion=6/6 のとき width が 100% であり transition クラスが存在する", () => {
    render(<InterviewProgressBar currentQuestion={6} totalQuestions={6} />);
    const bar = document.querySelector(
      ".bg-\\[var\\(--status-primary\\)\\]",
    ) as HTMLElement;
    expect(bar.style.width).toBe("100%");
    expect(bar.className).toContain("transition-all");
  });

  it("TC-14: currentQuestion=0 のとき 0% 表示でエラーが発生しない", () => {
    expect(() =>
      render(<InterviewProgressBar currentQuestion={0} totalQuestions={6} />),
    ).not.toThrow();
    const bar = document.querySelector(
      ".bg-\\[var\\(--status-primary\\)\\]",
    ) as HTMLElement;
    expect(bar.style.width).toBe("0%");
  });

  it("TC-15: currentQuestion と totalQuestions が等しいとき 100% 表示", () => {
    render(<InterviewProgressBar currentQuestion={6} totalQuestions={6} />);
    const bar = document.querySelector(
      ".bg-\\[var\\(--status-primary\\)\\]",
    ) as HTMLElement;
    expect(bar.style.width).toBe("100%");
  });

  it("TC-16: transition クラスが常に保持される（0→1 遷移後も存在）", () => {
    const { rerender } = render(
      <InterviewProgressBar currentQuestion={0} totalQuestions={6} />,
    );
    rerender(<InterviewProgressBar currentQuestion={1} totalQuestions={6} />);
    const bar = document.querySelector(
      ".bg-\\[var\\(--status-primary\\)\\]",
    ) as HTMLElement;
    expect(bar.className).toContain("transition-all");
    expect(bar.className).toContain("duration-300");
  });
});
