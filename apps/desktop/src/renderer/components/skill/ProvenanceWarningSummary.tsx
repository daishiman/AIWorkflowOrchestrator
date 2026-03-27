/**
 * @file ProvenanceWarningSummary.tsx
 * @description mainline (primary route) 向けの provenance warning summary 表示。
 * raw diagnostics は secondary route (SkillLifecyclePanel) へ逃がし、
 * ここでは warningNote の要約のみ表示する。
 * @task TASK-SDK-05 (create-entry-mainline-unification)
 */

import React from "react";
import type { SkillCreatorWorkflowSourceProvenance } from "@repo/shared/types";

export interface ProvenanceWarningSummaryProps {
  sourceProvenance: SkillCreatorWorkflowSourceProvenance | null | undefined;
}

export const ProvenanceWarningSummary: React.FC<
  ProvenanceWarningSummaryProps
> = ({ sourceProvenance }) => {
  if (!sourceProvenance?.warningNote) return null;

  return (
    <div
      data-testid="provenance-warning-summary"
      data-route-kind="mainline-summary"
      className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
      role="status"
    >
      <p className="font-medium">{sourceProvenance.warningNote}</p>
    </div>
  );
};
