/**
 * @file ImprovementApplyResult.tsx
 * @description 改善適用結果の表示コンポーネント
 *
 * applied / skipped / errors の結果内訳を表示する。
 * UT-SC-05: Apply Improvement UI
 */

import { memo } from "react";
import clsx from "clsx";
import type { ApplyImprovementResult } from "@repo/shared/types";

// ========================================
// 型定義
// ========================================

export interface ImprovementApplyResultProps {
  result: ApplyImprovementResult;
  onClose: () => void;
}

// ========================================
// コンポーネント
// ========================================

export const ImprovementApplyResult = memo<ImprovementApplyResultProps>(
  ({ result, onClose }) => {
    const hasSkipped = result.skipped > 0 || result.skippedDetails.length > 0;
    const hasErrors = result.errors.length > 0;

    return (
      <section
        className={clsx(
          "flex flex-col gap-4 rounded-xl p-4",
          "border border-[var(--border-primary)]",
          "bg-[var(--bg-primary)]",
        )}
        role="status"
        aria-live="polite"
      >
        {/* 成功件数 */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--status-success)]">
            適用成功: {result.applied}件
          </span>
        </div>

        {/* スキップセクション */}
        {hasSkipped && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-[var(--status-warning)]">
              スキップ: {result.skipped}件
            </span>
            {result.skippedDetails.length > 0 && (
              <ul
                className="flex flex-col gap-1"
                role="list"
                aria-label="スキップ詳細一覧"
              >
                {result.skippedDetails.map((detail, index) => (
                  <li
                    key={`${detail.section}-${index}`}
                    className={clsx(
                      "rounded-lg px-3 py-2 text-xs",
                      "border border-[var(--border-primary)]",
                      "bg-[var(--bg-secondary)]",
                      "text-[var(--text-primary)]",
                    )}
                  >
                    <span className="font-medium">{detail.section}</span>
                    {" - "}
                    <span className="text-[var(--text-secondary)]">
                      {detail.reason}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* エラーセクション */}
        {hasErrors && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-[var(--status-error)]">
              エラー: {result.errors.length}件
            </span>
            <ul
              className="flex flex-col gap-1"
              role="list"
              aria-label="エラー一覧"
            >
              {result.errors.map((error, index) => (
                <li
                  key={`error-${index}`}
                  className={clsx(
                    "rounded-lg px-3 py-2 text-xs",
                    "border border-[var(--status-error)]/30",
                    "bg-[var(--status-error)]/5",
                    "text-[var(--status-error)]",
                  )}
                >
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 閉じるボタン */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="結果を閉じる"
            className={clsx(
              "rounded-lg border border-[var(--border-primary)]",
              "bg-[var(--bg-primary)] px-4 py-1.5 text-xs font-medium",
              "text-[var(--text-primary)] transition-colors duration-200",
              "hover:bg-[var(--bg-secondary)]",
            )}
          >
            閉じる
          </button>
        </div>
      </section>
    );
  },
);

ImprovementApplyResult.displayName = "ImprovementApplyResult";
