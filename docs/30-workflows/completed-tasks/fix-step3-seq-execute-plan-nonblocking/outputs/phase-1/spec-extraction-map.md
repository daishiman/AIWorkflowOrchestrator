# Phase 1 成果物: スペック抽出マップ

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| Phase    | 1                            |
| タスクID | TASK-FIX-EXECUTE-PLAN-FF-001 |
| 作成日   | 2026-04-01                   |

## P50 チェック結果（既実装状態確認）

### CHANNEL_TIMEOUTS 確認

- **結果**: `"skill-creator:execute-plan": 1_800_000` が既に `apps/desktop/src/preload/ipc-utils.ts:26` に存在する → 重複追加不要

### executeAsync 確認

- **結果**: `RuntimeSkillCreatorFacade.executeAsync` が既に `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts:931` に存在する → 再実装不要

### onPhaseChanged 確認

- **結果**: `SkillCreatorWorkflowEngine.onPhaseChanged?: PhaseChangedCallback` が既に `SkillCreatorWorkflowEngine.ts:113` に存在する → 重複追加不要

### SKILL_CREATOR_WORKFLOW_STATE_CHANGED 確認

- **結果**: IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED が `creatorHandlers.ts` 経由で既存インフラとして利用可能。`emitWorkflowStateChanged()` も実装済み。

### fire-and-forget ハンドラー確認

- **結果**: `void runtimeSkillCreatorService.executeAsync(planId, args)` + `return { accepted: true, planId }` が既に `creatorHandlers.ts:194-197` に存在する → 変更済み

## 変更対象ファイルのインベントリ（4ファイル）

| ファイル                      | パス                                                                   | 変更内容                                 | 状態         |
| ----------------------------- | ---------------------------------------------------------------------- | ---------------------------------------- | ------------ |
| ipc-utils.ts                  | `apps/desktop/src/preload/ipc-utils.ts`                                | CHANNEL_TIMEOUTS に execute-plan 追加    | **実装済み** |
| creatorHandlers.ts            | `apps/desktop/src/main/ipc/creatorHandlers.ts`                         | fire-and-forget化                        | **実装済み** |
| SkillCreatorWorkflowEngine.ts | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | onPhaseChanged callback 追加             | **実装済み** |
| RuntimeSkillCreatorFacade.ts  | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | executeAsync 追加・callback ワイヤリング | **実装済み** |

## 受入条件（AC-1〜AC-6）

| ID   | 受入条件                                                                                                                                            | 確認方法                         | 状態           |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | -------------- |
| AC-1 | `ipcMain.handle('skill-creator:execute-plan')` が 100ms 以内に `{ accepted: true, planId }` を返す                                                  | ユニットテスト TC-T2-01          | テスト作成済み |
| AC-2 | バックグラウンドで `RuntimeSkillCreatorFacade.executeAsync()` が Agent SDK `query()` を呼ぶ                                                         | ユニットテスト TC-T2-02          | テスト作成済み |
| AC-3 | バックグラウンド実行の状態変化が `SkillCreatorExecuteAsyncPhase` の内部 hook と `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` の snapshot 通知で観測できる | ユニットテスト TC-T3-02,03       | テスト作成済み |
| AC-4 | `CHANNEL_TIMEOUTS` に `"skill-creator:execute-plan": 1_800_000` が追加される                                                                        | ユニットテスト TC-T1-01,02       | テスト作成済み |
| AC-5 | 既存の `safeInvoke` 互換性は保ちつつ、`skillCreatorAPI.executePlan` の consumer 契約差分を明示する                                                  | 既存テスト PASS + Phase 3/9 記録 | 確認済み       |
| AC-6 | `SkillCreatorWorkflowEngine.onPhaseChanged` callback が `planId / SkillCreatorExecuteAsyncPhase / progress` の型で定義される                        | TypeScript 型チェック            | 実装済み       |

## タスク分類

- **種別**: code 実装 task（UI 非変更）
- **UI 変更**: なし
- **IPC 変更**: `execute-plan` ハンドラーの動作変更（シグネチャ: `{ accepted: true, planId }` を返す）
- **テスト分類**: Unit Test（ブロッキング→非ブロッキング動作）

## スコープ外確認

| スコープ外項目                           | 理由               | 別タスク                      |
| ---------------------------------------- | ------------------ | ----------------------------- |
| INotificationService                     | 別タスクで実装     | TASK-NOTIFICATION-SERVICE-001 |
| before-quit guard                        | 別タスクで実装     | 別タスク                      |
| CHANNEL_TIMEOUTS の per-channel 設定追加 | PR#1823 で完了済み | TASK-FIX-IPC-TIMEOUT-001      |

## 活用可能インフラ確認

- `SKILL_CREATOR_WORKFLOW_STATE_CHANGED`: ✅ `IPC_CHANNELS` に定義済み。`creatorHandlers.ts` の `emitWorkflowStateChanged()` で使用済み。
- `emitWorkflowStateChanged()`: ✅ 既存メソッドとして再利用可能
- `SkillCreatorWorkflowEngine.workflows: Map<string, SkillCreatorWorkflowState>`: ✅ 複数 planId 対応済み
