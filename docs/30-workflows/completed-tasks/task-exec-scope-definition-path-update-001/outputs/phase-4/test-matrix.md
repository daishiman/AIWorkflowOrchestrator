# Test Matrix

| case | command / review                                                                                                                                                            | expected                            |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | -------------------- |
| T-01 | `ls -la packages/shared/src/types/execution-capability.ts`                                                                                                                  | file exists                         |
| T-02 | `rg -n "execution-capability.ts" docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-1/scope-definition.md`    | row exists                          |
| T-03 | `rg -n "auth-mode.ts                                                                                                                                                        | RuntimePolicyResolver.ts" <target>` | existing rows remain |
| T-04 | `git diff -- <target>`                                                                                                                                                      | insertion-only diff                 |
| T-05 | `node .agents/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-exec-scope-definition-path-update-001 --json` | workflow spec passes                |
