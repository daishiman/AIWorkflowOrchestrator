/**
 * AuthModeSelector - 認証方式選択UIコンポーネント
 *
 * Claude Agent SDKの認証方式（サブスクリプション / APIキー）を選択するための
 * セグメントコントロールUI。
 *
 * Apple Human Interface Guidelines準拠:
 * - 角丸8px、アクセントカラー#007AFF
 * - 200msトランジション
 * - WCAG 2.1 AA準拠のコントラスト比
 *
 * @see docs/30-workflows/TASK-AUTH-MODE-SELECTION-001/outputs/phase-2/ui-wireframe.md
 */
import React, { useCallback, useRef } from "react";
import clsx from "clsx";
import type { AuthMode } from "@repo/shared/types/auth-mode";

// ============================================================
// 型定義
// ============================================================

/**
 * 認証方式オプション定義
 */
interface AuthModeOption {
  mode: AuthMode;
  label: string;
  description: string;
}

/**
 * AuthModeSelectorコンポーネントProps
 */
export interface AuthModeSelectorProps {
  /** 現在選択中の認証方式 */
  currentMode: AuthMode;
  /** 認証方式変更時のコールバック */
  onModeChange: (mode: AuthMode) => void;
  /** 無効化状態 */
  disabled?: boolean;
  /** 追加のCSSクラス */
  className?: string;
}

// ============================================================
// 定数
// ============================================================

const AUTH_MODE_OPTIONS: AuthModeOption[] = [
  {
    mode: "subscription",
    label: "サブスクリプション",
    description: "Claude Code CLIで認証されたアカウントを使用します",
  },
  {
    mode: "api-key",
    label: "APIキー",
    description: "Anthropic APIキーを使用して認証します",
  },
];

// ============================================================
// コンポーネント
// ============================================================

export const AuthModeSelector: React.FC<AuthModeSelectorProps> = ({
  currentMode,
  onModeChange,
  disabled = false,
  className,
}) => {
  // Refs for keyboard navigation
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Handle option click
  const handleClick = useCallback(
    (mode: AuthMode) => {
      if (!disabled && mode !== currentMode) {
        onModeChange(mode);
      }
    },
    [disabled, currentMode, onModeChange],
  );

  // Keyboard navigation (roving tabindex pattern)
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      if (disabled) return;

      let nextIndex: number | null = null;

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault();
          nextIndex = (index + 1) % AUTH_MODE_OPTIONS.length;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          nextIndex =
            (index - 1 + AUTH_MODE_OPTIONS.length) % AUTH_MODE_OPTIONS.length;
          break;
        case " ":
        case "Enter":
          event.preventDefault();
          handleClick(AUTH_MODE_OPTIONS[index].mode);
          return;
      }

      if (nextIndex !== null) {
        buttonRefs.current[nextIndex]?.focus();
      }
    },
    [disabled, handleClick],
  );

  return (
    <div
      role="radiogroup"
      aria-labelledby="auth-mode-selector-label"
      aria-describedby="auth-mode-status-description"
      className={clsx(
        // Container styles
        "flex p-0.5 rounded-lg",
        "bg-[#F5F5F7] border border-[#D2D2D7]",
        // Disabled state
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {AUTH_MODE_OPTIONS.map((option, index) => {
        const isSelected = currentMode === option.mode;

        return (
          <button
            key={option.mode}
            ref={(el) => (buttonRefs.current[index] = el)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={option.label}
            aria-description={option.description}
            disabled={disabled}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => handleClick(option.mode)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            data-testid={`auth-mode-option-${option.mode}`}
            className={clsx(
              // Base styles
              "flex-1 flex items-center justify-center",
              "py-2.5 px-4 rounded-md",
              "font-medium text-sm",
              "transition-all duration-200 ease-out",
              // Focus styles
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
              "focus-visible:ring-[#007AFF]",

              // State styles
              isSelected
                ? // Selected state - Apple accent blue
                  "bg-[#007AFF] text-white shadow-sm"
                : // Unselected state
                  clsx(
                    "bg-transparent text-[#1D1D1F]",
                    !disabled && "hover:bg-[#E8E8ED]",
                  ),

              // Disabled state
              disabled && "cursor-not-allowed",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default AuthModeSelector;
