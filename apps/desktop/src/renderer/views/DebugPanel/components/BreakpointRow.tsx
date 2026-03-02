/**
 * BreakpointRow - ブレークポイント行（Molecule）
 *
 * ブレークポイントの有効/無効トグルと削除ボタンを提供する。
 *
 * @module BreakpointRow
 */

import React, { memo, useCallback } from "react";
import clsx from "clsx";
import type { Breakpoint } from "@repo/shared/types/skill-debug";
import { Icon } from "../../../components/atoms/Icon";

export interface BreakpointRowProps {
  /** ブレークポイントデータ */
  breakpoint: Breakpoint;
  /** 有効/無効トグルハンドラ */
  onToggle: (breakpointId: string, enabled: boolean) => void;
  /** 削除ハンドラ */
  onRemove: (breakpointId: string) => void;
}

/** ブレークポイントタイプの表示ラベル */
const typeLabel: Record<string, string> = {
  tool: "ツール",
  hook: "フック",
  step: "ステップ",
};

export const BreakpointRow: React.FC<BreakpointRowProps> = memo(
  ({ breakpoint, onToggle, onRemove }) => {
    const handleToggle = useCallback(() => {
      onToggle(breakpoint.id, !breakpoint.enabled);
    }, [breakpoint.id, breakpoint.enabled, onToggle]);

    const handleRemove = useCallback(() => {
      onRemove(breakpoint.id);
    }, [breakpoint.id, onRemove]);

    const displayName =
      breakpoint.toolName ??
      breakpoint.hookType ??
      `ステップ #${breakpoint.id.slice(0, 6)}`;

    return (
      <div
        className={clsx(
          "flex items-center gap-2 px-3 py-1.5 group",
          "hover:bg-[var(--bg-secondary)]",
          !breakpoint.enabled && "opacity-50",
        )}
        role="listitem"
        data-testid="breakpoint-row"
        data-breakpoint-id={breakpoint.id}
      >
        {/* 有効/無効チェックボックス */}
        <input
          type="checkbox"
          checked={breakpoint.enabled}
          onChange={handleToggle}
          className={clsx(
            "w-3.5 h-3.5 rounded cursor-pointer",
            "accent-[var(--status-primary)]",
          )}
          aria-label={`ブレークポイント ${displayName} を${breakpoint.enabled ? "無効化" : "有効化"}`}
          data-testid="breakpoint-toggle"
        />

        {/* タイプバッジ */}
        <span
          className={clsx(
            "text-[10px] px-1 py-0.5 rounded",
            "bg-[var(--bg-tertiary)] text-[var(--text-muted)]",
            "font-mono shrink-0",
          )}
        >
          {typeLabel[breakpoint.type] ?? breakpoint.type}
        </span>

        {/* ブレークポイント名 */}
        <span
          className="text-xs text-[var(--text-primary)] font-mono truncate flex-1"
          title={displayName}
        >
          {displayName}
        </span>

        {/* 条件式（ある場合） */}
        {breakpoint.condition && (
          <span
            className="text-[10px] text-[var(--text-muted)] font-mono truncate max-w-[80px]"
            title={breakpoint.condition}
          >
            if: {breakpoint.condition}
          </span>
        )}

        {/* 削除ボタン */}
        <button
          onClick={handleRemove}
          className={clsx(
            "p-0.5 rounded opacity-0 group-hover:opacity-100",
            "text-[var(--text-muted)] hover:text-[var(--status-error)]",
            "transition-opacity duration-[var(--duration-default)]",
          )}
          aria-label={`ブレークポイント ${displayName} を削除`}
          data-testid="breakpoint-remove-btn"
        >
          <Icon name="x" size={12} />
        </button>
      </div>
    );
  },
);

BreakpointRow.displayName = "BreakpointRow";
