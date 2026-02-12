# Phase 2 アーキテクチャ設計書: SkillCreatorService IPCハンドラー登録

## メタ情報

| 項目     | 値                          |
| -------- | --------------------------- |
| タスクID | TASK-9B-H-SKILL-CREATOR-IPC |
| Phase    | 2                           |
| 作成日   | 2026-02-12                  |
| 機能名   | skill-creator-ipc           |

---

## 1. Electron 3プロセスモデル

### 1.1 プロセスアーキテクチャ

本タスクはElectronの3プロセスモデル（Main / Preload / Renderer）に基づいてIPC通信層を構築する。各プロセスの権限と責務は以下の通り。

| プロセス | 権限                 | 本タスクでの責務                                                     |
| -------- | -------------------- | -------------------------------------------------------------------- |
| Main     | Node.js フルアクセス | SkillCreatorServiceの呼び出し、sender検証、Zod引数検証、進捗通知送信 |
| Preload  | contextBridge のみ   | safeInvoke/safeOnによるホワイトリスト検証、APIブリッジの公開         |
| Renderer | DOM のみ             | `window.electronAPI.skillCreator.*` 経由でのAPI呼び出し              |

### 1.2 BrowserWindow必須設定（変更不可）

```
contextIsolation: true    - V8コンテキスト分離
nodeIntegration: false    - RendererからNode.js遮断
sandbox: true             - Chromiumサンドボックス
```

---

## 2. レイヤー図

### 2.1 リクエスト方向（Renderer -> Main）

```
┌─────────────────────────────────────────────────┐
│  Renderer Process                               │
│  window.electronAPI.skillCreator.detectMode()   │
│  window.electronAPI.skillCreator.create()       │
│  window.electronAPI.skillCreator.executeTasks() │
│  window.electronAPI.skillCreator.validate()     │
│  window.electronAPI.skillCreator.validateSchema()│
└────────────────────┬────────────────────────────┘
                     │ contextBridge
┌────────────────────▼────────────────────────────┐
│  Preload Process (skill-creator-api.ts)         │
│  safeInvoke(IPC_CHANNELS.SKILL_CREATOR_*, args) │
│  ├─ ALLOWED_INVOKE_CHANNELS ホワイトリスト検証  │
│  └─ ipcRenderer.invoke(channel, args)           │
└────────────────────┬────────────────────────────┘
                     │ IPC
┌────────────────────▼────────────────────────────┐
│  Main Process (skillCreatorHandlers.ts)          │
│  ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_*)   │
│  ├─ Step 1: validateIpcSender(event, mainWindow)│
│  ├─ Step 2: Zodスキーマ引数検証                 │
│  ├─ Step 3: SkillCreatorService.xxx() 呼び出し  │
│  └─ Step 4: IpcResult<T> レスポンス返却         │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│  SkillCreatorService                            │
│  ├─ ScriptExecutor (外部スクリプト実行)         │
│  └─ ResourceLoader (リソース読み込み)           │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│  FileSystem                                     │
└─────────────────────────────────────────────────┘
```

### 2.2 進捗通知方向（Main -> Renderer）

```
┌─────────────────────────────────────────────────┐
│  SkillCreatorService (処理中)                   │
│  createSkill() / executeTasks() の長時間実行    │
└────────────────────┬────────────────────────────┘
                     │ 進捗イベント発火
┌────────────────────▼────────────────────────────┐
│  Main Process (skillCreatorHandlers.ts)          │
│  if (!mainWindow.isDestroyed()) {               │
│    mainWindow.webContents.send(                  │
│      IPC_CHANNELS.SKILL_CREATOR_PROGRESS, data  │
│    )                                             │
│  }                                               │
└────────────────────┬────────────────────────────┘
                     │ IPC
┌────────────────────▼────────────────────────────┐
│  Preload Process (skill-creator-api.ts)         │
│  safeOn(IPC_CHANNELS.SKILL_CREATOR_PROGRESS)    │
│  ├─ ALLOWED_ON_CHANNELS ホワイトリスト検証      │
│  └─ ipcRenderer.on(channel, callback)           │
└────────────────────┬────────────────────────────┘
                     │ contextBridge
┌────────────────────▼────────────────────────────┐
│  Renderer Process                               │
│  window.electronAPI.skillCreator.onProgress(cb) │
│  コールバック実行                                │
└─────────────────────────────────────────────────┘
```

