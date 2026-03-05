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
| `agent:get-skill-detail` | Renderer → Main | スキル詳細取得   | `{ skillId: SkillId }`      | `{ skill: SkillDetail }`|
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
| `id`          | `SkillId`  | 一意識別子（ハッシュ） |
| `name`        | `SkillName`| スキル名（表示名）     |
| `description` | `string`   | 説明文                 |
| `path`        | `string`   | スキルファイルパス     |
| `triggers`    | `string[]` | トリガーキーワード     |
| `category`    | `string?`  | カテゴリ（任意）       |

> `SkillId` / `SkillName` は `packages/shared/src/types/skill.ts` の Branded Type（UT-TYPE-SKILL-IDENTIFIER-BRANDED-001）を参照する。

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
SkillCreatorServiceと連携し、スキルの自動判定・作成・タスク実行・検証に加え、改善・フォーク・共有・スケジュール・デバッグ・ドキュメント生成・統計取得を行う。

**実装ファイル**:

- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- IPCハンドラー: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- Preload API: `apps/desktop/src/preload/skill-creator-api.ts`
- 型定義: `apps/desktop/src/preload/skill-creator-api.ts`、`packages/shared/src/types/skillCreator.ts`

### チャンネル一覧

| チャネル                        | 方向            | 用途               | Request                                                    | Response                      |
| ------------------------------- | --------------- | ------------------ | ---------------------------------------------------------- | ----------------------------- |
| `skill-creator:detect-mode`     | Renderer → Main | モード自動判定     | `{ request: string }`                                      | `IpcResult<SkillCreatorMode>` |
| `skill-creator:create`          | Renderer → Main | スキル新規作成     | `CreateSkillOptions`                                       | `IpcResult<string>`           |
| `skill-creator:execute-tasks`   | Renderer → Main | タスク群実行       | `ExecuteTasksOptions`                                      | `IpcResult<ExecutionReport>`  |
| `skill-creator:validate`        | Renderer → Main | スキル検証         | `{ skillDir: string }`                                     | `IpcResult<boolean>`          |
| `skill-creator:validate-schema` | Renderer → Main | スキーマ検証       | `{ schemaName: string; data: unknown }`                    | `IpcResult<boolean>`          |
| `skill-creator:improve`         | Renderer → Main | スキル改善         | `{ skillName: string; autoApply?: boolean }`               | `IpcResult<unknown>`          |
| `skill-creator:fork`            | Renderer → Main | スキルフォーク     | `{ sourceName: string; newName: string; options?: object }` | `IpcResult<string>`           |
| `skill-creator:share`           | Renderer → Main | スキル共有         | `{ skillName: string; format: string }`                    | `IpcResult<string>`           |
| `skill-creator:schedule`        | Renderer → Main | スケジュール設定   | `{ skillName: string; schedule: object }`                  | `IpcResult<void>`             |
| `skill-creator:debug`           | Renderer → Main | スキルデバッグ     | `{ skillName: string; options?: object }`                  | `IpcResult<unknown>`          |
| `skill-creator:generate-docs`   | Renderer → Main | ドキュメント生成   | `{ skillName: string; format?: string; sections?: string[] }` | `IpcResult<string>`        |
| `skill-creator:stats`           | Renderer → Main | 使用統計取得       | `{ skillName?: string; period?: string }`                  | `IpcResult<unknown>`          |
| `skill-creator:progress`        | Main → Renderer | 進捗通知           | -                                                          | `SkillCreatorProgress`        |

### 型定義

| 型名                   | 説明                                 |
| ---------------------- | ------------------------------------ |
| `IpcResult<T>`         | IPC統一レスポンス型（success/error） |
| `SkillCreatorMode`     | 作成モード列挙値                     |
| `CreateSkillOptions`   | スキル作成オプション                 |
| `ExecuteTasksOptions`  | タスク実行オプション                 |
| `ExecutionReport`      | タスク実行レポート                   |
| `SkillCreatorProgress` | 進捗通知データ（Preload型）          |
| `SkillCreatorAPI`      | Preload APIインターフェース          |

### SkillCreatorProgress型

| プロパティ   | 型       | 説明             |
| ------------ | -------- | ---------------- |
| `phase`      | `string` | 現在のフェーズ名 |
| `percentage` | `number` | 進捗率（0-100）  |
| `message`    | `string` | 進捗メッセージ   |

### 実装状況

| 項目                         | 状態   | タスク                          |
| ---------------------------- | ------ | ------------------------------- |
| 基本6チャンネル定義          | 完了   | TASK-9B-H-SKILL-CREATOR-IPC     |
| 拡張7チャンネル定義          | 完了   | TASK-9B（2026-02-26反映）       |
| ホワイトリスト追加           | 完了   | TASK-9B-H / TASK-9B             |
| IPCハンドラー実装            | 完了   | TASK-9B-H / TASK-9B             |
| Preload API実装              | 完了   | TASK-9B-H / TASK-9B             |
| Sender検証（全12 invoke）    | 完了   | TASK-9B-H / TASK-9B             |
| P42 3段バリデーション（create含む） | 完了 | UT-9B-H-003 / TASK-9B        |
| エラーサニタイズ             | 完了   | UT-9B-H-003                     |
| パストラバーサル検証         | 完了   | UT-9B-H-003                     |
| schemaNameホワイトリスト検証 | 完了   | UT-9B-H-003                     |

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

## `skill:execute` IPC 契約（TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001）

Renderer からのスキル実行要求を Main へ渡す中核チャネル。認証 preflight と失敗契約を同期し、`AUTHENTICATION_ERROR` を UI 層まで識別可能に伝搬する。

### チャネル仕様

| 項目 | 内容 |
| --- | --- |
| チャネル名 | `skill:execute` |
| 方向 | Renderer → Main |
| リクエスト | `SkillExecutionRequest`（`{ skillName: string; prompt: string }`） |
| 後方互換入力 | `{ skillId: string; params: string }`（Main で吸収） |
| 成功レスポンス | `{ success: true, data: SkillExecutionResponse }` |
| 失敗レスポンス | `{ success: false, error: string, errorCode?: string }` |
| 認証失敗時 | `errorCode: "AUTHENTICATION_ERROR"` を付与 |

