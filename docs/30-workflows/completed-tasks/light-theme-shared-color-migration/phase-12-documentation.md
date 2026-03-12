# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 |
| Phase      | 12                                              |
| Phase名    | ドキュメント                                    |
| ステータス | completed                                       |
| 前提Phase  | Phase 11                                        |
| 後続Phase  | Phase 13                                        |

## 目的

shared migration の更新内容を system spec と workflow 文書へ同期する。

## 実行タスク

- Task 1: `implementation-guide.md` を Part 1/Part 2 の 2 パート構成で作成する
- Task 2: `ui-ux-components.md` / `ui-ux-feature-components.md` / `task-workflow.md` / `lessons-learned.md` を Step 1-A〜1-C と Step 2 判定付きで同期し、実装完了 task として記録する
- Task 3: `documentation-changelog.md` と Phase 12 の artifacts 台帳更新方針を記録する
- Task 4: `unassigned-task-detection.md` を 0件でも必ず作成し、残課題を formalize する
- Task 5: `skill-feedback-report.md` を作成し、`.claude/skills/task-specification-creator` / `.claude/skills/aiworkflow-requirements` へのフィードバック導線を残す

## 参照資料

| 参照資料                | パス                                                                                     | 説明                       |
| ----------------------- | ---------------------------------------------------------------------------------------- | -------------------------- |
| Phase 11/12 guide       | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`              | Phase 12 必須5タスクの正本 |
| Phase 12 checklist      | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`   | 実体確認ルール             |
| Spec update workflow    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`           | system spec 更新順序       |
| Phase 2 成果物          | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-2/`  | batch 設計                 |
| Phase 5 成果物          | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-5/`  | 実装差分                   |
| Phase 6 成果物          | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-6/`  | テスト拡張結果             |
| Phase 7 成果物          | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-7/`  | coverage                   |
| Phase 8 成果物          | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-8/`  | refactoring 結果           |
| Phase 9 成果物          | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-9/`  | 品質結果                   |
| Phase 10 成果物         | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-10/` | 最終レビュー結果           |
| Resource map            | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                         | 読むべき正本仕様の入口     |
| requirements-definition | `outputs/phase-1/requirements-definition.md`                                             | Phase 1 成果物             |
| priority-batches        | `outputs/phase-1/priority-batches.md`                                                    | Phase 1 成果物             |
| backlog-mapping         | `outputs/phase-1/backlog-mapping.md`                                                     | Phase 1 成果物             |
| migration-plan          | `outputs/phase-2/migration-plan.md`                                                      | Phase 2 成果物             |
| batch-plan              | `outputs/phase-2/batch-plan.md`                                                          | Phase 2 成果物             |
| codex-handoff           | `outputs/phase-2/codex-handoff.md`                                                       | Phase 2 成果物             |
| implementation-summary  | `outputs/phase-5/implementation-summary.md`                                              | Phase 5 成果物             |
| refactoring-plan        | `outputs/phase-8/refactoring-plan.md`                                                    | Phase 8 成果物             |
| quality-report          | `outputs/phase-9/quality-report.md`                                                      | Phase 9 成果物             |
| final-review-result     | `outputs/phase-10/final-review-result.md`                                                | Phase 10 成果物            |
| manual-test-plan        | `outputs/phase-11/manual-test-plan.md`                                                   | Phase 11 成果物            |
| manual-test-result      | `outputs/phase-11/manual-test-result.md`                                                 | Phase 11 成果物            |
| discovered-issues       | `outputs/phase-11/discovered-issues.md`                                                  | Phase 11 成果物            |
| screenshot-plan         | `outputs/phase-11/screenshot-plan.json`                                                  | Phase 11 成果物            |
| screenshot-coverage     | `outputs/phase-11/screenshot-coverage.md`                                                | Phase 11 成果物            |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                            | 内容                   |
| ------------------------ | ------------------------------------------------------------------------------- | ---------------------- |
| ui-ux-components         | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`         | component 更新先       |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | feature 更新先         |
| ui-ux-settings           | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`           | Settings の正本        |
| ui-ux-search-panel       | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`       | WorkspaceSearch の正本 |
| task-workflow            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | backlog / 完了台帳     |
| lessons-learned          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | 再発防止               |

## 成果物

| 成果物                    | パス                                                                                                                          |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| implementation-guide      | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-12/implementation-guide.md`               |
| spec-update-summary       | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-12/spec-update-summary.md`                |
| documentation-changelog   | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-12/documentation-changelog.md`            |
| unassigned-task-detection | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-12/unassigned-task-detection.md`          |
| skill-feedback-report     | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-12/skill-feedback-report.md`              |
| phase12 compliance check  | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 完了条件

- [x] implementation-guide Part 1/Part 2 と日常例え・型/API・エッジケース要件が定義されている
- [x] system spec 更新で Step 1-A〜1-C と completed 判定を記録する方針が明記されている
- [x] unassigned-task-detection が 0件でも必須であると記録されている
- [x] skill-feedback-report と LOGS/SKILL 更新導線が記載されている
- [x] phase12-task-spec-compliance-check が Task 12-1〜12-5、Step 1-A〜1-G / Step 2、指定ディレクトリ監査を 1 ファイルへ集約している

## 次Phase

Phase 13: PR作成
