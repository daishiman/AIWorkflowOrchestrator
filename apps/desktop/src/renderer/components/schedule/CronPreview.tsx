/**
 * @file CronPreview.tsx
 * @description cron 式と自然言語のプレビュー表示
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001
 */

import React, { memo } from "react";
import { cronToHumanReadable } from "../../utils/cronHumanizer";

interface CronPreviewProps {
  cronExpression: string;
  locale?: "ja" | "en";
}

export const CronPreview: React.FC<CronPreviewProps> = memo(
  ({ cronExpression, locale = "ja" }) => {
    const humanText = cronToHumanReadable(cronExpression, locale);

    return (
      <div className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] p-3 space-y-1">
        <p className="text-sm text-[var(--text-secondary)]">{humanText}</p>
        <code className="text-xs text-[var(--text-muted)] font-mono">
          {cronExpression}
        </code>
      </div>
    );
  },
);

CronPreview.displayName = "CronPreview";
