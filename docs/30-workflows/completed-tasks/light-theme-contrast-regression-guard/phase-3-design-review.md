# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | `TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001` |
| Phase      | 3                                                    |
| Phase名    | 設計レビュー                                         |
| ステータス | completed                                            |
| 前提Phase  | Phase 1, Phase 2                                     |
| 後続Phase  | Phase 4                                              |

## 目的

Phase 1-2 で定義した screenshot / audit / evidence policy が、依存 workflow と system spec に対して過不足なく成立するかを gate する。

> P50パターン該当: 検証・補完モード。既存実装前提の guard 仕様として過不足をレビューする。

## 実行タスク

- タスク1: screenshot matrix と representative screen の妥当性をレビューする
- タスク2: audit / baseline policy / lane 設計の妥当性をレビューする
- タスク3: future execution に進める gate 判定を記録する

### レビュー観点

| 観点       | 判定基準                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| 代表性     | 4 画面で現状の light theme drift を再現しやすい                                                      |
| 検出性     | hardcoded color drift と screenshot drift を分けて拾える                                             |
| 運用性     | current/baseline と spec-only / future execution の区別が明確                                        |
| 依存整合   | token foundation / shared color migration と責務競合しない                                           |
| skill 準拠 | `task-specification-creator` の共通セクションと `aiworkflow-requirements` の必要参照が反映されている |

### 判定

| 判定  | 条件                                            | 次アクション                                     |
| ----- | ----------------------------------------------- | ------------------------------------------------ |
| PASS  | 重大欠落なし                                    | Phase 4 以降を future execution 用仕様として確定 |
| MINOR | wording / path / coverage 補足のみ              | 同Phaseで修正して Phase 4 へ進む                 |
| MAJOR | representative / audit / evidence policy の不足 | Phase 2 へ戻す                                   |

## 参照資料

| 参照資料       | パス                                                                                       | 説明                                  |
| -------------- | ------------------------------------------------------------------------------------------ | ------------------------------------- |
| Phase 1 成果物 | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-1/` | requirements / drift taxonomy         |
| Phase 2 成果物 | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-2/` | screenshot / audit / evidence policy  |
| index          | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/index.md`         | branch / policy / skill audit summary |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                                        | 内容                                              |
| ------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| resource map             | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 必要仕様の取りこぼし防止                          |
| quick reference          | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                         | current build / selector / mirror root の短手順   |
| quality requirements     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質 gate の基準                                  |
| task-workflow            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | baseline/current / unassigned 運用                |
| lessons-learned          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | current build / selector capture の教訓           |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | representative surface の feature 正本            |
| UI design principles     | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | light hierarchy / readability 判定基準            |
| Accessibility testing    | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                | WCAG 観点の取りこぼし防止                         |
| Implementation patterns  | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | dedicated harness / review scope 分離の妥当性確認 |

## 実行手順

### ステップ1: representative / audit 設計をレビューする

1. TC-ID ごとの target surface を確認する
2. grep pattern、baseline policy、false positive 除外規則を確認する
3. route 全景依存になっていないことを確認する

### ステップ2: skill 準拠差分をレビューする

1. 共通必須セクションの欠落がないかを確認する
2. resource-map / quick-reference 起点の system spec 抽出があるかを確認する
3. branch / artifacts / outputs の drift がないかを確認する

### ステップ3: gate 判定を記録する

1. PASS / MINOR / MAJOR を決定する
2. future execution の開始条件を記録する
3. Phase 4 以降へ渡す review result を出力する

## 統合テスト連携

| 観点            | 連携内容                                                                     |
| --------------- | ---------------------------------------------------------------------------- |
| Gate to test    | PASS/MINOR の設計だけを Phase 4 に引き渡す                                   |
| Dependency gate | token foundation / shared migration と競合する場合は Phase 2 に戻す          |
| Evidence        | `design-review-result.md` に capture / audit / baseline の最終方針を固定する |

## 多角的チェック観点

| 観点             | 適用内容                                            | 仕様参照先                                                  |
| ---------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| UI/UX            | representative screen の偏り有無                    | `ui-ux-feature-components.md`, `ui-ux-design-principles.md` |
| アクセシビリティ | WCAG 観点が screenshot / manual checklist に乗るか  | `testing-accessibility.md`                                  |
| アーキテクチャ   | token / migration / guard の責務競合がないか        | dependency workflows                                        |
| 文書整合         | branch / artifacts / outputs / mirror root の drift | `task-specification-creator`, `lessons-learned.md`          |

## 成果物

| 成果物               | パス                                                                                                              | 説明                          |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| design-review-result | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-3/design-review-result.md` | PASS/MINOR/MAJOR 判定と修正点 |

## 完了条件

- [x] representative / audit / baseline policy がレビュー済みである
- [x] skill 準拠差分と system spec 抽出差分が確認済みである
- [x] PASS または MINOR 判定が記録されている
- [x] Phase 4 以降の future execution 条件が明記されている

## サブタスク管理

1. Phase 1 と Phase 2 の成果物を確認する
2. skill 準拠差分を確認する
3. system spec 抽出差分を確認する
4. review result をまとめる
5. Phase 4 handoff 条件を固定する

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] review result の planned path を確定
- [x] `artifacts.json` の Phase 3 登録を更新
- [x] future execution の開始条件を明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard --phase 3
```

## 次Phase

Phase 4: テスト作成
