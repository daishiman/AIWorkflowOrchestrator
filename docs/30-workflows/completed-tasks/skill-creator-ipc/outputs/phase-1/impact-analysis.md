# Phase 1 影響ファイル分析: SkillCreatorService IPCハンドラー登録

## メタ情報

| 項目     | 値                          |
| -------- | --------------------------- |
| タスクID | TASK-9B-H-SKILL-CREATOR-IPC |
| Phase    | 1                           |
| 作成日   | 2026-02-12                  |

---

## 影響ファイル一覧（5ファイル）

| #   | ファイルパス                                        | 変更種別 | 変更規模 | 対応AC              |
| --- | --------------------------------------------------- | -------- | -------- | ------------------- |
| 1   | `apps/desktop/src/preload/channels.ts`              | 修正     | 中       | AC-01, AC-02, AC-03 |
| 2   | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` | 新規     | 大       | AC-04, AC-05, AC-06 |
| 3   | `apps/desktop/src/main/ipc/index.ts`                | 修正     | 小       | AC-07               |
| 4   | `apps/desktop/src/preload/skill-creator-api.ts`     | 新規     | 中       | AC-08, AC-09        |
| 5   | `apps/desktop/src/preload/types.ts`                 | 修正     | 小       | AC-08               |

---

## ファイル別詳細分析

### 1. `apps/desktop/src/preload/channels.ts`

**変更種別**: 修正（既存ファイルへの追記）
**変更規模**: 中

#### 変更内容

1. **IPC_CHANNELS定数への6定数追加**:
   - `SKILL_CREATOR_DETECT_MODE: "skill-creator:detect-mode"`
   - `SKILL_CREATOR_CREATE: "skill-creator:create"`
   - `SKILL_CREATOR_EXECUTE_TASKS: "skill-creator:execute-tasks"`
   - `SKILL_CREATOR_VALIDATE: "skill-creator:validate"`
   - `SKILL_CREATOR_VALIDATE_SCHEMA: "skill-creator:validate-schema"`
   - `SKILL_CREATOR_PROGRESS: "skill-creator:progress"`

2. **ALLOWED_INVOKE_CHANNELS配列への5エントリ追加**:
   - `IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE`
   - `IPC_CHANNELS.SKILL_CREATOR_CREATE`
   - `IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS`
   - `IPC_CHANNELS.SKILL_CREATOR_VALIDATE`
   - `IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA`

3. **ALLOWED_ON_CHANNELS配列への1エントリ追加**:
   - `IPC_CHANNELS.SKILL_CREATOR_PROGRESS`

#### 依存関係

- **依存元**: skillCreatorHandlers.ts, skill-creator-api.ts（本ファイルの定数を参照）
- **依存先**: なし（定数定義の末端ファイル）
- **影響範囲**: IPC_CHANNELS型が自動拡張されるため、型定義への追加変更は不要

#### 命名一貫性

既存パターンとの照合:

| 既存パターン                      | 新規パターン                                                  | 整合性                     |
| --------------------------------- | ------------------------------------------------------------- | -------------------------- |
| `SKILL_IMPORT` → `skill:import`   | `SKILL_CREATOR_CREATE` → `skill-creator:create`               | 一貫（ドメイン:操作 形式） |
| `AGENT_EXECUTE` → `agent:execute` | `SKILL_CREATOR_EXECUTE_TASKS` → `skill-creator:execute-tasks` | 一貫                       |

---

### 2. `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`

**変更種別**: 新規ファイル作成
**変更規模**: 大

#### 変更内容

`registerSkillCreatorHandlers(mainWindow: BrowserWindow, skillCreatorService: SkillCreatorService)` 関数を実装。5つのIPCハンドラーを `ipcMain.handle` で登録する。

#### 各ハンドラーの処理フロー

```
1. validateIpcSender(event, mainWindow) — sender検証（L2）
2. Zodスキーマ引数検証（L3）
3. SkillCreatorService.xxx() 呼び出し
4. レスポンス構築（成功/エラー）
5. エラー時: サニタイズ処理（スタックトレース除外）
```

#### 5ハンドラー詳細

| ハンドラー                      | 引数検証                                                                         | 戻り値型         |
| ------------------------------- | -------------------------------------------------------------------------------- | ---------------- |
| `skill-creator:detect-mode`     | request: z.string().min(1).max(10000)                                            | SkillCreatorMode |
| `skill-creator:create`          | options: CreateSkillOptionsSchema（name, description, mode必須）                 | string           |
| `skill-creator:execute-tasks`   | options: ExecuteTasksOptionsSchema（tasksDir必須）                               | ExecutionReport  |
| `skill-creator:validate`        | skillDir: z.string().min(1).max(500)                                             | boolean          |
| `skill-creator:validate-schema` | schemaName: z.string().min(1).max(100), data: z.unknown().refine(v => v != null) | boolean          |

#### 依存関係

- **依存元**: index.ts（registerAllIpcHandlersから呼び出し）
- **依存先**:
  - `channels.ts`（IPC_CHANNELS定数）
  - `SkillCreatorService`（サービスクラス）
  - `validateIpcSender`（セキュリティユーティリティ）
  - `zod`（引数バリデーション）
  - `@repo/shared/types`（型定義）

---

### 3. `apps/desktop/src/main/ipc/index.ts`

**変更種別**: 修正（既存ファイルへの追記）
**変更規模**: 小

#### 変更内容

1. **import追加**: `registerSkillCreatorHandlers` のインポート
2. **import追加**: `SkillCreatorService` のインポート
3. **registerAllIpcHandlers関数内への追記**:
   - `SkillCreatorService` のインスタンス生成（Constructor Injection）
   - `registerSkillCreatorHandlers(mainWindow, skillCreatorService)` 呼び出し

#### DIパターン

SkillCreatorServiceはmainWindowを必要としないため、Constructor Injectionを使用する（P34対策）。

```typescript
// Constructor Injection（mainWindow不要のためSetter Injectionは不要）
const skillCreatorService = new SkillCreatorService();
registerSkillCreatorHandlers(mainWindow, skillCreatorService);
```

#### 依存関係

- **依存元**: main.ts（アプリ起動時にregisterAllIpcHandlersを呼び出し）
- **依存先**:
  - `skillCreatorHandlers.ts`（新規ハンドラー登録関数）
  - `SkillCreatorService`（サービスクラス）

#### 既存ハンドラー登録パターンとの整合

現在のregisterAllIpcHandlers内の登録順序に合わせて、Skill関連ハンドラーの近辺に配置する。

---

### 4. `apps/desktop/src/preload/skill-creator-api.ts`

**変更種別**: 新規ファイル作成
**変更規模**: 中

#### 変更内容

`window.electronAPI.skillCreator` 名前空間として公開される6メソッドを定義する。

| メソッド         | 内部実装パターン | チャンネル                                   |
| ---------------- | ---------------- | -------------------------------------------- |
| `detectMode`     | safeInvoke       | `IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE`     |
| `create`         | safeInvoke       | `IPC_CHANNELS.SKILL_CREATOR_CREATE`          |
| `executeTasks`   | safeInvoke       | `IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS`   |
| `validate`       | safeInvoke       | `IPC_CHANNELS.SKILL_CREATOR_VALIDATE`        |
| `validateSchema` | safeInvoke       | `IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA` |
| `onProgress`     | safeOn           | `IPC_CHANNELS.SKILL_CREATOR_PROGRESS`        |

#### safeInvoke/safeOnパターンの適用

```typescript
// safeInvoke: ALLOWED_INVOKE_CHANNELSでホワイトリスト検証後、ipcRenderer.invokeを実行
detectMode: (request: string) =>
  safeInvoke(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE, request),

