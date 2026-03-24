/**
 * @file ImprovementProposalList.tsx
 * @description 改善提案リストコンポーネント
 *
 * 提案一覧の表示、全選択/全解除、選択した提案の適用機能を提供する。
 * UT-SC-05: Apply Improvement UI
 */

import { memo } from "react";
import clsx from "clsx";
import type { RuntimeSkillCreatorImproveSuggestion } from "@repo/shared/types";
import { ImprovementProposalItem } from "./ImprovementProposalItem";

// ========================================
// 型定義
// ========================================

export interface ImprovementProposalListProps {
  suggestions: RuntimeSkillCreatorImproveSuggestion[];
  selectedIndices: Set<number>;
  onToggle: (index: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onApply: () => void;
  isApplying: boolean;
  selectedCount: number;
}

// ========================================
// コンポーネント
// ========================================

export const ImprovementProposalList = memo<ImprovementProposalListProps>(
  ({
    suggestions,
    selectedIndices,
    onToggle,
    onSelectAll,
    onDeselectAll,
    onApply,
    isApplying,
    selectedCount,
  }) => {
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
        {/* ツールバー */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSelectAll}
              disabled={isApplying}
              aria-label="全て選択"
              className={clsx(
                "rounded-lg border border-[var(--border-primary)]",
                "bg-[var(--bg-primary)] px-3 py-1.5 text-xs font-medium",
                "text-[var(--text-primary)] transition-colors duration-200",
                "hover:bg-[var(--bg-secondary)]",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              全て選択
            </button>
            <button
              type="button"
              onClick={onDeselectAll}
              disabled={isApplying}
              aria-label="全て解除"
              className={clsx(
                "rounded-lg border border-[var(--border-primary)]",
                "bg-[var(--bg-primary)] px-3 py-1.5 text-xs font-medium",
                "text-[var(--text-primary)] transition-colors duration-200",
                "hover:bg-[var(--bg-secondary)]",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              全て解除
            </button>
          </div>

          <button
            type="button"
            onClick={onApply}
            disabled={selectedCount === 0 || isApplying}
            aria-label={`選択した提案を適用（${selectedCount}件）`}
            className={clsx(
              "rounded-lg px-4 py-1.5 text-xs font-medium",
              "bg-[var(--status-primary)] text-[var(--text-inverse)]",
              "transition-colors duration-200",
              "hover:opacity-90",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {isApplying
              ? "適用中..."
              : `選択した提案を適用（${selectedCount}件）`}
          </button>
        </div>

        {/* 提案リスト */}
        <div
          className="flex max-h-[600px] flex-col gap-3 overflow-y-auto"
          role="list"
          aria-label="改善提案一覧"
        >
          {suggestions.map((suggestion, index) => (
            <ImprovementProposalItem
              key={index}
              suggestion={suggestion}
              index={index}
              isSelected={selectedIndices.has(index)}
              onToggle={onToggle}
              disabled={isApplying}
            />
          ))}
        </div>
      </div>
    );
  },
);

ImprovementProposalList.displayName = "ImprovementProposalList";
