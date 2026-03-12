# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 |
| Phase      | 4                                               |
| Phase名    | テスト作成                                      |
| ステータス | completed                                       |
| 前提Phase  | Phase 3 PASS/MINOR                              |
| 後続Phase  | Phase 5                                         |

## 目的

batch 単位の regression test と representative UI test を設計する。

## 実行タスク

- タスク1: Settings shell の theme test を設計する
- タスク2: Dashboard/Auth の readable text test を設計する
- タスク3: WorkspaceSearchPanel の panel token migration test を設計する

## 参照資料

| 参照資料                | パス                                                                                     | 説明                    |
| ----------------------- | ---------------------------------------------------------------------------------------- | ----------------------- |
| Phase 1 成果物          | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-1/`  | 要件と priority batches |
| Phase 2 設計            | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/phase-2-design.md` | batch 設計と対象一覧    |
| Phase 3 成果物          | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-3/`  | 設計レビュー結果        |
| Token foundation design | `docs/30-workflows/completed-tasks/light-theme-token-foundation/phase-2-design.md`       | token 契約の前提        |
| Testing patterns        | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`        | component test の正本   |
| Accessibility testing   | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`             | 可読性テスト観点        |
| requirements-definition | `outputs/phase-1/requirements-definition.md`                                             | Phase 1 成果物          |
| priority-batches        | `outputs/phase-1/priority-batches.md`                                                    | Phase 1 成果物          |
| backlog-mapping         | `outputs/phase-1/backlog-mapping.md`                                                     | Phase 1 成果物          |
| design-review-result    | `outputs/phase-3/design-review-result.md`                                                | Phase 3 成果物          |
| migration-plan          | `outputs/phase-2/migration-plan.md`                                                      | Phase 2 成果物          |
| batch-plan              | `outputs/phase-2/batch-plan.md`                                                          | Phase 2 成果物          |
| codex-handoff           | `outputs/phase-2/codex-handoff.md`                                                       | Phase 2 成果物          |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                |
| -------------------------- | --------------------------------------------------------------------------------- | ------------------- |
| testing-component-patterns | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | component test 方針 |

## 統合テスト連携

| 観点                    | 連携内容                                                                       |
| ----------------------- | ------------------------------------------------------------------------------ |
| Batch test mapping      | Batch A-D と testcase ID を 1対1で対応づける                                   |
| Representative screens  | Settings / Dashboard / Auth / WorkspaceSearch を Phase 11 手動テストと接続する |
| Regression guard bridge | hardcoded color パターンを Task 3 の監査対象へ渡す                             |

## 成果物

| 成果物             | パス                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| test-specification | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-4/test-specification.md` |
| batch-test-matrix  | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-4/batch-test-matrix.md`  |

## 完了条件

- [ ] 各 batch のテスト観点がある
- [ ] readable text / border / panel contrast 観点が含まれる

## 次Phase

Phase 5: 実装
