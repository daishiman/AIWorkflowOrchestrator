# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 値                                                                      |
| ---------- | ----------------------------------------------------------------------- |
| Phase      | 11                                                                      |
| タスクID   | UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001                      |
| 機能名     | ut-imp-runtime-workflow-verify-artifact-append-001                      |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10 |
| 後続Phase  | Phase 12                                                                |
| ステータス | 完了                                                                    |
| 作成日     | 2026-03-26                                                              |

## 目的

failure path の artifact append を人手で追跡し、test が見落としやすい履歴順序の崩れを確認する。

## 実行タスク

- failure 実行後の artifact 順序を確認する
- repeated failure 後の履歴件数を確認する
- state と artifact の不一致がないかを確認する

## 参照資料

| 参照資料 | パス                       | 内容   |
| -------- | -------------------------- | ------ |
| Phase 4  | `phase-4-test-creation.md` | ケース |
| Phase 10 | `phase-10-final-review.md` | gate   |

### システム仕様（aiworkflow-requirements）

| 参照資料        | パス                                                                           | 内容                       |
| --------------- | ------------------------------------------------------------------------------ | -------------------------- |
| lessons current | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` | state と artifact の対確認 |

## 統合テスト連携

| 観点             | 連携内容                                |
| ---------------- | --------------------------------------- |
| manual follow-up | test が拾わない履歴順序を手動で確認する |

## 成果物

| 成果物          | パス                                        | 説明               |
| --------------- | ------------------------------------------- | ------------------ |
| checklist       | `outputs/phase-11/manual-test-checklist.md` | 手動確認項目       |
| result          | `outputs/phase-11/manual-test-result.md`    | 実行結果記録       |
| screenshot plan | `outputs/phase-11/screenshot-plan.json`     | 補助成果物要件対応 |

## 完了条件

- [ ] failure path の artifact 順序を確認した
- [ ] repeated failure の履歴件数を確認した
- [ ] state と artifact の不一致がない
- [ ] Phase 12 へ渡す発見事項を記録した
