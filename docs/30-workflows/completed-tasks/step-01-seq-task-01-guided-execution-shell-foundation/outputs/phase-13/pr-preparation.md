# PR Preparation Memo - guided-execution-shell-foundation

## Meta

| Item    | Value                                             |
| ------- | ------------------------------------------------- |
| Task ID | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001    |
| Phase   | 13                                                |
| Created | 2026-03-24                                        |
| Status  | **BLOCKED** -- awaiting explicit user instruction |

---

## Blocked Reason

PR creation is blocked until the user explicitly instructs to proceed. This task produces design artifacts and Phase 12 documentation. The actual code changes (ViewType addition, CTA rewiring, label updates) will be implemented in a subsequent execution session.

**Do not**:

- Create a branch
- Run `git commit`
- Run `git push`
- Run `gh pr create`

---

## PR Title (draft, max 70 chars)

```
feat(shell): unify execution console route, CTA, and front labels
```

---

## Summary (1-3 bullet points)

- Add `executionConsole` to `ViewType` and wire `renderView()` with a stub `ExecutionConsoleView`, establishing the primary route for the guided execution surface
- Introduce `openExecutionConsole()` as the single shared action, replacing `setCurrentView("agent")` fallbacks and unconnected `open-terminal` CTAs across App Shell, Chat, Workspace, and Skill Creator surfaces
- Unify front labels: primary=`jikkou console`, handoff=`tanmatsu de tsudukeru`, advanced=`koudo na hyouji`; remove `terminal wo hiraku` from user-facing strings

---

## Test Plan

- [ ] `ViewType` union includes `executionConsole` and TypeScript compiles without error
- [ ] `renderView("executionConsole")` renders `ExecutionConsoleView` stub
- [ ] `openExecutionConsole()` sets `currentView` to `executionConsole` in store
- [ ] ChatPanel CTA calls `openExecutionConsole()` (not `setCurrentView("agent")`)
- [ ] LLMGuidanceBanner secondary CTA dispatches `openExecutionConsole()`
- [ ] WorkspaceChatPanel secondary CTA dispatches `openExecutionConsole()`
- [ ] HandoffBlock CTA calls `openExecutionConsole()` with label `tanmatsu de tsudukeru`
- [ ] TerminalHandoffCard CTA calls `openExecutionConsole()` with updated label
- [ ] `grep -rn "terminaru wo hiraku|terminal wo hiraku" apps/desktop/src/renderer/` returns 0 matches
- [ ] `grep -rn 'setCurrentView("agent")' apps/desktop/src/renderer/ | grep -i terminal` returns 0 matches
- [ ] All existing tests pass (`cd apps/desktop && pnpm vitest run`)
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes

---

## Reviewer Focus Areas

### 1. Naming

| Check          | What to verify                                                      |
| -------------- | ------------------------------------------------------------------- |
| Primary label  | `jikkou console` appears in nav, headers, and primary CTAs          |
| Handoff label  | `tanmatsu de tsudukeru` appears only in handoff-state contexts      |
| Advanced label | `koudo na hyouji` reserved for secondary/tertiary CTAs              |
| Removal        | No `terminal wo hiraku` or `terminaru wo hiraku` in renderer source |

### 2. Route

| Check        | What to verify                                 |
| ------------ | ---------------------------------------------- |
| ViewType     | `executionConsole` exists in `types.ts` union  |
| renderView   | `case "executionConsole"` in `App.tsx`         |
| Lazy import  | `ExecutionConsoleView` loaded via `React.lazy` |
| Stub content | View renders placeholder text, not blank       |

### 3. CTA

| Check                | What to verify                                                          |
| -------------------- | ----------------------------------------------------------------------- |
| Unified dispatcher   | All 7+ CTAs call `openExecutionConsole()` (not direct `setCurrentView`) |
| Dispatcher extension | `createGuidanceActionDispatcher` includes `openExecutionConsole` key    |
| No orphan handlers   | `handleTerminalSwitch` and `handleOpenTerminal` removed or renamed      |

### 4. Fallback

| Check            | What to verify                                             |
| ---------------- | ---------------------------------------------------------- |
| Agent substitute | Zero `setCurrentView("agent")` used as terminal fallback   |
| No-op CTA        | Zero CTAs that do nothing on click                         |
| Silent fallback  | Zero `console.warn` as sole error handling for CTA failure |

---

## Downstream Dependencies

| Downstream Task                      | Dependency on this PR                               |
| ------------------------------------ | --------------------------------------------------- |
| Task02 (session dock / transcript)   | Requires `executionConsole` route to exist          |
| Task03 (advanced console / approval) | Requires `executionConsole` route + label hierarchy |

These tasks cannot proceed until this PR is merged.

---

## Related Issues to Close

| Issue                                                 | Resolution                                       |
| ----------------------------------------------------- | ------------------------------------------------ |
| `ut-viewtype-terminal-addition.md`                    | Resolved by `executionConsole` ViewType addition |
| `UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001.md` | Resolved by CTA wiring unification               |

If GitHub Issues exist for these unassigned tasks, close them with `gh issue close <number>` upon PR merge (P56 compliance).
