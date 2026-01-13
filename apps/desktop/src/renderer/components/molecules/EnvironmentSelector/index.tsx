/**
 * EnvironmentSelector - 実行環境選択コンポーネント
 * プレビュー環境タイプの選択とコントロール
 * @module EnvironmentSelector
 */

import React from "react";
import clsx from "clsx";
import type { EnvironmentType } from "@repo/shared/types/agent";

export interface EnvironmentSelectorProps {
  /** 現在選択中の環境タイプ */
  currentEnvironment: EnvironmentType;
  /** 利用可能な環境タイプ */
  availableEnvironments: EnvironmentType[];
  /** 環境変更ハンドラ */
  onEnvironmentChange: (type: EnvironmentType) => void;
  /** リフレッシュボタンクリックハンドラ */
  onRefresh?: () => void;
  /** フルスクリーンボタンクリックハンドラ */
  onFullscreen?: () => void;
  /** 無効状態 */
  disabled?: boolean;
  /** カスタムクラス */
  className?: string;
}

/**
 * 環境タイプのラベル定義
 */
const ENVIRONMENT_LABELS: Record<EnvironmentType, string> = {
  none: "プレビューなし",
  html: "HTML",
  markdown: "Markdown",
  terminal: "ターミナル",
  code: "コード",
};

/**
 * EnvironmentSelector コンポーネント
 */
export const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({
  currentEnvironment,
  availableEnvironments,
  onEnvironmentChange,
  onRefresh,
  onFullscreen,
  disabled = false,
  className,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onEnvironmentChange(e.target.value as EnvironmentType);
  };

  return (
    <div
      className={clsx(
        "flex items-center gap-2 p-2",
        "bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]",
        className,
      )}
      data-testid="environment-selector"
    >
      {/* 環境タイプセレクター */}
      <div className="relative flex-1">
        <select
          value={currentEnvironment}
          onChange={handleChange}
          disabled={disabled}
          aria-label="実行環境を選択"
          className={clsx(
            "w-full px-3 py-1.5 pr-8",
            "bg-[var(--bg-primary)] text-[var(--text-primary)]",
            "border border-[var(--border-subtle)] rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            "appearance-none cursor-pointer",
            "text-sm",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          data-testid="environment-select"
        >
          {availableEnvironments.map((env) => (
            <option
              key={env}
              value={env}
              className="bg-[var(--bg-primary)] text-[var(--text-primary)]"
            >
              {ENVIRONMENT_LABELS[env]}
            </option>
          ))}
        </select>
        {/* ドロップダウンアイコン */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="h-4 w-4 text-[var(--text-tertiary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* リフレッシュボタン */}
      {onRefresh && currentEnvironment !== "none" && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={disabled}
          aria-label="リフレッシュ"
          className={clsx(
            "p-1.5 rounded-md",
            "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
            "hover:bg-[var(--bg-hover)]",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          data-testid="refresh-button"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      )}

      {/* フルスクリーンボタン */}
      {onFullscreen && currentEnvironment !== "none" && (
        <button
          type="button"
          onClick={onFullscreen}
          disabled={disabled}
          aria-label="フルスクリーン"
          className={clsx(
            "p-1.5 rounded-md",
            "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
            "hover:bg-[var(--bg-hover)]",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          data-testid="fullscreen-button"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

EnvironmentSelector.displayName = "EnvironmentSelector";
