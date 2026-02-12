# Phase 2 API仕様書: SkillCreatorService IPCハンドラー登録

## メタ情報

| 項目     | 値                          |
| -------- | --------------------------- |
| タスクID | TASK-9B-H-SKILL-CREATOR-IPC |
| Phase    | 2                           |
| 作成日   | 2026-02-12                  |
| 機能名   | skill-creator-ipc           |

---

## 1. チャンネル定数定義

### 1.1 SKILL_CREATOR_CHANNELS オブジェクト

`apps/desktop/src/preload/channels.ts` および `packages/shared/src/ipc/channels.ts` に追加する定数:

```typescript
/**
 * スキル作成関連のIPCチャネル (TASK-9B-H)
 */
export const SKILL_CREATOR_CHANNELS = {
  /** スキル作成モード自動判定 */
  SKILL_CREATOR_DETECT_MODE: "skill-creator:detect-mode",
  /** スキル新規作成 */
  SKILL_CREATOR_CREATE: "skill-creator:create",
  /** タスク群実行 */
  SKILL_CREATOR_EXECUTE_TASKS: "skill-creator:execute-tasks",
  /** スキル検証 */
  SKILL_CREATOR_VALIDATE: "skill-creator:validate",
  /** スキーマ検証 */
  SKILL_CREATOR_VALIDATE_SCHEMA: "skill-creator:validate-schema",
  /** 進捗通知（Main→Renderer） */
  SKILL_CREATOR_PROGRESS: "skill-creator:progress",
} as const;
```

### 1.2 IPC_CHANNELS への統合

```typescript
export const IPC_CHANNELS = {
  ...CHAT_EXPORT_CHANNELS,
  ...FILE_SYSTEM_CHANNELS,
  ...SKILL_CHANNELS,
  ...SKILL_CREATOR_CHANNELS, // TASK-9B-H: 追加
} as const;
```

### 1.3 ホワイトリスト登録

ALLOWED_INVOKE_CHANNELS（5チャンネル追加）:

```typescript
// Skill Creator channels (TASK-9B-H)
IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE,
IPC_CHANNELS.SKILL_CREATOR_CREATE,
IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS,
IPC_CHANNELS.SKILL_CREATOR_VALIDATE,
IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA,
```

ALLOWED_ON_CHANNELS（1チャンネル追加）:

```typescript
// Skill Creator channels (TASK-9B-H)
IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
```

---

## 2. リクエスト/レスポンス型定義

### 2.1 共通レスポンス型: IpcResult\<T\>

`packages/shared/src/types/skillCreator.ts` に追加:

```typescript
/**
 * IPC通信の統一レスポンス型
 * 全ハンドラーがこの型でレスポンスを返却する
 */
export type IpcResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### 2.2 進捗通知型: SkillCreatorProgress

`packages/shared/src/types/skillCreator.ts` に追加:

```typescript
/**
 * スキル作成進捗通知データ
 * Main→Renderer方向で送信される
 */
