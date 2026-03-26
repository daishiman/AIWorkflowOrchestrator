# Phase 4 Command Plan

## 実行順

1. `node --test .claude/skills/task-specification-creator/scripts/__tests__/generate-index.test.mjs`
2. `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation --regenerate`
3. `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation --strict`
4. `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation`
5. `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation`
6. `pnpm --filter @repo/shared typecheck`
7. `pnpm --filter @repo/desktop typecheck`
8. `pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/ManifestLoader.test.ts`
9. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-01-phase12-compliance-sync-001.md`

## FAIL 時の戻り先

| 失敗箇所                           | 戻り先             |
| ---------------------------------- | ------------------ |
| generator test / index drift       | Phase 5            |
| `verify-all-specs` wording warning | Phase 8            |
| `validate-phase-output` warning    | Phase 5 / Phase 11 |
| guide validator fail               | Phase 12           |
| typecheck fail                     | Phase 5 / Phase 8  |
| ManifestLoader test fail           | Phase 5 / Phase 6  |
| unassigned audit fail              | Phase 5 / Phase 12 |
