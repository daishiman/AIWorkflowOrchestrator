# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 |
| Phase      | 4                                               |
| Phase名    | テスト作成                                      |
| ステータス | not_started                                     |
| 前提Phase  | Phase 3 PASS/MINOR                              |
| 後続Phase  | Phase 5                                         |

## 目的

batch 単位の regression test と representative UI test を設計する。

## 実行タスク

- タスク1: Batch A/B の selector・settings auth surface test を設計する
- タスク2: Batch C/D の auth entry・search surface test を設計する
- タスク3: Batch E の verification-only regression test と Phase 11 TC-ID を設計する

## 参照資料

| 参照資料                | パス                                                                                     | 説明                    |
| ----------------------- | ---------------------------------------------------------------------------------------- | ----------------------- |
| Phase 1 成果物          | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-1/`  | 要件と priority batches |
| Phase 2 設計            | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/phase-2-design.md` | batch 設計と対象一覧    |
| Phase 3 成果物          | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-3/`  | 設計レビュー結果        |
| Token foundation design | `docs/30-workflows/completed-tasks/light-theme-token-foundation/phase-2-design.md`       | token 契約の前提        |
| Testing patterns        | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`        | component test の正本   |
| Accessibility testing   | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`             | 可読性テスト観点        |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                                     |
| -------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------- |
| testing-component-patterns | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | component test 方針                      |
| testing-accessibility      | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | contrast / a11y 観点                     |
| ui-ux-settings             | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`             | settings/auth surface の表示契約         |
| ui-ux-forms                | `.claude/skills/aiworkflow-requirements/references/ui-ux-forms.md`                | `AuthView` readable text 契約            |
| architecture-auth-security | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | `AccountSection` / `AuthView` の境界     |
| api-ipc-auth               | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`               | auth state → UI 契約                     |
| api-ipc-system             | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`             | `ApiKeysSection` / `AuthKeySection` 契約 |
| ui-ux-search-panel         | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`         | `WorkspaceSearchPanel` の正本            |

## 実行手順

1. Batch A-E の対象ファイルと既存 test anchor を 1 対 1 で対応づける。
2. readable text / border visibility / panel contrast / dropdown visibility / fallback state を batch ごとに testcase 化する。
3. Phase 11 screenshot と再利用できる TC-ID を `test-specification.md` と `batch-test-matrix.md` に固定する。

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
