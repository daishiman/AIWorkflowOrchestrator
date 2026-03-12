# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | `TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001` |
| Phase      | 8                                                    |
| Phase名    | リファクタリング                                     |
| ステータス | completed                                            |
| 前提Phase  | Phase 7                                              |
| 後続Phase  | Phase 9                                              |

## 目的

validator / audit / checklist / docs bridge の冗長さを整理し、future screen 追加や Phase 12 同期のコストを下げる。

## 実行タスク

- タスク1: 共通設定化を行う
- タスク2: grep pattern と coverage 計算の再利用化を行う
- タスク3: manual checklist / documentation wording の重複を削減する

## 参照資料

| 参照資料        | パス                                                                                                         | 説明                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| Phase 1 成果物  | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-1/`                   | requirements / representative screens |
| Phase 2 成果物  | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-2/`                   | screenshot / audit / evidence policy  |
| Phase 5 成果物  | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-5/`                   | helper / implementation summary       |
| Phase 6 成果物  | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-6/`                   | 拡張テスト                            |
| coverage report | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-7/coverage-report.md` | 重複と gap の確認                     |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                                       |
| -------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------ |
| testing-component-patterns | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | helper / config の再利用パターン           |
| development-guidelines     | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`     | 共通化の一般原則                           |
| lessons-learned            | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | drift 防止のための wording / evidence 教訓 |

## 実行手順

### ステップ1: 重複を見つける

1. validator / audit helper の重複を洗い出す
2. coverage 集計処理の重複を洗い出す
3. checklist / documentation wording の重複を洗い出す

### ステップ2: 共通化する

1. 共通設定と shared helper を抽出する
2. grep pattern と exclusion policy を再利用可能にする
3. Phase 11 / 12 テンプレートの重複文面を整理する

### ステップ3: 振る舞いを保持する

1. Phase 4-7 の test matrix を壊さないことを確認する
2. discovered issues / unassigned handoff を壊さないことを確認する
3. `refactoring-plan.md` に整理前後の対応表を残す

## 統合テスト連携

| 観点                  | 連携内容                                              |
| --------------------- | ----------------------------------------------------- |
| Refactor-safe guard   | 既存 testcase を保ったまま helper / config を整理する |
| Checklist consistency | Phase 11 / 12 テンプレートとの整合を維持する          |
| Evidence              | 整理前後の差分を `refactoring-plan.md` に残す         |

## 多角的チェック観点

| 観点           | 適用内容                                         | 仕様参照先                      |
| -------------- | ------------------------------------------------ | ------------------------------- |
| アーキテクチャ | helper / config / template の責務分離            | `development-guidelines.md`     |
| テスト戦略     | refactor 後も TC-ID / evidence ID が維持されるか | `testing-component-patterns.md` |
| 運用証跡       | Phase 11 / 12 の wording が drift しないか       | `lessons-learned.md`            |
| 拡張性         | future screen 追加時の差分が局所化されるか       | Phase 6 / 7 outputs             |

## 成果物

| 成果物           | パス                                                                                                          | 説明                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| refactoring-plan | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-8/refactoring-plan.md` | 重複整理と振る舞い維持の記録 |

## 完了条件

- [x] guard の設定重複が整理されている
- [x] checklist / documentation の再利用方針がある
- [x] Phase 4-7 の振る舞い維持条件が記録されている
- [x] Phase 9 が品質評価に進める

## サブタスク管理

1. Phase 1 / 2 / 5 / 6 / 7 の成果物を確認する
2. 重複箇所を洗い出す
3. 共通化方針を定義する
4. 振る舞い維持条件を定義する
5. refactoring-plan を更新する

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物の planned path を確定
- [x] `artifacts.json` の Phase 8 登録を更新
- [x] Phase 9 の品質評価へ渡す整理結果が明記されている

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard --phase 8
```

## 次Phase

Phase 9: 品質検証
