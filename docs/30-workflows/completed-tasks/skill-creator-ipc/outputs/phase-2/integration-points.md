# Phase 2 統合ポイント定義書: SkillCreatorService IPCハンドラー登録

## メタ情報

| 項目     | 値                          |
| -------- | --------------------------- |
| タスクID | TASK-9B-H-SKILL-CREATOR-IPC |
| Phase    | 2                           |
| 作成日   | 2026-02-12                  |
| 機能名   | skill-creator-ipc           |

---

## 1. 統合ポイント概要

本タスクで変更・新規作成するファイルと統合方法を定義する。

### 変更ファイル一覧

| #   | ファイル                                            | 変更種別 | 統合先                        |
| --- | --------------------------------------------------- | -------- | ----------------------------- |
| 1   | `apps/desktop/src/preload/channels.ts`              | 変更     | IPC_CHANNELS, ホワイトリスト  |
| 2   | `packages/shared/src/ipc/channels.ts`               | 変更     | IPC_CHANNELS（shared側同期）  |
| 3   | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` | 新規     | ハンドラー登録                |
| 4   | `apps/desktop/src/main/ipc/index.ts`                | 変更     | registerAllIpcHandlers        |
| 5   | `apps/desktop/src/preload/skill-creator-api.ts`     | 新規     | Preload APIオブジェクト       |
| 6   | `apps/desktop/src/preload/types.ts`                 | 変更     | SkillCreatorAPI型、Window宣言 |
| 7   | `apps/desktop/src/preload/index.ts`                 | 変更     | contextBridge統合             |
| 8   | `packages/shared/src/types/skillCreator.ts`         | 変更     | 共有型定義追加                |
| 9   | `packages/shared/src/types/index.ts`                | 変更     | エクスポート追加              |

---

## 2. 統合ポイント詳細

### 2.1 channels.ts: IPC_CHANNELS定数 + ホワイトリスト

#### 対象ファイル: `apps/desktop/src/preload/channels.ts`

**変更内容 1: SKILL_CREATOR_CHANNELS オブジェクト追加**

挿入位置: `SKILL_CHANNELS` の後、`IPC_CHANNELS` の前

```typescript
/**
 * スキル作成関連のIPCチャネル (TASK-9B-H)
 */
export const SKILL_CREATOR_CHANNELS = {
  SKILL_CREATOR_DETECT_MODE: "skill-creator:detect-mode",
  SKILL_CREATOR_CREATE: "skill-creator:create",
  SKILL_CREATOR_EXECUTE_TASKS: "skill-creator:execute-tasks",
  SKILL_CREATOR_VALIDATE: "skill-creator:validate",
  SKILL_CREATOR_VALIDATE_SCHEMA: "skill-creator:validate-schema",
  SKILL_CREATOR_PROGRESS: "skill-creator:progress",
} as const;
```

**変更内容 2: IPC_CHANNELS への統合**

```typescript
export const IPC_CHANNELS = {
  ...CHAT_EXPORT_CHANNELS,
  ...FILE_SYSTEM_CHANNELS,
  ...SKILL_CHANNELS,
  ...SKILL_CREATOR_CHANNELS, // TASK-9B-H: 追加
} as const;
```

**変更内容 3: ALLOWED_INVOKE_CHANNELS への5チャンネル追加**

```typescript
// Skill Creator channels (TASK-9B-H)
IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE,
IPC_CHANNELS.SKILL_CREATOR_CREATE,
IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS,
IPC_CHANNELS.SKILL_CREATOR_VALIDATE,
IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA,
```

**変更内容 4: ALLOWED_ON_CHANNELS への1チャンネル追加**

```typescript
// Skill Creator channels (TASK-9B-H)
IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
```

#### 対象ファイル: `packages/shared/src/ipc/channels.ts`

preload/channels.ts と同一の SKILL_CREATOR_CHANNELS を追加し、IPC_CHANNELS にスプレッドする。2ファイルの同期が必須。

---

### 2.2 skillCreatorHandlers.ts: 新規ハンドラーファイル

#### 対象ファイル: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`（新規作成）

**責務**: SkillCreatorServiceの5メソッドに対応する5つのIPCハンドラーを登録する。

**インポート依存関係**:

