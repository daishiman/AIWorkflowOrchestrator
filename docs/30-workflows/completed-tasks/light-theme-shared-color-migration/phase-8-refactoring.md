# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 |
| Phase      | 8                                               |
| Phase名    | リファクタリング                                |
| ステータス | completed                                       |
| 前提Phase  | Phase 7                                         |
| 後続Phase  | Phase 9                                         |

## 目的

重複スタイルと migration helper を整理する。

## 実行タスク

- タスク1: 共通 className 断片を整理する
- タスク2: style helper 化の要否を確認する

## 参照資料

| 参照資料               | パス                                                                                                      | 説明                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------- |
| Phase 1 成果物         | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-1/`                   | 要件と backlog mapping |
| Phase 2 成果物         | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-2/`                   | batch 設計             |
| Phase 5 成果物         | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-5/`                   | 実装差分               |
| Phase 6 成果物         | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-6/`                   | テスト拡張結果         |
| Coverage report        | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-7/coverage-report.md` | blind spot と重複確認  |
| ui-ux-components       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                   | 共通化判断の正本       |
| development-guidelines | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`                             | helper 化の一般方針    |
| implementation-summary | `outputs/phase-5/implementation-summary.md`                                                               | Phase 5 成果物         |

## 統合テスト連携

| 観点                | 連携内容                                           |
| ------------------- | -------------------------------------------------- |
| Refactor-safe batch | batch の責務境界を保ったまま重複スタイルを整理する |
| Helper impact       | helper 化する場合は testcase 参照点を維持する      |
| Evidence            | 整理前後の責務境界を `refactoring-plan.md` に残す  |

## 成果物

| 成果物           | パス                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------- |
| refactoring-plan | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-8/refactoring-plan.md` |

## 完了条件

- [x] 重複スタイル整理方針がある
- [x] helper 化の境界が明確である

## 次Phase

Phase 9: 品質検証