---

## 3. ハンドラー登録パターン: Pattern 3（mainWindow + service）

### 3.1 パターン概要

`arch-ipc-persistence.md` のPattern 3に準拠する。このパターンは以下の特徴を持つ:

- **mainWindow**: sender検証と進捗通知送信に使用
- **service**: ビジネスロジックの委譲先（DI対象）
- **register/unregister関数ペア**: ハンドラーのライフサイクル管理

### 3.2 適用理由

| 要件                             | Pattern 3での実現方法                                  |
| -------------------------------- | ------------------------------------------------------ |
| sender検証にmainWindowが必要     | 第1引数で受け取り、validateIpcSenderに渡す             |
| SkillCreatorServiceの呼び出し    | 第2引数で受け取り、各ハンドラーから委譲する            |
| 進捗通知にwebContents.sendが必要 | mainWindow.webContents.sendで送信する                  |
| テスト時のモック差し替え         | 引数経由のDIにより、テストでモックオブジェクトを注入可 |

### 3.3 既存パターンとの一貫性

| 既存ハンドラー                   | パターン                              | 本タスクとの一致 |
| -------------------------------- | ------------------------------------- | ---------------- |
| `registerSkillHandlers`          | Pattern 3: (mainWindow, skillService) | 一致             |
| `registerAuthHandlers`           | Pattern 3: (mainWindow, supabase, ..) | 一致             |
| `registerAgentExecutionHandlers` | Pattern 3: (mainWindow)               | 一致             |

### 3.4 DI設計

| 項目                                | 設計判断                                                         |
| ----------------------------------- | ---------------------------------------------------------------- |
| SkillCreatorServiceのmainWindow依存 | 依存しない（ファイルシステム操作のみ）                           |
| DIパターン                          | Constructor Injection（P34: mainWindow不要のため即座に生成可能） |
| インスタンス生成場所                | `registerAllIpcHandlers` 内で `new SkillCreatorService()` を実行 |
| テスト時の差し替え                  | 関数引数でモックサービスを渡す                                   |

---

## 4. IPCチャンネル定義テーブル

### 4.1 チャンネル一覧（6チャンネル）

| チャンネル名                    | IPC_CHANNELS定数名              | 方向 | IPC方式          | 対応メソッド       | 説明                 |
| ------------------------------- | ------------------------------- | ---- | ---------------- | ------------------ | -------------------- |
| `skill-creator:detect-mode`     | `SKILL_CREATOR_DETECT_MODE`     | R->M | ipcMain.handle   | detectMode         | モード自動判定       |
| `skill-creator:create`          | `SKILL_CREATOR_CREATE`          | R->M | ipcMain.handle   | createSkill        | スキル新規作成       |
| `skill-creator:execute-tasks`   | `SKILL_CREATOR_EXECUTE_TASKS`   | R->M | ipcMain.handle   | executeTasks       | タスク群実行         |
| `skill-creator:validate`        | `SKILL_CREATOR_VALIDATE`        | R->M | ipcMain.handle   | validateSkill      | スキル検証           |
| `skill-creator:validate-schema` | `SKILL_CREATOR_VALIDATE_SCHEMA` | R->M | ipcMain.handle   | validateWithSchema | スキーマ検証         |
| `skill-creator:progress`        | `SKILL_CREATOR_PROGRESS`        | M->R | webContents.send | -（進捗通知）      | 進捗リアルタイム通知 |

### 4.2 ホワイトリスト登録

| ホワイトリスト          | 登録チャンネル数 | 対象定数名                                                                                                                          |
| ----------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| ALLOWED_INVOKE_CHANNELS | 5                | SKILL_CREATOR_DETECT_MODE, SKILL_CREATOR_CREATE, SKILL_CREATOR_EXECUTE_TASKS, SKILL_CREATOR_VALIDATE, SKILL_CREATOR_VALIDATE_SCHEMA |
| ALLOWED_ON_CHANNELS     | 1                | SKILL_CREATOR_PROGRESS                                                                                                              |