export interface SkillCreatorProgress {
  /** 現在のフェーズ名 */
  phase: string;
  /** 現在のタスクインデックス（0始まり） */
  taskIndex: number;
  /** 総タスク数 */
  totalTasks: number;
  /** 進捗メッセージ */
  message: string;
  /** タイムスタンプ（ミリ秒） */
  timestamp: number;
}
```

### 2.3 各チャンネルのリクエスト/レスポンス仕様

#### skill-creator:detect-mode

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| チャンネル | `skill-creator:detect-mode`                     |
| 方向       | Renderer -> Main                                |
| IPC方式    | `ipcMain.handle` / `safeInvoke`                 |
| 引数       | `request: string`                               |
| 戻り値     | `IpcResult<SkillCreatorMode>`                   |
| 成功例     | `{ success: true, data: "collaborative" }`      |
| 失敗例     | `{ success: false, error: "Request is empty" }` |

#### skill-creator:create

| 項目       | 値                                                    |
| ---------- | ----------------------------------------------------- |
| チャンネル | `skill-creator:create`                                |
| 方向       | Renderer -> Main                                      |
| IPC方式    | `ipcMain.handle` / `safeInvoke`                       |
| 引数       | `options: CreateSkillOptions`                         |
| 戻り値     | `IpcResult<string>`                                   |
| 成功例     | `{ success: true, data: "/path/to/skills/my-skill" }` |
| 失敗例     | `{ success: false, error: "Skill name is required" }` |

#### skill-creator:execute-tasks

| 項目       | 値                                                               |
| ---------- | ---------------------------------------------------------------- |
| チャンネル | `skill-creator:execute-tasks`                                    |
| 方向       | Renderer -> Main                                                 |
| IPC方式    | `ipcMain.handle` / `safeInvoke`                                  |
| 引数       | `options: ExecuteTasksOptions`                                   |
| 戻り値     | `IpcResult<ExecutionReport>`                                     |
| 成功例     | `{ success: true, data: { mode: "execution", summary: {...} } }` |
| 失敗例     | `{ success: false, error: "Tasks directory is required" }`       |

#### skill-creator:validate

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| チャンネル | `skill-creator:validate`                               |
| 方向       | Renderer -> Main                                       |
| IPC方式    | `ipcMain.handle` / `safeInvoke`                        |
| 引数       | `skillDir: string`                                     |
| 戻り値     | `IpcResult<boolean>`                                   |
| 成功例     | `{ success: true, data: true }`                        |
| 失敗例     | `{ success: false, error: "Path traversal detected" }` |

#### skill-creator:validate-schema

| 項目       | 値                                                           |
| ---------- | ------------------------------------------------------------ |
| チャンネル | `skill-creator:validate-schema`                              |
| 方向       | Renderer -> Main                                             |
| IPC方式    | `ipcMain.handle` / `safeInvoke`                              |
| 引数       | `{ schemaName: string; data: unknown }`                      |
| 戻り値     | `IpcResult<boolean>`                                         |
| 成功例     | `{ success: true, data: true }`                              |
| 失敗例     | `{ success: false, error: "Schema name must be non-empty" }` |

#### skill-creator:progress（イベント）

| 項目       | 値                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| チャンネル | `skill-creator:progress`                                                                              |
| 方向       | Main -> Renderer                                                                                      |
| IPC方式    | `webContents.send` / `safeOn`                                                                         |
| データ型   | `SkillCreatorProgress`                                                                                |
| データ例   | `{ phase: "init", taskIndex: 0, totalTasks: 5, message: "スキル初期化中", timestamp: 1707721800000 }` |

---

## 3. SkillCreatorAPI インターフェース（Preload層）

`apps/desktop/src/preload/types.ts` に追加:

```typescript
import type {
  SkillCreatorMode,
  CreateSkillOptions,
  ExecuteTasksOptions,
  ExecutionReport,
  SkillCreatorProgress,
  IpcResult,
} from "@repo/shared/types";

/**
 * SkillCreator Preload API
 * window.electronAPI.skillCreator 名前空間で公開される
 */
export interface SkillCreatorAPI {
  /** リクエスト文字列からスキル作成モードを自動判定する */
  detectMode: (request: string) => Promise<IpcResult<SkillCreatorMode>>;

  /** スキルを新規作成する */
  create: (options: CreateSkillOptions) => Promise<IpcResult<string>>;

  /** タスク群を実行する */
  executeTasks: (
    options: ExecuteTasksOptions,
  ) => Promise<IpcResult<ExecutionReport>>;

  /** スキルディレクトリを検証する */
  validate: (skillDir: string) => Promise<IpcResult<boolean>>;

  /** データをスキーマで検証する */
  validateSchema: (
    schemaName: string,
    data: unknown,
  ) => Promise<IpcResult<boolean>>;

  /** 進捗通知を購読する（クリーンアップ関数を返す） */
  onProgress: (callback: (data: SkillCreatorProgress) => void) => () => void;
}
```

### 3.1 ElectronAPI への統合

```typescript
export interface ElectronAPI {
  // ...既存プロパティ...

