/**
 * SkillStatsTable - スキル別統計テーブル（Organism）
 *
 * ソートとフィルタリング機能付きの統計テーブル。
 *
 * @module SkillStatsTable
 */

import React, { memo, useCallback } from "react";
import clsx from "clsx";
import { ChevronUp, ChevronDown, Search } from "lucide-react";
import type { SkillStatistics } from "@repo/shared/types/skill-analytics";
import type { SortKey, SortDirection } from "../hooks/useSkillStats";
import { SkillStatsRow } from "./SkillStatsRow";
import { Spinner } from "../../../components/atoms/Spinner";

export interface SkillStatsTableProps {
  /** ソート済み統計データ */
  stats: SkillStatistics[];
  /** ローディング状態 */
  isLoading?: boolean;
  /** エラーメッセージ */
  error?: string | null;
  /** ソートキー */
  sortKey: SortKey;
  /** ソート方向 */
  sortDirection: SortDirection;
  /** フィルタキーワード */
  filterKeyword: string;
  /** ソートキー変更ハンドラ */
  onSortChange: (key: SortKey) => void;
  /** フィルタキーワード変更ハンドラ */
  onFilterChange: (keyword: string) => void;
  /** 追加のクラス名 */
  className?: string;
}

/** テーブルヘッダーの列定義 */
const columns: Array<{ key: SortKey; label: string; align: "left" | "right" }> =
  [
    { key: "skillName", label: "スキル名", align: "left" },
    { key: "totalExecutions", label: "実行回数", align: "right" },
    { key: "successRate", label: "成功率", align: "right" },
    { key: "averageDuration", label: "平均時間", align: "right" },
    { key: "totalTokens", label: "トークン数", align: "right" },
  ];

export const SkillStatsTable: React.FC<SkillStatsTableProps> = memo(
  ({
    stats,
    isLoading = false,
    error,
    sortKey,
    sortDirection,
    filterKeyword,
    onSortChange,
    onFilterChange,
    className,
  }) => {
    const handleFilterChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange(e.target.value);
      },
      [onFilterChange],
    );

    return (
      <div
        className={clsx(
          "rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)]",
          className,
        )}
        data-testid="skill-stats-table"
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            スキル別統計
          </h3>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              type="text"
              value={filterKeyword}
              onChange={handleFilterChange}
              placeholder="スキル名で検索..."
              className={clsx(
                "pl-8 pr-3 py-1.5 text-xs rounded-lg",
                "bg-[var(--bg-secondary)] border border-[var(--border-primary)]",
                "text-[var(--text-primary)] placeholder-[var(--text-muted)]",
                "focus:outline-none focus:ring-1 focus:ring-[var(--status-primary)]",
              )}
              aria-label="スキル名でフィルタ"
              data-testid="stats-filter-input"
            />
          </div>
        </div>

        {/* ローディング */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Spinner size="md" />
          </div>
        )}

        {/* エラー */}
        {!isLoading && error && (
          <div
            className="flex items-center justify-center py-12 text-[var(--status-error)]"
            role="alert"
          >
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* テーブル */}
        {!isLoading && !error && (
          <>
            {stats.length === 0 ? (
              <div
                className="flex items-center justify-center py-12 text-[var(--text-muted)]"
                role="status"
              >
                <p className="text-sm">
                  {filterKeyword.trim()
                    ? "該当するスキルが見つかりません"
                    : "統計データがありません"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" role="table">
                  <thead>
                    <tr className="border-b border-[var(--border-primary)]">
                      {columns.map((col) => (
                        <th
                          key={col.key}
                          className={clsx(
                            "px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider cursor-pointer",
                            "hover:text-[var(--text-primary)] transition-colors duration-[var(--duration-quick)]",
                            col.align === "right" ? "text-right" : "text-left",
                          )}
                          onClick={() => onSortChange(col.key)}
                          aria-sort={
                            sortKey === col.key
                              ? sortDirection === "asc"
                                ? "ascending"
                                : "descending"
                              : "none"
                          }
                          data-testid={`sort-${col.key}`}
                        >
                          <span className="inline-flex items-center gap-1">
                            {col.label}
                            {sortKey === col.key && (
                              <span aria-hidden="true">
                                {sortDirection === "asc" ? (
                                  <ChevronUp size={12} />
                                ) : (
                                  <ChevronDown size={12} />
                                )}
                              </span>
                            )}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((stat) => (
                      <SkillStatsRow key={stat.skillName} stat={stat} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    );
  },
);

SkillStatsTable.displayName = "SkillStatsTable";
