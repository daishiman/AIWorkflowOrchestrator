# Phase 6: テスト拡充結果 — TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001

## 実測

- `grep -c "@repo/shared/src/ipc/channels" apps/desktop/out/preload/index.js` → `0`
- `grep -c "skill:list" apps/desktop/out/preload/index.js` → `2`
- `grep -c "@repo/shared" apps/desktop/out/preload/index.js` → `0`
- `pnpm exec vitest run src/preload/__tests__/skill-api.getDetail-update.test.ts src/main/services/runtime/__tests__/governance-bundle.test.ts` → `2 files / 37 tests PASS`
