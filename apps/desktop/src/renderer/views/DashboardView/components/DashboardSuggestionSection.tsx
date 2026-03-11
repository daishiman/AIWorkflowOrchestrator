import React from "react";
import { DashboardSuggestionCard } from "./DashboardSuggestionCard";
import type { DashboardSuggestion } from "./dashboardContent";

interface DashboardSuggestionSectionProps {
  suggestions: DashboardSuggestion[];
  onNavigate: (view: DashboardSuggestion["view"]) => void;
}

export const DashboardSuggestionSection: React.FC<
  DashboardSuggestionSectionProps
> = ({ suggestions, onNavigate }) => {
  return (
    <section
      aria-labelledby="dashboard-suggestions-heading"
      className="rounded-[28px] border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-secondary)_88%,transparent)] p-6 shadow-sm backdrop-blur"
    >
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="dashboard-suggestions-heading"
            className="text-lg font-semibold text-[var(--text-primary)]"
          >
            おすすめの次のステップ
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            いまの状態から外れにくい導線だけを、3件に絞っています。
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
          2-3 actions
        </p>
      </div>

      <ul
        className="grid gap-4 lg:grid-cols-3"
        data-testid="dashboard-suggestion-list"
      >
        {suggestions.map((suggestion) => (
          <li key={suggestion.id}>
            <DashboardSuggestionCard
              suggestion={suggestion}
              onClick={onNavigate}
            />
          </li>
        ))}
      </ul>
    </section>
  );
};
