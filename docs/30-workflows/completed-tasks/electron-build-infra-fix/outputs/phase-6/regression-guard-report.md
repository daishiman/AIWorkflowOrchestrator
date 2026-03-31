# Phase 6: Regression Guard Report

| 守る条件                                                | ガード方法                           |
| ------------------------------------------------------- | ------------------------------------ |
| `@repo/shared` が CJS でも読める                        | `require` export 条件テスト          |
| preload が runtime `require("@repo/shared")` に戻らない | preload config 静的検証              |
| Electron ABI mismatch で起動前に詰まらない              | setup / rebuild / afterPack 静的検証 |
| worktree で lint/type drift しない                      | `pnpm lint`, `pnpm typecheck`        |
