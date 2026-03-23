# チャネル登録先設計

> タスクID: TASK-SC-01-IPC-WIRING-FIX
> 作成日: 2026-03-23
> Phase: 2 - 設計

## 登録先テーブル

### skillCreatorHandlers.ts（13チャネル）

| #   | チャネル名                    | 登録API        | 依存サービス           |
| --- | ----------------------------- | -------------- | ---------------------- |
| 1   | skill-creator:detect-mode     | ipcMain.handle | SkillCreatorService    |
| 2   | skill-creator:create          | ipcMain.handle | SkillCreatorService    |
| 3   | skill-creator:execute-tasks   | ipcMain.handle | SkillCreatorService    |
| 4   | skill-creator:validate        | ipcMain.handle | SkillCreatorService    |
| 5   | skill-creator:validate-schema | ipcMain.handle | SkillCreatorService    |
| 6   | skill-creator:improve         | ipcMain.handle | SkillCreatorService    |
| 7   | skill-creator:fork            | ipcMain.handle | SkillCreatorService    |
| 8   | skill-creator:share           | ipcMain.handle | SkillCreatorService    |
| 9   | skill-creator:schedule        | ipcMain.handle | SkillCreatorService    |
| 10  | skill-creator:debug           | ipcMain.handle | SkillCreatorService    |
| 11  | skill-creator:generate-docs   | ipcMain.handle | SkillCreatorService    |
| 12  | skill-creator:stats           | ipcMain.handle | SkillCreatorService    |
| 13  | skill-creator:progress        | ipcMain.on     | BrowserWindow (sender) |

### creatorHandlers.ts（3チャネル）

| #   | チャネル名                  | 登録API        | 依存サービス              |
| --- | --------------------------- | -------------- | ------------------------- |
| 14  | skill-creator:plan          | ipcMain.handle | RuntimeSkillCreatorFacade |
| 15  | skill-creator:execute-plan  | ipcMain.handle | RuntimeSkillCreatorFacade |
| 16  | skill-creator:improve-skill | ipcMain.handle | RuntimeSkillCreatorFacade |

## Preload allowlist

### invoke allowlist（15チャネル）

チャネル #1-#15 の全てが `INVOKE_ALLOWED_CHANNELS` に含まれる。

### on allowlist（1チャネル）

チャネル #16（`skill-creator:progress`）が `ON_ALLOWED_CHANNELS` に含まれる。

## channels.ts 定数マッピング

全16チャネルが `IPC_CHANNELS` オブジェクトの SKILL_CREATOR セクションに定数として定義される。ハードコード文字列の使用は禁止（P27準拠）。
