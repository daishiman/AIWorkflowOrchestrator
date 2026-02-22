---
id: TASK-10A-C
tier: 2
title: SkillCreateWizard 実装
phase: 10
depends_on: [TASK-9B]
parallel_with: [TASK-10A-A, TASK-10A-B]
blocks: [TASK-10A-D]
status: pending
priority: high
estimated_complexity: medium
tags: [frontend, renderer, ui, wizard]
---

# SkillCreateWizard 実装

## 概要

新規スキル作成のためのステップウィザードUIを実装する。

## 入力

- TASK-9B: skill-creator

## 出力

- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

## 実装詳細

```typescript
// apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx

import React, { useState } from "react";

interface SkillCreateWizardProps {
  onClose: () => void;
}

type WizardStep = "describe" | "configure" | "generate" | "complete";

export const SkillCreateWizard: React.FC<SkillCreateWizardProps> = ({
  onClose,
}) => {
  const [step, setStep] = useState<WizardStep>("describe");
  const [description, setDescription] = useState("");
  const [config, setConfig] = useState({
    generateTasks: true,
    addAgents: true,
    addReferences: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSkillPath, setGeneratedSkillPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await window.electronAPI.skill.create({
        description,
        ...config,
      });
      setGeneratedSkillPath(result.path);
      setStep("complete");
    } catch (e) {
      setError(String(e));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClose} className="hover:bg-gray-100 rounded p-1">
            ←
          </button>
          <h1 className="text-lg font-semibold">新規スキル作成</h1>
        </div>
        <StepIndicator current={step} />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {step === "describe" && (
          <DescribeStep
            description={description}
            onChange={setDescription}
            onNext={() => setStep("configure")}
          />
        )}

        {step === "configure" && (
          <ConfigureStep
            config={config}
            onChange={setConfig}
            onBack={() => setStep("describe")}
            onGenerate={() => {
              setStep("generate");
              handleGenerate();
            }}
          />
        )}

        {step === "generate" && (
          <GenerateStep isGenerating={isGenerating} error={error} />
        )}

        {step === "complete" && (
          <CompleteStep path={generatedSkillPath} onClose={onClose} />
        )}
      </div>
    </div>
  );
};

// サブコンポーネント
const StepIndicator: React.FC<{ current: WizardStep }> = ({ current }) => {
  const steps: WizardStep[] = ["describe", "configure", "generate", "complete"];
  const labels = { describe: "説明", configure: "設定", generate: "生成", complete: "完了" };
  const currentIndex = steps.indexOf(current);

  return (
    <div className="flex gap-2">
      {steps.map((step, i) => (
        <span
          key={step}
          className={`px-2 py-1 text-sm rounded ${
            i <= currentIndex ? "bg-blue-100 text-blue-800" : "bg-gray-100"
          }`}
        >
          {labels[step]}
        </span>
      ))}
    </div>
  );
};

const DescribeStep: React.FC<{
  description: string;
  onChange: (v: string) => void;
  onNext: () => void;
}> = ({ description, onChange, onNext }) => (
  <div className="max-w-2xl mx-auto">
    <h2 className="text-xl font-medium mb-4">どんなスキルを作りたいですか？</h2>
    <textarea
      value={description}
      onChange={(e) => onChange(e.target.value)}
      placeholder="作りたいスキルの機能を説明してください..."
      className="w-full h-48 p-4 border rounded"
    />
    <div className="mt-4 flex justify-end">
      <button
        type="button"
        onClick={onNext}
        disabled={!description.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        次へ
      </button>
    </div>
  </div>
);

const ConfigureStep: React.FC<{
  config: { generateTasks: boolean; addAgents: boolean; addReferences: boolean };
  onChange: (c: typeof config) => void;
  onBack: () => void;
  onGenerate: () => void;
}> = ({ config, onChange, onBack, onGenerate }) => (
  <div className="max-w-2xl mx-auto">
    <h2 className="text-xl font-medium mb-4">生成オプション</h2>
    <div className="space-y-4">
      <label className="flex items-center gap-3 p-3 border rounded cursor-pointer">
        <input
          type="checkbox"
          checked={config.generateTasks}
          onChange={(e) => onChange({ ...config, generateTasks: e.target.checked })}
        />
        <div>
          <div className="font-medium">タスク仕様書を生成</div>
          <div className="text-sm text-gray-500">実装タスクを自動生成します</div>
        </div>
      </label>
      {/* 他のオプション... */}
    </div>
    <div className="mt-6 flex justify-between">
      <button type="button" onClick={onBack} className="px-4 py-2 border rounded">
        戻る
      </button>
      <button type="button" onClick={onGenerate} className="px-4 py-2 bg-blue-600 text-white rounded">
        スキルを生成
      </button>
    </div>
  </div>
);

const GenerateStep: React.FC<{ isGenerating: boolean; error: string | null }> = ({
  isGenerating,
  error,
}) => (
  <div className="flex flex-col items-center justify-center h-full">
    {isGenerating ? (
      <>
        <span className="text-6xl animate-bounce">🤖</span>
        <p className="mt-4 text-lg">スキルを生成中...</p>
      </>
    ) : error ? (
      <>
        <span className="text-6xl">❌</span>
        <p className="mt-4 text-red-600">{error}</p>
      </>
    ) : null}
  </div>
);

const CompleteStep: React.FC<{ path: string | null; onClose: () => void }> = ({
  path,
  onClose,
}) => (
  <div className="flex flex-col items-center justify-center h-full">
    <span className="text-6xl">✅</span>
    <h2 className="mt-4 text-xl font-medium">スキルが作成されました!</h2>
    <p className="mt-2 text-gray-500">{path}</p>
    <button type="button" onClick={onClose} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded">
      閉じる
    </button>
  </div>
);
```

## ファイル

| 操作 | パス                                                               |
| ---- | ------------------------------------------------------------------ |
| 作成 | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` |

## 完了条件

- [ ] ウィザードの全ステップが実装されている
- [ ] 説明入力が機能する
- [ ] オプション設定が機能する
- [ ] スキル生成が実行できる
- [ ] 完了画面が表示される
