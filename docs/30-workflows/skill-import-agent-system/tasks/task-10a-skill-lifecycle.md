---
id: TASK-10A
tier: 2
title: スキルライフサイクル管理統合
phase: 10
depends_on: [TASK-9A, TASK-9B, TASK-9C]
parallel_with: []
blocks: []
status: split
priority: critical
estimated_complexity: xlarge
tags: [frontend, backend, integration, skill-management, final]

execution:
  mode: sequential
  timeout_minutes: 120
  retry_count: 1
  allow_partial: false

verification:
  auto_verify: true
  require_tests: true
  require_typecheck: true

artifacts:
  creates:
    - apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx
    - apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx
    - apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
  modifies:
    - apps/desktop/src/renderer/store/slices/skillSlice.ts
    - apps/desktop/src/main/ipc/skillHandlers.ts
    - apps/desktop/src/renderer/components/chat/ChatPanel.tsx
---

# スキルライフサイクル管理統合

> **⚠️ このタスクは分割されました**
>
> 実行粒度を細かくするため、以下のサブタスクに分割されています：
>
> - [TASK-10A-A: SkillManagementPanel](./task-10a-a-management-panel.md) - スキル一覧・管理パネル
> - [TASK-10A-B: SkillAnalysisView](./task-10a-b-analysis-view.md) - 分析結果表示・改善適用UI
> - [TASK-10A-C: SkillCreateWizard](./task-10a-c-create-wizard.md) - 新規スキル作成ウィザード
> - [TASK-10A-D: 統合（Slice/IPC/ChatPanel）](./task-10a-d-integration.md) - 全機能の統合
>
> 以下は参照用の元仕様です。

---

## 概要

スキルの作成・編集・分析・改善・削除の全ライフサイクルを統合管理する
UI とバックエンドを完成させる。これにより「無限スキル量産」のビジョンが実現する。

## 入力

- TASK-9A: スキルエディター
- TASK-9B: skill-creator スキル
- TASK-9C: スキル改善機能

## 出力

- 統合スキル管理パネル
- スキル作成ウィザード
- スキル分析ビュー
- 完全なライフサイクル管理

## スキルライフサイクル

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      スキルライフサイクル                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐             │
│  │  作成   │───▶│ インポート│───▶│  使用   │───▶│  分析   │             │
│  │ Create  │    │  Import │    │   Use   │    │ Analyze │             │
│  └─────────┘    └─────────┘    └─────────┘    └────┬────┘             │
│       ▲                             │                │                  │
│       │                             │                ▼                  │
│       │                             │         ┌─────────┐              │
│       │                             │         │  改善   │              │
│       │                             │         │ Improve │              │
│       │                             │         └────┬────┘              │
│       │                             │              │                   │
│       │                             ▼              ▼                   │
│       │                       ┌─────────┐    ┌─────────┐              │
│       │                       │  編集   │◀───│ 自動修正 │              │
│       │                       │  Edit   │    │ Auto-Fix│              │
│       │                       └────┬────┘    └─────────┘              │
│       │                            │                                   │
│       │                            ▼                                   │
│       │                       ┌─────────┐                             │
│       └───────────────────────│ 複製    │                             │
│         (テンプレート化)       │  Clone  │                             │
│                               └─────────┘                             │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                       削除 (Delete)                              │  │
│  │  - バックアップ作成 → 削除実行 → 復元可能（30日間）            │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 実行手順

### Step 1: SkillManagementPanel 実装

**ツール**: Write

**操作**:

