/**
 * ApplyControls コンポーネント
 *
 * 差分の適用・却下コントロールを提供するコンポーネント
 */

import type { FC } from "react";
import { memo } from "react";
import { useDiffApply } from "../hooks";
import type { ApplyResult } from "../types";
import { cn } from "../../../lib/utils";
import { Spinner, CloseIcon } from "./common";

export interface ApplyControlsProps {
  /** 結果ID */
  resultId: string;
  /** 適用成功時コールバック */
  onApplied?: (result: ApplyResult) => void;
  /** 却下時コールバック */
  onRejected?: () => void;
  /** 無効化フラグ */
  disabled?: boolean;
  /** サイズバリアント */
  size?: "sm" | "md";
  /** 追加のクラス名 */
  className?: string;
}

/**
 * ApplyControls コンポーネント
 *
 * React.memo で最適化
 */
export const ApplyControls: FC<ApplyControlsProps> = memo(
  ({
    resultId,
    onApplied,
    onRejected,
    disabled = false,
    size = "md",
    className,
  }) => {
    const { applyResult, rejectResult, isLoading, error } = useDiffApply();

    const handleApply = async () => {
      const result = await applyResult(resultId);
      if (result.success) {
        onApplied?.(result);
      }
    };

    const handleReject = () => {
      rejectResult(resultId);
      onRejected?.();
    };

    const isDisabled = disabled || isLoading;

    return (
      <div
        role="group"
        className={cn("flex items-center gap-2", className)}
        aria-busy={isLoading}
      >
        {/* 適用ボタン */}
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md",
            "bg-green-600 text-white font-medium",
            "hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            size === "sm" && "px-2 py-1 text-sm",
          )}
          onClick={handleApply}
          disabled={isDisabled}
          aria-label="変更を適用"
        >
          {isLoading ? (
            <Spinner size="sm" />
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          <span className={cn(size === "sm" && "sr-only")}>適用</span>
        </button>

        {/* 却下ボタン */}
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md",
            "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
            "hover:bg-slate-300 dark:hover:bg-slate-600",
            "focus:outline-none focus:ring-2 focus:ring-slate-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            size === "sm" && "px-2 py-1 text-sm",
          )}
          onClick={handleReject}
          disabled={isDisabled}
          aria-label="変更を却下"
        >
          <CloseIcon size="md" />
          <span className={cn(size === "sm" && "sr-only")}>却下</span>
        </button>

        {/* エラー表示 */}
        {error && (
          <span className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  },
);

ApplyControls.displayName = "ApplyControls";

export default ApplyControls;