### 認証 preflight 連携

| 層 | 仕様 |
| --- | --- |
| Renderer | `auth-key:exists` 実行結果が `exists=false` の場合、`skill:execute` を呼ばず処理停止 |
| Main (`auth-key:exists`) | store値 + `process.env.ANTHROPIC_API_KEY` の順で存在判定 |
| Preload | `safeInvokeUnwrap` で `errorCode` を `Error.code` へ転写 |

### バリデーション・セキュリティ

| 対策 | 実装 | 返却仕様 |
| --- | --- | --- |
| Sender 検証 | `validateIpcSender(event, mainWindow)` | 不正時 `toIPCValidationError` |
| 入力検証 | P42 準拠3段（型/空文字/trim） | `VALIDATION_ERROR` |
| エラーサニタイズ | `sanitizeErrorMessage(error)` | 内部情報は `"Internal error"` |

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

## スキルファイルツリー取得 IPC チャネル（TASK-UI-05A）

スキルディレクトリのファイルツリー構造を取得する IPC チャネル。SkillEditorView のファイルツリーパネルで使用する。

### チャネル仕様

| 項目 | 内容 |
| --- | --- |
| チャネル名 | `skill:getFileTree` |
| 方向 | Renderer → Main |
| 引数 | `skillName: string` |
| 戻り値 | `{ tree: FileNode[] }` |
| バリデーション | P42準拠3段（型チェック → 空文字列 → trim空文字列） |
| セキュリティ | パストラバーサル検証、送信元ウィンドウ検証 |
| 実装状況 | 未実装（UT-UI-05A-GETFILETREE-001 で対応予定） |
| 関連タスク | TASK-UI-05A-SKILL-EDITOR-VIEW |
| 未タスク正本 | `docs/30-workflows/completed-tasks/skill-editor-view-closure/unassigned-task/task-ui-05a-getfiletree-ipc-implementation.md` |

### FileNode 型定義

```typescript
interface FileNode {
  name: string;
  path: string; // スキルルートからの相対パス
  type: "file" | "directory";
  children?: FileNode[];
}
```

---

## スキル共有 IPC チャネル（TASK-9F）

スキル共有（インポート／エクスポート／ソース検証）の IPC チャネル。3チャネルすべて invoke（Renderer → Main）方向。

### チャネル一覧

| チャネル名              | 方向            | 概要                                     | リクエスト型                                           | レスポンス型                              |
| ----------------------- | --------------- | ---------------------------------------- | ------------------------------------------------------ | ----------------------------------------- |
| `skill:importFromSource` | Renderer → Main | 外部ソースからスキルをインポート         | `ShareTarget`（`{ type, repo?, branch?, gistId?, localPath?, url? }`） | `ShareResult<ShareImportResult> & { errorCode?: "ERR_1001" \| "ERR_2004" \| "ERR_5001" }` |
| `skill:export`          | Renderer → Main | スキルをエクスポート（Gist/ローカル）    | `{ skillName: string, destination: ShareDestination }` | `ShareResult<ShareExportResult> & { errorCode?: "ERR_1001" \| "ERR_2004" \| "ERR_5001" }` |
| `skill:validateSource`  | Renderer → Main | ソースの到達可能性と SKILL.md 構造を検証 | `ShareTarget`                                          | `ShareResult<ShareValidateSourceResult> & { errorCode?: "ERR_1001" \| "ERR_2004" \| "ERR_5001" }` |

### 型定義（`packages/shared/src/types/skill-share.ts`）

| 型名                        | フィールド                                                   | 説明                 |
| --------------------------- | ------------------------------------------------------------ | -------------------- |
| `ShareSourceType`           | `"github" \| "gist" \| "url" \| "local"`                   | ソース種別           |
| `ShareDestinationType`      | `"gist" \| "local"`                                        | エクスポート先種別   |
| `ShareTarget`               | `{ type, repo?, branch?, path?, gistId?, localPath?, url? }` | インポートソース定義 |
| `ShareDestination`          | `{ type, gistId?, localPath? }`                             | エクスポート先定義   |
| `ShareImportResult`         | `{ success, skillName, skillPath, source, importedAt }`     | インポート結果       |
| `ShareExportResult`         | `{ success, destination, exportedFiles, shareUrl? }`        | エクスポート結果     |
| `ShareValidateSourceResult` | `{ isReachable, hasSkillMd, skillName?, errors }`           | ソース検証結果       |
| `ShareResult<T>`            | `{ success, data?, error?, errorCode? }`                    | Result パターン      |
| `ShareError`                | `{ code, message, category, isRetryable }`                  | エラー情報           |

### バリデーションルール

| チャネル                 | バリデーション項目                                          | エラーコード                |
| ------------------------ | ----------------------------------------------------------- | --------------------------- |
| `skill:importFromSource` | source がオブジェクト / source.type が P42 準拠3段バリデーション / source.type が `ALLOWED_SOURCE_TYPES` に含まれる / github 時 repo 長さ制限（10000文字） | `VALIDATION_ERROR` + `ERR_1001` |
| `skill:export`          | args がオブジェクト / args.skillName が P42 準拠3段バリデーション / args.destination がオブジェクト / args.destination.type が P42 準拠3段バリデーション / args.destination.type が `ALLOWED_DESTINATION_TYPES` に含まれる | `VALIDATION_ERROR` + `ERR_1001` |
| `skill:validateSource`  | source がオブジェクト / source.type が P42 準拠3段バリデーション                                                                                           | `VALIDATION_ERROR` + `ERR_1001` |

### 実装状況

| 実装項目                     | ステータス | 関連タスク |
| ---------------------------- | ---------- | ---------- |
| チャネル定数定義（channels.ts）| 完了      | TASK-9F    |
| ホワイトリスト追加           | 完了       | TASK-9F    |
| IPCハンドラー実装            | 完了       | TASK-9F    |
| Preload API実装              | 完了       | TASK-9F    |
| Sender検証（全3ハンドラー）  | 完了       | TASK-9F    |
| P42準拠3段バリデーション     | 完了       | TASK-9F    |
| エラーサニタイズ             | 完了       | TASK-9F    |
| エラーコード整合（ERR_1001/2004/5001） | 完了 | TASK-10A-E-A |