| インポート元                               | インポート対象                                   |
| ------------------------------------------ | ------------------------------------------------ |
| `electron`                                 | `ipcMain`, `IpcMainInvokeEvent`, `BrowserWindow` |
| `electron-log`                             | `log`                                            |
| `../../preload/channels`                   | `IPC_CHANNELS`                                   |
| `../services/skill/SkillCreatorService`    | `SkillCreatorService`                            |
| `../infrastructure/security/ipc-validator` | `validateIpcSender`, `toIPCValidationError`      |
| `zod`                                      | `z`                                              |

**公開関数**:

| 関数名                           | シグネチャ                                                        |
| -------------------------------- | ----------------------------------------------------------------- |
| `registerSkillCreatorHandlers`   | `(mainWindow: BrowserWindow, service: SkillCreatorService): void` |
| `unregisterSkillCreatorHandlers` | `(): void`                                                        |

**内部構成**:

```
skillCreatorHandlers.ts
├── Zodバリデーションスキーマ定義（5個）
│   ├── detectModeSchema
│   ├── createSkillSchema
│   ├── executeTasksSchema
│   ├── validateSkillSchema
│   └── validateWithSchemaSchema
├── sanitizeError関数
├── validatePath関数（パストラバーサル対策）
├── registerSkillCreatorHandlers関数
│   ├── skill-creator:detect-mode ハンドラー
│   ├── skill-creator:create ハンドラー
│   ├── skill-creator:execute-tasks ハンドラー
│   ├── skill-creator:validate ハンドラー
│   └── skill-creator:validate-schema ハンドラー
└── unregisterSkillCreatorHandlers関数
```

**既存パターンとの一貫性**: `skillHandlers.ts` のPattern 3（mainWindow + service）と同一構造。

---

### 2.3 ipc/index.ts: registerAllIpcHandlers統合

#### 対象ファイル: `apps/desktop/src/main/ipc/index.ts`

**追加インポート**:

```typescript
import { registerSkillCreatorHandlers } from "./skillCreatorHandlers";
import { SkillCreatorService } from "../services/skill/SkillCreatorService";
```

**registerAllIpcHandlers内の追加コード**:

挿入位置: `registerClaudeCliHandlers(mainWindow)` の直後

```typescript
// Register Skill Creator handlers (TASK-9B-H)
const skillCreatorService = new SkillCreatorService();
registerSkillCreatorHandlers(mainWindow, skillCreatorService);
```

**統合順序の根拠**:

| 順序 | 既存の登録                | 新規追加                     |
| ---- | ------------------------- | ---------------------------- |
| N    | registerClaudeCliHandlers | -                            |
| N+1  | -                         | registerSkillCreatorHandlers |
| N+2  | registerChatEditHandlers  | -                            |

SkillCreatorServiceは他のサービスに依存しないため、位置は柔軟。ClaudeCLI関連の後に配置することで、スキル関連ハンドラーをグルーピングする。

---

### 2.4 skill-creator-api.ts: 新規Preload APIファイル

#### 対象ファイル: `apps/desktop/src/preload/skill-creator-api.ts`（新規作成）

**責務**: safeInvoke/safeOnパターンで6メソッドのPreload APIブリッジを実装する。

**インポート依存関係**:

| インポート元 | インポート対象                                                   |
| ------------ | ---------------------------------------------------------------- |
| `electron`   | `ipcRenderer`, `IpcRendererEvent`                                |
| `./channels` | `IPC_CHANNELS`, `ALLOWED_INVOKE_CHANNELS`, `ALLOWED_ON_CHANNELS` |
| `./types`    | `SkillCreatorAPI`（型のみ）                                      |

**エクスポート**:

```typescript
export const skillCreatorAPI: SkillCreatorAPI;
```

**既存パターンとの一貫性**: `skill-api.ts` と同一のsafeInvoke/safeOnパターンを使用。

---

### 2.5 preload/types.ts: SkillCreatorAPI型 + Window宣言

#### 対象ファイル: `apps/desktop/src/preload/types.ts`

**変更内容 1: SkillCreatorAPI インターフェース追加**

挿入位置: `PermissionAPI` インターフェースの前

