# Phase 5: 実装

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 5              |
| 機能名     | TASK-RALLY-006 |
| 前提Phase  | Phase 4        |
| 後続Phase  | Phase 6        |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                                                      | 実行形態               |
| ---------- | --------------------------------------------------------- | ---------------------- |
| SubAgent-A | `workflowSnapshotPlanIdRef` 追加・ref 更新 useEffect 実装 | **直列**（最初に実施） |
| SubAgent-B | メイン useEffect の依存配列修正・ref 参照への書き換え     | **直列**（A 完了後）   |

## 実装手順

### ステップ1: ref 追加（SubAgent-A）

1. `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` を開く
2. RALLY-005 で追加した `workflowSnapshotRef` の近くに `workflowSnapshotPlanIdRef` を追加する

```typescript
const workflowSnapshotPlanIdRef = useRef(workflowSnapshot?.planId);
useEffect(() => {
  workflowSnapshotPlanIdRef.current = workflowSnapshot?.planId;
}, [workflowSnapshot?.planId]);
```

3. `pnpm --filter @repo/desktop typecheck` でエラーがないことを確認する

### ステップ2: 依存配列修正（SubAgent-B）

1. L675-708 付近の useEffect を特定する
2. エフェクト内の `workflowSnapshot?.planId` 参照を `workflowSnapshotPlanIdRef.current` に変更する
3. 依存配列から `workflowSnapshot?.planId` を除去する
4. 設計方針コメント「workflowSnapshot?.planId を除外した理由（循環防止）」を追記する
5. `pnpm --filter @repo/desktop typecheck` でエラーがないことを確認する
6. `pnpm --filter @repo/desktop lint` でエラーがないことを確認する

## 実装禁止事項

- L675-708 以外の useEffect の変更
- workflowSnapshot の更新権限設計の変更（RALLY-005 のスコープ）
- processWorkflowOutcome の await 統一（RALLY-008 のスコープ）
- UI/UX の変更

## 完了条件

- [ ] `workflowSnapshotPlanIdRef` が追加されている
- [ ] ref 更新用 useEffect が実装されている
- [ ] L675-708 の useEffect 依存配列から `workflowSnapshot?.planId` が除去されている
- [ ] エフェクト内のフォールバック参照が `workflowSnapshotPlanIdRef.current` に変更されている
- [ ] 設計方針コメントが追加されている
- [ ] `pnpm typecheck` がエラーなしで通過する
- [ ] `pnpm lint` がエラーなしで通過する

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 6: テスト拡充
