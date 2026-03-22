# Architecture & Dependencies Review

## Meta

| Item        | Value                                         |
| ----------- | --------------------------------------------- |
| Review Date | 2026-03-20                                    |
| Reviewer    | Architecture Review Agent                     |
| Target      | ai-chat-llm-integration-fix (4 Tasks)         |
| Methodology | System/Process/Vertical/Causal Loop/Strategic |

---

## 1. Layer Dependency Verification

### 1-1. Dependency Direction Matrix

| Task | Renderer                                                              | Preload (IPC)                                | Main Process                 | Direction Compliance |
| ---- | --------------------------------------------------------------------- | -------------------------------------------- | ---------------------------- | -------------------- |
| 01   | chatSlice.ts, ChatView                                                | callLLMAPI -> electronAPI.ai.chat (existing) | ai:chat handler (existing)   | PASS                 |
| 02   | LLMGuidanceBanner, ChatView, WorkspaceChatPanel                       | none (new)                                   | none                         | PASS                 |
| 03   | store/index.ts (partialize), llmSlice.ts                              | llm:set-selected-config (existing)           | llmConfigProvider (existing) | PASS                 |
| 04   | useWorkspaceChatController, StreamingErrorDisplay, WorkspaceChatPanel | llm:stream-error (existing listener)         | handlers/llm.ts (existing)   | PASS                 |

**Verdict**: 4 task all maintain `Renderer -> Preload -> Main` unidirectional dependency. No reverse imports detected.

### 1-2. Detailed Layer Analysis per Task

**Task 01 (ChatView Error Silent Failure)**

- `callLLMAPI` (chatSlice internal function) calls `window.electronAPI.ai.chat` -- existing IPC path, no new channel
- Error flows: Main -> Preload (response) -> chatSlice (state) -> ChatView (UI) -- correct direction
- No Main Process changes required

**Task 02 (LLM Selector Inline Guidance)**

- Pure Renderer-layer change (UI components + Zustand selectors)
- No IPC communication added
- `setCurrentView("settings")` uses existing `navigationSlice` action

**Task 03 (LLM Config Persistence)**

- `partialize` extends existing persist config in Renderer
- `syncSelectedConfigToMain()` already exists in `llmSlice.ts:62-78` -- calls `electronAPI.llm.setSelectedConfig`
- Validation logic stays in Renderer (before sync to Main)

**Task 04 (Workspace Chat Stream Error)**

- `onStreamError` is an existing IPC listener (`LLM_STREAM_ERROR` channel)
- All new code (StreamingErrorDisplay, mapLLMErrorToStreamingError) is Renderer-only
- No Main Process changes

### 1-3. Security Verification

| Check                                    | Result                                                 |
| ---------------------------------------- | ------------------------------------------------------ |
| API keys excluded from persist           | PASS -- Task 03 design explicitly excludes credentials |
| No new IPC channels added                | PASS -- All 4 tasks use existing channels              |
| Error messages don't leak internal paths | PASS -- Task 01 uses error codes, not raw messages     |
| contextIsolation maintained              | PASS -- No changes to preload/index.ts                 |

---

## 2. Inter-Task Dependency Verification

### 2-1. Dependency Graph

```
Task 01 (P0)  ----\
Task 02 (P0)  ---- > Independent (parallel OK)
Task 03 (P1)  ----/
                    \
Task 04 (P1)  -------> References Task 01's error pattern
```

### 2-2. Independence Analysis

| Pair    | Shared Files?                                                 | Shared State?                                            | Verdict        |
| ------- | ------------------------------------------------------------- | -------------------------------------------------------- | -------------- |
| 01 - 02 | ChatView/index.tsx (both modify)                              | No shared new state                                      | MINOR CONFLICT |
| 01 - 03 | None                                                          | chatSlice vs llmSlice (independent slices)               | INDEPENDENT    |
| 01 - 04 | None directly                                                 | chatError (01) vs streamingError (04) -- different types | INDEPENDENT    |
| 02 - 03 | store/index.ts (02 may add selectors, 03 modifies partialize) | No overlap                                               | INDEPENDENT    |
| 02 - 04 | WorkspaceChatPanel.tsx (both modify)                          | No shared new state                                      | MINOR CONFLICT |
| 03 - 04 | None                                                          | None                                                     | INDEPENDENT    |

### 2-3. File Conflict Analysis

**FINDING-01: ChatView/index.tsx conflict (Task 01 + Task 02)**

Both tasks modify `ChatView/index.tsx`:

- Task 01: Adds error banner above chat input
- Task 02: Adds LLMGuidanceBanner below header

