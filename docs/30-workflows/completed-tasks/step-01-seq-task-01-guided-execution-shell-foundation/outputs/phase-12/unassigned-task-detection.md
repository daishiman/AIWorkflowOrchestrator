# Unassigned Task Detection Report - guided-execution-shell-foundation

## Meta

| Item    | Value                                          |
| ------- | ---------------------------------------------- |
| Task ID | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| Phase   | 12                                             |
| Created | 2026-03-24                                     |

---

## Summary

| Category                                        | Count |
| ----------------------------------------------- | ----- |
| New unassigned tasks detected                   | 2     |
| Existing unassigned tasks resolved by this task | 2     |

---

## Resolved Unassigned Tasks

### 1. ut-viewtype-terminal-addition.md

| Item            | Value                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------- |
| Path            | `docs/30-workflows/unassigned-task/ut-viewtype-terminal-addition.md`                                              |
| Original GAP    | `ViewType` union lacked a `terminal` or `executionConsole` entry, making `setCurrentView("terminal")` unreachable |
| Resolution      | `executionConsole` added to `ViewType` union, `renderView()` case added, `ExecutionConsoleView` stub created      |
| Resolution task | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001                                                                    |
| Close method    | Mark as resolved in `task-workflow.md`                                                                            |

### 2. UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001.md

| Item            | Value                                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| Path            | `docs/30-workflows/unassigned-task/UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001.md`                               |
| Original GAP    | `LLMGuidanceBanner` and `WorkspaceChatPanel` secondary CTA `open-terminal` action was not connected to any dispatcher |
| Resolution      | Both surfaces wired to `openExecutionConsole()` via `createGuidanceActionDispatcher` extension                        |
| Resolution task | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001                                                                        |
| Close method    | Mark as resolved in `task-workflow.md`                                                                                |

---

## New Unassigned Task Detection

### Detection Method

1. Reviewed all Phase 1-11 outputs for TODO/FIXME/deferred items
2. Reviewed Phase 3 MINOR findings (M-1, M-2, M-3) for items not resolved within this task scope
3. Reviewed Phase 10 final review for carryover items

### Detection Results

| #   | Potential Item                                  | Decision                | Rationale                                                                                                      |
| --- | ----------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | navContract.ts に executionConsole エントリ追加 | **New unassigned task** | scope-definition.md で「実装は後続タスクに委譲」と明記。final-gate-decision.md Task02 前提条件 #7 と矛盾を発見 |
| 2   | M-1: `runtimeAccess.ts` function rename         | **New unassigned task** | `launchMainlineTerminal` の改名は実際には実施されておらず、設計文書に留まる。後続タスクとして切り出し          |
| -   | M-2: Skill Creator CTA action type export       | Covered in-scope        | Phase 5 implementation plan includes action type definition                                                    |
| -   | M-3: TerminalLauncher rename test impact        | Covered in-scope        | Phase 4 test plan includes rename-related test modifications                                                   |

**Result**: 2 new unassigned tasks detected.

### New Unassigned Task Details

#### UT-IMP-NAVCONTRACT-EXECUTION-CONSOLE-ENTRY-001

| Item     | Value                                                                                     |
| -------- | ----------------------------------------------------------------------------------------- |
| Path     | `docs/30-workflows/unassigned-task/ut-imp-navcontract-execution-console-entry-001.md`     |
| Priority | HIGH                                                                                      |
| GAP      | navContract.ts に `executionConsole` エントリが未定義のため GlobalNavStrip に表示されない |
| Source   | Phase 10 final-gate-decision.md Task02 前提条件 #7 vs scope-definition.md Section 4       |

#### UT-RENAME-RUNTIME-ACCESS-TERMINAL-HELPERS-001

| Item     | Value                                                                                |
| -------- | ------------------------------------------------------------------------------------ |
| Path     | `docs/30-workflows/unassigned-task/ut-rename-runtime-access-terminal-helpers-001.md` |
| Priority | LOW                                                                                  |
| GAP      | `launchMainlineTerminal` / `openMainTerminal` が terminal 命名のまま残存             |
| Source   | Phase 3 MINOR M-1（runtimeAccess.ts function rename）                                |

---

## 3-Step Compliance (P3/P38)

For the 2 new unassigned tasks:

1. Instruction file in `unassigned-task/` -- Done (2 files created)
2. `task-workflow-backlog.md` backlog table registration -- Done (2 entries added)
3. Related spec cross-reference link -- Done (documented in system-spec-update-summary.md)

For the 2 resolved tasks, the close process is:

1. Mark resolved in `task-workflow.md` with this task ID
2. Add resolution note to each unassigned task file (or strikethrough in backlog table)
3. Close corresponding GitHub Issues if they exist (`gh issue close <number>` per P56)
