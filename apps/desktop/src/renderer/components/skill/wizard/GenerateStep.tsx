/**
 * @file GenerateStep.tsx
 * @description スキル作成ウィザードの生成中ステップ - ストリーミング進捗表示
 * @task TASK-SC-07-STREAMING-PROGRESS-UI
 *
 * Phase 8 リファクタリング:
 * - エラーカード3種を generate-step/ErrorCards.tsx に分離（atoms）
 * - P47 対策: Record<GenerationErrorCode, ...> で型安全マッピング維持
 */

import React from "react";
import type { PlanResult } from "../../../store/slices/agentSlice";
import { renderErrorCard } from "./generate-step/ErrorCards";

// ---- 型定義 ----

export type GenerationMode = "llm" | "template";

export type GenerationStage =
  | "idle"
  | "planning"
  | "generating-skill"
  | "generating-agents"
  | "validating"
  | "done"
  | "error"
  | "cancelled";

export type GenerationErrorCode =
  | "API_KEY_NOT_SET"
  | "LLM_ERROR"
  | "NETWORK_ERROR";

export interface GenerationError {
  code: GenerationErrorCode;
  message: string;
}

const GENERATION_STAGES: GenerationStage[] = [
  "planning",
  "generating-skill",
  "generating-agents",
  "validating",
];

const STAGE_LABELS: Partial<Record<GenerationStage, string>> = {
  planning: "スキルの構造を計画しています...",
  "generating-skill": "SKILL.md を生成しています...",
  "generating-agents": "エージェント定義を生成しています...",
  validating: "スキルを検証しています...",
};

// ---- Props ----

export interface GenerateStepProps {
  stage: GenerationStage;
  percent: number;
  message: string;
  previewContent?: string | null;
  error?: GenerationError | null;
  onCancel?: () => void;
  onRetry?: () => void;
  onOpenSettings?: () => void;
  isGenerating?: boolean;
  generationProgress?: string | null;
  planResult?: PlanResult | null;
  onExecutePlan?: () => void;
  onCancelPlan?: () => void;
}

// ---- ステップ表示の状態判定 ----

function getStepStatus(
  stepStage: GenerationStage,
  currentStage: GenerationStage,
): "completed" | "active" | "pending" {
  const stageIndex = GENERATION_STAGES.indexOf(stepStage);
  const currentIndex = GENERATION_STAGES.indexOf(currentStage);
  if (currentStage === "done") return "completed";
  if (stageIndex < currentIndex) return "completed";
  if (stageIndex === currentIndex) return "active";
  return "pending";
}

// ---- メインコンポーネント ----

export const GenerateStep = React.forwardRef<HTMLDivElement, GenerateStepProps>(
  (
    {
      stage,
      percent,
      message,
      previewContent,
      error,
      onCancel,
      onRetry,
      onOpenSettings,
      isGenerating = false,
      generationProgress,
      planResult,
      onExecutePlan,
      onCancelPlan,
    },
    ref,
  ) => {
    const isActive = GENERATION_STAGES.includes(stage);
    const currentMessage = message || generationProgress || "";
    const showPlanControls =
      Boolean(planResult) || (Boolean(error) && Boolean(onCancelPlan));
    const showCancelButton = isActive && !(onCancelPlan && showPlanControls);

    return (
      <div
        ref={ref}
        className="flex flex-col gap-6 py-8 w-full max-w-lg mx-auto"
      >
        {/* Progress Bar */}
        {stage !== "idle" && stage !== "error" && stage !== "cancelled" && (
          <div className="w-full">
            <div
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="w-full h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden"
            >
              <div
                className="h-full rounded-full bg-[var(--status-primary)] transition-all duration-300 ease-out"
                style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-right text-[var(--text-tertiary)]">
              {Math.round(percent)}%
            </p>
          </div>
        )}

        {/* Step List */}
        {stage !== "idle" && stage !== "error" && stage !== "cancelled" && (
          <div aria-live="polite" className="flex flex-col gap-2">
            {GENERATION_STAGES.map((current) => {
              const status = getStepStatus(current, stage);
              return (
                <div
                  key={current}
                  className={`flex items-center gap-3 text-sm ${
                    status === "active"
                      ? "text-[var(--text-primary)] font-medium"
                      : status === "completed"
                        ? "text-[var(--status-success)]"
                        : "text-[var(--text-tertiary)]"
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center">
                    {status === "completed" && "✓"}
                    {status === "active" && (
                      <span className="w-3 h-3 rounded-full bg-[var(--status-primary)] animate-pulse" />
                    )}
                    {status === "pending" && "○"}
                  </span>
                  <span>{STAGE_LABELS[current] ?? current}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Current Message */}
        {currentMessage && isActive && (
          <p className="text-sm text-[var(--text-secondary)] text-center">
            {currentMessage}
          </p>
        )}

        {/* Preview Panel */}
        {previewContent && (
          <div className="border border-[var(--border-primary)] rounded-lg p-4 max-h-40 overflow-y-auto">
            <p className="text-xs text-[var(--text-tertiary)] mb-2">
              プレビュー
            </p>
            <pre className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap font-mono">
              {previewContent}
            </pre>
          </div>
        )}

        {/* Legacy LLM Plan Result */}
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
                  {planResult.guidance.terminalCommand}
                </code>
              </div>
            )}
          </section>
        )}

        {/* Error Display */}
        {error &&
          renderErrorCard(error.code, error.message, onRetry, onOpenSettings)}

        {/* Legacy plan/execute controls */}
        {showPlanControls && (
          <div className="flex gap-3">
            {planResult?.type === "integrated_api" && onExecutePlan && (
              <button
                type="button"
                onClick={onExecutePlan}
                disabled={isGenerating}
                className="px-4 py-2 rounded-lg bg-[var(--status-primary)] text-[var(--text-inverse)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                実行する
              </button>
            )}
            {onCancelPlan && (
              <button
                type="button"
                onClick={onCancelPlan}
                className="px-4 py-2 rounded-lg border border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
              >
                {error && !planResult ? "最初からやり直す" : "キャンセル"}
              </button>
            )}
          </div>
        )}

        {/* Cancelled Message */}
        {stage === "cancelled" && (
          <div className="text-center text-sm text-[var(--text-secondary)]">
            キャンセルしました
          </div>
        )}

        {/* Done Message */}
        {stage === "done" && (
          <div className="text-center text-sm text-[var(--status-success)]">
            生成が完了しました
          </div>
        )}

        {/* Cancel Button */}
        {showCancelButton && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="self-center px-4 py-2 text-sm rounded-lg border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            キャンセル
          </button>
        )}
      </div>
    );
  },
);
GenerateStep.displayName = "GenerateStep";
