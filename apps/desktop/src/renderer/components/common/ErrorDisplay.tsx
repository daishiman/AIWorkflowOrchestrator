/**
 * ErrorDisplay Component
 *
 * Reusable error display component with optional retry functionality.
 *
 * @module @repo/desktop/renderer/components/common/ErrorDisplay
 */

import React from "react";

export interface ErrorDisplayProps {
  message: string;
  title?: string;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: "inline" | "full" | "centered";
  className?: string;
}

function ErrorIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

function InlineError({
  message,
  onRetry,
  retryLabel,
}: Pick<ErrorDisplayProps, "message" | "onRetry" | "retryLabel">) {
  return (
    <div
      role="alert"
      data-testid="error-display"
      className="rounded-lg bg-red-50 p-4 text-center text-red-600"
    >
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-sm underline hover:no-underline"
        >
          {retryLabel || "再試行"}
        </button>
      )}
    </div>
  );
}

function FullError({
  message,
  title,
  onRetry,
  retryLabel,
}: Pick<ErrorDisplayProps, "message" | "title" | "onRetry" | "retryLabel">) {
  return (
    <div
      role="alert"
      data-testid="error-display"
      className="flex flex-1 flex-col items-center justify-center p-6"
    >
      <div className="rounded-lg bg-red-50 p-6 text-center">
        <ErrorIcon className="mx-auto mb-3 h-12 w-12 text-red-400" />
        {title && (
          <h3 className="mb-2 text-lg font-semibold text-red-700">{title}</h3>
        )}
        <p className="text-red-600">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-md bg-red-100 px-4 py-2 text-red-600 hover:bg-red-200"
          >
            {retryLabel || "再試行"}
          </button>
        )}
      </div>
    </div>
  );
}

function CenteredError({
  message,
  onRetry,
  retryLabel,
}: Pick<ErrorDisplayProps, "message" | "onRetry" | "retryLabel">) {
  return (
    <div
      role="alert"
      data-testid="error-display"
      className="flex flex-col items-center justify-center p-4 text-center"
    >
      <ErrorIcon className="mb-3 h-10 w-10 text-red-400" />
      <p className="text-red-600">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md bg-red-100 px-3 py-1.5 text-sm text-red-600 hover:bg-red-200"
        >
          {retryLabel || "再試行"}
        </button>
      )}
    </div>
  );
}

export function ErrorDisplay({
  message,
  title,
  onRetry,
  retryLabel = "再試行",
  variant = "inline",
  className = "",
}: ErrorDisplayProps): React.ReactElement {
  const content = (() => {
    switch (variant) {
      case "inline":
        return (
          <InlineError
            message={message}
            onRetry={onRetry}
            retryLabel={retryLabel}
          />
        );
      case "full":
        return (
          <FullError
            message={message}
            title={title}
            onRetry={onRetry}
            retryLabel={retryLabel}
          />
        );
      case "centered":
        return (
          <CenteredError
            message={message}
            onRetry={onRetry}
            retryLabel={retryLabel}
          />
        );
      default:
        return (
          <InlineError
            message={message}
            onRetry={onRetry}
            retryLabel={retryLabel}
          />
        );
    }
  })();

  return <div className={className}>{content}</div>;
}
