# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001 |
| Phase      | 12                                                   |
| Phase名    | ドキュメント更新                                     |
| ステータス | completed                                            |

## 目的

workflow、completed task spec、system spec、3 skill root（`aiworkflow-requirements` / `task-specification-creator` / `skill-creator`）、mirror root の状態を current 実装へ同期し、exact count と path drift を残さない。

## 実行内容

- Task 1: Part 1 / Part 2 構成の implementation guide を作成した
- Task 2 Step 1-A: workflow / system spec / completed task spec / LOGS / SKILL / topic-map / mirror sync を更新した
- Task 2 Step 1-B: status を completed に揃えた
- Task 2 Step 1-C: related task row の path / status / exact count を再同期した
- Task 2 Step 2: search / preview / taxonomy の cross-cutting rule に加えて、04C follow-up の helper 抽出・state 境界・visual polish を system spec 本文へ反映した
- Task 3-5: summary / changelog / unassigned detection / skill feedback を出力した

## 実行タスク

- Task 1: implementation guide を 2パート構成で作成する
- Task 2: workflow / system spec / LOGS / SKILL / topic-map / mirror root を同期する
- Task 3: summary / changelog / unassigned detection / skill feedback を記録する

## 参照資料

- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/apple-uiux-visual-review.md`
- `outputs/phase-5/spec-update-targets.md`
- `outputs/phase-2/resilience-guard-design.md`
- `outputs/phase-6/docs-validation-plan.md`
- `outputs/phase-7/coverage-report.md`
- `outputs/phase-8/refactor-plan.md`
- `outputs/phase-9/quality-report.md`
- `outputs/phase-10/final-review-result.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/task-specification-creator/references/evidence-sync-rules.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

## 成果物

| 成果物                     | パス                                             |
| -------------------------- | ------------------------------------------------ |
| implementation-guide       | `outputs/phase-12/implementation-guide.md`       |
| system-spec-sync-checklist | `outputs/phase-12/system-spec-sync-checklist.md` |
| spec-update-summary        | `outputs/phase-12/spec-update-summary.md`        |
| documentation-changelog    | `outputs/phase-12/documentation-changelog.md`    |
| unassigned-task-detection  | `outputs/phase-12/unassigned-task-detection.md`  |
| skill-feedback-report      | `outputs/phase-12/skill-feedback-report.md`      |

## 完了条件

- [x] Step 1-A / 1-B / 1-C / Step 2 を別々に記録した
- [x] completed task spec と system spec の path を揃えた
- [x] 3 skill root の LOGS / SKILL / topic-map / mirror sync を同一ターンで処理した