```typescript
// apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx

import React, { useState, useEffect } from "react";
import { useAppStore } from "../../store";
import { SkillEditor } from "./SkillEditor";
import { SkillAnalysisView } from "./SkillAnalysisView";
import { SkillCreateWizard } from "./SkillCreateWizard";
import type { ImportedSkill, SkillMetadata } from "@repo/shared";

type View = "list" | "editor" | "analysis" | "create";

export const SkillManagementPanel: React.FC = () => {
  const {
    availableSkills,
    importedSkills,
    isLoadingSkills,
    fetchSkills,
    importSkill,
    removeSkill,
  } = useAppStore();

  const [currentView, setCurrentView] = useState<View>("list");
  const [selectedSkill, setSelectedSkill] = useState<ImportedSkill | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // フィルタリング
  const filteredImported = importedSkills.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAvailable = availableSkills.filter(
    (s) =>
      !importedSkills.some((i) => i.name === s.name) &&
      (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // ビュー切り替え
  const handleEdit = (skill: ImportedSkill) => {
    setSelectedSkill(skill);
    setCurrentView("editor");
  };

  const handleAnalyze = (skill: ImportedSkill) => {
    setSelectedSkill(skill);
    setCurrentView("analysis");
  };

  const handleCreate = () => {
    setCurrentView("create");
  };

  const handleBack = () => {
    setCurrentView("list");
    setSelectedSkill(null);
  };

  // レンダリング
  if (currentView === "editor" && selectedSkill) {
    return <SkillEditor skill={selectedSkill} onClose={handleBack} />;
  }

  if (currentView === "analysis" && selectedSkill) {
    return <SkillAnalysisView skill={selectedSkill} onClose={handleBack} />;
  }

  if (currentView === "create") {
    return <SkillCreateWizard onClose={handleBack} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h1 className="text-lg font-semibold">スキル管理</h1>
        <button
          type="button"
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + 新規スキル作成
        </button>
      </div>

      {/* 検索 */}
      <div className="px-4 py-2 border-b">
        <input
          type="text"
          placeholder="スキルを検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      {/* スキル一覧 */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingSkills ? (
          <div className="flex items-center justify-center h-full">
            読み込み中...
          </div>
        ) : (
          <>
            {/* インポート済み */}
            {filteredImported.length > 0 && (
              <div className="p-4">
                <h2 className="text-sm font-medium text-gray-500 mb-2">
                  インポート済み ({filteredImported.length})
                </h2>
                <div className="space-y-2">
                  {filteredImported.map((skill) => (
                    <SkillCard
                      key={skill.name}
                      skill={skill}
                      isImported
                      onEdit={() => handleEdit(skill)}
                      onAnalyze={() => handleAnalyze(skill)}
                      onRemove={() => removeSkill(skill.name)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 利用可能 */}
            {filteredAvailable.length > 0 && (
              <div className="p-4 border-t">
                <h2 className="text-sm font-medium text-gray-500 mb-2">
                  利用可能 ({filteredAvailable.length})
                </h2>
                <div className="space-y-2">
                  {filteredAvailable.map((skill) => (
                    <SkillCard
                      key={skill.name}
                      skill={skill}
                      isImported={false}
                      onImport={() => importSkill(skill.name)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 空状態 */}
            {filteredImported.length === 0 && filteredAvailable.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <span className="text-4xl mb-2">📦</span>
                <p>スキルがありません</p>
                <button
                  type="button"
                  onClick={handleCreate}
                  className="mt-4 px-4 py-2 text-blue-600 border border-blue-200 rounded"
                >
                  最初のスキルを作成
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// スキルカード
interface SkillCardProps {
  skill: ImportedSkill | SkillMetadata;
  isImported: boolean;
  onEdit?: () => void;
  onAnalyze?: () => void;
  onRemove?: () => void;
  onImport?: () => void;
}

const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  isImported,
  onEdit,
  onAnalyze,
  onRemove,
  onImport,
}) => (
  <div className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-lg">📦</span>
        <span className="font-medium">{skill.name}</span>
        {isImported && (
          <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">
            インポート済み
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-gray-500 truncate">{skill.description}</p>
      <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
        <span>エージェント: {skill.agents.length}</span>
        <span>参照資料: {skill.references.length}</span>
      </div>
    </div>

    <div className="flex items-center gap-2 ml-4">
      {isImported ? (
        <>
          <button
            type="button"
            onClick={onEdit}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
          >
            編集
          </button>
          <button
            type="button"
            onClick={onAnalyze}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
          >
            分析
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
          >
            削除
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={onImport}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          インポート
        </button>
      )}
    </div>
  </div>
);
```

**期待結果**: スキル管理パネルが作成される

### Step 2: SkillAnalysisView 実装

**ツール**: Write

**操作**:

