import React, { memo, useMemo } from "react";
import clsx from "clsx";
import type {
  Suggestion,
  SuggestionPriority,
} from "@repo/shared/types/skill-improver";

// ========================================
// 型定義
// ========================================

export type PriorityVariant = "high" | "medium" | "low";

export interface SuggestionListProps {
  suggestions: Suggestion[];
  selected: Set<number>;
  onToggle: (index: number) => void;
  onSelectAutoFixable: () => void;
}

// ========================================
// スタイル定数（P47準拠: テスト側からimport可能）
// ========================================

export const priorityStyles: Record<PriorityVariant, string> = {
  high: "text-[var(--status-error)] bg-[var(--status-error)]/10",
  medium: "text-[var(--status-warning)] bg-[var(--status-warning)]/10",
  low: "text-[var(--status-info)] bg-[var(--status-info)]/10",
};

const priorityOrder: SuggestionPriority[] = ["high", "medium", "low"];

const priorityLabels: Record<PriorityVariant, string> = {
  high: "高優先度",
  medium: "中優先度",
  low: "低優先度",
};

// ========================================
// サブコンポーネント
// ========================================

interface SuggestionItemProps {
  suggestion: Suggestion;
  originalIndex: number;
  isSelected: boolean;
  onToggle: (index: number) => void;
}

const SuggestionItem = memo<SuggestionItemProps>(
  ({ suggestion, originalIndex, isSelected, onToggle }) => {
    return (
      <li
        className={clsx(
          "flex items-center gap-3 p-3",
          "rounded-xl",
          "bg-[var(--bg-primary)]",
          "border border-[var(--border-primary)]",
          "transition-colors duration-200",
        )}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(originalIndex)}
          aria-label={`${suggestion.description}を選択`}
          className="h-4 w-4 shrink-0 rounded"
        />

        <div className="flex min-w-0 flex-1 items-center gap-2">
          {/* タイプバッジ */}
          <span
            className={clsx(
              "inline-flex shrink-0 items-center",
              "rounded-full px-2 py-0.5 text-xs font-medium",
              "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
            )}
          >
            {suggestion.type}
          </span>

          {/* 優先度バッジ */}
          <span
            className={clsx(
              "inline-flex shrink-0 items-center",
              "rounded-full px-2 py-0.5 text-xs font-medium",
              priorityStyles[suggestion.priority],
            )}
          >
            {suggestion.priority}
          </span>

          {/* autoFixable バッジ */}
          {suggestion.autoFixable && (
            <span
              className={clsx(
                "inline-flex shrink-0 items-center",
                "rounded-full px-2 py-0.5 text-xs font-medium",
                "bg-[var(--status-success)]/10 text-[var(--status-success)]",
              )}
            >
              自動修正
            </span>
          )}

          {/* 説明テキスト */}
          <span className="truncate text-sm text-[var(--text-primary)]">
            {suggestion.description}
          </span>
        </div>
      </li>
    );
  },
);

SuggestionItem.displayName = "SuggestionItem";

// ========================================
// メインコンポーネント
// ========================================

export const SuggestionList = memo<SuggestionListProps>(
  ({ suggestions, selected, onToggle, onSelectAutoFixable }) => {
    // 優先度別のグルーピングと auto-fixable 件数を同時に算出する
    const { groupedSuggestions, autoFixableCount } = useMemo(() => {
      const groups: Record<
        SuggestionPriority,
        Array<{ suggestion: Suggestion; originalIndex: number }>
      > = {
        high: [],
        medium: [],
        low: [],
      };
      let count = 0;

      suggestions.forEach((suggestion, index) => {
        groups[suggestion.priority].push({
          suggestion,
          originalIndex: index,
        });
        if (suggestion.autoFixable) {
          count += 1;
        }
      });

      return {
        groupedSuggestions: groups,
        autoFixableCount: count,
      };
    }, [suggestions]);

    if (suggestions.length === 0) {
      return (
        <div
          className={clsx(
            "flex items-center justify-center",
            "rounded-xl p-8",
            "bg-[var(--bg-secondary)]",
            "text-sm text-[var(--text-secondary)]",
          )}
        >
          改善提案はありません
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSelectAutoFixable}
            disabled={autoFixableCount === 0}
            aria-label="自動修正可能を選択"
            className={clsx(
              "rounded-lg border border-[var(--border-primary)]",
              "bg-[var(--bg-primary)] px-3 py-1.5 text-xs font-medium",
              "text-[var(--text-primary)] transition-colors duration-200",
              "hover:bg-[var(--bg-secondary)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            自動修正可能を選択
          </button>
        </div>

        {priorityOrder.map((priority) => {
          const items = groupedSuggestions[priority];
          if (items.length === 0) return null;

          return (
            <section key={priority}>
              <h3
                className={clsx(
                  "mb-2 text-sm font-semibold",
                  "text-[var(--text-primary)]",
                )}
              >
                {priorityLabels[priority]}
              </h3>
              <ul
                className="flex flex-col gap-2"
                role="list"
                aria-label={`${priorityLabels[priority]}の改善提案`}
              >
                {items.map(({ suggestion, originalIndex }) => (
                  <SuggestionItem
                    key={originalIndex}
                    suggestion={suggestion}
                    originalIndex={originalIndex}
                    isSelected={selected.has(originalIndex)}
                    onToggle={onToggle}
                  />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    );
  },
);

SuggestionList.displayName = "SuggestionList";
