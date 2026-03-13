# Phase 7 検証コマンド記録

## 実行ログ

1. `pnpm --filter @repo/desktop exec vitest run scripts/phase11-current-build-preflight-core.test.ts scripts/phase11-current-build-preflight.test.ts`
   - 結果: PASS
   - 詳細: `Test Files 2 passed`, `Tests 11 passed`

2. `pnpm --filter @repo/desktop build`
   - 結果: PASS
   - 詳細: `out/renderer/phase11-light-theme-contrast-guard.html` を生成

3. `node apps/desktop/scripts/phase11-current-build-preflight.mjs --json --write docs/30-workflows/completed-tasks/ut-imp-phase11-current-build-preflight-bundle/outputs/phase-11/preflight-report.json`
   - 結果: PASS
   - 詳細: `native/build/harness/baseUrl` の 4 bucket pass、`autoServed=true`

4. `pnpm --filter @repo/desktop screenshot:light-theme-contrast-guard`
   - 結果: PASS
   - 詳細: `TC-11-01`〜`TC-11-05` 生成

5. failure simulation
   - baseUrl: exit 40
   - harness: exit 30
   - build: exit 20

## cleanup

- `lsof -nP -iTCP:4173 -sTCP:LISTEN`
  - 結果: LISTEN プロセスなし
