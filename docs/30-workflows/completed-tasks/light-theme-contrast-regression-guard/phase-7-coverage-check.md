# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | `TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001` |
| Phase      | 7                                                    |
| Phase名    | カバレッジ確認                                       |
| ステータス | completed                                            |
| 前提Phase  | Phase 6                                              |
| 後続Phase  | Phase 8                                              |

## 目的

guard が representative drift を十分に拾えるか、coverage と evidence の両面から確認する。

## 実行タスク

- タスク1: screenshot drift coverage を確認する
- タスク2: hardcoded drift coverage を確認する
- タスク3: evidence policy coverage を確認する

## 参照資料

| 参照資料           | パス                                                                                                            | 説明          |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | ------------- |
| guard test matrix  | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-4/guard-test-matrix.md`  | coverage 基準 |
| Phase 5 成果物     | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-5/`                      | 実装差分      |
| expanded test plan | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-6/expanded-test-plan.md` | 拡張観点      |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                                   |
| -------------------------- | --------------------------------------------------------------------------------- | -------------------------------------- |
| quality-requirements       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | coverage / test 完了基準               |
| testing-component-patterns | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | coverage 集計時の観点                  |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | Phase 11 / 12 へ渡すべき coverage 項目 |

## 実行手順

### ステップ1: drift coverage を集計する

1. screenshot drift coverage を集計する
2. hardcoded drift coverage を集計する
3. evidence drift coverage を集計する

### ステップ2: coverage gap を分類する

1. current change の gap と baseline backlog を分ける
2. test-only で埋められる gap と Phase 8 で整理すべき gap を分ける
3. Phase 11 で再確認すべき項目を抽出する

### ステップ3: Phase 8 / 10 の入力へ渡す

1. repeated config / helper 重複を洗い出す
2. quality gate へ渡す coverage summary をまとめる
3. `coverage-report.md` に不足と対処方針を残す

## 統合テスト連携

| 観点            | 連携内容                                                   |
| --------------- | ---------------------------------------------------------- |
| Coverage gate   | 3 種の drift coverage の不足有無を確定する                 |
| Workflow bridge | Phase 11 checklist と Phase 12 evidence に残す項目を決める |
| Evidence        | `coverage-report.md` を Phase 10 の判断材料にする          |

## 多角的チェック観点

| 観点             | 適用内容                                            | 仕様参照先                                                                                                                                   |
| ---------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| テスト戦略       | coverage が TC-ID と 1対1で読めるか                 | `guard-test-matrix.md`                                                                                                                       |
| アクセシビリティ | contrast / helper text の coverage が漏れていないか | `testing-accessibility.md`                                                                                                                   |
| 運用証跡         | current / baseline の gap 分類が明確か              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |
| 拡張性           | 新画面追加時に coverage ルールが壊れないか          | `expanded-test-plan.md`                                                                                                                      |

## 成果物

| 成果物          | パス                                                                                                         | 説明                             |
| --------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| coverage-report | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-7/coverage-report.md` | drift / evidence coverage の集計 |

## 完了条件

- [x] 3 種の drift coverage が確認できる
- [x] 不足観点が current / baseline に分類されている
- [x] Phase 8 / 10 / 11 に渡す gap が明記されている
- [x] coverage-report が quality gate の入力として読める

## サブタスク管理

1. Phase 4 / 5 / 6 の成果物を確認する
2. screenshot / hardcoded / evidence の coverage を集計する
3. gap を分類する
4. Phase 8 / 10 / 11 への handoff を定義する
5. coverage-report を更新する

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物の planned path を確定
- [x] `artifacts.json` の Phase 7 登録を更新
- [x] gap の current / baseline 分類が明記されている

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard --phase 7
```

## 次Phase

Phase 8: リファクタリング
