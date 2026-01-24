---
id: TASK-9A
tier: 2
title: スキルエディター機能
phase: 9
depends_on: [TASK-7D, TASK-8C]
parallel_with: [TASK-9B, TASK-9C]
blocks: [TASK-10A]
status: split
priority: high
estimated_complexity: large
tags: [frontend, renderer, ui, skill-management, editor]

execution:
  mode: sequential
  timeout_minutes: 60
  retry_count: 2
  allow_partial: false

verification:
  auto_verify: true
  require_tests: true
  require_typecheck: true

artifacts:
  creates:
    - apps/desktop/src/renderer/components/skill/SkillEditor.tsx
    - apps/desktop/src/renderer/components/skill/SkillEditorDialog.tsx
    - apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx
    - apps/desktop/src/main/services/skill/SkillFileManager.ts
  modifies:
    - apps/desktop/src/renderer/store/slices/skillSlice.ts
    - apps/desktop/src/main/ipc/skillHandlers.ts
---

# スキルエディター機能

> **⚠️ このタスクは分割されました**
>
> 実行粒度を細かくするため、以下のサブタスクに分割されています：
>
> - [TASK-9A-A: SkillFileManager](./task-9a-a-file-manager.md) - バックアップ・リストア機能付きファイル管理
> - [TASK-9A-B: ファイル編集IPC](./task-9a-b-ipc-file-handlers.md) - ファイル編集用IPCハンドラー
> - [TASK-9A-C: SkillEditor UI](./task-9a-c-skill-editor-ui.md) - エディターUIコンポーネント
>
> 以下は参照用の元仕様です。

---

## 概要

インポート済みスキルの SKILL.md およびサブリソース（agents/, references/ 等）を
GUI で編集できるエディター機能を実装する。

## ファイル操作対象

| パス                    | 操作             | 説明                          |
| ----------------------- | ---------------- | ----------------------------- |
| `~/.aiworkflow/skills/` | 読み書き可能     | アプリ独自スキル（編集可能）  |
| `~/.claude/skills/`     | **読み取り専用** | Claude CLI スキル（編集不可） |

**注意**: `~/.claude/skills/` 配下のスキルは Claude CLI が管理するため、本アプリからは編集できません。UI上では読み取り専用として表示し、編集ボタンを無効化します。

## 入力

- TASK-7D: ChatPanel統合済みのUI
- TASK-8C: 統合テスト完了

## 出力

- スキルエディターコンポーネント
- ファイル編集API
- 編集履歴管理

## 実行手順

### Step 1: SkillFileManager 実装

**ツール**: Write

**操作**:

```typescript
// apps/desktop/src/main/services/skill/SkillFileManager.ts

import fs from "fs/promises";
import path from "path";

export class SkillFileManager {
  constructor(private skillsDir: string) {}

  // ファイル読み込み
  async readFile(skillName: string, relativePath: string): Promise<string> {
    const fullPath = path.join(this.skillsDir, skillName, relativePath);
    return fs.readFile(fullPath, "utf-8");
  }

  // ファイル書き込み（バックアップ付き）
  async writeFile(
    skillName: string,
    relativePath: string,
    content: string,
  ): Promise<void> {
    const fullPath = path.join(this.skillsDir, skillName, relativePath);

    // バックアップ作成
    try {
      const existing = await fs.readFile(fullPath, "utf-8");
      const backupPath = `${fullPath}.backup.${Date.now()}`;
      await fs.writeFile(backupPath, existing);
    } catch {
      // 新規ファイルの場合はバックアップ不要
    }

    // 書き込み
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, "utf-8");
  }

  // ファイル作成
  async createFile(
    skillName: string,
    relativePath: string,
    content: string,
  ): Promise<void> {
    const fullPath = path.join(this.skillsDir, skillName, relativePath);

    // 既存チェック
    try {
      await fs.access(fullPath);
      throw new Error(`File already exists: ${relativePath}`);
    } catch (e: unknown) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    }

    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, "utf-8");
  }

  // ファイル削除
  async deleteFile(skillName: string, relativePath: string): Promise<void> {
    const fullPath = path.join(this.skillsDir, skillName, relativePath);

    // バックアップ作成
    const content = await fs.readFile(fullPath, "utf-8");
    const backupPath = `${fullPath}.deleted.${Date.now()}`;
    await fs.writeFile(backupPath, content);

    await fs.unlink(fullPath);
  }

  // バックアップ一覧取得
  async listBackups(skillName: string): Promise<string[]> {
    const skillDir = path.join(this.skillsDir, skillName);
    const files = await this.walkDir(skillDir);
    return files.filter(
      (f) => f.includes(".backup.") || f.includes(".deleted."),
    );
  }

  // バックアップから復元
  async restoreBackup(skillName: string, backupPath: string): Promise<void> {
    const fullBackupPath = path.join(this.skillsDir, skillName, backupPath);
    const originalPath = backupPath
      .replace(/\.backup\.\d+$/, "")
      .replace(/\.deleted\.\d+$/, "");
    const fullOriginalPath = path.join(this.skillsDir, skillName, originalPath);

    const content = await fs.readFile(fullBackupPath, "utf-8");
    await fs.writeFile(fullOriginalPath, content);
  }

  private async walkDir(dir: string): Promise<string[]> {
    const results: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...(await this.walkDir(fullPath)));
      } else {
        results.push(fullPath);
      }
    }

    return results;
  }
}
```

