import React from "react";
import { Button } from "../../../components/atoms/Button";
import { Icon } from "../../../components/atoms/Icon";
import { RelativeTime } from "../../../components/atoms/RelativeTime";
import type { DashboardTimelineEntry } from "./dashboardContent";

interface RecentTimelineProps {
  items: DashboardTimelineEntry[];
  onOpenHistory: () => void;
}

export const RecentTimeline: React.FC<RecentTimelineProps> = ({
  items,
  onOpenHistory,
}) => {
  return (
    <section
      aria-labelledby="dashboard-timeline-heading"
      className="rounded-[28px] border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-secondary)_92%,transparent)] p-6 shadow-sm backdrop-blur"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="dashboard-timeline-heading"
            className="text-lg font-semibold text-[var(--text-primary)]"
          >
            最近の動き
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            最新の5件だけを見せて、詳細は履歴検索に委譲します。
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenHistory}
          leftIcon="search"
        >
          もっと見る
        </Button>
      </div>

      <ul
        className="space-y-3"
        data-testid="dashboard-timeline-list"
        aria-label="最近の動き一覧"
      >
        {items.map((item) => (
          <li key={item.id}>
            <article className="flex items-start gap-4 rounded-[24px] border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-tertiary)_88%,transparent)] p-4">
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-primary)_52%,transparent)] p-3 text-[var(--text-primary)]">
                <Icon name={item.icon} size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-[var(--text-primary)]">
                    {item.title}
                  </p>
                  <span className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    {item.statusLabel}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  <RelativeTime timestamp={item.timestamp} />
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
};
