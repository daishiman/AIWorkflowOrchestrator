# Phase 3: 設計レビュー

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 3              |
| 機能名     | TASK-RALLY-005 |
| 前提Phase  | Phase 2        |
| 後続Phase  | Phase 4        |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                                        | 実行形態               |
| ---------- | ------------------------------------------- | ---------------------- |
| SubAgent-A | seqNo設計の妥当性確認（競合解消ロジック）   | **並列**               |
| SubAgent-B | RALLY-006・RALLY-008・RALLY-003への影響確認 | **並列**               |
| SubAgent-C | リスク評価統合・Phase 4進行承認             | **直列**（A・B完了後） |

## チェック観点

- [ ] `seqNo` フィールドが `WorkflowSnapshot` 型に追加されることで、RALLY-006（useEffect依存配列）への影響がないことを確認する
- [ ] `pendingPushRef` のキューイングロジックが `isSubmitting` フラグと正しく連動することを確認する
- [ ] seqNo がない場合の `Date.now()` フォールバックが競合解消として十分かを確認する
- [ ] `useCallback` の依存配列に `isSubmitting` と `applyWorkflowSnapshot` を含めることで `react-hooks/exhaustive-deps` 警告が発生しないことを確認する
- [ ] 後続タスク RALLY-006 が本タスクの `workflowSnapshotRef` を前提として利用できることを確認する
- [ ] 後続タスク RALLY-008 が本タスクの `isSubmitting` ガードを前提として利用できることを確認する

## リスク評価

| リスク                                                                  | レベル | 対処                                                                               |
| ----------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------- |
| seqNo がサーバー側で提供できない場合に競合解消が不完全になる            | 中     | updatedAt または Date.now() フォールバックで最低限の isSubmitting ガードを保証する |
| pendingPushRef が複数の push を上書きし古い push が失われる             | 低     | 最新の push のみ保持する仕様とし、seqNo で新旧を判断する                           |
| useCallback の依存配列変更が既存の ESLint 設定と競合する                | 低     | pnpm lint で事前確認する                                                           |
| workflowSnapshotRef の更新タイミングが React の render cycle と競合する | 低     | useEffect で workflowSnapshot 変化時に同期するため問題なし                         |

## 完了条件

- [ ] リスク評価が全項目完了している
- [ ] 設計レビューのチェック観点が全件確認済みである
- [ ] Phase 4 進行への承認が得られている

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 4: テスト設計