### セキュリティ仕様

全3 invokeハンドラーで以下のセキュリティ検証を実施する。

| 対策 | 実装 | 返却仕様 |
| ---- | ---- | -------- |
| Sender検証 | `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })` | 不正時: `toIPCValidationError + errorCode: "ERR_2004"` |
| 引数バリデーション | P42準拠3段バリデーション（型チェック → 空文字列 → trim空文字列） + 許可値チェック | 不正時: `{ success: false, error: { code: "VALIDATION_ERROR", message } }` |
| 文字列長制限 | github ソースの repo フィールドに `MAX_STRING_LENGTH`（10000文字）制限 | 超過時: バリデーションエラー |
| 例外正規化 | `sanitizeErrorMessage` / `internalError` | unknown例外時: `{ success: false, error: { code: "INTERNAL_ERROR", message: "Internal error" }, errorCode: "ERR_5001" }` |

### エラーコードマッピング（TASK-10A-E-A）

| 経路 | code | errorCode | message |
| --- | --- | --- | --- |
| 入力不正（P42/構造/許可値） | `VALIDATION_ERROR` | `ERR_1001` | フィールド別バリデーション文言 |
| sender 検証失敗 | `IPC_UNAUTHORIZED` | `ERR_2004` | `Unauthorized IPC sender` |
| 予期しない例外 | `INTERNAL_ERROR` | `ERR_5001` | `Internal error` |

### TASK-10A-E-A 実装内容（IPC契約）

| 観点 | 内容 | 検証 |
| --- | --- | --- |
| チャネル境界 | `skill:importFromSource` / `skill:export` / `skill:validateSource` の3チャネルを `IPC_CHANNELS` 定数参照へ統一 | Main 34 tests |
| 失敗契約 | `code`（`VALIDATION_ERROR` / `IPC_UNAUTHORIZED` / `INTERNAL_ERROR`）と `errorCode`（`ERR_1001/2004/5001`）を同時返却 | Preload 60 tests |
| 仕様同期 | `api-ipc` / `security` / `interfaces` / `task-workflow` / `lessons` の5仕様書を同一ターンで更新 | `verify-all-specs` 13/13 |
| 画面証跡 | Phase 11 で TC-11-01〜04 の4スクリーンショット + diagnostics を再取得 | `validate-phase11-screenshot-coverage` 4/4 |

### 実装時の苦戦箇所（TASK-10A-E-A）

| 苦戦箇所 | 再発条件 | 解決策 | 標準ルール |
| --- | --- | --- | --- |
| Step 2 更新有無の記録ドリフト | `spec-update-summary` と `documentation-changelog` を別ターンで更新 | Step 2 実施直後に2成果物を同時更新 | Step 2 は「判定 + 2成果物同期」を1工程として扱う |
| `code` と `errorCode` の混同 | `message` だけを転記して契約を復元する運用 | 失敗契約を `code + errorCode + message` の3列固定でレビュー | 片軸のみの更新を禁止し、二軸同時更新を必須化 |
| チャネル境界の証跡不足 | スクリーンショットのみで境界検証を完了扱いにする | diagnostics JSON（`importCalls`, `importFromSourceCalls`）を保存 | UI証跡は「画像 + 診断JSON」の2点セットで保管 |

### 同種課題の簡潔解決手順（TASK-10A-E-A / 5ステップ）

1. 失敗契約を `code/errorCode/message` の3列で先に固定する。  
2. Main/Preload/仕様書5点を同一ターンで同期する。  
3. `verify-all-specs` と `validate-phase-output` で構造整合を確認する。  
4. Phase 11 証跡（4スクリーンショット + diagnostics）を再取得する。  
5. Step 2 記録を `spec-update-summary` と `documentation-changelog` で同値化する。  

### 実装時の苦戦箇所（TASK-9F）

| 苦戦箇所 | 問題 | 解決策 |
| --- | --- | --- |
| IPCハンドラ実装と起動配線の分離 | `skillHandlers.share.ts` 実装だけではランタイム到達しない | `registerAllIpcHandlers` への登録と依存DIを同時適用し、登録系テストを追加 |
| 型パス正本の混在 | `types/skill/<domain>.ts` 旧記述が仕様に残り契約確認を阻害 | `types/index.ts` + `skill-<domain>.ts` に統一し、仕様・監査期待値を同時更新 |
| 未タスク台帳と参照の非同期 | UT-9F指示書の配置先差分で追跡困難になった | `docs/30-workflows/unassigned-task/` 正本へ統一し、`task-workflow` とレポートを同時更新 |

### 同種課題の簡潔解決手順（4ステップ）

1. 追加チャネルは `channels/preload/main-register/tests` の4点を同一ターンで更新する。  
2. request/response/validation を `api-ipc-agent.md` に先に固定し、実装との差分をなくす。  
3. 未タスクが発生した場合は正本ディレクトリと9セクション形式を同時に満たす。  
4. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を連続実行する。  

---

## スキルフォーク IPC チャネル（TASK-9E）

既存スキルを派生コピーする IPC 契約。`skill-creator:fork`（SkillCreator ドメイン）とは責務を分離し、`skill:fork` は Skill API ドメインの実体コピー処理を担当する。

### チャネル一覧

| チャネル名 | 方向 | 概要 | リクエスト型 | レスポンス型 |
| --- | --- | --- | --- | --- |
| `skill:fork` | Renderer → Main | 既存スキルのフォーク実行 | `SkillForkOptions` | `IpcResult<SkillForkResult>` |

### 型定義（`packages/shared/src/types/skill-fork.ts`）

| 型名 | フィールド | 説明 |
| --- | --- | --- |
| `SkillForkOptions` | `sourceSkill`, `newName`, `description?`, `copyAgents`, `copyReferences`, `copyScripts`, `copyAssets`, `modifyAllowedTools?` | フォーク入力契約 |
| `SkillForkResult` | `success`, `newSkillPath`, `copiedFiles`, `warnings?` | フォーク実行結果 |
| `SkillForkMetadata` | `forkedFrom`, `forkedAt`, `originalDescription?` | `fork-metadata.json` に保存する追跡情報 |

