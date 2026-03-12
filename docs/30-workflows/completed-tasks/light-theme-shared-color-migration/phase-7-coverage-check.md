# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 |
| Phase      | 7                                               |
| Phase名    | カバレッジ確認                                  |
| ステータス | completed                                       |
| 前提Phase  | Phase 6                                         |
| 後続Phase  | Phase 8                                         |

## 目的

対象バッチの view/component 回帰観点が網羅されているか確認する。

## 実行タスク

- タスク1: batch 別 coverage を確認する
- タスク2: blind spot を列挙する

## 参照資料

| 参照資料             | パス                                                                                                         | 説明              |
| -------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------- |
| Batch test matrix    | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-4/batch-test-matrix.md`  | coverage 基準     |
| Phase 5 成果物       | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-5/`                      | 実装差分          |
| Expanded test plan   | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-6/expanded-test-plan.md` | 拡張観点          |
| Quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                  | coverage 品質基準 |

## 統合テスト連携

| 観点                    | 連携内容                                                       |
| ----------------------- | -------------------------------------------------------------- |
| Coverage gate           | batch A-D ごとの blind spot を確定し、Phase 8 の整理対象へ渡す |
| Regression guard bridge | current 差分として扱う監査対象ファイルを Task 3 に渡す         |
| Evidence                | `coverage-report.md` を Phase 10 最終レビューの入力にする      |

## 成果物

| 成果物          | パス                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| coverage-report | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-7/coverage-report.md` |

## 完了条件

- [x] coverage の不足箇所が明示されている
- [x] 継続可否が判断できる

## 次Phase

Phase 8: リファクタリング
