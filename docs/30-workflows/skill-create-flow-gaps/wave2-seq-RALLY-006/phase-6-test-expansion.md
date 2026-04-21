# Phase 6: テスト拡充

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 6              |
| 機能名     | TASK-RALLY-006 |
| 前提Phase  | Phase 5        |
| 後続Phase  | Phase 7        |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                         | 実行形態             |
| ---------- | ---------------------------- | -------------------- |
| SubAgent-A | TC-1〜TC-5 のテスト実装      | **並列**             |
| SubAgent-B | テスト実行・全件 PASS を確認 | **直列**（A 完了後） |

## テスト実装

### TC-1〜TC-5: useEffect 再実行タイミング

```typescript
// apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx

describe("L675-708 useEffect 依存配列修正", () => {
  it("TC-1: storePlanId が変化する場合、getWorkflowState が呼ばれる", () => {
    /* ... */
  });
  it("TC-2: activePlanResult?.planId が変化する場合、getWorkflowState が呼ばれる", () => {
    /* ... */
  });
  it("TC-3: workflowSnapshot?.planId のみが変化する場合、エフェクトが再実行されない", () => {
    /* ... */
  });
  it("TC-4: storePlanId/activePlanResult が null で workflowSnapshotPlanIdRef に値がある場合、ref の値で getWorkflowState が呼ばれる", () => {
    /* ... */
  });
  it("TC-5: planId が null の場合、getWorkflowState が呼ばれない", () => {
    /* ... */
  });
});
```

## テスト実行コマンド

```bash
pnpm --filter @repo/desktop test -- --reporter=verbose
```

## 完了条件

- [ ] TC-1〜TC-5 が全て実装されている
- [ ] 全テストが PASS している
- [ ] テスト実行結果が記録されている

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 7: カバレッジ確認
