/**
 * @file GenerateStep.tsx
 * @description スキル作成ウィザードの生成中ステップ
 * @task TASK-10A-C, TASK-SC-07
 */

import React from "react";
import type { PlanResult } from "../../../store/slices/agentSlice";
import type { GenerationMode } from "./index";

export interface GenerateStepProps {
  isGenerating: boolean;
  error: Error | null;
  generationMode?: GenerationMode;
  generationProgress?: string | null;
  planResult?: PlanResult | null;
  onExecutePlan?: () => void;
  onCancelPlan?: () => void;
}

export const GenerateStep = React.forwardRef<HTMLDivElement, GenerateStepProps>(
  (
    {
      isGenerating,
      error,
      generationMode,
      generationProgress,
      planResult,
      onExecutePlan,
      onCancelPlan,
    },
    ref,
  ) => {
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
        {generationProgress && (
          <p
            aria-live="polite"
            className="text-sm text-[var(--text-secondary)]"
          >
            {generationProgress}
          </p>
        )}
        {planResult && (
          <section className="w-full max-w-md rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              生成計画
            </h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              種別: {planResult.type}
            </p>
            {planResult.estimatedSteps !== undefined && (
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                推定ステップ数: {planResult.estimatedSteps}
              </p>
            )}
            {planResult.type === "terminal_handoff" && planResult.guidance && (
              <div className="mt-3">
                <p className="text-sm text-[var(--text-secondary)]">
                  {planResult.guidance.reason}
                </p>
                <code className="mt-2 block rounded-lg bg-[var(--bg-primary)] px-3 py-2 text-xs text-[var(--text-primary)]">
                  {planResult.guidance.command}
                </code>
              </div>
            )}
          </section>
        )}
        {generationMode === "llm" && (planResult || isGenerating || error) && (
          <div className="flex gap-3">
            {planResult && (
              <button
                onClick={onExecutePlan}
                disabled={isGenerating}
                className="px-4 py-2 rounded-lg bg-[var(--status-primary)] text-[var(--text-inverse)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                実行する
              </button>
            )}
            <button
              onClick={onCancelPlan}
              className="px-4 py-2 rounded-lg border border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
            >
              {error && !planResult ? "最初からやり直す" : "キャンセル"}
            </button>
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
