# Unit Tests Summary

## Created Test Files

| Component                  | Location                                                                                             | Cases |
| -------------------------- | ---------------------------------------------------------------------------------------------------- | ----- |
| SplitLayout                | `apps/desktop/src/renderer/components/organisms/SplitLayout/__tests__/index.test.tsx`                | 12    |
| HTMLPreviewEnvironment     | `apps/desktop/src/renderer/components/organisms/HTMLPreviewEnvironment/__tests__/index.test.tsx`     | 30+   |
| ExecutionEnvironment       | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/__tests__/index.test.tsx`       | 10    |
| MarkdownPreviewEnvironment | `apps/desktop/src/renderer/components/organisms/MarkdownPreviewEnvironment/__tests__/index.test.tsx` | 15    |
| EnvironmentSelector        | `apps/desktop/src/renderer/components/molecules/EnvironmentSelector/__tests__/index.test.tsx`        | 11    |
| sanitizeHTML               | `apps/desktop/src/renderer/utils/__tests__/sanitize.test.ts`                                         | 35+   |

## Test Status

All tests are in **Red** state (failing) as per TDD Phase 4 requirements.

Components are implemented as placeholder functions that throw errors or return null.

## Run Commands

```bash
# Run all unit tests
pnpm --filter @repo/desktop test

# Run specific component tests
pnpm --filter @repo/desktop test -- SplitLayout
pnpm --filter @repo/desktop test -- HTMLPreviewEnvironment
pnpm --filter @repo/desktop test -- sanitize
```
