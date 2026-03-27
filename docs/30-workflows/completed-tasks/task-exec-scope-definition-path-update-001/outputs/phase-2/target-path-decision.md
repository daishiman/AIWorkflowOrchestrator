# Target Path Decision

| candidate                                                                                                                                | status | 判断理由                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------- |
| `docs/30-workflows/ai-runtime-execution-responsibility-realignment/scope-definition.md`                                                  | reject | worktree に存在しない stale path                        |
| `docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/outputs/phase-1/scope-definition.md`                | reject | D. Implementation Anchor 節ではなく Task02 scope 文書   |
| `docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-1/scope-definition.md` | accept | D. Implementation Anchor に追記漏れが残る actual target |

## decision

Task01 `outputs/phase-1/scope-definition.md` を唯一の patch target とする。
