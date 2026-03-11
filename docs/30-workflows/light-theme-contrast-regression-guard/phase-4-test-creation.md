# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| タスクID   | TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 |
| Phase      | 4                                                  |
| Phase名    | テスト作成                                         |
| ステータス | not_started                                        |
| 前提Phase  | Phase 3 PASS/MINOR                                 |
| 後続Phase  | Phase 5                                            |

## 目的

guard を実装するためのテスト仕様を定義する。

## 実行タスク

- タスク1: screenshot matrix validator のテストを設計する
- タスク2: raw grep/audit の判定テストを設計する
- タスク3: Phase 11 checklist 反映の検証を設計する

## 参照資料

| 参照資料             | パス                                                                              | 説明                                 |
| -------------------- | --------------------------------------------------------------------------------- | ------------------------------------ |
| Phase 2 設計         | `docs/30-workflows/light-theme-contrast-regression-guard/phase-2-design.md`       | screenshot / audit / evidence policy |
| Phase 3 成果物       | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-3/`        | 設計レビュー結果                     |
| Phase 11/12 guide    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`       | screenshot / evidence 運用           |
| Testing patterns     | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | validator / audit テストの正本       |
| Quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 品質基準                             |

## 統合テスト連携

| 観点                   | 連携内容                                                  |
| ---------------------- | --------------------------------------------------------- |
| Screenshot to testcase | representative 4 画面と testcase ID を対応付ける          |
| Audit to testcase      | hardcoded color パターンと fail 条件を testcase 化する    |
| Phase 11 bridge        | manual-test checklist で再利用する evidence ID を固定する |

## 成果物

| 成果物             | パス                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| test-specification | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-4/test-specification.md` |
| guard-test-matrix  | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-4/guard-test-matrix.md`  |

## 完了条件

- [ ] screenshot / audit / checklist のテスト観点が定義されている
- [ ] current/baseline 判定の検証観点がある

## 次Phase

Phase 5: 実装
