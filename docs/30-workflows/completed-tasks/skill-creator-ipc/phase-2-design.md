# Phase 2: 設計

## メタ情報

| 項目     | 値                          |
| -------- | --------------------------- |
| Phase    | 2                           |
| 機能名   | skill-creator-ipc           |
| タスクID | TASK-9B-H-SKILL-CREATOR-IPC |
| 作成日   | 2026-02-12                  |
| 次Phase  | Phase 3: 設計レビュー       |

---

## 目的

Phase 1で定義した要件（FR-01からFR-08、NFR-01からNFR-08）を実現可能なIPC設計に落とし込む。5つのinvokeチャンネルと1つのonチャンネルについて、チャンネル定義、Main Processハンドラー、Preload API、型定義、エラーハンドリングの詳細設計を確定する。

---

## 実行タスク

- タスク1 チャンネル設計: IPC_CHANNELS定数への6チャンネル追加とホワイトリスト登録を設計する
- タスク2 ハンドラー設計: skillCreatorHandlers.tsの内部構造とPattern 3（mainWindow+service）パターンを設計する
- タスク3 Preload API設計: skill-creator-api.tsのsafeInvoke/safeOnブリッジとcontextBridge統合を設計する
- タスク4 型定義設計: SkillCreatorAPI型、SkillCreatorProgress型、IpcResult型の定義場所と内容を設計する
- タスク5 エラーハンドリング設計: エラーパターン分類、サニタイズ関数、共通エラーラッパーを設計する

---

## 参照資料

| 資料名                    | パス                                                                              | 説明                                                                                             |
| ------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Phase 1成果物             | `docs/30-workflows/skill-creator-ipc/phase-1-requirements.md`                     | 要件定義書（AC-01からAC-10、FR/NFR分類）                                                         |
| スキル実行IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | validatePath 4ステップ検証、safeInvoke/safeOnパターン、3層セキュリティレイヤー                   |
| Agent SDK Skill仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | SkillCreatorService API仕様、統一API 13メソッド、SkillCreatorMode型定義                          |
| IPC・永続化パターン       | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`       | Pattern 3（mainWindow+service）、registerAllIpcHandlers 7ステップ登録、新規ハンドラー追加手順    |
| Electron IPCセキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | BrowserWindow必須設定、IPC sender検証3ステップ（webContents確認、DevTools拒否、Window照合）、CSP |
| Agent Dashboard IPC       | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | 既存Agent Dashboard IPCチャンネル一覧（命名一貫性の参照用）                                      |
| 既存channels.ts           | `apps/desktop/src/preload/channels.ts`                                            | 現在のIPC_CHANNELS定数定義（フラットキー形式）                                                   |
| 既存skillHandlers.ts      | `apps/desktop/src/main/ipc/skillHandlers.ts`                                      | 既存ハンドラー登録パターン（Pattern 3準拠の参考実装）                                            |
| 既存ipc/index.ts          | `apps/desktop/src/main/ipc/index.ts`                                              | registerAllIpcHandlers関数（ハンドラー統合パターン）                                             |

---

## 実行手順

### ステップ1: チャンネル設計

#### 1-1. IPC_CHANNELSへの定数追加

`apps/desktop/src/preload/channels.ts` の `IPC_CHANNELS` オブジェクトに以下の6定数を追加する。既存のフラットキー形式（`SKILL_CREATOR_`プレフィックス）に従う。

| 定数名                          | 値                                | コメント                 |
| ------------------------------- | --------------------------------- | ------------------------ |
| `SKILL_CREATOR_DETECT_MODE`     | `"skill-creator:detect-mode"`     | Skill Creator operations |
| `SKILL_CREATOR_CREATE`          | `"skill-creator:create"`          |                          |
| `SKILL_CREATOR_EXECUTE_TASKS`   | `"skill-creator:execute-tasks"`   |                          |
| `SKILL_CREATOR_VALIDATE`        | `"skill-creator:validate"`        |                          |
| `SKILL_CREATOR_VALIDATE_SCHEMA` | `"skill-creator:validate-schema"` |                          |
| `SKILL_CREATOR_PROGRESS`        | `"skill-creator:progress"`        | Main→Renderer進捗通知    |

挿入位置: `// Auth Mode operations` セクションの直前（`AUTH_MODE_CHANGED`の後）。

