# System Spec Update Summary - guided-execution-shell-foundation

## Meta

| Item    | Value                                          |
| ------- | ---------------------------------------------- |
| Task ID | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| Phase   | 12                                             |
| Created | 2026-03-24                                     |

---

## Overview

This document summarizes the system specification files that must be updated upon completion of this task. Updates are organized by the Step 1-A through Step 2 structure defined in `05-task-execution.md`.

---

## Step 1-A: Task Completion Records

### 1. ui-ux-navigation.md

**Path**: `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`

**Update content**:

- Add `executionConsole` row to the ViewType definition table:

| ViewType           | Owner                | Category | Notes                          |
| ------------------ | -------------------- | -------- | ------------------------------ |
| `executionConsole` | ExecutionConsoleView | main     | Guided execution primary route |

- Add `ExecutionConsoleLauncher` entry to the persistent launcher section (replacing `TerminalLauncher` reference)
- Add `executionConsole` to the navContract items table (with shortcut TBD)

### 2. arch-state-management-core.md

**Path**: `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`

**Update content**:

- Add `ExecutionConsoleView` to the surface ownership table:

| Surface              | State Owner          | State Category | Notes                                                   |
| -------------------- | -------------------- | -------------- | ------------------------------------------------------- |
| ExecutionConsoleView | AppStore.currentView | navigation     | Stub view; session/terminal state deferred to Task02/03 |

### 3. task-workflow.md

**Path**: `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

**Update content**:

- Add completion record for `TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001`
- Close related unassigned tasks:
  - `ut-viewtype-terminal-addition.md` -- resolved by `executionConsole` ViewType addition
  - `UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001.md` -- resolved by CTA wiring unification

### 4. LOGS.md (2 files -- P1/P25 compliance)

**File 1**: `.claude/skills/aiworkflow-requirements/LOGS.md`
**File 2**: `.claude/skills/task-specification-creator/LOGS.md`

**Update content** (both files):

- Add entry:
  ```
  | 2026-03-24 | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 | completed | ViewType executionConsole, openExecutionConsole(), CTA unification, agent substitute removal |
  ```

### 5. SKILL.md Change History (2 files)

**File 1**: `.claude/skills/aiworkflow-requirements/SKILL.md`
**File 2**: `.claude/skills/task-specification-creator/SKILL.md`

**Update content**: Add change history entry for this task.

---

## Step 1-B: Implementation Status Tables

### api-endpoints.md (if applicable)

Not applicable for this task. No IPC or API endpoint changes.

---

## Step 1-C: Related Task Tables

**Search command**: `grep -rn "TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION" .claude/skills/aiworkflow-requirements/references/`

Update any references found in related spec files.

---

## Step 1-D: topic-map.md Regeneration

**Command**: `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`

Required because:

- `ui-ux-navigation.md` gains a new ViewType row
- `arch-state-management-core.md` gains a new surface ownership row
- `task-workflow.md` gains a completion record

---

## Step 2: System Spec Updates (if applicable)

### New Interface / Architecture Change

This task introduces:

- A new `ViewType` value (`executionConsole`)
- A new shared action (`openExecutionConsole()`)
- A new stub component (`ExecutionConsoleView`)

These are additive changes that do not alter existing architecture. The existing `ViewType` pattern and `renderView()` dispatch mechanism remain unchanged.

No architecture-level spec (`architecture-overview.md`, `architecture-monorepo.md`) update is required.

---

## Step 3: IPC Contract Verification

Not applicable for this task. No IPC handler modifications.

---

## Mirror Sync Reminder

After updating `.claude/skills/`, sync to `.agents/skills/`:

```bash
rsync -avz --checksum ./.claude/skills/ ./.agents/skills/
diff -qr ./.claude/skills/ ./.agents/skills/
```

---

## Checklist

- [x] `ui-ux-navigation.md` -- ViewType table updated (2026-03-24)
- [x] `arch-state-management-core.md` -- surface ownership updated (2026-03-24)
- [x] `task-workflow-completed.md` -- completion record (2026-03-24)
- [x] `task-workflow-backlog.md` -- unassigned task close + 2 new entries (2026-03-24)
- [x] `LOGS.md` x2 (aiworkflow-requirements + task-specification-creator) (2026-03-24)
- [x] `SKILL.md` x2 change history (9.02.14 / v10.09.10) (2026-03-24)
- [x] `topic-map.md` regenerated (2026-03-24)
- [x] Mirror sync executed (2026-03-24)
