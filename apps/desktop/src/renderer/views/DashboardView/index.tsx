import React from "react";
import clsx from "clsx";
import { EmptyState } from "../../components/atoms/EmptyState";
import { useAppStore, useDisplayName } from "../../store";
import { GreetingHeader } from "./components/GreetingHeader";
import { DashboardSuggestionSection } from "./components/DashboardSuggestionSection";
import { RecentTimeline } from "./components/RecentTimeline";
import {
  getDashboardSuggestions,
  getTimelineEntries,
} from "./components/dashboardContent";

export interface DashboardViewProps {
  className?: string;
  now?: Date;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  className,
  now,
}) => {
  const dashboardStats = useAppStore((state) => state.dashboardStats);
  const activityFeed = useAppStore((state) => state.activityFeed);
  const isLoading = useAppStore((state) => state.isLoading);
  const setCurrentView = useAppStore((state) => state.setCurrentView);
  const displayName = useDisplayName();

  const pendingCount = dashboardStats.pending;
  const suggestions = getDashboardSuggestions({
    activityCount: activityFeed.length,
    pendingCount,
  });
  const timelineEntries = getTimelineEntries(activityFeed);
  const primaryEmptyAction = suggestions[0];
  const currentTime = now ?? new Date();

  const handleNavigate = (
    view: "workspace" | "skillCenter" | "agent" | "historySearch",
  ): void => {
    setCurrentView(view);
  };

  return (
    <div
      className={clsx(
        "relative h-full overflow-auto px-4 py-6 sm:px-6 lg:px-8",
        "bg-[radial-gradient(circle_at_top_left,_color-mix(in_srgb,var(--accent-primary)_10%,transparent),transparent_45%),linear-gradient(180deg,var(--bg-primary)_0%,color-mix(in_srgb,var(--bg-secondary)_96%,transparent)_100%)]",
        className,
      )}
      data-testid="dashboard-view"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <GreetingHeader
          displayName={displayName}
          now={currentTime}
          pendingCount={pendingCount}
          activityCount={activityFeed.length}
        />

        <DashboardSuggestionSection
          suggestions={suggestions}
          onNavigate={handleNavigate}
        />

        {isLoading ? (
          <section
            aria-labelledby="dashboard-timeline-heading"
            className="rounded-[28px] border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-secondary)_92%,transparent)] p-6 shadow-sm backdrop-blur"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2
                  id="dashboard-timeline-heading"
                  className="text-lg font-semibold text-[var(--text-primary)]"
                >
                  最近の動き
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                  読み込みが完了すると、最新の5件を表示します。
                </p>
              </div>
              <span
                className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--text-muted)]"
                data-testid="dashboard-loading-state"
              >
                読み込み中...
              </span>
            </div>
            <div className="space-y-3" aria-hidden="true">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-2xl bg-[color-mix(in_srgb,var(--bg-tertiary)_92%,transparent)]"
                />
              ))}
            </div>
          </section>
        ) : timelineEntries.length === 0 ? (
          <section
            aria-labelledby="dashboard-timeline-heading"
            className="rounded-[28px] border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-secondary)_92%,transparent)] p-6 shadow-sm backdrop-blur"
          >
            <div className="mb-5">
              <h2
                id="dashboard-timeline-heading"
                className="text-lg font-semibold text-[var(--text-primary)]"
              >
                最近の動き
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                まだ履歴がありません。まずはおすすめの導線から始められます。
              </p>
            </div>
            <EmptyState
              title="最初のアクションを選びましょう"
              description="ホームは、次の一手がすぐ分かる玄関のような場所です。"
              icon="sparkles"
              mood="welcoming"
              action={{
                label: primaryEmptyAction.title,
                onClick: () => handleNavigate(primaryEmptyAction.view),
              }}
              className="min-h-64 rounded-[24px] border border-dashed border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-tertiary)_90%,transparent)]"
            />
          </section>
        ) : (
          <RecentTimeline
            items={timelineEntries}
            onOpenHistory={() => handleNavigate("historySearch")}
          />
        )}
      </div>
    </div>
  );
};

DashboardView.displayName = "DashboardView";
