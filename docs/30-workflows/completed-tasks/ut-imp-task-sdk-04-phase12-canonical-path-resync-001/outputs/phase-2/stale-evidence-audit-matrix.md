# Stale Evidence Audit Matrix

| file                                             | drift type           | old fact                              | current fact                                                               | action                       |
| ------------------------------------------------ | -------------------- | ------------------------------------- | -------------------------------------------------------------------------- | ---------------------------- |
| `outputs/phase-12/system-spec-update-summary.md` | canonical path drift | legacy lane path                      | `completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui` | current canonical set を更新 |
| `outputs/phase-12/system-spec-update-summary.md` | judgement drift      | docs-only 前提の弱い説明              | current code wave を踏まえた `spec_created` 維持根拠                       | Step 判定と根拠を更新        |
| `outputs/phase-12/unassigned-task-detection.md`  | backlog drift        | `UT-SC-02-006` 吸収済みの補足が弱い   | `UT-SC-02-006` 吸収済み、`TASK-SDK-04-U1..U3` formalize 済み               | current fact へ更新          |
| `outputs/phase-13/local-check-result.md`         | validator path drift | validator が旧 path を指す            | validator が current path を指す                                           | command を更新               |
| `outputs/verification-report.md`                 | verification drift   | current code と evidence の関係が散在 | close-out 対象と environment blocker を分離                                | note を更新                  |
