/**
 * FileSelectorTrigger コンポーネント
 *
 * FileSelectorModalを開くためのトリガーボタン。
 * 3つのバリエーション（default, compact, icon-only）と
 * 3つのサイズ（sm, md, lg）をサポート。
 *
 * @see docs/30-workflows/file-selector-integration/step01-design.md
 */

import React, { forwardRef } from "react";
import clsx from "clsx";
import { Icon } from "../../atoms/Icon";

// =============================================================================
// Types
// =============================================================================

export interface FileSelectorTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** クリック時のコールバック */
  onClick: () => void;

  /** ボタンのバリエーション */
  variant?: "default" | "compact" | "icon-only";

  /** ボタンのサイズ */
  size?: "sm" | "md" | "lg";

  /** 無効状態 */
  disabled?: boolean;

  /** ローディング状態 */
  loading?: boolean;

  /** カスタムラベル */
  label?: string;

  /** 追加のCSSクラス */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const ICON_SIZES: Record<"sm" | "md" | "lg", number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

const SIZE_STYLES: Record<"sm" | "md" | "lg", string> = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-3 text-base",
};

const ICON_ONLY_SIZE_STYLES: Record<"sm" | "md" | "lg", string> = {
  sm: "p-1",
  md: "p-2",
  lg: "p-3",
};

// =============================================================================
// Component
// =============================================================================

export const FileSelectorTrigger = forwardRef<
  HTMLButtonElement,
  FileSelectorTriggerProps
>(
  (
    {
      onClick,
      variant = "default",
      size = "md",
      disabled = false,
      loading = false,
      label = "ファイルを追加",
      className,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const iconSize = ICON_SIZES[size];

    // ラベルテキストの決定
    const displayLabel = variant === "compact" ? "追加" : label;

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        className={clsx(
          // Base styles
          "inline-flex items-center justify-center gap-2",
          "rounded-lg font-medium transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "focus:ring-offset-gray-900 focus:ring-[var(--status-primary)]",

          // Background and text
          "bg-white/10 text-white",
          "hover:bg-white/15",
          "active:bg-white/20 active:scale-[0.98]",

          // Size (icon-onlyの場合は異なるパディング)
          variant === "icon-only"
            ? ICON_ONLY_SIZE_STYLES[size]
            : SIZE_STYLES[size],

          // Disabled state
          isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",

          className,
        )}
        aria-label={variant === "icon-only" ? label : undefined}
        aria-busy={loading}
        aria-disabled={isDisabled}
        data-testid="file-selector-trigger"
        {...props}
      >
        {loading ? (
          <Icon
            name="loader-2"
            size={iconSize}
            spin
            aria-hidden="true"
            data-testid="file-selector-trigger-loading-icon"
          />
        ) : (
          <Icon
            name="plus"
            size={iconSize}
            aria-hidden="true"
            data-testid="file-selector-trigger-icon"
          />
        )}
        {variant !== "icon-only" && (
          <span data-testid="file-selector-trigger-label">{displayLabel}</span>
        )}
      </button>
    );
  },
);

FileSelectorTrigger.displayName = "FileSelectorTrigger";
