/**
 * ChainCard コンポーネント
 *
 * チェーン一覧上の個別カード表示。
 * チェーン名、説明、ステップ数、最終更新日時を表示する。
 *
 * @module ChainCard
 */

import React, { memo, useCallback } from "react";
import clsx from "clsx";
import type { SkillChainDefinition } from "@repo/shared/types/skill-chain";
import { Icon } from "../../../components/atoms/Icon";
import { Badge } from "../../../components/atoms/Badge";

export interface ChainCardProps {
  /** チェーン定義 */
  chain: SkillChainDefinition;
  /** 選択ハンドラ */
  onSelect: (chainId: string) => void;
  /** 削除ハンドラ */
  onDelete: (chainId: string) => void;
}

/** ChainCard のスタイル定義 */
export const chainCardStyles = {
  container: clsx(
    "p-4 rounded-xl cursor-pointer",
    "bg-[var(--bg-secondary)] border border-[var(--border-primary)]",
    "transition-all duration-[var(--duration-default)]",
    "hover:border-[var(--status-primary)] hover:shadow-md",
  ),
  header: "flex items-start justify-between mb-2",
  title: "text-sm font-semibold text-[var(--text-primary)] line-clamp-1",
  description: "text-xs text-[var(--text-secondary)] line-clamp-2 mb-3",
  footer: "flex items-center justify-between",
  meta: "flex items-center gap-2",
  metaText: "text-xs text-[var(--text-muted)]",
  deleteButton: clsx(
    "p-1 rounded",
    "text-[var(--text-muted)] hover:text-[var(--status-error)]",
    "opacity-0 group-hover:opacity-100",
    "transition-all duration-[var(--duration-quick)]",
  ),
} as const;

/**
 * 日時をフォーマットする
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * ChainCard コンポーネント
 * React.memo でメモ化
 */
export const ChainCard: React.FC<ChainCardProps> = memo(
  ({ chain, onSelect, onDelete }) => {
    const handleSelect = useCallback(() => {
      onSelect(chain.id);
    }, [onSelect, chain.id]);

    const handleDelete = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(chain.id);
      },
      [onDelete, chain.id],
    );

    return (
      <div
        className={clsx(chainCardStyles.container, "group")}
        onClick={handleSelect}
        data-testid={`chain-card-${chain.id}`}
        role="button"
        tabIndex={0}
        aria-label={`チェーン: ${chain.name}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSelect();
          }
        }}
      >
        <div className={chainCardStyles.header}>
          <h3 className={chainCardStyles.title}>{chain.name}</h3>
          <button
            type="button"
            className={chainCardStyles.deleteButton}
            onClick={handleDelete}
            aria-label={`${chain.name} を削除`}
          >
            <Icon name="trash-2" size={14} />
          </button>
        </div>

        {chain.description && (
          <p className={chainCardStyles.description}>{chain.description}</p>
        )}

        <div className={chainCardStyles.footer}>
          <div className={chainCardStyles.meta}>
            <Badge variant="default" size="sm">
              {chain.steps.length} ステップ
            </Badge>
            <span className={chainCardStyles.metaText}>
              {formatDate(chain.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    );
  },
);

ChainCard.displayName = "ChainCard";
