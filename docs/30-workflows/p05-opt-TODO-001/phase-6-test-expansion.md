# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 6                                    |
| タスクID   | TASK-SW-TODO-001                     |
| 機能名     | conversation-round-step-todo-cleanup |
| 前提Phase  | Phase 5                              |
| 後続Phase  | Phase 7                              |
| 作成日     | 2026-04-20                           |
| ステータス | completed                            |

## 目的

verify_existing task として追加テストの必要性を判定し、不足なしならその根拠を残す。

## 判定

| 観点                 | 判定 | 根拠                                                                           |
| -------------------- | ---- | ------------------------------------------------------------------------------ |
| 新規 unit test       | 不要 | cleanup 対象はすでに削除済みで current fact の確認が主目的                     |
| 追加 regression      | 不要 | `resolveExternalIntegration(toolNames)` は既存 current contract として確認済み |
| ドキュメント上の補足 | 必要 | verification 根拠を outputs に集約する                                         |

## 成果物

| 成果物           | パス                                   | 説明           |
| ---------------- | -------------------------------------- | -------------- |
| 回帰確認レポート | `outputs/phase-6/regression-report.md` | 追加不要の根拠 |

## 完了条件

- [x] 追加テスト不要の根拠を記録した
- [x] Phase 7 に引き渡す concern を固定した
- [x] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本 Phase 内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

## 次のPhase

Phase 7: カバレッジ確認
