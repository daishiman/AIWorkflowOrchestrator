import React, { useState } from "react";
import clsx from "clsx";
import { GlassPanel } from "../../components/organisms/GlassPanel";
import { StatCard } from "../../components/molecules/StatCard";
import { ActivityItem } from "../../components/molecules/ActivityItem";
import { useAppStore } from "../../store";

export interface DashboardViewProps {
  className?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ className }) => {
  // Use flat store structure
  const dashboardStats = useAppStore((state) => state.dashboardStats);
  const activityFeed = useAppStore((state) => state.activityFeed);
  const isLoading = useAppStore((state) => state.isLoading);

  // Local state for error
  const [error] = useState<string | null>(null);

  // Compute derived stats
  const stats = {
    totalDocuments: dashboardStats.totalDocs,
    indexedDocuments: dashboardStats.ragIndexed,
    totalConversations: 0,
    storageUsedPercent:
      dashboardStats.storageTotal > 0
        ? Math.round(
            (dashboardStats.storageUsed / dashboardStats.storageTotal) * 100,
          )
        : 0,
  };

  // Map activity feed to expected format
  const recentActivity = activityFeed.map((activity) => ({
    id: activity.id,
    title: activity.message,
    timestamp: activity.time,
    type: activity.type as "info" | "success" | "warning" | "error",
  }));

  if (error) {
    return (
      <div
        className={clsx(
          "flex items-center justify-center h-full text-red-400",
          className,
        )}
        role="alert"
      >
        <p>エラーが発生しました: {error}</p>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex flex-col gap-6 p-6 h-full overflow-auto",
        className,
      )}
      data-testid="dashboard-view"
    >
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-white">ダッシュボード</h1>
        <p className="text-gray-400 mt-1">
          Knowledge Studioの概要と最新のアクティビティ
        </p>
      </header>

      {/* Stats Grid */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          統計情報
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="ドキュメント"
            value={isLoading ? "-" : stats.totalDocuments.toLocaleString()}
            icon="file-text"
            color="default"
          />
          <StatCard
            title="インデックス済み"
            value={isLoading ? "-" : stats.indexedDocuments.toLocaleString()}
            icon="check"
            color="success"
          />
          <StatCard
            title="会話数"
            value={isLoading ? "-" : stats.totalConversations.toLocaleString()}
            icon="message-circle"
            color="default"
          />
          <StatCard
            title="ストレージ使用量"
            value={isLoading ? "-" : `${stats.storageUsedPercent}%`}
            icon="folder"
            color={stats.storageUsedPercent > 80 ? "warning" : "default"}
            progress={
              isLoading
                ? undefined
                : { value: stats.storageUsedPercent, max: 100 }
            }
          />
        </div>
      </section>

      {/* Recent Activity */}
      <section aria-labelledby="activity-heading" className="flex-1">
        <h2
          id="activity-heading"
          className="text-lg font-semibold text-white mb-4"
        >
          最近のアクティビティ
        </h2>
        <GlassPanel className="h-full max-h-96 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-400">読み込み中...</p>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-400">アクティビティはありません</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {recentActivity.map((activity) => (
                <li key={activity.id}>
                  <ActivityItem
                    message={activity.title}
                    time={activity.timestamp}
                    type={activity.type}
                  />
                </li>
              ))}
            </ul>
          )}
        </GlassPanel>
      </section>
    </div>
  );
};

DashboardView.displayName = "DashboardView";
