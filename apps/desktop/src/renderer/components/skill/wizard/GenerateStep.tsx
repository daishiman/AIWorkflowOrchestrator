/**
 * @file GenerateStep.tsx
 * @description スキル作成ウィザードの生成中ステップ
 * @task TASK-10A-C
 */

import React from "react";

export interface GenerateStepProps {
  isGenerating: boolean;
  error: Error | null;
}

export const GenerateStep = React.forwardRef<HTMLDivElement, GenerateStepProps>(
  ({ isGenerating, error }, ref) => {
    return (
      <div ref={ref} className="flex flex-col items-center gap-4 py-8">
        {isGenerating && (
          <div aria-live="polite" className="flex flex-col items-center gap-3">
            <div
              className="w-10 h-10 rounded-full border-4 border-[var(--status-primary)] border-t-transparent animate-spin"
              role="status"
            />
            <p className="text-sm text-[var(--text-secondary)]">生成中...</p>
          </div>
        )}
        {error && (
          <div className="text-[var(--status-error)] text-sm">
            {error.message || "スキル生成に失敗しました"}
          </div>
        )}
      </div>
    );
  },
);
GenerateStep.displayName = "GenerateStep";
