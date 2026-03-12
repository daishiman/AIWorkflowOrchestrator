# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | `TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001` |
| Phase      | 11                                                   |
| Phase名    | 手動テスト                                           |
| ステータス | completed                                            |
| 前提Phase  | Phase 10                                             |
| 後続Phase  | Phase 12                                             |

## 目的

design-review で定義した checklist と screenshot matrix が、current build / selector-based capture / WCAG 観点を含む現実的な review 運用として成立するかを確認する。

## 実行タスク

- タスク1: representative 4 画面の撮影手順を確認する
- タスク2: current build source pinning と screenshot coverage を確認する
- タスク3: discovered-issues / unassigned handoff を確認する

## テストケース

| TC-ID    | 画面                    | 重点観点                                          | 優先度 |
| -------- | ----------------------- | ------------------------------------------------- | ------ |
| TC-11-01 | Settings light          | card / selector / secondary text / settings shell | A      |
| TC-11-02 | Dashboard light         | surface hierarchy / border / panel readability    | A      |
| TC-11-03 | Auth light              | glass panel / CTA / helper text readability       | A      |
| TC-11-04 | WorkspaceSearch light   | input / result row / panel contrast               | A      |
| TC-11-05 | Dashboard dark baseline | light 改善比較の基準                              | B      |

## 画面カバレッジマトリクス

| テストケース | 画面 / 状態                           | 証跡                                                                |
| ------------ | ------------------------------------- | ------------------------------------------------------------------- |
| TC-11-01     | Settings light selector-based capture | `outputs/phase-11/screenshots/TC-11-01-settings-light.png`          |
| TC-11-02     | Dashboard light representative panel  | `outputs/phase-11/screenshots/TC-11-02-dashboard-light.png`         |
| TC-11-03     | Auth light glass panel                | `outputs/phase-11/screenshots/TC-11-03-auth-light.png`              |
| TC-11-04     | WorkspaceSearch light panel and rows  | `outputs/phase-11/screenshots/TC-11-04-workspace-search-light.png`  |
| TC-11-05     | Dashboard dark baseline               | `outputs/phase-11/screenshots/TC-11-05-dashboard-dark-baseline.png` |

## 参照資料

| 参照資料                          | パス                                                                                                        | 説明                                            |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Phase 11/12 guide                 | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                 | screenshot / coverage / discovered issue の正本 |
| screenshot verification procedure | `.claude/skills/task-specification-creator/references/screenshot-verification-procedure.md`                 | 撮影コマンドと検証手順                          |
| Phase 2 成果物                    | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-2/`                  | screenshot / audit / evidence policy            |
| Phase 5 成果物                    | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-5/`                  | 実装差分                                        |
| Phase 6 成果物                    | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-6/`                  | テスト拡張結果                                  |
| Phase 7 成果物                    | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-7/`                  | coverage report                                 |
| Phase 8 成果物                    | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-8/`                  | refactoring result                              |
| Phase 10 成果物                   | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-10/`                 | 最終レビュー結果                                |
| quality report                    | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-9/quality-report.md` | 手動テスト観点の入力                            |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容                                                |
| ----------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------- |
| quick reference         | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`            | selector-based capture / current build static serve |
| ui-ux-design-principles | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | 目視評価基準                                        |
| ui-ux-settings          | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`          | Settings shell の確認軸                             |
| ui-ux-forms             | `.claude/skills/aiworkflow-requirements/references/ui-ux-forms.md`             | Auth 画面の確認軸                                   |
| ui-ux-search-panel      | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`      | WorkspaceSearch の確認軸                            |
| testing-accessibility   | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`   | WCAG checklist                                      |
| task-workflow           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | current build / unassigned handoff                  |
| lessons-learned         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`         | static serve / selector capture 教訓                |

## 実行手順

### ステップ1: preflight を実行する

1. current worktree build の preview / static serve を用意する
2. target route / selector / theme を確認する
3. screenshot-plan.json の planned TC-ID と ready selector を確定する

### ステップ2: representative screenshot を取得する

1. route 全景ではなく selector-based capture を優先する
2. Settings / Dashboard / Auth / WorkspaceSearch の light state を撮影する
3. dark baseline 1件を比較用に取得する

### ステップ3: coverage と discovered issues を確認する

1. `validate-phase11-screenshot-coverage.js` で TC-ID と png の紐付けを確認する
2. light contrast / helper text / hierarchy の所見を記録する
3. current issue と baseline backlog を分離して discovered-issues へ残す

## 統合テスト連携

| 観点                   | 連携内容                                                                  |
| ---------------------- | ------------------------------------------------------------------------- |
| Representative screens | Settings / Dashboard / Auth / WorkspaceSearch を current build で確認する |
| Source pinning         | current build / asset hash / capture metadata の一致を確認する            |
| Evidence               | `manual-test-result.md` と `discovered-issues.md` を Phase 12 へ渡す      |

## 多角的チェック観点

| 観点             | 適用内容                                                    | 仕様参照先                                                                                                                                   |
| ---------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| UI/UX            | hierarchy、surface contrast、helper text readability        | `ui-ux-design-principles.md`                                                                                                                 |
| アクセシビリティ | WCAG 2.1 AA contrast、keyboard、focus visibility            | `testing-accessibility.md`                                                                                                                   |
| 運用証跡         | current build static serve、selector capture、metadata 同期 | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow.md`    |
| backlog 連携     | discovered issue と unassigned handoff の分離               | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |

## 成果物

| 成果物              | パス                                                                                                              | 説明                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| manual-test-plan    | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-11/manual-test-plan.md`    | 実施手順と観点                        |
| screenshot-plan     | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-11/screenshot-plan.json`   | TC-ID / route / selector / theme      |
| screenshot-coverage | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-11/screenshot-coverage.md` | TC ↔ png の coverage                  |
| manual-test-result  | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-11/manual-test-result.md`  | 手動レビュー結果                      |
| discovered-issues   | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-11/discovered-issues.md`   | current issue / baseline backlog 分離 |

## 完了条件

- [x] checklist が current build 前提で実運用できる
- [x] TC-ID と screenshot が 1対1で結び付いている
- [x] representative 4 画面 + dark baseline の coverage が記録されている
- [x] discovered issue が current / baseline に分離されている

## サブタスク管理

1. Phase 10 handoff を確認する
2. preflight を実行する
3. screenshot-plan と screenshot を取得する
4. coverage と discovered issue を記録する
5. Phase 12 handoff をまとめる

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物の planned path を確定
- [x] `artifacts.json` の Phase 11 登録を更新
- [x] TC-ID ↔ png ↔ discovered issue の紐付けを明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard --phase 11
```

## 次Phase

Phase 12: ドキュメント
