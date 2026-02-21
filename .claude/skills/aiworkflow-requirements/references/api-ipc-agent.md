# Agent Dashboard・Workspace Chat Edit IPC

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [api-endpoints.md](./api-endpoints.md)

---

## Agent Dashboard IPC チャネル

Electronデスクトップアプリでは、IPC通信でスキル管理・エージェント実行機能を提供する。

**実装ファイル**:

- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- 型定義: `apps/desktop/src/renderer/store/slices/agentSlice.ts`
- 設計書: `docs/30-workflows/agent-dashboard-foundation/outputs/phase-2/ipc-channel-design.md`

### チャンネル一覧

| チャネル               | 方向            | 用途               | Request                     | Response                |
| ---------------------- | --------------- | ------------------ | --------------------------- | ----------------------- |
| `agent:get-skills`     | Renderer → Main | スキル一覧取得     | なし                        | `{ skills: Skill[] }`   |
| `agent:get-skill-detail` | Renderer → Main | スキル詳細取得   | `{ skillId: string }`       | `{ skill: SkillDetail }`|
| `agent:execute`        | Renderer → Main | エージェント実行   | `ExecuteRequest`            | `{ executionId: string }` |
| `agent:abort`          | Renderer → Main | 実行中断           | `{ executionId: string }`   | `{ success: boolean }`  |
| `agent:get-status`     | Renderer → Main | ステータス取得     | なし                        | `GetStatusResponse`     |
| `agent:status-changed` | Main → Renderer | ステータス変更通知 | -                           | `StatusChangedEvent`    |
| `agent:stream-chunk`   | Main → Renderer | 出力ストリーム     | -                           | `StreamChunkEvent`      |
| `agent:stream-end`     | Main → Renderer | ストリーム終了     | -                           | `StreamEndEvent`        |
| `agent:stream-error`   | Main → Renderer | エラー通知         | -                           | `StreamErrorEvent`      |

### 型定義

| 型名           | 説明                     |
| -------------- | ------------------------ |
| `Skill`        | スキル基本情報           |
| `SkillDetail`  | スキル詳細（Anchor含む） |
| `Anchor`       | 参照文献・適用方法       |
| `AgentState`   | Zustand状態              |
| `AgentActions` | Zustandアクション        |

### Skill型

| プロパティ    | 型         | 説明                   |
| ------------- | ---------- | ---------------------- |
| `id`          | `string`   | 一意識別子             |
| `name`        | `string`   | スキル名               |
| `description` | `string`   | 説明文                 |
| `path`        | `string`   | スキルファイルパス     |
| `triggers`    | `string[]` | トリガーキーワード     |
| `category`    | `string?`  | カテゴリ（任意）       |

### Anchor型

| プロパティ    | 型       | 説明               |
| ------------- | -------- | ------------------ |
| `source`      | `string` | 参照元（書籍等）   |
| `application` | `string` | 適用方法           |
| `purpose`     | `string` | 目的               |

### 実装状況

| 項目                 | 状態   | タスク    |
| -------------------- | ------ | --------- |
| チャネル定数定義     | 完了   | AGENT-001 |
| ホワイトリスト追加   | 完了   | AGENT-001 |
| Zustand agentSlice   | 完了   | AGENT-001 |
| AgentView UI         | 完了   | AGENT-001 |
| IPCハンドラー実装    | 未実装 | AGENT-005 |
| Preload API実装      | 未実装 | AGENT-002 |

---

## Workspace Chat Edit IPC チャネル

Electronデスクトップアプリでは、IPC通信でワークスペースチャット編集機能を提供する。
AIによるコード編集支援（ファイルコンテキスト付きチャット、差分生成・適用）を実現する。

**実装ファイル**:

- 型定義: `apps/desktop/src/renderer/features/workspace-chat-edit/types/index.ts`
- Slice: `apps/desktop/src/renderer/features/workspace-chat-edit/store/chatEditSlice.ts`
- Hooks: `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/`
- テスト: `apps/desktop/src/renderer/features/workspace-chat-edit/__tests__/`

