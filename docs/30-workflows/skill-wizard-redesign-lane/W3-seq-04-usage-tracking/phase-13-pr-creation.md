# Phase 13: PR 作成

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 13                           |
| タスクID   | UT-SKILL-WIZARD-W3-seq-04    |
| 機能名     | 使用率計装（usage tracking） |
| 前提Phase  | Phase 12                     |
| 後続Phase  | -                            |
| 作成日     | 2026-04-07                   |
| ステータス | blocked                      |

## 目的

Phase 11 / 12 の成果を local check で確認し、PR 作成可否を判断する。

ユーザーの明示承認がない限り、この Phase は blocked のまま維持する。PR は自動作成しない。

## 承認条件

- ユーザーの明示承認がある場合のみ PR 作成へ進む。
- 承認がない場合は local check の記録だけを残して終了する。
- 旧命名は使わず、canonical output name に統一する。

## Local Check

| チェック項目  | 確認内容                                                                                                                           | 期待結果               |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Phase 11 記録 | `manual-test-report.md` / `manual-test-checklist.md` / `manual-test-result.md` / `discovered-issues.md` の存在                     | すべて存在             |
| Phase 12 記録 | 6 つの canonical 成果物の存在                                                                                                      | すべて存在             |
| 命名整合      | `outputs/phase-12/system-spec-update-summary.md` / `outputs/phase-12/phase12-task-spec-compliance-check.md` の canonical name 一致 | 一致                   |
| 準拠状況      | planned wording / 参照切れ / 未同期が残っていないこと                                                                              | 残存なし               |
| ブロッカー    | PR 作成前に解消が必要な懸念                                                                                                        | ないか、ある場合は明記 |

## 参照資料

| 資料名                   | パス                                                     | 用途                |
| ------------------------ | -------------------------------------------------------- | ------------------- |
| 実装設計書               | `outputs/phase-2/implementation-design.md`               | Phase 2 成果物      |
| 実装サマリー             | `outputs/phase-5/implementation-summary.md`              | Phase 5 成果物      |
| 拡張テストケース         | `outputs/phase-6/expanded-test-cases.md`                 | Phase 6 成果物      |
| カバレッジ計画           | `outputs/phase-7/coverage-plan.md`                       | Phase 7 成果物      |
| リファクタ計画           | `outputs/phase-8/refactoring-plan.md`                    | Phase 8 成果物      |
| 品質レポート             | `outputs/phase-9/quality-report.md`                      | Phase 9 成果物      |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`                | Phase 10 成果物     |
| 手動テストレポート       | `outputs/phase-11/manual-test-report.md`                 | Phase 11 の実施概要 |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`              | Phase 11 の記録詳細 |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                 | Phase 11 の判定結果 |
| 仕様準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 の閉じ状態 |

## 実行タスク

1. Phase 11 / 12 の成果物を確認する。
2. local check を実施し、結果を `outputs/phase-13/local-check-result.md` に記録する。
3. 変更要約を `outputs/phase-13/change-summary.md` にまとめる。
4. ユーザー承認がある場合のみ PR 作成へ進む。
5. 承認がない場合は blocked のまま終了する。

## 成果物

| 成果物           | パス                                     | 説明                         |
| ---------------- | ---------------------------------------- | ---------------------------- |
| Local check 結果 | `outputs/phase-13/local-check-result.md` | Phase 11 / 12 の最終確認結果 |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | 変更範囲と PR 用要約         |
| PR 情報          | `outputs/phase-13/pr-info.md`            | 承認後のみ作成可             |
| PR 作成結果      | `outputs/phase-13/pr-creation-result.md` | 承認後のみ作成可             |

## PR 作成メモ

- PR タイトルと本文は local check の結果が揃ってから確定する。
- 承認前に `gh pr create` は実行しない。
- 承認がない場合は `pr-info.md` と `pr-creation-result.md` を作成しない。

## 完了条件

- [ ] `local-check-result.md` が作成されていること
- [ ] `change-summary.md` が作成されていること
- [ ] Phase 11 / 12 の canonical output name が一致していること
- [ ] ユーザー明示承認がない場合は blocked を維持していること
- [ ] PR を自動作成していないこと
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 11 / 12 成果物の確認
2. local check 実施
3. change summary 記録
4. 承認有無判定
5. PR 作成可否の判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase -: -
