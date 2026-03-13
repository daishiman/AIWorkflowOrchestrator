---
id: TASK-9A-C
tier: 2
title: SkillEditor コンポーネント実装
phase: 9
depends_on: [TASK-9A-B]
parallel_with: []
blocks: [TASK-10A]
status: spec_created
priority: high
estimated_complexity: medium
tags: [frontend, renderer, ui, editor]
spec_dir: ../../TASK-9A-C-skill-editor-ui/
---

# SkillEditor コンポーネント実装

> **タスク仕様書**: [TASK-9A-C-skill-editor-ui/](../../TASK-9A-C-skill-editor-ui/) (Phase 1〜13)

## 概要

スキルファイルを編集するUIコンポーネントを実装する。
ファイルツリー、エディター、保存機能を含む。

## 入力

- TASK-9A-B: ファイル編集IPC

## 出力

- `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`
- `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx`

## 実装詳細

### SkillEditor

```typescript
// apps/desktop/src/renderer/components/skill/SkillEditor.tsx

import React, { useState, useEffect } from "react";
import type { ImportedSkill, SkillSubResource } from "@repo/shared";
import { SkillCodeEditor } from "./SkillCodeEditor";

interface SkillEditorProps {
  skill: ImportedSkill;
  onClose: () => void;
}

export const SkillEditor: React.FC<SkillEditorProps> = ({ skill, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<string>("SKILL.md");
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // ファイル読み込み
  useEffect(() => {
    const loadFile = async () => {
      setIsLoading(true);
      try {
        const fileContent = await window.electronAPI.skill.readFile(
          skill.name,
          selectedFile,
        );
        setContent(fileContent);
        setHasChanges(false);
      } catch (error) {
        console.error("Failed to load file:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadFile();
  }, [skill.name, selectedFile]);

  // 保存
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await window.electronAPI.skill.writeFile(
        skill.name,
        selectedFile,
        content,
      );
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save file:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const fileTree = buildFileTree(skill);

  return (
    <div className="flex h-full">
      {/* サイドバー: ファイルツリー */}
      <div className="w-64 border-r bg-gray-50 overflow-y-auto">
        <div className="p-2 font-medium text-sm border-b">
          {skill.name}
        </div>
        <FileTree
          tree={fileTree}
          selectedFile={selectedFile}
          onSelect={setSelectedFile}
        />
      </div>

      {/* メインエリア */}
      <div className="flex-1 flex flex-col">
        {/* ツールバー */}
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{selectedFile}</span>
            {hasChanges && (
              <span className="px-1.5 py-0.5 text-xs bg-yellow-100 rounded">
                未保存
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {isSaving ? "保存中..." : "保存"}
            </button>
            <button type="button" onClick={onClose} className="px-3 py-1 border rounded">
              閉じる
            </button>
          </div>
        </div>

        {/* エディター */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              読み込み中...
            </div>
          ) : (
            <SkillCodeEditor
              value={content}
              onChange={(value) => {
                setContent(value);
                setHasChanges(true);
              }}
              language={getLanguage(selectedFile)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
```

### SkillCodeEditor

```typescript
// apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx

import React from "react";

interface SkillCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

export const SkillCodeEditor: React.FC<SkillCodeEditorProps> = ({
  value,
  onChange,
  language,
}) => {
  return (
    <div className="h-full">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none"
        spellCheck={false}
        data-language={language}
      />
    </div>
  );
};
```

## ファイル

| 操作 | パス                                                             |
| ---- | ---------------------------------------------------------------- |
| 作成 | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`     |
| 作成 | `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx` |

## 完了条件

- [ ] ファイルツリーが表示される
- [ ] ファイル選択でコンテンツが読み込まれる
- [ ] 編集すると「未保存」が表示される
- [ ] 保存ボタンでファイルが保存される
- [ ] 閉じるボタンで閉じられる

## テスト要件

```typescript
describe("SkillEditor", () => {
  it("should display file tree");
  it("should load file content on select");
  it("should show unsaved indicator");
  it("should save changes");
});
```
