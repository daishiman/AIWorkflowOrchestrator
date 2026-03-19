import React from "react";

export interface ErrorGuidanceProps {
  code: string;
  message: string;
  retryable: boolean;
  onRetry?: () => void;
  onNavigateToSettings?: () => void;
}

export const ErrorGuidance: React.FC<ErrorGuidanceProps> = ({
  code,
  message,
  retryable,
  onRetry,
  onNavigateToSettings,
}) => {
  return (
    <div role="alert" aria-live="assertive" data-testid="error-guidance">
      <span data-testid="error-code">{code}</span>
      <span data-testid="error-message">{message}</span>
      {retryable && onRetry && (
        <button data-testid="retry-button" onClick={onRetry}>
          もう一度試す
        </button>
      )}
      {(code === "API_KEY_MISSING" || code === "API_KEY_INVALID") &&
        onNavigateToSettings && (
          <button
            data-testid="navigate-to-settings-button"
            onClick={onNavigateToSettings}
          >
            設定を開く
          </button>
        )}
    </div>
  );
};