```typescript
// ===== Skill Creator operations (TASK-9B-H) =====

import type {
  SkillCreatorMode,
  CreateSkillOptions,
  ExecuteTasksOptions,
  ExecutionReport,
  SkillCreatorProgress,
  IpcResult,
} from "@repo/shared/types";

export type {
  SkillCreatorMode,
  CreateSkillOptions,
  ExecuteTasksOptions,
  ExecutionReport,
  SkillCreatorProgress,
  IpcResult,
};

export interface SkillCreatorAPI {
  detectMode: (request: string) => Promise<IpcResult<SkillCreatorMode>>;
  create: (options: CreateSkillOptions) => Promise<IpcResult<string>>;
  executeTasks: (
    options: ExecuteTasksOptions,
  ) => Promise<IpcResult<ExecutionReport>>;
  validate: (skillDir: string) => Promise<IpcResult<boolean>>;
  validateSchema: (
    schemaName: string,
    data: unknown,
  ) => Promise<IpcResult<boolean>>;
  onProgress: (callback: (data: SkillCreatorProgress) => void) => () => void;
}
```

**変更内容 2: ElectronAPI インターフェースへのプロパティ追加**

```typescript
export interface ElectronAPI {
  // ...既存プロパティ...

  // Skill Creator API (TASK-9B-H)
  skillCreator: SkillCreatorAPI;
}
```

**P32対策**: `packages/shared/src/types/skillCreator.ts` の型追加と同一コミットで更新する。

---

### 2.6 preload/index.ts: contextBridge統合

#### 対象ファイル: `apps/desktop/src/preload/index.ts`

**追加インポート**:

```typescript
import { skillCreatorAPI } from "./skill-creator-api";
```

**contextBridge.exposeInMainWorld への追加**:

```typescript
contextBridge.exposeInMainWorld("electronAPI", {
  // ...既存API...
  skillCreator: skillCreatorAPI, // TASK-9B-H
});
```

**P23対策**: `window.skillCreatorAPI` のような直接公開は行わない。`window.electronAPI.skillCreator` のみに公開する。

---

### 2.7 shared/types/skillCreator.ts: 共有型定義追加

#### 対象ファイル: `packages/shared/src/types/skillCreator.ts`

**追加型定義**:

```typescript
/**
 * IPC通信の統一レスポンス型
 */
export type IpcResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * スキル作成進捗通知データ
 */
export interface SkillCreatorProgress {
  phase: string;
  taskIndex: number;
  totalTasks: number;
  message: string;
  timestamp: number;
}
```

#### 対象ファイル: `packages/shared/src/types/index.ts`

**エクスポート追加**:

```typescript
export type { IpcResult, SkillCreatorProgress } from "./skillCreator";
```

---

## 3. 統合フロー図

### 3.1 Renderer -> Main リクエストフロー

```
Renderer
  │ window.electronAPI.skillCreator.detectMode("create a skill")
  ▼
preload/index.ts (contextBridge)
  │ skillCreatorAPI.detectMode("create a skill")
  ▼
preload/skill-creator-api.ts
  │ safeInvoke(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE, { request: "create a skill" })
  │ ├─ ALLOWED_INVOKE_CHANNELS.includes("skill-creator:detect-mode") → true
  │ └─ ipcRenderer.invoke("skill-creator:detect-mode", { request: "create a skill" })
  ▼
main/ipc/skillCreatorHandlers.ts
  │ ipcMain.handle("skill-creator:detect-mode", handler)
  │ ├─ Step 1: validateIpcSender(event, mainWindow) → valid
  │ ├─ Step 2: detectModeSchema.parse({ request: "create a skill" }) → valid
  │ └─ Step 3: service.detectMode("create a skill") → "create"
  ▼
main/services/skill/SkillCreatorService.ts
  │ detectMode("create a skill") → "create"
  ▼
返却: { success: true, data: "create" }
```

### 3.2 Main -> Renderer 進捗通知フロー

