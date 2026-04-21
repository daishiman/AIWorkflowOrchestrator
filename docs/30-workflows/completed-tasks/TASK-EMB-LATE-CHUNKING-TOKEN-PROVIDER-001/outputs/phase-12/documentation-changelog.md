# Documentation Changelog

## current wave 更新ファイル

- `packages/shared/src/services/chunking/chunking-service.ts`
- `packages/shared/src/services/chunking/index.ts`
- `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts`
- `docs/30-workflows/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001/index.md`
- `docs/30-workflows/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001/phase-12-documentation.md`
- `docs/30-workflows/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001/artifacts.json`
- `docs/30-workflows/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001/outputs/artifacts.json`
- `docs/30-workflows/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001/outputs/phase-5/changed-files.md`
- `docs/30-workflows/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001/outputs/phase-5/implementation-notes.md`
- `docs/30-workflows/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001/outputs/phase-7/coverage-report.md`
- `docs/30-workflows/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001/outputs/phase-9/quality-gate-report.md`
- `docs/30-workflows/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001/outputs/phase-10/final-review-result.md`
- `docs/30-workflows/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001/outputs/phase-11/manual-test-result.md`
- `docs/30-workflows/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001/outputs/phase-11/manual-test-checklist.md`
- `docs/30-workflows/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001/outputs/phase-11/discovered-issues.md`
- `docs/30-workflows/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001/outputs/phase-12/*.md`

## baseline からの差分

- main path 未接続を解消し、helper 偏重の状態を是正
- Phase 4 artifact 名の drift を `test-scenarios.md` に統一
- Phase 11 / 12 の placeholder を実測ベースへ置換

## 検証結果

| コマンド                               | 結果 |
| -------------------------------------- | ---- |
| `pnpm --filter @repo/shared typecheck` | PASS |
| 対象 `vitest run`                      | PASS |
| `pnpm --filter @repo/shared build`     | PASS |

## future wording 監査

- `outputs/phase-12/*.md` に対して future wording 残存 0 件を目標
