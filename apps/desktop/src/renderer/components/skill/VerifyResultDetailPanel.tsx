/**
 * @file VerifyResultDetailPanel.tsx
 * @description verify 結果の詳細を表示するパネルコンポーネント
 * TASK-RT-03-VERIFY-IMPROVE-PANEL-001
 */

import { memo, useMemo, useState } from "react";
import type {
  RuntimeSkillCreatorVerifyDetail,
  RuntimeSkillCreatorVerifyCheck,
  RuntimeSkillCreatorVerifyCheckSeverity,
} from "@repo/shared/types";
import { ErrorBanner, type PanelError } from "./ErrorBanner";
import {
  PANEL_CARD_CLASSES,
  SectionHeader,
  StatusBadge,
  DetailFooter,
} from "./result-panel-parts";

export interface VerifyResultDetailPanelProps {
  verifyDetail: RuntimeSkillCreatorVerifyDetail | null;
  error?: PanelError | null;
  isLoading?: boolean;
  onRetry?: () => void;
  onReverify?: () => void;
  isReverifying?: boolean;
  showRawGovernanceNotes?: boolean;
}

type VerifyLayerKey = RuntimeSkillCreatorVerifyCheck["layer"];

const LAYER_ORDER: readonly VerifyLayerKey[] = [
  "layer1",
  "layer2",
  "layer3",
  "layer4",
];

const LAYER_LABELS: Record<VerifyLayerKey, string> = {
  layer1: "Layer 1 — 必須ファイル構造",
  layer2: "Layer 2 — SKILL.md セクション",
  layer3: "Layer 3 — スキーマ・コンテンツ品質",
  layer4: "Layer 4 — References整合性",
};

const SEVERITY_ORDER: readonly RuntimeSkillCreatorVerifyCheckSeverity[] = [
  "error",
  "warning",
  "info",
];

type SeverityFilterValue = "all" | "warning+" | "error";

const SEVERITY_FILTER_OPTIONS: readonly {
  value: SeverityFilterValue;
  label: string;
}[] = [
  { value: "all", label: "すべて" },
  { value: "warning+", label: "⚠ Warning+" },
  { value: "error", label: "✗ Error" },
];

function shouldShowCheck(
  severity: RuntimeSkillCreatorVerifyCheckSeverity,
  filter: SeverityFilterValue,
): boolean {
  if (filter === "all") return true;
  if (filter === "warning+")
    return severity === "warning" || severity === "error";
  return severity === "error";
}

const SEVERITY_ICON: Record<RuntimeSkillCreatorVerifyCheckSeverity, string> = {
  info: "ℹ",
  warning: "⚠",
  error: "✗",
};

const SEVERITY_STYLES: Record<RuntimeSkillCreatorVerifyCheckSeverity, string> =
  {
    info: "text-[var(--text-secondary)]",
    warning: "text-amber-600",
    error: "text-[var(--status-error)]",
  };

const SEVERITY_BADGE_STYLES: Record<
  RuntimeSkillCreatorVerifyCheckSeverity,
  string
> = {
  info: "bg-[var(--status-primary)]/10 text-[var(--status-primary)]",
  warning: "bg-amber-500/10 text-amber-700",
  error: "bg-[var(--status-error)]/10 text-[var(--status-error)]",
};

const VERIFY_STATUS_MAP: Record<
  RuntimeSkillCreatorVerifyDetail["status"],
  { badgeStatus: "success" | "failure" | "pending"; label: string }
> = {
  pass: { badgeStatus: "success", label: "合格" },
  fail: { badgeStatus: "failure", label: "不合格" },
  pending: { badgeStatus: "pending", label: "検証中" },
};

function SeverityIcon({
  severity,
}: {
  severity: RuntimeSkillCreatorVerifyCheckSeverity;
}) {
  return (
    <span className={SEVERITY_STYLES[severity]} aria-hidden="true">
      {SEVERITY_ICON[severity]}
    </span>
  );
}

function getSeverityCounts(
  checks: RuntimeSkillCreatorVerifyCheck[],
): Record<RuntimeSkillCreatorVerifyCheckSeverity, number> {
  return checks.reduce(
    (counts, check) => {
      counts[check.severity] += 1;
      return counts;
    },
    {
      info: 0,
      warning: 0,
      error: 0,
    } as Record<RuntimeSkillCreatorVerifyCheckSeverity, number>,
  );
}

