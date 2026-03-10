import React, { useEffect, useState } from "react";
import { Square, CheckCircle } from "lucide-react";
import { transitions } from "./animations";
import { interactiveStyles } from "./styles";
import type { AgentFloatingStatus } from "./types";

export interface FloatingExecutionBarProps {
  skillName: string;
  status: AgentFloatingStatus;
  startedAt: Date | null;
  progress?: number;
  onStop: () => void;
}

function formatElapsedTime(startedAt: Date): string {
  const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export const FloatingExecutionBar: React.FC<FloatingExecutionBarProps> = ({
  skillName,
  status,
  startedAt,
  progress,
  onStop,
}) => {
  const [elapsedDisplay, setElapsedDisplay] = useState(
    startedAt ? formatElapsedTime(startedAt) : "00:00",
  );

  useEffect(() => {
    if (status !== "executing" || !startedAt) return;
    const interval = setInterval(() => {
      setElapsedDisplay(formatElapsedTime(startedAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [status, startedAt]);

  if (status === "completed") {
    return (
      <div
        data-testid="floating-execution-bar"
        className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-[var(--status-success)] px-6 py-3 text-[var(--text-inverse)] shadow-lg animate-[success-bounce_0.6s_ease-out]"
      >
        <CheckCircle className="w-5 h-5" />
        <span>{skillName}</span>
        <span>完了!</span>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div
        data-testid="floating-execution-bar"
        className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-[var(--status-error)] px-6 py-3 text-[var(--text-inverse)] shadow-lg animate-[error-shake_0.5s_ease-in-out]"
      >
        <Square className="w-5 h-5" />
        <span>{skillName}</span>
        <span>失敗</span>
      </div>
    );
  }

  if (status !== "executing") return null;

  return (
    <div
      data-testid="floating-execution-bar"
      className="fixed bottom-6 left-1/2 z-50 flex min-w-[300px] -translate-x-1/2 items-center gap-4 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-6 py-3 shadow-lg"
    >
      <span className="text-[var(--text-primary)] font-medium">
        {skillName}
      </span>
      <span
        data-testid="elapsed-time"
        className="text-[var(--text-secondary)] font-mono text-sm"
      >
        {elapsedDisplay}
      </span>
      {progress !== undefined && (
        <div className="flex-1">
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden"
          >
            <div
              className={`h-full bg-[var(--status-primary)] rounded-full ${transitions.all}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={onStop}
        aria-label="実行を停止"
        className={`${interactiveStyles.iconButton} text-[var(--status-error)]`}
      >
        <Square className="w-4 h-4" />
      </button>
    </div>
  );
};

FloatingExecutionBar.displayName = "FloatingExecutionBar";
