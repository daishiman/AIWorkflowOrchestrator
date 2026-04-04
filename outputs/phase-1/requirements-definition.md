# Phase 1: 要件定義 — TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001

## 問題

`@repo/shared/src/ipc/channels` の解決が build と test で分断されていた。
preload build では shared subpath が external 化され、Vitest では shared IPC alias が未設定だった。

## 受け入れ条件

- build 後の preload bundle に `@repo/shared/src/ipc/channels` の `require()` が残らない
- build 後の preload bundle に `skill:list` が残る
- `pnpm --filter @repo/desktop typecheck` が PASS
- targeted vitest が PASS
- `governance-bundle.test.ts` の relative import workaround が除去される
