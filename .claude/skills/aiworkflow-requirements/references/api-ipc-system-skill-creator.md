# API / IPC System: Skill Creator Runtime Public IPC（前半）
> 親ファイル: [api-ipc-system-core.md](api-ipc-system-core.md)

## Skill Creator Runtime Public IPC（UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001）

### 概要

`skillCreatorAPI` に runtime public surface を 3 チャンネル追加し、`RuntimeSkillCreatorFacade` の plan / execute / improve を既存 `skill-creator:*` namespace に統合する。

### 実装アンカー

| 層 | ファイル | 役割 |
| --- | --- | --- |
| Main registration | `apps/desktop/src/main/ipc/index.ts` | `SkillExecutor` / `authKeyService` から facade を組み立てる |
| Main public entrypoint | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` | skill creator 標準 surface を維持して runtime helper を登録する |
| Main runtime helper | `apps/desktop/src/main/ipc/creatorHandlers.ts` | `plan` / `execute-plan` / `improve-skill` / `get-verify-detail` / `reverify-workflow` / `get-governance-state` handler |
| Runtime service | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | public bridge。policy / handoff / execute を判断し、state 更新は engine へ委譲 |
| Workflow engine | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | `currentPhase` / `awaitingUserInput` / `verifyResult` / artifacts / `resumeTokenEnvelope` の owner。checkpoint hydrate / artifact serialization も保持 |
| Preload | `apps/desktop/src/preload/skill-creator-api.ts` | `planSkill()` / `executePlan()` / `improveSkillWithFeedback()` / `getVerifyDetail()` / `reverifyWorkflow()` / `getGovernanceState()` |
| Workflow session repository | `apps/desktop/src/main/services/session/SkillCreatorWorkflowSessionRepository.ts` | revision / lease guard 付き save/load/invalidate/evaluate。public IPC 未公開の internal persistence owner |
| Compatibility evaluator | `apps/desktop/src/main/services/session/ResumeCompatibilityEvaluator.ts` | version / route / provenance / lease を比較し `compatible` / `compatible_with_warning` / `incompatible` / `conflict` を返す |
| Workflow session storage | `apps/desktop/src/main/services/session/WorkflowSessionStorage.ts` | `skill-creator-workflow-sessions` store を管理し generic session schema と分離 |
| Shared types | `packages/shared/src/types/skillCreator.ts` | request / response / handoff bundle / verify detail / reverify result / persisted checkpoint / compatibility snapshot / lease |

### Task08 session persistence / resume contract（2026-03-28 branch current facts）

- `SkillCreatorWorkflowEngine` は persisted checkpoint から `hydrateFromCheckpoint()` で workflow state を復元し、`serializeArtifactsForPersistence()` で phase artifacts を persistence payload へ変換する。
- `SkillCreatorWorkflowSessionRepository` は existing checkpoint に対して `expectedRevision` を必須にし、stale write の silent overwrite を拒否する。
- legacy / 破損 checkpoint は `missing_workflow_payload` として graceful reject し、`agent:resumeSession` と混同しない internal contract に留める。

### チャンネル一覧

| チャンネル | 用途 | Request | Response |
| --- | --- | --- | --- |
| `skill-creator:plan` | runtime plan 作成 | `SkillCreatorPlanRequest` | `IpcResult<RuntimeSkillCreatorPlanResponse>` |
| `skill-creator:execute-plan` | plan 実行 | `SkillCreatorExecutePlanRequest` | `IpcResult<SkillCreatorExecutePlanAck>` |
| `skill-creator:improve-skill` | runtime 改善 | `SkillCreatorImproveSkillRequest` | `IpcResult<RuntimeSkillCreatorImproveResponse>` |
| `skill-creator:get-verify-detail` | verify detail 取得 | `SkillCreatorGetVerifyDetailRequest` | `IpcResult<RuntimeSkillCreatorVerifyDetailResponse>` |
| `skill-creator:reverify-workflow` | verify loop 再要求 | `SkillCreatorReverifyWorkflowRequest` | `IpcResult<RuntimeSkillCreatorReverifyResponse>` |
| `skill-creator:get-governance-state` | runtime governance state 取得 | なし | `IpcResult<SkillCreatorGovernanceState>` |

`skill-creator:execute-plan` は `{ accepted: true, planId }` の ack を正本とし、完了状態の反映は `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` snapshot relay を介して行う。Renderer の compat path が旧 execute result を受ける場合は follow-up task で統一する。current fact として、ack 受理後に Renderer は `getWorkflowState` を再読込し、`handoffBundle` または `verifyResult.status === "fail"` の snapshot を UI エラーとして扱う（adapter guard failure は `recordExecuteAdapterFailure()` で review-ready snapshot を先に保存する）。この ack 後再読込は `SkillCreateWizard` の failure handling の正本であり、`executeAsync()` の message 伝搬統一は別 follow-up として切り出す。


### UT-IMP-TASK-SDK-06-LAYER34-VERIFY-EXPANSION-001（2026-03-27）

- `SkillCreatorWorkflowEngine` が `verifyResult` / `routeSnapshot` / `sourceProvenance` から `RuntimeSkillCreatorVerifyDetail` を導出する current fact に更新。
- runtime public surface に `skill-creator:get-verify-detail` / `skill-creator:reverify-workflow` を追加し、Task07/08 owner 項目は delegated note として返す。
- `SkillLifecyclePanel` は verify detail card を表示し、`reverifyWorkflow()` を再検証導線として利用する。approval / disclosure / persistence は sibling task owner のまま維持。

### TASK-P0-08 session resume / cleanup public surface（2026-04-06）

`SkillCreatorWorkflowEngine` の persisted checkpoint を renderer から再開・削除・期限切れ掃除できるようにする session surface。state owner は engine のまま維持する。

| 層 | ファイル | 役割 |
| --- | --- | --- |
| Main IPC | `apps/desktop/src/main/ipc/creatorHandlers.ts` | `SKILL_CREATOR_RESUME_SESSION` / `SKILL_CREATOR_DELETE_SESSION` / `SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS` を direct response で公開 |
| Runtime service | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | checkpoint TTL、compatibility、hydrate、expired cleanup を担当 |
| Workflow engine | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | `sessionId` / `startedAt` / `isActive` を含む一覧と cleanup を担当 |
| Preload | `apps/desktop/src/preload/skill-creator-api.ts` | `resumeSession()` / `deleteSession()` / `cleanupExpiredSessions()` を公開 |
| Renderer | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | session prompt / resume / delete / new-start / indicator を統合 |
| Shared types | `packages/shared/src/types/skillCreator.ts` | `SkillCreatorSessionListItem` / `SkillCreatorSessionSummary` / `SkillCreatorSessionResumeResult` / `SkillCreatorSessionResumeErrorReason` |

### current contract

| 項目 | 契約 |
| --- | --- |
| list surface | `window.skillCreatorAPI.listSessions()` は `IpcResult<SkillCreatorSessionListItem[]>` を返す |
| resume result | `resumeSession(checkpointId)` は `SkillCreatorSessionResumeResult` を直接返す |
| delete | `deleteSession(checkpointId)` は `Promise<void>` を返す |
| cleanup | `cleanupExpiredSessions()` は削除件数 `number` を返す |
| expired handling | expired checkpoint は `errorReason: "expired"` で renderer に返り、prompt 側は新規開始へフォールバックする |
| UI state | `SessionResumePrompt` と `SessionIndicator` が session lifecycle を反映する |

### session resume channels

| チャンネル | 用途 | Request | Response |
| --- | --- | --- | --- |
| `skill-creator:list-sessions` | session list | なし | `IpcResult<SkillCreatorSessionListItem[]>` |
| `skill-creator:resume-session` | checkpoint resume | `{ checkpointId }` | `SkillCreatorSessionResumeResult` |
| `skill-creator:delete-session` | checkpoint delete | `{ checkpointId }` | `void` |
| `skill-creator:cleanup-expired-sessions` | TTL cleanup | なし | `number` |

### execute-plan failure lifecycle 契約（UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001）

| ケース | public response | engine state | 補足 |
| --- | --- | --- | --- |
| `terminal_handoff` | `success: true` + `data.success: false` + `handoff: true` | review 維持 | executor 非実行 |
| `integrated_api` + `success: true` | `success: true` + `data.success: true` | verify phase | verify pending へ進む |
| `integrated_api` + `success: false` | `success: true` + `data.success: false` | review phase + `verification_review` | `awaitingUserInput` と失敗 artifact を保存 |
| executor reject | `success: false` + sanitize 済み error | review phase + `verification_review` | reject snapshot を facade catch で記録 |


### 完了タスク（TASK-SC-03-PLAN-LLM-PROMPT）

> 完了日: 2026-03-23

| 変更項目 | ファイル | 内容 |
| -------- | -------- | ---- |
| スタブ実装を LLM 呼び出しに置換 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `buildPlanSystemPrompt` + `parsePlanResponse` による LLM 統合。入力バリデーション・JSON パース・型ガード追加 |
| プロンプト定数ファイル新規作成 | `apps/desktop/src/main/services/runtime/planPromptConstants.ts` | システムプロンプト・JSON スキーマ指示・プロンプトビルダー |
| RuntimeSkillCreatorPlanResult 型拡充 | `packages/shared/src/types/skillCreator.ts` | `skillName` / `description` / `agents` / `scripts` / `triggers` / `anchors` フィールド追加 |

### 完了タスク（TASK-SC-05-IMPROVE-LLM）

> 完了日: 2026-03-23

| 変更項目 | ファイル | 内容 |
| -------- | -------- | ---- |
| improve() LLM 統合 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | スタブ実装を LLM 呼び出しに置換。`buildImproveUserPrompt` + `parseImproveResponse` + `mapToSuggestion` + `handleImproveError` 追加 |
| プロンプト定数ファイル新規作成 | `apps/desktop/src/main/services/runtime/improvePromptConstants.ts` | `IMPROVE_RESPONSE_SCHEMA_INSTRUCTION` + JSON スキーマ指示 |
| `RuntimeSkillCreatorImproveSuggestion` 型追加 | `packages/shared/src/types/skillCreator.ts` | `section` / `before` / `after` / `reason` フィールド |
| `RuntimeSkillCreatorImproveResult.suggestions` 型変更 | `packages/shared/src/types/skillCreator.ts` | `string[]` → `RuntimeSkillCreatorImproveSuggestion[]` |
| `ApplyImprovementResult` 型追加 | `packages/shared/src/types/skillCreator.ts` | `applied` / `skipped` / `skippedDetails` / `errors` フィールド |
| `RuntimeSkillCreatorImproveErrorResponse` 型追加 | `packages/shared/src/types/skillCreator.ts` | `success: false` + `error: { code, message }` |
| `applyImprovement()` メソッド追加 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `before`/`after` テキスト置換による改善適用 |
| `SkillFileManager` DI 追加 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `RuntimeSkillCreatorFacadeDeps.skillFileManager` (optional) |
| `RuntimeSkillCreatorExecuteErrorResponse` 型追加 | `packages/shared/src/types/skillCreator.ts` | execute() の degraded response を structured error 化し、adapter 未準備時は `recordExecuteAdapterFailure()` で review-ready snapshot を記録 |

### 契約メモ

| 項目 | 契約 |
| --- | --- |
| authMode 省略時 | handler 側で `api-key` を既定値にする |
| `apiKey=null` + `authMode=\"api-key\"` | `plan` / `improve` は `resolveWithService()` により保存済み key fallback を試行する |
| runtime facade 未注入 | 3 チャンネルは登録を維持し、`success: false` + 一定 error string を返す |
| execute() adapter degraded | `RuntimeSkillCreatorExecuteResponse` に `RuntimeSkillCreatorExecuteErrorResponse` を追加し、`failed` / `initializing` では `llm_adapter_unavailable` を返す |

