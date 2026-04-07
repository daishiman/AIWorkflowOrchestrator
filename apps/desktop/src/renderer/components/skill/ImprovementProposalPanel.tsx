/**
 * @file ImprovementProposalPanel.tsx
 * @description 改善提案パネルコンポーネント（統合コンテナ）
 *
 * 提案リスト表示 → IPC 呼び出し → 結果表示のフローを管理する。
 * UT-SC-05: Apply Improvement UI
 */

import { memo, useCallback, useState } from "react";
import clsx from "clsx";
import type {
  RuntimeSkillCreatorImproveSuggestion,
  ApplyImprovementResult,
} from "@repo/shared/types";
import { ImprovementProposalList } from "./ImprovementProposalList";
import { ImprovementApplyResult } from "./ImprovementApplyResult";

// ========================================
// 型定義
// ========================================

export interface ImprovementProposalPanelProps {
  skillName: string;
  suggestions: RuntimeSkillCreatorImproveSuggestion[];
  onClose: () => void;
  onApplyComplete?: (result: ApplyImprovementResult) => void;
}

// ========================================
// コンポーネント
// ========================================

export const ImprovementProposalPanel = memo<ImprovementProposalPanelProps>(
  ({ skillName, suggestions, onClose, onApplyComplete }) => {
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
      new Set(),
    );
    const [isApplying, setIsApplying] = useState(false);
    const [applyResult, setApplyResult] =
      useState<ApplyImprovementResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleToggle = useCallback((index: number) => {
      setSelectedIndices((prev) => {
        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else {
          next.add(index);
        }
        return next;
      });
    }, []);

    const handleSelectAll = useCallback(() => {
      setSelectedIndices(new Set(suggestions.map((_, index) => index)));
    }, [suggestions]);

    const handleDeselectAll = useCallback(() => {
      setSelectedIndices(new Set());
    }, []);

    const handleApply = useCallback(async () => {
      setIsApplying(true);
      setError(null);

      try {
        const selectedSuggestions = suggestions.filter((_, index) =>
          selectedIndices.has(index),
        );

        const result = await window.skillCreatorAPI.applyRuntimeImprovement(
          skillName,
          selectedSuggestions,
        );

        if (result.success && result.data) {
          setApplyResult(result.data);
          onApplyComplete?.(result.data);
        } else {
          setError(result.error ?? "適用に失敗しました");
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "適用に失敗しました";
        setError(message);
      } finally {
        setIsApplying(false);
      }
    }, [suggestions, selectedIndices, skillName, onApplyComplete]);

    const handleResultClose = useCallback(() => {
      setApplyResult(null);
    }, []);

    const handleErrorClose = useCallback(() => {
      setError(null);
    }, []);

    return (
      <div
        className="flex flex-col gap-4"
        data-testid="improvement-proposal-panel"
      >
        {/* パネルヘッダー */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            改善提案
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="パネルを閉じる"
            className={clsx(
              "rounded-lg border border-[var(--border-primary)]",
              "bg-[var(--bg-primary)] px-3 py-1 text-xs font-medium",
              "text-[var(--text-secondary)] transition-colors duration-200",
              "hover:bg-[var(--bg-secondary)]",
            )}
          >
            閉じる
          </button>
        </div>

        {/* エラーメッセージ */}
        {error !== null && (
          <div
            className={clsx(
              "flex items-center justify-between gap-2 rounded-lg p-3",
              "border border-[var(--status-error)]/30",
              "bg-[var(--status-error)]/5",
            )}
          >
            <p className="text-xs text-[var(--status-error)]">{error}</p>
            <button
              type="button"
              onClick={handleErrorClose}
              aria-label="エラーを閉じる"
              className={clsx(
                "shrink-0 rounded px-2 py-1 text-xs",
                "text-[var(--status-error)]",
                "hover:bg-[var(--status-error)]/10",
                "transition-colors duration-200",
              )}
            >
              閉じる
            </button>
          </div>
        )}

        {/* メインコンテンツ: 結果表示 or 提案リスト */}
        {applyResult !== null ? (
          <ImprovementApplyResult
            result={applyResult}
            onClose={handleResultClose}
          />
        ) : (
          <ImprovementProposalList
            suggestions={suggestions}
            selectedIndices={selectedIndices}
            onToggle={handleToggle}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onApply={handleApply}
            isApplying={isApplying}
            selectedCount={selectedIndices.size}
          />
        )}
      </div>
    );
  },
);

ImprovementProposalPanel.displayName = "ImprovementProposalPanel";
