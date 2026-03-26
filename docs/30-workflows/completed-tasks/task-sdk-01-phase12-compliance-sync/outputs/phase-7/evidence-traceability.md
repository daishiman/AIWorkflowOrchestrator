# Phase 7 Evidence Traceability

| 証跡                      | 出力先                                                                                | 根拠                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| generator fix test result | `outputs/phase-9/quality-checklist.md`, `outputs/phase-12/documentation-changelog.md` | `node --test ...generate-index.test.mjs`                                                      |
| parent validator pass     | `outputs/phase-9/quality-checklist.md`, `outputs/phase-10/final-review-result.md`     | `verify-all-specs.js`, `validate-phase-output.js`, `validate-phase12-implementation-guide.js` |
| runtime compile gate      | `outputs/phase-9/quality-checklist.md`, `outputs/phase-12/documentation-changelog.md` | `pnpm --filter @repo/shared typecheck`, `pnpm --filter @repo/desktop typecheck`               |
| ManifestLoader hardening  | `outputs/phase-9/quality-checklist.md`, `outputs/phase-12/implementation-guide.md`    | `ManifestLoader.ts`, `ManifestLoader.test.ts`                                                 |
| unassigned audit pass     | `outputs/phase-9/spec-sync-audit.md`, `outputs/phase-12/unassigned-task-detection.md` | `audit-unassigned-tasks --target-file`                                                        |
| manual walkthrough        | `outputs/phase-11/manual-test-result.md`                                              | 人手確認                                                                                      |
