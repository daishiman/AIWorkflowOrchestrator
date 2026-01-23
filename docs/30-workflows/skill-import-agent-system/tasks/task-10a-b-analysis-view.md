---
id: TASK-10A-B
tier: 2
title: SkillAnalysisView 実装
phase: 10
depends_on: [TASK-9C]
parallel_with: [TASK-10A-A]
blocks: [TASK-10A-D]
status: pending
priority: high
estimated_complexity: medium
tags: [frontend, renderer, ui, analysis]
---

# SkillAnalysisView 実装

## 概要

スキルの分析結果表示・改善適用UIを実装する。

## 入力

- TASK-9C: スキル改善機能

## 出力

- `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`

## 実装詳細

```typescript
// apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx

import React, { useState, useEffect } from "react";
import type { ImportedSkill, SkillAnalysis, Suggestion } from "@repo/shared";

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
    new Set(),
  );

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

  const handleApplySelected = async () => {
    if (!analysis) return;
    setIsImproving(true);
    try {
      const suggestions = analysis.suggestions.filter((_, i) =>
        selectedSuggestions.has(i),
      );
      await window.electronAPI.skill.applyImprovements(skill.name, suggestions);
      const result = await window.electronAPI.skill.analyze(skill.name);
      setAnalysis(result);
      setSelectedSuggestions(new Set());
    } finally {
      setIsImproving(false);
    }
  };

  const handleAutoImprove = async () => {
    if (!analysis) return;
    setIsImproving(true);
    try {
      await window.electronAPI.skill.autoImprove(skill.name);
      const result = await window.electronAPI.skill.analyze(skill.name);
      setAnalysis(result);
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClose} className="hover:bg-gray-100 rounded p-1">
            ←
          </button>
          <h1 className="text-lg font-semibold">スキル分析: {skill.name}</h1>
        </div>
        <div className="flex gap-2">
          {selectedSuggestions.size > 0 && (
            <button
              type="button"
              onClick={handleApplySelected}
              disabled={isImproving}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              選択した改善を適用 ({selectedSuggestions.size})
            </button>
          )}
          <button
            type="button"
            onClick={handleAutoImprove}
            disabled={isImproving || isAnalyzing}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            全自動改善
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isAnalyzing ? (
          <div className="flex items-center justify-center h-full">
            分析中...
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            {/* スコア表示 */}
            <ScoreDisplay analysis={analysis} />

            {/* 改善提案 */}
            <SuggestionList
              suggestions={analysis.suggestions}
              selected={selectedSuggestions}
              onToggle={(i) => {
                const newSet = new Set(selectedSuggestions);
                if (newSet.has(i)) newSet.delete(i);
                else newSet.add(i);
                setSelectedSuggestions(newSet);
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};
```

## ファイル

| 操作 | パス                                                               |
| ---- | ------------------------------------------------------------------ |
| 作成 | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx` |

## 完了条件

- [ ] 分析結果が表示される
- [ ] スコアが表示される
- [ ] 改善提案が表示される
- [ ] 選択した改善を適用できる
- [ ] 全自動改善が機能する
