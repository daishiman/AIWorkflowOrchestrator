/**
 * AnalyticsDashboard - 分析ダッシュボードビュー（Organism）
 *
 * スキル利用分析データをサマリーカード・チャート・テーブルで表示する。
 * FR-3D: 分析ダッシュボード要件に対応。
 *
 * @module AnalyticsDashboard
 */

import React, { memo, useCallback, useMemo } from "react";
import clsx from "clsx";
import { RefreshCw } from "lucide-react";
import { useAnalyticsSummary } from "./hooks/useAnalyticsSummary";
import { useAnalyticsTrend } from "./hooks/useAnalyticsTrend";
import { useSkillStats } from "./hooks/useSkillStats";
import { SummaryCardGrid } from "./components/SummaryCardGrid";
import { UsageChart } from "./components/UsageChart";
import { SkillStatsTable } from "./components/SkillStatsTable";
import { PeriodSelector } from "./components/PeriodSelector";
import { ExportButton } from "./components/ExportButton";
import { Spinner } from "../../components/atoms/Spinner";

/** ビュースタイル定義 */
export const viewStyles = {
  container: clsx(
    "flex flex-col h-full",
    "bg-[var(--bg-primary)]",
    "overflow-hidden",
  ),
  scrollArea: "flex-1 overflow-y-auto",
  content: clsx("max-w-6xl mx-auto px-4 py-6", "sm:px-6 md:px-8"),
  header: "mb-6",
  titleRow: "flex items-center justify-between mb-1",
  title: "text-2xl font-bold text-[var(--text-primary)]",
  subtitle: "text-sm text-[var(--text-secondary)]",
  controls: "flex items-center gap-3 mb-6",
  section: "mb-6",
  loadingContainer: "flex items-center justify-center py-16",
  errorContainer: clsx(
    "flex flex-col items-center justify-center py-16",
    "text-[var(--status-error)]",
  ),
} as const;

/**
 * AnalyticsDashboard メインコンポーネント
 */
export const AnalyticsDashboard: React.FC = memo(() => {
  const {
    summary,
    isLoading: isSummaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useAnalyticsSummary();

  const {
    trend,
    isLoading: isTrendLoading,
    error: trendError,
    periodPreset,
    setPeriodPreset,
    refetch: refetchTrend,
  } = useAnalyticsTrend();

  // サマリーから使用されているスキル名リストを取得
  const skillNames = useMemo(() => {
    if (!summary) return [];
    return summary.mostUsedSkills.map((s) => s.skillName);
  }, [summary]);

  const {
    sortedStats,
    isLoading: isStatsLoading,
    error: statsError,
    sortKey,
    sortDirection,
    filterKeyword,
    setSortKey,
    setFilterKeyword,
    refetch: refetchStats,
  } = useSkillStats(skillNames);

  // 全データ再取得
  const handleRefresh = useCallback(async () => {
    await Promise.all([refetchSummary(), refetchTrend(), refetchStats()]);
  }, [refetchSummary, refetchTrend, refetchStats]);

  // エクスポートハンドラ
  const handleExport = useCallback(async (format: "json" | "csv") => {
    await window.electronAPI.skill.analyticsExport(format);
  }, []);

  // 初回ローディング状態
  if (isSummaryLoading && !summary) {
    return (
      <div className={viewStyles.container} data-testid="analytics-dashboard">
        <div className={viewStyles.loadingContainer} role="status">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  // サマリーのエラー状態
  if (summaryError && !summary) {
    return (
      <div className={viewStyles.container} data-testid="analytics-dashboard">
        <div className={viewStyles.errorContainer} role="alert">
          <p className="text-sm mb-2">{summaryError}</p>
          <button
            type="button"
            onClick={handleRefresh}
            className={clsx(
              "inline-flex items-center gap-2 px-3 py-1.5 text-sm",
              "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
              "transition-colors duration-[var(--duration-default)]",
            )}
            data-testid="retry-button"
          >
            <RefreshCw size={14} />
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={viewStyles.container} data-testid="analytics-dashboard">
      <div className={viewStyles.scrollArea}>
        <div className={viewStyles.content}>
          {/* ヘッダー */}
          <div className={viewStyles.header}>
            <div className={viewStyles.titleRow}>
              <h1 className={viewStyles.title}>分析ダッシュボード</h1>
              <button
                type="button"
                onClick={handleRefresh}
                className={clsx(
                  "inline-flex items-center gap-2 px-3 py-1.5 text-sm",
                  "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                  "rounded-lg hover:bg-[var(--bg-secondary)]",
                  "transition-colors duration-[var(--duration-default)]",
                )}
                aria-label="データを更新"
                data-testid="refresh-button"
              >
                <RefreshCw size={14} />
                更新
              </button>
            </div>
            <p className={viewStyles.subtitle}>
              スキルの利用状況と統計データを確認できます
            </p>
          </div>

          {/* サマリーカード */}
          {summary && (
            <div className={viewStyles.section}>
              <SummaryCardGrid summary={summary} />
            </div>
          )}

          {/* コントロール */}
          <div className={viewStyles.controls}>
            <PeriodSelector
              selectedPeriod={periodPreset}
              onPeriodChange={setPeriodPreset}
            />
            <div className="flex-1" />
            <ExportButton onExport={handleExport} />
          </div>

          {/* チャート */}
          <div className={viewStyles.section}>
            <UsageChart
              dataPoints={trend?.dataPoints ?? []}
              isLoading={isTrendLoading}
              error={trendError}
            />
          </div>

          {/* 統計テーブル */}
          <div className={viewStyles.section}>
            <SkillStatsTable
              stats={sortedStats}
              isLoading={isStatsLoading}
              error={statsError}
              sortKey={sortKey}
              sortDirection={sortDirection}
              filterKeyword={filterKeyword}
              onSortChange={setSortKey}
              onFilterChange={setFilterKeyword}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

AnalyticsDashboard.displayName = "AnalyticsDashboard";

export default AnalyticsDashboard;
