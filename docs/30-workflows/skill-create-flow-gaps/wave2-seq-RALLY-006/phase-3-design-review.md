# Phase 3: 設計レビュー

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 3              |
| 機能名     | TASK-RALLY-006 |
| 前提Phase  | Phase 2        |
| 後続Phase  | Phase 4        |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                                         | 実行形態               |
| ---------- | -------------------------------------------- | ---------------------- |
| SubAgent-A | ref 設計の妥当性確認（依存配列除外ロジック） | **並列**               |
| SubAgent-B | RALLY-005・RALLY-008 との整合性確認          | **並列**               |
| SubAgent-C | リスク評価統合・Phase 4 進行承認             | **直列**（A・B完了後） |

## チェック観点

- [ ] `workflowSnapshotPlanIdRef` が `workflowSnapshot?.planId` の変化を正しく追跡することを確認する
- [ ] メインの useEffect の依存配列に `workflowSnapshotPlanIdRef` 自体を含めないことが正しいことを確認する（ref は依存配列に含める必要がない）
- [ ] RALLY-005 で確立した `workflowSnapshotRef` と命名が衝突しないことを確認する
- [ ] エフェクトが `storePlanId` または `activePlanResult?.planId` の変化時にのみ再実行されることを確認する
- [ ] `react-hooks/exhaustive-deps` ルールへの準拠が設計段階で保証されていることを確認する
- [ ] RALLY-008（processWorkflowOutcome await 統一）のスコープに踏み込んでいないことを確認する

## リスク評価

| リスク                                                               | レベル | 対処                                                                            |
| -------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------- |
| ref 経由参照により `workflowSnapshot?.planId` の最新値が取得できない | 低     | ref 更新用 useEffect が `workflowSnapshot?.planId` 変化時に同期するため問題なし |
| planId が null の場合にエフェクトが不必要に実行されるリスク          | 低     | エフェクト冒頭の `if (!planId)` ガードで防止する                                |
| RALLY-005 の `workflowSnapshotRef` と命名が混乱する可能性            | 低     | 用途が異なるため命名で区別する（`workflowSnapshotPlanIdRef` を使用）            |
| `exhaustive-deps` 警告が残る可能性                                   | 低     | ref は依存配列不要のため警告は発生しない                                        |

## 完了条件

- [ ] リスク評価が全項目完了している
- [ ] 設計レビューのチェック観点が全件確認済みである
- [ ] Phase 4 進行への承認が得られている

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 4: テスト設計
