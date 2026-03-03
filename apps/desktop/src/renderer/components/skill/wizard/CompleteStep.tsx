/**
 * @file CompleteStep.tsx
 * @description スキル作成ウィザードの完了ステップ
 * @task TASK-10A-C
 */

import React from "react";

export interface CompleteStepProps {
  skillPath: string | null;
  onClose: () => void;
}

export const CompleteStep = React.forwardRef<HTMLDivElement, CompleteStepProps>(
  ({ skillPath, onClose }, ref) => {
    return (
      <div ref={ref} className="flex flex-col items-center gap-6 py-8">
        <p className="text-lg font-medium text-[var(--text-primary)]">
          スキルが作成されました
        </p>
        {skillPath && (
          <p className="text-sm text-[var(--text-secondary)] font-mono break-all">
            {skillPath}
          </p>
        )}
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-lg bg-[var(--status-primary)] text-[var(--text-inverse)]"
        >
          閉じる
        </button>
      </div>
    );
  },
);
CompleteStep.displayName = "CompleteStep";
