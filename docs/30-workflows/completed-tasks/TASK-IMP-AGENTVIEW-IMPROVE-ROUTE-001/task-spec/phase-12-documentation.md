# Phase 12: ドキュメント

## メタ情報

| 項目     | 内容                                             |
| -------- | ------------------------------------------------ |
| タスクID | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001             |
| フェーズ | Phase 12                                         |
| 機能名   | agentview-improve-route                          |
| 作成日   | 2026-03-17                                       |
| 依存     | Phase 11 成果物（outputs/phase-11/、全PASS済み） |

## 目的

task-specification-creator の Phase 12 正本に従い、実装ガイド、system spec update summary、documentation changelog、未タスク検出、skill feedback、compliance check を漏れなく完了させる。

## 実行タスク

- Task 1: `outputs/phase-12/implementation-guide.md` を Part 1 / Part 2 構成で作成する
- Task 2: `outputs/phase-12/system-spec-update-summary.md` に実更新した system spec / skill 改善 / mirror 同期を記録する
- Task 3: `outputs/phase-12/documentation-changelog.md` に workflow / system spec / validator / harness の更新を記録する
- Task 4: `outputs/phase-12/unassigned-task-detection.md` と `outputs/phase-12/skill-feedback-report.md` を作成し、検出した未タスクを formalize する
- Task 5: `outputs/phase-12/phase12-task-spec-compliance-check.md` で Task 1〜4 完了後の整合を記録する

### Task 1: 実装ガイド作成

- [x] `outputs/phase-12/implementation-guide.md` に Part 1 / Part 2 を作成
- [x] Part 1 で日常例えを使った説明を入れる
- [x] Part 2 で props 型定義、CTA 導出ロジック、P31 対策、edge case を説明する

### Task 2: system spec update summary

- [x] `.claude/skills/aiworkflow-requirements/references/` の更新対象を実更新する
- [x] `.agents/skills/aiworkflow-requirements/` へ mirror 同期する
- [x] 実施した Step 1-A / 1-B / 1-C / 1-D / Step 2 を実績として記録する

### Task 3: documentation changelog

- [x] `outputs/phase-12/documentation-changelog.md` を作成
- [x] workflow / system spec / validator / harness / unassigned task の更新内容を記録する
- [x] mirror 同期結果と validator 実行結果を記録する

### Task 4: 未タスク検出 / skill feedback

- [x] `outputs/phase-12/unassigned-task-detection.md` を作成（0件でも必須）
- [x] 候補が存在する場合は `docs/30-workflows/unassigned-task/` に未タスクを formalize する
- [x] `outputs/phase-12/skill-feedback-report.md` を作成（改善なしでも必須）

### Task 5: phase12-task-spec-compliance-check

- [x] `outputs/phase-12/phase12-task-spec-compliance-check.md` を作成
- [x] Task 1〜4 完了後にのみ「完了」と記録する
- [x] 先送り表現が残っていないことを確認する

## 参照資料

| 参照資料              | パス                                                                                                        | 内容                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Phase 2（設計）       | `phase-2-design.md`                                                                                         | 実装で採択した設計方針を仕様更新に反映する  |
| Phase 5（実装）       | `phase-5-implementation.md`                                                                                 | 実装対象と禁止事項を更新サマリーへ反映する  |
| Phase 6 成果物        | `outputs/phase-6/test-additions.md`                                                                         | 追加した回帰テストを更新対象へ反映する      |
| Phase 7 成果物        | `outputs/phase-7/coverage-summary.md`                                                                       | coverage 実績を更新サマリーへ反映する       |
| Phase 8 成果物        | `outputs/phase-8/refactoring-log.md`                                                                        | リファクタリング結果を changelog へ反映する |
| Phase 9 成果物        | `outputs/phase-9/qa-summary.md`                                                                             | 品質ゲート結果を記録する                    |
| Phase 10 成果物       | `outputs/phase-10/review-result.md`                                                                         | review 判定と minor 指摘を反映する          |
| Phase 11 成果物       | `outputs/phase-11/manual-test-result.md`                                                                    | screenshot と手動テスト結果を反映する       |
| spec update workflow  | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                              | Step 1-A〜1-D / Step 2 の手順を確認する     |
| Phase 12 guide        | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`                      | Phase 12 の成果物要件を確認する             |
| aiworkflow references | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md` | system spec 更新先の正本を確認する          |

## 成果物

```
outputs/phase-12/
  implementation-guide.md
  system-spec-update-summary.md
  documentation-changelog.md
  unassigned-task-detection.md
  skill-feedback-report.md
  phase12-task-spec-compliance-check.md
```

## 完了条件

- [x] `implementation-guide.md` が Part 1 と Part 2 を含む
- [x] `system-spec-update-summary.md` が完成している
- [x] `documentation-changelog.md` が完成している
- [x] `outputs/phase-12/unassigned-task-detection.md` が作成済み（0件でも可）
- [x] `skill-feedback-report.md` が作成済み
- [x] `outputs/phase-12/phase12-task-spec-compliance-check.md` が作成済み
- [x] **本Phase内の全タスクを100%実行完了**

## 次 Phase

→ Phase 13: PR 作成（ただし本 worktree ではユーザー指示により未実施）
