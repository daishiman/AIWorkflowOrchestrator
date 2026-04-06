/**
 * @file SkillCreationResultPanel.tsx
 * @description plan / execute / verify 結果を束ねる orchestration wrapper
 * TASK-RT-03: skill-creation-result-panel
 */

import { memo } from "react";
import type {
  RuntimeSkillCreatorExecuteResult,
  RuntimeSkillCreatorPlanResult,
  RuntimeSkillCreatorVerifyDetail,
} from "@repo/shared/types";
import { ExecuteResultDetailPanel } from "./ExecuteResultDetailPanel";
import { PlanResultDetailPanel } from "./PlanResultDetailPanel";
import { VerifyResultDetailPanel } from "./VerifyResultDetailPanel";
import { PANEL_CARD_CLASSES } from "./result-panel-parts";

export interface SkillCreationResultPanelProps {
  planResult: RuntimeSkillCreatorPlanResult | null;
  executeResult: RuntimeSkillCreatorExecuteResult | null;
  verifyDetail: RuntimeSkillCreatorVerifyDetail | null;
  verifyError?: string | null;
  onClose?: () => void;
  onReverify?: () => void;
  onRetryVerify?: () => void;
  isReverifying?: boolean;
  isVerifyDetailLoading?: boolean;
}

type OverallStatus =
  | "進行中"
  | "Plan完了"
  | "実行失敗"
  | "検証中"
  | "検証失敗"
  | "完了";

const OVERALL_STATUS_STYLES: Record<
  OverallStatus,
  { className: string; label: string }
> = {
  進行中: {
    className: "bg-[var(--bg-primary)] text-[var(--text-secondary)]",
    label: "進行中",
  },
  Plan完了: {
    className: "bg-[var(--status-primary)]/10 text-[var(--status-primary)]",
    label: "Plan完了",
  },
  実行失敗: {
    className: "bg-[var(--status-error)]/10 text-[var(--status-error)]",
    label: "実行失敗",
  },
  検証中: {
    className: "bg-amber-500/10 text-amber-700",
    label: "検証中",
  },
  検証失敗: {
    className: "bg-orange-500/10 text-orange-700",
    label: "検証失敗",
  },
  完了: {
    className: "bg-[var(--status-success)]/10 text-[var(--status-success)]",
    label: "完了",
  },
};

function getOverallStatus(
  planResult: RuntimeSkillCreatorPlanResult | null,
  executeResult: RuntimeSkillCreatorExecuteResult | null,
  verifyDetail: RuntimeSkillCreatorVerifyDetail | null,
  isVerifyDetailLoading = false,
  isReverifying = false,
  verifyError: string | null = null,
): OverallStatus {
  if (!planResult) {
    return "進行中";
  }
  if (!executeResult) {
    return "Plan完了";
  }
  if (!executeResult.success) {
    return "実行失敗";
  }
  if (isVerifyDetailLoading || isReverifying) {
    return "検証中";
  }
  if (verifyError) {
    return "検証失敗";
  }
  if (!verifyDetail || verifyDetail.status === "pending") {
    return "検証中";
  }
  if (verifyDetail.status === "fail") {
    return "検証失敗";
  }
  return "完了";
}

function OverallStatusBadge({ status }: { status: OverallStatus }) {
  const { className, label } = OVERALL_STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${className}`}
      aria-label={label}
      data-testid="skill-creation-result-overall-status"
    >
      {label}
    </span>
  );
}

export const SkillCreationResultPanel = memo<SkillCreationResultPanelProps>(
  ({
    planResult,
    executeResult,
    verifyDetail,
    verifyError = null,
    onClose,
    onReverify,
    onRetryVerify,
    isReverifying = false,
    isVerifyDetailLoading = false,
  }) => {
    const overallStatus = getOverallStatus(
      planResult,
      executeResult,
      verifyDetail,
      isVerifyDetailLoading,
      isReverifying,
      verifyError,
    );
    const isEmpty =
      !planResult &&
      !executeResult &&
      !verifyDetail &&
      !verifyError &&
      !isVerifyDetailLoading;

    return (
      <section
        className={`${PANEL_CARD_CLASSES} space-y-4`}
        data-testid="skill-creation-result-panel"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Skill Creation Result
            </p>
            <h3 className="mt-1 text-base font-semibold text-[var(--text-primary)]">
              スキル生成結果
            </h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              plan / execute / verify の結果を 1 つの面で確認します。
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <OverallStatusBadge status={overallStatus} />
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-[var(--border-primary)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)]"
                aria-label="結果パネルを閉じる"
              >
                閉じる
              </button>
            ) : null}
          </div>
        </div>

        {isEmpty ? (
          <p
            className="rounded-xl border border-dashed border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-6 text-sm text-[var(--text-secondary)]"
            data-testid="skill-creation-result-empty"
          >
            結果がまだありません
          </p>
        ) : (
          <div className="space-y-4">
            {planResult ? (
              <PlanResultDetailPanel planResult={planResult} />
            ) : null}
            {executeResult ? (
              <ExecuteResultDetailPanel executeResult={executeResult} />
            ) : null}
            {verifyDetail || isVerifyDetailLoading || verifyError ? (
              <VerifyResultDetailPanel
                verifyDetail={verifyDetail}
                error={
                  verifyError ? { message: verifyError, retryable: true } : null
                }
                isLoading={isVerifyDetailLoading}
                onRetry={onRetryVerify}
                onReverify={onReverify}
                isReverifying={isReverifying}
              />
            ) : null}
          </div>
        )}
      </section>
    );
  },
);

SkillCreationResultPanel.displayName = "SkillCreationResultPanel";
