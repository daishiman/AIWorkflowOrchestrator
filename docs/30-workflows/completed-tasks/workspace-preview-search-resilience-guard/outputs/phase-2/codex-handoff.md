# Phase 2 Output: Codex Handoff / Execution Record

## 1. 実行条件

- Phase 3 が PASS であること
- ユーザーが Phase 1-12 の順序実行を明示していること
- commit / PR 禁止を維持すること

## 2. 対象ファイル

| 区分           | パス                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| hook / utility | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useQuickFileSearch.ts`                          |
| preview UI     | `apps/desktop/src/renderer/views/WorkspaceView/components/PreviewPanel.tsx`                          |
| search test    | `apps/desktop/src/renderer/views/WorkspaceView/hooks/__tests__/useQuickFileSearch.test.ts`           |
| preview test   | `apps/desktop/src/renderer/views/WorkspaceView/__tests__/PreviewPanel.test.tsx`                      |
| crash test     | `apps/desktop/src/renderer/views/WorkspaceView/__tests__/PreviewErrorBoundary.test.tsx`              |
| docs sync      | `docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/outputs/phase-12/` |

## 3. guardrail

- 新規 IPC は追加しない。
- timeout / retry は renderer local に閉じる。
- parse failure は retryable として扱わない。
- Phase 12 は workflow / outputs / system spec / related UT を同一ターンで更新する。

## 4. 実際に使った validation command

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/views/WorkspaceView/hooks/__tests__/useQuickFileSearch.test.ts \
  src/renderer/views/WorkspaceView/__tests__/PreviewPanel.test.tsx \
  src/renderer/views/WorkspaceView/__tests__/PreviewErrorBoundary.test.tsx

pnpm --filter @repo/desktop typecheck

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json --diff-from HEAD \
  --target-file docs/30-workflows/completed-tasks/task-imp-workspace-preview-search-resilience-guard-001.md
```
