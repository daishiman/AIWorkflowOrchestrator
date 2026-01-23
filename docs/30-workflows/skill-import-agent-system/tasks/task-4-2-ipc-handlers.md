---
id: TASK-4-2
tier: 1
title: IPCハンドラー実装
phase: 4
depends_on: [TASK-2A, TASK-2B, TASK-3-1, TASK-3-2, TASK-4-1]
parallel_with: []
blocks: [TASK-5-1]
status: pending
priority: high
estimated_complexity: medium
tags: [backend, main-process, ipc]
---

# IPCハンドラー実装

## 概要

スキル機能の IPC ハンドラーを実装し、Renderer からのリクエストを処理する。

## 入力

- TASK-4-1 で定義した IPC チャネル
- TASK-2A の SkillScanner
- TASK-2B の SkillImportStore
- TASK-3-1 の SkillExecutor
- TASK-3-2 の PermissionResolver

## 出力

- `apps/desktop/src/main/ipc/skillHandlers.ts`
- メインプロセスへの登録

## 実装詳細

### ハンドラー実装

```typescript
// apps/desktop/src/main/ipc/skillHandlers.ts

import { ipcMain, BrowserWindow } from "electron";
import { SKILL_CHANNELS } from "../../preload/channels";
import { SkillScanner } from "../services/skill/SkillScanner";
import { SkillExecutor } from "../services/skill/SkillExecutor";
import { skillImportStore } from "../settings/skillImportStore";
import type {
  SkillMetadata,
  ImportedSkill,
  SkillExecutionRequest,
  PermissionResponse,
} from "@repo/shared";

let skillScanner: SkillScanner | null = null;
let skillExecutor: SkillExecutor | null = null;
let cachedSkills: SkillMetadata[] | null = null;

export function registerSkillHandlers(mainWindow: BrowserWindow): void {
  skillScanner = new SkillScanner();
  skillExecutor = new SkillExecutor(mainWindow);

  // スキル一覧取得（キャッシュあり）
  ipcMain.handle(SKILL_CHANNELS.SKILL_LIST, async () => {
    if (!cachedSkills) {
      cachedSkills = await skillScanner!.scanAll();
    }
    return cachedSkills;
  });

  // スキル再スキャン（キャッシュ無効化）
  ipcMain.handle(SKILL_CHANNELS.SKILL_SCAN, async () => {
    cachedSkills = await skillScanner!.scanAll();
    return cachedSkills;
  });

  // スキルインポート
  ipcMain.handle(
    SKILL_CHANNELS.SKILL_IMPORT,
    async (_event, skillName: string) => {
      skillImportStore.addImport(skillName);

      const skill = cachedSkills?.find((s) => s.name === skillName);
      if (!skill) {
        throw new Error(`スキルが見つかりません: ${skillName}`);
      }

      return {
        ...skill,
        importedAt: new Date(),
        status: "active" as const,
      };
    },
  );

  // インポート済みスキル取得
  ipcMain.handle(SKILL_CHANNELS.SKILL_GET_IMPORTED, async () => {
    const imported = skillImportStore.getImported();
    const skills: ImportedSkill[] = [];

    for (const data of imported) {
      const skill = cachedSkills?.find((s) => s.name === data.name);
      if (skill) {
        skills.push({
          ...skill,
          importedAt: new Date(data.importedAt),
          status: data.status,
        });
      }
    }

    return skills;
  });

  // スキル削除
  ipcMain.handle(
    SKILL_CHANNELS.SKILL_REMOVE,
    async (_event, skillName: string) => {
      skillImportStore.removeImport(skillName);
    },
  );

  // スキル実行
  ipcMain.handle(
    SKILL_CHANNELS.SKILL_EXECUTE,
    async (_event, request: SkillExecutionRequest) => {
      const skill = cachedSkills?.find((s) => s.name === request.skillName);
      if (!skill) {
        throw new Error(`スキルが見つかりません: ${request.skillName}`);
      }

      // SKILL.mdの内容を読み込み
      const fs = await import("fs/promises");
      const path = await import("path");
      const skillMdPath = path.join(skill.path, "SKILL.md");
      const content = await fs.readFile(skillMdPath, "utf-8");

      const enrichedSkill = { ...skill, content };

      return skillExecutor!.execute(request, enrichedSkill);
    },
  );

  // 実行中止
  ipcMain.handle(
    SKILL_CHANNELS.SKILL_ABORT,
    async (_event, executionId: string) => {
      skillExecutor!.abort(executionId);
    },
  );

  // 権限応答受信
  ipcMain.on(
    SKILL_CHANNELS.SKILL_PERMISSION_RESPONSE,
    (_event, response: PermissionResponse) => {
      skillExecutor!.handlePermissionResponse(response);
    },
  );
}

export function unregisterSkillHandlers(): void {
  ipcMain.removeHandler(SKILL_CHANNELS.SKILL_LIST);
  ipcMain.removeHandler(SKILL_CHANNELS.SKILL_SCAN);
  ipcMain.removeHandler(SKILL_CHANNELS.SKILL_IMPORT);
  ipcMain.removeHandler(SKILL_CHANNELS.SKILL_REMOVE);
  ipcMain.removeHandler(SKILL_CHANNELS.SKILL_GET_IMPORTED);
  ipcMain.removeHandler(SKILL_CHANNELS.SKILL_EXECUTE);
  ipcMain.removeHandler(SKILL_CHANNELS.SKILL_ABORT);
  ipcMain.removeAllListeners(SKILL_CHANNELS.SKILL_PERMISSION_RESPONSE);
}
```

