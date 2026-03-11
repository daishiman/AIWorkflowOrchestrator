# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| タスクID   | TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 |
| Phase      | 7                                                  |
| Phase名    | カバレッジ確認                                     |
| ステータス | not_started                                        |
| 前提Phase  | Phase 6                                            |
| 後続Phase  | Phase 8                                            |

## 目的

guard が代表 drift を十分に拾えるか確認する。

## 実行タスク

- タスク1: screenshot drift coverage を確認する
- タスク2: hardcoded drift coverage を確認する
- タスク3: evidence policy coverage を確認する

## 参照資料

| 参照資料             | パス                                                                                            | 説明              |
| -------------------- | ----------------------------------------------------------------------------------------------- | ----------------- |
| Guard test matrix    | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-4/guard-test-matrix.md`  | coverage 基準     |
| Phase 5 成果物       | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-5/`                      | 実装差分          |
| Expanded test plan   | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-6/expanded-test-plan.md` | 拡張観点          |
| Quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                     | coverage 品質基準 |

## 統合テスト連携

| 観点            | 連携内容                                                   |
| --------------- | ---------------------------------------------------------- |
| Coverage gate   | 3 種の drift coverage の不足有無を確定する                 |
| Workflow bridge | Phase 11 checklist と Phase 12 evidence へ残す項目を決める |
| Evidence        | `coverage-report.md` を Phase 10 最終レビューの入力にする  |

## 成果物

| 成果物          | パス                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------- |
| coverage-report | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-7/coverage-report.md` |

## 完了条件

- [ ] 3 種の drift coverage が確認できる
- [ ] 不足観点が整理されている

## 次Phase

Phase 8: リファクタリング