#### 1-2. ALLOWED_INVOKE_CHANNELSへの登録

以下の5チャンネルを `ALLOWED_INVOKE_CHANNELS` 配列に追加する:

```
// Skill Creator channels (TASK-9B-H)
IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE,
IPC_CHANNELS.SKILL_CREATOR_CREATE,
IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS,
IPC_CHANNELS.SKILL_CREATOR_VALIDATE,
IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA,
```

挿入位置: `// Auth Mode channels` コメントの直前。

#### 1-3. ALLOWED_ON_CHANNELSへの登録

以下の1チャンネルを `ALLOWED_ON_CHANNELS` 配列に追加する:

```
// Skill Creator channels (TASK-9B-H)
IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
```

挿入位置: `// Auth Mode channels` コメントの直前。

### ステップ2: ハンドラー設計

#### 2-1. ファイル構造

新規ファイル `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` を作成する。

#### 2-2. 公開関数シグネチャ

| 関数名                           | 引数                                                      | 戻り値 | 用途                       |
| -------------------------------- | --------------------------------------------------------- | ------ | -------------------------- |
| `registerSkillCreatorHandlers`   | `mainWindow: BrowserWindow, service: SkillCreatorService` | `void` | 5ハンドラーの登録          |
| `unregisterSkillCreatorHandlers` | なし                                                      | `void` | ハンドラーのクリーンアップ |

arch-ipc-persistence.mdのPattern 3（mainWindow + service）に準拠する。

#### 2-3. 各ハンドラーの内部処理フロー

全5ハンドラーは以下の共通4ステップ構成に従う:

| ステップ | 処理                                              | 失敗時の動作                                                           |
| -------- | ------------------------------------------------- | ---------------------------------------------------------------------- |
| 1        | `validateIpcSender(event, mainWindow)` を呼び出す | `{ success: false, error: "Unauthorized IPC sender" }` を返却          |
| 2        | Zodスキーマで引数を検証する                       | `{ success: false, error: "<バリデーションエラーメッセージ>" }` を返却 |
| 3        | SkillCreatorServiceの対応メソッドを呼び出す       | `{ success: false, error: "<サニタイズ済みエラーメッセージ>" }` を返却 |
| 4        | `{ success: true, data: <結果> }` を返却する      | -                                                                      |

#### 2-4. 各ハンドラーの引数・戻り値マッピング

| チャンネル定数                  | 引数（event以外）                   | サービスメソッド呼び出し                       | 成功時レスポンス                            |
| ------------------------------- | ----------------------------------- | ---------------------------------------------- | ------------------------------------------- |
| `SKILL_CREATOR_DETECT_MODE`     | `request: string`                   | `service.detectMode(request)`                  | `{ success: true, data: SkillCreatorMode }` |
| `SKILL_CREATOR_CREATE`          | `options: CreateSkillOptions`       | `service.createSkill(options)`                 | `{ success: true, data: string }`           |
| `SKILL_CREATOR_EXECUTE_TASKS`   | `options: ExecuteTasksOptions`      | `service.executeTasks(options)`                | `{ success: true, data: ExecutionReport }`  |
| `SKILL_CREATOR_VALIDATE`        | `skillDir: string`                  | `service.validateSkill(skillDir)`              | `{ success: true, data: boolean }`          |
| `SKILL_CREATOR_VALIDATE_SCHEMA` | `schemaName: string, data: unknown` | `service.validateWithSchema(schemaName, data)` | `{ success: true, data: boolean }`          |

#### 2-5. Zodバリデーションスキーマ定義