```
main/services/skill/SkillCreatorService.ts
  │ createSkill() 実行中に進捗イベント発火
  ▼
main/ipc/skillCreatorHandlers.ts
  │ if (!mainWindow.isDestroyed()) {
  │   mainWindow.webContents.send(
  │     IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
  │     { phase: "init", taskIndex: 0, totalTasks: 5, message: "初期化中", timestamp: Date.now() }
  │   )
  │ }
  ▼
preload/skill-creator-api.ts
  │ safeOn(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, callback)
  │ ├─ ALLOWED_ON_CHANNELS.includes("skill-creator:progress") → true
  │ └─ ipcRenderer.on("skill-creator:progress", listener)
  ▼
Renderer
  │ callback({ phase: "init", taskIndex: 0, totalTasks: 5, message: "初期化中", timestamp: ... })
  │ UIの進捗表示を更新
```

---

## 4. 依存関係マトリクス

### 4.1 ファイル間の依存関係

| 依存元                  | 依存先                  | 依存内容                                |
| ----------------------- | ----------------------- | --------------------------------------- |
| skillCreatorHandlers.ts | preload/channels.ts     | IPC_CHANNELS定数                        |
| skillCreatorHandlers.ts | SkillCreatorService.ts  | サービスクラス                          |
| skillCreatorHandlers.ts | ipc-validator.ts        | validateIpcSender, toIPCValidationError |
| skill-creator-api.ts    | preload/channels.ts     | IPC_CHANNELS, ホワイトリスト            |
| skill-creator-api.ts    | preload/types.ts        | SkillCreatorAPI型                       |
| preload/types.ts        | @repo/shared/types      | IpcResult, SkillCreatorProgress         |
| ipc/index.ts            | skillCreatorHandlers.ts | registerSkillCreatorHandlers            |
| ipc/index.ts            | SkillCreatorService.ts  | インスタンス生成                        |
| preload/index.ts        | skill-creator-api.ts    | skillCreatorAPIオブジェクト             |

### 4.2 ビルド順序

| 順序 | パッケージ        | 変更ファイル                          | 理由                         |
| ---- | ----------------- | ------------------------------------- | ---------------------------- |
| 1    | `packages/shared` | types/skillCreator.ts, types/index.ts | 他パッケージが参照する型定義 |
| 2    | `apps/desktop`    | preload/channels.ts, preload/types.ts | チャンネル定数と型定義       |
| 3    | `apps/desktop`    | main/ipc/skillCreatorHandlers.ts      | ハンドラー実装               |
| 4    | `apps/desktop`    | preload/skill-creator-api.ts          | Preload API実装              |
| 5    | `apps/desktop`    | main/ipc/index.ts, preload/index.ts   | 統合ポイント                 |

---

## 5. テスト統合ポイント

### 5.1 ユニットテスト対象

| テスト対象                | テストファイルパス（想定）                                         |
| ------------------------- | ------------------------------------------------------------------ |
| skillCreatorHandlers      | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.test.ts` |
| Zodバリデーションスキーマ | 同上（ハンドラーテスト内で検証）                                   |
| sanitizeError関数         | 同上（エラーハンドリングテスト）                                   |
| validatePath関数          | 同上（パストラバーサルテスト）                                     |
| skill-creator-api         | `apps/desktop/src/preload/__tests__/skill-creator-api.test.ts`     |

### 5.2 モック依存関係

| テスト対象           | モック対象                 | モック方法                             |
| -------------------- | -------------------------- | -------------------------------------- |
| skillCreatorHandlers | SkillCreatorService        | 全メソッドをvi.fn()でモック            |
| skillCreatorHandlers | BrowserWindow (mainWindow) | id, webContents, isDestroyed()をモック |
| skillCreatorHandlers | IpcMainInvokeEvent         | sender.id, sender.getType()をモック    |
| skill-creator-api    | ipcRenderer                | invoke, on, removeListenerをモック     |

---

## 6. 既知のPitfall対策チェックリスト

| Pitfall ID | 対策内容                                                    | 確認対象ファイル                              |
| ---------- | ----------------------------------------------------------- | --------------------------------------------- |
| P23        | `window.electronAPI.skillCreator` のみに公開                | preload/index.ts                              |
| P27        | 全チャンネル名を IPC_CHANNELS 定数で参照                    | skillCreatorHandlers.ts, skill-creator-api.ts |
| P32        | shared/types と preload/types を同一コミットで更新          | types/skillCreator.ts, preload/types.ts       |
| P34        | Constructor Injection（mainWindow不要のため即座に生成可能） | ipc/index.ts                                  |