These are spatially separate (different positions in the component tree), but parallel PRs will create merge conflicts. **Recommendation**: Execute Task 01 first, then Task 02 to avoid merge conflicts. Alternatively, coordinate both modifications in a single branch.

**FINDING-02: WorkspaceChatPanel.tsx conflict (Task 02 + Task 04)**

Both tasks modify `WorkspaceChatPanel.tsx`:

- Task 02: Enhances existing GuidanceBlock with action button
- Task 04: Adds StreamingErrorDisplay component

Again spatially separate, but will conflict in parallel branches. **Recommendation**: Same branch or sequential execution.

### 2-4. Task 04 -> Task 01 Dependency

index.md states Task 04 "references Task 01's error display pattern." This is a **design reference dependency**, not a code dependency:

- Task 01 introduces `ERROR_MESSAGES` Record pattern + error banner UI
- Task 04 creates `mapLLMErrorToStreamingError` independently with its own `StreamingErrorState` type

The dependency is appropriately documented. Task 04 can begin design (Phase 1-3) in parallel, but Phase 5 (implementation) should follow Task 01's completion to ensure consistent UX patterns.

---

## 3. Ripple Effect Analysis

### 3-1. Task 01 Ripple

| Change                  | Direct Impact          | Indirect Impact                |
| ----------------------- | ---------------------- | ------------------------------ |
| chatSlice + `chatError` | ChatView error banner  | None (new state, no consumers) |
| callLLMAPI error field  | sendMessage error path | None (internal function)       |
| useChatError selector   | store/index.ts export  | Any future chatError consumer  |

**Ripple radius**: Small. Changes are additive (new state + new selector). No existing behavior modified except `sendMessage`'s error path (previously silent -> now sets state).

### 3-2. Task 02 Ripple

| Change                  | Direct Impact                | Indirect Impact |
| ----------------------- | ---------------------------- | --------------- |
| LLMGuidanceBanner (new) | ChatView layout              | None            |
| GuidanceBlock action    | WorkspaceChatPanel rendering | None            |

**Ripple radius**: Minimal. New component + existing component prop addition.

### 3-3. Task 03 Ripple

| Change                     | Direct Impact                    | Indirect Impact                   |
| -------------------------- | -------------------------------- | --------------------------------- |
| partialize extension       | localStorage persistence         | Hydration behavior on app restart |
| persist version migration  | Existing users' stored data      | **CRITICAL**: See FINDING-03      |
| validateAndSync on startup | llmSlice fetchProviders callback | Main Process config state         |

**Ripple radius**: Medium. Persist changes affect all existing users' localStorage. Migration must be bulletproof.

### 3-4. Task 04 Ripple

| Change                      | Direct Impact                   | Indirect Impact              |
| --------------------------- | ------------------------------- | ---------------------------- |
| StreamingErrorState type    | useWorkspaceChatController      | WorkspaceChatPanel rendering |
| mapLLMErrorToStreamingError | onStreamError handler           | None (new mapping logic)     |
| retryLastMessage            | WorkspaceChatPanel retry button | Re-triggers sendMessage      |
| StreamingErrorDisplay (new) | WorkspaceChatPanel layout       | None                         |

**Ripple radius**: Small-Medium. Changes are mostly additive. The `retryLastMessage` function re-triggers the send flow, which could amplify any existing bugs in the send path.

---

## 4. Causal Loop Detection

### 4-1. Potential Positive Feedback Loop

```
Task 03 (persist) -> config available on restart
                  -> fewer "model not selected" errors
                  -> Task 02 guidance banner shown less often
                  -> Task 01 error banner triggered less often
```

**Analysis**: This is a **desired negative feedback loop** (stabilizing). Task 03's persistence reduces the need for Task 02's guidance. This is correct behavior -- guidance is a fallback for missing config, and persistence prevents config loss.

**Impact**: Task 02's LLMGuidanceBanner will primarily be shown to:

1. First-time users (no persisted config yet)
2. Users whose persisted provider became unavailable (API key deleted)
3. Users after Task 03's validation clears invalid config

This does NOT make Task 02 unnecessary. Task 02 remains valuable as a safety net.

### 4-2. Potential Conflict Loop

```
Task 01 (chatError) -> user sees error -> navigates to settings (manual)
Task 02 (guidance)  -> user sees guidance -> navigates to settings (button)
```

Both tasks drive users to Settings but via different triggers. No conflict -- they address different scenarios (error state vs. unconfigured state).

### 4-3. Retry Amplification Loop (Task 04)

```
User sends message -> stream error -> user clicks retry -> same error -> retry again
```

**Mitigation needed**: Task 04's `retryLastMessage` should include rate limiting or retry count cap. The current Phase 2 design does NOT specify retry limits. See FINDING-04.

