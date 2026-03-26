# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 12                                    |
| 機能名 | task-sdk-02-system-spec-and-path-sync |
| 作成日 | 2026-03-26                            |

## 目的

same-wave remediation の implementation guide、system spec update summary、changelog、未タスク有無、skill feedback、compliance check を揃え、docs-only task を documentation wave で閉じる。

## 実行タスク

- implementation guide を作成する
- system spec update summary を作成する
- documentation changelog を作成する
- unassigned detection を作成する
- skill feedback report を作成する
- compliance check を作成する

## 参照資料

| 資料名                | パス                                           | 説明            |
| --------------------- | ---------------------------------------------- | --------------- |
| Phase 1 要件          | `phase-1-requirements.md`                      | acceptance      |
| Phase 2 設計          | `phase-2-design.md`                            | same-wave 順    |
| Phase 5 成果物        | `outputs/phase-5/implementation-sequencing.md` | 実更新対象      |
| Phase 6 成果物        | `outputs/phase-6/test-expansion-summary.md`    | guard           |
| Phase 7 成果物        | `outputs/phase-7/coverage-summary.md`          | coverage        |
| Phase 8 成果物        | `outputs/phase-8/refactoring-summary.md`       | 正規化          |
| Phase 9 成果物        | `outputs/phase-9/qa-summary.md`                | QA              |
| Phase 4 テスト作成    | `phase-4-test-creation.md`                     | validator 群    |
| Phase 10 最終レビュー | `phase-10-final-review.md`                     | 最終 gate       |
| Phase 11 手動テスト   | `phase-11-manual-test.md`                      | manual evidence |

### システム仕様（aiworkflow-requirements）

| 参照資料                  | パス                                                                                                    | 内容                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| completed ledger          | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                          | current fact                              |
| lessons                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md`       | 未完了表現 0 件ルール                     |
| workflow integration spec | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md` | canonical set / artifact inventory の書式 |

## 実行手順

### ステップ1: 必須 6 成果物を揃える

- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/system-spec-update-summary.md`
- `outputs/phase-12/documentation-changelog.md`
- `outputs/phase-12/unassigned-task-detection.md`
- `outputs/phase-12/skill-feedback-report.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`

### ステップ2: same-wave 根拠を残す

- 更新対象、実行順、no-op 根拠、validator 実測値を明記する。

### ステップ3: 未完了表現を禁止する

- `更新予定`、`後でやる`、`後続判断待ち` を残さない。

## 成果物

| 成果物                     | パス                                                     | 説明                    |
| -------------------------- | -------------------------------------------------------- | ----------------------- |
| ドキュメント更新           | `phase-12-documentation.md`                              | documentation wave 本文 |
| implementation guide       | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2         |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | same-wave 対象一覧      |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | 変更履歴と validation   |
| unassigned detection       | `outputs/phase-12/unassigned-task-detection.md`          | follow-up 有無          |
| skill feedback             | `outputs/phase-12/skill-feedback-report.md`              | skill 改善点            |
| compliance check           | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 完了確認       |

## 完了条件

- [ ] 必須 6 成果物が揃っている
- [ ] same-wave 更新対象と no-op 根拠が明記されている
- [ ] 未完了表現が 0 件である
- [ ] validator 実測値が changelog と compliance check に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. Task 12-1 から Task 12-6 の出力
3. 成果物の作成・配置
4. artifacts.json 同期の確認
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最新の成果物名と整合している
- [ ] same-wave 対象と検証結果が outputs/phase-12 に揃っている