```typescript
// apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx

import React, { useState, useEffect } from "react";
import type { ImportedSkill } from "@repo/shared";
import type { SkillAnalysis, Suggestion } from "@repo/shared";

interface SkillAnalysisViewProps {
  skill: ImportedSkill;
  onClose: () => void;
}

export const SkillAnalysisView: React.FC<SkillAnalysisViewProps> = ({
  skill,
  onClose,
}) => {
  const [analysis, setAnalysis] = useState<SkillAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(
    new Set()
  );

  // 分析実行
  useEffect(() => {
    const runAnalysis = async () => {
      setIsAnalyzing(true);
      try {
        const result = await window.electronAPI.skill.analyze(skill.name);
        setAnalysis(result);
      } catch (error) {
        console.error("Analysis failed:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };
    runAnalysis();
  }, [skill.name]);

  // 選択した改善を適用
  const handleApplySelected = async () => {
    if (!analysis) return;

    setIsImproving(true);
    try {
      const suggestions = analysis.suggestions.filter((_, i) =>
        selectedSuggestions.has(i)
      );
      await window.electronAPI.skill.applyImprovements(skill.name, suggestions);

      // 再分析
      const result = await window.electronAPI.skill.analyze(skill.name);
      setAnalysis(result);
      setSelectedSuggestions(new Set());
    } catch (error) {
      console.error("Improvement failed:", error);
    } finally {
      setIsImproving(false);
    }
  };

  // 全自動改善
  const handleAutoImprove = async () => {
    if (!analysis) return;

    setIsImproving(true);
    try {
      await window.electronAPI.skill.autoImprove(skill.name);

      // 再分析
      const result = await window.electronAPI.skill.analyze(skill.name);
      setAnalysis(result);
    } catch (error) {
      console.error("Auto-improve failed:", error);
    } finally {
      setIsImproving(false);
    }
  };

  // トグル選択
  const toggleSuggestion = (index: number) => {
    const newSet = new Set(selectedSuggestions);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedSuggestions(newSet);
  };

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            ←
          </button>
          <h1 className="text-lg font-semibold">スキル分析: {skill.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          {selectedSuggestions.size > 0 && (
            <button
              type="button"
              onClick={handleApplySelected}
              disabled={isImproving}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {isImproving ? "適用中..." : `選択した改善を適用 (${selectedSuggestions.size})`}
            </button>
          )}
          <button
            type="button"
            onClick={handleAutoImprove}
            disabled={isImproving || isAnalyzing}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            {isImproving ? "改善中..." : "🤖 全自動改善"}
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-4">
        {isAnalyzing ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <span className="text-4xl animate-spin">🔍</span>
              <p className="mt-2">スキルを分析中...</p>
            </div>
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            {/* スコア表示 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">総合スコア</span>
                <span
                  className={`text-3xl font-bold ${
                    analysis.overallScore >= 80
                      ? "text-green-600"
                      : analysis.overallScore >= 60
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {analysis.overallScore}/100
                </span>
              </div>

              {/* カテゴリ別スコア */}
              <div className="mt-4 space-y-2">
                {analysis.categories.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <span className="w-24 text-sm text-gray-500">{cat.name}</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          cat.score >= 80
                            ? "bg-green-500"
                            : cat.score >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                    <span className="w-8 text-sm text-right">{cat.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 改善提案 */}
            <div>
              <h2 className="text-lg font-medium mb-3">改善提案</h2>
              <div className="space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <SuggestionCard
                    key={index}
                    suggestion={suggestion}
                    isSelected={selectedSuggestions.has(index)}
                    onToggle={() => toggleSuggestion(index)}
                  />
                ))}
              </div>
            </div>

            {/* リスク */}
            {analysis.risks.length > 0 && (
              <div>
                <h2 className="text-lg font-medium mb-3">リスク</h2>
                <div className="space-y-2">
                  {analysis.risks.map((risk, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded border ${
                        risk.level === "high"
                          ? "border-red-200 bg-red-50"
                          : risk.level === "medium"
                            ? "border-yellow-200 bg-yellow-50"
                            : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="font-medium">{risk.description}</div>
                      <div className="mt-1 text-sm text-gray-600">
                        対策: {risk.mitigation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            分析結果がありません
          </div>
        )}
      </div>
    </div>
  );
};

// 提案カード
interface SuggestionCardProps {
  suggestion: Suggestion;
  isSelected: boolean;
  onToggle: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  isSelected,
  onToggle,
}) => {
  const priorityColors = {
    critical: "bg-red-100 text-red-800",
    high: "bg-orange-100 text-orange-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-gray-100 text-gray-800",
  };

  const typeIcons = {
    prompt: "💬",
    structure: "📁",
    security: "🔒",
    performance: "⚡",
    documentation: "📝",
  };

  return (
    <div
      className={`p-3 border rounded cursor-pointer transition-colors ${
        isSelected ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          className="mt-1"
          disabled={!suggestion.autoFixable}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span>{typeIcons[suggestion.type]}</span>
            <span
              className={`px-1.5 py-0.5 text-xs rounded ${priorityColors[suggestion.priority]}`}
            >
              {suggestion.priority}
            </span>
            {suggestion.autoFixable && (
              <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                自動修正可
              </span>
            )}
          </div>
          <p className="mt-1">{suggestion.description}</p>
        </div>
      </div>
    </div>
  );
};
```

**期待結果**: スキル分析ビューが作成される

### Step 3: SkillCreateWizard 実装

**ツール**: Write

**操作**:

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
  const [generatedSkillPath, setGeneratedSkillPath] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // スキル生成
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
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            ←
          </button>
          <h1 className="text-lg font-semibold">新規スキル作成</h1>
        </div>
        <div className="flex items-center gap-4">
          <StepIndicator current={step} />
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-6">
        {step === "describe" && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-medium mb-4">
              どんなスキルを作りたいですか？
            </h2>
            <p className="text-gray-500 mb-4">
              作りたいスキルの機能を自然言語で説明してください。
              AIが自動的にスキル構造を生成します。
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例: チャット履歴をMarkdownファイルにエクスポートするスキル。日付範囲でフィルタリングでき、会話ごとに別ファイルとして出力する機能も持つ。"
              className="w-full h-48 p-4 border rounded resize-none"
            />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep("configure")}
                disabled={!description.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                次へ →
              </button>
            </div>
          </div>
        )}

        {step === "configure" && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-medium mb-4">生成オプション</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.generateTasks}
                  onChange={(e) =>
                    setConfig({ ...config, generateTasks: e.target.checked })
                  }
                />
                <div>
                  <div className="font-medium">タスク仕様書を生成</div>
                  <div className="text-sm text-gray-500">
                    スキルの実装タスクを自動生成します
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.addAgents}
                  onChange={(e) =>
                    setConfig({ ...config, addAgents: e.target.checked })
                  }
                />
                <div>
                  <div className="font-medium">サブエージェントを追加</div>
                  <div className="text-sm text-gray-500">
                    必要に応じてサブエージェントファイルを生成します
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.addReferences}
                  onChange={(e) =>
                    setConfig({ ...config, addReferences: e.target.checked })
                  }
                />
                <div>
                  <div className="font-medium">参照資料を追加</div>
                  <div className="text-sm text-gray-500">
                    関連するリファレンスドキュメントを生成します
                  </div>
                </div>
              </label>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setStep("describe")}
                className="px-4 py-2 border rounded"
              >
                ← 戻る
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("generate");
                  handleGenerate();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                🤖 スキルを生成
              </button>
            </div>
          </div>
        )}

        {step === "generate" && (
          <div className="flex flex-col items-center justify-center h-full">
            {isGenerating ? (
              <>
                <span className="text-6xl animate-bounce">🤖</span>
                <p className="mt-4 text-lg">スキルを生成中...</p>
                <p className="mt-2 text-gray-500">
                  AIがスキル構造を自動生成しています
                </p>
              </>
            ) : error ? (
              <>
                <span className="text-6xl">❌</span>
                <p className="mt-4 text-lg text-red-600">生成に失敗しました</p>
                <p className="mt-2 text-gray-500">{error}</p>
                <button
                  type="button"
                  onClick={() => setStep("configure")}
                  className="mt-4 px-4 py-2 border rounded"
                >
                  戻る
                </button>
              </>
            ) : null}
          </div>
        )}

        {step === "complete" && (
          <div className="flex flex-col items-center justify-center h-full">
            <span className="text-6xl">✅</span>
            <h2 className="mt-4 text-xl font-medium">スキルが作成されました!</h2>
            <p className="mt-2 text-gray-500">
              {generatedSkillPath}
            </p>
            <div className="mt-6 flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={() => {
                  // スキルをインポートして使用開始
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                スキルを使用開始
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ステップインジケーター
const StepIndicator: React.FC<{ current: WizardStep }> = ({ current }) => {
  const steps: WizardStep[] = ["describe", "configure", "generate", "complete"];
  const labels = {
    describe: "説明",
    configure: "設定",
    generate: "生成",
    complete: "完了",
  };

  const currentIndex = steps.indexOf(current);

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          {index > 0 && <span className="text-gray-300">—</span>}
          <span
            className={`px-2 py-1 text-sm rounded ${
              index <= currentIndex
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {labels[step]}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};
```

**期待結果**: スキル作成ウィザードが作成される

## 検証条件

### 必須条件

- [ ] スキル管理パネルが表示される
- [ ] インポート済み/利用可能のスキル一覧が表示される
- [ ] スキル作成ウィザードで新規スキルが作成できる
- [ ] スキル分析ビューでスコアと改善提案が表示される
- [ ] 改善提案を選択して適用できる
- [ ] 全自動改善が実行できる
- [ ] スキル編集が機能する
- [ ] スキル削除が機能する

### 自動検証コマンド

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# テスト
pnpm --filter @repo/desktop test -- --grep "SkillManagement"
```

## メモ

- このタスクで「無限スキル量産」の基盤が完成
- 今後の拡張: スキルストア、スキル共有、バージョン管理
