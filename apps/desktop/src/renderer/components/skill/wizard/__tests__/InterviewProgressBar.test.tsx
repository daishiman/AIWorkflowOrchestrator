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