### バリデーションルール

| 項目 | ルール | エラー |
| --- | --- | --- |
| `args` | 非 null object | `VALIDATION_ERROR` |
| `sourceSkill`, `newName` | P42準拠3段バリデーション（型 → 空文字列 → `trim()`） | `"... must be a non-empty string"` |
| `description` | 指定時のみ非空文字列 | `description must be a non-empty string when provided` |
| `copy*` | 4フラグすべて boolean | `"... must be a boolean"` |
| `modifyAllowedTools` | 指定時は非空文字列配列 | `modifyAllowedTools must be an array of non-empty strings` |
| サービス側 | `SkillForker.validatePath` で境界外パス拒否、source存在/同名重複を検証 | `不正なパス...`, `フォーク元スキル...`, `同名のスキル...` |

### 実装状況

| 実装項目 | ステータス | 関連タスク |
| --- | --- | --- |
| チャネル定数（`IPC_CHANNELS.SKILL_FORK`） | 完了 | TASK-9E |
| invokeホワイトリスト追加 | 完了 | TASK-9E |
| IPCハンドラー実装（`skillHandlers.ts`） | 完了 | TASK-9E |
| Preload API実装（`forkSkill(options)`） | 完了 | TASK-9E |
| 共有型定義追加（`skill-fork.ts`） | 完了 | TASK-9E |
| ユニット/IPCテスト追加（59件） | 完了 | TASK-9E |

---

## スキルチェーン IPC チャネル（TASK-9D）

> 完了タスク: TASK-9D

複数スキルをパイプラインとして連携させるスキルチェーン機能の IPC 契約。5 invoke チャネル（Renderer -> Main）で構成される。

### チャネル一覧

| チャネル名 | 方向 | 概要 | リクエスト型 | レスポンス型 |
| --- | --- | --- | --- | --- |
| `skill:chain:list` | Renderer -> Main | チェーン一覧取得 | なし | `IpcResult<SkillChainDefinition[]>` |
| `skill:chain:get` | Renderer -> Main | チェーン定義取得 | `chainId: string` | `IpcResult<SkillChainDefinition>` |
| `skill:chain:save` | Renderer -> Main | チェーン定義保存 | `SkillChainDefinition` | `IpcResult<SkillChainDefinition>` |
| `skill:chain:delete` | Renderer -> Main | チェーン定義削除 | `chainId: string` | `IpcResult<{ deleted: boolean }>` |
| `skill:chain:execute` | Renderer -> Main | チェーン実行 | `{ chainId: string, variables?: Record<string, unknown> }` | `IpcResult<SkillChainResult>` |

### 型定義

8インターフェースを `@repo/shared` の `packages/shared/src/types/skill-chain.ts` で定義:
SkillChainDefinition, SkillChainStep, InputMapping, OutputMapping, SkillChainCondition, SkillChainResult, StepResult, SkillChainErrorStrategy

### バリデーションルール

| チャネル | バリデーション | エラー |
| --- | --- | --- |
| `skill:chain:list` | Sender 検証のみ | - |
| `skill:chain:get` | `chainId` が P42準拠3段バリデーション | `chainId must be a non-empty string` |
| `skill:chain:save` | `chain` が object、`chain.name` が P42準拠3段バリデーション | `chain must be an object`, `chain.name must be a non-empty string` |
| `skill:chain:delete` | `chainId` が P42準拠3段バリデーション | `chainId must be a non-empty string` |
| `skill:chain:execute` | `args` が object、`chainId` が P42準拠3段バリデーション、`variables` は任意 | `args must be an object`, `chainId must be a non-empty string` |

### セキュリティ

- 全5ハンドラに validateIpcSender 適用
- P42準拠3段バリデーション（validateStringArg ヘルパー）
- エラーサニタイズ: sanitizeErrorMessage → "Internal error"

### 実装状況

| 実装項目 | ステータス | 関連タスク |
| --- | --- | --- |
| チャネル定数（`IPC_CHANNELS.SKILL_CHAIN_*`） | 完了 | TASK-9D |
| invokeホワイトリスト追加 | 完了 | TASK-9D |
| IPCハンドラー実装（`skillHandlers.ts` registerSkillChainHandlers） | 完了 | TASK-9D |
| Preload API実装 | 完了（`skill-api.ts`: `chainList/get/save/delete/execute`） | TASK-UI-05B |
| 共有型定義追加（`skill-chain.ts`） | 完了 | TASK-9D |

### 備考

Preload API（`skill-api.ts` 内の chain メソッド群）は TASK-UI-05B の実装で追加済み。Main Process 側のハンドラは `registerSkillChainHandlers()` として `skillHandlers.ts` に実装され、`registerAllIpcHandlers()`（`ipc/index.ts`）から起動時に登録される。

### 実装時の苦戦箇所（TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001）

| 苦戦箇所 | 課題 | 対処 | 標準ルール |
| --- | --- | --- | --- |
| 起動時の登録配線漏れ | `skillHandlers.ts` 実装済みでも `registerAllIpcHandlers` 未登録だと `skill:chain:*` が到達しない | `ipc/index.ts` へ `registerSkillChainHandlers(mainWindow, chainStore, chainExecutor)` を追加し、`ipc-double-registration.test.ts` で呼出を固定検証 | IPC追加時は `handler/register/preload` を同一完了条件にする |
| 依存サービス公開境界のドリフト | `SkillChainStore` / `SkillChainExecutor` が直接 import のまま残り、公開面の一貫性が低下 | 未タスク `UT-IMP-SKILL-CHAIN-BARREL-EXPORT-CONSISTENCY-001` を起票し、次Waveへ明示移管 | IPC登録修正時は `services/*/index.ts` の export 更新有無を同時監査する |

### 同種課題の簡潔解決手順（4ステップ）

