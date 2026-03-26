# Phase 4 Test Matrix

| ID       | 観点                        | コマンド / 確認対象                                                             | 期待結果                                                      |
| -------- | --------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| TC-04-01 | workflow validator          | `verify-all-specs.js --workflow parent --strict`                                | error 0 / warning 0                                           |
| TC-04-02 | phase output validator      | `validate-phase-output.js parent`                                               | warning 0                                                     |
| TC-04-03 | guide validator             | `validate-phase12-implementation-guide.js --workflow parent`                    | 10/10                                                         |
| TC-04-04 | unassigned audit            | `audit-unassigned-tasks.js --json --target-file ...`                            | `currentViolations.total = 0`                                 |
| TC-04-05 | parent index parity         | `index.md` / `artifacts.json`                                                   | Phase 12=`completed`, Phase 13=`blocked`                      |
| TC-04-06 | loader reference integrity  | `ManifestLoader.test.ts`                                                        | `resource.phaseIds` と `phase.resourceIds` の drift を reject |
| TC-04-07 | loader cache hardening      | `ManifestLoader.test.ts`                                                        | manifest 内容変更時は同一 `mtime` でも再読込                  |
| TC-04-08 | desktop/shared compile gate | `pnpm --filter @repo/shared typecheck`, `pnpm --filter @repo/desktop typecheck` | PASS                                                          |
