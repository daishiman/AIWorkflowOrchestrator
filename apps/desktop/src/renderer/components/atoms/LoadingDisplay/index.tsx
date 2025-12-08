import React, { memo } from "react";
import clsx from "clsx";
import { Spinner } from "../Spinner";

export interface LoadingDisplayProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * ローディング表示コンポーネント
 * 全Viewで共通のローディング表示パターンを提供
 */
export const LoadingDisplay: React.FC<LoadingDisplayProps> = memo(
  ({ message = "読み込み中...", size = "md", className }) => {
    return (
      <div
        className={clsx("flex items-center justify-center h-full", className)}
        role="status"
        aria-busy="true"
      >
        <div className="text-center">
          <Spinner size={size} />
          <p className="text-gray-400 mt-4">{message}</p>
        </div>
      </div>
    );
  },
);

LoadingDisplay.displayName = "LoadingDisplay";