1. 新規/修正IPCごとに `handler` 実装と `registerAllIpcHandlers` 配線を同一コミットで確認する。  
2. `ipc-double-registration` 系テストへ「新規 register 関数が呼ばれること」を追加する。  
3. `rg -n "services/<domain>/<Service>|from \"../services/<domain>\""` で直接 import を検出し、バレル export 要否を判定する。  
4. Phase 12で `task-workflow.md` と `lessons-learned.md` に苦戦箇所と再利用手順を同一ターン同期する。  

---

## スキルスケジュール IPC チャネル（TASK-9G）

> 完了タスク: TASK-9G（2026-02-27）

スキルの定期実行・スケジュール管理の IPC 契約。5 invoke チャネル（Renderer -> Main）で構成される。

### チャネル一覧

| チャネル名 | メソッド | 引数 | 戻り値 | 説明 |
| --- | --- | --- | --- | --- |
| `skill:schedule:list` | invoke | なし | `IpcResult<ScheduledSkill[]>` | スケジュール一覧取得 |
| `skill:schedule:add` | invoke | `Omit<ScheduledSkill, "id" \| "runHistory">` | `IpcResult<ScheduledSkill>` | スケジュール追加 |
| `skill:schedule:update` | invoke | `{ id: string, updates: Partial<ScheduledSkill> }` | `IpcResult<void>` | スケジュール更新 |
| `skill:schedule:delete` | invoke | `{ id: string }` | `IpcResult<void>` | スケジュール削除 |
| `skill:schedule:toggle` | invoke | `{ id: string }` | `IpcResult<ScheduledSkill \| undefined>` | 有効/無効切り替え |

### 型定義

4インターフェースを `@repo/shared` の `packages/shared/src/types/skill-schedule.ts` で定義:
ScheduledSkill, SkillSchedule, NotificationSettings, ScheduledRunResult

### バリデーションルール

| チャネル | バリデーション | エラー |
| --- | --- | --- |
| `skill:schedule:list` | Sender 検証のみ | - |
| `skill:schedule:add` | `skillName`/`prompt` が P42準拠3段バリデーション、`schedule.type` が string、cron 時は `cronExpression` 非空、interval 時は正の数 | `skillName must be a non-empty string`, `schedule.type is required`, `cronExpression is required for cron schedule type`, `interval must be a positive number` |
| `skill:schedule:update` | `id` が P42準拠3段バリデーション | `id must be a non-empty string` |
| `skill:schedule:delete` | `id` が P42準拠3段バリデーション | `id must be a non-empty string` |
| `skill:schedule:toggle` | `id` が P42準拠3段バリデーション + 存在確認 | `id must be a non-empty string`, `Schedule not found: {id}` |

### セキュリティ

- 全5ハンドラに validateIpcSender 適用
- P42準拠3段バリデーション（validateStringArg ヘルパー）
- エラーサニタイズ: toIpcErrorResponse → "Internal error"

### 実装状況

| チャネル | ハンドラ | Preload API | テスト | ステータス |
| --- | --- | --- | --- | --- |
| skill:schedule:list | skillHandlers.ts | skill-api.ts scheduleList | 163テスト（desktop 158 + shared 5） | 完了 |
| skill:schedule:add | skillHandlers.ts | skill-api.ts scheduleAdd | (上記に含む) | 完了 |
| skill:schedule:update | skillHandlers.ts | skill-api.ts scheduleUpdate | (上記に含む) | 完了 |
| skill:schedule:delete | skillHandlers.ts | skill-api.ts scheduleDelete | (上記に含む) | 完了 |
| skill:schedule:toggle | skillHandlers.ts | skill-api.ts scheduleToggle | (上記に含む) | 完了 |

---

## スキルデバッグ IPC チャネル（TASK-9H）

スキル実行のデバッグ操作を提供する IPC 契約。6 invoke チャネル（Renderer -> Main）と 1 event チャネル（Main -> Renderer）で構成される。

### チャネル一覧

| チャネル名 | 方向 | 概要 | リクエスト型 | レスポンス型 |
| --- | --- | --- | --- | --- |
| `skill:debug:start` | Renderer -> Main | デバッグセッション開始 | `DebugStartRequest` | `IpcResult<DebugSessionState>` |
| `skill:debug:command` | Renderer -> Main | デバッグコマンド実行 | `DebugCommandRequest` | `IpcResult<void>` |
| `skill:debug:breakpoint:add` | Renderer -> Main | ブレークポイント追加 | `DebugBreakpointAddRequest` | `IpcResult<Breakpoint>` |
| `skill:debug:breakpoint:remove` | Renderer -> Main | ブレークポイント削除 | `DebugBreakpointRemoveRequest` | `IpcResult<void>` |
| `skill:debug:inspect` | Renderer -> Main | 変数インスペクション | `DebugInspectRequest` | `IpcResult<unknown>` |
| `skill:debug:evaluate` | Renderer -> Main | 式評価（paused時のみ） | `DebugEvaluateRequest` | `IpcResult<DebugEvaluateResponse>` |
| `skill:debug:event` | Main -> Renderer | デバッグイベント通知 | - | `DebugEvent` |

### 型定義（`packages/shared/src/types/skill-debug.ts`）

| 型名 | 説明 |
| --- | --- |
| `DebugSessionState` | `id`, `status`, `breakpoints`, `variables`, `steps` を含む IPC 転送用セッション状態 |
| `DebugCommand` | `continue`, `stepOver`, `stepInto`, `stepOut`, `pause`, `stop` |
| `DebugEvent` | `step` / `breakpoint-hit` / `variable-changed` / `session-ended` の Discriminated Union |
| `DEBUG_CONSTANTS` | `SESSION_TIMEOUT_MS` / `MAX_BREAKPOINTS` / `MAX_STEPS` / `EXPRESSION_TIMEOUT_MS` |

### バリデーションルール

| チャネル | バリデーション項目 | エラー |
| --- | --- | --- |
| `skill:debug:start` | `skillName`/`prompt` が P42 準拠3段バリデーション、`breakpoints` が配列 | `skillName must be a non-empty string` など |
| `skill:debug:command` | `sessionId` が非空文字列、`command` が許可値 | `command must be one of: ...` |
| `skill:debug:breakpoint:add` | `sessionId` 非空、`breakpoint` が object | `breakpoint must be an object` |
| `skill:debug:breakpoint:remove` | `sessionId`/`breakpointId` が非空文字列 | `breakpointId must be a non-empty string` |
| `skill:debug:inspect` | `sessionId`/`path` が非空文字列 | `path must be a non-empty string` |
| `skill:debug:evaluate` | `sessionId`/`expression` が非空文字列 | `expression must be a non-empty string` |

