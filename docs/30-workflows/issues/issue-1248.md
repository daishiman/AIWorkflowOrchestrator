# [#1248] UT-SPEC-LINE-BUDGET-SPLIT-001: 500行超過仕様書の責務分割

## タスク概要

`aiworkflow-requirements/references/` 配下の500行超過ファイル3件を責務分割する。

## 対象ファイル

| ファイル                                                            | 行数  |
| ------------------------------------------------------------------- | ----- |
| `arch-electron-services-details.md`                                 | 502行 |
| `task-workflow-completed-skill-lifecycle-agent-view-line-budget.md` | 535行 |
| `task-workflow-completed-workspace-chat-lifecycle-tests.md`         | 522行 |

## 背景

- `validate-structure.js` が毎回3件の警告を出力
- 500行以下のline budget基準（TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001）に違反
- AIエージェントのコンテキストウィンドウ圧迫

## メタ情報

| 項目     | 内容                                                                                                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID | UT-SPEC-LINE-BUDGET-SPLIT-001                                                                                                                                                      |
| カテゴリ | リファクタリング                                                                                                                                                                   |
| 優先度   | 低                                                                                                                                                                                 |
| 規模     | 小規模                                                                                                                                                                             |
| 発見元   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 Phase 12（validate-structure.js 警告検出）                                                                                                      |
| 仕様書   | `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-03-par-task-04-skill-docs-runtime-integration/unassigned-task/task-ut-spec-line-budget-split-001.md` |

## 関連タスク

- TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001
- TASK-IMP-SKILL-DOCS-AI-RUNTIME-001
