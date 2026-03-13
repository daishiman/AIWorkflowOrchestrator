# Phase 1 4観点チェック行列

| Bucket  | 対象                                          | pass 条件                                           | fail 条件                                             | guidance                                                  |
| ------- | --------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------- |
| native  | `esbuild` の解決と transform 実行             | module 解決と transform が成功する                  | module 未解決、native binary mismatch、transform 失敗 | `pnpm install --force`、必要なら親 guard task を参照      |
| build   | `apps/desktop/out/renderer` と asset 出力     | `out/renderer/index.html` と `assets/` が存在する   | build 未実行、asset 欠落                              | `pnpm --filter @repo/desktop build`                       |
| harness | `phase11-light-theme-contrast-guard.html`     | harness HTML が build output に存在する             | build input 登録漏れ、harness 未出力                  | `electron.vite.config.ts` の `rollupOptions.input` を確認 |
| baseUrl | `PHASE11_CAPTURE_BASE_URL` の readiness probe | 既存 server 到達または loopback auto serve 後に到達 | URL 不達、auto serve 不可、auto serve 後も不達        | loopback は fallback、remote は URL 修正                  |

## blocked ルール

- `native` fail 時は `build` / `harness` / `baseUrl` を `blocked` にする。
- `build` fail 時は `harness` / `baseUrl` を `blocked` にする。
- `harness` fail 時は `baseUrl` を `blocked` にする。
- `baseUrl` は最後に評価し、到達手段と cleanup 要否を result に残す。
