# Phase 1 要件定義書: SkillCreatorService IPCハンドラー登録

## メタ情報

| 項目     | 値                          |
| -------- | --------------------------- |
| タスクID | TASK-9B-H-SKILL-CREATOR-IPC |
| Phase    | 1                           |
| 作成日   | 2026-02-12                  |
| 機能名   | skill-creator-ipc           |

---

## タスク概要

SkillCreatorServiceの5つの公開メソッド（detectMode, createSkill, executeTasks, validateSkill, validateWithSchema）をIPC経由でRendererプロセスから呼び出し可能にする。6つのIPCチャンネル（invoke方向5個 + on方向1個）を定義し、3層セキュリティ（sender検証、Zodスキーマ引数検証、ALLOWEDチャンネルホワイトリスト）を実装する。

---

## IPC化対象: 5つの公開メソッド

| メソッド             | シグネチャ                                                   | 説明                             |
| -------------------- | ------------------------------------------------------------ | -------------------------------- |
| `detectMode`         | `(request: string) => Promise<SkillCreatorMode>`             | リクエスト文字列からモードを判定 |
| `createSkill`        | `(options: CreateSkillOptions) => Promise<string>`           | スキルを作成しパスを返却         |
| `executeTasks`       | `(options: ExecuteTasksOptions) => Promise<ExecutionReport>` | タスク群を実行しレポートを返却   |
| `validateSkill`      | `(skillDir: string) => Promise<boolean>`                     | スキルディレクトリを検証         |
| `validateWithSchema` | `(schemaName: string, data: unknown) => Promise<boolean>`    | スキーマに基づくデータ検証       |

### 依存型定義（`@repo/shared/types`）

- `SkillCreatorMode` - スキル作成モード列挙型
- `CreateSkillOptions` - スキル作成オプション（name, description, mode が必須）
- `ExecuteTasksOptions` - タスク実行オプション（tasksDir が必須）
- `ExecutionReport` - タスク実行レポート
- `TaskResult` - 個別タスク結果
- `TaskSpec` - タスク仕様
- `ExecutionSummary` - 実行サマリー

---

## IPCチャンネル定義（6チャンネル）

| チャンネル名                    | IPC_CHANNELS定数名              | 方向 | 対応メソッド       |
| ------------------------------- | ------------------------------- | ---- | ------------------ |
| `skill-creator:detect-mode`     | `SKILL_CREATOR_DETECT_MODE`     | R→M  | detectMode         |
| `skill-creator:create`          | `SKILL_CREATOR_CREATE`          | R→M  | createSkill        |
| `skill-creator:execute-tasks`   | `SKILL_CREATOR_EXECUTE_TASKS`   | R→M  | executeTasks       |
| `skill-creator:validate`        | `SKILL_CREATOR_VALIDATE`        | R→M  | validateSkill      |
| `skill-creator:validate-schema` | `SKILL_CREATOR_VALIDATE_SCHEMA` | R→M  | validateWithSchema |
| `skill-creator:progress`        | `SKILL_CREATOR_PROGRESS`        | M→R  | 進捗通知           |

- R→M: Renderer → Main（`ipcMain.handle` / `safeInvoke`）
- M→R: Main → Renderer（`webContents.send` / `safeOn`）

---

## 受け入れ基準

### AC-01: チャンネル定数定義

`apps/desktop/src/preload/channels.ts` の `IPC_CHANNELS` オブジェクトに以下の6つの定数が定義されている:

| 定数名                          | 値                                |
| ------------------------------- | --------------------------------- |
| `SKILL_CREATOR_DETECT_MODE`     | `"skill-creator:detect-mode"`     |
| `SKILL_CREATOR_CREATE`          | `"skill-creator:create"`          |
| `SKILL_CREATOR_EXECUTE_TASKS`   | `"skill-creator:execute-tasks"`   |
| `SKILL_CREATOR_VALIDATE`        | `"skill-creator:validate"`        |
| `SKILL_CREATOR_VALIDATE_SCHEMA` | `"skill-creator:validate-schema"` |
| `SKILL_CREATOR_PROGRESS`        | `"skill-creator:progress"`        |

### AC-02: ALLOWED_INVOKE_CHANNELSへの登録

`ALLOWED_INVOKE_CHANNELS` 配列に以下の5チャンネルがIPC_CHANNELS定数経由で登録されている:

- `IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE`
- `IPC_CHANNELS.SKILL_CREATOR_CREATE`
- `IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS`
- `IPC_CHANNELS.SKILL_CREATOR_VALIDATE`
- `IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA`

### AC-03: ALLOWED_ON_CHANNELSへの登録

`ALLOWED_ON_CHANNELS` 配列に以下の1チャンネルがIPC_CHANNELS定数経由で登録されている:

- `IPC_CHANNELS.SKILL_CREATOR_PROGRESS`

### AC-04: ハンドラー実装

`apps/desktop/src/main/ipc/skillCreatorHandlers.ts` に以下の5つのIPCハンドラーが `ipcMain.handle` で登録されている:

| ハンドラー                      | 対応メソッド       |
| ------------------------------- | ------------------ |
| `skill-creator:detect-mode`     | detectMode         |
| `skill-creator:create`          | createSkill        |
| `skill-creator:execute-tasks`   | executeTasks       |
| `skill-creator:validate`        | validateSkill      |
| `skill-creator:validate-schema` | validateWithSchema |

### AC-05: sender検証

