/**
 * CloseIcon コンポーネント
 *
 * 閉じる/削除用のアイコン
 */

import type { FC } from "react";
import { memo } from "react";
import { cn } from "../../../../lib/utils";

export interface CloseIconProps {
  /** サイズ（デフォルト: md） */
  size?: "sm" | "md" | "lg";
  /** 追加のクラス名 */
  className?: string;
}

const sizeClasses = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
} as const;

/**
 * CloseIcon コンポーネント
 */
export const CloseIcon: FC<CloseIconProps> = memo(
  ({ size = "md", className }) => {
    return (
      <svg
        className={cn(sizeClasses[size], className)}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    );
  },
);

CloseIcon.displayName = "CloseIcon";

export default CloseIcon;
