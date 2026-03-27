# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                                                |
| ------ | ----------------------------------------------------------------- |
| Phase  | 12                                                                |
| 機能名 | task-imp-runtime-policy-centralization-implementation-closure-001 |
| 作成日 | 2026-03-27                                                        |

## 目的

implementation guide、system spec 同期、未タスク判定、skill feedback を same-wave で閉じる。

## 実行タスク

| Task      | 内容                                                                 | 成果物                                                   |
| --------- | -------------------------------------------------------------------- | -------------------------------------------------------- |
| Task 12-1 | implementation guide を 2 パート構成で作成する                       | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | system spec update summary に Step 1 / Step 2 / no-op 根拠を記録する | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | documentation changelog を事後記録で作成する                         | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | unassigned task detection を 0件時も含めて作成する                   | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | skill feedback report を改善点の有無にかかわらず作成する             | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | Task 12-1〜12-5 と planned wording / blocked 条件を最終監査する      | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: Part 1 では `たとえば` を含む日常アナロジー、Part 2 では current contract / target delta / API / edge case / 設定値を必ず分離する
- Task 12-2: Step 1-A〜1-C、Step 2 の要否判定、canonical `.claude` root、mirror `.agents` parity、`artifacts.json` 2系統同期を事実ベースで残す
- Task 12-3: 変更ファイル、validator 結果、current / baseline、same-wave sync 対象を future wording なしで記録する
- Task 12-4: source issue / Phase 10 MINOR / Phase 11 発見事項 / 未処理コメントを確認し、0件でも判断根拠を残す
- Task 12-5: 改善点がない場合も「改善点なし」と再利用可能な理由を書く
- Task 12-6: `phase-12-documentation.md`、`outputs/phase-12/*.md`、Phase 13 `blocked`、manual evidence 状態を突合する

## 参照資料

| 資料名               | パス                                                                                   | 説明                             |
| -------------------- | -------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 2              | `phase-2-design.md`                                                                    | wiring / shared sync 設計        |
| Phase 5              | `phase-5-implementation.md`                                                            | 実装順と変更対象                 |
| Phase 9              | `phase-9-quality-assurance.md`                                                         | 同期対象                         |
| Phase 10             | `phase-10-final-review.md`                                                             | AC 判定                          |
| Phase 11             | `phase-11-manual-test.md`                                                              | 手動確認観点                     |
| Phase 12 guide       | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | Task 12-1〜12-6 の必須条件       |
| spec update workflow | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 1 / Step 2 / same-wave sync |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                                                            | 内容                   |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------- |
| canonical workflow      | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md` | workflow 同期先        |
| task workflow           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                            | current wave status    |
| backlog                 | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                                    | cleanup / 未タスク登録 |
| completed               | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                                  | 完了記録先             |
| lessons learned current | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                                  | 再発防止記録           |

## 成果物

| 成果物                     | パス                                                     | 説明                    |
| -------------------------- | -------------------------------------------------------- | ----------------------- |
| implementation guide       | `outputs/phase-12/implementation-guide.md`               | 初学者向け + 技術者向け |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | 同期対象と no-op 条件   |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | 変更履歴                |
| unassigned task detection  | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク有無            |
| skill feedback report      | `outputs/phase-12/skill-feedback-report.md`              | skill 改善提案          |
| compliance check           | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 完了確認       |

### 前Phase成果物の再利用

- Phase 6: `outputs/phase-6/regression-matrix.md` を implementation guide Part 2 の edge case 根拠に使う。
- Phase 7: `outputs/phase-7/coverage-and-evidence-plan.md` を system spec update summary の証跡入力に使う。
- Phase 8: `outputs/phase-8/cleanup-sequencing.md` を unassigned task detection の判断根拠に使う。
- Phase 10: `outputs/phase-10/final-review-decision.md` を compliance check の判定根拠に使う。

## same-wave sync 方針

- canonical root は `.claude/skills/...` とし、mirror `.agents/skills/...` は parity 確認対象として扱う
- `task-workflow.md` / `task-workflow-backlog.md` / `task-workflow-completed.md` / `lessons-learned-current.md` は Step 1 の同一 wave で整合させる
- `artifacts.json` と `outputs/artifacts.json` は片系更新を禁止し、同値を維持する
- Phase 13 は user approval 未取得なら常に `blocked` を維持する

## planned wording 監査

- `task-specification-creator` の Phase 12 ガイドで定義された planned wording scan を実行し、`phase-12-documentation.md` と `outputs/phase-12/*.md` の検出結果を 0 件にする
- Issue #1663 本文には別件の追記手順が混入しているため、local workflow と aiworkflow-requirements 正本を優先し、混入文面は current fact に採用しない

## 実行結果（2026-03-27）

- Task 12-1〜12-6 の成果物を `outputs/phase-12/` に出力した。
- canonical root `.claude/skills/aiworkflow-requirements/references/` と mirror `.agents/skills/aiworkflow-requirements/references/` の runtime workflow / backlog / completed ledger を current fact に同期した。
- Step 2 は public IPC / preload / shared 型の外部契約差分がなかったため no-op とし、判断根拠を `outputs/phase-12/system-spec-update-summary.md` と `outputs/phase-12/documentation-changelog.md` に記録した。
- `artifacts.json` と `outputs/artifacts.json` は `completed` / `blocked` の状態まで同値にそろえた。
- Phase 13 は user approval 未取得のため `blocked` を維持した。

## 完了条件

- [ ] Task 12-1〜12-6 と対応成果物が 1:1 で定義されている
- [ ] system spec の Step 1 / Step 2 / no-op / mirror parity が明記されている
- [ ] 未タスク 0 件でも記録する方針がある
- [ ] planned wording を残さない監査コマンドが明記されている
- [ ] Phase 13 `blocked` 維持条件が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
