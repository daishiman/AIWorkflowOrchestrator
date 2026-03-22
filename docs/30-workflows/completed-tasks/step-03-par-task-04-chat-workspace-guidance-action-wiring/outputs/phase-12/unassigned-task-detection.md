# Phase 12: 未タスク検出

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 12                                                 |
| 作成日   | 2026-03-22                                         |

## 検出結果: 4件

| ID                                                        | 起源                            | 影響                                                | 実体パス                                                                                       | 同期先                                       |
| --------------------------------------------------------- | ------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001`        | Phase 3 M-01                    | secondary CTA が仕様だけで UI 未成立                | `docs/30-workflows/unassigned-task/UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001.md`        | backlog / completed / workflow ref / lessons |
| `UT-IMP-CHAT-WORKSPACE-GUIDANCE-RETRY-CONNECTION-IPC-001` | Phase 3 M-02                    | retry action が契約未定義で実行不能                 | `docs/30-workflows/unassigned-task/UT-IMP-CHAT-WORKSPACE-GUIDANCE-RETRY-CONNECTION-IPC-001.md` | backlog / completed / workflow ref / lessons |
| `UT-CLEANUP-CHAT-WORKSPACE-GUIDANCE-STATE-001`            | Phase 3 M-03, Phase 11 DI-11-04 | stale state / comment が再読コストを増やす          | `docs/30-workflows/unassigned-task/UT-CLEANUP-CHAT-WORKSPACE-GUIDANCE-STATE-001.md`            | backlog / completed / workflow ref / lessons |
| `UT-DESIGN-CHAT-WORKSPACE-GUIDANCE-REASON-PRIORITY-001`   | Phase 3 M-04, Phase 11 DI-11-03 | 複数 reason 同時成立時に surface drift が再発しうる | `docs/30-workflows/unassigned-task/UT-DESIGN-CHAT-WORKSPACE-GUIDANCE-REASON-PRIORITY-001.md`   | backlog / completed / workflow ref / lessons |

## formalization 結果

- 4件すべて Markdown 本体を作成した
- `task-workflow-backlog.md` へ 4件追加済み
- `task-workflow-completed.md` の Task04 close-out セクションに follow-up 一覧を記録済み
- `workflow-ai-runtime-execution-responsibility-realignment.md` に close-out summary と unassigned table を追加済み
- lessons learned に Phase12 同期ルールとして反映済み

## Why / If 分析

| ID               | なぜ必要か                                      | もし漏らすと何が起きるか                               |
| ---------------- | ----------------------------------------------- | ------------------------------------------------------ |
| open-terminal    | shared guidance map と UI の差分を閉じるため    | 仕様上ある secondary CTA が実 UI では消えたままになる  |
| retry-connection | action type を死蔵させないため                  | network/health 系 blocked に settings しか解がなくなる |
| state-cleanup    | guard 導入後の stale state を整理するため       | 後続 task で誤読と duplicate guard が再発する          |
| reason-priority  | 複数 reason 競合時の single source を決めるため | Chat / Workspace で別理由が表示される drift が再発する |
