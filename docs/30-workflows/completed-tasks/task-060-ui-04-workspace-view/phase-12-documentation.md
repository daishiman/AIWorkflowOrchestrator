# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                              |
| ---------- | --------------------------------------------------------------------------------- |
| タスクID   | TASK-UI-04-WORKSPACE-VIEW                                                         |
| Phase      | 12                                                                                |
| Phase名    | ドキュメント更新                                                                  |
| ステータス | completed                                                                         |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11 |
| 後続Phase  | Phase 13                                                                          |

## 目的

親参照仕様を `spec_created` 親タスクとして system spec へ同期し、child canonical path、evidence 継承、pointer role を再利用できる形に残す。

## 実行タスク

- Task 1: `implementation-guide.md` を Part 1 / Part 2 の 2部構成で作成する
- Task 2: `task-workflow.md` / `ui-ux-feature-components.md` / `ui-ux-navigation.md` / `lessons-learned.md` を `spec_created` と canonical path 付きで同期する
- Task 3: `documentation-changelog.md` と `spec-update-summary.md` を作成する
- Task 4: `unassigned-task-detection.md` を 0件でも作成し、re-audit や user 再依頼で再利用価値が判明した場合は docs-only parent の follow-up backlog を formalize する
- Task 5: `skill-feedback-report.md` を作成し、task-spec skill と aiworkflow skill へフィードバックを残す

### Task 2: システム仕様同期の内訳

