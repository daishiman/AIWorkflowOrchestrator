/**
 * @file ConfigureStep.tsx
 * @description スキル作成ウィザードの設定ステップ
 * @task TASK-10A-C
 */

import React from "react";

export interface WizardOptions {
  generateTasks: boolean;
  addAgents: boolean;
  addReferences: boolean;
}

export interface ConfigureStepProps {
  options: WizardOptions;
  onOptionsChange: (options: WizardOptions) => void;
  onBack: () => void;
  onGenerate: () => void;
}

export const ConfigureStep = React.forwardRef<
  HTMLDivElement,
  ConfigureStepProps
>(({ options, onOptionsChange, onBack, onGenerate }, ref) => {
  const handleChange =
    (key: keyof WizardOptions) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onOptionsChange({ ...options, [key]: e.target.checked });
    };
  return (
    <div ref={ref} className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.generateTasks}
            onChange={handleChange("generateTasks")}
            className="w-4 h-4"
          />
          <span className="text-sm text-[var(--text-primary)]">タスク生成</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.addAgents}
            onChange={handleChange("addAgents")}
            className="w-4 h-4"
          />
          <span className="text-sm text-[var(--text-primary)]">
            エージェント追加
          </span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={options.addReferences}
            onChange={handleChange("addReferences")}
            className="w-4 h-4"
          />
          <span className="text-sm text-[var(--text-primary)]">参照追加</span>
        </label>
      </div>
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg border border-[var(--border-primary)] text-[var(--text-primary)]"
        >
          戻る
        </button>
        <button
          onClick={onGenerate}
          className="px-4 py-2 rounded-lg bg-[var(--status-primary)] text-[var(--text-inverse)]"
        >
          スキルを生成
        </button>
      </div>
    </div>
  );
});
ConfigureStep.displayName = "ConfigureStep";
