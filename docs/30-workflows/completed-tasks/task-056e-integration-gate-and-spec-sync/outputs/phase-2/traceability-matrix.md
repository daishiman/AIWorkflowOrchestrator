# Phase 2 トレーサビリティマトリクス

| 要件ID | 設計反映                                       | 上流正本                   | aiworkflow 正本                                                        | 検証方法                  |
| ------ | ---------------------------------------------- | -------------------------- | ---------------------------------------------------------------------- | ------------------------- |
| FR-01  | `traceability-matrix.md`                       | A/B/C/D index              | `architecture-overview.md`                                             | 正本パス照合              |
| FR-02  | `integration-gate-design.md`                   | A/B/C/D                    | `arch-state-management.md`, `api-ipc-system.md`, `ui-ux-navigation.md` | 5軸確認                   |
| FR-03  | `integration-gate-design.md`, `review-gate.md` | B/C/D                      | `error-handling.md`, `quality-requirements.md`                         | PASS/MINOR/MAJOR 条件確認 |
| FR-04  | `spec-sync-matrix.md`, `spec-sync-targets.md`  | E entry spec               | `task-workflow.md`, `lessons-learned.md`                               | 3区分確認                 |
| FR-05  | `dependency-handoff-plan.md`                   | D, parent 057/058a/058b    | `ui-ux-navigation.md`                                                  | downstream 3件確認        |
| FR-06  | `test-cases.md`                                | E Phase 3/10 spec          | `review-gate-criteria.md`                                              | 戻り先確認                |
| FR-07  | `regression-matrix.md`                         | current path + parent path | `lessons-learned.md`                                                   | path drift ケース確認     |
| FR-08  | `spec-update-summary.md`                       | E Phase 12 spec            | `task-workflow.md`, `spec-update-workflow.md`                          | Step 1-A/1-B/1-C/2 確認   |
| FR-09  | `artifacts.json`                               | workflow index             | -                                                                      | outputs 実在確認          |
