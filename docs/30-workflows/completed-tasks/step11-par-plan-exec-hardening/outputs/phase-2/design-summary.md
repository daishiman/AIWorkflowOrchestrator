# Phase 2: 設計サマリー

## Lane 分担と依存境界

| Lane | 対象ファイル                                  | 並列可否   | 変更内容                                               |
| ---- | --------------------------------------------- | ---------- | ------------------------------------------------------ |
| A    | `planPromptConstants.ts`                      | B と並列可 | `AGENT_NAMES` 削除                                     |
| A    | `RuntimeSkillCreatorFacade.ts`                | B と並列可 | fallback path を `PLAN_RESOURCE_REQUESTS` ベースに変更 |
| A    | `RuntimeSkillCreatorFacade.plan.test.ts`      | B と並列可 | agent 導出テスト追加                                   |
| B    | `SkillLifecyclePanel.tsx`                     | A と並列可 | `approvedSkillSpec` semantics をコメントで明確化       |
| B    | `SkillLifecyclePanel.llm-generation.test.tsx` | A と並列可 | drift 防止テスト確認・補強                             |

## TASK-P0-07 設計詳細

### 変更前

```typescript
for (const name of PLAN_PROMPT_CONSTANTS.AGENT_NAMES) {
  const content = await this.resourceLoader.loadAgent(name);
  agentSpecs.push({ name, content });
}
```

### 変更後

```typescript
for (const request of PLAN_RESOURCE_REQUESTS.filter(
  (r) => r.kind === "agent",
)) {
  const content = await this.resourceLoader.loadAgent(request.id);
  agentSpecs.push({ name: request.id, content });
}
```

- `AGENT_NAMES` を `planPromptConstants.ts` から完全削除
- `PLAN_RESOURCE_REQUESTS` の `kind === "agent"` エントリのみを使用
- reference エントリは agentSpecs に混入しない（filter で保証）
- 追加レイヤー・shared type 変更なし

## TASK-SDK-04-U2 設計詳細

### 変更内容

- `approvedSkillSpec` state 宣言にコメントを追加し semantics を明確化
- `setApprovedSkillSpec(trimmedRequest)` の呼び出し箇所にコメントを追加
- コメントにより「plan 承認時点の request snapshot を保持し、live textarea とは独立している」旨を明示
- `handleExecutePlan` の `approvedSkillSpec` 使用箇所にコメントを追加

### 状態変化

```
handlePrepare → setApprovedSkillSpec(trimmedRequest)  // plan 承認時点で snapshot を固定
handleExecutePlan → executePlan(planId, approvedSkillSpec)  // snapshot のみ使用
handleCancelPlan → setApprovedSkillSpec(null)  // cancel で snapshot をリセット
```

## タスク100%実行確認

- [x] P0-07 の source of truth が `PLAN_RESOURCE_REQUESTS` に固定されている
- [x] U2 の snapshot semantics が current code と整合している
- [x] 2 タスクの並列可否が明記されている
- [x] Phase 3 で判断できるだけの設計粒度になっている
