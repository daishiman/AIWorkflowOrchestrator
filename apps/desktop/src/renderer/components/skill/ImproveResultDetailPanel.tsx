/**
 * @file ImproveResultDetailPanel.tsx
 * @description improve 結果の詳細を表示するパネルコンポーネント（読み取り専用）
 * TASK-RT-03-VERIFY-IMPROVE-PANEL-001
 */

import { memo, useState } from "react";
import type {
  RuntimeSkillCreatorImproveResult,
  RuntimeSkillCreatorImproveSuggestion,
} from "@repo/shared/types";
import { ErrorBanner, type PanelError } from "./ErrorBanner";
import {
  PANEL_CARD_CLASSES,
  SectionHeader,
  DetailFooter,
} from "./result-panel-parts";

export interface ImproveResultDetailPanelProps {
  improveResult: RuntimeSkillCreatorImproveResult | null;
  error?: PanelError | null;
  isLoading?: boolean;
  onRetry?: () => void;
}

function SuggestionCard({
  suggestion,
}: {
  suggestion: RuntimeSkillCreatorImproveSuggestion;
}) {
  return (
    <article className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-4">
      <h4 className="text-sm font-semibold text-[var(--text-primary)]">
        {suggestion.section || "（セクション未指定）"}
      </h4>
      <div className="mt-2 space-y-2">
        <div className="rounded-lg bg-[var(--status-error)]/10 px-3 py-2">
          <p className="text-xs font-medium text-[var(--status-error)]">
            Before
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--text-primary)]">
            {suggestion.before}
          </p>
        </div>
        <div className="rounded-lg bg-[var(--status-success)]/10 px-3 py-2">
          <p className="text-xs font-medium text-[var(--status-success)]">
            After
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--text-primary)]">
            {suggestion.after}
          </p>
        </div>
      </div>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        {suggestion.reason}
      </p>
    </article>
  );
}

export const ImproveResultDetailPanel = memo<ImproveResultDetailPanelProps>(
  ({ improveResult, error, isLoading, onRetry }) => {
    const [specExpanded, setSpecExpanded] = useState(false);

    if (isLoading) {
      return (
        <div
          className={`animate-pulse ${PANEL_CARD_CLASSES}`}
          data-testid="improve-result-skeleton"
        >
          <div className="h-5 w-1/3 rounded bg-[var(--bg-primary)]" />
          <div className="mt-3 h-4 w-2/3 rounded bg-[var(--bg-primary)]" />
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full rounded bg-[var(--bg-primary)]" />
            <div className="h-4 w-5/6 rounded bg-[var(--bg-primary)]" />
          </div>
        </div>
      );
    }

    if (!improveResult && error) {
      return <ErrorBanner error={error} onRetry={onRetry} />;
    }

    if (!improveResult) {
      return null;
    }

    return (
      <div
        className={PANEL_CARD_CLASSES}
        data-testid="improve-result-detail-panel"
      >
        {/* ヘッダー */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Improve 結果
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-[var(--status-primary)]/10 px-2 py-1 text-xs font-medium text-[var(--status-primary)]">
            {improveResult.suggestions.length} 件の提案
          </span>
        </div>

        {/* Suggestions Section */}
        <SectionHeader title="改善結果" />
        {improveResult.suggestions.length > 0 ? (
          <div className="mt-2 space-y-3">
            {improveResult.suggestions.map((suggestion, i) => (
              <SuggestionCard
                key={`${suggestion.section}-${i}`}
                suggestion={suggestion}
              />
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            改善提案はありません
          </p>
        )}

        {/* Revised Spec (折りたたみ) */}
        {improveResult.revisedSpec ? (
          <div className="mt-3 border-t border-[var(--border-primary)] pt-3">
            <button
              type="button"
              onClick={() => setSpecExpanded((prev) => !prev)}
              className="flex items-center gap-1 text-sm font-semibold text-[var(--text-primary)]"
              aria-expanded={specExpanded}
            >
              <span className="text-xs">{specExpanded ? "▼" : "▶"}</span>
              Revised Spec
            </button>
            {specExpanded ? (
              <pre className="mt-2 max-h-80 overflow-auto rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-3 text-xs text-[var(--text-primary)]">
                <code>{improveResult.revisedSpec}</code>
              </pre>
            ) : null}
          </div>
        ) : null}

        {/* フッター */}
        <DetailFooter label="Improve ID" value={improveResult.improveId} />
      </div>
    );
  },
);

ImproveResultDetailPanel.displayName = "ImproveResultDetailPanel";
