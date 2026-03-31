# Phase 4: テスト仕様書 — TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001

| テストID | 観点                                                       | 修正後期待値            |
| -------- | ---------------------------------------------------------- | ----------------------- |
| T-01     | preload bundle に shared channel の `require()` が残らない | count=0                 |
| T-02     | preload bundle に `skill:list` が残る                      | count=2                 |
| T-03     | `pnpm --filter @repo/desktop build`                        | exit 0                  |
| T-04     | targeted vitest                                            | 2 files / 37 tests PASS |