function formatSeverityCountLabel(
  severity: RuntimeSkillCreatorVerifyCheckSeverity,
  count: number,
): string {
  const severityLabel = severity === "info" ? "info" : `${severity}s`;
  return `${count} ${severityLabel}`;
}

function CheckItem({ check }: { check: RuntimeSkillCreatorVerifyCheck }) {
  return (
    <article
      className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-4"
      data-testid={`skill-lifecycle-verify-check-${check.id}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          {check.id}
        </span>
        <span className="rounded-full bg-[var(--bg-primary)] px-2 py-1 text-xs font-medium text-[var(--text-secondary)]">
          {check.layer}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${SEVERITY_BADGE_STYLES[check.severity]}`}
        >
          <span aria-hidden="true">
            <SeverityIcon severity={check.severity} />
          </span>
          {check.severity === "info" ? (
            <span className="sr-only">✓</span>
          ) : null}
          <span>{check.severity}</span>
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-[var(--text-primary)]">
        {check.summary}
      </p>
      {check.evidenceSummary ? (
        <p className="mt-2 text-xs text-[var(--text-secondary)]">
          {check.evidenceSummary}
        </p>
      ) : null}
    </article>
  );
}

function CheckGroupByLayer({
  layer,
  checks,
}: {
  layer: VerifyLayerKey;
  checks: RuntimeSkillCreatorVerifyCheck[];
}) {
  const [expanded, setExpanded] = useState(true);
  const severityCounts = getSeverityCounts(checks);
  const panelId = `skill-lifecycle-verify-layer-${layer}-panel`;
  const buttonId = `skill-lifecycle-verify-layer-${layer}-button`;

  return (
    <div data-testid={`verify-layer-${layer}`}>
      <section
        className="overflow-hidden rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)]"
        data-testid={`skill-lifecycle-verify-layer-${layer}`}
      >
        <button
          type="button"
          id={buttonId}
          aria-controls={panelId}
          aria-expanded={expanded}
          onClick={() => setExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[var(--bg-secondary)]"
          data-testid={`skill-lifecycle-verify-layer-toggle-${layer}`}
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {LAYER_LABELS[layer]}
            </p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {checks.length} 件のチェック
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {SEVERITY_ORDER.filter(
              (severity) => severityCounts[severity] > 0,
            ).map((severity) => (
              <span
                key={severity}
                className={`rounded-full px-2 py-1 text-xs font-medium ${SEVERITY_BADGE_STYLES[severity]}`}
              >
                {formatSeverityCountLabel(severity, severityCounts[severity])}
              </span>
            ))}
            <span
              aria-hidden="true"
              className="text-xs font-medium text-[var(--text-secondary)]"
            >
              {expanded ? "▲" : "▼"}
            </span>
          </div>
        </button>

        {expanded ? (
          <div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            className="border-t border-[var(--border-primary)] px-4 py-4"
            data-testid={`skill-lifecycle-verify-layer-panel-${layer}`}
          >
            <div className="grid gap-3 lg:grid-cols-2">
              {checks.map((check) => (
                <CheckItem key={check.id} check={check} />
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export const VerifyResultDetailPanel = memo<VerifyResultDetailPanelProps>(
  ({
    verifyDetail,
    error,
    isLoading,
    onRetry,
    onReverify,
    isReverifying = false,
    showRawGovernanceNotes = false,
  }) => {
    const [governanceExpanded, setGovernanceExpanded] = useState(false);
    const [severityFilter, setSeverityFilter] =
      useState<SeverityFilterValue>("all");

    const checksByLayer = useMemo(() => {
      const groups: Record<VerifyLayerKey, RuntimeSkillCreatorVerifyCheck[]> = {
        layer1: [],
        layer2: [],
        layer3: [],
        layer4: [],
      };
      for (const check of verifyDetail?.checks ?? []) {
        if (check.layer in groups) {
          groups[check.layer as VerifyLayerKey].push(check);
        }
      }
      return groups;
    }, [verifyDetail?.checks]);
    const filteredChecksByLayer = useMemo(() => {
      const result: Record<VerifyLayerKey, RuntimeSkillCreatorVerifyCheck[]> = {
        layer1: [],
        layer2: [],
        layer3: [],
        layer4: [],
      };
      for (const layer of LAYER_ORDER) {
        result[layer] = (checksByLayer[layer] ?? []).filter((check) =>
          shouldShowCheck(check.severity, severityFilter),
        );
      }
      return result;
    }, [checksByLayer, severityFilter]);
    const visibleVerifyChecksCount = useMemo(() => {
      let count = 0;
      for (const layer of LAYER_ORDER) {
        count += filteredChecksByLayer[layer]?.length ?? 0;
      }
      return count;
    }, [filteredChecksByLayer]);
    const totalVerifyChecksCount = verifyDetail?.checks?.length ?? 0;

    if (isLoading) {
      return (
        <div
          className={`animate-pulse ${PANEL_CARD_CLASSES}`}
          data-testid="verify-result-skeleton"
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

    if (!verifyDetail && error) {
      return (
        <div data-testid="skill-lifecycle-verify-detail">
          <ErrorBanner error={error} onRetry={onRetry} />
        </div>
      );
    }

    if (!verifyDetail) {
      return null;
    }

    const { badgeStatus, label: badgeLabel } =
      VERIFY_STATUS_MAP[verifyDetail.status];

    return (
      <div data-testid="skill-lifecycle-verify-detail">
        <div
          className={PANEL_CARD_CLASSES}
          data-testid="verify-result-detail-panel"
        >
          {/* ヘッダー */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                Verify 結果
              </p>
              <span className="sr-only">{verifyDetail.status}</span>
            </div>
            <StatusBadge status={badgeStatus} label={badgeLabel} />
          </div>

          {/* Message */}
          {verifyDetail.message ? (
            <p className="mt-3 text-sm text-[var(--text-primary)]">
              {verifyDetail.message}
            </p>
          ) : null}

          {/* Next Action + Phase Metadata */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {verifyDetail.nextAction ? (
              <span className="inline-flex items-center rounded-full bg-[var(--status-primary)]/10 px-2 py-1 text-xs font-medium text-[var(--status-primary)]">
                {verifyDetail.nextAction}
              </span>
            ) : null}
            <span className="inline-flex items-center rounded-full bg-[var(--bg-primary)] px-2 py-1 text-xs font-medium text-[var(--text-secondary)]">
              Phase: {verifyDetail.currentPhase}
            </span>
            <span className="inline-flex items-center rounded-full bg-[var(--bg-primary)] px-2 py-1 text-xs font-medium text-[var(--text-secondary)]">
              Evidence: {verifyDetail.evidenceCount}
            </span>
          </div>

          {/* Checks Section (Layer別グループ) */}
          <SectionHeader title="チェック項目" />
          {verifyDetail.checks.length > 0 ? (
            <>
              <div
                className="mt-2 flex items-center gap-1"
                role="group"
                aria-label="Severity filter"
              >
                {SEVERITY_FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    data-testid={`skill-lifecycle-severity-filter-${option.value}`}
                    type="button"
                    aria-pressed={severityFilter === option.value}
                    onClick={() => setSeverityFilter(option.value)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      severityFilter === option.value
                        ? "bg-[var(--accent-primary)] text-white"
                        : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
                {severityFilter !== "all" && totalVerifyChecksCount > 0 ? (
                  <span
                    role="status"
                    aria-live="polite"
                    data-testid="skill-lifecycle-severity-filter-summary"
                    className="ml-3 text-xs text-[var(--text-secondary)]"
                  >
                    表示中 {visibleVerifyChecksCount} / 全{" "}
                    {totalVerifyChecksCount} 件
                  </span>
                ) : null}
              </div>
              <div className="mt-2 space-y-2">
                {LAYER_ORDER.filter(
                  (layer) => (filteredChecksByLayer[layer]?.length ?? 0) > 0,
                ).map((layer) => (
                  <CheckGroupByLayer
                    key={layer}
                    layer={layer}
                    checks={filteredChecksByLayer[layer]}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              チェック項目なし
            </p>
          )}

          {/* Route Metadata */}
          <SectionHeader title="Route" />
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="text-[var(--text-secondary)]">Type:</dt>
              <dd className="text-[var(--text-primary)]">
                {verifyDetail.route.type}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-[var(--text-secondary)]">Summary:</dt>
              <dd className="text-[var(--text-primary)]">
                {verifyDetail.route.summary}
              </dd>
            </div>
            {verifyDetail.route.permissionMode ? (
              <div className="flex gap-2">
                <dt className="text-[var(--text-secondary)]">Permission:</dt>
                <dd className="text-[var(--text-primary)]">
                  {verifyDetail.route.permissionMode}
                </dd>
              </div>
            ) : null}
            {verifyDetail.route.launcher ? (
              <div className="flex gap-2">
                <dt className="text-[var(--text-secondary)]">Launcher:</dt>
                <dd className="text-[var(--text-primary)]">
                  {verifyDetail.route.launcher}
                </dd>
              </div>
            ) : null}
          </dl>

          {/* Provenance Metadata */}
          <SectionHeader title="Provenance" />
          <dl className="mt-2 space-y-1 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-3 text-sm">
            <div>
              <dt className="text-xs text-[var(--text-secondary)]">root</dt>
              <dd className="text-[var(--text-primary)]">
                {verifyDetail.resolvedSkillCreatorRoot ?? "未取得"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-secondary)]">manifest</dt>
              <dd className="text-[var(--text-primary)]">
                {verifyDetail.manifestPath ?? "未取得"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-secondary)]">
                resource hash
              </dt>
              <dd className="text-[var(--text-primary)]">
                {verifyDetail.resourceDescriptorHash ?? "未取得"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-secondary)]">
                cache key
              </dt>
              <dd className="text-[var(--text-primary)]">
                {verifyDetail.manifestCacheKey ?? "未取得"}
              </dd>
            </div>
          </dl>

          {/* Governance Notes (折りたたみ) */}
          <div className="mt-3 border-t border-[var(--border-primary)] pt-3">
            {showRawGovernanceNotes ? (
              <>
                <span className="sr-only">
                  {verifyDetail.delegatedGovernanceNote}
                </span>
                <span className="sr-only">
                  {verifyDetail.delegatedSessionNote}
                </span>
              </>
            ) : null}
            <button
              type="button"
              onClick={() => setGovernanceExpanded((prev) => !prev)}
              className="flex items-center gap-1 text-sm font-semibold text-[var(--text-primary)]"
              aria-expanded={governanceExpanded}
            >
              <span className="text-xs">{governanceExpanded ? "▼" : "▶"}</span>
              Governance Notes
            </button>
            {governanceExpanded ? (
              <div className="mt-2 space-y-2">
                <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-3">
                  <p className="text-xs font-semibold text-[var(--text-secondary)]">
                    Governance Note
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-primary)]">
                    {verifyDetail.delegatedGovernanceNote}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-3">
                  <p className="text-xs font-semibold text-[var(--text-secondary)]">
                    Session Note
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-primary)]">
                    {verifyDetail.delegatedSessionNote}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Reverify Button */}
          {onReverify ? (
            <div className="mt-3 border-t border-[var(--border-primary)] pt-3">
              <button
                type="button"
                onClick={onReverify}
                disabled={!verifyDetail.reverifyEligible || isReverifying}
                className="rounded-lg border border-[var(--status-primary)]/30 px-3 py-1.5 text-xs font-medium text-[var(--status-primary)] transition-colors duration-200 hover:bg-[var(--status-primary)]/10 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="再検証"
                data-testid="skill-lifecycle-reverify-button"
              >
                再検証を要求する
              </button>
              {!verifyDetail.reverifyEligible && verifyDetail.disabledReason ? (
                <p className="mt-1 text-xs text-amber-600">
                  {verifyDetail.disabledReason}
                </p>
              ) : null}
            </div>
          ) : null}

          {/* フッター */}
          <DetailFooter label="Plan ID" value={verifyDetail.planId} />
        </div>
      </div>
    );
  },
);

VerifyResultDetailPanel.displayName = "VerifyResultDetailPanel";
