# Phase 4 failure scenario matrix

| Bucket  | 入力条件                                                   | 期待 status | 期待 guidance / detail                        |
| ------- | ---------------------------------------------------------- | ----------- | --------------------------------------------- |
| native  | `esbuild` 解決不可または native binary mismatch            | `fail`      | `pnpm install --force` と親 guard task 参照   |
| build   | `apps/desktop/out/renderer` / `index.html` / `assets` 欠落 | `fail`      | `pnpm --filter @repo/desktop build`           |
| harness | `phase11-light-theme-contrast-guard.html` 欠落             | `fail`      | `electron.vite.config.ts` の build input 確認 |
| baseUrl | readiness URL 不達かつ `--no-auto-serve`                   | `fail`      | auto serve 再試行、または reachable URL 指定  |

## blocked 期待値

| 上流 fail | blocked になる bucket   |
| --------- | ----------------------- |
| native    | build, harness, baseUrl |
| build     | harness, baseUrl        |
| harness   | baseUrl                 |