| Step     | 必須     | 内容                                                                                                                                                                                                           |
| -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Step 1-A | 必須     | 完了タスク記録、関連ドキュメント、変更履歴、`.claude/skills/aiworkflow-requirements/LOGS.md` と `.claude/skills/task-specification-creator/LOGS.md` の同時更新、必要時の `SKILL.md` 変更履歴更新要否を定義する |
| Step 1-B | 必須     | parent task を `spec_created` として実装状況テーブルへ同期する                                                                                                                                                 |
| Step 1-C | 必須     | 関連タスク / 未タスク候補テーブルを grep で検出し、parent-child 関係を更新する                                                                                                                                 |
| Step 1-D | 必須     | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` と indexes を `generate-index.js` で再生成する                                                                                                   |
| Step 2   | 条件付き | 新規 interface / 型 / contract を追加した場合だけ system spec 本文を更新する                                                                                                                                   |

## 参照資料

| 参照資料                           | パス                                                                                                           | 説明                                   |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Phase 11/12 guide                  | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                    | Phase 12 必須 5 タスク                 |
| Phase 12 checklist                 | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`                         | 実体確認ルール                         |
| spec update workflow               | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                 | Step 1-A / 1-B / 1-C / 1-D / Step 2    |
| evidence sync rules                | `.claude/skills/task-specification-creator/references/evidence-sync-rules.md`                                  | LOGS / SKILL / lessons / workflow 同期 |
| technical documentation guide      | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md`                        | Part 1 / Part 2 の書式                 |
| Phase 1 成果物                     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-1/`                             | requirements                           |
| Phase 2 成果物                     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-2/`                             | design                                 |
| Phase 5 成果物                     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-5/`                             | 実装内容                               |
| Phase 6 成果物                     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-6/`                             | expanded tests                         |
| Phase 7 成果物                     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-7/`                             | coverage                               |
| Phase 8 成果物                     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-8/`                             | refactor result                        |
| Phase 9 成果物                     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-9/`                             | QA result                              |
| Phase 10 成果物                    | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-10/`                            | final gate result                      |
| Phase 11 成果物                    | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-11/`                            | evidence 継承結果                      |
| aiworkflow extraction matrix       | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/aiworkflow-requirements-extraction-matrix.md` | system spec 採用理由                   |
| child linkage matrix               | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/child-workflow-linkage-matrix.md`             | canonical path 台帳                    |
| branch diff audit                  | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/branch-diff-reflection-matrix.md`             | 本ブランチ差分の監査台帳               |
| requirements-definition            | `outputs/phase-1/requirements-definition.md`                                                                   | Phase 1 成果物                         |
| scope-boundary                     | `outputs/phase-1/scope-boundary.md`                                                                            | Phase 1 成果物                         |
| acceptance-criteria                | `outputs/phase-1/acceptance-criteria.md`                                                                       | Phase 1 成果物                         |
| system-spec-entrypoints            | `outputs/phase-1/system-spec-entrypoints.md`                                                                   | Phase 1 成果物                         |
| parent-child-responsibility-matrix | `outputs/phase-2/parent-child-responsibility-matrix.md`                                                        | Phase 2 成果物                         |
| execution-lane-design              | `outputs/phase-2/execution-lane-design.md`                                                                     | Phase 2 成果物                         |
| sync-matrix                        | `outputs/phase-2/sync-matrix.md`                                                                               | Phase 2 成果物                         |
| validator-strategy                 | `outputs/phase-2/validator-strategy.md`                                                                        | Phase 2 成果物                         |
| implementation-summary             | `outputs/phase-5/implementation-summary.md`                                                                    | Phase 5 成果物                         |
| pointer-doc-update-plan            | `outputs/phase-5/pointer-doc-update-plan.md`                                                                   | Phase 5 成果物                         |
| canonical-path-normalization       | `outputs/phase-5/canonical-path-normalization.md`                                                              | Phase 5 成果物                         |
| refactoring-report                 | `outputs/phase-8/refactoring-report.md`                                                                        | Phase 8 成果物                         |
| terminology-normalization          | `outputs/phase-8/terminology-normalization.md`                                                                 | Phase 8 成果物                         |
| quality-verification               | `outputs/phase-9/quality-verification.md`                                                                      | Phase 9 成果物                         |
| qa-risk-register                   | `outputs/phase-9/qa-risk-register.md`                                                                          | Phase 9 成果物                         |
| final-review-result                | `outputs/phase-10/final-review-result.md`                                                                      | Phase 10 成果物                        |
| remediation-directives             | `outputs/phase-10/remediation-directives.md`                                                                   | Phase 10 成果物                        |
| manual-test-checklist              | `outputs/phase-11/manual-test-checklist.md`                                                                    | Phase 11 成果物                        |
| manual-test-result                 | `outputs/phase-11/manual-test-result.md`                                                                       | Phase 11 成果物                        |
| evidence-inheritance-log           | `outputs/phase-11/evidence-inheritance-log.md`                                                                 | Phase 11 成果物                        |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                            | 同期内容                                                    |
| ------------------------ | ------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| task workflow            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | parent `spec_created`、child canonical path、Step 1-A / 1-B |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 04A / 04B / 04C の canonical path 補正、parent pointer role |
| ui-ux-navigation         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | `workspace` ViewType 参照仕様としての parent role           |
| lessons learned          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | path drift と evidence 継承の再発防止                       |
| aiworkflow LOGS          | `.claude/skills/aiworkflow-requirements/LOGS.md`                                | Step 1-A 完了記録                                           |
| task-spec LOGS           | `.claude/skills/task-specification-creator/LOGS.md`                             | Step 1-A 完了記録                                           |
| topic map                | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                   | Step 1-D 行番号同期                                         |

## 実行手順

### ステップ1: 実装ガイドと changelog を作成する

Task 1 と Task 3 を先に整え、`node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view` を通せる構造と、Phase 11 の evidence 継承結果を文章化できる状態を作る。

### ステップ2: Step 1-A から Step 1-D を順に実施する

完了記録、`spec_created`、関連タスク更新、`node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` による topic-map / indexes 再生成を直列で行う。

### ステップ3: Task 4 / Task 5 と mirror root 監査を完了する

0件でも未タスク検出を残し、skill feedback、canonical root `.claude/skills` と mirror root の drift 確認まで終える。

## 多角的チェック観点

| 観点                 | 適用判断 | 確認内容                                                                    |
| -------------------- | -------- | --------------------------------------------------------------------------- |
| Phase 12 必須5タスク | 適用     | Task 1-5 が欠けず、0件/N/A でも成果物を作ること                             |
| spec update workflow | 適用     | Step 1-A / 1-B / 1-C / 1-D / Step 2 が区別されていること                    |
| root sync            | 適用     | `.claude/skills/...` を正本として LOGS / topic-map / indexes を同期すること |
| branch diff audit    | 適用     | 今回の本ブランチ差分が skill 要件へ対応づいていること                       |

## 成果物

| 成果物                             | パス                                                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| implementation-guide               | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-12/implementation-guide.md`               |
| spec-update-summary                | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-12/spec-update-summary.md`                |
| documentation-changelog            | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-12/documentation-changelog.md`            |
| unassigned-task-detection          | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-12/unassigned-task-detection.md`          |
| skill-feedback-report              | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-12/skill-feedback-report.md`              |
| phase12-task-spec-compliance-check | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 完了条件

- [ ] implementation-guide が Part 1 / Part 2 で定義されている
- [ ] `task-workflow.md` / `ui-ux-feature-components.md` / `ui-ux-navigation.md` / `lessons-learned.md` の同期先が明記されている
- [ ] `spec_created` 親タスクとして同期する方針が明記されている
- [ ] `unassigned-task-detection.md` が 0件でも必須であると明記されている
- [ ] skill feedback の返却先が明記されている
- [ ] `LOGS.md` 2ファイル、`topic-map.md`、`generate-index.js` の実行順が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

- implementation-guide / changelog の作成
- Step 1-A / 1-B / 1-C / 1-D / Step 2 の整理
- unassigned-task / skill feedback / branch diff audit の作成
- compliance check と完了条件確認

## タスク100%実行確認【必須】

- [ ] Task 1-5 と Step 1-A / 1-B / 1-C / 1-D / Step 2 が本文に残っている
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が成果物に含まれている
- [ ] `.claude/skills/...` を canonical root とする記述がある
- [ ] LOGS 2ファイルと topic-map / indexes 再生成が明記されている
- [ ] 0件でも未タスク検出と skill feedback を作る方針がある

## 次Phase

Phase 13: PR作成
