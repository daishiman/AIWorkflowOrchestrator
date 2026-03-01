/**
 * FeaturedSection Component
 *
 * おすすめセクション（最大3枚）。
 * - デスクトップ: 3列グリッド
 * - モバイル: 横スクロール
 *
 * @module SkillCenterView/components/FeaturedSection/FeaturedSection
 */

import React, { memo } from "react";
import clsx from "clsx";
import type { SkillMetadata } from "@repo/shared/types/skill";
import { FeaturedCard } from "./FeaturedCard";

export interface FeaturedSectionProps {
  /** おすすめスキル一覧 */
  skills: SkillMetadata[];
  /** インポート済みスキル名の配列 */
  importedSkillNames: string[];
  /** ツール追加ハンドラ */
  onAdd: (skillName: string) => void;
  /** ツール選択（詳細表示）ハンドラ */
  onSelect: (skillName: string) => void;
}

/** セクションスタイル定義 */
export const sectionStyles = {
  wrapper: "mb-8",
  header: clsx(
    "flex items-center gap-2 mb-4",
    "text-sm font-semibold text-[var(--text-primary)]",
  ),
  badge: clsx(
    "inline-flex items-center px-2 py-0.5 rounded-full",
    "bg-[var(--status-primary)]/10 text-[var(--status-primary)]",
    "text-xs font-medium",
  ),
  grid: clsx(
    "grid gap-4",
    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    "sm:max-lg:overflow-x-auto sm:max-lg:scrollbar-none",
  ),
} as const;

/**
 * おすすめセクションコンポーネント。
 */
export const FeaturedSection: React.FC<FeaturedSectionProps> = memo(
  ({ skills, importedSkillNames, onAdd, onSelect }) => {
    if (skills.length === 0) return null;

    const importedSet = new Set(importedSkillNames);

    return (
      <section className={sectionStyles.wrapper} data-testid="featured-section">
        <div className={sectionStyles.header}>
          <span>おすすめツール</span>
          <span className={sectionStyles.badge}>NEW</span>
        </div>
        <div className={sectionStyles.grid}>
          {skills.map((skill, index) => {
            const skillName = String(skill.name);
            const isImported = importedSet.has(skillName);
            return (
              <FeaturedCard
                key={skillName}
                skill={skill}
                isAdding={false}
                isAdded={isImported}
                onAdd={onAdd}
                onSelect={onSelect}
                index={index}
              />
            );
          })}
        </div>
      </section>
    );
  },
);

FeaturedSection.displayName = "FeaturedSection";