### 完了タスク（TASK-SDK-02 workflow-engine-runtime-orchestration）

> 完了日: 2026-03-26

| 変更項目 | ファイル | 内容 |
| -------- | -------- | ---- |
| workflow state owner 分離 | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | facade から `currentPhase` / `awaitingUserInput` / `verifyResult` / artifacts / `resumeTokenEnvelope` ownership を分離 |
| execute handoff hardening | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `terminal_handoff` では executor を呼ばず early return、`integrated_api` では engine を verify phase まで進める |
| provenance source 固定 | `apps/desktop/src/main/services/skill/ResourceLoader.ts` | `getBasePath()` を追加し、runtime source provenance を manifest / resume envelope と同期 |
| shared parity test | `packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts` | plan / execute / improve の runtime union と preload / ipc parity を回帰テスト化 |
| failure lifecycle hardening | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`, `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `success:false` / reject / `verification_review` を review path へ統一し、transition guard と append artifact を固定 |
| sender 不正 | `toIPCValidationError` を throw して reject |
| エラー | `sanitizeErrorMessage()` 後の文字列のみ返す |
| execute 実行 | `SkillExecutor` へ委譲し、auth key は既存 DI 経路を再利用する |

### 完了タスク（TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001）

> 完了日: 2026-03-17

