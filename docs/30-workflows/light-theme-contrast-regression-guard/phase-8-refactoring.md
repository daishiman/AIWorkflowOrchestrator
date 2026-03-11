# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| タスクID   | TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 |
| Phase      | 8                                                  |
| Phase名    | リファクタリング                                   |
| ステータス | not_started                                        |
| 前提Phase  | Phase 7                                            |
| 後続Phase  | Phase 9                                            |

## 目的

validator / audit / checklist の冗長さを整理する。

## 実行タスク

- タスク1: 共通設定化を行う
- タスク2: grep pattern の再利用化を行う
- タスク3: checklist 文面の重複を削減する

## 参照資料

| 参照資料               | パス                                                                                         | 説明                           |
| ---------------------- | -------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 1 成果物         | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-1/`                   | 要件と representative screen   |
| Phase 2 成果物         | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-2/`                   | screenshot / audit 設計        |
| Phase 5 成果物         | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-5/`                   | 実装差分                       |
| Phase 6 成果物         | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-6/`                   | テスト拡張結果                 |
| Coverage report        | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-7/coverage-report.md` | 重複と不足の確認               |
| Testing patterns       | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`            | 再利用化の正本                 |
| Development guidelines | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`                | helper / config 整理の一般方針 |

## 統合テスト連携

| 観点                  | 連携内容                                              |
| --------------------- | ----------------------------------------------------- |
| Refactor-safe guard   | 既存 testcase を保ったまま helper / config を整理する |
| Checklist consistency | Phase 11 / 12 テンプレートとの整合を維持する          |
| Evidence              | 整理前後の差分を `refactoring-plan.md` に残す         |

## 成果物

| 成果物           | パス                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------- |
| refactoring-plan | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-8/refactoring-plan.md` |

## 完了条件

- [ ] guard の設定重複が整理されている
- [ ] checklist の再利用方針がある

## 次Phase

Phase 9: 品質検証