  // Skill Creator API (TASK-9B-H)
  skillCreator: SkillCreatorAPI;
}
```

---

## 4. Zodバリデーションスキーマ

### 4.1 detectModeSchema

```typescript
const detectModeSchema = z.object({
  request: z
    .string()
    .min(1, "Request must be non-empty")
    .max(10000, "Request exceeds maximum length"),
});
```

| フィールド | 型       | 制約                     | エラーメッセージ                                               |
| ---------- | -------- | ------------------------ | -------------------------------------------------------------- |
| request    | `string` | 最小1文字、最大10000文字 | "Request must be non-empty" / "Request exceeds maximum length" |

### 4.2 createSkillSchema

```typescript
const createSkillSchema = z.object({
  name: z
    .string()
    .min(1, "Skill name is required")
    .max(200, "Name exceeds maximum length"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(5000, "Description exceeds maximum length"),
  mode: z.enum([
    "collaborative",
    "orchestrate",
    "create",
    "update",
    "improve-prompt",
  ]),
  executionEngine: z.enum(["claude", "codex", "claude-to-codex"]).optional(),
  generateTasks: z.boolean().optional(),
  interviewResult: z
    .object({
      purpose: z.string().min(1),
      features: z.array(z.string()).min(1),
      inputs: z.array(z.string()),
      outputs: z.array(z.string()),
      externalApis: z
        .array(
          z.object({
            name: z.string(),
            endpoint: z.string(),
            authType: z.enum(["apiKey", "oauth", "none"]).optional(),
          }),
        )
        .optional(),
      toolsNeeded: z.array(z.string()),
      abstractionLevel: z.enum(["L1", "L2", "L3"]),
    })
    .optional(),
  domainModel: z
    .object({
      coreDomain: z.string(),
      entities: z.array(
        z.object({
          name: z.string(),
          attributes: z.array(z.string()),
        }),
      ),
      boundedContexts: z.array(
        z.object({
          name: z.string(),
          entities: z.array(z.string()),
        }),
      ),
      ubiquitousLanguage: z.record(z.string()),
    })
    .optional(),
});
```

| フィールド      | 型                 | 制約                                                                     |
| --------------- | ------------------ | ------------------------------------------------------------------------ |
| name            | `string`           | 必須、最小1文字、最大200文字                                             |
| description     | `string`           | 必須、最小1文字、最大5000文字                                            |
| mode            | `SkillCreatorMode` | 必須、列挙値: collaborative, orchestrate, create, update, improve-prompt |
| executionEngine | `ExecutionEngine?` | 任意、列挙値: claude, codex, claude-to-codex                             |
| generateTasks   | `boolean?`         | 任意                                                                     |
| interviewResult | `InterviewResult?` | 任意（collaborativeモード時に使用）                                      |
| domainModel     | `DomainModel?`     | 任意（collaborativeモード時に使用）                                      |

### 4.3 executeTasksSchema

```typescript
const executeTasksSchema = z.object({
  tasksDir: z
    .string()
    .min(1, "Tasks directory is required")
    .max(500, "Path exceeds maximum length"),
  parallel: z.boolean().optional(),
  dryRun: z.boolean().optional(),
  maxTurns: z.number().int().positive().optional(),
});
```

| フィールド | 型         | 制約                         |
| ---------- | ---------- | ---------------------------- |
| tasksDir   | `string`   | 必須、最小1文字、最大500文字 |
| parallel   | `boolean?` | 任意                         |
| dryRun     | `boolean?` | 任意                         |
| maxTurns   | `number?`  | 任意、正の整数               |

### 4.4 validateSkillSchema

```typescript
const validateSkillSchema = z.object({
  skillDir: z
    .string()
    .min(1, "Skill directory is required")
    .max(500, "Path exceeds maximum length"),
});
```

| フィールド | 型       | 制約                         |
| ---------- | -------- | ---------------------------- |
| skillDir   | `string` | 必須、最小1文字、最大500文字 |

### 4.5 validateWithSchemaSchema

```typescript
const validateWithSchemaSchema = z.object({
  schemaName: z
    .string()
    .min(1, "Schema name is required")
    .max(100, "Schema name exceeds maximum length"),
  data: z
    .unknown()
    .refine(
      (v) => v !== null && v !== undefined,
      "Data must not be null or undefined",
    ),
});
```

| フィールド | 型        | 制約                         |
| ---------- | --------- | ---------------------------- |
| schemaName | `string`  | 必須、最小1文字、最大100文字 |
| data       | `unknown` | 必須、null/undefined不可     |

---

## 5. エラーコードとメッセージ

### 5.1 エラーコード体系

| エラーコード | カテゴリ               | 説明                          | リトライ |
| ------------ | ---------------------- | ----------------------------- | -------- |
| 1001         | Validation Error       | sender検証失敗                | 不可     |
| 1002         | Validation Error       | Zodバリデーション失敗         | 不可     |
| 1003         | Validation Error       | パストラバーサル検出          | 不可     |
| 3001         | External Service Error | ScriptExecutor実行失敗        | 可能     |
| 5001         | Internal Error         | SkillCreatorService内部エラー | 不可     |

### 5.2 エラーメッセージ一覧

| エラーコード | Rendererに返却するメッセージ                         | 備考                                |
| ------------ | ---------------------------------------------------- | ----------------------------------- |
| 1001         | `"Unauthorized IPC sender"`                          | sender検証3ステップのいずれかで失敗 |
| 1002         | Zodのバリデーションエラーメッセージ（そのまま返却）  | ユーザーが修正可能な情報のため      |
| 1003         | `"Path traversal detected"`                          | セキュリティ上の理由で詳細は非開示  |
| 3001         | `"Script execution failed. Please try again later."` | リトライ可能な旨を通知              |
| 5001         | `"An internal error occurred. Please try again."`    | 内部詳細は非開示                    |

### 5.3 sanitizeError関数の仕様

```typescript
/**
 * エラーオブジェクトからRendererに安全なメッセージを生成する
 *
 * @param error - キャッチされたエラー
 * @returns サニタイズされたエラーメッセージ文字列
 */
function sanitizeError(error: unknown): string;
```

変換ルール:

| 入力パターン                            | 出力                                                     |
| --------------------------------------- | -------------------------------------------------------- |
| ZodError                                | バリデーションエラーメッセージをそのまま返却             |
| `message === "Path traversal detected"` | `"Path traversal detected"` を返却                       |
| `message === "Unauthorized IPC sender"` | `"Unauthorized IPC sender"` を返却                       |
| Error（上記以外）                       | `"An internal error occurred. Please try again."` を返却 |
| Error以外のthrown value                 | `"An unexpected error occurred."` を返却                 |

除外対象:

- `error.stack` プロパティ
- ファイルパスを含むメッセージ部分
- モジュール名・クラス名の詳細

---

## 6. ハンドラー登録/解除関数

### 6.1 registerSkillCreatorHandlers

```typescript
/**
 * SkillCreator IPCハンドラーを登録する
 *
 * @param mainWindow - メインウィンドウ（sender検証と進捗通知に使用）
 * @param service - SkillCreatorServiceインスタンス（DI対象）
 */
export function registerSkillCreatorHandlers(
  mainWindow: BrowserWindow,
  service: SkillCreatorService,
): void;
```

### 6.2 unregisterSkillCreatorHandlers

```typescript
/**
 * SkillCreator IPCハンドラーを解除する
 * 全5チャンネルのハンドラーをremoveHandlerで解除する
 */
export function unregisterSkillCreatorHandlers(): void;
```

解除対象:

```typescript
ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE);
ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE);
ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS);
ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE);
ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA);
```

---

## 7. Preload API実装仕様

### 7.1 skill-creator-api.ts

```typescript
import { ipcRenderer, IpcRendererEvent } from "electron";
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
} from "./channels";
import type { SkillCreatorAPI } from "./types";

function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
}

function safeOn<T>(channel: string, callback: (data: T) => void): () => void {
  if (!ALLOWED_ON_CHANNELS.includes(channel)) {
    console.error(`Channel ${channel} is not allowed`);
    return () => {};
  }
  const listener = (_event: IpcRendererEvent, data: T) => {
    callback(data);
  };
  ipcRenderer.on(channel, listener);
  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
}

export const skillCreatorAPI: SkillCreatorAPI = {
  detectMode: (request) =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE, { request }),

  create: (options) => safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CREATE, options),

  executeTasks: (options) =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS, options),

  validate: (skillDir) =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_VALIDATE, { skillDir }),

  validateSchema: (schemaName, data) =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA, {
      schemaName,
      data,
    }),

  onProgress: (callback) =>
    safeOn(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, callback),
};
```

### 7.2 contextBridge統合

`apps/desktop/src/preload/index.ts` に追加:

```typescript
import { skillCreatorAPI } from "./skill-creator-api";

contextBridge.exposeInMainWorld("electronAPI", {
  // ...既存API...
  skillCreator: skillCreatorAPI, // TASK-9B-H
});
```
