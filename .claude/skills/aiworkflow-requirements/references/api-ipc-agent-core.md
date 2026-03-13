# Agent Dashboard・Workspace Chat Edit IPC / core specification

> 親仕様書: [api-ipc-agent.md](api-ipc-agent.md)
> 役割: core specification

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

### Renderer 統合契約（TASK-SKILL-LIFECYCLE-03）

Task03 では `skill-creator:*` を単独の create 導線として見せず、単一 lifecycle UI の内部補助 IPC として使う。

| flow | 使用チャネル | renderer 側の正本 |
| --- | --- | --- |
| request の方針判定 | `skill-creator:detect-mode` | `SkillLifecyclePanel.handlePrepare` |
| 実作成 | 使わない | `agentSlice.createSkill()` → `skill:create` |
| 実行 | 使わない | `agentSlice.executeSkill()` → `skill:execute` |
| 改善候補 | `skill-creator:improve` | `SkillLifecyclePanel.handlePlanImprovement` |

#### 露出ルール

- `skill-creator:create` は Task03 の primary UI では直接呼ばない。
- `skill-creator:detect-mode` と `skill-creator:improve` の結果は session log / suggestion card に集約する。
- `SubAgent` / `Codex` の委譲は mode 説明に留め、別チャネル選択 UI は追加しない。

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

