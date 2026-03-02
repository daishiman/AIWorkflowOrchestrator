/**
 * StepHistoryItem - 履歴項目（Molecule）
 *
 * ステップ実行履歴の単一項目を表示する。
 * ステップ番号、タイプ、ツール名、実行時刻を表示する。
 *
 * @module StepHistoryItem
 */

import React, { memo } from "react";
import clsx from "clsx";
import type { DebugStep, DebugStepType } from "@repo/shared/types/skill-debug";
import { Icon, type IconName } from "../../../components/atoms/Icon";

export interface StepHistoryItemProps {
  /** ステップデータ */
  step: DebugStep;
  /** 現在のステップかどうか */
  isActive?: boolean;
  /** 選択ハンドラ */
  onSelect?: (step: DebugStep) => void;
}

/** ステップタイプに応じたアイコン */
const stepTypeIcon: Record<DebugStepType, IconName> = {
  tool_call: "settings",
  hook_execution: "zap",
  agent_response: "bot",
};

/** ステップタイプに応じたラベル */
const stepTypeLabel: Record<DebugStepType, string> = {
  tool_call: "ツール呼び出し",
  hook_execution: "フック実行",
  agent_response: "エージェント応答",
};

export const StepHistoryItem: React.FC<StepHistoryItemProps> = memo(
  ({ step, isActive = false, onSelect }) => {
    const displayName =
      step.toolName ?? step.hookType ?? stepTypeLabel[step.type];

    const handleClick = () => {
      onSelect?.(step);
    };

    return (
      <button
        className={clsx(
          "w-full flex items-center gap-2 px-3 py-2 text-left",
          "text-sm rounded-md transition-colors duration-[var(--duration-quick)]",
          isActive
            ? "bg-[var(--status-primary)]/10 text-[var(--text-primary)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]",
        )}
        onClick={handleClick}
        data-testid={`step-history-item-${step.stepNumber}`}
        aria-current={isActive ? "step" : undefined}
      >
        {/* ステップ番号 */}
        <span className="w-6 text-xs text-[var(--text-muted)] text-right shrink-0">
          #{step.stepNumber}
        </span>

        {/* タイプアイコン */}
        <Icon
          name={stepTypeIcon[step.type]}
          size={14}
          className={
            isActive
              ? "text-[var(--status-primary)]"
              : "text-[var(--text-muted)]"
          }
        />

        {/* 名前 */}
        <span className="truncate">{displayName}</span>

        {/* タイプラベル */}
        <span className="ml-auto text-xs text-[var(--text-muted)] shrink-0">
          {stepTypeLabel[step.type]}
        </span>
      </button>
    );
  },
);

StepHistoryItem.displayName = "StepHistoryItem";
