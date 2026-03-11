# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 |
| Phase      | 11                                        |
| Phase名    | 手動テスト                                |
| ステータス | completed                                 |
| 前提Phase  | Phase 10                                  |
| 後続Phase  | Phase 12                                  |

## 目的

token 基盤変更が代表画面の見え方に与える影響を確認する。

## 実行タスク

- タスク1: Settings / Dashboard / Auth / AgentView の representative light theme を確認する
- タスク2: 「白の強さ」と「補助テキスト可読性」を観察する
- タスク3: shared migration task で残る問題を切り分ける

## テストケース

| TC-ID    | 画面                       | 観点                         | 優先度 |
| -------- | -------------------------- | ---------------------------- | ------ |
| TC-11-01 | Dashboard（light）         | 背景階層と情報密度           | A      |
| TC-11-02 | Settings（light）          | 補助テキストと border 視認性 | A      |
| TC-11-03 | Auth shell（light）        | 主要導線の可読性             | A      |
| TC-11-04 | AgentView（light）         | card/CTA/補助文の階層        | A      |
| TC-11-05 | Dashboard（dark baseline） | light 改善の比較基準         | B      |

## 画面カバレッジマトリクス

| テストケース | 画面/状態                 | 証跡                                                                |
| ------------ | ------------------------- | ------------------------------------------------------------------- |
| TC-11-01     | Dashboard light 基準表示  | `outputs/phase-11/screenshots/TC-11-01-dashboard-light.png`         |
| TC-11-02     | Settings light 一覧表示   | `outputs/phase-11/screenshots/TC-11-02-settings-light.png`          |
| TC-11-03     | Auth shell light 表示     | `outputs/phase-11/screenshots/TC-11-03-auth-shell-light.png`        |
| TC-11-04     | AgentView light main view | `outputs/phase-11/screenshots/TC-11-04-agent-main-light.png`        |
| TC-11-05     | Dashboard dark baseline   | `outputs/phase-11/screenshots/TC-11-05-dashboard-dark-baseline.png` |

## 参照資料

| 参照資料             | パス                                                                                               | 説明                                 |
| -------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Phase 11/12 guide    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                        | representative screenshot と記録方式 |
| Phase 2 成果物       | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-2/`                  | token 契約                           |
| Phase 5 成果物       | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-5/`                  | 実装差分                             |
| Phase 6 成果物       | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-6/`                  | テスト拡張結果                       |
| Phase 7 成果物       | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-7/`                  | coverage                             |
| Phase 8 成果物       | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-8/`                  | refactoring 結果                     |
| Phase 10 成果物      | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-10/`                 | 最終レビュー結果                     |
| Quality report       | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-9/quality-report.md` | 手動テスト観点の入力                 |
| UI design principles | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                     | 目視評価の基準                       |

## 統合テスト連携

| 観点                   | 連携内容                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------- |
| Representative screens | Settings / Dashboard / Auth / AgentView の light theme を current build で確認する |
| Downstream issue split | token 問題と component 問題を切り分けて Task 2/3 へ引き渡す                        |
| Evidence               | `manual-test-result.md` と発見事項を Phase 12 の未タスク検出へ渡す                 |

## 成果物

| 成果物              | パス                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| manual-test-plan    | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-11/manual-test-plan.md`    |
| manual-test-result  | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-11/manual-test-result.md`  |
| discovered-issues   | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-11/discovered-issues.md`   |
| screenshot-coverage | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-11/screenshot-coverage.md` |

## 完了条件

- [x] representative screen の観察結果がある
- [x] token だけで解決しない残課題が整理されている

## 次Phase

Phase 12: ドキュメント
