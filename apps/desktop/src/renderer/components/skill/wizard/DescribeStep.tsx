/**
 * @file DescribeStep.tsx
 * @description スキル作成ウィザードの説明入力ステップ
 * @task TASK-10A-C
 * @deprecated W2-seq-03b: SkillInfoStep に置き換えられました。このファイルは将来削除される予定です。
 */

import React from "react";
import type { SkillCategory } from "@repo/shared/types/skillCreator";
import type { GenerationMode } from "./GenerateStep";

const CATEGORY_OPTIONS: Array<{
  value: SkillCategory;
  label: string;
}> = [
  { value: "automation", label: "自動化" },
  { value: "external-integration", label: "外部連携" },
  { value: "data-analysis", label: "データ分析" },
  { value: "code-support", label: "コード支援" },
  { value: "other", label: "その他" },
];

export interface DescribeStepProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  category?: SkillCategory | null;
  onCategoryChange?: (value: SkillCategory | null) => void;
  generationMode?: GenerationMode;
  onGenerationModeChange?: (mode: GenerationMode) => void;
  onNext: () => void;
}

export const DescribeStep = React.forwardRef<HTMLDivElement, DescribeStepProps>(
  (
    {
      description,
      onDescriptionChange,
      category = null,
      onCategoryChange,
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
        {onCategoryChange && (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="skill-category"
              className="text-sm font-medium text-[var(--text-primary)]"
            >
              スキルカテゴリ
            </label>
            <select
              id="skill-category"
              value={category ?? ""}
              onChange={(e) =>
                onCategoryChange(
                  (e.target.value || null) as SkillCategory | null,
                )
              }
              className="w-full p-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)]"
            >
              <option value="">未選択</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-[var(--text-secondary)]">
              Q5 の必須表示と手動テストの判定に使います。
            </p>
          </div>
        )}
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