### チャンネル一覧

| チャネル                      | 方向            | 用途                     | Request                                                          | Response                       |
| ----------------------------- | --------------- | ------------------------ | ---------------------------------------------------------------- | ------------------------------ |
| `chat-edit:read-file`         | Renderer → Main | ファイル内容読み込み     | `{ filePath: string, workspacePath?: string \| null }`           | `IPCResponse<FileContext>`     |
| `chat-edit:write-file`        | Renderer → Main | ファイル書き込み         | `{ filePath, content, workspacePath?: string \| null }`          | `IPCResponse<void>`            |
| `chat-edit:get-selection`     | Renderer → Main | エディタ選択範囲取得     | なし                                                             | `IPCResponse<TextSelection>`   |
| `chat-edit:send-with-context` | Renderer → Main | コンテキスト付きチャット | `{ contexts: FileContext[], command: EditCommand }`              | `IPCResponse<GeneratedResult>` |

**workspacePathパラメータ（v1.2.0追加）**: 指定時はワークスペース内のファイルのみアクセス許可。外部アクセス時は`PERMISSION_DENIED`エラー。

### 型定義

#### FileContext（ファイルコンテキスト）

チャット編集で参照するファイル情報を保持する。最大10件まで添付可能。

| プロパティ  | 型              | 必須 | 説明                           |
| ----------- | --------------- | ---- | ------------------------------ |
| id          | string          | ○    | 一意識別子                     |
| filePath    | string          | ○    | ファイルの絶対パス             |
| fileName    | string          | ○    | ファイル名                     |
| content     | string          | ○    | ファイル内容                   |
| language    | string          | ○    | プログラミング言語（例: typescript） |
| selection   | TextSelection   | -    | 選択範囲（任意）               |
| addedAt     | number          | ○    | 追加日時（UNIXタイムスタンプ） |

#### TextSelection（テキスト選択範囲）

エディタ上で選択されたテキスト範囲を表現する。

| プロパティ    | 型     | 必須 | 説明                 |
| ------------- | ------ | ---- | -------------------- |
| startLine     | number | ○    | 開始行番号           |
| endLine       | number | ○    | 終了行番号           |
| startColumn   | number | ○    | 開始列番号           |
| endColumn     | number | ○    | 終了列番号           |
| selectedText  | string | ○    | 選択されたテキスト   |

#### EditCommand（編集コマンド）

AIに送信する編集指示を定義する。

| プロパティ   | 型       | 必須 | 説明                                     |
| ------------ | -------- | ---- | ---------------------------------------- |
| instruction  | string   | ○    | 編集指示テキスト                         |
| targetFiles  | string[] | ○    | 対象ファイルパスの配列                   |
| mode         | string   | ○    | 編集モード（generate / edit / refactor） |

**mode値の説明**:
- **generate**: 新規コード生成
- **edit**: 既存コードの修正
- **refactor**: リファクタリング

#### GeneratedResult（生成結果）

AIによるコード生成・編集の結果を保持する。

| プロパティ        | 型         | 必須 | 説明                                       |
| ----------------- | ---------- | ---- | ------------------------------------------ |
| id                | string     | ○    | 結果の一意識別子                           |
| originalContent   | string     | ○    | 編集前の元コンテンツ                       |
| generatedContent  | string     | ○    | 生成されたコンテンツ                       |
| diff              | DiffHunk[] | ○    | 差分ハンクの配列                           |
| status            | string     | ○    | 状態（pending / applied / rejected）       |
| createdAt         | number     | ○    | 作成日時（UNIXタイムスタンプ）             |

**status値の説明**:
- **pending**: 適用待ち
- **applied**: 適用済み
- **rejected**: 却下済み

#### DiffHunk（差分ハンク）