| 変更項目 | ファイル | 内容 |
| -------- | -------- | ---- |
| GAP-01: AI_CHAT P42バリデーション追加 | `apps/desktop/src/main/ipc/aiHandlers.ts` | `providerId`/`modelId` に P42 準拠3段バリデーション（`typeof` → `=== ""` → `.trim() === ""`）を追加 |
| GAP-03: DEFAULT_CONFIG fallback 廃止 | `apps/desktop/src/main/ipc/llmConfigProvider.ts` | `?? DEFAULT_CONFIG` フォールバックを廃止。`getSelectedLLMConfig()` が `null` を返すように変更。呼び出し元（`aiHandlers.ts`）には既に null チェックが存在していた |
| AI_CHECK_CONNECTION 存廃方針確定 | `apps/desktop/src/main/ipc/aiHandlers.ts` | legacy 互換として残置。新規実装は `llm:check-health` を primary とする方針を明文化 |

**テストファイル（新規5件）**:

| テストファイル | テスト数 | 対象 |
| -------------- | -------- | ---- |
| `aiHandlers.runtime-sync.test.ts` | 8 | AI_CHAT バリデーション / provider 解決順 |
| `llm.runtime-sync.test.ts` | 12 | `handleCheckHealth` disconnected 返却 / `handleSetSelectedConfig` バリデーション |
| `llmConfigProvider.runtime-sync.test.ts` | 4 | `getSelectedLLMConfig()` null 返却 |
| `authKeyHandlers.runtime-sync.test.ts` | 9 | auth-key IPC バリデーション |
| `apiKeyHandlers.runtime-sync.test.ts` | 12 | apiKey IPC バリデーション |

