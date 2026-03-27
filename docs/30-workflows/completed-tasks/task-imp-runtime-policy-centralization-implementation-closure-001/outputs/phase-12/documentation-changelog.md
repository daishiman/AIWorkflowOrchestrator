# Documentation Changelog

## current wave の変更

### code

- `apps/desktop/src/main/ipc/index.ts`
- `apps/desktop/src/main/ipc/agentHandlers.ts`
- `apps/desktop/src/main/ipc/skillHandlers.ts`

### tests

- `apps/desktop/src/main/ipc/__tests__/agentHandlers.runtime.test.ts`
- `apps/desktop/src/main/ipc/__tests__/skillHandlers.runtime.test.ts`

### workflow / ledger

- `docs/30-workflows/completed-tasks/task-imp-runtime-policy-centralization-implementation-closure-001/index.md`
- `docs/30-workflows/completed-tasks/task-imp-runtime-policy-centralization-implementation-closure-001/artifacts.json`
- `docs/30-workflows/completed-tasks/task-imp-runtime-policy-centralization-implementation-closure-001/outputs/artifacts.json`
- `docs/30-workflows/completed-tasks/task-imp-runtime-policy-centralization-implementation-closure-001/phase-12-documentation.md`
- `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`
- `.agents/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md`
- `.agents/skills/aiworkflow-requirements/references/task-workflow-backlog.md`
- `.agents/skills/aiworkflow-requirements/references/task-workflow-completed.md`

## validator / verification

| コマンド                                                                                                                                                 | 結果 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `pnpm install --force`                                                                                                                                   | PASS |
| `pnpm --filter @repo/shared build`                                                                                                                       | PASS |
| `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/agentHandlers.runtime.test.ts src/main/ipc/__tests__/skillHandlers.runtime.test.ts`  | PASS |
| `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/agentHandlers.test.ts`                                                               | PASS |
| `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.execute.test.ts src/main/ipc/__tests__/skillHandlers.contract.test.ts` | PASS |
| `pnpm --filter @repo/desktop typecheck`                                                                                                                  | PASS |

## phase 12 verification

- planned wording scan: PASS
- `diff -qr .claude/skills/aiworkflow-requirements/references .agents/skills/aiworkflow-requirements/references`

## baseline と current の分離

- baseline: 既存 `PermissionStore` stderr、legacy cleanup 未着手項目、chat-edit / slide lane の resolver 残存
- current: Agent / Skill consumer の central policy 移行、runtime tests 更新、ledger sync

## no-op

- `packages/shared/src/types/*` の新規型追加なし
- `apps/desktop/src/preload/*` の channel / API 追加なし
- `LOGS.md`, `SKILL.md`, `topic-map.md` の更新なし