### 4.3 チャンネル命名規則

| 規則               | 適用例                                | 根拠                            |
| ------------------ | ------------------------------------- | ------------------------------- |
| プレフィックス分離 | `skill-creator:*`（既存: `skill:*`）  | SRP: スキル管理と作成を分離     |
| ケバブケース       | `detect-mode`（`detectMode`ではない） | 既存チャンネル名パターンに準拠  |
| フラットキー形式   | `SKILL_CREATOR_DETECT_MODE`           | channels.tsの既存パターンに準拠 |

---

## 5. データフロー詳細

### 5.1 リクエスト処理フロー（共通4ステップ）

全5ハンドラーは以下の共通4ステップ構成に従う:

| ステップ | 処理                                 | 成功時         | 失敗時                                                        |
| -------- | ------------------------------------ | -------------- | ------------------------------------------------------------- |
| 1        | validateIpcSender(event, mainWindow) | 次のステップへ | `{ success: false, error: "Unauthorized IPC sender" }` を返却 |
| 2        | Zodスキーマで引数を検証              | 次のステップへ | `{ success: false, error: "<バリデーションエラー>" }` を返却  |
| 3        | SkillCreatorService.xxx() 呼び出し   | 次のステップへ | `{ success: false, error: sanitizeError(e) }` を返却          |
| 4        | `{ success: true, data: T }` 返却    | レスポンス返却 | -                                                             |

### 5.2 パストラバーサル対策フロー

`skillDir` パラメータ（validateSkill, validateWithSchema で使用）に対して:

| ステップ | 処理                               | 判定基準                                 |
| -------- | ---------------------------------- | ---------------------------------------- |
| 1        | `path.normalize(skillDir)`         | パスを正規化する                         |
| 2        | `path.resolve(basePath, skillDir)` | ベースパス基準で絶対パスに変換           |
| 3        | `resolved.startsWith(basePath)`    | 解決後パスがベースパス配下であること     |
| 4        | 違反時                             | `"Path traversal detected"` エラーを返却 |

### 5.3 進捗通知フロー

```
SkillCreatorService内部（createSkill/executeTasks実行中）
  ↓ 進捗データ生成
mainWindow.isDestroyed() を確認
  ├─ true:  送信をスキップ（ウィンドウ破棄済み）
  └─ false: mainWindow.webContents.send(SKILL_CREATOR_PROGRESS, data) を実行
```

---

## 6. エラーハンドリング設計

### 6.1 エラーパターン分類

| エラーパターン      | 発生条件                      | エラーコード | リトライ | Rendererへの返却メッセージ                           |
| ------------------- | ----------------------------- | ------------ | -------- | ---------------------------------------------------- |
| Unauthorized Sender | sender検証失敗                | 1001         | 不可     | `"Unauthorized IPC sender"`                          |
| Invalid Arguments   | Zodバリデーション失敗         | 1002         | 不可     | Zodのバリデーションエラーメッセージ                  |
| Path Traversal      | パストラバーサル検出          | 1003         | 不可     | `"Path traversal detected"`                          |
| Service Error       | SkillCreatorService内部エラー | 5001         | 不可     | `"An internal error occurred. Please try again."`    |
| Script Error        | ScriptExecutor実行失敗        | 3001         | 可能     | `"Script execution failed. Please try again later."` |

### 6.2 エラーサニタイズ方針

| 除外する情報     | 理由                                 |
| ---------------- | ------------------------------------ |
| スタックトレース | 内部実装の詳細がRendererに漏洩する   |
| ファイルパス     | サーバーのディレクトリ構造が漏洩する |
| モジュール名     | 使用ライブラリの情報が漏洩する       |
| 環境変数         | 設定情報が漏洩する                   |

### 6.3 共通エラーラッパー関数

