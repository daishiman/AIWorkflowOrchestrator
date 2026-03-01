/**
 * FeaturedCard Component
 *
 * おすすめセクションのスキルカード。
 * - h=160px, 56px アイコン
 * - アクセントカラー5%グラデーション背景
 * - stagger 出現アニメーション
 *
 * @module SkillCenterView/components/FeaturedSection/FeaturedCard
 */

import React, { memo, useCallback } from "react";
import clsx from "clsx";
import type { SkillMetadata } from "@repo/shared/types/skill";
import { AddButton } from "../AddButton";

export interface FeaturedCardProps {
  /** スキルメタデータ */
  skill: SkillMetadata;
  /** 追加処理中フラグ */
  isAdding: boolean;
  /** 追加済みフラグ */
  isAdded: boolean;
  /** ツール追加ハンドラ */
  onAdd: (skillName: string) => void;
  /** ツール選択（詳細表示）ハンドラ */
  onSelect: (skillName: string) => void;
  /** stagger animation delay 用インデックス */
  index: number;
}

/** フィーチャーカードスタイル定義 */
export const featuredCardStyles = {
  container: clsx(
    "relative flex flex-col justify-between p-5 rounded-xl h-[160px]",
    "bg-gradient-to-br from-[var(--status-primary)]/5 to-transparent",
    "border border-[var(--border-primary)]",
    "transition-all duration-200 ease-out",
    "hover:scale-[1.02] hover:shadow-md hover:border-[var(--status-primary)]/30",
    "active:scale-[0.97]",
    "focus-within:outline-none focus-within:ring-2 focus-within:ring-[var(--status-primary)] focus-within:ring-offset-2",
    "cursor-pointer",
    "will-change-transform",
  ),
  iconWrapper: clsx(
    "flex items-center justify-center w-14 h-14 rounded-2xl mb-2",
    "bg-[var(--status-primary)]/10",
    "text-[var(--status-primary)]",
  ),
  name: "text-sm font-semibold text-[var(--text-primary)]",
  description: "text-xs text-[var(--text-secondary)] line-clamp-1 mt-0.5",
  footer: "flex items-center justify-end mt-auto",
} as const;

/**
 * AddButton の status を判定するヘルパー。
 */
function resolveButtonStatus(
  isAdded: boolean,
  isAdding: boolean,
): "idle" | "processing" | "success" {
  if (isAdding) return "processing";
  if (isAdded) return "success";
  return "idle";
}

/**
 * おすすめツールカードコンポーネント。
 */
export const FeaturedCard: React.FC<FeaturedCardProps> = memo(
  ({ skill, isAdding, isAdded, onAdd, onSelect, index }) => {
    const skillName = String(skill.name);

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

    // stagger animation delay
    const animationDelay = `${index * 100}ms`;

    return (
      <div
        role="button"
        tabIndex={0}
        className={clsx(
          featuredCardStyles.container,
          "animate-fade-in opacity-0",
        )}
        style={{
          animationDelay,
          animationFillMode: "forwards",
        }}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        aria-label={`おすすめ: ${skillName} ツール`}
        data-testid={`featured-card-${skillName}`}
      >
        <div>
          <div className={featuredCardStyles.iconWrapper}>
            <span className="text-2xl font-bold" aria-hidden="true">
              {skillName.charAt(0).toUpperCase()}
            </span>
          </div>
          <h3 className={featuredCardStyles.name}>{skillName}</h3>
          <p
            className={featuredCardStyles.description}
            title={skill.description}
          >
            {skill.description}
          </p>
        </div>
        <div className={featuredCardStyles.footer}>
          <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <AddButton
              status={resolveButtonStatus(isAdded, isAdding)}
              isAdded={isAdded}
              onAdd={handleAdd}
              size="featured"
            />
          </div>
        </div>
      </div>
    );
  },
);

FeaturedCard.displayName = "FeaturedCard";