| スキーマ名                 | 対象フィールド          | 制約                                                                             |
| -------------------------- | ----------------------- | -------------------------------------------------------------------------------- |
| `detectModeSchema`         | request                 | `z.string().min(1).max(10000)`                                                   |
| `createSkillSchema`        | options.name            | `z.string().min(1).max(200)`                                                     |
|                            | options.description     | `z.string().min(1).max(5000)`                                                    |
|                            | options.mode            | `z.enum(["collaborative", "orchestrate", "create", "update", "improve-prompt"])` |
|                            | options.generateTasks   | `z.boolean().optional()`                                                         |
|                            | options.interviewResult | `z.object({...}).optional()`                                                     |
|                            | options.executionEngine | `z.string().optional()`                                                          |
| `executeTasksSchema`       | options.tasksDir        | `z.string().min(1).max(500)`                                                     |
|                            | options.dryRun          | `z.boolean().optional()`                                                         |
|                            | options.parallel        | `z.boolean().optional()`                                                         |
| `validateSkillSchema`      | skillDir                | `z.string().min(1).max(500)`                                                     |
| `validateWithSchemaSchema` | schemaName              | `z.string().min(1).max(100)`                                                     |
|                            | data                    | `z.unknown().refine(v => v !== null && v !== undefined)`                         |

#### 2-6. パストラバーサル対策（validateSkill, validateWithSchema）

`skillDir` パラメータに対して以下の検証を実行する:

| ステップ | 処理                               | 判定基準                                 |
| -------- | ---------------------------------- | ---------------------------------------- |
| 1        | `path.normalize(skillDir)`         | パスを正規化する                         |
| 2        | `path.resolve(basePath, skillDir)` | ベースパス基準で絶対パスに変換する       |
| 3        | `resolved.startsWith(basePath)`    | 解決後パスがベースパス配下であること     |
| 4        | 違反時はエラースロー               | `"Path traversal detected"` エラーを返却 |

`basePath` はSkillCreatorServiceのコンストラクタで設定された `skillsDir` を使用する。

#### 2-7. registerAllIpcHandlersへの統合

`apps/desktop/src/main/ipc/index.ts` に以下を追加する:

追加インポート:

- `import { registerSkillCreatorHandlers } from "./skillCreatorHandlers"`
- `import { SkillCreatorService } from "../services/skill/SkillCreatorService"`

`registerAllIpcHandlers` 関数内への追加コード:

| 手順 | 処理                                                                       |
| ---- | -------------------------------------------------------------------------- |
| 1    | `const skillCreatorService = new SkillCreatorService()` でインスタンス生成 |
| 2    | `registerSkillCreatorHandlers(mainWindow, skillCreatorService)` で登録     |

挿入位置: `registerClaudeCliHandlers(mainWindow)` の直後。

### ステップ3: Preload API設計

#### 3-1. SkillCreatorAPIオブジェクト定義

新規ファイル `apps/desktop/src/preload/skill-creator-api.ts` を作成し、以下の構造でAPIオブジェクトを定義する:

| メソッド名       | 内部実装                                                                              |
| ---------------- | ------------------------------------------------------------------------------------- |
| `detectMode`     | `safeInvoke(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE, request)` を呼び出す              |
| `create`         | `safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CREATE, options)` を呼び出す                   |
| `executeTasks`   | `safeInvoke(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS, options)` を呼び出す            |
| `validate`       | `safeInvoke(IPC_CHANNELS.SKILL_CREATOR_VALIDATE, skillDir)` を呼び出す                |
| `validateSchema` | `safeInvoke(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA, schemaName, data)` を呼び出す |
| `onProgress`     | `safeOn(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, callback)` を呼び出す                    |

#### 3-2. contextBridge統合ポイント

`apps/desktop/src/preload/index.ts` の `contextBridge.exposeInMainWorld("electronAPI", { ... })` オブジェクトに `skillCreator: skillCreatorAPI` を追加する。

#### 3-3. safeInvoke/safeOnの検証フロー