### 完了タスク（TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001）

> 完了日: 2026-03-19
> ステータス: spec_created（正本契約更新済み、実装は後続タスクで対応）

| 変更項目 | 内容 |
| -------- | ---- |
| IPC チャネル名統一（4 rename） | `slide:startWatching` → `slide:watch-start`、`slide:stopWatching` → `slide:watch-stop`、`slide:getSyncStatus` → `slide:sync-status`、`slide:manualSync` → `slide:reverse-sync` |
| push チャネル名統一（2 rename） | `slide:syncStatusChanged` → `slide:sync-status-changed`、`slide:executionProgress` → `slide:execution-progress` |
| 新規チャネル設計 | `slide:sync-error`（push: sync エラー通知）、`slide:watch-status`（push: watcher 状態通知） |
| セキュリティ設計 | 全 invoke チャネル（6本）に `validateIpcSender` 適用設計完了 |
| バリデーション設計 | P42 3段バリデーション + `detectPathTraversal` を全 `projectPath` 引数に適用設計完了 |
| セキュリティ検証順序確立 | `validateIpcSender` → P42バリデーション → パストラバーサル検出 → business logic 委譲 |

**実装完了タスク**:

- `UT-SLIDE-IMPL-001`: slide IPC ハンドラー実装（channel rename + validateIpcSender + path guard 追加） -- **実装済み（2026-03-22, TASK-IMP-SLIDE-RUNTIME-ALIGNMENT-001, #1363）**
- `UT-SLIDE-UI-001`: SlideWorkspace UI 4領域実装 -- **completed（2026-03-21）**

---

### 関連タスク

| タスクID                                             | 概要                                                                              | ステータス |
| ---------------------------------------------------- | --------------------------------------------------------------------------------- | ---------- |
| TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001              | Slide IPC チャネル名統一・セキュリティ設計（4 rename + validateIpcSender 設計）   | implemented（2026-03-22, #1363） |
| TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001           | Main/Chat/Settings Runtime 同期（GAP-01〜03 修正）                                | 完了       |
| TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001               | SkillExecutor への AuthKeyService 注入経路を単一路化                              | 完了       |
| TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001              | `auth-key:exists` 判定契約の env fallback 追加                                    | 完了       |
| TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001           | auth-key 4チャネルの Main 登録漏れと解除連携を修正                                | 完了       |
| TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 | OAuth後の `AUTH_STATE_CHANGED` / `linkedProviders` 契約整合で iterable 障害を分離 | 完了       |
| TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001        | `registerAllIpcHandlers` に Graceful Degradation（個別 try-catch + 失敗記録）を追加 | 完了       |

**セキュリティ設計**:

| 項目             | 対策                                             |
| ---------------- | ------------------------------------------------ |
| 暗号化           | Electron safeStorage.encryptString()             |
| Renderer 分離    | getKey() は Renderer 非公開（Main Process のみ） |
| IPC 検証         | withValidation() ラッパーで sender 検証          |
| フォーマット検証 | `sk-ant-api` プレフィックスパターン              |
| ログ出力         | キー値は一切ログに出力しない                     |

