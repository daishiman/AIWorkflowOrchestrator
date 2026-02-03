---
id: TASK-9A-A
tier: 2
title: SkillFileManager 実装
phase: 9
depends_on: [TASK-7D]
parallel_with: []
blocks: [TASK-9A-B]
status: spec_created
priority: high
estimated_complexity: medium
tags: [backend, main-process, service, file-management]
spec_dir: ./task-9a-a-skill-file-manager/
---

# SkillFileManager 実装

> **タスク仕様書**: [task-9a-a-skill-file-manager/](./task-9a-a-skill-file-manager/) (Phase 1〜13)

## 概要

スキルファイルの読み書き・バックアップ・復元を管理するサービスクラスを実装する。

## ファイル操作対象

| パス                    | 操作             | 説明                          |
| ----------------------- | ---------------- | ----------------------------- |
| `~/.aiworkflow/skills/` | 読み書き可能     | アプリ独自スキル（編集可能）  |
| `~/.claude/skills/`     | **読み取り専用** | Claude CLI スキル（編集不可） |

**注意**: `~/.claude/skills/` 配下のスキルは Claude CLI が管理するため、本アプリからは編集できません。編集操作を試みた場合はエラーを返します。

## 入力

- TASK-7D: ChatPanel統合済みのUI

## 出力

- `apps/desktop/src/main/services/skill/SkillFileManager.ts`

## 実装詳細

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

## ファイル

| 操作 | パス                                                       |
| ---- | ---------------------------------------------------------- |
| 作成 | `apps/desktop/src/main/services/skill/SkillFileManager.ts` |

## 完了条件

- [ ] SkillFileManager クラスが実装されている
- [ ] ファイル読み込みが機能する
- [ ] ファイル書き込み時にバックアップが作成される
- [ ] ファイル削除時にバックアップが作成される
- [ ] バックアップからの復元が機能する

## テスト要件

```typescript
describe("SkillFileManager", () => {
  it("should read file content");
  it("should create backup before writing");
  it("should create backup before deleting");
  it("should list backups");
  it("should restore from backup");
});
```
