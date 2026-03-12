# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | `TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001` |
| Phase      | 10                                                   |
| Phase名    | 最終レビュー                                         |
| ステータス | completed                                            |
| 前提Phase  | Phase 9                                              |
| 後続Phase  | Phase 11                                             |

## 目的

AC-1〜AC-5 に照らして guard 設計 / 実装 / quality gate を総合判定し、Phase 11 の視覚検証へ渡す。

## 実行タスク

- タスク1: screenshot matrix の最終妥当性を確認する
- タスク2: audit / evidence policy の最終妥当性を確認する
- タスク3: formalize すべき残課題を判定する

## 参照資料

| 参照資料                | パス                                                                                                        | 説明                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------- |
| Phase 2 成果物          | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-2/`                  | screenshot / audit 設計 |
| Phase 5 成果物          | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-5/`                  | 実装差分                |
| quality report          | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-9/quality-report.md` | 品質評価                |
| token foundation review | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-10/final-review-result.md`    | 依存元の最終状態        |
| shared migration review | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-10/final-review-result.md`              | 依存先の最終状態        |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                            | 内容                              |
| ------------------------ | ------------------------------------------------------------------------------- | --------------------------------- |
| task-workflow            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | 完了 / 未タスク整理先             |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | representative feature の整合確認 |
| lessons-learned          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | 再発条件と標準ルール確認          |

## 実行手順

### ステップ1: AC 判定を行う

1. AC-1〜AC-5 を 1 件ずつ判定する
2. PASS / MINOR / MAJOR の粒度で差分を整理する
3. Phase 11 で検証すべき visual item を抽出する

### ステップ2: 残課題を formalize する

1. current failure と baseline backlog を分ける
2. future execution 内で解決すべき項目と unassigned 化すべき項目を分ける
3. `final-review-result.md` に移送先を明記する

### ステップ3: Phase 11 handoff を固定する

1. representative screens と selector / route を確定する
2. screenshot-plan / discovered-issues の対象を確定する
3. manual review の重点観点を確定する

## 統合テスト連携

| 観点           | 連携内容                                                        |
| -------------- | --------------------------------------------------------------- |
| Release gate   | Phase 11 で確認すべき representative screen と drift を固定する |
| Backlog bridge | current 差分と baseline backlog を分離して Phase 12 へ渡す      |
| Evidence       | `final-review-result.md` に AC 判定と移送先を残す               |

## 多角的チェック観点

| 観点             | 適用内容                                        | 仕様参照先                                                                                                                                   |
| ---------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| UI/UX            | representative capture が責務を読ませるか       | `ui-ux-feature-components.md`                                                                                                                |
| アクセシビリティ | light contrast / helper text の検証項目があるか | `testing-accessibility.md`                                                                                                                   |
| アーキテクチャ   | dependency workflow との整合                    | dependency workflow outputs                                                                                                                  |
| 運用証跡         | unassigned formalize と system spec 同期の準備  | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |

## 成果物

| 成果物              | パス                                                                                                              | 説明                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| final-review-result | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-10/final-review-result.md` | AC 判定、残課題、Phase 11 handoff |

## 完了条件

- [x] AC-1〜AC-5 の判定がある
- [x] residual risk と formalize 方針がある
- [x] Phase 11 の representative screen / selector / focus point が明記されている
- [x] Phase 12 の sync target が明記されている

## サブタスク管理

1. Phase 2 / 5 / 9 の成果物を確認する
2. AC 判定を行う
3. formalize する残課題を分類する
4. Phase 11 handoff を定義する
5. final-review-result を更新する

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物の planned path を確定
- [x] `artifacts.json` の Phase 10 登録を更新
- [x] Phase 11 / 12 handoff を明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard --phase 10
```

## 次Phase

Phase 11: 手動テスト
