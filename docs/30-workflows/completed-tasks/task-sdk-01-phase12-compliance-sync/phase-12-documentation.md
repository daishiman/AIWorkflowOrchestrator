# Phase 12: ドキュメント更新

## メタ情報

| 項目     | 値                                             |
| -------- | ---------------------------------------------- |
| Phase    | 12                                             |
| 機能名   | task-sdk-01-phase12-compliance-sync            |
| 作成日   | 2026-03-26                                     |
| タスクID | UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001 |

## 目的

親 workflow の Phase 12 成果物と aiworkflow 正本を current facts へ揃え、close-out を監査可能にする。

## 実行タスク

- Task 12-1: `implementation-guide.md` を Part 1 / Part 2 で是正する
- Task 12-2: Step 1-A〜1-C と Step 2 の summary を更新する
- Task 12-3: `documentation-changelog.md` に実更新と no-op 根拠を書く
- Task 12-4: `unassigned-task-detection.md` に current / baseline を分けて記録する
- Task 12-5: `skill-feedback-report.md` に改善点の有無と next action を記録する
- Task 12-6: `phase12-task-spec-compliance-check.md` で Task 12-1〜12-5 の完了を最終確認する

## 参照資料

| 資料名                    | パス                                                                                            | 説明               |
| ------------------------- | ----------------------------------------------------------------------------------------------- | ------------------ |
| phase-1 requirements      | `phase-1-requirements.md`                                                                       | AC                 |
| phase-2 design            | `phase-2-design.md`                                                                             | lane               |
| phase-5 implementation    | `phase-5-implementation.md`                                                                     | 更新順             |
| phase-6 test expansion    | `phase-6-test-expansion.md`                                                                     | regression 観点    |
| phase-7 coverage check    | `phase-7-coverage-check.md`                                                                     | coverage           |
| phase-8 refactoring       | `phase-8-refactoring.md`                                                                        | wording            |
| phase-9 quality assurance | `phase-9-quality-assurance.md`                                                                  | quality checklist  |
| phase-10 final review     | `phase-10-final-review.md`                                                                      | gate               |
| phase-11 manual test      | `phase-11-manual-test.md`                                                                       | human audit        |
| phase-12 guide            | `../../../.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | outputs と wording |
| spec update workflow      | `../../../.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 1 / Step 2    |

## 実行手順

### ステップ1: parent Phase 12 outputs を是正する

implementation guide、summary、changelog、detection、compliance-check の本文を current facts へ揃える。

### ステップ2: ledger と no-op 根拠を閉じる

`task-workflow.md`、backlog、completed ledger、LOGS 2ファイル、SKILL 2ファイル、lessons、domain spec の更新または no-op 理由を記録する。

### ステップ3: validator 結果を転記する

Phase 12 validator、workflow validator、unassigned-task 監査の結果を summary と changelog に転記する。

## 統合テスト連携

| 観点             | 実施内容                            |
| ---------------- | ----------------------------------- |
| Part 1 / Part 2  | implementation guide の必須構造確認 |
| Step 1 / Step 2  | summary と changelog の主張一致確認 |
| unassigned audit | `currentViolations=0` の確認        |

## 多角的チェック観点

| 観点     | この Phase で確認する内容                   |
| -------- | ------------------------------------------- |
| 規律     | future wording を残していないか             |
| 証跡性   | no-op と実更新の根拠が両方残っているか      |
| 正本同期 | `.claude` 正本と index 再生成が閉じているか |

## サブタスク管理

1. parent Phase 12 outputs 是正
2. ledger と no-op 根拠記録
3. validator 結果転記
4. Phase 13 blocked 確認

## 成果物

| 成果物                     | パス                                                     | 説明                    |
| -------------------------- | -------------------------------------------------------- | ----------------------- |
| implementation guide       | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2 是正    |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 記録    |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | 更新履歴                |
| unassigned task detection  | `outputs/phase-12/unassigned-task-detection.md`          | current / baseline 記録 |
| skill feedback report      | `outputs/phase-12/skill-feedback-report.md`              | skill 改善メモ          |
| phase12 compliance check   | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 必須 6 タスク確認       |

## 完了条件

- [x] Task 12-1 から Task 12-5 の成果物が揃っている
- [x] Step 1 と Step 2 の主張が一致している
- [x] `currentViolations=0` が確認されている
- [x] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x] Phase 1 を参照した
- [x] Phase 2 を参照した
- [x] Phase 5 を参照した
- [x] Phase 6 を参照した
- [x] Phase 7 を参照した
- [x] Phase 8 を参照した
- [x] Phase 9 を参照した
- [x] Phase 10 を参照した
- [x] Phase 11 を参照した

## 次のPhase

Phase 13: PR作成
