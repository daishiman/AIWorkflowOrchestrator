/**
 * @file AnalyticsDashboardPanel.tsx
 * @description Analytics ダッシュボードパネル（UT-W3-ANALYTICS-DASHBOARD-001）
 *
 * 設定画面に追加する Analytics 収集状態の確認 UI。
 * - renderer-local direct read: getAnalyticsAdapter() を直接呼び出す
 * - dev-only 診断ブロック: NODE_ENV !== "production" のみ表示
 * - 追加の IPC / Preload / Store は導入しない
 */

import React from "react";
import { getAnalyticsAdapter } from "../../utils/analyticsAdapter";

export interface AnalyticsDashboardPanelProps {
  className?: string;
}

interface AnalyticsDashboardRuntimeWindow extends Window {
  /**
   * E2E/visual capture 用の表示制御フック。
   * 未指定時は通常のビルド条件（NODE_ENV ベース）を使う。
   */
  __analyticsDashboardDevMode?: boolean;
}

function resolveAnalyticsDashboardDevMode(): boolean {
  if (typeof window !== "undefined") {
    const runtimeWindow = window as AnalyticsDashboardRuntimeWindow;
    if (typeof runtimeWindow.__analyticsDashboardDevMode === "boolean") {
      return runtimeWindow.__analyticsDashboardDevMode;
    }
  }

  return process.env.NODE_ENV !== "production";
}

export const AnalyticsDashboardPanel: React.FC<
  AnalyticsDashboardPanelProps
> = ({ className }) => {
  const adapter = getAnalyticsAdapter();
  const isOptedOut = adapter.isOptedOut();
  const queueSize = adapter.getQueueSize();

  const isDevMode = resolveAnalyticsDashboardDevMode();

  return (
    <div
      data-testid="analytics-dashboard-panel"
      className={className}
      aria-label="Analytics ダッシュボード"
    >
      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-[var(--text-secondary)]">収集状態</dt>
          <dd
            data-testid="analytics-opt-out-status"
            className={
              isOptedOut
                ? "text-[var(--text-secondary)]"
                : "text-green-600 dark:text-green-400"
            }
          >
            {isOptedOut ? "オプトアウト中" : "有効"}
          </dd>
        </div>

        <div className="flex items-center justify-between">
          <dt className="text-[var(--text-secondary)]">キュー</dt>
          <dd data-testid="analytics-queue-size" className="tabular-nums">
            {queueSize} 件
          </dd>
        </div>
      </dl>

      {isDevMode && (
        <div
          data-testid="event-log-viewer"
          className="mt-3 rounded-md border border-dashed border-[var(--border-primary)] p-3 text-xs text-[var(--text-secondary)]"
          aria-label="診断情報（開発モードのみ）"
        >
          <p className="font-medium">診断情報（開発モード）</p>
          <p className="mt-1">アダプター初期化済み: はい</p>
        </div>
      )}
    </div>
  );
};

AnalyticsDashboardPanel.displayName = "AnalyticsDashboardPanel";
