# Phase 1 Spec Extraction Map

| source                                                                                  | current fact                           | 実装での扱い          |
| --------------------------------------------------------------------------------------- | -------------------------------------- | --------------------- |
| Issue #1664                                                                             | 2026-03-27 時点で `CLOSED`             | blocker 化しない      |
| `task-exec-scope-definition-path-update-001.md`                                         | main source task                       | 要件抽出に使用        |
| `task-ut-exec-01-scope-definition-execution-capability-path.md`                         | duplicate source                       | 差分確認のみ          |
| `docs/30-workflows/ai-runtime-execution-responsibility-realignment/scope-definition.md` | worktree に存在しない                  | stale path として除外 |
| Task01 `outputs/phase-1/scope-definition.md`                                            | D. Implementation Anchor が現行 target | 実更新対象            |
| `packages/shared/src/types/execution-capability.ts`                                     | 実在する                               | existence check 対象  |