統一差分形式の1ブロックを表現する。

| プロパティ | 型       | 必須 | 説明                       |
| ---------- | -------- | ---- | -------------------------- |
| oldStart   | number   | ○    | 変更前の開始行番号         |
| oldLines   | number   | ○    | 変更前の行数               |
| newStart   | number   | ○    | 変更後の開始行番号         |
| newLines   | number   | ○    | 変更後の行数               |
| lines      | string[] | ○    | 差分行の配列（+/-/空白付き）|

### 定数

| 定数名            | 値      | 説明                       |
| ----------------- | ------- | -------------------------- |
| MAX_FILE_CONTEXTS | 10      | 最大添付ファイル数         |
| MAX_FILE_SIZE     | 10MB    | ファイルサイズ上限         |
| MAX_CONTEXT_SIZE  | 100KB   | コンテキストサイズ上限     |

### 関連Hooks

| Hook名           | 責務                               |
| ---------------- | ---------------------------------- |
| useFileContext   | ファイルコンテキスト管理（追加/削除/バリデーション） |
| useDiffApply     | 差分適用ロジック（LCS、適用/却下/Undo）            |

### 実装状況

| 項目               | 状態     | 備考                              |
| ------------------ | -------- | --------------------------------- |
| 型定義             | 完了     | types/index.ts                    |
| chatEditSlice      | 完了     | Zustand状態管理                   |
| useFileContext     | 完了     | ファイルコンテキストHook          |
| useDiffApply       | 完了     | 差分適用Hook                      |
| UIコンポーネント   | 未実装   | 別タスク（task-workspace-chat-edit-ui-components） |
| Main Processサービス | **完了** | FileService, ContextBuilder, ChatEditService |
| IPCハンドラー      | **完了** | chatEditHandlers.ts               |
| get-selection実装  | **完了** | Monaco Editor選択範囲取得（TASK-WCE-MONACO-001） |

---

## 完了タスク

### Workspace Chat Edit Main Process（2026-01-25完了）

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | TASK-WCE-MAIN-001                                              |
| Issue        | #469                                                           |
| ステータス   | **完了**                                                       |
| 実装内容     | FileService, ContextBuilder, ChatEditService, chatEditHandlers |
| テスト数     | 164（自動）+ 23（手動検証項目）                                |
| カバレッジ   | Line 92.55%, Branch 92.85%                                     |
| ドキュメント | `docs/30-workflows/workspace-chat-edit-main-process/`          |

### Workspace管理統合（TASK-WCE-WORKSPACE-001）2026-02-02完了

| 項目         | 内容                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| タスクID     | TASK-WCE-WORKSPACE-001                                                                  |
| Issue        | #660                                                                                    |
| ステータス   | **完了**                                                                                |
| 実装内容     | workspacePathパラメータ追加、isWithinWorkspace検証、folderFileTreesからファイル一覧取得 |
| 修正ファイル | chatEditHandlers.ts, useFileContext.ts, fileTreeUtils.ts（新規）                        |
| テスト数     | 45（ユニット＋統合）                                                                    |
| カバレッジ   | Line 95%, Branch 90%, Function 100%                                                     |
| ドキュメント | `docs/30-workflows/TASK-WCE-WORKSPACE-001/`                                             |

### Monaco Editor選択範囲取得（TASK-WCE-MONACO-001）2026-02-03完了

| 項目         | 内容                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| タスクID     | TASK-WCE-MONACO-001                                                           |
| ステータス   | **完了**                                                                      |
| 実装内容     | Monaco Editorの選択範囲をMain Processから取得するAPI実装                      |
| 新規ファイル | editorSelection.ts（Renderer）、chatEditHandlers.selection.test.ts（テスト）  |
| 修正ファイル | chatEditHandlers.ts、index.ts                                                 |
| テスト数     | 26（editorSelection: 14、chatEditHandlers.selection: 12）                     |
| カバレッジ   | Line 100%, Branch 100%                                                        |
| ドキュメント | `docs/30-workflows/TASK-WCE-MONACO-001/outputs/`                              |