### 実装状況

| 実装項目 | ステータス | 関連タスク |
| --- | --- | --- |
| チャネル定数定義（`channels.ts`） | 完了 | TASK-9H |
| ホワイトリスト追加（invoke/on） | 完了 | TASK-9H |
| IPCハンドラ実装（`skillDebugHandlers.ts`） | 完了 | TASK-9H |
| ハンドラ登録（`registerAllIpcHandlers`） | 完了 | TASK-9H |
| Preload API 実装（`skill-api.ts`） | 完了 | TASK-9H |
| 共有型エクスポート（`@repo/shared`） | 完了 | TASK-9H |

---

## スキルドキュメント生成 IPC チャネル（TASK-9I）

スキルの構造情報をもとにドキュメント生成・プレビュー・エクスポート・テンプレート取得を提供する IPC チャネル。4チャネルすべて invoke（Renderer → Main）方向。

### チャネル一覧

| チャネル名 | 方向 | 概要 | リクエスト型 | レスポンス型 |
| --- | --- | --- | --- | --- |
| `skill:docs:generate` | Renderer → Main | ドキュメント生成 | `DocGenerationRequest` | `{ success: true, data: GeneratedDoc }` |
| `skill:docs:preview` | Renderer → Main | プレビュー生成 | `{ skillName: string; template?: DocTemplate }` | `{ success: true, data: GeneratedDoc }` |
| `skill:docs:export` | Renderer → Main | ファイルエクスポート | `{ doc: GeneratedDoc; outputPath: string }` | `{ success: true }` |
| `skill:docs:templates` | Renderer → Main | テンプレート一覧取得 | なし | `{ success: true, data: DocTemplate[] }` |

### 型定義（`packages/shared/src/types/skill-docs.ts`）

| 型名 | 説明 |
| --- | --- |
| `DocGenerationRequest` | 生成リクエスト（`skillName`, `outputFormat`, `includeExamples`, `includeApiReference`, `language`, `customSections?`） |
| `GeneratedDoc` | 生成結果（`skillName`, `format`, `content`, `sections`, `generatedAt`, `wordCount`） |
| `DocSection` | ドキュメントセクション（`id`, `title`, `content`, `order`） |
| `DocTemplate` | テンプレート本体（`id`, `name`, `description`, `sections`） |
| `TemplateSection` | テンプレートセクション定義（`id`, `title`, `prompt`, `required`） |

### バリデーションルール

| チャネル | バリデーション項目 | エラー |
| --- | --- | --- |
| `skill:docs:generate` | `request` オブジェクト検証、`skillName` P42準拠3段、`outputFormat` 許可値 (`markdown/html`)、`includeExamples`/`includeApiReference` boolean、`language` 許可値 (`ja/en`)、`customSections` が文字列配列 | `{ success: false, error: string }` |
| `skill:docs:preview` | `args` オブジェクト検証、`skillName` P42準拠3段 | `{ success: false, error: string }` |
| `skill:docs:export` | `args` オブジェクト検証、`doc` オブジェクト検証、`outputPath` P42準拠3段、`..` を含むパス拒否 | `{ success: false, error: string }` |
| `skill:docs:templates` | sender 検証のみ | `toIPCValidationError` |

### 実装状況

| 実装項目 | ステータス | 関連タスク |
| --- | --- | --- |
| チャネル定数定義（channels.ts） | 完了 | TASK-9I |
| ホワイトリスト追加（ALLOWED_INVOKE_CHANNELS） | 完了 | TASK-9I |
| IPCハンドラー実装（4チャネル） | 完了 | TASK-9I |
| Preload API実装（4メソッド） | 完了 | TASK-9I |
| sender 検証（全4ハンドラー） | 完了 | TASK-9I |
| P42準拠3段バリデーション | 完了 | TASK-9I |

### セキュリティ仕様

全4 invoke ハンドラーで以下を適用する。

| 対策 | 実装 | 返却仕様 |
| --- | --- | --- |
| Sender 検証 | `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })` | 不正時: `toIPCValidationError` |
| 引数バリデーション | P42準拠3段（型チェック → 空文字列 → trim空文字列） + 許可値チェック | 不正時: `{ success: false, error: string }` |
| パストラバーサル防止 | `outputPath.includes(\"..\")` を IPC 層で拒否し、サービス層でも再検証 | 不正時: `{ success: false, error: \"Invalid output path\" }` |
| エラー境界 | `try/catch` で unknown を `"Internal error"` に正規化 | 内部情報漏えい防止 |

---

## スキル分析・統計 IPC チャネル（TASK-9J）

> 完了タスク: TASK-9J（2026-02-28）

### チャネル一覧

| チャネル名 | メソッド | 引数 | 戻り値 | 説明 |
| --- | --- | --- | --- | --- |
| `skill:analytics:record` | invoke | `{ skillName, eventType, duration?, success, errorMessage?, toolsUsed, tokenCount? }` | `{ success: true, data: SkillUsageEvent }` | 使用イベント記録 |
| `skill:analytics:statistics` | invoke | `{ skillName: string, period?: { start, end } }` | `{ success: true, data: SkillStatistics }` | スキル別統計取得 |
| `skill:analytics:summary` | invoke | なし | `{ success: true, data: AnalyticsSummary }` | 全体サマリー取得 |
| `skill:analytics:trend` | invoke | `{ period: { start, end, granularity }, skillName? }` | `{ success: true, data: UsageTrend }` | 使用トレンド取得 |
| `skill:analytics:export` | invoke | `{ format: "csv" | "json", period? }` | `{ success: true, data: string }` | データエクスポート |

### 型定義

8インターフェースを `@repo/shared` の `packages/shared/src/types/skill-analytics.ts` で定義:
SkillUsageEvent, ToolUsageStat, SkillStatistics, AnalyticsPeriod, TrendDataPoint, UsageTrend, SkillUsageSummary, AnalyticsSummary

