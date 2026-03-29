# TASK-RT-02 Implementation Guide

## Part 1: 中学生向け説明（なぜ必要か → 何をするか）

たとえば自動販売機で、お金を入れてボタンを押したのに何も出てこないのに「成功」と表示されたら、利用者は何が起きたか分からなくなります。これがこのタスクで直したかった問題です。

先に「なぜ必要か」を言うと、失敗を成功に見せるとユーザーが次の行動を選べなくなるからです。今回の変更で「何をするか」は、失敗したときに失敗だと分かる形で返し、画面で明確なエラーメッセージを出せるようにすることです。

画面確認の証跡は `outputs/phase-11/screenshots/DOC-11-01-placeholder.png` を参照します。

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

### エッジケース

- IPC outer wrapper は `success: true` でも、`data` が logical error（`success:false`）の可能性がある
- `terminal_handoff` と plan error を混同しないように type guard を分離する
- `execute()` は degraded stub を持たないため、plan error の段階で実行導線を止める

### 設定と定数

- `DEGRADED_REASON_MESSAGES`
  - `llm_adapter_unavailable` → 「LLM アダプタが利用できません。設定を確認してください。」
  - `resource_loader_unavailable` → 「リソースローダーが利用できません。設定を確認してください。」