**テスト結果サマリー**:

| テストファイル                     | テスト数 | 成功 | 失敗 | 時間  |
| ---------------------------------- | -------- | ---- | ---- | ----- |
| editorSelection.test.ts            | 14       | 14   | 0    | 51ms  |
| chatEditHandlers.selection.test.ts | 12       | 12   | 0    | 202ms |

**成果物テーブル**:

| Phase | 成果物                   | ファイル                    |
| ----- | ------------------------ | --------------------------- |
| 1     | 要件定義書               | requirements-definition.md  |
| 1     | 受け入れ基準             | acceptance-criteria.md      |
| 1     | スコープ定義             | scope-definition.md         |
| 2     | アーキテクチャ設計       | architecture-design.md      |
| 2     | API設計                  | api-design.md               |
| 2     | シーケンス図             | sequence-diagram.md         |
| 3     | 設計レビュー結果         | design-review-result.md     |
| 4     | テスト仕様書             | test-specification.md       |
| 4     | テストケース一覧         | test-cases.md               |
| 4     | 統合テスト設計           | integration-test-design.md  |
| 5     | 実装サマリー             | implementation-summary.md   |
| 6     | テスト拡充レポート       | test-enhancement-report.md  |
| 7     | カバレッジレポート       | coverage-report.md          |
| 8     | リファクタリングレポート | refactoring-report.md       |
| 9     | 品質保証レポート         | qa-report.md                |
| 10    | 最終レビュー結果         | final-review.md             |
| 11    | 手動テスト手順書         | manual-test-procedure.md    |
| 12    | ドキュメント更新         | documentation-update.md     |

---

## Skill Creator IPC チャネル

Electronデスクトップアプリでは、IPC通信でスキル作成・管理機能を提供する。
SkillCreatorServiceと連携し、スキルの自動判定・作成・タスク実行・検証を行う。

**実装ファイル**:

- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- IPCハンドラー: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- Preload API: `apps/desktop/src/preload/skill-creator-api.ts`
- 型定義: `apps/desktop/src/preload/types.ts`

### チャンネル一覧

| チャネル                        | 方向            | 用途               | Request                                    | Response                       |
| ------------------------------- | --------------- | ------------------ | ------------------------------------------ | ------------------------------ |
| `skill-creator:detect-mode`     | Renderer → Main | モード自動判定     | `{ request: string }`                      | `IpcResult<SkillCreatorMode>`  |
| `skill-creator:create`          | Renderer → Main | スキル新規作成     | `CreateSkillOptions`                       | `IpcResult<string>`            |
| `skill-creator:execute-tasks`   | Renderer → Main | タスク群実行       | `ExecuteTasksOptions`                      | `IpcResult<ExecutionReport>`   |
| `skill-creator:validate`        | Renderer → Main | スキル検証         | `{ skillDir: string }`                     | `IpcResult<boolean>`           |
| `skill-creator:validate-schema` | Renderer → Main | スキーマ検証       | `{ schemaName: string; data: unknown }`    | `IpcResult<boolean>`           |
| `skill-creator:progress`        | Main → Renderer | 進捗通知           | -                                          | `SkillCreatorProgress`         |

### 型定義

| 型名                   | 説明                                 |
| ---------------------- | ------------------------------------ |
| `IpcResult<T>`         | IPC統一レスポンス型（success/error） |
| `SkillCreatorMode`     | 作成モード列挙値                     |
| `CreateSkillOptions`   | スキル作成オプション                 |
| `ExecuteTasksOptions`  | タスク実行オプション                 |
| `ExecutionReport`      | タスク実行レポート                   |
| `SkillCreatorProgress` | 進捗通知データ                       |
| `SkillCreatorAPI`      | Preload APIインターフェース          |

