/**
 * UsageChart - 使用状況チャートコンポーネント（Organism）
 *
 * recharts を使用してトレンドデータを折れ線グラフで表示する。
 *
 * @module UsageChart
 */

import React, { memo } from "react";
import clsx from "clsx";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { TrendDataPoint } from "@repo/shared/types/skill-analytics";
import { Spinner } from "../../../components/atoms/Spinner";

export interface UsageChartProps {
  /** チャートデータ */
  dataPoints: TrendDataPoint[];
  /** ローディング状態 */
  isLoading?: boolean;
  /** エラーメッセージ */
  error?: string | null;
  /** 追加のクラス名 */
  className?: string;
}

/** 日付フォーマット（月/日） */
function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export const UsageChart: React.FC<UsageChartProps> = memo(
  ({ dataPoints, isLoading = false, error, className }) => {
    // ローディング状態
    if (isLoading) {
      return (
        <div
          className={clsx(
            "rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-6",
            className,
          )}
          data-testid="usage-chart"
        >
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        </div>
      );
    }

    // エラー状態
    if (error) {
      return (
        <div
          className={clsx(
            "rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-6",
            className,
          )}
          data-testid="usage-chart"
        >
          <div
            className="flex items-center justify-center h-64 text-[var(--status-error)]"
            role="alert"
          >
            <p className="text-sm">{error}</p>
          </div>
        </div>
      );
    }

    // 空データ状態
    if (dataPoints.length === 0) {
      return (
        <div
          className={clsx(
            "rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-6",
            className,
          )}
          data-testid="usage-chart"
        >
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
            使用状況トレンド
          </h3>
          <div
            className="flex items-center justify-center h-64 text-[var(--text-muted)]"
            role="status"
          >
            <p className="text-sm">データがありません</p>
          </div>
        </div>
      );
    }

    // チャートデータの整形
    const chartData = dataPoints.map((point) => ({
      ...point,
      date: formatDate(point.timestamp),
    }));

    return (
      <div
        className={clsx(
          "rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-6",
          className,
        )}
        data-testid="usage-chart"
      >
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
          使用状況トレンド
        </h3>
        <div className="h-64" data-testid="chart-container">
          <ResponsiveContainer width="100%" height="100%" debounce={100}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="executions"
                name="実行回数"
                stroke="var(--status-primary, #007AFF)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="errors"
                name="エラー数"
                stroke="var(--status-error, #FF3B30)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  },
);

UsageChart.displayName = "UsageChart";
