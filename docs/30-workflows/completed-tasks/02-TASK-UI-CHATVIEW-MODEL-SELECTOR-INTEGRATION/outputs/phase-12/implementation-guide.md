# Implementation Guide: ChatView InlineModelSelector Integration

## Part 1: Concept (for beginners)

### What is this feature?

Imagine you're at a restaurant and the menu is at the kitchen (settings screen), far away from your table (chat screen). Every time you want to change your order, you have to get up and walk to the kitchen.

This feature puts a small menu right on your table. Now you can change your AI model directly from the chat screen without leaving the conversation. It's like having a mini-menu at your fingertips.

### How it works

1. **Before**: To change the AI model, you had to go to Settings
2. **After**: A compact selector appears in the chat header, right next to the title
3. **Safety**: While the AI is responding (streaming), the selector is locked so you can't accidentally change models mid-conversation

### Key concepts

- **InlineModelSelector**: A dropdown that lets you pick which AI to talk to
- **LLMGuidanceBanner**: A warning banner that shows when no model is selected. It automatically hides when you pick a model
- **Store**: A shared memory that all components read from. When the selector updates the Store, the banner automatically knows to hide

## Part 2: Developer Details

### Changed Files

| File                                                                               | Change Type | Lines Changed                          |
| ---------------------------------------------------------------------------------- | ----------- | -------------------------------------- |
| `apps/desktop/src/renderer/views/ChatView/index.tsx`                               | Modified    | +3 (import + JSX + header restructure) |
| `apps/desktop/src/renderer/views/ChatView/ChatView.test.tsx`                       | Modified    | +7 (mock additions)                    |
| `apps/desktop/src/renderer/views/ChatView/__tests__/ChatView.guidance.test.tsx`    | Modified    | +7 (mock additions)                    |
| `apps/desktop/src/renderer/views/ChatView/__tests__/ChatView.integration.test.tsx` | New         | ~250 lines (8 test cases)              |

### Implementation Details

#### 1. ChatView/index.tsx

```tsx
// Added import
import { InlineModelSelector } from "../../components/llm";

// Header restructured: left group (title + selector) / right group (buttons)
<header className="flex items-center justify-between p-4 border-b border-white/10">
  <div className="flex items-center gap-3">
    <div>
      <h1>...</h1>
      <p>...</p>
    </div>
    <InlineModelSelector compact disabled={isSending} />
  </div>
  <div className="flex items-center gap-2">{/* existing buttons */}</div>
</header>;
```

**Design decisions**:

- `compact` mode: Shows only model name (not provider/model), fits header height
- `disabled={isSending}`: Uses existing Store state, no new Store connections (P31 compliant)
- No `className` override: Inherits InlineModelSelector's built-in styling

#### 2. LLMGuidanceBanner (unchanged)

No modifications needed. The banner reads `useSelectedModelId()` and `useSelectedProviderId()` from Store. When InlineModelSelector updates these values, the banner automatically hides via React reactivity.

#### 3. Test Mock Updates

Existing ChatView tests needed additional mock exports for Store selectors used by InlineModelSelector internally:

- `useLLMProviders`, `useLLMHealthStatus`, `useFetchProviders`
- `useSelectProvider`, `useSelectModel`, `useCheckLLMHealth`

### Architecture Compliance

| Rule                          | Status    | Details                                                                                |
| ----------------------------- | --------- | -------------------------------------------------------------------------------------- |
| P31 (Zustand infinite loop)   | Compliant | No new Store connections in ChatView. `isSending` uses existing `useAppStore` selector |
| P39 (happy-dom fireEvent)     | Compliant | All tests use `fireEvent`, not `userEvent`                                             |
| P48 (useShallow)              | N/A       | No derived selectors added                                                             |
| P62 (DEFAULT_CONFIG fallback) | Compliant | No implicit fallback. Unselected state shows placeholder                               |
| Atomic Design                 | Compliant | InlineModelSelector (molecule) in ChatView (page)                                      |

### Test Matrix

| Test ID | Description                                        | AC   |
| ------- | -------------------------------------------------- | ---- |
| TC-I-1  | InlineModelSelector renders in header              | AC-1 |
| TC-I-2  | Chat send works after model selection              | AC-3 |
| TC-I-3  | LLMGuidanceBanner shows when no model selected     | AC-2 |
| TC-I-4  | LLMGuidanceBanner hides after model selection      | AC-2 |
| TC-I-5  | InlineModelSelector disabled during streaming      | AC-1 |
| TC-E-1  | Empty provider list shows placeholder              | Edge |
| TC-E-2  | Disabled selector prevents dropdown opening        | Edge |
| TC-E-3  | Selector and banner coexist when no model selected | Edge |
