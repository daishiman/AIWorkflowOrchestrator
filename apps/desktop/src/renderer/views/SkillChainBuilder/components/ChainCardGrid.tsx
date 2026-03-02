/**
 * ChainCardGrid コンポーネント
 *
 * チェーン一覧をグリッドレイアウトで表示する。
 * レスポンシブに列数が変化する。
 *
 * @module ChainCardGrid
 */

import React, { memo } from "react";
import clsx from "clsx";
import type { SkillChainDefinition } from "@repo/shared/types/skill-chain";
import { ChainCard } from "./ChainCard";

export interface ChainCardGridProps {
  /** チェーン一覧 */
  chains: SkillChainDefinition[];
  /** チェーン選択ハンドラ */
  onSelect: (chainId: string) => void;
  /** チェーン削除ハンドラ */
  onDelete: (chainId: string) => void;
}

/** ChainCardGrid のスタイル定義 */
export const chainCardGridStyles = {
  grid: clsx("grid gap-4", "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"),
} as const;

/**
 * ChainCardGrid コンポーネント
 */
export const ChainCardGrid: React.FC<ChainCardGridProps> = memo(
  ({ chains, onSelect, onDelete }) => {
    return (
      <div className={chainCardGridStyles.grid} data-testid="chain-card-grid">
        {chains.map((chain) => (
          <ChainCard
            key={chain.id}
            chain={chain}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  },
);

ChainCardGrid.displayName = "ChainCardGrid";
