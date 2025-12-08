import React, { memo } from "react";
import clsx from "clsx";

export interface ErrorDisplayProps {
  message: string;
  className?: string;
}

/**
 * エラー表示コンポーネント
 * 全Viewで共通のエラー表示パターンを提供
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = memo(
  ({ message, className }) => {
    return (
      <div
        className={clsx(
          "flex items-center justify-center h-full text-red-400",
          className,
        )}
        role="alert"
      >
        <p>エラーが発生しました: {message}</p>
      </div>
    );
  },
);

ErrorDisplay.displayName = "ErrorDisplay";
