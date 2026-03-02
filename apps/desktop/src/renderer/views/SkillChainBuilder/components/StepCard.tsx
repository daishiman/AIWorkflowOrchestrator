/**
 * StepCard コンポーネント
 *
 * チェーン内の1ステップを表示するカード。
 * スキル名、入力マッピング数、条件、操作ボタンを表示する。
 *
 * @module StepCard
 */

import React, { memo, useCallback } from "react";
import clsx from "clsx";
import type { SkillChainStep } from "@repo/shared/types/skill-chain";
import { Icon } from "../../../components/atoms/Icon";
import { Badge } from "../../../components/atoms/Badge";

export interface StepCardProps {
  /** ステップデータ */
  step: SkillChainStep;
  /** ステップのインデックス（1始まり表示用） */
  index: number;
  /** 削除ハンドラ */
  onDelete: (stepId: string) => void;
  /** 上に移動できるか */
  canMoveUp: boolean;
  /** 下に移動できるか */
  canMoveDown: boolean;
  /** 上移動ハンドラ */
  onMoveUp: (index: number) => void;
  /** 下移動ハンドラ */
  onMoveDown: (index: number) => void;
}

/** StepCard のスタイル定義 */
export const stepCardStyles = {
  container: clsx(
    "flex items-center gap-3 p-3 rounded-lg",
    "bg-[var(--bg-secondary)] border border-[var(--border-primary)]",
    "transition-colors duration-[var(--duration-default)]",
    "hover:border-[var(--status-primary)]",
  ),
  stepNumber: clsx(
    "flex items-center justify-center w-7 h-7 rounded-full",
    "bg-[var(--status-primary)] text-[var(--text-inverse)]",
    "text-xs font-bold flex-shrink-0",
  ),
  content: "flex-1 min-w-0",
  skillName: "text-sm font-medium text-[var(--text-primary)] truncate",
  meta: "flex items-center gap-2 mt-1",
  metaText: "text-xs text-[var(--text-secondary)]",
  actions: "flex items-center gap-1 flex-shrink-0",
  actionButton: clsx(
    "p-1 rounded",
    "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
    "hover:bg-[var(--bg-tertiary)]",
    "transition-colors duration-[var(--duration-quick)]",
    "disabled:opacity-30 disabled:cursor-not-allowed",
  ),
  deleteButton: clsx(
    "p-1 rounded",
    "text-[var(--text-muted)] hover:text-[var(--status-error)]",
    "hover:bg-[var(--bg-tertiary)]",
    "transition-colors duration-[var(--duration-quick)]",
  ),
} as const;

/**
 * 条件種別の表示ラベル
 */
const conditionLabels: Record<string, string> = {
  always: "常に実行",
  ifVariable: "変数条件",
  ifPreviousSuccess: "前ステップ成功時",
  expression: "式評価",
};

/**
 * StepCard コンポーネント
 * React.memo でメモ化し、不要な再レンダーを防止
 */
export const StepCard: React.FC<StepCardProps> = memo(
  ({ step, index, onDelete, canMoveUp, canMoveDown, onMoveUp, onMoveDown }) => {
    const inputCount = Object.keys(step.inputMapping).length;
    const conditionLabel = step.condition
      ? (conditionLabels[step.condition.type] ?? step.condition.type)
      : null;

    const handleDelete = useCallback(() => {
      onDelete(step.stepId);
    }, [onDelete, step.stepId]);

    const handleMoveUp = useCallback(() => {
      onMoveUp(index);
    }, [onMoveUp, index]);

    const handleMoveDown = useCallback(() => {
      onMoveDown(index);
    }, [onMoveDown, index]);

    return (
      <div
        className={stepCardStyles.container}
        data-testid={`step-card-${step.stepId}`}
        role="listitem"
      >
        {/* ステップ番号 */}
        <div
          className={stepCardStyles.stepNumber}
          aria-label={`ステップ ${index + 1}`}
        >
          {index + 1}
        </div>

        {/* コンテンツ */}
        <div className={stepCardStyles.content}>
          <p className={stepCardStyles.skillName}>{step.skillName}</p>
          <div className={stepCardStyles.meta}>
            <span className={stepCardStyles.metaText}>
              入力: {inputCount}件
            </span>
            {conditionLabel && (
              <Badge variant="info" size="sm">
                {conditionLabel}
              </Badge>
            )}
            {step.timeout && (
              <span className={stepCardStyles.metaText}>
                {step.timeout / 1000}s
              </span>
            )}
          </div>
        </div>

        {/* 操作ボタン */}
        <div className={stepCardStyles.actions}>
          <button
            type="button"
            className={stepCardStyles.actionButton}
            onClick={handleMoveUp}
            disabled={!canMoveUp}
            aria-label={`ステップ ${index + 1} を上に移動`}
          >
            <Icon name="chevron-up" size={16} />
          </button>
          <button
            type="button"
            className={stepCardStyles.actionButton}
            onClick={handleMoveDown}
            disabled={!canMoveDown}
            aria-label={`ステップ ${index + 1} を下に移動`}
          >
            <Icon name="chevron-down" size={16} />
          </button>
          <button
            type="button"
            className={stepCardStyles.deleteButton}
            onClick={handleDelete}
            aria-label={`ステップ ${step.skillName} を削除`}
          >
            <Icon name="trash-2" size={16} />
          </button>
        </div>
      </div>
    );
  },
);

StepCard.displayName = "StepCard";
