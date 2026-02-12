# Phase 1: 要件定義

## メタ情報

| 項目     | 値                          |
| -------- | --------------------------- |
| Phase    | 1                           |
| 機能名   | skill-creator-ipc           |
| タスクID | TASK-9B-H-SKILL-CREATOR-IPC |
| 作成日   | 2026-02-12                  |
| 次Phase  | Phase 2: 設計               |

---

## 目的

SkillCreatorServiceの5メソッド（detectMode, createSkill, executeTasks, validateSkill, validateWithSchema）をIPC経由でRendererプロセスから呼び出し可能にするための機能要件・非機能要件を定義し、10項目の受け入れ基準を確定する。

---

## 実行タスク

- タスク1 要件抽出: SkillCreatorServiceの5メソッドをIPC化するための機能要件と影響範囲を特定する
- タスク2 受け入れ基準作成: AC-01からAC-10の受け入れ基準を定義し、テスト可能な形式で記述する
- タスク3 FR/NFR分類: 機能要件（FR）と非機能要件（NFR）を分類し、優先度を決定する

---

## 参照資料

| 資料名                    | パス                                                                              | 説明                                                                                                 |
| ------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| スキル実行IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | validatePath 4ステップ検証、safeInvoke/safeOnパターン、3層セキュリティレイヤー                       |
| Agent SDK Skill仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | SkillCreatorService API仕様、統一API 13メソッド、SkillCreatorMode型定義                              |
| IPC・永続化パターン       | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`       | Pattern 3（mainWindow+service）、registerAllIpcHandlers 7ステップ登録、新規ハンドラー追加手順        |
| Electron IPCセキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | BrowserWindow必須設定、IPC sender検証3ステップ（webContents確認、DevTools拒否、Window照合）、CSP     |
| Agent Dashboard IPC       | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | 既存Agent Dashboard IPCチャンネル一覧（命名一貫性の参照用）                                          |
| 既存channels.ts           | `apps/desktop/src/preload/channels.ts`                                            | 現在のIPC_CHANNELS定数定義、ALLOWED_INVOKE_CHANNELS、ALLOWED_ON_CHANNELS                             |
| SkillCreatorService       | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                     | IPC化対象の5メソッド（detectMode, createSkill, executeTasks, validateSkill, validateWithSchema）実装 |
| IPC登録エントリポイント   | `apps/desktop/src/main/ipc/index.ts`                                              | registerAllIpcHandlers関数（全ハンドラー統合ポイント）                                               |

---

## 実行手順

### ステップ1: SkillCreatorServiceの公開API分析

1. `apps/desktop/src/main/services/skill/SkillCreatorService.ts` を読み込む
2. 5つの公開メソッドの引数型と戻り値型を列挙する:
   - `detectMode(request: string): Promise<SkillCreatorMode>`
   - `createSkill(options: CreateSkillOptions): Promise<string>`
   - `executeTasks(options: ExecuteTasksOptions): Promise<ExecutionReport>`
   - `validateSkill(skillDir: string): Promise<boolean>`
   - `validateWithSchema(schemaName: string, data: unknown): Promise<boolean>`
3. 各メソッドが依存する型定義（`@repo/shared/types`のSkillCreatorMode, CreateSkillOptions, ExecuteTasksOptions, ExecutionReport, TaskResult, TaskSpec, ExecutionSummary）を確認する

### ステップ2: IPCチャンネル要件の定義

6つのIPCチャンネルを定義する。既存channels.tsのフラットキー形式に合わせて`SKILL_CREATOR_`プレフィックスで定数名を付与する。

| チャンネル名                    | IPC_CHANNELS定数名              | 方向 | 対応メソッド       |
| ------------------------------- | ------------------------------- | ---- | ------------------ |
| `skill-creator:detect-mode`     | `SKILL_CREATOR_DETECT_MODE`     | R→M  | detectMode         |
| `skill-creator:create`          | `SKILL_CREATOR_CREATE`          | R→M  | createSkill        |
| `skill-creator:execute-tasks`   | `SKILL_CREATOR_EXECUTE_TASKS`   | R→M  | executeTasks       |
| `skill-creator:validate`        | `SKILL_CREATOR_VALIDATE`        | R→M  | validateSkill      |
| `skill-creator:validate-schema` | `SKILL_CREATOR_VALIDATE_SCHEMA` | R→M  | validateWithSchema |
| `skill-creator:progress`        | `SKILL_CREATOR_PROGRESS`        | M→R  | 進捗通知           |

### ステップ3: セキュリティ要件の抽出

1. security-skill-ipc.mdからsafeInvoke/safeOnパターンの適用要件を抽出する
   - safeInvoke: チャンネルがALLOWED_INVOKE_CHANNELSに含まれるか検証してからipcRenderer.invoke()を実行
   - safeOn: チャンネルがALLOWED_ON_CHANNELSに含まれるか検証してからipcRenderer.on()でリスナー登録
2. security-electron-ipc.mdからsender検証3ステップの要件を抽出する
   - ステップ1: webContentsに対応するBrowserWindowの存在確認
   - ステップ2: DevToolsからの呼び出し検出・拒否
   - ステップ3: 許可されたウィンドウリストとの照合
3. 引数バリデーション（Zodスキーマ）の要件を定義する

### ステップ4: 受け入れ基準の作成

AC-01からAC-10を作成する（本仕様書の受け入れ基準セクション参照）。

### ステップ5: FR/NFR分類

機能要件と非機能要件を分類し、優先度（P0: 必須、P1: 重要、P2: 推奨）を付与する。

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

## 機能要件（FR）

| ID    | 要件                                            | 優先度 |
| ----- | ----------------------------------------------- | ------ |
| FR-01 | detectModeをIPC経由で呼び出し可能にする         | P0     |
| FR-02 | createSkillをIPC経由で呼び出し可能にする        | P0     |
| FR-03 | executeTasksをIPC経由で呼び出し可能にする       | P0     |
| FR-04 | validateSkillをIPC経由で呼び出し可能にする      | P0     |
| FR-05 | validateWithSchemaをIPC経由で呼び出し可能にする | P0     |
| FR-06 | 進捗通知をMain→Renderer方向で送信する           | P1     |
| FR-07 | Preload APIに `skillCreator` 名前空間を追加する | P0     |
| FR-08 | 全チャンネルをIPC_CHANNELS定数で一元管理する    | P0     |

## 非機能要件（NFR）

| ID     | 要件                                                     | 優先度 |
| ------ | -------------------------------------------------------- | ------ |
| NFR-01 | 全ハンドラーでvalidateIpcSender検証を実行する            | P0     |
| NFR-02 | 全ハンドラーでZodスキーマによる引数検証を実行する        | P0     |
| NFR-03 | エラーメッセージをサニタイズしてRendererに返す           | P0     |
| NFR-04 | 内部例外のスタックトレースをRendererに送信しない         | P0     |
| NFR-05 | safeInvoke/safeOnパターンでホワイトリスト検証を実行する  | P0     |
| NFR-06 | Line Coverage 80%以上、Branch Coverage 60%以上を達成する | P0     |
| NFR-07 | 既存skill:\*チャンネルとの命名一貫性を維持する           | P1     |
| NFR-08 | skillDirパラメータにパストラバーサル攻撃対策を実装する   | P0     |

---

## 統合テスト連携【必須】

### IPC通信要件（6チャンネル）

| チャンネル                      | 方向 | テスト観点                                             |
| ------------------------------- | ---- | ------------------------------------------------------ |
| `skill-creator:detect-mode`     | R→M  | 文字列リクエストを送信し、SkillCreatorModeが返ること   |
| `skill-creator:create`          | R→M  | CreateSkillOptionsを送信し、パス文字列が返ること       |
| `skill-creator:execute-tasks`   | R→M  | ExecuteTasksOptionsを送信し、ExecutionReportが返ること |
| `skill-creator:validate`        | R→M  | パス文字列を送信し、booleanが返ること                  |
| `skill-creator:validate-schema` | R→M  | スキーマ名とデータを送信し、booleanが返ること          |
| `skill-creator:progress`        | M→R  | 進捗イベントがRenderer側で受信可能であること           |

### 認証フロー

本タスクでは認証は不要。SkillCreatorServiceはローカルファイル操作のみを実行する。

### データフロー

Renderer → Preload（safeInvoke）→ Main（ipcMain.handle）→ SkillCreatorService → FileSystem の順でリクエストが伝搬する。進捗通知は Main（webContents.send）→ Preload（safeOn）→ Renderer の逆方向で伝搬する。

---

## 多角的チェック観点（AIが判断）

### 汎用チェック観点

| 観点         | チェック内容                                       | 判定基準                               |
| ------------ | -------------------------------------------------- | -------------------------------------- |
| 要件の完全性 | 5メソッド全てのIPC化要件が定義されているか         | 全5メソッドがカバーされている          |
| 要件の一貫性 | 既存skill:\*チャンネルとの命名パターンが一致するか | `skill-creator:*` プレフィックスで統一 |
| テスト可能性 | 全受け入れ基準がテストコードで検証可能か           | 自動テストで100%検証可能               |
| 型安全性     | 引数型と戻り値型が`@repo/shared`で共有されているか | 型定義が`@repo/shared/types`に一元化   |

### Electron固有チェック観点

| 観点             | チェック内容                                                   | 判定基準                           |
| ---------------- | -------------------------------------------------------------- | ---------------------------------- |
| sender検証       | 全ハンドラーでvalidateIpcSenderが呼ばれるか                    | 5ハンドラー全てで実行              |
| ホワイトリスト   | 全チャンネルがALLOWED\_\*\_CHANNELSに登録されるか              | invoke: 5個、on: 1個が登録済み     |
| エラーサニタイズ | スタックトレースがRendererに漏洩しないか                       | エラーメッセージのみ返却           |
| contextBridge    | Preload APIがcontextBridge.exposeInMainWorld経由で公開されるか | 直接window割り当てを使用していない |

---

## 既知のPitfall

| Pitfall ID | 内容                      | 対策                                                                          |
| ---------- | ------------------------- | ----------------------------------------------------------------------------- |
| P23        | API二重定義の型管理       | `window.electronAPI.skillCreator` に統一し、二重定義を作成しない              |
| P27        | Preloadハードコード文字列 | 全チャンネル名をIPC_CHANNELS定数で参照する                                    |
| P32        | 型定義の二箇所同時更新    | `packages/shared/src/types` と `apps/desktop/src/preload/types.ts` を同時更新 |
| P34        | 遅延初期化DI              | SkillCreatorServiceはmainWindow不要のためConstructor Injectionを使用          |

---

## 影響ファイル

| ファイル                                            | 変更内容                                                          |
| --------------------------------------------------- | ----------------------------------------------------------------- |
| `apps/desktop/src/preload/channels.ts`              | IPC*CHANNELSにSKILL_CREATOR*\*定数6個追加、ホワイトリスト登録     |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` | 新規ファイル: registerSkillCreatorHandlers関数（5ハンドラー登録） |
| `apps/desktop/src/main/ipc/index.ts`                | registerSkillCreatorHandlers呼び出しとSkillCreatorService生成追加 |
| `apps/desktop/src/preload/skill-creator-api.ts`     | 新規ファイル: skillCreatorAPI定義（safeInvoke/safeOn使用）        |
| `apps/desktop/src/preload/types.ts`                 | SkillCreatorAPI型定義追加                                         |

