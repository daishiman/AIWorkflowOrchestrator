# TASK-UI-04-WORKSPACE-VIEW branch diff reflection matrix

## 目的

本ワークツリー / 本ブランチの差分が、`task-specification-creator` と `aiworkflow-requirements` の今回必要な要求へ対応づいているかを監査可能にする。

## 差分反映マトリクス

| branch diff 単位        | 変更内容                                                                                                                          | 対応する正本                                                   | 監査結果         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------- |
| branch 作成             | `task-20260312-workspace-view-specs` を spec-only branch として固定                                                               | user policy, `create-workflow.md`                              | 反映済み         |
| workflow root           | `index.md`、`artifacts.json`、root ledger を parent reference workflow として作成                                                 | `task-specification-creator/SKILL.md`                          | 反映済み         |
| Phase 1-3               | 設計書先行、review gate、後続 Phase block を明記                                                                                  | `create-workflow.md`, `review-gate-criteria.md`                | 反映済み         |
| Phase 4-10              | contract test、QA、final gate を docs-only parent 向けに定義                                                                      | `phase-templates.md`, `commands.md`                            | 反映済み         |
| Phase 11                | child evidence 継承、`テストケース`、`画面カバレッジマトリクス`、N/A を追加                                                       | `phase-11-12-guide.md`, `screenshot-verification-procedure.md` | 今回の改善で反映 |
| Phase 12                | Step 1-A / 1-B / 1-C / 1-D / Step 2、LOGS 2ファイル、topic-map / `generate-index.js`、`phase12-task-spec-compliance-check` を追加 | `spec-update-workflow.md`, `phase12-checklist-definition.md`   | 今回の改善で反映 |
| Phase 13                | commit / PR block を blocked policy として固定                                                                                    | user policy, `phase-templates.md`                              | 反映済み         |
| aiworkflow extraction   | entrypoint だけでなく architecture / UX / quality / error taxonomy まで抽出対象を拡張                                             | `aiworkflow-requirements/SKILL.md`, `resource-map.md`          | 今回の改善で反映 |
| pointer discoverability | 元 `task-060` と master index に workflow root の canonical 導線を追加                                                            | `phase-5-implementation.md`, user request                      | 今回の改善で反映 |
| root audit              | compliance / extraction / branch diff の3台帳で相互監査できるようにした                                                           | `phase-templates.md`, `spec-update-workflow.md`                | 今回の改善で反映 |
| elegance review         | 全破棄ではなく正規化を採用する判断を台帳化した                                                                                    | `solution-elegance-review.md`                                  | 今回の改善で反映 |

## 監査で見つかった不足と是正

| 不足                               | 影響                                        | 是正内容                        |
| ---------------------------------- | ------------------------------------------- | ------------------------------- |
| Phase 本文に template 共通節が不足 | skill 準拠の監査が root matrix 側だけに偏る | Phase 1-13 へ共通節を追加した   |
| aiworkflow 抽出が entrypoint 偏重  | quality / UX / error taxonomy の根拠が弱い  | 抽出セットを 16テーマへ拡張した |
| branch diff 監査台帳がない         | 「本ブランチ差分に反映済みか」が追えない    | 本ファイルを追加した            |

## 本ブランチで維持する制約

- 実装コードには触れず、docs-only parent spec に限定する
- Phase 1-3 の設計が整うまで後続 Phase は実行しない
- commit / PR はユーザー承認まで行わない
- canonical root は `.claude/skills/...` とし、mirror root は drift 監査対象に留める
