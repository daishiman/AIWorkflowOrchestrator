# Phase 5: 実装

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 5              |
| 機能名     | TASK-RALLY-005 |
| 前提Phase  | Phase 4        |
| 後続Phase  | Phase 6        |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                                                         | 実行形態               |
| ---------- | ------------------------------------------------------------ | ---------------------- |
| SubAgent-A | 型定義変更（skillCreator.ts に seqNo 追加）                  | **直列**（最初に実施） |
| SubAgent-B | creatorHandlers.ts の seqNo 付与（SubAgent-A完了後）         | **直列**               |
| SubAgent-C | SkillLifecyclePanel.tsx の競合ガード実装（SubAgent-B完了後） | **直列**               |

## 実装手順

### ステップ1: 型定義追加（SubAgent-A）

1. `packages/shared/src/types/skillCreator.ts` を開く
2. `WorkflowSnapshot` 型に `seqNo?: number` フィールドと JSDoc を追加する
3. `pnpm --filter @repo/shared typecheck` でエラーがないことを確認する

### ステップ2: seqNo 付与（SubAgent-B）

1. `apps/desktop/src/main/ipc/creatorHandlers.ts` を開く
2. `getWorkflowState` の返却値に `seqNo` を付与する
3. `onWorkflowStateChanged` push の snapshot に `seqNo` を付与する
4. `pnpm --filter @repo/desktop typecheck` でエラーがないことを確認する

### ステップ3: 競合ガード実装（SubAgent-C）

1. `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` を開く
2. `workflowSnapshotRef` と `pendingPushRef` を追加する
3. `handleWorkflowStateChanged`（または既存の onWorkflowStateChanged 受信処理）を競合ガード付きに書き換える
4. invoke 戻り値の処理箇所に「正規ソース」コメントを追加する
5. isSubmitting が false に戻ったときに pendingPush を適用する useEffect を追加する
6. `pnpm --filter @repo/desktop typecheck` でエラーがないことを確認する
7. `pnpm --filter @repo/desktop lint` でエラーがないことを確認する

## 実装禁止事項

- Undo のサーバー rollback API 追加（RALLY-003 のスコープ）
- useEffect 依存配列の修正（RALLY-006 のスコープ）
- processWorkflowOutcome の await 統一（RALLY-008 のスコープ）
- UI/UX の変更

## 完了条件

- [ ] `WorkflowSnapshot` 型に seqNo フィールドが追加されている
- [ ] creatorHandlers.ts が snapshot に seqNo を付与して返している
- [ ] SkillLifecyclePanel.tsx に workflowSnapshotRef と pendingPushRef が実装されている
- [ ] onWorkflowStateChanged の受信処理に isSubmitting ガードと seqNo 比較ガードが実装されている
- [ ] invoke 戻り値の処理箇所に「正規ソース」コメントが追加されている
- [ ] `pnpm typecheck` がエラーなしで通過する
- [ ] `pnpm lint` がエラーなしで通過する

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 6: テスト拡充
