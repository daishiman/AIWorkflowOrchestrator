import React, { useEffect, useState } from "react";
import { Square, CheckCircle } from "lucide-react";
import { transitions } from "./animations";
import { interactiveStyles } from "./styles";

export interface FloatingExecutionBarProps {
  skillName: string;
  status: "executing" | "completed" | "failed" | "idle";
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
        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[var(--status-success)] text-[var(--text-inverse)] px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3"
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
        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[var(--status-error)] text-[var(--text-inverse)] px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 animate-[shake_0.5s_ease-in-out]"
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
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] px-6 py-3 rounded-2xl shadow-lg flex items-center gap-4 min-w-[300px]"
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