### Notification / HistorySearch IPC チャネル（TASK-UI-01-C）

Notification ドメインと HistorySearch ドメインの統合で追加したIPC契約。

**実装ファイル**:

- ハンドラー: `apps/desktop/src/main/ipc/notificationHandlers.ts`, `apps/desktop/src/main/ipc/historySearchHandlers.ts`
- 登録: `apps/desktop/src/main/ipc/index.ts`
- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- Preload API: `apps/desktop/src/preload/index.ts`
- 型定義: `apps/desktop/src/preload/types.ts`

| チャネル                     | メソッド | 引数                                  | 戻り値                           | 備考             |
| ---------------------------- | -------- | ------------------------------------- | -------------------------------- | ---------------- |
| `notification:get-history`   | invoke   | `{ limit?: number, offset?: number }` | `NotificationGetHistoryResponse` | sender検証必須   |
| `notification:mark-read`     | invoke   | `{ notificationId: string }`          | `NotificationMutationResponse`   | 認証必須         |
| `notification:mark-all-read` | invoke   | なし                                  | `NotificationMutationResponse`   | 認証必須         |
| `notification:delete`        | invoke   | `{ notificationId: string }`          | `NotificationMutationResponse`   | 認証必須         |
| `notification:clear`         | invoke   | `{ onlyRead?: boolean }`              | `NotificationMutationResponse`   | 認証必須         |
| `notification:new`           | on       | `NotificationHistoryItem`             | event                            | Main -> Renderer |
| `history:search`             | invoke   | `HistorySearchRequest`                | `HistorySearchResponse`          | `query` は空文字許容、trim 正規化 |
| `history:get-stats`          | invoke   | なし                                  | `HistorySearchStatsResponse`     | sender検証 + 集計返却 |

**セキュリティ契約**:

| 項目       | 契約                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| sender検証 | `event.sender === mainWindow.webContents` かつ URL を検証                       |
| 更新系認証 | `notification:mark-read` / `mark-all-read` / `delete` / `clear` は未認証時 `AUTH_REQUIRED` |
| 入力検証   | `notificationId` と `history query/filter/limit/offset` を検証                  |
| 公開境界   | `ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS` に明示登録                    |

### HistorySearch handler detail（TASK-UI-06 追補）

| 項目 | 契約 |
| --- | --- |
| `query` | `string` 以外は `VALIDATION_ERROR`。空文字と空白のみは `\"\"` へ正規化して全件検索として扱う |
| `filter` | `all` / `chat` / `file` / `skill` 以外は `VALIDATION_ERROR` |
| `limit` | 不正値は `30` へ fallback |
| `offset` | 不正値は `0` へ fallback |
| error sanitize | handler 内で `sanitizeErrorMessage()` を通し、生の例外文字列をそのまま Renderer へ出さない |

### IPC エラーコード

| コード               | 説明                 | 対処                         |
| -------------------- | -------------------- | ---------------------------- |
| `INVALID_SENDER`     | 不正なリクエスト元   | DevTools等からの不正アクセス |
| `PROVIDER_NOT_FOUND` | 未対応プロバイダー   | サポート対象を確認           |
| `VALIDATION_FAILED`  | バリデーションエラー | 入力値を確認                 |
| `STORAGE_ERROR`      | ストレージ操作失敗   | safeStorage利用可否確認      |
| `NETWORK_ERROR`      | ネットワーク障害     | 接続状態を確認               |

### Renderer 側 Response Shape Fallback パターン（2026-03-07追加）

Renderer コンポーネントが IPC レスポンスを受け取る際、Preload 層の contextBridge 公開が部分的に失敗するケースに備え、3段階の防御パターンを適用する。

**標準パターン: 3段階防御**

| 段階                  | 防御内容                                                               | コード例                                                                           |
| --------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1. API存在確認        | `window.electronAPI?.namespace` で namespace レベルの存在を確認        | `const api = window.electronAPI?.apiKey;`                                          |
| 2. メソッド存在確認   | `api?.method` でメソッドレベルの存在を確認し、不在時は warn + fallback | `if (!api?.list) { console.warn(...); return; }`                                   |
| 3. レスポンス形状検証 | `Array.isArray(result.data.items)` で iterable 安全性を検証            | `const items = Array.isArray(result.data.providers) ? result.data.providers : [];` |

**適用箇所**: ApiKeysSection loadProviders
**関連タスク**: 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001

---