// safeOn: ALLOWED_ON_CHANNELSでホワイトリスト検証後、ipcRenderer.onでリスナー登録
// クリーンアップ関数（removeListener）を返却
onProgress: (callback) =>
  safeOn(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, callback),
```

#### 依存関係

- **依存元**: preload/index.ts（contextBridge.exposeInMainWorld経由で公開）
- **依存先**:
  - `channels.ts`（IPC_CHANNELS定数）
  - `safeInvoke` / `safeOn`（セキュリティユーティリティ）
  - `@repo/shared/types`（型定義）

#### P23対策: 二重定義の回避

`window.skillCreatorAPI` のような独立APIを作成せず、`window.electronAPI.skillCreator` に統一する。これにより型定義の二重管理を防止する。

---

### 5. `apps/desktop/src/preload/types.ts`

**変更種別**: 修正（既存ファイルへの型定義追加）
**変更規模**: 小

#### 変更内容

`SkillCreatorAPI` 型定義を追加し、`ElectronAPI` インターフェースに `skillCreator` プロパティを追加する。

```typescript
export interface SkillCreatorAPI {
  detectMode: (request: string) => Promise<SkillCreatorMode>;
  create: (options: CreateSkillOptions) => Promise<string>;
  executeTasks: (options: ExecuteTasksOptions) => Promise<ExecutionReport>;
  validate: (skillDir: string) => Promise<boolean>;
  validateSchema: (schemaName: string, data: unknown) => Promise<boolean>;
  onProgress: (
    callback: (progress: SkillCreatorProgress) => void,
  ) => () => void;
}
```

#### P32対策: 型定義の二箇所同時更新

型定義は以下の2ファイルで管理される。変更時は同時に更新する:

1. `packages/shared/src/types`（共有型: SkillCreatorMode, CreateSkillOptions, ExecuteTasksOptions, ExecutionReport）
2. `apps/desktop/src/preload/types.ts`（Preload層型: SkillCreatorAPI）

本タスクでは `packages/shared/src/types` の型は既存のため変更不要。`preload/types.ts` にSkillCreatorAPI型を追加するのみ。

#### 依存関係

- **依存元**: skill-creator-api.ts（型参照）、Renderer層コンポーネント（型参照）
- **依存先**: `@repo/shared/types`（共有型定義）

---

## 依存関係グラフ

```
                            @repo/shared/types
                                   ↑
                    ┌──────────────┼──────────────┐
                    │              │              │
              channels.ts   preload/types.ts   SkillCreatorService.ts
                ↑    ↑           ↑                    ↑
                │    │           │                    │
                │    └───────────┤                    │
                │                │                    │
          skill-creator-api.ts   │                    │
                ↑                │                    │
                │                │                    │
                │     skillCreatorHandlers.ts ────────┘
                │                ↑
                │                │
           preload/index.ts    ipc/index.ts
                                 ↑
                              main.ts
```

---

## 変更影響の波及範囲

### 直接影響（本タスクで変更するファイル）

上記5ファイル

### 間接影響（本タスクでは変更しないが、後続で影響を受ける可能性があるファイル）

| ファイル                             | 影響内容                                             |
| ------------------------------------ | ---------------------------------------------------- |
| `apps/desktop/src/preload/index.ts`  | contextBridge.exposeInMainWorldにskillCreatorを追加  |
| `apps/desktop/src/renderer/`配下     | 新しいPreload APIを呼び出すUIコンポーネント          |
| `packages/shared/src/types/index.ts` | SkillCreatorProgress型の追加が必要になる可能性がある |

### 影響なし（確認済み）

| ファイル                                                      | 理由                                           |
| ------------------------------------------------------------- | ---------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | IPC化対象だが、Service自体の変更は不要         |
| `apps/web/`                                                   | Webアプリはデスクトップ固有IPC機能を使用しない |
| `packages/shared/src/agent/types.ts`                          | Agent SDKの型であり、SkillCreator型とは独立    |
