# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| Phase      | 6                                                  |
| タスクID   | UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001 |
| 機能名     | ut-imp-runtime-workflow-verify-artifact-append-001 |
| 前提Phase  | Phase 5                                            |
| 後続Phase  | Phase 7                                            |
| ステータス | 完了                                               |
| 作成日     | 2026-03-26                                         |

## 目的

failure append 修正に対して engine / facade の回帰観点を追加し、同系統欠落を再発させない。

## 実行タスク

- engine test に `verify_result` append 検証を追加する
- facade test に failure artifact 正本検証を追加する
- repeated failure の履歴増分検証を追加する

## 参照資料

| 参照資料   | パス                                                                                          | 内容                       |
| ---------- | --------------------------------------------------------------------------------------------- | -------------------------- |
| Phase 4    | `phase-4-test-creation.md`                                                                    | test case                  |
| 親未タスク | `docs/30-workflows/unassigned-task/task-fix-runtime-workflow-engine-failure-lifecycle-001.md` | failure lifecycle の親文脈 |

### システム仕様（aiworkflow-requirements）

| 参照資料        | パス                                                                           | 内容                                 |
| --------------- | ------------------------------------------------------------------------------ | ------------------------------------ |
| lessons current | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` | state と artifact を対で確認する教訓 |

## 統合テスト連携

| 観点         | 連携内容                                     |
| ------------ | -------------------------------------------- |
| failure path | append 検証を engine / facade の両方へ入れる |

## 成果物

| 成果物        | パス                                        | 説明             |
| ------------- | ------------------------------------------- | ---------------- |
| test 拡張仕様 | `outputs/phase-6/test-expansion-summary.md` | 追加ケースの根拠 |

## 完了条件

- [ ] engine test が `verify_result` append を確認する
- [ ] facade test が `execute_result` と `verify_result` の両方を確認する
- [ ] repeated failure の履歴増分を確認する
- [ ] 失敗時の state と artifact を対で検証している
