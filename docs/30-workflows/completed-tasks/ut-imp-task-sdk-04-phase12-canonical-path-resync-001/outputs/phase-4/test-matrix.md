# Test Matrix

| id       | command or check                                                                                                                                                                                   | expected                  |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| TC-04-01 | `rg -n "skill-creator-agent-sdk-lane/step-03-par-task-04-user-interaction-bridge-and-phase-ui" docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/outputs` | 0 hit                     |
| TC-04-02 | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui`                       | PASS                      |
| TC-04-03 | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui --json`          | errors 0                  |
| TC-04-04 | close-out 本文の `spec_created` 維持説明                                                                                                                                                           | current fact と矛盾しない |
| TC-04-05 | close-out 本文の `UT-SC-02-006` と `TASK-SDK-04-U1..U3` 説明                                                                                                                                       | current fact と矛盾しない |
