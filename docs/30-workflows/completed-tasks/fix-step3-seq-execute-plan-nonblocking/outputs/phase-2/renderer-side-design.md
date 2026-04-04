# Renderer 側詳細設計書 - TASK-FIX-EP-01

## メタ情報

```yaml
task_id: TASK-FIX-EP-01
formal_task_id: TASK-FIX-EXECUTE-PLAN-FF-001
document_type: Renderer側詳細設計書
created_date: 2026-04-04
```

## 1. isExecutePlanAck 型ガード

### 定義

```typescript
interface SkillCreatorExecutePlanAck {
  accepted: true;
  planId: string;
}

function isExecutePlanAck(
  response: unknown,
): response is SkillCreatorExecutePlanAck {
  return (
    !!response &&
    typeof response === "object" &&
    "accepted" in response &&
    (response as Record<string, unknown>).accepted === true &&
    "planId" in response &&
    typeof (response as Record<string, unknown>).planId === "string"
  );
}
```

### 設計判断

- ack レスポンス (`{ accepted: true, planId }`) と従来の `IpcResult` 形式を型安全に判別
- `accepted` フィールドの存在と `true` 値で判定（`success` フィールドを持つ `IpcResult` とは構造が異なる）

## 2. handleExecutePlan の ack 分岐

### フロー

```typescript
const handleExecutePlan = async () => {
  const planId = storePlanId ?? activePlanResult?.planId;
  if (!planId) return;

  const skillCreatorApi = getSkillCreatorApi();
  if (!skillCreatorApi?.executePlan) return;

  // 1. execute-plan invoke
  const result = await skillCreatorApi.executePlan({
    planId,
    skillSpec: approvedSkillSpec ?? request,
    authMode,
    apiKey,
  });

  // 2. エラーチェック
  if (!result.success || !result.data) {
    setGenerationError(result.error ?? "計画実行に失敗しました");
    return;
  }

  // 3. ack 分岐
  if (isExecutePlanAck(result.data)) {
    // fire-and-forget パターン: ack 受信
    setActiveWorkflowId(planId);

    // 初期 snapshot を取得（任意）
    if (skillCreatorApi.getWorkflowState) {
      const snapshotResult = await skillCreatorApi.getWorkflowState(planId);
      // snapshot があれば UI に反映
    }
    // 以降は WORKFLOW_STATE_CHANGED イベント監視で更新
    return;
  }

  // 従来パターン（フォールバック）
  // ...
};
```

### 状態遷移

```
handleExecutePlan 呼び出し
  |
  +-- invoke("execute-plan", args)
  |
  +-- ack 受信 ({ accepted: true, planId })
  |     |
  |     +-- setActiveWorkflowId(planId)
  |     +-- getWorkflowState(planId) で初期 snapshot 取得
  |     +-- WORKFLOW_STATE_CHANGED イベント監視モードへ
  |
  +-- エラー受信 ({ success: false, error })
        |
        +-- setGenerationError(error)
```

## 3. WORKFLOW_STATE_CHANGED イベント監視

- `activeWorkflowId` が設定されると、`SKILL_CREATOR_WORKFLOW_STATE_CHANGED` イベントのリスナーが有効化
- 受信した snapshot で UI 状態を更新
- phase が `complete` または `error` になったら `processWorkflowOutcome` を実行

## 4. UI への影響

- ユーザー操作（「実行する」ボタン押下）から ack 受信までの体感レスポンスは 100ms 以内
- ack 受信後、UI はローディング状態に遷移
- バックグラウンド実行の進捗は WORKFLOW_STATE_CHANGED イベントでリアルタイム更新
- エラー発生時は error snapshot により自動的にエラー表示