### SkillCreatorProgress型

| プロパティ  | 型       | 説明                           |
| ----------- | -------- | ------------------------------ |
| `phase`     | `string` | 現在のフェーズ名               |
| `taskIndex` | `number` | 現在のタスクインデックス（0始まり） |
| `totalTasks`| `number` | 総タスク数                     |
| `message`   | `string` | 進捗メッセージ                 |
| `timestamp` | `number` | タイムスタンプ（ミリ秒）       |

### 実装状況

| 項目                      | 状態   | タスク                      |
| ------------------------- | ------ | --------------------------- |
| チャネル定数定義          | 完了   | TASK-9B-H-SKILL-CREATOR-IPC |
| ホワイトリスト追加        | 完了   | TASK-9B-H-SKILL-CREATOR-IPC |
| IPCハンドラー実装         | 完了   | TASK-9B-H-SKILL-CREATOR-IPC |
| Preload API実装           | 完了   | TASK-9B-H-SKILL-CREATOR-IPC |
| Sender検証（全ハンドラー）| 完了   | TASK-9B-H-SKILL-CREATOR-IPC |
| エラーサニタイズ          | 完了   | UT-9B-H-003                 |
| パストラバーサル検証      | 完了   | UT-9B-H-003                 |
| schemaNameホワイトリスト検証 | 完了 | UT-9B-H-003                 |

### セキュリティ強化仕様（UT-9B-H-003）

`skillCreatorHandlers.ts` では、全invokeハンドラーで以下の防御を実施する。

| 対策 | 実装 | 返却仕様 |
| ---- | ---- | -------- |
| パストラバーサル対策 | `validatePath(inputPath, paramName)` | 不正時: `"無効なパスが指定されました: <paramName>"` |
| スキーマ名ホワイトリスト | `ALLOWED_SCHEMA_NAMES = ['task-spec','skill-spec','mode']` | 不正時: `"無効なスキーマ名が指定されました: <schemaName>"` |
| エラー情報マスキング | `sanitizeErrorMessage(error)` | 非Error時: `"スキル作成処理でエラーが発生しました"` |

---

## 実装パターン参照

> **Progressive Disclosure**: 実装時に参照すべきパターンドキュメント

