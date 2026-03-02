/**
 * CallStackEntry - コールスタックエントリ（Molecule）
 *
 * コールスタックの単一エントリを表示する。
 * 深さに応じたインデントと型アイコンを提供する。
 *
 * @module CallStackEntry
 */

import React, { memo } from "react";
import clsx from "clsx";
import type { CallStackEntry as CallStackEntryType } from "@repo/shared/types/skill-debug";
import { Icon, type IconName } from "../../../components/atoms/Icon";

export interface CallStackEntryProps {
  /** コールスタックエントリデータ */
  entry: CallStackEntryType;
  /** 現在のフレームかどうか */
  isActive?: boolean;
}

/** エントリタイプに応じたアイコン */
const typeIconMap: Record<CallStackEntryType["type"], IconName> = {
  skill: "zap",
  agent: "bot",
  tool: "settings",
};

/** エントリタイプに応じたラベル */
const typeLabel: Record<CallStackEntryType["type"], string> = {
  skill: "スキル",
  agent: "エージェント",
  tool: "ツール",
};

export const CallStackEntryComponent: React.FC<CallStackEntryProps> = memo(
  ({ entry, isActive = false }) => {
    return (
      <div
        className={clsx(
          "flex items-center gap-2 px-3 py-1.5",
          "text-sm rounded-md",
          isActive
            ? "bg-[var(--status-primary)]/10 text-[var(--text-primary)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]",
        )}
        style={{ paddingLeft: `${entry.depth * 16 + 12}px` }}
        role="treeitem"
        aria-current={isActive ? "true" : undefined}
        data-testid={`callstack-entry-${entry.depth}`}
      >
        <Icon
          name={typeIconMap[entry.type]}
          size={14}
          className={
            isActive
              ? "text-[var(--status-primary)]"
              : "text-[var(--text-muted)]"
          }
        />
        <span className="truncate font-medium">{entry.name}</span>
        <span className="ml-auto text-xs text-[var(--text-muted)]">
          {typeLabel[entry.type]}
        </span>
      </div>
    );
  },
);

CallStackEntryComponent.displayName = "CallStackEntry";
