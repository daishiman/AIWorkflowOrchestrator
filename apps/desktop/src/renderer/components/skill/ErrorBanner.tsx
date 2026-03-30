/**
 * @file ErrorBanner.tsx
 * @description エラー状態を赤系背景で表示する共通サブコンポーネント
 * TASK-RT-03: skill-creation-result-panel
 */

import { memo } from "react";

export interface PanelError {
  code?: string;
  message: string;
  retryable?: boolean;
}

export interface ErrorBannerProps {
  error: PanelError;
  onRetry?: () => void;
}

export const ErrorBanner = memo<ErrorBannerProps>(({ error, onRetry }) => {
  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-3 rounded-xl border border-[var(--status-error)]/30 bg-[var(--status-error)]/5 px-4 py-3"
      data-testid="error-banner"
    >
      <div className="flex items-start gap-2">
        <span
          className="mt-0.5 shrink-0 text-[var(--status-error)]"
          aria-hidden="true"
        >
          ⚠
        </span>
        <div>
          {error.code ? (
            <p className="text-xs font-medium text-[var(--status-error)]">
              {error.code}
            </p>
          ) : null}
          <p className="text-sm text-[var(--status-error)]">{error.message}</p>
        </div>
      </div>
      {onRetry && error.retryable !== false ? (
        <button
          type="button"
          onClick={onRetry}
          aria-label="再試行"
          className="shrink-0 rounded-lg border border-[var(--status-error)]/30 px-3 py-1 text-xs font-medium text-[var(--status-error)] transition-colors duration-200 hover:bg-[var(--status-error)]/10"
        >
          再試行
        </button>
      ) : null}
    </div>
  );
});

ErrorBanner.displayName = "ErrorBanner";