全5ハンドラーの先頭で `validateIpcSender(event, mainWindow)` が呼び出され、不正な送信元からのリクエストが拒否される。検証失敗時は `{ success: false, error: "Unauthorized IPC sender" }` 形式のレスポンスが返却される。

### AC-06: 引数バリデーション

全5ハンドラーでZodスキーマによる引数検証が実行される:

| メソッド           | バリデーション内容                                                               |
| ------------------ | -------------------------------------------------------------------------------- |
| detectMode         | `request` が非空文字列であること（最小1文字、最大10,000文字）                    |
| createSkill        | `options` がCreateSkillOptions型に準拠すること（name, description, mode が必須） |
| executeTasks       | `options` がExecuteTasksOptions型に準拠すること（tasksDir が必須）               |
| validateSkill      | `skillDir` が非空文字列であること（最小1文字、最大500文字）                      |
| validateWithSchema | `schemaName` が非空文字列（最大100文字）、`data` がnull/undefinedでないこと      |

### AC-07: registerAllIpcHandlers連携

`apps/desktop/src/main/ipc/index.ts` の `registerAllIpcHandlers` 関数内で `registerSkillCreatorHandlers(mainWindow, skillCreatorService)` が呼び出されている。SkillCreatorServiceのインスタンスはConstructor Injectionで生成される。

### AC-08: Preload API追加

`apps/desktop/src/preload/skill-creator-api.ts` に `window.electronAPI.skillCreator` 名前空間として以下の6メソッドが公開されている:

| メソッド         | シグネチャ                                                           |
| ---------------- | -------------------------------------------------------------------- |
| `detectMode`     | `(request: string) => Promise<SkillCreatorMode>`                     |
| `create`         | `(options: CreateSkillOptions) => Promise<string>`                   |
| `executeTasks`   | `(options: ExecuteTasksOptions) => Promise<ExecutionReport>`         |
| `validate`       | `(skillDir: string) => Promise<boolean>`                             |
| `validateSchema` | `(schemaName: string, data: unknown) => Promise<boolean>`            |
| `onProgress`     | `(callback: (progress: SkillCreatorProgress) => void) => () => void` |

### AC-09: 進捗通知

`skill-creator:progress` チャンネルが `safeOn` パターンで購読可能であり、`onProgress` メソッドがクリーンアップ関数（`removeListener`呼び出し用）を返却する。

### AC-10: テスト基準

全テストがPASSし、以下のカバレッジ基準を満たしている:

| 指標              | 最低基準 |
| ----------------- | -------- |
| Line Coverage     | 80%      |
| Branch Coverage   | 60%      |
| Function Coverage | 80%      |

---

## データフロー

### リクエスト方向（Renderer → Main）

```
Renderer
  ↓ window.electronAPI.skillCreator.xxx()
Preload（safeInvoke）
  ↓ ALLOWED_INVOKE_CHANNELS ホワイトリスト検証
  ↓ ipcRenderer.invoke(channel, args)
Main（ipcMain.handle）
  ↓ validateIpcSender(event, mainWindow) — sender検証
  ↓ Zodスキーマ引数検証
  ↓ SkillCreatorService.xxx()
SkillCreatorService
  ↓ ScriptExecutor / ResourceLoader
FileSystem
```

### 進捗通知方向（Main → Renderer）

```
SkillCreatorService（処理中）
  ↓ mainWindow.webContents.send("skill-creator:progress", data)
Main
  ↓
Preload（safeOn）
  ↓ ALLOWED_ON_CHANNELS ホワイトリスト検証
  ↓ ipcRenderer.on(channel, callback)
Renderer
  ↓ onProgress コールバック実行
```

---

## セキュリティ要件

### 3層セキュリティモデル

| レイヤー           | 検証内容                                                            | 実装場所                     |
| ------------------ | ------------------------------------------------------------------- | ---------------------------- |
| L1: ホワイトリスト | チャンネル名がALLOWED_INVOKE_CHANNELS/ALLOWED_ON_CHANNELSに含まれる | Preload（safeInvoke/safeOn） |
| L2: sender検証     | validateIpcSender(event, mainWindow)で送信元ウィンドウを検証        | Main（ハンドラー先頭）       |
| L3: 引数検証       | Zodスキーマで引数の型・制約を検証                                   | Main（ハンドラー内）         |

### validateIpcSender検証3ステップ

1. **webContents確認**: event.senderに対応するBrowserWindowが存在するか
2. **DevTools拒否**: DevToolsからの呼び出しを検出・拒否
3. **Window照合**: 許可されたウィンドウリスト（mainWindow）との照合

### エラーサニタイズ

- スタックトレースをRendererに送信しない
- エラーメッセージのみサニタイズして返却
- 内部情報（ファイルパス、サーバー情報）を含めない

### パストラバーサル対策

- `skillDir` パラメータに対してパストラバーサル攻撃（`../`, `..\\`）を検出・拒否
- 許可されたベースディレクトリ外へのアクセスをブロック

---

## 既知のPitfall対策

| Pitfall ID | 内容                      | 対策                                                                          |
| ---------- | ------------------------- | ----------------------------------------------------------------------------- |
| P23        | API二重定義の型管理       | `window.electronAPI.skillCreator` に統一し、二重定義を作成しない              |
| P27        | Preloadハードコード文字列 | 全チャンネル名をIPC_CHANNELS定数で参照する                                    |
| P32        | 型定義の二箇所同時更新    | `packages/shared/src/types` と `apps/desktop/src/preload/types.ts` を同時更新 |
| P34        | 遅延初期化DI              | SkillCreatorServiceはmainWindow不要のためConstructor Injectionを使用          |
