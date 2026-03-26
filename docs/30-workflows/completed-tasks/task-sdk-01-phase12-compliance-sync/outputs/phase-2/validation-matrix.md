# Validation Matrix

| command                                                                                                                                                | expected                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| `verify-all-specs --workflow docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation --strict`                              | error 0                            |
| `validate-phase-output.js docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation`                                          | error 0                            |
| `validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation`               | PASS                               |
| `pnpm --filter @repo/shared typecheck`                                                                                                                 | PASS                               |
| `pnpm --filter @repo/desktop typecheck`                                                                                                                | PASS                               |
| `pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/ManifestLoader.test.ts`                                                   | PASS または環境 blocker を分離記録 |
| `audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-01-phase12-compliance-sync-001.md` | currentViolations 0                |
