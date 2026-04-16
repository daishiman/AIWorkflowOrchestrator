/**
 * @file InterviewProgressBar.tsx
 * @description 質問 N/6 の進捗を表示するコンポーネント
 * @task UT-SKILL-WIZARD-W1-par-02b
 */

import React from "react";

export interface InterviewProgressBarProps {
  currentQuestion: number;
  totalQuestions?: number;
}

/**
 * 6問インタビューの進捗を「質問 N/6」とバーで示すコンポーネント。
 */
export const InterviewProgressBar = ({
  currentQuestion,
  totalQuestions = 6,
}: InterviewProgressBarProps) => {
  const percent =
    totalQuestions > 0
      ? Math.round((currentQuestion / totalQuestions) * 100)
      : 0;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-[var(--text-secondary)]">
        質問 {currentQuestion}/{totalQuestions}
      </span>
      <div
        role="progressbar"
        aria-label={`質問 ${currentQuestion}/${totalQuestions}`}
        aria-valuemin={1}
        aria-valuemax={totalQuestions}
        aria-valuenow={currentQuestion}
        className="w-full h-2 rounded-full bg-[var(--bg-secondary)]"
      >
        <div
          className="h-2 rounded-full bg-[var(--status-primary)] transition-all duration-300 ease-in-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

InterviewProgressBar.displayName = "InterviewProgressBar";
