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
tags: [backend, main, skill-management, editor, file-manager]

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
    - apps/desktop/src/main/services/skill/SkillFileManager.ts
  # UI成果物は ./task-031a-ui-05a-skill-editor-view.md で定義
  modifies:
    - apps/desktop/src/renderer/store/slices/skillSlice.ts
    - apps/desktop/src/main/ipc/skillHandlers.ts
---

# スキルエディター機能

> **⚠️ このタスクは分割されました**
>
> 実行粒度を細かくするため、以下のサブタスクに分割されています：
>
> - [TASK-9A-A: SkillFileManager](../completed-task/task-9a-a-file-manager.md) - バックアップ・リストア機能付きファイル管理
> - [TASK-9A-B: ファイル編集IPC](../completed-task/task-9a-b-ipc-file-handlers.md) - ファイル編集用IPCハンドラー
> - [TASK-9A-C: SkillEditor UI](../completed-task/task-9a-c-skill-editor-ui.md) - エディターUIコンポーネント
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

> **📐 UI仕様は本ディレクトリの UI タスク（task-030/031/032）に移管済み**
>
> Apple HIG 準拠の UI 仕様: [05A-skill-editor-view.md](./task-031a-ui-05a-skill-editor-view.md)
>
> 本ファイルはバックエンドサービス・IPC 契約・型定義のみを定義します。

### Step 4: SkillCodeEditor 実装

> **📐 UI仕様は本ディレクトリの UI タスク（task-030/031/032）に移管済み**
>
> Apple HIG 準拠の UI 仕様: [05A-skill-editor-view.md](./task-031a-ui-05a-skill-editor-view.md)
>
> 本ファイルはバックエンドサービス・IPC 契約・型定義のみを定義します。

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