### 実装状況

| チャネル | ハンドラ | Preload API | テスト | ステータス |
| --- | --- | --- | --- | --- |
| skill:analytics:record | skillAnalyticsHandlers.ts | skill-api.ts analyticsRecord | 37テスト | 完了 |
| skill:analytics:statistics | skillAnalyticsHandlers.ts | skill-api.ts analyticsStatistics | (上記に含む) | 完了 |
| skill:analytics:summary | skillAnalyticsHandlers.ts | skill-api.ts analyticsSummary | (上記に含む) | 完了 |
| skill:analytics:trend | skillAnalyticsHandlers.ts | skill-api.ts analyticsTrend | (上記に含む) | 完了 |
| skill:analytics:export | skillAnalyticsHandlers.ts | skill-api.ts analyticsExport | (上記に含む) | 完了 |

### セキュリティ

- 全5ハンドラに validateIpcSender 適用
- P42準拠3段バリデーション（validateStringArg ヘルパー）
- エラーサニタイズ: toIpcErrorResponse → "Internal error"
- 許可値リスト: ALLOWED_EVENT_TYPES, ALLOWED_GRANULARITIES, ALLOWED_FORMATS

### 実装時の苦戦箇所（TASK-9J）

| 苦戦箇所 | 課題 | 対処 | 標準ルール |
| --- | --- | --- | --- |
| IPC登録配線漏れ | ハンドラ実装済みでも `ipc/index.ts` 未登録だと機能が起動しない | `registerSkillAnalyticsHandlers` を `registerAllIpcHandlers` に組み込み | IPC追加時は `handler/register/preload` 3点を同時完了条件にする |
| analytics責務の重複 | `skillHandlers.ts` と `skillAnalyticsHandlers.ts` に実装が分散 | analytics責務を `skillAnalyticsHandlers.ts` に一本化 | 同一チャネル群は1ファイル1責務を徹底する |
| API命名の契約ドリフト | 仕様記述と実装メソッド名が乖離しやすい | Preload実装名（`analyticsRecord` など）を正本に統一 | IPC契約ドキュメントは実装名から逆算して更新する |

---

## 完了タスク

| タスクID   | タスク名                             | 完了日     | 変更内容                                                                         |
| ---------- | ------------------------------------ | ---------- | -------------------------------------------------------------------------------- |
| TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001 | skill:chain:list ハンドラ登録漏れ修正 | 2026-03-03 | `registerSkillChainHandlers` を `registerAllIpcHandlers` へ追加し、`ipc-double-registration` 回帰テストで登録漏れを検出可能化。関連未タスクとしてバレル公開整合タスクを登録 |
| TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001 | `skill:execute` 認証 preflight ガード | 2026-03-04 | `skill:execute` 失敗契約を `{ success:false, error, errorCode? }` に拡張し、`AUTHENTICATION_ERROR` 伝搬を明文化。`auth-key:exists` の store+env 判定順と Preload `Error.code` 転写を同期 |
| TASK-10A-E-A | IPC契約・セキュリティ整合（shareハンドラー） | 2026-03-05 | `skillHandlers.share.ts` で `IPC_CHANNELS` 定数参照へ統一。sender失敗時 `ERR_2004`、validation系 `ERR_1001`、unknown例外 `ERR_5001` を固定し、Preload契約テスト（60件）/Mainテスト（34件）/手動証跡4件を更新 |
| TASK-9D    | スキルチェーンパイプライン機能       | 2026-02-27 | 5チャンネル追加（skill:chain:list/get/save/delete/execute）、SkillChainStore/SkillChainExecutor追加、共有型 `SkillChainDefinition/Step/Result` 追加。Preload API は TASK-UI-05B（2026-03-02）で実装完了 |
| TASK-9E    | スキルフォーク機能（Skill API）      | 2026-02-28 | `skill:fork` チャネル追加、`SkillForker` サービス新規実装、`forkSkill(options)` Preload API追加、共有型 `SkillForkOptions/Result/Metadata` 追加。59テスト（SkillForker 34 + IPC 25）で契約を検証 |
| TASK-9H    | スキルデバッグモード実装             | 2026-02-27 | 7チャンネル追加（invoke 6 + event 1）、`SkillDebugger` / `DebugSession` / `skill-debug.ts` を実装。`skillDebugHandlers` の登録配線を `registerAllIpcHandlers` へ反映し、129テスト全PASS |
| TASK-9I    | スキルドキュメント生成機能           | 2026-02-28 | 4チャンネル追加（skill:docs:generate/preview/export/templates）、SkillDocGenerator追加、Preload API 4メソッド追加、共有型5種追加、テスト64件PASS |
| TASK-9J    | スキル分析・統計機能                 | 2026-02-28 | 5チャンネル追加（skill:analytics:record/statistics/summary/trend/export）、AnalyticsStore/SkillAnalytics追加、Preload API 5メソッド追加、37テストPASS |
| TASK-9G    | スキルスケジュール実行機能           | 2026-02-27 | 5チャンネル追加（skill:schedule:list/add/update/delete/toggle）、ScheduleStore/SkillScheduler追加、Preload API 5メソッド追加、テスト163件（desktop 158 + shared 5）PASS |
| TASK-9F    | スキル共有・インポート機能           | 2026-02-27 | 3チャンネル追加（skill:importFromSource/export/validateSource）、共有型定義10型新規作成、SkillShareManager実装、92テスト全PASS（Line 94-100%, Branch 90-96%, Function 100%） |
| UT-FIX-SKILL-IMPORT-INTERFACE-001 | skill:import IPCインターフェース不整合修正 | 2026-02-21 | `skill:import` の Mainハンドラー引数契約を `skillName: string` に統一。`skillService.importSkills([skillName])` で配列化する実装を反映 |
| UT-FIX-SKILL-REMOVE-INTERFACE-001 | skill:remove IPCインターフェース不整合修正 | 2026-02-20 | `skill:remove` の Mainハンドラー引数契約を `skillName: string` に統一。空白文字列を拒否する3段バリデーションを追加 |
| TASK-9A-B  | スキルファイル操作IPCハンドラー実装  | 2026-02-19 | 6チャンネル追加（skill:readFile/writeFile/createFile/deleteFile/listBackups/restoreBackup）、Preload API実装、セキュリティ準拠、65テスト全PASS |
| TASK-9B    | SkillCreator IPC拡張反映 | 2026-02-26 | SkillCreator IPC契約を 13チャンネル（12 invoke + 1 progress）へ同期。`skill-creator:improve/fork/share/schedule/debug/generate-docs/stats` を追加反映し、`SkillCreatorProgress` 契約を `phase/percentage/message` に実装準拠化 |
| TASK-9B-H  | SkillCreatorService IPCハンドラー登録 | 2026-02-12 | 6チャンネル追加（5 invoke + 1 progress）、SkillCreatorAPI Preload実装、セキュリティ準拠 |

