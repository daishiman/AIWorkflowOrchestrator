# Phase 5: 実装

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 5                                          |
| 機能名 | TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001 |
| 作成日 | 2026-03-31                                 |

## 実装内容

- `apps/desktop/electron.vite.config.ts`
  - preload plugins を `externalizeDepsPlugin({ exclude: ["@repo/shared"] })` に変更
  - `@repo/shared/src/ipc/channels` の `resolve.alias` を追加
- `apps/desktop/vitest.config.ts`
  - `@repo/shared/src/ipc/channels` の alias を追加
- `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts`
  - shared channel import を relative path から alias へ復帰

## 目的

build/test alias parity を current facts に揃え、shared IPC channel の正本参照を bundle と test の両方で安定化する。

## 成果物

| 成果物       | パス                                        |
| ------------ | ------------------------------------------- |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` |
