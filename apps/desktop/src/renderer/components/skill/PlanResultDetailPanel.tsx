/**
 * @file PlanResultDetailPanel.tsx
 * @description plan 結果の詳細を表示するパネルコンポーネント
 * TASK-RT-03: skill-creation-result-panel
 */

import { memo, useState } from "react";
import type { RuntimeSkillCreatorPlanResult } from "@repo/shared/types";
import { ErrorBanner, type PanelError } from "./ErrorBanner";
import {
  PANEL_CARD_CLASSES,
  SectionHeader,
  TagList,
  DetailFooter,
} from "./result-panel-parts";

export interface PlanResultDetailPanelProps {
  planResult: RuntimeSkillCreatorPlanResult | null;
  error?: PanelError | null;
  isLoading?: boolean;
  onRetry?: () => void;
}

export const PlanResultDetailPanel = memo<PlanResultDetailPanelProps>(
  ({ planResult, error, isLoading, onRetry }) => {
    const [specExpanded, setSpecExpanded] = useState(false);

    if (isLoading) {
      return (
        <div
          className={`animate-pulse ${PANEL_CARD_CLASSES}`}
          data-testid="plan-result-skeleton"
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

    if (!planResult && error) {
      return <ErrorBanner error={error} onRetry={onRetry} />;
    }

    if (!planResult) {
      return null;
    }

    return (
      <div
        className={PANEL_CARD_CLASSES}
        data-testid="plan-result-detail-panel"
      >
        {/* ヘッダー */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Plan 結果
            </p>
            <h3 className="mt-1 text-base font-semibold text-[var(--text-primary)]">
              {planResult.skillName || "名称未設定"}
            </h3>
            {planResult.description ? (
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {planResult.description}
              </p>
            ) : null}
          </div>
          <span
            className="inline-flex items-center rounded-full bg-[var(--status-primary)]/10 px-2 py-1 text-xs font-medium text-[var(--status-primary)]"
            aria-label={`推定ステップ数: ${planResult.estimatedSteps}`}
          >
            {planResult.estimatedSteps} steps
          </span>
        </div>

        {/* Agents */}
        <SectionHeader title="Agents" />
        {planResult.agents.length > 0 ? (
          <ul className="mt-2 space-y-1">
            {planResult.agents.map((agent, i) => (
              <li
                key={`${agent.name}-${i}`}
                className="text-sm text-[var(--text-primary)]"
              >
                <span className="font-medium">{agent.name}</span>
                <span className="text-[var(--text-secondary)]">
                  {" "}
                  — {agent.role}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            エージェントなし
          </p>
        )}

        {/* Scripts */}
        <SectionHeader title="Scripts" />
        {planResult.scripts.length > 0 ? (
          <ul className="mt-2 space-y-1">
            {planResult.scripts.map((script, i) => (
              <li
                key={`${script.name}-${i}`}
                className="text-sm text-[var(--text-primary)]"
              >
                <span className="font-medium">{script.name}</span>
                <span className="text-[var(--text-secondary)]">
                  {" "}
                  — {script.purpose}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            スクリプトなし
          </p>
        )}

        {/* Triggers */}
        <SectionHeader title="Triggers" />
        {planResult.triggers.length > 0 ? (
          <TagList items={planResult.triggers} variant="accent" />
        ) : (
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            トリガーなし
          </p>
        )}

        {/* Anchors */}
        <SectionHeader title="Anchors" />
        {planResult.anchors.length > 0 ? (
          <TagList items={planResult.anchors} variant="default" />
        ) : (
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            アンカーなし
          </p>
        )}

        {/* Skill Spec (折りたたみ) */}
        {planResult.skillSpec ? (
          <div className="mt-3 border-t border-[var(--border-primary)] pt-3">
            <button
              type="button"
              onClick={() => setSpecExpanded((prev) => !prev)}
              className="flex items-center gap-1 text-sm font-semibold text-[var(--text-primary)]"
              aria-expanded={specExpanded}
            >
              <span className="text-xs">{specExpanded ? "▼" : "▶"}</span>
              Skill Spec
            </button>
            {specExpanded ? (
              <pre className="mt-2 max-h-80 overflow-auto rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-3 text-xs text-[var(--text-primary)]">
                <code>{planResult.skillSpec}</code>
              </pre>
            ) : null}
          </div>
        ) : null}

        {/* フッター */}
        {planResult.planId ? (
          <DetailFooter label="Plan ID" value={planResult.planId} />
        ) : null}
      </div>
    );
  },
);

PlanResultDetailPanel.displayName = "PlanResultDetailPanel";
