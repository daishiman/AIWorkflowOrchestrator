# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 13                                      |
| タスクID   | TASK-RALLY-001                          |
| 機能名     | skill-lifecycle-panel-dead-code-removal |
| 前提Phase  | Phase 12                                |
| 後続Phase  | - （タスク完了）                        |
| 作成日     | 2026-04-21                              |
| ステータス | blocked                                 |

## 目的

Phase 12 までの完了根拠とローカル確認結果を固定し、user approval 取得後にのみ commit / PR へ進める状態を整える。

## 実行タスク

- タスク1: blocked 条件と approval 状態を明記する
- タスク2: approval 後に必要な成果物だけを定義する
- タスク3: 実際の commit / PR 実行を本 workflow 外へ分離する

## blocked 条件

- user approval 未取得
- commit / push / PR 作成は本 workflow のスコープ外
- Phase 12 close-out と local check 要約がそろうまで開始しない

## 現時点の扱い

- 実行状態: `blocked`
- user approval: `未取得`
- 許可取得後に実施する内容: commit 方針確認、差分再確認、PR本文整形、CI確認

## user approval 後に行う準備内容

1. 変更サマリーを `outputs/phase-13/change-summary.md` に固定する
2. local check 結果を `outputs/phase-13/local-check-result.md` に要約する
3. PR 本文に載せる背景・テスト・依存タスクを `outputs/phase-13/pr-info.md` に整形する
4. 実際に PR を作成した場合のみ `outputs/phase-13/pr-creation-result.md` を生成する

## 参照資料

| 資料名                     | パス                                             | 用途             |
| -------------------------- | ------------------------------------------------ | ---------------- |
| 最終レビュー結果           | `outputs/phase-10/final-review-result.md`        | ゲート通過の確認 |
| 手動テスト結果             | `outputs/phase-11/manual-test-result.md`         | evidence 確認    |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md` | close-out 根拠   |

## 成果物

| 成果物             | パス                                     | 説明                          |
| ------------------ | ---------------------------------------- | ----------------------------- |
| change summary     | `outputs/phase-13/change-summary.md`     | approval 後に提出する変更要約 |
| local check result | `outputs/phase-13/local-check-result.md` | 事前確認結果                  |
| pr info            | `outputs/phase-13/pr-info.md`            | PR本文の下書き                |
| pr creation result | `outputs/phase-13/pr-creation-result.md` | 実際に作成した場合のみ        |

## 完了条件

- [ ] user approval を取得した
- [ ] `change-summary.md` と `local-check-result.md` を作成した
- [ ] 実際に PR を作成した場合のみ `pr-creation-result.md` を記録した

## タスク100%実行確認【必須】

- [ ] Phase 1（要件定義）完了・P50チェック実施済み
- [ ] Phase 2（設計）完了
- [ ] Phase 3（設計レビュー）完了・ゲートPASS
- [ ] Phase 4（テスト作成）完了
- [ ] Phase 5（実装）完了
- [ ] Phase 6（テスト拡充）完了
- [ ] Phase 7（カバレッジ確認）完了
- [ ] Phase 8（リファクタリング）完了
- [ ] Phase 9（品質保証）完了
- [ ] Phase 10（最終レビュー）完了・ゲートPASS
- [ ] Phase 11（手動テスト）完了
- [ ] Phase 12（ドキュメント）完了
- [ ] 受け入れ基準 AC-1〜AC-5 全 PASS
- [ ] user approval 未取得時は blocked のまま維持
