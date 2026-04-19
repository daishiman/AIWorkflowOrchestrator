# Phase 13: PR作成

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 13                                |
| タスクID   | TASK-SW-CANCEL-003                |
| 機能名     | skill-creator-cancel-main-handler |
| 前提Phase  | Phase 12                          |
| 後続Phase  | -                                 |
| 作成日     | 2026-04-15                        |
| ステータス | blocked                           |

## 目的

ユーザーの明示承認がある場合にだけ、ローカル確認結果と変更サマリーを整理し、PR 情報を作成できる状態にする。

## 背景

この workflow では commit / push / PR 作成はユーザー指示があるまで禁止である。したがって Phase 13 は骨格だけを保持し、通常は blocked のまま閉じる。

## 実行タスク

### タスク0: blocked 条件の確認

**目的**: PR 作成が実行対象外であることを明示する。

**実行手順**:

1. ユーザー承認がないことを確認する。
2. commit / push / PR を実行していないことを確認する。
3. Phase 12 までの完了状況だけを記録する。

**期待される成果物**:

- `outputs/phase-13/local-check-result.md`
- `outputs/phase-13/change-summary.md`

### タスク1: 将来の PR 情報整理

**目的**: 承認後に必要になる情報だけを整える。

**実行手順**:

1. ローカル確認結果を `local-check-result.md` に整理する。
2. 変更要旨を `change-summary.md` に整理する。
3. 承認後にのみ `pr-info.md` を作成対象とする。

**期待される成果物**:

- `outputs/phase-13/pr-info.md`

## 参照資料

| 参照資料                     | パス                                                                             | 内容                |
| ---------------------------- | -------------------------------------------------------------------------------- | ------------------- |
| Phase 13 テンプレート        | `.claude/skills/task-specification-creator/references/phase-template-phase13.md` | blocked Phase 骨格  |
| Phase 2 差分確認設計         | `outputs/phase-2/design.md`                                                      | PR 対象の責務境界   |
| Phase 5 差分確認             | `outputs/phase-5/implementation-summary.md`                                      | 変更対象要約        |
| Phase 6 テスト拡充記録       | `outputs/phase-6/test-expansion-record.md`                                       | 追加テスト観点      |
| Phase 7 カバレッジ           | `outputs/phase-7/coverage-report.md`                                             | coverage 要約       |
| Phase 8 リファクタリング記録 | `outputs/phase-8/refactoring-log.md`                                             | 変更点ログ          |
| Phase 9 品質保証             | `outputs/phase-9/quality-report.md`                                              | local check の前提  |
| Phase 11 手動テスト結果      | `outputs/phase-11/TASK-SW-CANCEL-003-manual-test-report.md`                      | NON_VISUAL evidence |
| Phase 12 準拠チェック        | `outputs/phase-12/phase12-task-spec-compliance-check.md`                         | close-out 根拠      |
| Phase 10 レビュー結果        | `outputs/phase-10/final-review-result.md`                                        | PR 前提の判定根拠   |
| 手動テストチェックリスト     | `outputs/phase-11/manual-test-checklist.md`                                      | Phase 11 成果物     |
| 発見事項一覧                 | `outputs/phase-11/discovered-issues.md`                                          | Phase 11 成果物     |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`                                       | Phase 12 成果物     |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`                                 | Phase 12 成果物     |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`                                    | Phase 12 成果物     |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`                                  | Phase 12 成果物     |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`                                      | Phase 12 成果物     |

## 成果物

| 成果物           | パス                                     | 内容                              |
| ---------------- | ---------------------------------------- | --------------------------------- |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | 承認後に転用する local check 要約 |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | 変更点要約                        |
| PR情報           | `outputs/phase-13/pr-info.md`            | 承認後のみ作成する PR 下書き情報  |

## 統合テスト連携【必須】

| 判定項目                                | 基準 | 結果    |
| --------------------------------------- | ---- | ------- |
| blocked 条件が明記されている            | 完了 | pending |
| commit / push / PR 未実行を確認している | 完了 | pending |
| 将来成果物が整理されている              | 完了 | pending |

## 完了条件

- [ ] ユーザー承認待ちであることを明記している
- [ ] commit / push / PR を実行していない
- [ ] `local-check-result.md` と `change-summary.md` の扱いを定義している
- [ ] `pr-info.md` は承認後のみ作成と明記している
