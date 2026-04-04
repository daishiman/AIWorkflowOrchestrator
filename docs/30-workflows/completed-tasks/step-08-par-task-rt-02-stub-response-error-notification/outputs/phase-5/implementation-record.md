# Phase 5: 実装記録

## 変更ファイル一覧

### 1. shared types: `packages/shared/src/types/skillCreator.ts`

**追加:**

- `RuntimeSkillCreatorDegradedReason` 型（L630-632）
- `RuntimeSkillCreatorPlanErrorResponse` インターフェース（L637-643）
- `RuntimeSkillCreatorPlanResponse` に error union 追加（L677）

### 2. Facade: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

**変更:**

- import に `RuntimeSkillCreatorPlanErrorResponse` 追加
- `plan()`: stub success（旧L308-328）→ explicit error に置換。`llmAdapter` 未注入時と `resourceLoader` 未注入時を分離
- `improve()`: stub `{improveId, suggestions:[]}` （旧L560-567）→ explicit error に置換。同様に分離

### 3. renderer: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

**追加:**

- import に `RuntimeSkillCreatorPlanErrorResponse`, `RuntimeSkillCreatorPlanResponse` 追加
- `isRuntimePlanErrorResponse()` type guard 追加（L176-180）
- `handlePrepare` 内で plan logical error を検出し `setGenerationError()` でエラー表示（L737-740）

### 4. renderer: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

**追加:**

- import に `RuntimeSkillCreatorPlanResponse` 追加
- `handleLlmGenerate` 内で plan logical error を検出し `setStoreGenerationError()` でエラー表示（L192-196）

### 5. Facade (T-01): `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

**追加（2026-04-04 完了）:**

- `_executeInternal()` の `terminal_handoff` 分岐直後に `recordExecuteStart()` を移動
- 続いて `!this.llmAdapter` ガードを追加（TASK-RT-02 コメント付き）
- `llmAdapter` 未注入時は `DEGRADED_REASON_MESSAGES.llm_adapter_unavailable` を `error` として `SkillExecuteResult` を返す
- `workflowEngine.recordExecutionFailure()` でワークフロー状態を整合させる
- `governanceHooks.onSessionEnd()` で execute 失敗の監査セッションを閉じる

### 6. テスト (T-02): `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.stub-elimination.test.ts`

**新規作成（2026-04-04 完了）:**

- TC-10: `llmAdapter` 未注入時の `execute()` → `success:false` / エラーメッセージ確認 / executor 非呼び出し / `recordExecutionFailure()` 呼び出し検証
- TC-11: `llmAdapter` 注入済み時の `execute()` → `skillExecutor.execute()` に到達する回帰テスト
- TC-12: `plan()` で `llmAdapter` 未注入 → `success:false` 回帰テスト
- TC-13: `plan()` で `resourceLoader` 未注入 → `success:false` 回帰テスト
- TC-14: `terminal_handoff` 経路は execute 抑止対象にならない（`llmAdapter` 未注入でも handoff 正常完了）

### 7. 既存テスト更新

**変更（2026-04-04 完了）:**

- `RuntimeSkillCreatorFacade.test.ts`: execute ガードを通過させるため 3 テストに `setLLMAdapter()` 追加
- `RuntimeSkillCreatorFacade.executeAsync.test.ts`: `createFacade()` に `llmAdapter` 追加
- `RuntimeSkillCreatorFacade.notification.test.ts`: 全 6 テストの facade に `llmAdapter` 追加
- `RuntimeSkillCreatorFacade.persist-integration.test.ts`: 全 13 テストの facade に `llmAdapter` 追加

## AC 充足状況

| AC   | 実装                                            | 状態                          |
| ---- | ----------------------------------------------- | ----------------------------- |
| AC-1 | `plan()` / `execute()` が explicit error を返す | ✅                            |
| AC-2 | renderer が plan error 時に execute を抑止      | ✅                            |
| AC-3 | `improve()` が explicit error を返す            | ✅                            |
| AC-4 | `error.code` + `error.message` を含む           | ✅                            |
| AC-5 | IPC outer wrapper は transport 専用             | ✅（変更なし）                |
| AC-6 | renderer がエラー表示                           | ✅                            |
| AC-7 | 正常系・handoff 非破壊                          | ✅（TC-11, TC-14 テスト通過） |
