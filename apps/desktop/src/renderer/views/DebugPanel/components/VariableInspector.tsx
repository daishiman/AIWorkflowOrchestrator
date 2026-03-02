/**
 * VariableInspector - 変数インスペクタ（Organism）
 *
 * デバッグセッション中の変数一覧を表示する。
 * 検索フィルタ、ネストオブジェクトの展開、空状態の表示を提供する。
 *
 * @module VariableInspector
 */

import React, { memo, useState, useCallback, useMemo } from "react";
import clsx from "clsx";
import { Icon } from "../../../components/atoms/Icon";
import { VariableItem } from "./VariableItem";

export interface VariableInspectorProps {
  /** 変数のスナップショット */
  variables: Record<string, unknown>;
}

export const VariableInspector: React.FC<VariableInspectorProps> = memo(
  ({ variables }) => {
    const [filter, setFilter] = useState("");

    const handleFilterChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(e.target.value);
      },
      [],
    );

    const entries = useMemo(() => {
      const all = Object.entries(variables);
      if (!filter.trim()) return all;
      const lowerFilter = filter.toLowerCase();
      return all.filter(([key]) => key.toLowerCase().includes(lowerFilter));
    }, [variables, filter]);

    const isEmpty = Object.keys(variables).length === 0;

    return (
      <div
        className={clsx(
          "flex flex-col h-full",
          "bg-[var(--bg-primary)]",
          "border border-[var(--border-primary)] rounded-lg",
        )}
        data-testid="variable-inspector"
      >
        {/* ヘッダー */}
        <div
          className={clsx(
            "flex items-center gap-2 px-3 py-2",
            "border-b border-[var(--border-primary)]",
          )}
        >
          <Icon name="eye" size={14} className="text-[var(--text-muted)]" />
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            変数
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            ({Object.keys(variables).length})
          </span>
        </div>

        {/* 検索フィルタ */}
        {!isEmpty && (
          <div className="px-2 py-1.5 border-b border-[var(--border-primary)]">
            <div className="relative">
              <Icon
                name="search"
                size={12}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                placeholder="変数を検索..."
                value={filter}
                onChange={handleFilterChange}
                className={clsx(
                  "w-full pl-7 pr-2 py-1 text-xs rounded",
                  "bg-[var(--bg-secondary)] border border-[var(--border-primary)]",
                  "text-[var(--text-primary)] placeholder-[var(--text-muted)]",
                  "focus:outline-none focus:ring-1 focus:ring-[var(--status-primary)]",
                )}
                aria-label="変数を検索"
                data-testid="variable-filter-input"
              />
            </div>
          </div>
        )}

        {/* 変数一覧 */}
        <div
          className="flex-1 overflow-y-auto py-1"
          role="tree"
          aria-label="変数一覧"
        >
          {isEmpty ? (
            <div
              className="flex items-center justify-center py-8 text-xs text-[var(--text-muted)]"
              data-testid="variable-empty-state"
            >
              変数がありません
            </div>
          ) : entries.length === 0 ? (
            <div
              className="flex items-center justify-center py-8 text-xs text-[var(--text-muted)]"
              data-testid="variable-no-results"
            >
              一致する変数がありません
            </div>
          ) : (
            entries.map(([name, value]) => (
              <VariableItem key={name} name={name} value={value} />
            ))
          )}
        </div>
      </div>
    );
  },
);

VariableInspector.displayName = "VariableInspector";
