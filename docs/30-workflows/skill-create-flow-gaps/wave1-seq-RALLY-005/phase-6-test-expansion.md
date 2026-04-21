# Phase 6: テスト拡充

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 6              |
| 機能名     | TASK-RALLY-005 |
| 前提Phase  | Phase 5        |
| 後続Phase  | Phase 7        |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                                                  | 実行形態               |
| ---------- | ----------------------------------------------------- | ---------------------- |
| SubAgent-A | TC-1〜TC-5（SkillLifecyclePanel競合ガード）テスト実装 | **並列**               |
| SubAgent-B | TC-6〜TC-7（creatorHandlers seqNo付与）テスト実装     | **並列**               |
| SubAgent-C | テスト実行・全件PASSを確認                            | **直列**（A・B完了後） |

## テスト実装

### TC-1〜TC-5: SkillLifecyclePanel競合ガード

```typescript
// apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx

describe("onWorkflowStateChanged 競合ガード", () => {
  it("TC-1: isSubmitting=true 中に push が届く場合、pendingPushRef に格納される", () => {
    /* ... */
  });
  it("TC-2: isSubmitting=false 中に新しい seqNo の push が届く場合、applyWorkflowSnapshot が呼ばれる", () => {
    /* ... */
  });
  it("TC-3: isSubmitting=false 中に古い seqNo の push が届く場合、applyWorkflowSnapshot は呼ばれない", () => {
    /* ... */
  });
  it("TC-4: isSubmitting が true→false になる場合、pendingPush が適用される", () => {
    /* ... */
  });
  it("TC-5: seqNo なしの push が届く場合、Date.now() フォールバックで判定される", () => {
    /* ... */
  });
});
```

### TC-6〜TC-7: creatorHandlers seqNo付与

```typescript
// apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts

describe("seqNo付与", () => {
  it("TC-6: getWorkflowState が返す snapshot に seqNo が含まれる", () => {
    /* ... */
  });
  it("TC-7: onWorkflowStateChanged push の snapshot に seqNo が含まれる", () => {
    /* ... */
  });
});
```

## テスト実行コマンド

```bash
pnpm --filter @repo/desktop test -- --reporter=verbose
```

## 完了条件

- [ ] TC-1〜TC-7 が全て実装されている
- [ ] 全テストが PASS している
- [ ] テスト実行結果が記録されている

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 7: カバレッジ確認