**期待結果**: ファイル管理サービスが作成される

### Step 2: IPC ハンドラー追加

**ツール**: Edit

**操作**:

```typescript
// apps/desktop/src/main/ipc/skillHandlers.ts に追加

// ファイル読み込み
ipcMain.handle(
  "skill:readFile",
  async (_, skillName: string, relativePath: string) => {
    return fileManager.readFile(skillName, relativePath);
  },
);

// ファイル書き込み
ipcMain.handle(
  "skill:writeFile",
  async (_, skillName: string, relativePath: string, content: string) => {
    await fileManager.writeFile(skillName, relativePath, content);
    // スキル再スキャンしてメタデータ更新
    const updated = await scanner.parseSkill(path.join(skillsDir, skillName));
    if (updated) {
      store.update(skillName, updated);
    }
  },
);

// ファイル作成
ipcMain.handle(
  "skill:createFile",
  async (_, skillName: string, relativePath: string, content: string) => {
    await fileManager.createFile(skillName, relativePath, content);
  },
);

// ファイル削除
ipcMain.handle(
  "skill:deleteFile",
  async (_, skillName: string, relativePath: string) => {
    await fileManager.deleteFile(skillName, relativePath);
  },
);

// バックアップ一覧
ipcMain.handle("skill:listBackups", async (_, skillName: string) => {
  return fileManager.listBackups(skillName);
});

// バックアップ復元
ipcMain.handle(
  "skill:restoreBackup",
  async (_, skillName: string, backupPath: string) => {
    await fileManager.restoreBackup(skillName, backupPath);
  },
);
```

**期待結果**: ファイル編集用IPCハンドラーが追加される

### Step 3: SkillEditor コンポーネント実装

**ツール**: Write

**操作**:

```typescript
// apps/desktop/src/renderer/components/skill/SkillEditor.tsx

import React, { useState, useEffect } from "react";
import type { ImportedSkill, SkillSubResource } from "@repo/shared";
import { useAppStore } from "../../store";
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
          selectedFile
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
      await window.electronAPI.skill.writeFile(skill.name, selectedFile, content);
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save file:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // ファイルツリー構築
  const fileTree = buildFileTree(skill);

  return (
    <div className="flex h-full">
      {/* サイドバー: ファイルツリー */}
      <div className="w-64 border-r bg-gray-50 overflow-y-auto">
        <div className="p-2 font-medium text-sm text-gray-600 border-b">
          📦 {skill.name}
        </div>
        <FileTree
          tree={fileTree}
          selectedFile={selectedFile}
          onSelect={setSelectedFile}
        />
      </div>

      {/* メインエリア: エディター */}
      <div className="flex-1 flex flex-col">
        {/* ツールバー */}
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{selectedFile}</span>
            {hasChanges && (
              <span className="px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                未保存
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {isSaving ? "保存中..." : "保存"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
            >
              閉じる
            </button>
          </div>
        </div>

        {/* コードエディター */}
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

// ファイルツリーコンポーネント
interface FileTreeProps {
  tree: FileNode[];
  selectedFile: string;
  onSelect: (path: string) => void;
}

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
}

const FileTree: React.FC<FileTreeProps> = ({ tree, selectedFile, onSelect }) => (
  <ul className="text-sm">
    {tree.map((node) => (
      <FileTreeNode
        key={node.path}
        node={node}
        selectedFile={selectedFile}
        onSelect={onSelect}
        depth={0}
      />
    ))}
  </ul>
);

const FileTreeNode: React.FC<{
  node: FileNode;
  selectedFile: string;
  onSelect: (path: string) => void;
  depth: number;
}> = ({ node, selectedFile, onSelect, depth }) => {
  const [expanded, setExpanded] = useState(true);
  const isSelected = node.path === selectedFile;
  const paddingLeft = depth * 12 + 8;

  if (node.type === "directory") {
    return (
      <li>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left py-1 hover:bg-gray-200"
          style={{ paddingLeft }}
        >
          <span>{expanded ? "📂" : "📁"}</span>
          <span className="ml-1">{node.name}</span>
        </button>
        {expanded && node.children && (
          <ul>
            {node.children.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                selectedFile={selectedFile}
                onSelect={onSelect}
                depth={depth + 1}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(node.path)}
        className={`w-full text-left py-1 hover:bg-gray-200 ${
          isSelected ? "bg-blue-100" : ""
        }`}
        style={{ paddingLeft }}
      >
        <span>📄</span>
        <span className="ml-1">{node.name}</span>
      </button>
    </li>
  );
};

// ヘルパー関数
function buildFileTree(skill: ImportedSkill): FileNode[] {
  const tree: FileNode[] = [
    { name: "SKILL.md", path: "SKILL.md", type: "file" },
  ];

  const addResources = (resources: SkillSubResource[], dirName: string) => {
    if (resources.length > 0) {
      tree.push({
        name: dirName,
        path: dirName,
        type: "directory",
        children: resources.map((r) => ({
          name: r.filename,
          path: r.relativePath,
          type: "file" as const,
        })),
      });
    }
  };

  addResources(skill.agents, "agents");
  addResources(skill.references, "references");
  addResources(skill.scripts, "scripts");
  addResources(skill.assets, "assets");
  addResources(skill.schemas, "schemas");
  addResources(skill.indexes, "indexes");

  return tree;
}

function getLanguage(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    md: "markdown",
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    sh: "shell",
    bash: "shell",
  };
  return langMap[ext || ""] || "plaintext";
}
```

**期待結果**: スキルエディターコンポーネントが作成される

### Step 4: SkillCodeEditor 実装

**ツール**: Write

**操作**:

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
  // シンプルなtextareaベースのエディター
  // 将来的にはMonaco Editorに置き換え可能
  return (
    <div className="h-full relative">
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

**期待結果**: コードエディターコンポーネントが作成される

## 検証条件

### 必須条件

- [ ] SKILL.md の読み込みができる
- [ ] SKILL.md の編集・保存ができる
- [ ] agents/ 配下のファイルが編集できる
- [ ] references/ 配下のファイルが編集できる
- [ ] 保存時にバックアップが作成される
- [ ] バックアップからの復元ができる
- [ ] 未保存の変更がある場合に警告が表示される

### 自動検証コマンド

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# リント
pnpm --filter @repo/desktop lint

# テスト
pnpm --filter @repo/desktop test -- --grep "SkillEditor"
```

## エラーハンドリング

### よくあるエラーと対処

| エラー   | 原因                 | 対処法                     |
| -------- | -------------------- | -------------------------- |
| ENOENT   | ファイルが存在しない | 新規作成ダイアログを表示   |
| EACCES   | 権限不足             | 権限エラーメッセージを表示 |
| 保存失敗 | ディスク容量不足等   | エラートーストを表示       |

### ロールバック手順

```bash
# バックアップファイルから復元
# .backup.{timestamp} ファイルを元ファイルにリネーム
```

## メモ

- Monaco Editor への移行は Phase 10 以降で検討
- リアルタイムプレビューは将来機能として検討
- 複数ユーザーでの同時編集は対象外
