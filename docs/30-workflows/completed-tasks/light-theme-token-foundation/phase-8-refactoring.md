# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 |
| Phase      | 8                                         |
| Phase名    | リファクタリング                          |
| ステータス | completed                                 |
| 前提Phase  | Phase 7                                   |
| 後続Phase  | Phase 9                                   |

## 目的

token 命名と参照の冗長さを整理する。

## 実行タスク

- タスク1: alias token の最終整理を行う
- タスク2: 不要 token の削除方針を確認する
- タスク3: 契約表との乖離を解消する

## 参照資料

| 参照資料         | パス                                                                                                | 説明             |
| ---------------- | --------------------------------------------------------------------------------------------------- | ---------------- |
| Phase 1 成果物   | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-1/`                   | 要件と受入基準   |
| Token contract   | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-2/token-contract.md`  | 保持すべき契約   |
| Phase 5 成果物   | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-5/`                   | 実装差分         |
| Phase 6 成果物   | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-6/`                   | テスト拡張結果   |
| Coverage report  | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-7/coverage-report.md` | 乖離確認の根拠   |
| UI design system | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                          | token 命名の正本 |

## 統合テスト連携

| 観点                   | 連携内容                                                                  |
| ---------------------- | ------------------------------------------------------------------------- |
| Refactor-safe contract | Phase 4-7 で確立した testcase を維持したまま token 整理を行う             |
| Downstream impact      | shared migration task に影響する alias 変更は contract 文書へ即時反映する |
| Evidence               | 変更前後の契約差分を `refactoring-plan.md` に残す                         |

## 成果物

| 成果物           | パス                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| refactoring-plan | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-8/refactoring-plan.md` |

## 完了条件

- [x] token 命名の冗長性が整理されている
- [x] 契約表と実装の差分が解消されている

## 次Phase

Phase 9: 品質検証
