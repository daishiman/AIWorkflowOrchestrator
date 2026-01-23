---
id: TASK-9A-B
tier: 2
title: ファイル編集IPCハンドラー追加
phase: 9
depends_on: [TASK-9A-A]
parallel_with: []
blocks: [TASK-9A-C]
status: pending
priority: high
estimated_complexity: small
tags: [backend, main-process, ipc]
---

# ファイル編集IPCハンドラー追加

## 概要

SkillFileManagerを使用するIPCハンドラーを追加する。

## 入力

- TASK-9A-A: SkillFileManager

## 出力

- `apps/desktop/src/main/ipc/skillHandlers.ts` への追加

## 実装詳細

```typescript
// apps/desktop/src/main/ipc/skillHandlers.ts に追加

import { SkillFileManager } from "../services/skill/SkillFileManager";

// 初期化時に追加
const fileManager = new SkillFileManager(skillsDir);

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

### Preload API 追加

```typescript
// apps/desktop/src/preload/skillApi.ts に追加

readFile: (skillName: string, relativePath: string) =>
  ipcRenderer.invoke("skill:readFile", skillName, relativePath),

writeFile: (skillName: string, relativePath: string, content: string) =>
  ipcRenderer.invoke("skill:writeFile", skillName, relativePath, content),

createFile: (skillName: string, relativePath: string, content: string) =>
  ipcRenderer.invoke("skill:createFile", skillName, relativePath, content),

deleteFile: (skillName: string, relativePath: string) =>
  ipcRenderer.invoke("skill:deleteFile", skillName, relativePath),

listBackups: (skillName: string) =>
  ipcRenderer.invoke("skill:listBackups", skillName),

restoreBackup: (skillName: string, backupPath: string) =>
  ipcRenderer.invoke("skill:restoreBackup", skillName, backupPath),
```

## ファイル

| 操作 | パス                                         |
| ---- | -------------------------------------------- |
| 修正 | `apps/desktop/src/main/ipc/skillHandlers.ts` |
| 修正 | `apps/desktop/src/preload/skillApi.ts`       |

## 完了条件

- [ ] ファイル読み込みIPCが機能する
- [ ] ファイル書き込みIPCが機能する
- [ ] ファイル作成IPCが機能する
- [ ] ファイル削除IPCが機能する
- [ ] バックアップ一覧IPCが機能する
- [ ] バックアップ復元IPCが機能する
- [ ] Preload APIが追加されている
