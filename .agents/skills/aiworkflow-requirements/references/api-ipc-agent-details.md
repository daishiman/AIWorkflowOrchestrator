# Agent Dashboard・Workspace Chat Edit IPC / detail specification

> 親仕様書: [api-ipc-agent.md](api-ipc-agent.md)
> 役割: detail specification

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
| 未タスク台帳と参照の非同期 | UT-9F指示書の配置先差分で追跡困難になった | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` 正本へ統一し、`task-workflow` とレポートを同時更新 |

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

#### Runtime Integration (TASK-IMP-SKILL-DOCS-AI-RUNTIME-001)

4チャンネル（skill:docs:generate / preview / export / templates）のレスポンス形式を `DocOperationResult<T>` で統一。

**エラーコード体系**:
| コード | カテゴリ | 意味 | retryable |
|--------|---------|------|-----------|
| 1001 | VALIDATION | prompt が空 | false |
| 2001 | BUSINESS | API key 未設定 | false |
| 2002 | BUSINESS | API key 無効 | false |
| 3001 | EXTERNAL_SERVICE | タイムアウト | true |
| 3002 | EXTERNAL_SERVICE | レートリミット | true |
| 3003 | EXTERNAL_SERVICE | サーバーエラー | true |
| 4001 | INFRASTRUCTURE | IPC通信エラー | true |
| 5001 | INTERNAL | 内部エラー | false |

**queryFn DI 経路**: ipc/index.ts L784-794 の stubQueryFn → LLMDocQueryAdapter.query() bind

---