`handleWithErrorBoundary<T>` 関数を設計し、全ハンドラーで共通の try-catch パターンを適用する:

```
handleWithErrorBoundary<T>(
  event: IpcMainInvokeEvent,
  mainWindow: BrowserWindow,
  channel: string,
  handler: () => Promise<T>
): Promise<IpcResult<T>>
```

| ステップ | 処理                        | 成功時                       | 失敗時                                         |
| -------- | --------------------------- | ---------------------------- | ---------------------------------------------- |
| 1        | validateIpcSenderを呼び出す | 次のステップへ               | `{ success: false, error: "Unauthorized..." }` |
| 2        | handler関数を実行する       | `{ success: true, data: T }` | `{ success: false, error: sanitizeError(e) }`  |

---

## 7. ファイル構成

### 7.1 新規作成ファイル

| ファイルパス                                        | 責務                                         |
| --------------------------------------------------- | -------------------------------------------- |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` | 5ハンドラー登録 + unregister関数             |
| `apps/desktop/src/preload/skill-creator-api.ts`     | Preload APIオブジェクト（safeInvoke/safeOn） |

### 7.2 変更対象ファイル

| ファイルパス                                | 変更内容                                             |
| ------------------------------------------- | ---------------------------------------------------- |
| `apps/desktop/src/preload/channels.ts`      | 6チャンネル定数追加、ホワイトリスト登録              |
| `packages/shared/src/ipc/channels.ts`       | 6チャンネル定数追加（preload/channels.tsと同期）     |
| `packages/shared/src/types/skillCreator.ts` | SkillCreatorProgress型、IpcResult型の追加            |
| `apps/desktop/src/preload/types.ts`         | SkillCreatorAPIインターフェース追加、ElectronAPI拡張 |
| `apps/desktop/src/main/ipc/index.ts`        | registerSkillCreatorHandlersのインポートと呼び出し   |
| `apps/desktop/src/preload/index.ts`         | contextBridgeにskillCreatorAPI追加                   |

---

## 8. 3層セキュリティモデル

| レイヤー           | 検証内容                                                 | 実装場所                    | 失敗時                                               |
| ------------------ | -------------------------------------------------------- | --------------------------- | ---------------------------------------------------- |
| L1: ホワイトリスト | チャンネル名がALLOWED\_\*\_CHANNELSに含まれるか          | Preload (safeInvoke/safeOn) | `Promise.reject("Channel not allowed")` または空関数 |
| L2: sender検証     | validateIpcSenderの3ステップ検証                         | Main (ハンドラー先頭)       | `{ success: false, error: "Unauthorized..." }` 返却  |
| L3: 引数検証       | Zodスキーマで引数の型・制約を検証 + パストラバーサル対策 | Main (ハンドラー内)         | `{ success: false, error: "<検証エラー>" }` 返却     |

### L2: validateIpcSender検証3ステップ

| ステップ | 検証内容                                             | 失敗時エラーコード |
| -------- | ---------------------------------------------------- | ------------------ |
| 1        | event.senderからBrowserWindowが取得可能か            | IPC_UNAUTHORIZED   |
| 2        | DevToolsからの呼び出しでないか                       | IPC_FORBIDDEN      |
| 3        | 許可されたウィンドウリスト（mainWindow）に含まれるか | IPC_FORBIDDEN      |

---

## 9. 既知のPitfall対策

| Pitfall ID | 内容                      | 本設計での対策                                                                         |
| ---------- | ------------------------- | -------------------------------------------------------------------------------------- |
| P23        | API二重定義の型管理       | `window.electronAPI.skillCreator` のみに公開。`window.skillCreatorAPI` は作成しない    |
| P27        | Preloadハードコード文字列 | skill-creator-api.ts と skillCreatorHandlers.ts の両方で IPC_CHANNELS 定数を使用       |
| P32        | 型定義の二箇所同時更新    | `packages/shared/src/types/skillCreator.ts` と `preload/types.ts` を同一コミットで更新 |
| P34        | 遅延初期化DI              | SkillCreatorServiceはmainWindow不要のため Constructor Injection を使用                 |