| パターン   | ステップ1                                       | ステップ2                                   | ステップ3                                      |
| ---------- | ----------------------------------------------- | ------------------------------------------- | ---------------------------------------------- |
| safeInvoke | ALLOWED_INVOKE_CHANNELSにチャンネルが含まれるか | 含まれない場合 `Promise.reject()`           | 含まれる場合 `ipcRenderer.invoke()` 実行       |
| safeOn     | ALLOWED_ON_CHANNELSにチャンネルが含まれるか     | 含まれない場合 空のクリーンアップ関数を返却 | 含まれる場合 `ipcRenderer.on()` でリスナー登録 |

### ステップ4: 型定義設計

#### 4-1. packages/sharedへの型追加

`packages/shared/src/types/skillCreator.ts` に以下の型を追加する（SkillCreatorMode, CreateSkillOptions, ExecuteTasksOptions, ExecutionReport は既存の `@repo/shared/types` に定義済み）:

| 型名                   | 定義内容                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| `SkillCreatorProgress` | `{ phase: string; taskIndex: number; totalTasks: number; message: string; timestamp: number }` |
| `IpcResult<T>`         | `{ success: true; data: T } \| { success: false; error: string }`                              |

#### 4-2. preload/types.tsへの型追加

`apps/desktop/src/preload/types.ts` に以下のインターフェースを追加する:

| 型名              | 定義内容                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------ |
| `SkillCreatorAPI` | detectMode, create, executeTasks, validate, validateSchema, onProgress の6メソッドの型定義 |

SkillCreatorAPIの各メソッドシグネチャ:

| メソッド         | 引数                                             | 戻り値                                 |
| ---------------- | ------------------------------------------------ | -------------------------------------- |
| `detectMode`     | `request: string`                                | `Promise<IpcResult<SkillCreatorMode>>` |
| `create`         | `options: CreateSkillOptions`                    | `Promise<IpcResult<string>>`           |
| `executeTasks`   | `options: ExecuteTasksOptions`                   | `Promise<IpcResult<ExecutionReport>>`  |
| `validate`       | `skillDir: string`                               | `Promise<IpcResult<boolean>>`          |
| `validateSchema` | `schemaName: string, data: unknown`              | `Promise<IpcResult<boolean>>`          |
| `onProgress`     | `callback: (data: SkillCreatorProgress) => void` | `() => void`                           |

#### 4-3. Window型拡張

既存の `ElectronAPI` インターフェースに `skillCreator: SkillCreatorAPI` プロパティを追加する。

#### 4-4. 型定義2箇所同時更新計画（P32対策）

| 順序 | ファイル                                    | 更新内容                                  |
| ---- | ------------------------------------------- | ----------------------------------------- |
| 1    | `packages/shared/src/types/skillCreator.ts` | SkillCreatorProgress型、IpcResult型の追加 |
| 2    | `apps/desktop/src/preload/types.ts`         | SkillCreatorAPIインターフェースの追加     |
| 3    | `pnpm typecheck` 実行                       | 型整合性の検証                            |

3ファイルを同一コミットで更新する。

### ステップ5: エラーハンドリング設計

#### 5-1. エラーパターン分類

| エラーパターン      | 発生条件                      | エラーコード | リトライ可否 |
| ------------------- | ----------------------------- | ------------ | ------------ |
| Unauthorized Sender | sender検証失敗                | 1001         | 不可         |
| Invalid Arguments   | Zodバリデーション失敗         | 1002         | 不可         |
| Path Traversal      | パストラバーサル検出          | 1003         | 不可         |
| Service Error       | SkillCreatorService内部エラー | 5001         | 不可         |
| Script Error        | ScriptExecutor実行失敗        | 3001         | 可能         |

#### 5-2. エラーサニタイズ関数

`sanitizeError` 関数は以下のルールでエラーメッセージを変換する:

