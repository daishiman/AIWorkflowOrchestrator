# TASK-RT-02 Implementation Guide

## Part 1: 中学生向け説明（なぜ必要か → 何をするか）

たとえば自動販売機で、お金を入れてボタンを押したのに何も出てこないのに「成功」と表示されたら、利用者は何が起きたか分からなくなります。これがこのタスクで直したかった問題です。

先に「なぜ必要か」を言うと、失敗を成功に見せるとユーザーが次の行動を選べなくなるからです。今回の変更で「何をするか」は、失敗したときに失敗だと分かる形で返し、画面で明確なエラーメッセージを出せるようにすることです。

画面確認の証跡は `outputs/phase-11/screenshots/TC-01-step1-initial-dark.png` / `TC-03-step2-configure-dark.png` / `TC-06-step3-error-dark.png` と `outputs/phase-11/screenshots/RT-02-01-skill-create-wizard-error-dark.png` / `RT-02-02-skill-lifecycle-error-state.png` を参照します。

## Part 2: 技術詳細

### TypeScript 型定義

```typescript
export type RuntimeSkillCreatorDegradedReason =
  | "llm_adapter_unavailable"
  | "resource_loader_unavailable";

export interface RuntimeSkillCreatorPlanErrorResponse {
  success: false;
  error: {
    code: RuntimeSkillCreatorDegradedReason | "VALIDATION_ERROR";
    message: string;
  };
}

export interface RuntimeSkillCreatorImproveErrorResponse {
  success: false;
  error: {
    code: RuntimeSkillCreatorDegradedReason | "VALIDATION_ERROR";
    message: string;
  };
}

export type RuntimeSkillCreatorImproveResponse =
  | RuntimeSkillCreatorImproveResult
  | RuntimeSkillCreatorImproveErrorResponse
  | { type: "terminal_handoff"; guidance: HandoffGuidance };

export type RuntimeSkillCreatorPlanResponse =
  | RuntimeSkillCreatorPlanResult
  | RuntimeSkillCreatorPlanErrorResponse
  | { type: "terminal_handoff"; guidance: HandoffGuidance };
```

### APIシグネチャ

```typescript
window.electronAPI.skillCreator.planSkill(
  prompt: string,
  authMode?: string,
  apiKey?: string,
): Promise<IpcResult<RuntimeSkillCreatorPlanResponse>>
```

### 使用例

```ts
const result = await window.electronAPI.skillCreator.planSkill(
  prompt,
  "api-key",
  apiKey,
);
if (!result.success) {
  setGenerationError(result.error ?? "Plan request failed");
} else if ("success" in result.data && result.data.success === false) {
  setGenerationError(result.data.error.message);
} else {
  const normalizedPlan = toPlanResult(result.data);
  if (!normalizedPlan) {
    setGenerationError("計画レスポンスの形式が不正です");
  } else {
    setCurrentPlanResult(normalizedPlan);
  }
}
```

### エラーハンドリング

- `llm_adapter_unavailable`: LLM アダプタ未接続時に返す
- `resource_loader_unavailable`: ResourceLoader 未注入時に返す
- renderer 側で logical error union を検出して `setGenerationError()` / `setStoreGenerationError()` に流す
- `RuntimeSkillCreatorImproveErrorResponse` も plan と同じ code/message 契約を使う
- `RuntimeSkillCreatorImproveResponse` は plan と同じく terminal_handoff と error union を併せ持つ
- plan / improve / execute の degraded path では `governanceHooks.onSessionEnd()` を必ず呼ぶ

### execute() ガード（2026-04-04 完了: TODO-01）

`_executeInternal()` 内の `terminal_handoff` 分岐直後に `llmAdapter` 未注入ガードを追加した。

```typescript
// terminal_handoff は LLM 不要のため除外済み → ここから integrated_api のみ
this.workflowEngine.recordExecuteStart(planResult, decision, sourceProvenance);

// TASK-RT-02: llmAdapter 未注入時は explicit error を返す
if (!this.llmAdapter) {
  const sdkEvents = normalizeSkillCreatorSdkEvents([], sourceProvenance);
  const result: SkillExecuteResult = { executeId: `degraded-...`, success: false, ... };
  this.workflowEngine.recordExecutionFailure(planResult.planId, { reason: "execution_error", ... });
  governanceHooks.onSessionEnd({ sessionId: planResult.planId, summary: `Execute failed: ...` });
  return result;
}
```

**設計上の注意**: `recordExecuteStart()` を先に呼ぶことでワークフロー状態を確立し、`recordExecutionFailure()` が state lookup に成功するよう順序を整理した。plan / improve でも degraded path で `session_end` を閉じるため、audit 断絶は残していない。

### エッジケース

- IPC outer wrapper は `success: true` でも、`data` が logical error（`success:false`）の可能性がある
- `terminal_handoff` と plan error を混同しないように type guard を分離する
- `execute()` の `terminal_handoff` 経路は LLM 不在でも正常完了する（TC-14 で回帰確認済み）
- `execute()` の `integrated_api` 経路で LLM 不在時は `recordExecuteStart()` → `recordExecutionFailure()` の順で記録し、`success: false` を返す
- `execute()` の degraded path では `governanceHooks.onSessionEnd()` も必ず呼ぶ

### テスト（2026-04-04 完了: TODO-02）

新規作成: `RuntimeSkillCreatorFacade.stub-elimination.test.ts`（execute / plan 回帰 + governance audit まで PASS）

- TC-10: execute / llmAdapter 未注入 → `success:false`
- TC-11: execute / llmAdapter 注入済み → executor 到達（回帰）
- TC-12: plan / llmAdapter 未注入 → `success:false`（回帰）
- TC-13: plan / resourceLoader 未注入 → `success:false`（回帰）
- TC-14: terminal_handoff / llmAdapter 未注入でも handoff 正常完了

### 設定と定数

- `DEGRADED_REASON_MESSAGES`
  - `llm_adapter_unavailable` → 「LLM アダプタが利用できません。設定を確認してください。」
  - `resource_loader_unavailable` → 「リソースローダーが利用できません。設定を確認してください。」