---

## 5. Design Consistency Assessment

### 5-1. Per-Task Assessment

| Task | Criterion                     | Status   | Notes                                                       |
| ---- | ----------------------------- | -------- | ----------------------------------------------------------- |
| 01   | chatSlice interface extension | PASS     | `chatError: string \| null` is simple and appropriate       |
| 01   | P31 compliance                | PASS     | Individual selectors `useChatError` / `useClearChatError`   |
| 01   | Error code design             | PASS     | String codes with Record<string, string> mapping            |
| 02   | Component design              | PASS     | Single-responsibility LLMGuidanceBanner                     |
| 02   | P31 compliance                | PASS     | Individual selectors for selectedModelId/selectedProviderId |
| 02   | Navigation pattern            | **WARN** | `useSetCurrentView` does NOT exist -- see FINDING-05        |
| 03   | Persist extension             | PASS     | Only ID fields persisted, no credentials                    |
| 03   | Migration strategy            | **WARN** | Version number assumption wrong -- see FINDING-03           |
| 03   | P62 compliance                | PASS     | Explicit null-clear, no DEFAULT_CONFIG fallback             |
| 04   | StreamingErrorState type      | PASS     | Well-structured with action discriminant                    |
| 04   | Error mapping completeness    | PASS     | Covers all codes from handlers/llm.ts                       |
| 04   | Retry design                  | **WARN** | No retry limit specified -- see FINDING-04                  |

### 5-2. Cross-Task Consistency

| Criterion                         | Status   | Notes                                                                                 |
| --------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| Error display pattern consistency | **WARN** | Task 01 uses `string` code, Task 04 uses `StreamingErrorState` object. See FINDING-06 |
| Zustand selector pattern          | PASS     | All tasks use individual selectors (P31 compliant)                                    |
| Apple HIG color compliance        | PASS     | Both tasks reference systemRed for errors                                             |
| IPC contract stability            | PASS     | No new IPC channels, no handler modifications                                         |

---

## 6. Findings & Recommendations

### FINDING-01: ChatView/WorkspaceChatPanel File Conflicts

**Severity**: MINOR
**Description**: Tasks 01+02 both modify ChatView, Tasks 02+04 both modify WorkspaceChatPanel.
**Recommendation**: Execute in order 01 -> 02 -> 03 -> 04, or combine 01+02 into a single branch and 03+04 into another.

### FINDING-02: [Resolved] -- Covered by FINDING-01.

### FINDING-03: Persist Version Migration Assumptions

**Severity**: MAJOR
**Description**: Task 03 Phase 2 assumes the persist store is "v1" and plans migration to "v2". However, the **actual `store/index.ts` has NO `version` or `migrate` option**. The current persist configuration uses Zustand's default version (0) with no migration function.

This means:

1. The current store name is `"knowledge-studio-store"` (not `"aiworkflow-store"` as stated in Task 03 design)
2. There is no `version` field -- Zustand defaults to version `0`
3. Adding `version: 2` and `migrate` is correct in principle, but the design should reference `version: 0` as the baseline, not `version: 1`
4. The store name in the design code (`"aiworkflow-store"`) does not match the actual store name (`"knowledge-studio-store"`)

**Recommendation**:

- Fix store name reference: `"knowledge-studio-store"` (not `"aiworkflow-store"`)
- Fix version baseline: migrate from `0` to `1` (not from `1` to `2`)
- The migrate function should handle `version === 0` (or `undefined`)

```typescript
// Corrected migration
{
  name: "knowledge-studio-store",
  version: 1,  // First versioned migration
  migrate: (persistedState: unknown, version: number) => {
    if (version === 0) {
      return {
        ...(persistedState as object),
        selectedProviderId: null,
        selectedModelId: null,
      };
    }
    return persistedState;
  },
}
```

### FINDING-04: Retry Without Rate Limiting (Task 04)

**Severity**: MINOR
**Description**: Task 04's `retryLastMessage` has no retry count limit or cooldown. Users can rapidly retry, potentially overwhelming the API and exacerbating RATE_LIMIT errors.

**Recommendation**: Add a retry counter (max 3 attempts) or implement exponential backoff with visual feedback (countdown timer). This can be addressed as a Phase 5 implementation detail or as a MINOR finding in Phase 10.

### FINDING-05: useSetCurrentView Selector Missing

**Severity**: MINOR
**Description**: Task 02 Phase 2 references `useSetCurrentView()` but this selector does **NOT exist** in `store/index.ts`. The `setCurrentView` action exists in `navigationSlice.ts` but has no corresponding individual selector hook.

**Recommendation**: Task 02 Phase 5 must add the selector:

