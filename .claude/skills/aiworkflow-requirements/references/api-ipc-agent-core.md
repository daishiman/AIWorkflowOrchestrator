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
| `chat-edit:read-file`         | Renderer → Main | ファイル内容読み込み     | `{ filePath: string, workspacePath?: string \| null }`           | `FileReadResult`               |
| `chat-edit:write-file`        | Renderer → Main | ファイル書き込み         | `{ filePath, content, options?, workspacePath?: string \| null }` | `FileWriteResult`              |
| `chat-edit:get-selection`     | Renderer → Main | エディタ選択範囲取得     | なし                                                             | `{ success: boolean, data: TextSelection \| null }`   |
| `chat-edit:send-with-context` | Renderer → Main | コンテキスト付きチャット | `{ contexts: FileContext[], command: EditCommand, message?: string, workspacePath?: string }` | `SendWithContextResponse` |

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

#### HandoffGuidance（terminal handoff 案内）

`chat-edit:send-with-context` が `handoff=true` を返す場合に含まれる DTO。

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `terminalCommand` | string | ○ | Claude Code で実行するコマンド例 |
| `contextSummary` | string | ○ | file basename / line range / command type の要約 |
| `reason` | string | ○ | handoff 判定理由（subscription mode / API key 不足など） |

```typescript
interface HandoffGuidance {
  terminalCommand: string;  // Claude Code で実行するコマンド例
  contextSummary: string;   // ファイル名・行範囲・コマンドタイプの要約
  reason: string;           // handoff になった理由
}
```

#### SendWithContextResponse（チャット応答）

`chat-edit:send-with-context` の統一レスポンス型。

| プロパティ   | 型                 | 必須 | 説明                                          |
| ------------ | ------------------ | ---- | --------------------------------------------- |
| success      | boolean            | ○    | 処理成功フラグ                                |
| data         | object             | -    | 成功時の応答データ                            |
| error        | string             | -    | 失敗時のエラーメッセージ                      |
| errorCode    | string             | -    | エラーコード（下表参照）                      |
| handoff      | boolean            | -    | `true` のとき `guidance` を参照               |
| guidance     | HandoffGuidance    | -    | terminal handoff 案内（`handoff=true` 時のみ）|

#### エラーコード一覧（chat-edit）

| コード                  | 意味                                   | retryable |
| ----------------------- | -------------------------------------- | --------- |
| `SELECTION_REQUIRED`    | 選択範囲なしで実行しようとした         | false     |
| `ACCESS_NOT_CONFIGURED` | API キー未設定                         | false     |
| `PERMISSION_DENIED`     | ワークスペース外ファイルアクセス       | false     |
| `RATE_LIMIT`            | レート制限                             | true      |
| `TIMEOUT`               | タイムアウト                           | true      |

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
| chatEditSlice.selection | 完了 | `selection: TextSelection \| null` + `setSelection` |
| useFileContext     | 完了     | ファイルコンテキストHook          |
| useDiffApply       | 完了     | 差分適用Hook                      |
| UIコンポーネント   | 未実装   | 別タスク（task-workspace-chat-edit-ui-components） |
| Main Processサービス | **完了** | FileService, ContextBuilder, ChatEditService, RuntimeResolver, TerminalHandoffBuilder |
| IPCハンドラー      | **完了** | chatEditHandlers.ts               |
| get-selection実装  | **完了** | Monaco Editor選択範囲取得（TASK-WCE-MONACO-001） |
| integrated/handoff 分岐 | **完了** | `RuntimeResolver.resolve()` による判定（2026-03-14） |
| Preload API公開     | **完了** | `contextBridge.exposeInMainWorld("chatEditAPI", chatEditAPI)` |

#### 修正記録

| ID   | 内容                                                                                          | 日付       |
| ---- | --------------------------------------------------------------------------------------------- | ---------- |
| M-01 | `chatEditApi.ts` で `contextBridge.exposeInMainWorld("chatEditAPI", chatEditAPI)` に修正（キー名統一） | 2026-03-14 |

#### 廃止予定チャンネル

| チャンネル              | 廃止理由                              | 代替                        |
| ----------------------- | ------------------------------------- | --------------------------- |
| `chat-edit:get-selection` | renderer selection 管理への移行     | `chatEditSlice.selection`   |

---

## Skill Creator IPC チャネル

Electronデスクトップアプリでは、IPC通信でスキル作成・管理機能を提供する。
`SkillCreatorService` と `RuntimeSkillCreatorFacade` を使い分け、スキルの自動判定・作成・タスク実行・検証に加え、runtime plan/execute/improve、改善・フォーク・共有・スケジュール・デバッグ・ドキュメント生成・統計取得を行う。

**実装ファイル**:

- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- IPCハンドラー: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- runtime helper: `apps/desktop/src/main/ipc/creatorHandlers.ts`
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
| `skill-creator:plan`            | Renderer → Main | runtime plan       | `{ prompt: string; authMode?: AuthMode; apiKey?: string \| null }` | `IpcResult<RuntimeSkillCreatorPlanResponse>` |
| `skill-creator:execute-plan`    | Renderer → Main | runtime execute    | `{ planId: string; skillSpec: string; authMode?: AuthMode; apiKey?: string \| null }` | `IpcResult<SkillCreatorExecutePlanAck>` |
| `skill-creator:improve-skill`   | Renderer → Main | runtime improve    | `{ skillName: string; feedback: string; authMode?: AuthMode; apiKey?: string \| null }` | `IpcResult<RuntimeSkillCreatorImproveResponse>` |
| `skill-creator:get-verify-detail` | Renderer → Main | verify detail 取得 | `{ planId: string }` | `IpcResult<RuntimeSkillCreatorVerifyDetailResponse>` |
| `skill-creator:reverify-workflow` | Renderer → Main | verify loop 再要求 | `{ planId: string }` | `IpcResult<RuntimeSkillCreatorReverifyResponse>` |
| `skill-creator:get-governance` | Renderer → Main | governance 状態取得 | `{ phase: SkillCreatorGovernancePhase }` | `IpcResult<GovernanceUiPayload>` |
| `skill-creator:improve`         | Renderer → Main | スキル改善         | `{ skillName: string; autoApply?: boolean }`               | `IpcResult<unknown>`          |
| `skill-creator:apply-improvement` | Renderer → Main | 改善提案適用     | `{ skillName: string; suggestions: RuntimeSkillCreatorImproveSuggestion[] }` | `IpcResult<ApplyImprovementResult>` |
| `skill-creator:fork`            | Renderer → Main | スキルフォーク     | `{ sourceName: string; newName: string; options?: object }` | `IpcResult<string>`           |
| `skill-creator:share`           | Renderer → Main | スキル共有         | `{ skillName: string; format: string }`                    | `IpcResult<string>`           |
| `skill-creator:schedule`        | Renderer → Main | スケジュール設定   | `{ skillName: string; schedule: object }`                  | `IpcResult<void>`             |
| `skill-creator:debug`           | Renderer → Main | スキルデバッグ     | `{ skillName: string; options?: object }`                  | `IpcResult<unknown>`          |
| `skill-creator:generate-docs`   | Renderer → Main | ドキュメント生成   | `{ skillName: string; format?: string; sections?: string[] }` | `IpcResult<string>`        |
| `skill-creator:stats`           | Renderer → Main | 使用統計取得       | `{ skillName?: string; period?: string }`                  | `IpcResult<unknown>`          |
| `skill-creator:progress`        | Main → Renderer | 進捗通知           | -                                                          | `SkillCreatorProgress`        |
| `skill-creator:get-adapter-status` | Renderer → Main | LLMAdapter 初期化状態取得 | なし | `IpcResult<LLMAdapterStatusPayload>` |
| `skill-creator:adapter-status-changed` | Main → Renderer | LLMAdapter 状態変化通知 | - | `LLMAdapterStatusPayload` |
| APPROVAL_REQUEST (onEvent) | approval:request | Main → Renderer | approval-request-surface | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001 | onApprovalRequest() | ApprovalRequestPayload |

### 型定義

| 型名                   | 説明                                 |
| ---------------------- | ------------------------------------ |
| `IpcResult<T>`         | IPC統一レスポンス型（success/error） |
| `SkillCreatorMode`     | 作成モード列挙値                     |
| `CreateSkillOptions`   | スキル作成オプション                 |
| `ExecuteTasksOptions`  | タスク実行オプション                 |
| `ExecutionReport`      | タスク実行レポート                   |
| `RuntimeSkillCreatorPlanResponse` | runtime plan 結果または terminal handoff |
| `SkillCreatorExecutePlanAck` | runtime execute の受付 ack |
| `RuntimeSkillCreatorImproveResponse` | runtime improve 結果または terminal handoff |
| `SkillCreatorGovernancePhase` | governance 対象 phase（plan / execute / verify / improve） |
| `GovernanceUiPayload` | denial と session summary を含む governance 表示用 payload |
| `TerminalHandoffBundle` | Claude Code handoff bundle          |
| `SkillCreatorProgress` | 進捗通知データ（Preload型）          |
| `SkillCreatorAPI`      | Preload APIインターフェース          |
| `LLMAdapterStatusPayload` | `{ status: LLMAdapterStatus; failureReason: string \| null }` — TASK-RT-01 pull/push 共通 payload |

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
| runtime 3チャンネル定義      | 完了   | UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 |
| shared runtime contract 追加 | 完了   | UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 |
| ホワイトリスト追加           | 完了   | TASK-9B-H / TASK-9B / UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 |
| IPCハンドラー実装            | 完了   | TASK-9B-H / TASK-9B / UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 |
| Preload API実装              | 完了   | TASK-9B-H / TASK-9B / UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 |
| Sender検証（全15 invoke）    | 完了   | TASK-9B-H / TASK-9B / UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 |
| P42 3段バリデーション（create含む） | 完了 | UT-9B-H-003 / TASK-9B / UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 |
| エラーサニタイズ             | 完了   | UT-9B-H-003                     |
| パストラバーサル検証         | 完了   | UT-9B-H-003                     |
| schemaNameホワイトリスト検証 | 完了   | UT-9B-H-003                     |
| LLMAdapter 状態公開 2チャネル | 完了 | TASK-RT-01 |