---

## 成果物

| 成果物           | パス                                                                     | 説明                                |
| ---------------- | ------------------------------------------------------------------------ | ----------------------------------- |
| 要件定義書       | `docs/30-workflows/skill-creator-ipc/outputs/phase-1/requirements.md`    | 要件抽出結果、AC-01からAC-10        |
| FR/NFR分類表     | `docs/30-workflows/skill-creator-ipc/outputs/phase-1/fr-nfr.md`          | 機能要件8項目、非機能要件8項目      |
| 影響ファイル一覧 | `docs/30-workflows/skill-creator-ipc/outputs/phase-1/impact-analysis.md` | 影響ファイル5個の変更内容と依存関係 |

---

## 完了条件

- [ ] SkillCreatorServiceの5メソッドの引数型と戻り値型を全て列挙した
- [ ] 6つのIPCチャンネル名と定数名の対応表を作成した
- [ ] AC-01からAC-10の受け入れ基準を定義した
- [ ] FR-01からFR-08の機能要件を分類した
- [ ] NFR-01からNFR-08の非機能要件を分類した
- [ ] sender検証、引数検証、ホワイトリスト検証の3層セキュリティ要件を定義した
- [ ] safeInvoke/safeOnパターンの適用要件を定義した
- [ ] 影響ファイル5個の変更内容を特定した
- [ ] 既存skill:\*チャンネルとの命名一貫性を確認した
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

TodoWriteで以下のサブタスクを作成し、進捗を管理する:

1. `[Phase1-T1] SkillCreatorServiceの公開API分析`
2. `[Phase1-T2] IPCチャンネル要件の定義（6チャンネル）`
3. `[Phase1-T3] セキュリティ要件の抽出（sender検証、引数検証、ホワイトリスト）`
4. `[Phase1-T4] 受け入れ基準AC-01からAC-10の作成`
5. `[Phase1-T5] FR/NFR分類と優先度付与`
6. `[Phase1-T6] 成果物の生成（requirements.md, fr-nfr.md, impact-analysis.md）`

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

---

## 次のPhase

Phase 2: 設計

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-creator-ipc/phase-2-design.md`
