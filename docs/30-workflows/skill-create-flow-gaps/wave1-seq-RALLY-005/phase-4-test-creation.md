# Phase 4: テスト設計

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 4              |
| 機能名     | TASK-RALLY-005 |
| 前提Phase  | Phase 3        |
| 後続Phase  | Phase 5        |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                                           | 実行形態               |
| ---------- | ---------------------------------------------- | ---------------------- |
| SubAgent-A | SkillLifecyclePanel 競合ガードの単体テスト設計 | **並列**               |
| SubAgent-B | creatorHandlers seqNo付与の単体テスト設計      | **並列**               |
| SubAgent-C | テスト仕様統合・重複排除                       | **直列**（A・B完了後） |

## テストケース一覧

### SkillLifecyclePanel 競合ガード（Vitest）

テスト対象: `onWorkflowStateChanged` 受信処理・`pendingPushRef` キューイング

| テストID | 内容                                               | 期待結果                                                   |
| -------- | -------------------------------------------------- | ---------------------------------------------------------- |
| TC-1     | isSubmitting=true 中に push が届く                 | pendingPushRef に格納、applyWorkflowSnapshot は未呼び出し  |
| TC-2     | isSubmitting=false 中に新しい seqNo の push が届く | applyWorkflowSnapshot が呼ばれる                           |
| TC-3     | isSubmitting=false 中に古い seqNo の push が届く   | applyWorkflowSnapshot は未呼び出し                         |
| TC-4     | isSubmitting が true→false になる                  | pendingPushRef の内容が applyWorkflowSnapshot で適用される |
| TC-5     | seqNo なしの push が届く                           | Date.now() フォールバックで判定される                      |

### creatorHandlers seqNo付与

| テストID | 内容                                           | 期待結果                               |
| -------- | ---------------------------------------------- | -------------------------------------- |
| TC-6     | getWorkflowState が snapshot を返す            | snapshot に seqNo フィールドが含まれる |
| TC-7     | onWorkflowStateChanged push が snapshot を送る | snapshot に seqNo フィールドが含まれる |

## テストファイルパス

- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`（新規作成 or 既存拡張）
- `apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts`（既存拡張）

## 完了条件

- [ ] TC-1〜TC-7 のテスト仕様が全件確定している
- [ ] テストファイルパスが特定されている
- [ ] SubAgent-A・B の設計結果が統合済みである

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 5: 実装