### メインプロセスへの登録

```typescript
// apps/desktop/src/main/index.ts に追加

import { registerSkillHandlers } from "./ipc/skillHandlers";

// createWindow 内で呼び出し
registerSkillHandlers(mainWindow);
```

## ファイル

| 操作 | パス                                                        |
| ---- | ----------------------------------------------------------- |
| 作成 | `apps/desktop/src/main/ipc/skillHandlers.ts`                |
| 修正 | `apps/desktop/src/main/index.ts`                            |
| 作成 | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` |

## 依存パッケージ

なし（既存パッケージのみ使用）

## 完了条件

- [ ] `registerSkillHandlers()` が実装されている
- [ ] 全ての IPC ハンドラーが登録されている
- [ ] `skill:list` がスキル一覧を返す
- [ ] `skill:scan` が再スキャンして結果を返す
- [ ] `skill:import` がスキルをインポートする
- [ ] `skill:remove` がスキルを削除する
- [ ] `skill:getImported` がインポート済みスキルを返す
- [ ] `skill:execute` がスキル実行を開始する
- [ ] `skill:abort` が実行を中止する
- [ ] `skill:permission:response` が権限応答を処理する
- [ ] メインプロセスにハンドラーが登録されている
- [ ] エラーハンドリングが実装されている
- [ ] 単体テストが全て通過する

## テスト要件

### 単体テスト

```typescript
describe("skillHandlers", () => {
  describe("skill:list", () => {
    it("should return all skills");
    it("should use cache on subsequent calls");
  });

  describe("skill:scan", () => {
    it("should invalidate cache and rescan");
  });

  describe("skill:import", () => {
    it("should import skill and return ImportedSkill");
    it("should throw error for unknown skill");
  });

  describe("skill:remove", () => {
    it("should remove imported skill");
  });

  describe("skill:execute", () => {
    it("should start skill execution");
    it("should throw error for unknown skill");
  });

  describe("skill:abort", () => {
    it("should abort execution");
  });
});
```

## 参考資料

- [specification.md - 5.8 skillHandlers実装仕様](../specification.md)
- 既存パターン: `apps/desktop/src/main/ipc/agentHandlers.ts`
