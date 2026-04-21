# Phase 11: 手動テスト

## メタ情報

| 項目       | 値                                                |
| ---------- | ------------------------------------------------- |
| Phase      | 11                                                |
| 機能名     | TASK-RALLY-008                                    |
| タスク名   | processWorkflowOutcomeのfire-and-forget不整合修正 |
| 前提Phase  | Phase 10                                          |
| 後続Phase  | Phase 12                                          |
| 作成日     | 2026-04-21                                        |
| ステータス | pending                                           |

## 目的

Electronアプリ上で実際の動作を手動確認し、processWorkflowOutcomeのエラーが正しくUIに反映されることを証跡付きで検証する。

## 実行タスク

- スクリーンショット計画を策定する
- processWorkflowOutcomeがエラーを返した場合にUIにエラー状態が表示されることを確認する
- handleExecutePlan経由とuseEffect経由の両方でエラーハンドリングが一貫していることを確認する
- 手動テスト結果を記録する
- 証跡（スクリーンショット等）を収集してインデックスを作成する

## 参照資料

| 資料名           | パス                                              | 用途           |
| ---------------- | ------------------------------------------------- | -------------- |
| 出荷準備チェック | `outputs/phase-10/release-readiness-checklist.md` | Phase 10成果物 |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`         | Phase 10成果物 |
| テスト仕様書     | `outputs/phase-4/test-specification.md`           | Phase 4成果物  |

## 成果物

| 成果物                 | パス                                     | 説明               |
| ---------------------- | ---------------------------------------- | ------------------ |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md` | 手動テスト実施結果 |
| 証跡インデックス       | `outputs/phase-11/evidence-index.md`     | 証跡ファイル一覧   |
| スクリーンショット計画 | `outputs/phase-11/screenshot-plan.md`    | 証跡収集計画       |

## 完了条件

- [ ] processWorkflowOutcomeエラー時のUIエラー表示が確認されていること
- [ ] handleExecutePlan・useEffect両経由でエラーハンドリングが一貫していることが確認されていること
- [ ] 手動テスト結果が記録されていること
- [ ] 証跡インデックスが作成されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 12: ドキュメント更新
