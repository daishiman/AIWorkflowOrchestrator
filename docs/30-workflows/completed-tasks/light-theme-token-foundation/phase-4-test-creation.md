# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 |
| Phase      | 4                                         |
| Phase名    | テスト作成                                |
| ステータス | completed                                 |
| 前提Phase  | Phase 3 PASS/MINOR                        |
| 後続Phase  | Phase 5                                   |

## 目的

token 契約を壊さないためのテスト観点を定義する。

## 実行タスク

- タスク1: `tokens.css` の light theme token 完備性テストを設計する
- タスク2: missing token 参照の検出テストを設計する
- タスク3: representative theme rendering テストを設計する

## 参照資料

| 参照資料             | パス                                                                                               | 説明                          |
| -------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------- |
| Phase 1 成果物       | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-1/`                  | 要件と受入基準                |
| Phase 2 設計         | `docs/30-workflows/completed-tasks/light-theme-token-foundation/phase-2-design.md`                 | token 契約と role matrix      |
| Phase 3 成果物       | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-3/`                  | 設計レビュー結果              |
| Token contract       | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-2/token-contract.md` | テスト対象の正本              |
| Testing patterns     | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                  | component / style test の正本 |
| Quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                        | テスト品質基準                |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容             |
| -------------------------- | --------------------------------------------------------------------------------- | ---------------- |
| testing component patterns | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テーマテスト方針 |
| ui-ux-design-system        | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`        | token 契約       |

## 統合テスト連携

| 観点                 | 連携内容                                                          |
| -------------------- | ----------------------------------------------------------------- |
| Renderer theme smoke | representative component で token 反映確認ケースを定義する        |
| Downstream handoff   | shared migration task が再利用できる token test matrix を出力する |
| IPC/Preload          | IPC は対象外。renderer style regression のみを検証する            |

## 成果物

| 成果物             | パス                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| test-specification | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-4/test-specification.md` |
| token-test-matrix  | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-4/token-test-matrix.md`  |

## 完了条件

- [x] token 完備性テストケースが定義されている
- [x] missing token 検出ケースが定義されている
- [x] light/dark/kanagawa 比較観点が定義されている

## 次Phase

Phase 5: 実装
