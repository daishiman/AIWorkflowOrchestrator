# Phase 5: 実装ログ

## Lane A: TASK-P0-07 実装結果

### 変更ファイル1: planPromptConstants.ts

- `AGENT_NAMES` 定数を削除
- `PLAN_RESOURCE_REQUESTS` が唯一の source of truth になった

### 変更ファイル2: RuntimeSkillCreatorFacade.ts（L823-828）

```typescript
// 変更前
for (const name of PLAN_PROMPT_CONSTANTS.AGENT_NAMES) {
  const content = await this.resourceLoader.loadAgent(name);
  agentSpecs.push({ name, content });
}

// 変更後
// fallback path: PLAN_RESOURCE_REQUESTS が唯一の source of truth。
// kind === "agent" のエントリのみを agent 名として使用し、reference が混入しない。
for (const request of PLAN_RESOURCE_REQUESTS.filter(
  (r) => r.kind === "agent",
)) {
  const content = await this.resourceLoader.loadAgent(request.id);
  agentSpecs.push({ name: request.id, content });
}
```

### 変更ファイル3: RuntimeSkillCreatorFacade.plan.test.ts

- T-P7-02（reference 混入防止）追加
- T-P7-04（AGENT_NAMES 非依存の検証）追加

## Lane B: TASK-SDK-04-U2 実装結果

### 変更ファイル1: SkillLifecyclePanel.tsx

- `approvedSkillSpec` state 宣言に semantics を明示するコメント追加
- `setApprovedSkillSpec(trimmedRequest)` の呼び出し箇所にコメント追加
- `executePlan(planId, approvedSkillSpec ?? undefined)` の呼び出し箇所にコメント追加

### 変更ファイル2: SkillLifecyclePanel.llm-generation.test.tsx

- 変更なし（U-8b / U-18b / U-19b / U-20b / U-21 が既に drift 防止テストを網羅）

## テスト実行結果

| テストファイル                                | 実行結果                             | 備考                                                                                                |
| --------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `RuntimeSkillCreatorFacade.plan.test.ts`      | **23/23 PASS**                       | 新規 T-P7-02, T-P7-04 含む                                                                          |
| `SkillLifecyclePanel.llm-generation.test.tsx` | 33/35 PASS（2 pre-existing failure） | 失敗2件は `@testing-library/jest-dom` マッチャー未設定による pre-existing failure（変更前から存在） |

## 型チェック結果

```
pnpm --filter @repo/desktop typecheck → エラーなし（exit 0）
```

## AGENT_NAMES 残留参照

```
grep AGENT_NAMES apps/desktop/src/ → テストのコメントのみ（機能コードに残留なし）
```
