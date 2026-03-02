/**
 * StepList コンポーネント
 *
 * チェーン内のステップ一覧を表示する。
 * ステップの並べ替え・削除操作を提供。
 *
 * @module StepList
 */

import React, { memo, useCallback } from "react";
import clsx from "clsx";
import type { SkillChainStep } from "@repo/shared/types/skill-chain";
import { StepCard } from "./StepCard";

export interface StepListProps {
  /** ステップ配列 */
  steps: SkillChainStep[];
  /** ステップ削除ハンドラ */
  onDeleteStep: (stepId: string) => void;
  /** ステップ移動ハンドラ */
  onMoveStep: (fromIndex: number, toIndex: number) => void;
}

/** StepList のスタイル定義 */
export const stepListStyles = {
  container: "space-y-2",
  emptyMessage: clsx("text-center py-8", "text-sm text-[var(--text-muted)]"),
} as const;

/**
 * StepList コンポーネント
 */
export const StepList: React.FC<StepListProps> = memo(
  ({ steps, onDeleteStep, onMoveStep }) => {
    const handleMoveUp = useCallback(
      (index: number) => {
        if (index > 0) {
          onMoveStep(index, index - 1);
        }
      },
      [onMoveStep],
    );

    const handleMoveDown = useCallback(
      (index: number) => {
        if (index < steps.length - 1) {
          onMoveStep(index, index + 1);
        }
      },
      [onMoveStep, steps.length],
    );

    if (steps.length === 0) {
      return (
        <div
          className={stepListStyles.emptyMessage}
          data-testid="step-list-empty"
        >
          ステップがありません。「ステップを追加」ボタンで追加してください。
        </div>
      );
    }

    return (
      <div
        className={stepListStyles.container}
        role="list"
        aria-label="ステップ一覧"
        data-testid="step-list"
      >
        {steps.map((step, index) => (
          <StepCard
            key={step.stepId}
            step={step}
            index={index}
            onDelete={onDeleteStep}
            canMoveUp={index > 0}
            canMoveDown={index < steps.length - 1}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />
        ))}
      </div>
    );
  },
);

StepList.displayName = "StepList";
