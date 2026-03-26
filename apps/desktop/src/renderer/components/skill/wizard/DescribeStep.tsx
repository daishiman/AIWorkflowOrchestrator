/**
 * @file DescribeStep.tsx
 * @description スキル作成ウィザードの説明入力ステップ
 * @task TASK-10A-C
 */

import React from "react";
import type { GenerationMode } from "./index";

export interface DescribeStepProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  generationMode?: GenerationMode;
  onGenerationModeChange?: (mode: GenerationMode) => void;
  onNext: () => void;
}

export const DescribeStep = React.forwardRef<HTMLDivElement, DescribeStepProps>(
  (
    {
      description,
      onDescriptionChange,
      generationMode = "template",
      onGenerationModeChange,
      onNext,
    },
    ref,
  ) => {
    const isValid = description.trim().length > 0;
    return (
      <div ref={ref} className="flex flex-col gap-4">
        <label
          htmlFor="skill-description"
          className="text-sm font-medium text-[var(--text-primary)]"
        >
          スキルの説明
        </label>
        <textarea
          id="skill-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="このスキルが何をするか自然言語で説明してください..."
          rows={6}
          className="w-full p-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)]"
        />
        {onGenerationModeChange && (
          <fieldset className="flex gap-4">
            <legend className="text-sm font-medium text-[var(--text-primary)] mb-2">
              生成方法を選択
            </legend>
            <label className="flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer">
              <input
                type="radio"
                name="generationMode"
                value="template"
                checked={generationMode === "template"}
                onChange={() => onGenerationModeChange("template")}
              />
              テンプレートから作成
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer">
              <input
                type="radio"
                name="generationMode"
                value="llm"
                checked={generationMode === "llm"}
                onChange={() => onGenerationModeChange("llm")}
              />
              LLM で生成
            </label>
          </fieldset>
        )}
        <div className="flex justify-end">
          <button
            onClick={onNext}
            disabled={!isValid}
            className="px-4 py-2 rounded-lg bg-[var(--status-primary)] text-[var(--text-inverse)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            次へ
          </button>
        </div>
      </div>
    );
  },
);
DescribeStep.displayName = "DescribeStep";
