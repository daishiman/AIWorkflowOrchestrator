---
id: TASK-10A-A
tier: 2
title: SkillManagementPanel 実装
phase: 10
depends_on: [TASK-9A, TASK-9B, TASK-9C]
parallel_with: [TASK-10A-B]
blocks: [TASK-10A-D]
status: pending
priority: critical
estimated_complexity: medium
tags: [frontend, renderer, ui, skill-management]
---

# SkillManagementPanel 実装

## 概要

スキル一覧表示・管理を行うメインパネルを実装する。

## 入力

- TASK-9A: スキルエディター
- TASK-9B: skill-creator
- TASK-9C: スキル改善機能

## 出力

- `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`

## 実装詳細

```typescript
// apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx

import React, { useState, useEffect } from "react";
import { useAppStore } from "../../store";
import { SkillEditor } from "./SkillEditor";
import { SkillAnalysisView } from "./SkillAnalysisView";
import { SkillCreateWizard } from "./SkillCreateWizard";
import type { ImportedSkill } from "@repo/shared";

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

  const filteredImported = importedSkills.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleEdit = (skill: ImportedSkill) => {
    setSelectedSkill(skill);
    setCurrentView("editor");
  };

  const handleAnalyze = (skill: ImportedSkill) => {
    setSelectedSkill(skill);
    setCurrentView("analysis");
  };

  if (currentView === "editor" && selectedSkill) {
    return (
      <SkillEditor
        skill={selectedSkill}
        onClose={() => setCurrentView("list")}
      />
    );
  }

  if (currentView === "analysis" && selectedSkill) {
    return (
      <SkillAnalysisView
        skill={selectedSkill}
        onClose={() => setCurrentView("list")}
      />
    );
  }

  if (currentView === "create") {
    return <SkillCreateWizard onClose={() => setCurrentView("list")} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h1 className="text-lg font-semibold">スキル管理</h1>
        <button
          type="button"
          onClick={() => setCurrentView("create")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
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
      <div className="flex-1 overflow-y-auto p-4">
        {isLoadingSkills ? (
          <div className="flex items-center justify-center h-full">
            読み込み中...
          </div>
        ) : (
          <div className="space-y-2">
            {filteredImported.map((skill) => (
              <SkillCard
                key={skill.name}
                skill={skill}
                onEdit={() => handleEdit(skill)}
                onAnalyze={() => handleAnalyze(skill)}
                onRemove={() => removeSkill(skill.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
```

## ファイル

| 操作 | パス                                                                  |
| ---- | --------------------------------------------------------------------- |
| 作成 | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` |

## 完了条件

- [ ] スキル一覧が表示される
- [ ] 検索機能が動作する
- [ ] 編集/分析/削除ボタンが機能する
- [ ] 新規作成画面への遷移が機能する
