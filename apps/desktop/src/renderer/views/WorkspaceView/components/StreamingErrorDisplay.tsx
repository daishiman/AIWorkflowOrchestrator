import React, { useCallback } from "react";
import type { StreamingErrorState } from "../types";

interface StreamingErrorDisplayProps {
  error: StreamingErrorState;
  onDismiss: () => void;
  onRetry: () => Promise<void>;
  onOpenSettings: () => void;
  isRetrying?: boolean;
}

export function StreamingErrorDisplay({
  error,
  onDismiss,
  onRetry,
  onOpenSettings,
  isRetrying = false,
}: StreamingErrorDisplayProps): JSX.Element {
  const handleRetry = useCallback(async () => {
    await onRetry();
  }, [onRetry]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="mx-4 mb-2 flex flex-col gap-1 rounded-lg border border-[#C6C6C8] bg-[rgba(255,59,48,0.08)] p-3 dark:border-[#38383A] dark:bg-[rgba(255,69,58,0.12)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <span
            className="mt-0.5 text-sm text-[#FF3B30] dark:text-[#FF453A]"
            aria-hidden="true"
          >
            ⚠
          </span>
          <span className="text-sm text-[#FF3B30] dark:text-[#FF453A]">
            {error.message}
          </span>
        </div>

        <button
          onClick={onDismiss}
          aria-label="エラーを閉じる"
          className="flex-shrink-0 rounded p-0.5 text-[#FF3B30] hover:opacity-70 dark:text-[#FF453A]"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>

      {error.hint ? (
        <p className="ml-5 text-xs text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)]">
          {error.hint}
        </p>
      ) : null}

      {error.action === "SETTINGS" ? (
        <div className="ml-5 mt-1">
          <button
            onClick={onOpenSettings}
            aria-label="設定を開く"
            className="rounded px-3 py-1 text-sm font-medium text-[#007AFF] hover:opacity-70 dark:text-[#0A84FF]"
          >
            設定を開く
          </button>
        </div>
      ) : null}

      {error.action === "RETRY" ? (
        <div className="ml-5 mt-1">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            aria-label={isRetrying ? "再試行中" : "再試行"}
            className="rounded px-3 py-1 text-sm font-medium text-[#007AFF] hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#0A84FF]"
          >
            {isRetrying ? "再試行中..." : "再試行"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
