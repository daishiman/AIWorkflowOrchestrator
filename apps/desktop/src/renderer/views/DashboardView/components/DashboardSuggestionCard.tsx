import React from "react";
import clsx from "clsx";
import { Icon } from "../../../components/atoms/Icon";
import type { DashboardSuggestion } from "./dashboardContent";

interface DashboardSuggestionCardProps {
  suggestion: DashboardSuggestion;
  onClick: (view: DashboardSuggestion["view"]) => void;
}

const accentClassMap: Record<DashboardSuggestion["accent"], string> = {
  primary:
    "border-[color-mix(in_srgb,var(--accent-primary)_45%,var(--border-subtle))] bg-[color-mix(in_srgb,var(--accent-primary)_14%,var(--bg-secondary))]",
  info: "border-[color-mix(in_srgb,var(--status-info)_45%,var(--border-subtle))] bg-[color-mix(in_srgb,var(--status-info)_12%,var(--bg-secondary))]",
  success:
    "border-[color-mix(in_srgb,var(--status-success)_42%,var(--border-subtle))] bg-[color-mix(in_srgb,var(--status-success)_10%,var(--bg-secondary))]",
};

export const DashboardSuggestionCard: React.FC<
  DashboardSuggestionCardProps
> = ({ suggestion, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(suggestion.view)}
      className={clsx(
        "group flex h-full flex-col justify-between rounded-[26px] border p-5 text-left transition duration-200",
        "shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]",
        "hover:-translate-y-0.5 hover:shadow-md",
        accentClassMap[suggestion.accent],
      )}
      data-testid={`dashboard-suggestion-${suggestion.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-primary)_55%,transparent)] p-3 text-[var(--text-primary)]">
          <Icon name={suggestion.icon} size={18} />
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Open
          <Icon
            name="chevron-right"
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </span>
      </div>

      <div className="mt-6">
        <p className="text-lg font-semibold text-[var(--text-primary)]">
          {suggestion.title}
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          {suggestion.description}
        </p>
      </div>
    </button>
  );
};
