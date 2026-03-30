/**
 * @file ExecuteResultDetailPanel.tsx
 * @description execute 結果の詳細を表示するパネルコンポーネント
 * TASK-RT-03: skill-creation-result-panel
 */

import { memo, useState } from "react";
import type {
  RuntimeSkillCreatorExecuteResult,
  SkillCreatorSdkPermissionDenial,
  SkillCreatorSdkEvent,
  SkillCreatorWorkflowSourceProvenance,
} from "@repo/shared/types";
import { ErrorBanner, type PanelError } from "./ErrorBanner";
import {
  PANEL_CARD_CLASSES,
  StatusBadge,
  DetailFooter,
} from "./result-panel-parts";

export interface ExecuteResultDetailPanelProps {
  executeResult: RuntimeSkillCreatorExecuteResult | null;
  error?: PanelError | null;
  isLoading?: boolean;
  onRetry?: () => void;
}

function MetadataRow({
  label,
  value,
}: {
  label: string;
  value: string | undefined | null;
}) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-[var(--text-secondary)]">{label}</dt>
      <dd className="text-sm text-[var(--text-primary)]">{value}</dd>
    </div>
  );
}

function PermissionDenialsList({
  denials,
}: {
  denials: SkillCreatorSdkPermissionDenial[];
}) {
  const [expanded, setExpanded] = useState(false);

  if (denials.length === 0) return null;

  return (
    <div className="mt-3 border-t border-[var(--border-primary)] pt-3">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center gap-1 text-sm font-semibold text-[var(--text-primary)]"
        aria-expanded={expanded}
      >
        <span className="text-xs">{expanded ? "▼" : "▶"}</span>
        Permission Denials ({denials.length})
      </button>
      {expanded ? (
        <ul className="mt-2 space-y-2">
          {denials.map((denial, i) => (
            <li
              key={`denial-${i}`}
              className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
            >
              {denial.toolName ? (
                <span className="font-medium text-[var(--text-primary)]">
                  {denial.toolName}
                </span>
              ) : null}
              <p className="text-[var(--text-secondary)]">{denial.reason}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function SdkEventsList({ events }: { events: SkillCreatorSdkEvent[] }) {
  const [expanded, setExpanded] = useState(false);

  if (events.length === 0) return null;

  return (
    <div className="mt-3 border-t border-[var(--border-primary)] pt-3">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center gap-1 text-sm font-semibold text-[var(--text-primary)]"
        aria-expanded={expanded}
      >
        <span className="text-xs">{expanded ? "▼" : "▶"}</span>
        SDK Events ({events.length})
      </button>
      {expanded ? (
        <ul className="mt-2 space-y-2">
          {events.map((event, i) => (
            <li
              key={`event-${i}`}
              className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
            >
              <span className="font-medium text-[var(--text-primary)]">
                [{event.eventType}]
              </span>
              {event.text ? (
                <p className="mt-1 text-[var(--text-secondary)]">
                  {event.text}
                </p>
              ) : null}
              {event.errorMessage ? (
                <p className="mt-1 text-[var(--status-error)]">
                  {event.errorMessage}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ProvenanceSection({
  provenance,
}: {
  provenance: SkillCreatorWorkflowSourceProvenance;
}) {
  return (
    <div className="mt-3 border-t border-[var(--border-primary)] pt-3">
      <h4 className="text-sm font-semibold text-[var(--text-primary)]">
        Source Provenance
      </h4>
      <dl className="mt-2 space-y-1 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-3">
        <MetadataRow label="root" value={provenance.resolvedSkillCreatorRoot} />
        <MetadataRow label="manifest" value={provenance.manifestPath} />
        <MetadataRow
          label="resource hash"
          value={provenance.resourceDescriptorHash}
        />
        <MetadataRow label="cache key" value={provenance.manifestCacheKey} />
        {provenance.warningNote ? (
          <div>
            <dt className="text-xs text-amber-700">warning</dt>
            <dd className="text-sm text-amber-700">{provenance.warningNote}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

export const ExecuteResultDetailPanel = memo<ExecuteResultDetailPanelProps>(
  ({ executeResult, error, isLoading, onRetry }) => {
    if (isLoading) {
      return (
        <div
          className={`animate-pulse ${PANEL_CARD_CLASSES}`}
          data-testid="execute-result-skeleton"
        >
          <div className="h-5 w-1/3 rounded bg-[var(--bg-primary)]" />
          <div className="mt-3 h-4 w-2/3 rounded bg-[var(--bg-primary)]" />
          <div className="mt-4 h-8 w-1/4 rounded bg-[var(--bg-primary)]" />
        </div>
      );
    }

    if (!executeResult && error) {
      return <ErrorBanner error={error} onRetry={onRetry} />;
    }

    if (!executeResult) {
      return null;
    }

    const hasMetadata =
      executeResult.sessionId ||
      executeResult.resultSubtype ||
      executeResult.stopReason;

    return (
      <div
        className={PANEL_CARD_CLASSES}
        data-testid="execute-result-detail-panel"
      >
        {/* ヘッダー */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Execute 結果
            </p>
            <h3 className="mt-1 text-base font-semibold text-[var(--text-primary)]">
              {executeResult.skillName || "名称未設定"}
            </h3>
          </div>
          <StatusBadge status={executeResult.success ? "success" : "failure"} />
        </div>

        {/* 成功/失敗メッセージ */}
        <div className="mt-3 border-t border-[var(--border-primary)] pt-3">
          {executeResult.success ? (
            <p className="text-sm text-[var(--status-success)]">
              スキルが正常に作成されました
            </p>
          ) : (
            <div>
              <p className="text-sm text-[var(--status-error)]">
                スキルの作成に失敗しました
              </p>
              {executeResult.error ? (
                <p className="mt-2 text-sm text-[var(--text-primary)]">
                  {executeResult.error}
                </p>
              ) : null}
              {onRetry ? (
                <button
                  type="button"
                  onClick={onRetry}
                  aria-label="再試行"
                  className="mt-3 rounded-lg border border-[var(--status-error)]/30 px-3 py-1.5 text-xs font-medium text-[var(--status-error)] transition-colors duration-200 hover:bg-[var(--status-error)]/10"
                >
                  再試行
                </button>
              ) : null}
            </div>
          )}
        </div>

        {/* Metadata */}
        {hasMetadata ? (
          <dl className="mt-3 space-y-1 border-t border-[var(--border-primary)] pt-3">
            <MetadataRow label="Session ID" value={executeResult.sessionId} />
            <MetadataRow
              label="Result Subtype"
              value={executeResult.resultSubtype}
            />
            <MetadataRow label="Stop Reason" value={executeResult.stopReason} />
          </dl>
        ) : null}

        {/* Permission Denials */}
        {executeResult.permissionDenials &&
        executeResult.permissionDenials.length > 0 ? (
          <PermissionDenialsList denials={executeResult.permissionDenials} />
        ) : null}

        {/* SDK Events */}
        {executeResult.sdkEvents && executeResult.sdkEvents.length > 0 ? (
          <SdkEventsList events={executeResult.sdkEvents} />
        ) : null}

        {/* Source Provenance */}
        {executeResult.sourceProvenance ? (
          <ProvenanceSection provenance={executeResult.sourceProvenance} />
        ) : null}

        {/* フッター */}
        {executeResult.executeId ? (
          <DetailFooter label="Execute ID" value={executeResult.executeId} />
        ) : null}
      </div>
    );
  },
);

ExecuteResultDetailPanel.displayName = "ExecuteResultDetailPanel";
