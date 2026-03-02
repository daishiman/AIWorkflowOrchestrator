/**
 * StepHistoryList - ステップ実行履歴（Organism）
 *
 * デバッグセッション中のステップ実行履歴をリスト表示する。
 *
 * @module StepHistoryList
 */

import React, { memo } from "react";
import clsx from "clsx";
import type { DebugStep } from "@repo/shared/types/skill-debug";
import { Icon } from "../../../components/atoms/Icon";
import { StepHistoryItem } from "./StepHistoryItem";

export interface StepHistoryListProps {
  /** ステップ実行履歴 */
  steps: DebugStep[];
  /** 現在のステップ番号 */
  currentStepNumber?: number;
  /** ステップ選択ハンドラ */
  onSelectStep?: (step: DebugStep) => void;
}

export const StepHistoryList: React.FC<StepHistoryListProps> = memo(
  ({ steps, currentStepNumber, onSelectStep }) => {
    return (
      <div
        className={clsx(
          "flex flex-col h-full",
          "bg-[var(--bg-primary)]",
          "border border-[var(--border-primary)] rounded-lg",
        )}
        data-testid="step-history-list"
      >
        {/* ヘッダー */}
        <div
          className={clsx(
            "flex items-center gap-2 px-3 py-2",
            "border-b border-[var(--border-primary)]",
          )}
        >
          <Icon name="clock" size={14} className="text-[var(--text-muted)]" />
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            実行履歴
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            ({steps.length})
          </span>
        </div>

        {/* 履歴リスト */}
        <div
          className="flex-1 overflow-y-auto py-1"
          role="list"
          aria-label="ステップ実行履歴"
        >
          {steps.length === 0 ? (
            <div
              className="flex items-center justify-center py-8 text-xs text-[var(--text-muted)]"
              data-testid="step-history-empty"
            >
              実行履歴がありません
            </div>
          ) : (
            steps.map((step) => (
              <StepHistoryItem
                key={step.stepNumber}
                step={step}
                isActive={step.stepNumber === currentStepNumber}
                onSelect={onSelectStep}
              />
            ))
          )}
        </div>
      </div>
    );
  },
);

StepHistoryList.displayName = "StepHistoryList";
