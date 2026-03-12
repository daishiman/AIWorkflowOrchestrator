# Phase 12 Unassigned Task Detection

## 結果

- 新規未タスク: 2件
- `docs/30-workflows/unassigned-task/` への task-060 由来の新規配置: 2件
- task-spec 10見出し監査が必要な新規指示書: 2件

## 検出した未タスク

| 未タスクID                                        | 概要                                                                                                         | 配置先                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001 | docs-only parent workflow の pointer / legacy / interfaces / capture script / mirror root sweep を標準化する | `docs/30-workflows/unassigned-task/task-imp-workspace-parent-reference-sweep-guard-001.md` |
| UT-IMP-WORKSPACE-PARENT-VISUAL-EVIDENCE-GUARD-001 | docs-only parent workflow の representative screenshot 3件昇格条件と visual re-audit policy を標準化する     | `docs/30-workflows/unassigned-task/task-imp-workspace-parent-visual-evidence-guard-001.md` |

## 判断根拠

- parent pointer / master index の stale path は Phase 5 で解消済み
- system spec の 04B stale evidence path は `interfaces-llm.md` / `interfaces-chat-history.md` まで同期済み
- completed-task pointer docs 04A / 04B / 04C と `task-090-tasks-index-legacy.md` の stale status は直接修正で解消済み
- 04A capture script の stale workflow root は直接修正で解消済み
- 初回の task-060 再監査では「同一ターンで drift を修正し切った」ため 0件と判断したが、user 要求により再利用価値の高い 2 つの苦戦箇所を active backlog として formalize した
- `verify-unassigned-links` は 218 / 218（missing 0）で、追加した 2 件のリンク整合も PASS した
- `audit-unassigned-tasks --json --diff-from HEAD --target-file ...` を 2件それぞれへ再実行し、どちらも `currentViolations 0 / baselineViolations 134` を確認した
- `rg -l "TASK-UI-04-WORKSPACE-VIEW|task-060-ui-04-workspace-view" docs/30-workflows/unassigned-task docs/30-workflows/completed-tasks/unassigned-task | sort` では新規 2 ファイルだけが検出された

## 記録

- `UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001` と `UT-IMP-WORKSPACE-PARENT-VISUAL-EVIDENCE-GUARD-001` を作成した
- 既存 child workflow の未タスクは child 側 canonical path で継続管理しつつ、parent 固有の docs-only 難所だけを root `unassigned-task/` へ切り出した
- 今回検出した drift 自体は修正済みだが、「sweep 範囲の標準化」と「visual evidence policy の標準化」は次回短縮のため active backlog 化した
- legacy baseline 134件は repository 全体の既存課題として監視し、今回差分の合否とは分離して扱う
