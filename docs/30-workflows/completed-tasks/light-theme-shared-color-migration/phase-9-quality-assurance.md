# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 |
| Phase      | 9                                               |
| Phase名    | 品質検証                                        |
| ステータス | not_started                                     |
| 前提Phase  | Phase 8                                         |
| 後続Phase  | Phase 10                                        |

## 目的

shared color migration が light theme 可読性改善に繋がっているか評価する。

## 実行タスク

- タスク1: representative file の quality check を行う
- タスク2: token 契約逸脱の有無を確認する
- タスク3: regression guard task への引き継ぎ事項を整理する

## 参照資料

| 参照資料                 | パス                                                                                                      | 説明           |
| ------------------------ | --------------------------------------------------------------------------------------------------------- | -------------- |
| Phase 5 成果物           | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-5/`                   | 実装差分       |
| Coverage report          | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-7/coverage-report.md` | テスト充足状況 |
| ui-ux-design-principles  | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                            | 可読性判断基準 |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                           | feature 記録先 |
| lessons-learned          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                    | 再発防止観点   |

## 実行手順

1. representative file と representative screen を design system / design principles に照らして評価する。
2. token 契約逸脱、hardcoded reintroduction、light readability regression の有無を確認する。
3. Phase 10 のレビューゲートと regression guard handoff に必要な品質結果を `quality-report.md` に整理する。

## 統合テスト連携

| 観点                     | 連携内容                                                              |
| ------------------------ | --------------------------------------------------------------------- |
| Quality gate             | Phase 10 の AC 判定に渡す品質結果を整理する                           |
| Regression guard handoff | hardcoded color pattern と representative screen を Task 3 へ引き渡す |
| Evidence                 | Phase 11 で確認すべき代表画面と懸念箇所を明文化する                   |

## 成果物

| 成果物         | パス                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| quality-report | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-9/quality-report.md` |

## 完了条件

- [ ] 代表画面での品質評価観点が記録されている
- [ ] regression guard へ渡す観点が整理されている

## 次Phase

Phase 10: 最終レビュー
