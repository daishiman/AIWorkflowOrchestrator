export interface InterviewProgressBarProps {
  current: number;
  total: number;
}

export function InterviewProgressBar({
  current,
  total,
}: InterviewProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div
      className="flex items-center gap-3"
      data-testid="interview-progress-bar"
    >
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
        <div
          className="h-full rounded-full bg-[var(--status-primary)] transition-all duration-300"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
          data-testid="progress-fill"
        />
      </div>
      <span
        className="min-w-[4rem] text-right text-xs tabular-nums text-[var(--text-secondary)]"
        data-testid="progress-text"
      >
        {current}/{total}
      </span>
    </div>
  );
}
