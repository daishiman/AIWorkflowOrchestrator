# Implementation Guide - guided-execution-shell-foundation

## Meta

| Item    | Value                                          |
| ------- | ---------------------------------------------- |
| Task ID | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| Phase   | 12                                             |
| Created | 2026-03-24                                     |

---

## Part 1: Concept Guide (for Beginners)

### What is the "Execution Console"?

Think of it like the **nurse's office at school**. No matter what classroom you're in, no matter what subject you're studying, if something comes up you always know: "Go to the nurse's office." The nurse's office is always in the same place, always has the same sign on the door, and always works the same way when you walk in.

The **Execution Console** is the nurse's office of our app. Before this change, different parts of the app had different signs pointing in different directions:

- One sign said "Open Terminal" (in Japanese: "terminaru wo hiraku")
- Another sign pointed to a completely different room called "Agent"
- Some signs were broken and didn't point anywhere at all

This was confusing. A new user would click a button expecting to go somewhere useful, and end up somewhere unexpected, or nowhere at all.

### The Three Names

We decided on three clear signs, each for a different situation:

| Sign Name (Japanese)     | When You See It               | Analogy                                                                   |
| ------------------------ | ----------------------------- | ------------------------------------------------------------------------- |
| **Execution Console**    | Main entrance, always visible | The front door of the nurse's office                                      |
| **Continue in Terminal** | When AI hands off to you      | A note saying "Please come to the nurse's office to pick up your results" |
| **Advanced View**        | Raw commands, low-level stuff | The medicine cabinet inside the nurse's office (only for staff)           |

### What is a "Route"?

A route is like an **address**. Every room in the app has an address. Before this change, the Execution Console had no address --- it literally did not exist as a destination. If you typed the address, nothing happened.

Now we added the address `executionConsole` so the app knows where to go.

### What is a "CTA"?

CTA stands for **Call To Action** --- it's a button or link that invites you to do something. Think of it like a **doorbell**. Before this change, some doorbells were wired to the wrong room (Agent instead of the Execution Console), and some doorbells were completely disconnected.

Now every doorbell rings the same bell: `openExecutionConsole()`.

### Summary

| Before                                   | After                                       |
| ---------------------------------------- | ------------------------------------------- |
| No address for the Execution Console     | Address `executionConsole` registered       |
| Different doorbells ring different rooms | All doorbells ring `openExecutionConsole()` |
| Some doorbells are broken                | All doorbells are connected                 |
| Signs say "Terminal" or "Agent"          | Signs say the correct destination name      |

---

## Part 2: Developer Implementation Details

### 1. ViewType Registration

**File**: `apps/desktop/src/renderer/store/types.ts`

Add `executionConsole` to the `ViewType` union:

```typescript
export type ViewType =
  // ... existing types
  "executionConsole"; // Guided execution primary route
```

**Key points**:

- This is the **source of truth** for route existence.
- All downstream references (`renderView`, `navContract`, store selectors) depend on this type.
- After adding, run `pnpm typecheck` to find all exhaustive switch/case statements that need updating.

### 2. renderView Wiring

**File**: `apps/desktop/src/renderer/App.tsx`

Add a case to `renderView()`:

```typescript
const ExecutionConsoleView = React.lazy(
  () => import("./views/ExecutionConsoleView"),
);

// Inside renderView():
case "executionConsole":
  return <ExecutionConsoleView />;
```

**Placement rule**: Insert immediately after `case "agent":` for logical grouping.

### 3. Stub View

**File (new)**: `apps/desktop/src/renderer/views/ExecutionConsoleView/index.tsx`

```typescript
import React from "react";

export const ExecutionConsoleView: React.FC = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-secondary">
        Execution Console -- internal components implemented in Task02/03
      </p>
    </div>
  );
};

export default ExecutionConsoleView;
```

This is intentionally minimal. Task02 (Session Dock) and Task03 (Advanced Console) will populate the interior.

### 4. Shared Action

**File (new)**: `apps/desktop/src/renderer/actions/executionConsole.ts`

```typescript
import { useAppStore } from "@/renderer/store";

/**
 * Open the Execution Console from any surface.
 * This is the single source of truth for view transition.
 */
export function openExecutionConsole(): void {
  useAppStore.getState().setCurrentView("executionConsole");
}
```

**Calling convention**:

- All surfaces MUST call `openExecutionConsole()` instead of calling `setCurrentView("executionConsole")` directly.
- This enables future analytics, session init, or pre-flight checks in a single place.

### 5. CTA Rewiring (per surface)

| Surface             | File                            | Before                       | After                                       |
| ------------------- | ------------------------------- | ---------------------------- | ------------------------------------------- |
| ChatPanel           | `ChatPanel.tsx`                 | `setCurrentView("agent")` x2 | `openExecutionConsole()`                    |
| LLMGuidanceBanner   | `LLMGuidanceBanner.tsx`         | `open-terminal` unconnected  | `openExecutionConsole()` via dispatcher     |
| WorkspaceChatPanel  | `WorkspaceChatPanel.tsx`        | `open-terminal` unconnected  | `openExecutionConsole()` via dispatcher     |
| HandoffBlock        | `HandoffBlock.tsx`              | `onOpenTerminal` -> agent    | prop rename + `openExecutionConsole()`      |
| TerminalHandoffCard | `TerminalHandoffCard/index.tsx` | terminal labels              | label update + `openExecutionConsole()`     |
| App Shell           | `TerminalLauncher.tsx`          | `launchMainlineTerminal()`   | `openExecutionConsole()` + component rename |

### 6. Label Changes

| Location                        | Before                | After                      |
| ------------------------------- | --------------------- | -------------------------- |
| `HandoffBlock.tsx` L21          | `terminaru wo hiraku` | `tanmatsu de tsudukeru`    |
| `TerminalHandoffCard` L130      | `terminal wo hiraku`  | `tanmatsu de tsudukeru`    |
| `modelSelectionGuidance.ts` L38 | `terminaru wo hiraku` | `jikkou console wo hiraku` |

### 7. Agent Substitute Removal

All instances of `setCurrentView("agent")` that serve as a terminal-fallback must be replaced with `openExecutionConsole()`. After implementation, verify with:

```bash
grep -rn 'setCurrentView("agent")' apps/desktop/src/renderer/ | grep -i terminal
```

Expected result: 0 matches.

### 8. Existing Test Modifications

When renaming components/functions, the following test files may need updates:

- Tests referencing `handleTerminalSwitch` or `handleOpenTerminal` in ChatPanel tests
- Tests referencing `TerminalLauncher` component name
- Tests asserting `setCurrentView("agent")` as expected terminal behavior
- Label snapshot tests containing old terminal-related strings

Run the full test suite after each file modification:

```bash
cd apps/desktop && pnpm vitest run
```

### 9. Dispatcher Extension

For `LLMGuidanceBanner` and `WorkspaceChatPanel`, extend the guidance action dispatcher:

```typescript
const resolveAction = createGuidanceActionDispatcher({
  openSettings: onNavigateToSettings,
  openExecutionConsole: () => openExecutionConsole(),
});
```

The dispatcher key `openTerminal` is replaced by `openExecutionConsole`. The action type constant changes from `"open-terminal"` to `"open-execution-console"`.
