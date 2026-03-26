# Phase 7 Coverage Matrix

| AC   | file                                                                                          | command                                                                         | 結果          |
| ---- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------- |
| AC-1 | parent `index.md` / `phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` | `generate-index.js`, `verify-all-specs.js`                                      | coverage 済み |
| AC-2 | parent `implementation-guide.md`, `packages/shared`, `apps/desktop`                           | `validate-phase12-implementation-guide.js`, typecheck, `ManifestLoader.test.ts` | coverage 済み |
| AC-3 | summary / changelog / unassigned detection / compliance check                                 | `validate-phase-output.js` + manual review                                      | coverage 済み |
| AC-4 | backlog / completed ledger / lessons                                                          | diff review + target-file audit                                                 | coverage 済み |
| AC-5 | Phase 13 blocked                                                                              | parent / follow-up index, artifacts                                             | coverage 済み |
