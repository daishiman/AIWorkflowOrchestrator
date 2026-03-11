# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 |
| Phase      | 3                                         |
| Phase名    | 設計レビュー                              |
| ステータス | completed                                 |
| 前提Phase  | Phase 1, Phase 2                          |
| 後続Phase  | Phase 4                                   |

## 目的

token 設計と責務境界が妥当かをレビューし、Phase 4 以降へ進むかを判定する。

## 実行タスク

- タスク1: 要件と token 設計の整合確認
- タスク2: missing token 方針の安全性確認
- タスク3: ゲート判定

### レビュー観点

| 観点             | 判定基準                                                   |
| ---------------- | ---------------------------------------------------------- |
| 要件整合         | AC-1〜AC-5 が設計へ落ちている                              |
| 責務分離         | component 修正を本タスクへ混ぜていない                     |
| 再利用性         | 後続タスクが token 契約をそのまま使える                    |
| 実行順序         | Phase 1-3 完了前に実装開始しない構造になっている           |
| ユーザー方針反映 | commit/PR 禁止、SubAgent 方針、Codex lane が明記されている |

## 参照資料

| 参照資料       | パス                                                                              | 説明 |
| -------------- | --------------------------------------------------------------------------------- | ---- |
| Phase 1 成果物 | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-1/` | 要件 |
| Phase 2 成果物 | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-2/` | 設計 |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                        | 内容                    |
| -------------------- | --------------------------------------------------------------------------- | ----------------------- |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質観点                |
| lessons-learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | light review の再発防止 |

## 判定

| 判定  | 条件                           | 次アクション     |
| ----- | ------------------------------ | ---------------- |
| PASS  | 全観点 OK                      | Phase 4 へ進む   |
| MINOR | 文言/参照微修正のみ            | 修正後に Phase 4 |
| MAJOR | token 契約または責務境界が曖昧 | Phase 2 へ戻る   |

## 統合テスト連携

| 観点              | 連携内容                                                                |
| ----------------- | ----------------------------------------------------------------------- |
| Gate to test      | PASS/MINOR になった token contract のみを Phase 4 以降で使用する        |
| Downstream review | shared migration / regression guard の前提条件をレビュー結果へ明記する  |
| Evidence          | `design-review-result.md` に Phase 4 以降のテスト観点引き継ぎを記録する |

## 成果物

| 成果物               | パス                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| design-review-result | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-3/design-review-result.md` |

## 完了条件

- [x] 要件と設計の整合が確認されている
- [x] 後続タスクとの境界が維持されている
- [x] PASS または MINOR 判定が記録されている
- [x] Phase 4 以降へ進む条件が明文化されている

## 次Phase

Phase 4: テスト作成