---

## SDK メッセージ出力型統合

詳細は [api-ipc-sdk-type-contracts.md](api-ipc-sdk-type-contracts.md) を参照。

| 型 | タスク | 概要 |
| --- | --- | --- |
| `SdkOutputMessageBase` | UT-RT-06 | 実行lane / creator lane 共通基底型 |
| `SkillExecutorStreamMessage` | UT-RT-06 | 実行lane出力型（timestamp必須） |
| `SkillCreatorSdkEvent` | UT-RT-06 | creator lane出力型（timestamp省略可） |

---

---

## SDK メッセージ出力型統合

詳細は [api-ipc-sdk-type-contracts.md](api-ipc-sdk-type-contracts.md) を参照。

| 型 | タスク | 概要 |
| --- | --- | --- |
| `SdkOutputMessageBase` | UT-RT-06 | 実行lane / creator lane 共通基底型 |
| `SkillExecutorStreamMessage` | UT-RT-06 | 実行lane出力型（timestamp必須） |
| `SkillCreatorSdkEvent` | UT-RT-06 | creator lane出力型（timestamp省略可） |

---

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
| runtime bridge | `skill-creator:plan` / `skill-creator:execute-plan` / `skill-creator:improve-skill` | workflow-driven runtime handoff / direct public IPC |
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
| Sender 検証 | `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })` | 不正時 `toIPCValidationError` |
| 入力検証 | P42 準拠3段（型/空文字/trim） | `VALIDATION_ERROR` |
| エラーサニタイズ | `sanitizeErrorMessage(error)` | 内部情報は `"Internal error"` |

---

## スキルファイル操作 IPC チャネル

詳細は [api-ipc-agent-fileops.md](api-ipc-agent-fileops.md) を参照。

| チャネル | タスク | 概要 |
| --- | --- | --- |
| `skill:readFile` / `skill:writeFile` / `skill:createFile` / `skill:deleteFile` | TASK-9A-B | スキルファイル CRUD |
| `skill:listBackups` / `skill:restoreBackup` | TASK-9A-B | バックアップ一覧・復元 |

## スキル安全性評価・ファイルツリー IPC チャネル

詳細は [api-ipc-agent-safety.md](api-ipc-agent-safety.md) を参照。

| チャネル | タスク | 概要 |
| --- | --- | --- |
| `skill:evaluate-safety` | UT-06-003 | スキル安全性評価（SafetyGateResult 返却） |
| `skill:getFileTree` | TASK-UI-05A | スキルファイルツリー取得（未実装） |

---

## スキル公開・配布 IPC 契約（TASK-SKILL-LIFECYCLE-08 / spec_created）

TASK-SKILL-LIFECYCLE-08 では公開・配布領域の IPC 契約を設計済み（実装は未タスク化）。

| チャネル | 方向 | 用途 | ステータス |
| --- | --- | --- | --- |
| `skill:publishing:register` | Renderer → Main | 公開メタデータ登録 | 設計完了 |
| `skill:publishing:confirm` | Renderer → Main | 公開確定 | 設計完了 |
| `skill:publishing:update` | Renderer → Main | バージョン更新 | 設計完了 |
| `skill:publishing:deprecate` | Renderer → Main | 公開停止 | 設計完了 |
| `skill:publishing:remove` | Renderer → Main | 公開削除 | 設計完了 |
| `skill:publishing:get-dependents` | Renderer → Main | 依存関係取得 | 設計完了 |
| `skill:publishing:check-compatibility` | Renderer → Main | 互換性評価 | 設計完了 |
| `skill:distribution:import` | Renderer → Main | 取り込み | 設計完了 |
| `skill:distribution:export` | Renderer → Main | 書き出し | 設計完了 |
| `skill:distribution:fork` | Renderer → Main | 複製 | 設計完了 |
| `skill:distribution:share` | Renderer → Main | 共有 | 設計完了 |

### 契約不変条件

- すべて `IpcResponse<T>`（P60）で返却する。
- invoke 系は P42 の 3段バリデーション（sender / payload / domain）を維持する。
- handler 登録は concrete class ではなく interface 依存（P61）を前提とする。

### 実装移行の未タスク

- `UT-SKILL-LIFECYCLE-08-IPC-TEST`
- `UT-SKILL-LIFECYCLE-08-UI-IMPL`
