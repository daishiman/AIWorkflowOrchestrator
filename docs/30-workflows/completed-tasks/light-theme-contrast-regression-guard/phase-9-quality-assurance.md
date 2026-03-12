# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | `TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001` |
| Phase      | 9                                                    |
| Phase名    | 品質検証                                             |
| ステータス | completed                                            |
| 前提Phase  | Phase 8                                              |
| 後続Phase  | Phase 10                                             |

## 目的

guard が false positive / false negative / future parallel execution の各観点で運用に耐えるかを評価する。

## 実行タスク

- タスク1: false positive / false negative の妥当性を評価する
- タスク2: future parallel execution への適合性を評価する
- タスク3: Phase 11 / 12 へ渡す品質観点を確定する

## 参照資料

| 参照資料         | パス                                                                                                          | 説明               |
| ---------------- | ------------------------------------------------------------------------------------------------------------- | ------------------ |
| Phase 5 成果物   | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-5/`                    | 実装差分           |
| coverage report  | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-7/coverage-report.md`  | coverage 状況      |
| refactoring plan | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-8/refactoring-plan.md` | 冗長性整理後の構成 |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容                             |
| ----------------------- | ------------------------------------------------------------------------------ | -------------------------------- |
| quality-requirements    | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | quality gate の基準              |
| ui-ux-design-principles | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | visual quality の基準            |
| testing-accessibility   | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`   | WCAG 観点                        |
| lessons-learned         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`         | screenshot / light contrast 教訓 |

## 実行手順

### ステップ1: 判定精度を評価する

1. false positive / false negative の既知パターンで妥当性を確認する
2. baseline backlog の扱いが現実的か確認する
3. screenshot / audit / docs bridge のどこで誤判定が起きるかを分類する

### ステップ2: parallel execution 適合性を確認する

1. token foundation / shared migration と衝突しないか確認する
2. representative screen / audit scope の overlap を確認する
3. Phase 10 で formalize すべき残課題を抽出する

### ステップ3: Phase 11 / 12 入力を確定する

1. 手動レビューで必須確認する項目を列挙する
2. system spec に同期すべき事項を列挙する
3. `quality-report.md` に推奨アクションを残す

## 統合テスト連携

| 観点               | 連携内容                                                 |
| ------------------ | -------------------------------------------------------- |
| Quality gate       | Phase 10 の AC 判定に渡す品質結果を整理する              |
| Parallel execution | token foundation / shared migration との両立性を確認する |
| Evidence           | Phase 11 / 12 で再確認すべき項目を列挙する               |

## 多角的チェック観点

| 観点             | 適用内容                                 | 仕様参照先                                                                                                                                   |
| ---------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| UI/UX            | light theme visual quality の過不足      | `ui-ux-design-principles.md`                                                                                                                 |
| アクセシビリティ | WCAG contrast / helper text の妥当性     | `testing-accessibility.md`                                                                                                                   |
| アーキテクチャ   | parallel execution でも責務が崩れないか  | dependency workflows                                                                                                                         |
| 運用証跡         | Phase 11 / 12 に必要な evidence が揃うか | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |

## 成果物

| 成果物         | パス                                                                                                        | 説明                       |
| -------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------- |
| quality-report | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-9/quality-report.md` | 判定精度と並列適合性の評価 |

## 完了条件

- [x] guard 運用性の評価が記録されている
- [x] false positive / false negative の妥当性が説明されている
- [x] future parallel execution への適合性がある
- [x] Phase 10 / 11 / 12 へ渡す項目が確定している

## サブタスク管理

1. Phase 5 / 7 / 8 の成果物を確認する
2. 判定精度を評価する
3. parallel execution 影響を評価する
4. Phase 11 / 12 入力を定義する
5. quality-report を更新する

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物の planned path を確定
- [x] `artifacts.json` の Phase 9 登録を更新
- [x] Phase 10 / 11 / 12 handoff を明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard --phase 9
```

## 次Phase

Phase 10: 最終レビュー