### TASK-9E 実装時の苦戦箇所（IPC契約観点）

| 苦戦箇所 | 原因 | 解決策（簡潔） |
| --- | --- | --- |
| テスト件数表記が成果物間で 57/59 混在 | 追加テスト後の転記元が複数化した | 正本件数を `task-workflow.md` に固定し、TASK文脈抽出で同期 |
| `skill:fork` と `skill-creator:fork` の用途混同 | 類似チャネル名で契約境界が曖昧だった | API/Interface/Architecture で責務境界を同時追記 |
| path境界判定の抜け | prefix一致判定のみで境界を担保していた | `path.relative` 判定へ統一し、IPC+Service+Securityを同一ターンで更新 |

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
| v1.16.6    | 2026-03-05 | TASK-10A-E-A 追補: share IPC セクションへ「実装内容（IPC契約）」「苦戦箇所」「5ステップ手順」を追加し、Step 2同時同期・`code/errorCode` 二軸固定・画像+diagnostics 証跡の3点を標準化 |
| v1.16.5    | 2026-03-05 | TASK-10A-E-A反映: share IPC（`skill:importFromSource/export/validateSource`）の失敗契約へ `errorCode` を追記。sender失敗 `ERR_2004`、validation `ERR_1001`、unknown例外 `ERR_5001` を明文化し、`IPC_CHANNELS` 定数参照と実装テスト（Main 34 / Preload 60）の整合を記録 |
| v1.16.4    | 2026-03-04 | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001 反映: `skill:execute` 契約セクションを追加し、失敗レスポンス `errorCode`・Renderer preflight・`auth-key:exists` store+env 判定順・Preload `Error.code` 転写を同期 |
| v1.16.3    | 2026-03-03 | TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001 の苦戦箇所と4ステップ簡潔解決手順を追記。完了タスク台帳に同タスクを追加し、登録漏れ修正と未タスク移管（バレル公開整合）を同期 |
| v1.16.2    | 2026-03-03 | TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001: `skill:chain:*` の備考を実装実態へ同期（`registerAllIpcHandlers` での登録保証を明記） |
| v1.16.0    | 2026-03-01 | TASK-UI-05A監査反映: `skill:getFileTree` チャネル仕様セクション追加（FileNode型定義含む）。UT-UI-05A-GETFILETREE-001 未タスクとして登録 |
| v1.16.1    | 2026-03-02 | TASK-UI-05B 実装完了同期: `skill:chain:*` の Preload API 状態を「未実装」から「実装済み」へ更新し、TASK-9D 完了記録に実装日を追記 |
| v1.16.0    | 2026-03-02 | TASK-UI-05B整合性検証: `skill:chain:*`（TASK-9D）5チャネル・`skill:schedule:*`（TASK-9G）5チャネルのIPCセクションを追加。TASK-9D完了タスク記録を追加 |
| v1.15.1    | 2026-02-28 | TASK-9E追補: IPC契約観点の苦戦箇所3件（件数ドリフト/契約境界混同/path境界判定）と簡潔解決策テーブルを追加し、再監査時の参照導線を明確化 |
| v1.15.0    | 2026-02-28 | TASK-9E反映: `skill:fork` チャネルセクション追加。`SkillForkOptions/Result/Metadata` 型契約、P42準拠バリデーション、実装状況、完了タスク記録（59テスト）を同期 |
| v1.14.0    | 2026-02-27 | TASK-9H反映: スキルデバッグ IPC チャネルセクションを追加（`skill:debug:*` 7チャネル、型定義、バリデーション、実装状況、完了タスク記録） |
| v1.15.0    | 2026-02-28 | TASK-9I反映: スキルドキュメント生成 IPC セクションを追加。4チャンネル（skill:docs:generate/preview/export/templates）、共有型5種、バリデーション/セキュリティ仕様、完了タスク記録を同期 |
| v1.15.1    | 2026-02-28 | TASK-9J追補: 「実装時の苦戦箇所」セクションを追加。IPC登録配線漏れ・責務重複・API命名ドリフトの再発防止ルールを明文化 |
| v1.15.0    | 2026-02-28 | TASK-9J: スキル分析・統計IPCチャネル5チャネル追加（record, statistics, summary, trend, export） |
| v1.14.0    | 2026-02-27 | TASK-9G反映: スキルスケジュールIPCチャネルセクション追加。5チャンネル（skill:schedule:list/add/update/delete/toggle）、型定義（ScheduledSkill系）、バリデーション/セキュリティ仕様、完了タスク記録を同期 |
| v1.13.1    | 2026-02-27 | TASK-9F追補: 実装時の苦戦箇所3件（起動配線分離/型パスドリフト/未タスク台帳非同期）と同種課題向け4ステップ手順を追加 |
| v1.13.0    | 2026-02-27 | TASK-9F反映: スキル共有IPCチャネルセクション追加。3チャンネル（skill:importFromSource/export/validateSource）、共有型定義10型、バリデーションルール、セキュリティ仕様、完了タスク記録 |
| v1.12.0    | 2026-02-26 | TASK-9B反映: SkillCreator IPC契約を 13チャンネル（12 invoke + 1 progress）へ更新。拡張7チャンネル、`SkillCreatorProgress`（`phase/percentage/message`）、実装状況テーブルを実装実体へ同期 |
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
