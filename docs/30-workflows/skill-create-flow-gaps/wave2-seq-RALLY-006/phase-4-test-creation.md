# Phase 4: テスト設計

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 4              |
| 機能名     | TASK-RALLY-006 |
| 前提Phase  | Phase 3        |
| 後続Phase  | Phase 5        |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                                       | 実行形態               |
| ---------- | ------------------------------------------ | ---------------------- |
| SubAgent-A | useEffect 再実行タイミングの単体テスト設計 | **並列**               |
| SubAgent-B | ref 経由参照の単体テスト設計               | **並列**               |
| SubAgent-C | テスト仕様統合・重複排除                   | **直列**（A・B完了後） |

## テストケース一覧

### useEffect 再実行タイミング（Vitest）

テスト対象: L675-708 付近の useEffect の実行タイミング

| テストID | 内容                                                                                 | 期待結果                                                |
| -------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| TC-1     | `storePlanId` が変化する                                                             | エフェクトが再実行される（getWorkflowState が呼ばれる） |
| TC-2     | `activePlanResult?.planId` が変化する                                                | エフェクトが再実行される（getWorkflowState が呼ばれる） |
| TC-3     | `workflowSnapshot?.planId` のみが変化する                                            | エフェクトが再実行されない（循環なし）                  |
| TC-4     | storePlanId/activePlanResult がどちらも null で workflowSnapshotPlanIdRef に値がある | ref の値で getWorkflowState が呼ばれる                  |
| TC-5     | planId が null の場合                                                                | getWorkflowState が呼ばれない                           |

## テストファイルパス

- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`（既存拡張）

## 完了条件

- [ ] TC-1〜TC-5 のテスト仕様が全件確定している
- [ ] テストファイルパスが特定されている
- [ ] SubAgent-A・B の設計結果が統合済みである

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 5: 実装
