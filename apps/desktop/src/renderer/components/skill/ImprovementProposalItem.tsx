/**
 * @file ImprovementProposalItem.tsx
 * @description 個別の改善提案アイテムコンポーネント
 *
 * before/after の diff 表示とチェックボックスによる選択機能を提供する。
 * UT-SC-05: Apply Improvement UI
 */

import { memo } from "react";
import clsx from "clsx";
import type { RuntimeSkillCreatorImproveSuggestion } from "@repo/shared/types";

// ========================================
// スタイル定数（P47準拠: テスト側からimport可能）
// ========================================

export const diffStyles = {
  before: "bg-[var(--status-error)]/10 border-l-2 border-[var(--status-error)]",
  after:
    "bg-[var(--status-success)]/10 border-l-2 border-[var(--status-success)]",
} as const;

// ========================================
// 型定義
// ========================================

export interface ImprovementProposalItemProps {
  suggestion: RuntimeSkillCreatorImproveSuggestion;
  index: number;
  isSelected: boolean;
  onToggle: (index: number) => void;
  disabled?: boolean;
}

// ========================================
// コンポーネント
// ========================================

export const ImprovementProposalItem = memo<ImprovementProposalItemProps>(
  ({ suggestion, index, isSelected, onToggle, disabled = false }) => {
    return (
      <div
        className={clsx(
          "flex flex-col gap-2 rounded-lg p-4 shadow-sm",
          "border border-[var(--border-primary)]",
          "bg-[var(--bg-primary)]",
          "transition-colors duration-200",
        )}
      >
        {/* ヘッダー: チェックボックス + セクション名 */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle(index)}
            disabled={disabled}
            aria-label={`${suggestion.section}の改善提案を選択`}
            className="h-4 w-4 shrink-0 rounded"
          />
          <h4 className="text-sm font-semibold text-[var(--text-primary)]">
            {suggestion.section}
          </h4>
        </div>

        {/* Before ブロック */}
        <pre
          className={clsx(
            "whitespace-pre-wrap rounded-md px-3 py-2 text-xs",
            "text-[var(--text-primary)]",
            diffStyles.before,
          )}
        >
          {suggestion.before}
        </pre>

        {/* After ブロック */}
        <pre
          className={clsx(
            "whitespace-pre-wrap rounded-md px-3 py-2 text-xs",
            "text-[var(--text-primary)]",
            diffStyles.after,
          )}
        >
          {suggestion.after}
        </pre>

        {/* Reason テキスト */}
        {suggestion.reason !== "" && (
          <p className="text-xs text-[var(--text-secondary)]">
            {suggestion.reason}
          </p>
        )}
      </div>
    );
  },
);

ImprovementProposalItem.displayName = "ImprovementProposalItem";