| 入力パターン                  | 出力                                                     |
| ----------------------------- | -------------------------------------------------------- |
| Zodのバリデーションエラー     | バリデーションエラーメッセージをそのまま返却             |
| パストラバーサルエラー        | `"Path traversal detected"` を返却                       |
| sender検証エラー              | `"Unauthorized IPC sender"` を返却                       |
| SkillCreatorService内部エラー | `"An internal error occurred. Please try again."` を返却 |
| その他の例外                  | `"An unexpected error occurred."` を返却                 |

スタックトレース、ファイルパス、モジュール名は返却メッセージに含めない。

#### 5-3. 共通エラーラッパー関数

`handleWithErrorBoundary<T>` 関数が以下の処理を実行する:

| ステップ | 処理                        | 成功時                       | 失敗時                                         |
| -------- | --------------------------- | ---------------------------- | ---------------------------------------------- |
| 1        | validateIpcSenderを呼び出す | 次のステップへ               | `{ success: false, error: "Unauthorized..." }` |
| 2        | handler関数を実行する       | `{ success: true, data: T }` | `{ success: false, error: sanitizeError(e) }`  |

#### 5-4. 進捗通知のエラーハンドリング

`mainWindow.webContents.send` による進捗通知送信時、mainWindowが破棄されている場合は送信をスキップする。`mainWindow.isDestroyed()` で事前チェックを行う。

---

## 統合テスト連携【必須】

### 統合ポイント

| 統合ポイント              | 検証内容                                                       |
| ------------------------- | -------------------------------------------------------------- |
| Renderer→Preload          | safeInvokeがホワイトリスト検証後にipcRenderer.invokeを呼ぶこと |
| Preload→Main              | ipcMain.handleがチャンネル名でハンドラーにルーティングすること |
| Main→SkillCreatorService  | ハンドラーがサービスメソッドに正しい引数を渡すこと             |
| Main→Renderer（進捗通知） | webContents.sendがsafeOnリスナーに到達すること                 |

### 契約定義

| チャンネル                      | 引数型                | 戻り値型                                 |
| ------------------------------- | --------------------- | ---------------------------------------- |
| `skill-creator:detect-mode`     | `string`              | `IpcResult<SkillCreatorMode>`            |
| `skill-creator:create`          | `CreateSkillOptions`  | `IpcResult<string>`                      |
| `skill-creator:execute-tasks`   | `ExecuteTasksOptions` | `IpcResult<ExecutionReport>`             |
| `skill-creator:validate`        | `string`              | `IpcResult<boolean>`                     |
| `skill-creator:validate-schema` | `string, unknown`     | `IpcResult<boolean>`                     |
| `skill-creator:progress`        | -                     | `SkillCreatorProgress`（イベントデータ） |

---

## 多角的チェック観点（AIが判断）

### 汎用チェック観点

| 観点          | チェック内容                                             | 判定基準                                 |
| ------------- | -------------------------------------------------------- | ---------------------------------------- |
| Pattern 3準拠 | ハンドラー登録がmainWindow+serviceパターンに従っているか | arch-ipc-persistence.mdのPattern 3と一致 |
| 命名一貫性    | チャンネル名が既存のskill:\*パターンと一貫しているか     | `skill-creator:*` プレフィックスで統一   |
| DI設計        | SkillCreatorServiceがConstructor Injectionで注入可能か   | テスト時にモック差し替え可能             |
| 型安全性      | 全引数・戻り値にTypeScript型が定義されているか           | `@repo/shared/types`で一元管理           |

### Electron固有チェック観点

| 観点               | チェック内容                                           | 判定基準                       |
| ------------------ | ------------------------------------------------------ | ------------------------------ |
| ハードコード文字列 | チャンネル名に文字列リテラルを使用していないか         | 全箇所でIPC_CHANNELS定数を参照 |
| sender検証位置     | validateIpcSenderがハンドラーの先頭で呼ばれるか        | 5ハンドラー全ての先頭に配置    |
| エラー漏洩         | スタックトレース、ファイルパスがRendererに渡されないか | sanitizeError関数で除去        |
| mainWindow破棄     | 進捗通知時にmainWindowの生存を確認しているか           | isDestroyed()チェックを実施    |

