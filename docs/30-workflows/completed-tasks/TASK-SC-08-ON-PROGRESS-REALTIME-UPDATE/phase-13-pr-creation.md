# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 13                                                                          |
| 機能名     | TASK-SC-08                                                                  |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 前提Phase  | Phase 12                                                                    |
| 後続Phase  | -                                                                           |
| 作成日     | 2026-04-19                                                                  |
| ステータス | blocked                                                                     |

## 目的

user の明示承認がある場合だけ PR 作成へ進める状態を整える。承認前の標準状態は `blocked` とし、commit / push / PR 作成は実行しない。

## 実行タスク

- 変更サマリー整理: PR 本文に必要な差分要約を `change-summary.md` へ固定する
- ローカル確認整理: typecheck / lint / test / manual evidence の結果要約を `local-check-result.md` へ固定する
- 承認確認: user approval の有無を `approval-checklist.md` へ記録する

## blocked ルール

1. user approval 未取得の間、Phase 13 は `blocked` のままとする
2. commit / push / PR create は scope 外とし、この phase spec には実行コマンドを持ち込まない
3. 承認取得後も、まず `local-check-result.md` と `change-summary.md` の整合を確認してから次のアクションを判断する

## 参照資料

| 参照資料                 | パス                                                     | 説明             |
| ------------------------ | -------------------------------------------------------- | ---------------- |
| 実装サマリー             | `outputs/phase-5/implementation-summary.md`              | 変更内容の正本   |
| 品質レポート             | `outputs/phase-9/quality-report.md`                      | 品質確認         |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`                | 出荷判断         |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                 | 実測 evidence    |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | ドキュメント反映 |
| system spec 更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | sync 結果        |
| 準拠最終確認             | `outputs/phase-12/phase12-task-spec-compliance-check.md` | close-out 根拠   |

## 実行手順

1. Phase 12 までの完了根拠を確認する。
2. `change-summary.md` と `local-check-result.md` を更新する。
3. user approval がない場合は `approval-checklist.md` に blocked 理由を記録して終了する。

## 成果物

| 成果物           | パス                                     | 説明                                             |
| ---------------- | ---------------------------------------- | ------------------------------------------------ |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | typecheck / lint / test / manual evidence の要約 |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | PR 用差分要約                                    |
| 承認チェック     | `outputs/phase-13/approval-checklist.md` | user approval の有無                             |

## 完了条件

- [ ] `local-check-result.md` / `change-summary.md` / `approval-checklist.md` が存在する
- [ ] user approval 未取得時は blocked 理由が記録されている
- [ ] user approval なしでは commit / push / PR 作成を実行していない

## 次のPhase

なし
