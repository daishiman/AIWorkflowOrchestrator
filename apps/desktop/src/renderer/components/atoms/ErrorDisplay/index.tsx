import React, { memo } from "react";
import clsx from "clsx";
import { Button } from "../Button";

export interface ErrorDisplayProps {
  /** エラーメッセージ */
  message: string;
  /** リトライボタンのクリックハンドラ（指定時にリトライボタンを表示） */
  onRetry?: () => void;
  /** リトライボタンのラベル */
  retryLabel?: string;
  /** カスタムクラス名 */
  className?: string;
}

/**
 * エラー表示コンポーネント
 * 全Viewで共通のエラー表示パターンを提供
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = memo(
  ({ message, onRetry, retryLabel = "再試行", className }) => {
    return (
      <div
        className={clsx(
          "flex flex-col items-center justify-center h-full text-[var(--status-error)]",
          className,
        )}
        role="alert"
      >
        <p className="text-sm">エラーが発生しました: {message}</p>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="mt-4"
            data-testid="error-retry-button"
          >
            {retryLabel}
          </Button>
        )}
      </div>
    );
  },
);

ErrorDisplay.displayName = "ErrorDisplay";
