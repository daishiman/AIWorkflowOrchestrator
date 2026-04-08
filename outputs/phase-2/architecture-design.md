# Phase 2: 設計 — TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001

## 変更点

- `apps/desktop/electron.vite.config.ts`
  - preload plugins を `externalizeDepsPlugin({ exclude: ["@repo/shared"] })` に変更
  - `@repo/shared/src/ipc/channels` の alias を追加
- `apps/desktop/vitest.config.ts`
  - 同 alias を追加
- `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts`
  - shared channel import を alias に戻す

## 副作用評価

- main / renderer: 影響なし
- shared 他サブパス: 影響なし
- 型安全性: 既存 tsconfig path を継続利用