---

## 既知のPitfall

| Pitfall ID | 内容                      | 設計での対策                                                                           |
| ---------- | ------------------------- | -------------------------------------------------------------------------------------- |
| P23        | API二重定義の型管理       | `window.electronAPI.skillCreator` のみに公開し、別経路を作成しない                     |
| P27        | Preloadハードコード文字列 | skill-creator-api.tsとskillCreatorHandlers.tsの両方でIPC_CHANNELS定数を使用            |
| P32        | 型定義の二箇所同時更新    | `packages/shared/src/types/skillCreator.ts` と `preload/types.ts` を同一コミットで更新 |
| P34        | 遅延初期化DI              | SkillCreatorServiceはmainWindow不要のため、registerAllIpcHandlers内でnewして即座に渡す |

---

## 成果物

| 成果物             | パス                                                                         | 説明                                            |
| ------------------ | ---------------------------------------------------------------------------- | ----------------------------------------------- |
| アーキテクチャ設計 | `docs/30-workflows/skill-creator-ipc/outputs/phase-2/architecture-design.md` | ハンドラー構造、Preload API、型定義、DI設計     |
| API仕様書          | `docs/30-workflows/skill-creator-ipc/outputs/phase-2/api-specification.md`   | チャンネル仕様、Zodスキーマ、エラーハンドリング |
| 統合ポイント定義   | `docs/30-workflows/skill-creator-ipc/outputs/phase-2/integration-points.md`  | Renderer-Preload-Main間の契約定義               |

---

## 完了条件

- [ ] 6チャンネルの定数名、文字列値、挿入位置を確定した
- [ ] 5チャンネルをALLOWED_INVOKE_CHANNELS、1チャンネルをALLOWED_ON_CHANNELSへの登録位置を確定した
- [ ] registerSkillCreatorHandlers/unregisterSkillCreatorHandlersの関数シグネチャを確定した
- [ ] 5ハンドラーの4ステップ処理フロー（sender検証→引数検証→サービス呼出→レスポンス返却）を確定した
- [ ] 5つのZodバリデーションスキーマの制約を確定した
- [ ] skillDirパラメータのパストラバーサル対策（4ステップ検証）を確定した
- [ ] SkillCreatorAPIオブジェクトの6メソッド（safeInvoke 5個 + safeOn 1個）を確定した
- [ ] contextBridge統合ポイント（window.electronAPI.skillCreator）を確定した
- [ ] SkillCreatorProgress型、IpcResult型の定義場所と内容を確定した
- [ ] 型定義2箇所同時更新計画（P32対策）を文書化した
- [ ] エラーパターン5種類の分類とサニタイズルールを確定した
- [ ] 共通エラーラッパー関数（handleWithErrorBoundary）を設計した
- [ ] registerAllIpcHandlersへの統合方法（インポート、インスタンス生成、呼び出し）を確定した
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

TodoWriteで以下のサブタスクを作成し、進捗を管理する:

1. `[Phase2-T1] チャンネル設計（IPC_CHANNELS定数、ホワイトリスト登録）`
2. `[Phase2-T2] ハンドラー設計（関数シグネチャ、4ステップフロー、Zodスキーマ）`
3. `[Phase2-T3] Preload API設計（skill-creator-api.ts、contextBridge統合）`
4. `[Phase2-T4] 型定義設計（SkillCreatorAPI、SkillCreatorProgress、IpcResult）`
5. `[Phase2-T5] エラーハンドリング設計（パターン分類、サニタイズ関数、ラッパー）`
6. `[Phase2-T6] 成果物の生成（architecture-design.md, api-specification.md, integration-points.md）`

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

---

## 次のPhase

Phase 3: 設計レビュー

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-creator-ipc/phase-3-design-review.md`