```typescript
// store/index.ts に追加
export const useSetCurrentView = () =>
  useAppStore((state) => state.setCurrentView);
```

This is a trivial addition but must be documented in Phase 2 design for completeness. Also, Task 04 needs the same selector for its Settings navigation -- coordinate between tasks.

### FINDING-06: Error Type Inconsistency Between Task 01 and Task 04

**Severity**: MINOR (design debt, not a bug)
**Description**:

- Task 01 uses `chatError: string | null` (error code string)
- Task 04 uses `streamingError: StreamingErrorState | null` (structured object with `code`, `message`, `retryable`, `action`)

Both represent "chat operation failed" states but with different structures. The chatSlice already has `streamingError: StreamingError` (code + message + retryable), which Task 04's `StreamingErrorState` extends with `action` and `hint`.

**Recommendation**: Consider unifying or at least documenting why two separate error representations exist:

- `chatError` (Task 01): For non-streaming `sendMessage` errors (simpler, transient)
- `streamingError` (existing + Task 04 extension): For streaming errors (richer, action-oriented)

This is acceptable as-is but should be documented in Phase 12 implementation guide.

### FINDING-07: fetchProviders Overwrites Persisted Selection

**Severity**: MAJOR
**Description**: In `llmSlice.ts:119-151`, `fetchProviders` **unconditionally overwrites** `selectedProviderId` and `selectedModelId` with the first provider's defaults:

```typescript
set({
  providers,
  selectedProviderId: firstProvider?.id || null, // Always overwrites!
  selectedModelId: defaultModel?.id || null, // Always overwrites!
  llmIsLoading: false,
});
```

Task 03 adds persistence via `partialize`, but `fetchProviders` is called on app startup and will **immediately overwrite the persisted values** with `firstProvider.id`. The `validateAndSyncPersistedConfig` function designed in Task 03 Phase 2 is never integrated into the actual `fetchProviders` flow.

**Impact**: Task 03's persistence will be completely ineffective without modifying `fetchProviders` to check for existing persisted values before overwriting.

**Recommendation**: `fetchProviders` must be modified to:

1. Check if `selectedProviderId`/`selectedModelId` are already set (from persist hydration)
2. If set, validate them against the fetched providers list (`validateAndSyncPersistedConfig`)
3. Only fall back to first provider if persisted values are null or invalid

```typescript
fetchProviders: async () => {
  set({ llmIsLoading: true, llmError: null });
  try {
    const providers = await fetchProvidersFromIPC();
    const { selectedProviderId, selectedModelId } = get();

    // Validate persisted config against available providers
    const validated = validateAndSyncPersistedConfig(
      selectedProviderId,
      selectedModelId,
      providers,
    );

    // Only use first provider default if no valid persisted config
    const finalProviderId = validated.providerId
      ?? providers[0]?.id ?? null;
    const finalModelId = validated.modelId
      ?? (providers[0] ? getDefaultModel(providers[0])?.id ?? null : null);

    set({
      providers,
      selectedProviderId: finalProviderId,
      selectedModelId: finalModelId,
      llmIsLoading: false,
    });

    if (finalProviderId && finalModelId) {
      void syncSelectedConfigToMain(finalProviderId, finalModelId);
    }
  } catch (error) { /* ... */ }
},
```

This is a **critical design gap** in Task 03 Phase 2 that must be addressed before Phase 4.

---

## Summary

### Overall Verdict: **MAJOR** (FINDING-03 + FINDING-07 require Phase 2 revision)

| Finding    | Severity | Action Required                                                      |
| ---------- | -------- | -------------------------------------------------------------------- |
| FINDING-01 | MINOR    | Execute tasks sequentially or combine branches                       |
| FINDING-03 | MAJOR    | Fix store name + version baseline in Task 03 Phase 2                 |
| FINDING-04 | MINOR    | Add retry limit (can be Phase 5 detail)                              |
| FINDING-05 | MINOR    | Add `useSetCurrentView` selector (Task 02 or shared)                 |
| FINDING-06 | MINOR    | Document error type duality in Phase 12                              |
| FINDING-07 | MAJOR    | Redesign Task 03 to integrate with fetchProviders overwrite behavior |

### Recommended Actions

1. **Task 03 Phase 2 must be revised** to address FINDING-03 (store name/version) and FINDING-07 (fetchProviders overwrite). Without these fixes, persistence will not work.
2. **Task 02 Phase 2 should note** the need to add `useSetCurrentView` selector (FINDING-05).
3. **Execution order should be**: 01 -> 02 -> 03 -> 04 (sequential, not parallel) due to file conflicts (FINDING-01).
4. **Task 04 Phase 5** should include retry rate limiting (FINDING-04).
