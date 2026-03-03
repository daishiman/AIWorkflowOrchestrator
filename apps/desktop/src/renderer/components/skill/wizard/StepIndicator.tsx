/**
 * @file StepIndicator.tsx
 * @description ウィザードの進捗を示すステップインジケーター
 * @task TASK-10A-C
 *
 * P47準拠: stepStateStyles を Record定数で export
 */

import React from "react";
import clsx from "clsx";

export const stepStateStyles = {
  active: "bg-[var(--status-primary)] text-[var(--text-inverse)]",
  completed: "bg-[var(--status-success)] text-[var(--text-inverse)]",
  pending: "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
} as const;

export type StepState = keyof typeof stepStateStyles;

export interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export const StepIndicator = React.forwardRef<HTMLElement, StepIndicatorProps>(
  ({ steps, currentStep }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="ウィザードの進捗"
        className="flex items-center gap-2"
      >
        {steps.map((label, index) => {
          const state: StepState =
            index === currentStep
              ? "active"
              : index < currentStep
                ? "completed"
                : "pending";
          return (
            <div
              key={index}
              aria-current={index === currentStep ? "step" : undefined}
              data-state={state}
              className={clsx(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                stepStateStyles[state],
              )}
            >
              <span className="sr-only">
                ステップ {index + 1}: {label}
              </span>
              {index + 1}
            </div>
          );
        })}
      </nav>
    );
  },
);
StepIndicator.displayName = "StepIndicator";