| 実装課題 | 参照パターン | ドキュメント |
|----------|-------------|--------------|
| Main→Renderer状態取得 | webContents.executeJavaScript逆方向クエリ | [architecture-implementation-patterns.md](./architecture-implementation-patterns.md#main→renderer逆方向クエリパターンtask-wce-monaco-001-2026-02-03実装) |
| IPC通信テスト | Handler Map方式、Partial Mock | [architecture-implementation-patterns.md](./architecture-implementation-patterns.md#ipc通信テストパターンtask-8c-a-2026-02-02実装) |
| E2Eテスト | Electron E2Eセットアップ | [architecture-implementation-patterns.md](./architecture-implementation-patterns.md#e2eテストパターンtask-8c-c-2026-02-02実装) |

---

## 関連ドキュメント

- [APIエンドポイント概要](./api-endpoints.md)
- [認証・プロフィールIPC](./api-ipc-auth.md)
- [システムIPC・プロバイダーAPI](./api-ipc-system.md)
- [LLM Workspace Chat Edit](./llm-workspace-chat-edit.md)
- [実装パターン総合ガイド](./architecture-implementation-patterns.md)

---

---

## スキルファイル操作 IPC チャネル（TASK-9A-B）

スキルファイルの読み書き・バックアップ・復元操作をIPC経由で提供する。
`SkillFileManager` サービスと連携し、Rendererからファイル操作を安全に実行する。

**実装ファイル**:

- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- IPCハンドラー: `apps/desktop/src/main/ipc/skillFileHandlers.ts`
- Preload API: `apps/desktop/src/preload/skill-api.ts`（`electronAPI.skill` のメソッドとして公開）
- 型定義: `apps/desktop/src/preload/types.ts`

### チャンネル一覧

| チャネル              | 方向            | 用途                 | Request                                                              | Response              |
| --------------------- | --------------- | -------------------- | -------------------------------------------------------------------- | --------------------- |
| `skill:readFile`      | Renderer → Main | ファイル読み込み     | `{ skillName: string, relativePath: string }`                        | `IpcResult<string>`   |
| `skill:writeFile`     | Renderer → Main | ファイル書き込み     | `{ skillName: string, relativePath: string, content: string }`       | `IpcResult<void>`     |
| `skill:createFile`    | Renderer → Main | ファイル新規作成     | `{ skillName: string, relativePath: string, content: string }`       | `IpcResult<void>`     |
| `skill:deleteFile`    | Renderer → Main | ファイル削除         | `{ skillName: string, relativePath: string }`                        | `IpcResult<void>`     |
| `skill:listBackups`   | Renderer → Main | バックアップ一覧取得 | `{ skillName: string }`                                              | `IpcResult<BackupInfo[]>` |
| `skill:restoreBackup` | Renderer → Main | バックアップ復元     | `{ skillName: string, backupPath: string }`                          | `IpcResult<void>`     |

### 型定義

| 型名         | 説明                                           |
| ------------ | ---------------------------------------------- |
| `IpcResult<T>` | IPC統一レスポンス型（`{ success: true; data: T } \| { success: false; error: string }`） |
| `BackupInfo` | バックアップファイル情報（filename, relativePath, originalPath, type, timestamp, createdAt） |

### 実装状況

| 項目                   | 状態   | タスク    |
| ---------------------- | ------ | --------- |
| チャネル定数定義       | 完了   | TASK-9A-B |
| ホワイトリスト追加     | 完了   | TASK-9A-B |
| IPCハンドラー実装      | 完了   | TASK-9A-B |
| Preload API実装        | 完了   | TASK-9A-B |
| Sender検証（全ハンドラー）| 完了 | TASK-9A-B |
| 引数バリデーション     | 完了   | TASK-9A-B |
| エラーサニタイズ       | 完了   | TASK-9A-B |
| isKnownSkillFileError  | 完了   | TASK-9A-B |

### セキュリティ仕様

全6 invokeハンドラーで以下のセキュリティ検証を実施する。

| 対策 | 実装 | 返却仕様 |
| ---- | ---- | -------- |
| Sender検証 | `validateIpcSender(event, mainWindow)` | 不正時: `toIPCValidationError` で返却（例: `"Unauthorized IPC call"`） |
| 引数バリデーション | `typeof` チェック + `.trim()` 空文字列検出 | 不正時: 各エラーメッセージ |
| SkillFileManager内部検証 | `SkillFileManager.validatePath()` によるパストラバーサル検出 | `PathTraversalError` → サニタイズ済みメッセージ |
| エラーサニタイズ | `isKnownSkillFileError(error)` でSkillFileManagerエラーを識別し安全なメッセージを返却 | 不明エラー: `"Internal error"` |

---

## 完了タスク

| タスクID   | タスク名                             | 完了日     | 変更内容                                                                         |
| ---------- | ------------------------------------ | ---------- | -------------------------------------------------------------------------------- |
| UT-FIX-SKILL-IMPORT-INTERFACE-001 | skill:import IPCインターフェース不整合修正 | 2026-02-21 | `skill:import` の Mainハンドラー引数契約を `skillName: string` に統一。`skillService.importSkills([skillName])` で配列化する実装を反映 |
| UT-FIX-SKILL-REMOVE-INTERFACE-001 | skill:remove IPCインターフェース不整合修正 | 2026-02-20 | `skill:remove` の Mainハンドラー引数契約を `skillName: string` に統一。空白文字列を拒否する3段バリデーションを追加 |
| TASK-9A-B  | スキルファイル操作IPCハンドラー実装  | 2026-02-19 | 6チャンネル追加（skill:readFile/writeFile/createFile/deleteFile/listBackups/restoreBackup）、Preload API実装、セキュリティ準拠、65テスト全PASS |
| TASK-9B-H  | SkillCreatorService IPCハンドラー登録 | 2026-02-12 | 6チャンネル追加（5 invoke + 1 progress）、SkillCreatorAPI Preload実装、セキュリティ準拠 |

**TASK-9A-B 派生未タスク**:

| タスクID     | タスク名                                            | 優先度 | 指示書パス                                                                              |
| ------------ | --------------------------------------------------- | ------ | --------------------------------------------------------------------------------------- |
| UT-9A-B-001 | IPC入力バリデーション標準化                         | 中     | `docs/30-workflows/unassigned-task/task-ipc-validation-standardize-improvements.md` |
| UT-9A-B-002 | IPCエラーサニタイズ共通ユーティリティ化             | 中     | `docs/30-workflows/unassigned-task/task-ipc-error-sanitize-refactoring.md`          |
| UT-9A-B-003 | IPCテストhandlerMapモックユーティリティ共通化       | 低     | `docs/30-workflows/unassigned-task/task-ipc-test-mock-utils-improvements.md`        |

---

## 変更履歴

| バージョン | 日付       | 変更内容                                                                     |
| ---------- | ---------- | ---------------------------------------------------------------------------- |
| v1.11.0    | 2026-02-21 | UT-FIX-SKILL-IMPORT-INTERFACE-001反映: `skill:import` IPC引数契約を `skillName: string` に統一した完了記録を追加 |
| v1.10.0    | 2026-02-20 | 未タスク参照パス整合を修正: UT-9A-B-001〜003 の指示書参照を `docs/30-workflows/unassigned-task/` に統一 |
| v1.9.0     | 2026-02-20 | UT-FIX-SKILL-REMOVE-INTERFACE-001反映: `skill:remove` 引数契約を `skillName: string` に統一し、完了タスクへ記録 |
| v1.8.0     | 2026-02-19 | TASK-9A-B: スキルファイル操作IPCチャンネルセクション追加。6チャンネル（skill:readFile/writeFile/createFile/deleteFile/listBackups/restoreBackup）、型定義、実装状況、セキュリティ仕様、完了タスク記録 |
| v1.7.0     | 2026-02-12 | UT-9B-H-003反映: Skill Creator IPCのセキュリティ強化仕様を追記（validatePath/sanitizeErrorMessage/ALLOWED_SCHEMA_NAMES） |
| v1.6.0     | 2026-02-12 | TASK-9B-H: Skill Creator IPCチャネルセクション追加。6チャンネル（5 invoke + 1 progress）、型定義、実装状況、完了タスク記録 |
| v1.5.0     | 2026-02-10 | UT-FIX-5-4: AgentSDKAPI.abort()型定義修正。`void` → `Promise<void>`。実装（safeInvoke）と型定義の整合性確保 |
| v1.4.0     | 2026-02-10 | UT-FIX-5-3: `agent:abort` IPCセキュリティ修正。`ipcMain.on`→`ipcMain.handle`変更、`safeInvoke`パターン準拠。**注意**: `agent:getStatus`チャネル名不整合（Main: camelCase vs Preload: kebab-case）検出→TASK-FIX-12-2で対応予定 |
| v1.3.0     | 2026-02-03 | TASK-WCE-MONACO-001: get-selection実装完了、完了タスクセクション追加         |
| v1.2.0     | 2026-02-02 | TASK-WCE-WORKSPACE-001: workspacePathパラメータ追加、完了タスク追加          |
| v1.1.0     | 2026-01-26 | TypeScriptコードブロックを表形式に変換（spec-guidelines.md準拠）             |
| v1.0.0     | 2026-01-25 | 初版作成                                                                     |
