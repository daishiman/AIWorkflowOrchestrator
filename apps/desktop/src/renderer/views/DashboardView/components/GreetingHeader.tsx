import React from "react";
import clsx from "clsx";
import { Icon } from "../../../components/atoms/Icon";
import { getGreetingContent } from "./dashboardContent";

interface GreetingHeaderProps {
  displayName?: string | null;
  now: Date;
  pendingCount: number;
  activityCount: number;
  className?: string;
}

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({
  displayName,
  now,
  pendingCount,
  activityCount,
  className,
}) => {
  const content = getGreetingContent(
    displayName,
    now,
    pendingCount,
    activityCount,
  );

  return (
    <header
      className={clsx(
        "overflow-hidden rounded-[32px] border border-[var(--border-subtle)]",
        "bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent-primary)_14%,var(--bg-secondary))_0%,color-mix(in_srgb,var(--status-info)_8%,var(--bg-secondary))_100%)]",
        "p-6 shadow-sm backdrop-blur sm:p-8",
        className,
      )}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-primary)_50%,transparent)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            <Icon name="sparkles" size={14} />
            {content.eyebrow}
          </p>
          <h1
            id="dashboard-home-heading"
            className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl"
          >
            ホーム
          </h1>
          <p
            className="mt-3 text-lg font-medium text-[var(--text-primary)]"
            data-testid="dashboard-greeting"
          >
            {content.title}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
            {content.description}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-primary)_56%,transparent)] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Pending
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              {pendingCount}
            </p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              いま判断や実行待ちの項目です。
            </p>
          </div>
          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-primary)_56%,transparent)] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Timeline
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              {activityCount}
            </p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              直近の動きから、文脈をすぐ取り戻せます。
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
