/**
 * SkillCard Component
 *
 * カードグリッド内のツールカード。
 * - hover: scale(1.02) + shadow
 * - active: scale(0.97)
 * - フォーカスリング: 2px accent color outline（offset 2px）
 * - 説明文1行切り捨て
 *
 * @module SkillCenterView/components/SkillCard
 */

import React, { memo, useCallback } from "react";
import clsx from "clsx";
import type { SkillMetadata } from "@repo/shared/types/skill";
import { AddButton } from "./AddButton";

export interface SkillCardProps {
  /** スキルメタデータ */
  skill: SkillMetadata;
  /** 追加済みフラグ */
  isAdded: boolean;
  /** 追加処理中フラグ */
  isAdding?: boolean;
  /** ツール追加ハンドラ */
  onAdd: (skillName: string) => void;
  /** ツール選択（詳細表示）ハンドラ */
  onSelect: (skillName: string) => void;
}

/** カードスタイル定義 */
export const cardStyles = {
  container: clsx(
    "relative flex flex-col p-4 rounded-xl",
    "bg-[var(--bg-primary)] border border-[var(--border-primary)]",
    "transition-all duration-200 ease-out",
    "hover:scale-[1.02] hover:shadow-md",
    "active:scale-[0.97]",
    "focus-within:outline-none focus-within:ring-2 focus-within:ring-[var(--status-primary)] focus-within:ring-offset-2",
    "cursor-pointer",
    "will-change-transform",
  ),
  iconWrapper: clsx(
    "flex items-center justify-center w-10 h-10 rounded-lg mb-3",
    "bg-[var(--bg-secondary)]",
    "text-[var(--text-secondary)]",
  ),
  name: clsx("text-sm font-semibold text-[var(--text-primary)] mb-1"),
  description: clsx(
    "text-xs text-[var(--text-secondary)] line-clamp-1 mb-3 flex-1",
  ),
  footer: "flex items-center justify-between mt-auto",
  fileCount: "text-xs text-[var(--text-muted)]",
} as const;

/**
 * スキルのファイル総数を計算する。
 */
function getFileCount(skill: SkillMetadata): number {
  return (
    skill.agents.length +
    skill.references.length +
    skill.indexes.length +
    skill.otherFiles.length
  );
}

/**
 * ツールカードコンポーネント。
 */
export const SkillCard: React.FC<SkillCardProps> = memo(
  ({ skill, isAdded, isAdding = false, onAdd, onSelect }) => {
    const skillName = String(skill.name);
    const fileCount = getFileCount(skill);

    const handleCardClick = useCallback(() => {
      onSelect(skillName);
    }, [onSelect, skillName]);

    const handleCardKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(skillName);
        }
      },
      [onSelect, skillName],
    );

    const handleAdd = useCallback(() => {
      onAdd(skillName);
    }, [onAdd, skillName]);

    return (
      <div
        role="button"
        tabIndex={0}
        className={cardStyles.container}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        aria-label={`${skillName} ツール`}
        data-testid={`skill-card-${skillName}`}
      >
        <div className={cardStyles.iconWrapper}>
          <span className="text-lg" aria-hidden="true">
            {skillName.charAt(0).toUpperCase()}
          </span>
        </div>
        <h3 className={cardStyles.name}>{skillName}</h3>
        <p className={cardStyles.description} title={skill.description}>
          {skill.description}
        </p>
        <div className={cardStyles.footer}>
          <span className={cardStyles.fileCount}>
            {fileCount > 0 ? `${fileCount}ファイル` : ""}
          </span>
          <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <AddButton
              status={isAdding ? "processing" : isAdded ? "success" : "idle"}
              isAdded={isAdded}
              onAdd={handleAdd}
            />
          </div>
        </div>
      </div>
    );
  },
);

SkillCard.displayName = "SkillCard";
